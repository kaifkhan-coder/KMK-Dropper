import express from 'express';
import path from 'path';
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
    const targetId = req.params.id === 'latest' ? latestPackageId : req.params.id;
    if (!targetId || !packagesMap.has(targetId)) {
      if (latestPackageId && packagesMap.has(latestPackageId)) {
        const fallbackPkg = packagesMap.get(latestPackageId)!;
        return res.json({
          id: fallbackPkg.id,
          fileName: fallbackPkg.fileName,
          isSingleFile: fallbackPkg.isSingleFile,
          mimeType: fallbackPkg.mimeType,
          isBypassActive: fallbackPkg.isBypassActive,
          fileCount: fallbackPkg.files.length,
          size: fallbackPkg.fileBuffer.length,
          files: fallbackPkg.files,
          createdAt: fallbackPkg.createdAt,
          isLatestFallback: true
        });
      }
      return res.status(404).json({ error: 'Package not found or expired' });
    }

    const pkg = packagesMap.get(targetId)!;
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
    const targetId = id === 'latest' || !id ? latestPackageId : id;
    const pkg = targetId ? packagesMap.get(targetId) : null;

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
    const targetId = req.params.id === 'latest' || !req.params.id ? latestPackageId : req.params.id;
    const pkg = targetId ? packagesMap.get(targetId) : (latestPackageId ? packagesMap.get(latestPackageId) : null);

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
