import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import JSZip from 'jszip';

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

export interface ServerLogEntry {
  id: string;
  timestamp: string;
  time: number;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SECURE' | 'HTTP' | 'ZIP' | 'NET' | 'DIRECT';
  tag: string;
  message: string;
  ip?: string;
  device?: string;
  statusCode?: number;
  durationMs?: number;
}

const packagesMap = new Map<string, StoredPackage>();
let latestPackageId: string | null = null;
const CACHE_FILE_PATH = '/tmp/qr_packages_store.json';
const serverLogsBuffer: ServerLogEntry[] = [];
const MAX_SERVER_LOGS = 250;

// ANSI Terminal Colors for High-Visibility Server Logs
const ANSI = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m'
};

function addServerLog(
  level: ServerLogEntry['level'],
  tag: string,
  message: string,
  extra?: { ip?: string; device?: string; statusCode?: number; durationMs?: number }
) {
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;

  const entry: ServerLogEntry = {
    id: `srv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: timeStr,
    time: Date.now(),
    level,
    tag,
    message,
    ...extra
  };

  serverLogsBuffer.push(entry);
  if (serverLogsBuffer.length > MAX_SERVER_LOGS) {
    serverLogsBuffer.shift();
  }

  // Print formatted, colored log to stdout for real-time investigation
  let color = ANSI.cyan;
  if (level === 'ERROR') color = ANSI.red;
  else if (level === 'WARN') color = ANSI.yellow;
  else if (level === 'ZIP') color = ANSI.green;
  else if (level === 'SECURE') color = ANSI.magenta;

  const statusBadge = extra?.statusCode ? ` [Status: ${extra.statusCode}]` : '';
  const deviceBadge = extra?.device ? ` [Device: ${extra.device}]` : '';
  const latencyBadge = extra?.durationMs !== undefined ? ` (${extra.durationMs}ms)` : '';

  console.log(
    `${color}[${level}]${ANSI.reset} ${ANSI.dim}${timeStr}${ANSI.reset} ${ANSI.bright}[${tag}]${ANSI.reset}${statusBadge}${deviceBadge} ${message}${latencyBadge}`
  );
}

function detectClientDevice(ua: string = ''): { device: string; isMobile: boolean; os: string } {
  if (!ua) return { device: 'Unknown Client', isMobile: false, os: 'Unknown' };
  const lower = ua.toLowerCase();
  if (/iphone/i.test(ua)) return { device: 'Apple iPhone', isMobile: true, os: 'iOS' };
  if (/ipad/i.test(ua)) return { device: 'Apple iPad', isMobile: true, os: 'iPadOS' };
  if (/android/i.test(ua)) {
    const isTablet = /tablet/i.test(ua);
    return { device: isTablet ? 'Android Tablet' : 'Android Smartphone', isMobile: true, os: 'Android' };
  }
  if (/macintosh|mac os x/i.test(ua)) return { device: 'Mac Desktop', isMobile: false, os: 'macOS' };
  if (/windows/i.test(ua)) return { device: 'Windows PC', isMobile: false, os: 'Windows' };
  if (/linux/i.test(ua)) return { device: 'Linux System', isMobile: false, os: 'Linux' };
  if (/curl/i.test(ua)) return { device: 'cURL / CLI Tool', isMobile: false, os: 'CLI' };
  return { device: 'Web Client', isMobile: false, os: 'Other' };
}

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
      addServerLog(
        'INFO',
        'STORAGE',
        `Restored ${packagesMap.size} package(s) from disk cache. Latest: ${latestPackageId}`
      );
    }
  } catch (e) {
    console.warn('[API] Could not load store from disk:', e);
  }
}

// Ensure server always has an active package ready so mobile scans never 404
async function seedDefaultPackageIfEmpty() {
  if (packagesMap.size > 0) return;

  try {
    const zip = new JSZip();
    const watermark = '// [Created by Khan Mohammed Kaif] - 3D Animation & Local Secure Transfer Protocol\n';

    zip.file(
      'StudentRegistry.java',
      `${watermark}package com.university.cs101;\n\npublic class StudentRegistry {\n    // Initial Seed Demo\n}`
    );
    zip.file(
      'motion_rig.kaif',
      `${watermark}# Khan Mohammed Kaif 3D Rigging Script\nrig.target = "Bipedal_Hero_Mesh"\n`
    );
    zip.file(
      'hero_character.obj',
      `# Wavefront OBJ 3D Model\n# Architect: Khan Mohammed Kaif\nv 0.0 0.0 0.0\n`
    );

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    const seedId = 'pkg-seed-default';
    const seedPackage: StoredPackage = {
      id: seedId,
      fileName: 'Package_SECURE_WM_InitialSeed.zip',
      mimeType: 'application/zip',
      isSingleFile: false,
      isBypassActive: false,
      files: [
        { id: 'file-1', name: 'StudentRegistry.java', size: 1420, isText: true },
        { id: 'file-2', name: 'motion_rig.kaif', size: 680, isText: true },
        { id: 'file-3', name: 'hero_character.obj', size: 4520, isText: true }
      ],
      fileBuffer: zipBuffer,
      createdAt: Date.now()
    };

    packagesMap.set(seedId, seedPackage);
    latestPackageId = seedId;
    addServerLog('ZIP', 'SEED', `Generated pre-seeded default ZIP package (${zipBuffer.length} bytes, ID: ${seedId})`);
  } catch (err: any) {
    console.warn('[API] Could not seed default package:', err);
  }
}

