import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

interface StoredPackage {
  id: string;
  fileName: string;
  mimeType: string;
  isSingleFile: boolean;
  isBypassActive: boolean;
  files: Array<{
    id: string;
    name: string;
    size: number;
    isText: boolean;
    content?: string;
  }>;
  fileBuffer: Buffer;
  createdAt: number;
}

const packagesMap = new Map<string, StoredPackage>();
let latestPackageId: string | null = null;
const CACHE_FILE_PATH = '/tmp/qr_packages_store.json';

function saveStoreToDisk() {
  try {
    const list: any[] = [];
    for (const [, val] of packagesMap.entries()) {
      list.push({
        id: val.id,
        fileName: val.fileName,
        mimeType: val.mimeType,
        isSingleFile: val.isSingleFile,
        isBypassActive: val.isBypassActive,
        files: val.files,
        fileBase64: val.fileBuffer.toString('base64'),
        createdAt: val.createdAt
      });
    }
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify({ latestPackageId, packages: list }));
  } catch (e) {
    console.warn('[API] Could not save store to disk:', e);
  }
}

function loadStoreFromDisk() {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const data = JSON.parse(fs.readFileSync(CACHE_FILE_PATH, 'utf-8'));
      if (Array.isArray(data.packages)) {
        for (const item of data.packages) {
          packagesMap.set(item.id, {
            id: item.id,
            fileName: item.fileName,
            mimeType: item.mimeType,
            isSingleFile: item.isSingleFile,
            isBypassActive: item.isBypassActive,
            files: item.files || [],
            fileBuffer: Buffer.from(item.fileBase64 || '', 'base64'),
            createdAt: item.createdAt || Date.now()
          });
        }
      }
      if (data.latestPackageId && packagesMap.has(data.latestPackageId)) {
        latestPackageId = data.latestPackageId;
      } else if (packagesMap.size > 0) {
        latestPackageId = Array.from(packagesMap.keys())[packagesMap.size - 1];
      }
      console.log(`[API] Restored ${packagesMap.size} package(s) from disk cache. Latest: ${latestPackageId}`);
    }
  } catch (e) {
    console.warn('[API] Could not load store from disk:', e);
  }
}