// Initial restore on server boot
loadStoreFromDisk();
seedDefaultPackageIfEmpty();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // CORS Middleware for universal mobile and cross-network scanner access
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Range, Accept');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length, Content-Range, Accept-Ranges');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // Comprehensive Request Logging Middleware for QR Scanning & Download Diagnostics
  app.use((req, res, next) => {
    const startTime = Date.now();
    const ua = req.headers['user-agent'] || '';
    const deviceInfo = detectClientDevice(ua);
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip || 'unknown';
    const cleanIp = clientIp.split(',')[0].trim();

    // Only log API, download, or mobile receiver requests to prevent dev-server asset spam
    const isTargetRequest = 
      req.path.startsWith('/api') || 
      req.path.startsWith('/download') || 
      req.query.mobile === '1' || 
      req.query.pkg !== undefined ||
      deviceInfo.isMobile;

    if (isTargetRequest) {
      const rangeHdr = req.headers.range ? ` [Range: ${req.headers.range}]` : '';
      addServerLog(
        deviceInfo.isMobile ? 'HTTP' : 'INFO',
        'SCAN-REQ',
        `Incoming ${req.method} ${req.originalUrl} from ${cleanIp} (${deviceInfo.device})${rangeHdr}`,
        { ip: cleanIp, device: deviceInfo.device }
      );
    }

    res.on('finish', () => {
      if (isTargetRequest) {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;
        const isError = statusCode >= 400;
        const isDownloadRoute = req.path.includes('/download');
        const tag = isError ? (isDownloadRoute ? 'DOWNLOAD-ERR' : 'HTTP-ERR') : (isDownloadRoute ? 'COMPLETE' : 'HTTP');
        const logLevel: ServerLogEntry['level'] = isError ? (statusCode >= 500 ? 'ERROR' : 'WARN') : (isDownloadRoute ? 'ZIP' : 'HTTP');

        const message = `${req.method} ${req.originalUrl} -> ${statusCode} ${res.statusMessage || ''} (${duration}ms)`;

        addServerLog(logLevel, tag, message, {
          ip: cleanIp,
          device: deviceInfo.device,
          statusCode,
          durationMs: duration
        });
      }
    });

    next();
  });

  // JSON payload parser for base64 packages up to 50MB
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API Routes FIRST

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      storedPackages: packagesMap.size,
      packages: Array.from(packagesMap.keys()),
      latestPackageId,
      timestamp: Date.now()
    });
  });

  // Live Server Logs API for UI Console streaming
  app.get('/api/server-logs', (req, res) => {
    res.json({
      logs: serverLogsBuffer,
      latestPackageId,
      packageCount: packagesMap.size
    });
  });

  app.post('/api/server-logs/clear', (req, res) => {
    serverLogsBuffer.length = 0;
    addServerLog('INFO', 'CONSOLE', 'Server logs buffer cleared by client.');
    res.json({ success: true, message: 'Logs cleared.' });
  });

  // Store/Publish an active package or single file - resilient with auto-fallbacks
  app.post('/api/package', async (req, res) => {
    try {
      const body = req.body || {};
      const id = body.id || body.packageId || body.pkg || `pkg-${Date.now().toString(36)}`;
      let fileName = body.fileName || body.filename || body.name;
      const isSingleFile = Boolean(body.isSingleFile || (Array.isArray(body.files) && body.files.length === 1));
      let mimeType = body.mimeType || (isSingleFile ? 'text/plain;charset=utf-8' : 'application/zip');
      const isBypassActive = Boolean(body.isBypassActive);
      const files: Array<any> = Array.isArray(body.files) ? body.files : [];

      let fileBuffer: Buffer | null = null;
      const base64Data = body.fileBase64 || body.zipBase64 || body.data || body.base64;

      if (base64Data && typeof base64Data === 'string' && base64Data.trim().length > 0) {
        try {
          fileBuffer = Buffer.from(base64Data, 'base64');
        } catch {
          fileBuffer = null;
        }
      }

      // If client didn't supply base64, build package buffer on server using JSZip or file contents
      if (!fileBuffer || fileBuffer.length === 0) {
        if (files.length > 0) {
          if (isSingleFile && files[0].content !== undefined) {
            fileBuffer = Buffer.from(files[0].content, 'utf-8');
            if (!fileName) fileName = files[0].name || 'file.txt';
          } else {
            const zip = new JSZip();
            for (const f of files) {
              zip.file(f.name || 'file.txt', f.content || '');
            }
            fileBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
            if (!fileName) fileName = `Package_${isBypassActive ? 'CLEAN_BYPASS' : 'SECURE_WM'}_Transfer.zip`;
          }
        } else {
          // Pre-seed default package content
          const zip = new JSZip();
          zip.file('README.txt', '// [Created by Khan Mohammed Kaif] - 3D Animation & Local Secure Transfer Protocol\nMulti-File package initialized.\n');
          fileBuffer = await zip.generateAsync({ type: 'nodebuffer' });
          if (!fileName) fileName = 'package.zip';
        }
      }

      if (!fileName) {
        fileName = isSingleFile ? 'transfer_file.bin' : 'package.zip';
      }

      const newPackage: StoredPackage = {
        id,
        fileName,
        mimeType,
        isSingleFile,
        isBypassActive,
        files,
        fileBuffer,
        createdAt: Date.now()
      };

      packagesMap.set(id, newPackage);
      latestPackageId = id;
      saveStoreToDisk();

      // Keep map size reasonable (max 25 packages)
      if (packagesMap.size > 25) {
        const oldestKey = packagesMap.keys().next().value;
        if (oldestKey) packagesMap.delete(oldestKey);
      }

      addServerLog(
        'ZIP',
        'SYNC-SERVER',
        `Package registered: ${id} ("${fileName}", ${fileBuffer.length} bytes, Single=${isSingleFile}, Bypass=${isBypassActive})`
      );

      res.json({
        success: true,
        id,
        fileName,
        isSingleFile,
        mimeType: newPackage.mimeType,
        size: fileBuffer.length,
        fileCount: newPackage.files.length,
        downloadUrl: `/api/download/${id}`,
        mobileUrl: `/?mobile=1&pkg=${id}`
      });
    } catch (err: any) {
      addServerLog('ERROR', 'PACKAGE-POST', `Failed to process package: ${err.message}`);
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
      loadStoreFromDisk();
      if (targetId && targetId !== 'latest' && packagesMap.has(targetId)) {
        pkg = packagesMap.get(targetId);
      } else if (latestPackageId && packagesMap.has(latestPackageId)) {
        pkg = packagesMap.get(latestPackageId);
      } else if (packagesMap.size > 0) {
        const allPkgs = Array.from(packagesMap.values());
        pkg = allPkgs[allPkgs.length - 1];
      }
    }

    if (!pkg) {
      addServerLog('WARN', 'METADATA-404', `Package metadata lookup failed for ID: '${targetId}' (Available: ${packagesMap.size})`);
      return res.status(404).json({ error: 'Package not found or expired', available: Array.from(packagesMap.keys()) });
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

  // Download a specific file inside package by fileId
  app.get('/api/download/:id/:fileId', (req, res) => {
    const { id, fileId } = req.params;
    let targetId = id === 'latest' || !id ? latestPackageId : id;
    let pkg = targetId && packagesMap.has(targetId) ? packagesMap.get(targetId) : (latestPackageId ? packagesMap.get(latestPackageId) : null);
    if (!pkg && packagesMap.size > 0) {
      const allPkgs = Array.from(packagesMap.values());
      pkg = allPkgs[allPkgs.length - 1];
    }

    if (!pkg) {
      addServerLog('ERROR', 'FILE-404', `Package not found for file extraction. ID: '${targetId}', fileId: '${fileId}'`);
      return res.status(404).send('Package not found.');
    }

    const targetFile = pkg.files.find(f => f.id === fileId || f.name === fileId);
    if (!targetFile) {
      addServerLog('ERROR', 'FILE-404', `File '${fileId}' not found inside package '${pkg.id}'`);
      return res.status(404).send('File not found in package.');
    }

    const cleanName = targetFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');

    if (targetFile.isText && targetFile.content !== undefined) {
      let content = targetFile.content;
      const banner = "// [Created by Khan Mohammed Kaif] - 3D Animation & Local Secure Transfer Protocol\n";
      if (!pkg.isBypassActive && !content.startsWith("// [Created by Khan Mohammed Kaif]")) {
        content = banner + content;
      } else if (pkg.isBypassActive) {
        const banners = [
          "// [Created by Khan Mohammed Kaif] - 3D Animation & Local Secure Transfer Protocol\n",
          "// [Created by Khan Mohammed Kaif] - 3D Animation & Local Secure Transfer Protocol",
          "// BuildWithKMKaif\n",
          "// BuildWithKMKaif"
        ];
        for (const b of banners) {
          if (content.startsWith(b)) {
            content = content.slice(b.length);
          }
        }
      }
      const buf = Buffer.from(content, 'utf-8');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${cleanName}"; filename*=UTF-8''${encodeURIComponent(targetFile.name)}`);
      res.setHeader('Content-Length', buf.length);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.send(buf);
    }

    if (pkg.isSingleFile) {
      res.setHeader('Content-Type', pkg.mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${cleanName}"; filename*=UTF-8''${encodeURIComponent(targetFile.name)}`);
      res.setHeader('Content-Length', pkg.fileBuffer.length);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.send(pkg.fileBuffer);
    }

    // Extract individual binary file directly from ZIP archive
    if (pkg.fileBuffer && pkg.fileBuffer.length > 0) {
      try {
        const zip = await JSZip.loadAsync(pkg.fileBuffer);
        const entry = zip.file(targetFile.name);
        if (entry) {
          const entryBuffer = await entry.async('nodebuffer');
          res.setHeader('Content-Type', 'application/octet-stream');
          res.setHeader('Content-Disposition', `attachment; filename="${cleanName}"; filename*=UTF-8''${encodeURIComponent(targetFile.name)}`);
          res.setHeader('Content-Length', entryBuffer.length);
          res.setHeader('Accept-Ranges', 'bytes');
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          return res.send(entryBuffer);
        }
      } catch (zipExtractErr: any) {
        addServerLog('ERROR', 'ZIP-EXTRACT', `Failed to extract '${targetFile.name}' from zip: ${zipExtractErr.message}`);
      }
    }

    return res.status(404).send('Direct binary extraction failed.');
  });

  // Universal Download Handler with Robust Mobile Range, RFC 6266 Headers & Diagnostic Logging
  const handleDownload = (req: express.Request, res: express.Response) => {
    const rawTarget = req.params.id || (req.query.pkg as string) || (req.query.id as string);
    let targetId = rawTarget === 'latest' || !rawTarget ? latestPackageId : rawTarget;
    let pkg = targetId && packagesMap.has(targetId) ? packagesMap.get(targetId) : (latestPackageId ? packagesMap.get(latestPackageId) : null);
    
    if (!pkg && packagesMap.size > 0) {
      const allPkgs = Array.from(packagesMap.values());
      pkg = allPkgs[allPkgs.length - 1];
    }

    if (!pkg) {
      loadStoreFromDisk();
      if (targetId && packagesMap.has(targetId)) {
        pkg = packagesMap.get(targetId);
      } else if (latestPackageId && packagesMap.has(latestPackageId)) {
        pkg = packagesMap.get(latestPackageId);
      } else if (packagesMap.size > 0) {
        const allPkgs = Array.from(packagesMap.values());
        pkg = allPkgs[allPkgs.length - 1];
      }
    }

    if (!pkg) {
      addServerLog(
        'ERROR',
        'DL-NOT-FOUND',
        `Download requested for target '${rawTarget}', but no package found in memory or disk. Stored packages: [${Array.from(packagesMap.keys()).join(', ')}]`
      );
      return res.status(404).send('No active file or package available for download. Please stage files on desktop.');
    }

    const ua = req.headers['user-agent'] || '';
    const deviceInfo = detectClientDevice(ua);
    const contentType = pkg.mimeType || (pkg.isSingleFile ? 'application/octet-stream' : 'application/zip');
    const cleanAsciiFilename = pkg.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const totalLength = pkg.fileBuffer.length;

    // Log download request details
    addServerLog(
      'ZIP',
      'DL-SERVE',
      `Serving package "${pkg.fileName}" (${totalLength} bytes, Single=${pkg.isSingleFile}) to ${deviceInfo.device}`,
      { device: deviceInfo.device }
    );

    // Common Download Headers (RFC 6266 & Mobile Compatibility)
    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${cleanAsciiFilename}"; filename*=UTF-8''${encodeURIComponent(pkg.fileName)}`
    );
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    // Handle Mobile HTTP Range Requests (Safari on iOS frequently sends Range: bytes=0-)
    const rangeHeader = req.headers.range;
    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d*)-(\d*)/);
      if (match) {
        const start = match[1] ? parseInt(match[1], 10) : 0;
        const end = match[2] ? parseInt(match[2], 10) : totalLength - 1;

        if (start >= totalLength || end >= totalLength || start > end) {
          res.status(416).setHeader('Content-Range', `bytes */${totalLength}`);
          addServerLog('WARN', 'DL-RANGE-ERR', `Requested range ${rangeHeader} is unsatisfiable for ${totalLength} bytes.`);
          return res.end();
        }

        const chunkSize = end - start + 1;
        res.status(206);
        res.setHeader('Content-Range', `bytes ${start}-${end}/${totalLength}`);
        res.setHeader('Content-Length', chunkSize);

        addServerLog(
          'HTTP',
          'DL-RANGE',
          `Mobile range request: serving partial bytes ${start}-${end}/${totalLength} (${chunkSize} bytes) to ${deviceInfo.device}`
        );

        return res.send(pkg.fileBuffer.subarray(start, end + 1));
      }
    }

    // Full file response (Non-range)
    res.status(200);
    res.setHeader('Content-Length', totalLength);
    res.send(pkg.fileBuffer);
  };

  // Register all possible mobile download routes
  app.get('/api/download/:id', handleDownload);
  app.get('/api/download', handleDownload);
  app.get('/download/package.zip', handleDownload);
  app.get('/download/:id', handleDownload);
  app.get('/download', handleDownload);

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
    addServerLog('INFO', 'SERVER', `Multi-File ZIP Micro-Server listening on http://0.0.0.0:${PORT} (Express + Vite)`);
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