// Initial restore on server boot
loadStoreFromDisk();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON payload parser for base64 packages up to 50MB
  app.use(express.json({ limit: '50mb' }));

  // API Routes FIRST

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      storedPackages: packagesMap.size,
      latestPackageId,
      timestamp: Date.now()
    });
  });

  // Store/Publish an active package or single file
  app.post('/api/package', (req, res) => {
    try {
      const { id, fileName, mimeType, isSingleFile, isBypassActive, files, fileBase64, zipBase64 } = req.body;
      const base64Data = fileBase64 || zipBase64;
      if (!id || !fileName || !base64Data) {
        return res.status(400).json({ error: 'Missing package id, fileName, or data' });
      }

      const fileBuffer = Buffer.from(base64Data, 'base64');
      const singleFileMode = Boolean(isSingleFile || (Array.isArray(files) && files.length === 1));
      
      const newPackage: StoredPackage = {
        id,
        fileName,
        mimeType: mimeType || (singleFileMode ? 'application/octet-stream' : 'application/zip'),
        isSingleFile: singleFileMode,
        isBypassActive: Boolean(isBypassActive),
        files: Array.isArray(files) ? files : [],
        fileBuffer,
        createdAt: Date.now()
      };

      packagesMap.set(id, newPackage);
      latestPackageId = id;
      saveStoreToDisk();

      // Keep map size reasonable (max 20 packages)
      if (packagesMap.size > 20) {
        const oldestKey = packagesMap.keys().next().value;
        if (oldestKey) packagesMap.delete(oldestKey);
      }

      console.log(`[API] Stored ${singleFileMode ? 'single file' : 'ZIP package'}: ${id} (${fileName}, ${fileBuffer.length} bytes)`);

      res.json({
        success: true,
        id,
        fileName,
        isSingleFile: singleFileMode,
        mimeType: newPackage.mimeType,
        size: fileBuffer.length,
        fileCount: newPackage.files.length,
        downloadUrl: `/api/download/${id}`,
        mobileUrl: `/?mobile=1&pkg=${id}`
      });
    } catch (err: any) {
      console.error('[API] Error saving package:', err);
      res.status(500).json({ error: 'Failed to process package: ' + err.message });
    }
  });

  // Get package metadata (for mobile receiver UI)
  app.get('/api/package/:id', (req, res) => {
    let targetId = req.params.id;
    let pkg: StoredPackage | undefined = undefined;

    if (targetId && targetId !== 'latest' && packagesMap.has(targetId)) {
      pkg = packagesMap.get(targetId);
    } else if (latestPackageId && packagesMap.has(latestPackageId)) {
      pkg = packagesMap.get(latestPackageId);
    } else if (packagesMap.size > 0) {
      const allPkgs = Array.from(packagesMap.values());
      pkg = allPkgs[allPkgs.length - 1];
    }

    if (!pkg) {
      return res.status(404).json({ error: 'Package not found or expired' });
    }

    res.json({
      id: pkg.id,
      fileName: pkg.fileName,
      isSingleFile: pkg.isSingleFile,
      mimeType: pkg.mimeType,
      isBypassActive: pkg.isBypassActive,
      fileCount: pkg.files.length,
      size: pkg.fileBuffer.length,
      files: pkg.files,
      createdAt: pkg.createdAt
    });
  });

  // Download a specific file by fileId
  app.get('/api/download/:id/:fileId', (req, res) => {
    const { id, fileId } = req.params;
    let targetId = id === 'latest' || !id ? latestPackageId : id;
    let pkg = targetId && packagesMap.has(targetId) ? packagesMap.get(targetId) : (latestPackageId ? packagesMap.get(latestPackageId) : null);
    if (!pkg && packagesMap.size > 0) {
      const allPkgs = Array.from(packagesMap.values());
      pkg = allPkgs[allPkgs.length - 1];
    }

    if (!pkg) {
      return res.status(404).send('Package not found.');
    }

    const targetFile = pkg.files.find(f => f.id === fileId || f.name === fileId);
    if (!targetFile) {
      return res.status(404).send('File not found in package.');
    }

    if (targetFile.isText && targetFile.content !== undefined) {
      let content = targetFile.content;
      const banner = "// BuildWithKMKaif\n";
      if (!pkg.isBypassActive && !content.startsWith("// BuildWithKMKaif")) {
        content = banner + content;
      }
      const buf = Buffer.from(content, 'utf-8');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(targetFile.name)}"`);
      res.setHeader('Content-Length', buf.length);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.send(buf);
    }

    // If single file matches this target
    if (pkg.isSingleFile) {
      res.setHeader('Content-Type', pkg.mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(targetFile.name)}"`);
      res.setHeader('Content-Length', pkg.fileBuffer.length);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.send(pkg.fileBuffer);
    }

    return res.status(404).send('Direct binary extraction requires single-file staging or ZIP package.');
  });

  // Download endpoint (Serves original file if single file, or ZIP if multi-file)
  const handleDownload = (req: express.Request, res: express.Response) => {
    let targetId = req.params.id === 'latest' || !req.params.id ? latestPackageId : req.params.id;
    let pkg = targetId && packagesMap.has(targetId) ? packagesMap.get(targetId) : (latestPackageId ? packagesMap.get(latestPackageId) : null);
    if (!pkg && packagesMap.size > 0) {
      const allPkgs = Array.from(packagesMap.values());
      pkg = allPkgs[allPkgs.length - 1];
    }

    if (!pkg) {
      return res.status(404).send('No active file or package available for download. Please stage files on desktop.');
    }

    console.log(`[API] Serving download for: ${pkg.id} (${pkg.fileName}, isSingleFile=${pkg.isSingleFile})`);

    const contentType = pkg.mimeType || (pkg.isSingleFile ? 'application/octet-stream' : 'application/zip');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(pkg.fileName)}"`);
    res.setHeader('Content-Length', pkg.fileBuffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(pkg.fileBuffer);
  };

  app.get('/api/download/:id', handleDownload);
  app.get('/api/download', handleDownload);
  app.get('/download/package.zip', handleDownload);
  app.get('/download/:id', handleDownload);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
