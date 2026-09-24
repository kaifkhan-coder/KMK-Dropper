import React, { useState, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import { Smartphone, Key, Unlock, Lock, AlertCircle, CheckCircle2, Code2, Sparkles } from 'lucide-react';
import { DesktopHeader } from './components/DesktopHeader';
import { WatermarkDashboard } from './components/WatermarkDashboard';
import { DropZoneAndFileList } from './components/DropZoneAndFileList';
import { QrCodePanel } from './components/QrCodePanel';
import { ServerControlAndConsole } from './components/ServerControlAndConsole';
import { FileInspectorModal } from './components/FileInspectorModal';
import { JavaSourceViewer } from './components/JavaSourceViewer';
import { MobileReceiverModal } from './components/MobileReceiverModal';
import { MobileReceiverView } from './components/MobileReceiverView';
import { CloudVaultModal } from './components/CloudVaultModal';
import { DeveloperUnlockModal } from './components/DeveloperUnlockModal';
import { QueuedFile, TransferLog, ServerState, NetworkInterfaceInfo, LogLevel } from './types';
import { DEFAULT_INTERFACES } from './utils/network';
import { INITIAL_SAMPLE_FILES } from './utils/sampleFiles';
import { SECRET_AUTH_CODE, WATERMARK_BANNER, injectWatermark, stripWatermark } from './utils/watermark';
import { packageZipArchive } from './utils/zipCompressor';
import { JAVA_PROJECT_FILES } from './utils/javaSourceCode';
import { syncActivePackageToServer } from './utils/packageSync';
import { 
  CloudPackage, 
  loadUserPackages, 
  savePackageToCloud, 
  deleteUserPackage,
  getWorkspaceId
} from './utils/cloudSync';
import { KhanKaifProtocolModal } from './components/KhanKaifProtocolModal';
import { WebsiteFooter } from './components/WebsiteFooter';
import { TermsAndPrivacyModal } from './components/TermsAndPrivacyModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'gui' | 'java-source' | 'mobile'>('gui');
  // Staging queue: restore from localStorage if user previously staged files
  const [files, setFiles] = useState<QueuedFile[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('qr_staged_files_cache');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((f: any) => ({
            ...f,
            addedAt: new Date(f.addedAt || Date.now())
          }));
        }
      }
    } catch (e) {
      // ignore
    }
    return INITIAL_SAMPLE_FILES;
  });

  const [selectedQrFileId, setSelectedQrFileId] = useState<string | null>(null);
  const [isBypassActive, setIsBypassActive] = useState(false);
  const [inspectedFile, setInspectedFile] = useState<QueuedFile | null>(null);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [showCloudVault, setShowCloudVault] = useState(false);
  const [showKhanKaifModal, setShowKhanKaifModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsModalTab, setTermsModalTab] = useState<'terms' | 'privacy' | '3d-protocol' | 'architect'>('terms');
  const [isPackaging, setIsPackaging] = useState(false);
  const [isSyncingServer, setIsSyncingServer] = useState(false);
  const [progressPercent, setProgressPercent] = useState(100);
  const [progressMessage, setProgressMessage] = useState('Ready - Micro-Server Listening');

  // Master Developer Secret Code to reveal Java source code and developer architecture
  const DEV_SECRET_CODE = 'KaifOmniMind447';
  const [isDevUnlocked, setIsDevUnlocked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('kaif_dev_unlocked') === 'true';
    } catch {
      return false;
    }
  });
  const [showDevUnlockModal, setShowDevUnlockModal] = useState(false);
  const [devToast, setDevToast] = useState<string | null>(null);

  const handleUnlockDevCode = (code: string): boolean => {
    const trimmed = code.trim();
    if (trimmed === DEV_SECRET_CODE || trimmed.toLowerCase() === DEV_SECRET_CODE.toLowerCase()) {
      setIsDevUnlocked(true);
      try {
        localStorage.setItem('kaif_dev_unlocked', 'true');
      } catch {}
      setActiveTab('java-source'); // Instantly switch to show the unlocked Java code!
      setDevToast('Secret Code Accepted: Full Java Architecture & Source Code Suite Unlocked!');
      setTimeout(() => setDevToast(null), 5000);
      return true;
    }
    return false;
  };

  const handleRelockDevCode = () => {
    setIsDevUnlocked(false);
    try {
      localStorage.removeItem('kaif_dev_unlocked');
    } catch {}
    setActiveTab('gui');
    setDevToast('Restored to simple Drag & Drop interface. Java code section hidden.');
    setTimeout(() => setDevToast(null), 4000);
  };

  // Ensure java-source tab cannot remain active if dev mode is locked
  useEffect(() => {
    if (!isDevUnlocked && activeTab === 'java-source') {
      setActiveTab('gui');
    }
  }, [isDevUnlocked, activeTab]);

  // Workstation Cloud Packages State (no login required)
  const [cloudPackages, setCloudPackages] = useState<CloudPackage[]>([]);
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);

  // Stable package identifier synced with backend
  const [packageId] = useState<string>(() => 'pkg-' + Date.now().toString(36));

  // Detect if opened from a physical mobile device scan (?mobile=1, ?pkg=..., or mobile user agent)
  const [isMobileDeviceView, setIsMobileDeviceView] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    const hasScanQuery = params.get('mobile') === '1' || params.has('pkg') || params.has('fileId');
    const isMobilePath = window.location.pathname.startsWith('/mobile') || window.location.pathname.startsWith('/download');
    const isMobileScreen = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return hasScanQuery || isMobilePath || isMobileScreen;
  });

  // Sync staged files to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (files.length > 0) {
        const serializable = files.map(f => ({
          id: f.id,
          name: f.name,
          size: f.size,
          type: f.type,
          extension: f.extension,
          isText: f.isText,
          content: f.content,
          addedAt: f.addedAt,
          status: f.status
        }));
        localStorage.setItem('qr_staged_files_cache', JSON.stringify(serializable));
      } else {
        localStorage.removeItem('qr_staged_files_cache');
      }
    } catch (e) {
      // ignore
    }
  }, [files]);

  const [mobileParamPkgId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return new URLSearchParams(window.location.search).get('pkg');
  });

  const [mobileParamFileId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return new URLSearchParams(window.location.search).get('fileId');
  });

  // Network and Server state
  const [interfaces] = useState<NetworkInterfaceInfo[]>(DEFAULT_INTERFACES);
  const [serverState, setServerState] = useState<ServerState>({
    isRunning: true,
    port: 8080,
    host: DEFAULT_INTERFACES[0].ipv4,
    activeInterface: DEFAULT_INTERFACES[0].name,
    activeConnections: 1,
    totalBytesServed: 3490,
    totalTransfersCompleted: 1,
    startedAt: new Date()
  });

  // Real-time Event Console Logs
  const [logs, setLogs] = useState<TransferLog[]>([
    {
      id: 'log-1',
      timestamp: '09:30:12.104',
      level: 'INFO',
      tag: 'INIT',
      message: 'Multi-File ZIP Package Generator via QR (Senior Java Edition v2.4) initialized.'
    },
    {
      id: 'log-2',
      timestamp: '09:30:12.180',
      level: 'INFO',
      tag: 'NET',
      message: `NetworkResolver scanned interfaces: wlan0 (${DEFAULT_INTERFACES[0].ipv4}) selected.`
    },
    {
      id: 'log-3',
      timestamp: '09:30:12.250',
      level: 'HTTP',
      tag: 'SERVER',
      message: `com.sun.net.httpserver.HttpServer listening on 0.0.0.0:${serverState.port} (CachedThreadPool active).`
    },
    {
      id: 'log-4',
      timestamp: '09:30:12.310',
      level: 'SECURE',
      tag: 'WATERMARK',
      message: `MANDATORY SECURITY ENFORCED: Prepending "${WATERMARK_BANNER}" to all text file streams.`
    },
    {
      id: 'log-5',
      timestamp: '09:30:12.440',
      level: 'ZIP',
      tag: 'QR',
      message: `ZXing QRCodeWriter generated 256x256 high-contrast matrix for endpoint http://${serverState.host}:${serverState.port}/download/package.zip`
    }
  ]);

  const addLog = useCallback((level: TransferLog['level'], tag: string, message: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;
    const newLog: TransferLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: timeStr,
      level,
      tag,
      message
    };
    setLogs((prev) => [...prev.slice(-150), newLog]);
  }, []);

  // Poll live backend server logs for real incoming mobile requests & download diagnostics
  useEffect(() => {
    let isSubscribed = true;
    let lastSeenId = '';

    const pollServerLogs = async () => {
      try {
        const res = await fetch('/api/server-logs');
        if (!res.ok) return;
        const data = await res.json();
        if (data && Array.isArray(data.logs) && isSubscribed) {
          const newLogs: TransferLog[] = [];
          for (const srv of data.logs) {
            if (lastSeenId && srv.id <= lastSeenId) continue;
            let level: LogLevel = 'HTTP';
            if (srv.level === 'ERROR') level = 'ERROR';
            else if (srv.level === 'WARN') level = 'WARN';
            else if (srv.level === 'ZIP') level = 'ZIP';
            else if (srv.level === 'SECURE') level = 'SECURE';
            else if (srv.level === 'INFO') level = 'INFO';
            else if (srv.level === 'NET') level = 'NET';

            newLogs.push({
              id: srv.id,
              timestamp: srv.timestamp,
              level,
              tag: srv.tag || 'SERVER',
              message: srv.message
            });
          }

          if (data.logs.length > 0) {
            lastSeenId = data.logs[data.logs.length - 1].id;
          }

          if (newLogs.length > 0) {
            setLogs((prev) => {
              const seen = new Set(prev.map((l) => l.id));
              const additions = newLogs.filter((l) => !seen.has(l.id));
              if (additions.length === 0) return prev;
              return [...prev.slice(-150), ...additions];
            });
          }
        }
      } catch {
        // quiet background polling
      }
    };

    pollServerLogs();
    const interval = setInterval(pollServerLogs, 2000);
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, []);

  const handleClearAllLogs = async () => {
    setLogs([]);
    try {
      await fetch('/api/server-logs/clear', { method: 'POST' });
    } catch {
      // ignore
    }
    addLog('INFO', 'CONSOLE', 'Console log history reset.');
  };

  // Load saved cloud snapshots for this workstation on mount
  useEffect(() => {
    const workspaceId = getWorkspaceId();
    fetchCloudPackages(workspaceId);
    addLog('INFO', 'STORAGE', 'Initialized local & Firestore package snapshots vault.');
  }, []);

  const fetchCloudPackages = async (workspaceId: string) => {
    setIsLoadingCloud(true);
    try {
      const pkgs = await loadUserPackages(workspaceId);
      setCloudPackages(pkgs);
      if (pkgs.length > 0) {
        addLog('INFO', 'FIRESTORE', `Loaded ${pkgs.length} saved package snapshots.`);
      }
    } catch (err: any) {
      addLog('WARN', 'FIRESTORE', `Failed to load cloud packages: ${err.message}`);
    } finally {
      setIsLoadingCloud(false);
    }
  };

  const handleSaveToCloud = async (title: string) => {
    const workspaceId = getWorkspaceId();
    try {
      await savePackageToCloud(workspaceId, title, files, isBypassActive);
      await fetchCloudPackages(workspaceId);
      addLog('INFO', 'FIRESTORE', `Backed up snapshot "${title}" to Cloud Firestore Vault.`);
    } catch (err: any) {
      addLog('ERROR', 'FIRESTORE', `Cloud backup error: ${err.message}`);
      throw err;
    }
  };

  const handleDeleteCloudPackage = async (packageId: string) => {
    try {
      await deleteUserPackage(packageId);
      setCloudPackages((prev) => prev.filter((p) => p.id !== packageId));
      addLog('INFO', 'FIRESTORE', `Deleted snapshot ${packageId}.`);
    } catch (err: any) {
      addLog('ERROR', 'FIRESTORE', `Delete error: ${err.message}`);
    }
  };

  const handleRestorePackage = (pkg: CloudPackage) => {
    const restoredFiles: QueuedFile[] = pkg.files.map((f) => ({
      id: f.id,
      name: f.name,
      size: f.size,
      type: f.type || 'text/plain',
      extension: f.name.split('.').pop() || '',
      isText: f.isText,
      content: f.content,
      addedAt: new Date(),
      status: 'staged'
    }));

    setFiles(restoredFiles);
    setIsBypassActive(pkg.isBypassActive);
    setSelectedQrFileId(null);
    addLog(
      'INFO',
      'RESTORE',
      `Restored cloud package snapshot "${pkg.title}" with ${restoredFiles.length} file(s) into staging.`
    );
  };

  // Handle files adding
  const handleAddFiles = (newFiles: QueuedFile[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    addLog('INFO', 'STAGING', `Added ${newFiles.length} file(s) to compression queue. Total: ${files.length + newFiles.length}`);
    newFiles.forEach((f) => {
      if (f.isText) {
        addLog(
          'SECURE',
          'PIPELINE',
          isBypassActive
            ? `Text file '${f.name}' staged in CLEAN BYPASS mode.`
            : `Text file '${f.name}' intercepted: Protocol watermark stamped on Line 1.`
        );
      }
    });
  };

  const handleRemoveFile = (fileId: string) => {
    const target = files.find((f) => f.id === fileId);
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (selectedQrFileId === fileId) {
      setSelectedQrFileId(null);
    }
    if (target) {
      addLog('INFO', 'QUEUE', `Removed '${target.name}' from staging queue.`);
    }
  };

  const handleClearFiles = () => {
    setFiles([]);
    setSelectedQrFileId(null);
    addLog('INFO', 'QUEUE', 'Staged file queue cleared completely.');
  };

  // Watermark Authorization
  const handleUnlockBypass = (inputCode: string): boolean => {
    if (inputCode.trim() === SECRET_AUTH_CODE) {
      setIsBypassActive(true);
      addLog('SECURE', 'COUPON_AUTH', 'Coupon code "KaifGive20@" verified! Watermark "BuildWithKMKaif" removed.');
      addLog('SECURE', 'MODE_CHANGE', 'Clean Bypass Mode ACTIVE: All files will be packaged without watermark.');
      return true;
    } else {
      addLog('WARN', 'SECURE_ALERT', 'Invalid coupon code entered. Watermark "BuildWithKMKaif" remains enforced.');
      return false;
    }
  };

  const handleRelockWatermark = () => {
    setIsBypassActive(false);
    addLog('SECURE', 'MODE_CHANGE', 'Watermark RE-ENABLED: Prepending "BuildWithKMKaif" to files.');
  };

  // Server management
  const handleToggleServer = () => {
    if (serverState.isRunning) {
      setServerState((prev) => ({ ...prev, isRunning: false, activeConnections: 0 }));
      addLog('WARN', 'SERVER', `com.sun.net.httpserver.HttpServer on port ${serverState.port} stopped.`);
      setProgressMessage('Server Stopped');
    } else {
      setServerState((prev) => ({ ...prev, isRunning: true, startedAt: new Date() }));
      addLog('HTTP', 'SERVER', `com.sun.net.httpserver.HttpServer re-started on port ${serverState.port}.`);
      setProgressMessage('Micro-Server Listening');
    }
  };

  const handlePortChange = (newPort: number) => {
    setServerState((prev) => ({ ...prev, port: newPort }));
    addLog('HTTP', 'PORT_CHANGE', `Socket rebound to port ${newPort}. Updated QR code matrix.`);
  };

  const handleInterfaceChange = (ifaceName: string) => {
    const found = interfaces.find((i) => i.name === ifaceName);
    if (found) {
      setServerState((prev) => ({
        ...prev,
        activeInterface: found.name,
        host: found.ipv4
      }));
      addLog('NET', 'IFACE_SWITCH', `Active adapter switched to ${found.name} (${found.ipv4}).`);
    }
  };

  // Trigger compression and download
  const handleDownloadZip = async () => {
    if (files.length === 0) {
      addLog('WARN', 'COMPRESS', 'Cannot download: No files staged in queue.');
      return;
    }

    const targetedFile =
      (selectedQrFileId && files.find((f) => f.id === selectedQrFileId)) ||
      (files.length === 1 ? files[0] : null);

    // If single file (or a specific file selected via QR), do NOT convert to .zip! Deliver as original file
    if (targetedFile) {
      setIsPackaging(true);
      addLog('DIRECT', 'FILE_EXPORT', `Direct single file transfer: '${targetedFile.name}' (no .zip conversion).`);

      try {
        let blob: Blob;
        if (targetedFile.isText && targetedFile.content !== undefined) {
          const content = isBypassActive
            ? stripWatermark(targetedFile.content)
            : injectWatermark(targetedFile.content);
          blob = new Blob([content], { type: targetedFile.type || 'text/plain;charset=utf-8' });
        } else if (targetedFile.binaryBlob) {
          blob = targetedFile.binaryBlob;
        } else {
          blob = new Blob([targetedFile.content || ''], { type: targetedFile.type || 'application/octet-stream' });
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = targetedFile.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        addLog(
          'DIRECT',
          'EXPORT',
          `Delivered original file: ${targetedFile.name} (${(blob.size / 1024).toFixed(1)} KB). Preserved original format without ZIP conversion.`
        );

        setServerState((prev) => ({
          ...prev,
          totalBytesServed: prev.totalBytesServed + blob.size,
          totalTransfersCompleted: prev.totalTransfersCompleted + 1
        }));

        setProgressPercent(100);
        setProgressMessage(`Delivered ${targetedFile.name} (100%)`);
      } catch (err: any) {
        addLog('ERROR', 'EXPORT_FAIL', `Export error: ${err.message}`);
        setProgressMessage('Export Error');
      } finally {
        setIsPackaging(false);
      }
      return;
    }

    // Multi-file: Package as ZIP
    setIsPackaging(true);
    addLog('ZIP', 'STREAM', `Starting ZIP stream compression for ${files.length} file(s)...`);

    try {
      const result = await packageZipArchive(
        files,
        isBypassActive,
        (percent, currentFileName) => {
          setProgressPercent(percent);
          setProgressMessage(`${currentFileName} (${percent}%)`);
        }
      );

      // Trigger browser download
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addLog(
        'ZIP',
        'EXPORT',
        `Package created: ${result.fileName} (${(result.compressedBytes / 1024).toFixed(1)} KB, compression ${result.compressionRatio}%). Mode: ${result.isBypassActive ? 'CLEAN BYPASS' : 'SECURE WATERMARKED'}.`
      );

      setServerState((prev) => ({
        ...prev,
        totalBytesServed: prev.totalBytesServed + result.compressedBytes,
        totalTransfersCompleted: prev.totalTransfersCompleted + 1
      }));

      setProgressPercent(100);
      setProgressMessage('Package Stream Delivered (100%)');
    } catch (err: any) {
      addLog('ERROR', 'COMPRESS_FAIL', `Compression error: ${err.message}`);
      setProgressMessage('Compression Error');
    } finally {
      setIsPackaging(false);
    }
  };

  // Simulate mobile scan and transfer
  const handleSimulateMobileConnection = () => {
    if (!serverState.isRunning) {
      addLog('ERROR', 'HTTP', 'Connection refused: Micro-server is currently stopped.');
      return;
    }

    const mobileDevices = [
      'iPhone 15 Pro (Safari 17.4)',
      'Samsung Galaxy S24 Ultra (Chrome 122)',
      'Google Pixel 8 (Android 14)',
      'iPad Air 5th Gen (MobileSafari)'
    ];
    const device = mobileDevices[Math.floor(Math.random() * mobileDevices.length)];
    const mockClientIp = `192.168.1.${Math.floor(Math.random() * 80) + 110}`;

    addLog('HTTP', 'CONNECT', `New TCP socket from ${mockClientIp} (${device}) on Wi-Fi direct.`);
    addLog('HTTP', 'REQUEST', `GET /download/package.zip HTTP/1.1 from ${mockClientIp}`);

    setServerState((prev) => ({
      ...prev,
      activeConnections: prev.activeConnections + 1
    }));

    // Trigger real backend download route to generate live server console diagnostics
    fetch('/api/download/latest', {
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    }).catch(() => {});

    handleDownloadZip();

    setTimeout(() => {
      setServerState((prev) => ({
        ...prev,
        activeConnections: Math.max(0, prev.activeConnections - 1)
      }));
      addLog('HTTP', 'DISCONNECT', `Mobile client ${mockClientIp} completed download and closed socket.`);
    }, 2500);
  };

  // Export Java Maven Project ZIP
  const handleExportJavaProject = async () => {
    addLog('INFO', 'MAVEN', 'Packaging complete Java Maven project structure...');
    try {
      const zip = new JSZip();

      // Add all java source files and configs
      JAVA_PROJECT_FILES.forEach((file) => {
        zip.file(file.path, file.code);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'multi-file-qr-zip-java-maven-project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addLog('INFO', 'MAVEN', 'Exported full Java Maven project: multi-file-qr-zip-java-maven-project.zip');
    } catch (err: any) {
      addLog('ERROR', 'MAVEN', `Failed to export Java project: ${err.message}`);
    }
  };

  // Synchronize package to Express backend for real mobile QR code scanning
  useEffect(() => {
    if (files.length === 0 || isMobileDeviceView) return;

    const timer = setTimeout(async () => {
      try {
        setIsSyncingServer(true);
        const result = await syncActivePackageToServer(packageId, files, isBypassActive);
        addLog(
          'HTTP',
          'GATEWAY',
          `Package synced to Mobile Gateway (${(result.size / 1024).toFixed(1)} KB). Ready for phone camera scan.`
        );
      } catch (err: any) {
        console.warn('Backend package sync notice:', err.message);
      } finally {
        setIsSyncingServer(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [files, isBypassActive, packageId, isMobileDeviceView, addLog]);

  // If opened directly on a mobile phone via QR scan (?mobile=1)
  if (isMobileDeviceView) {
    return (
      <MobileReceiverView
        packageId={mobileParamPkgId || packageId}
        fileId={mobileParamFileId}
        localFiles={files}
        localIsBypassActive={isBypassActive}
        onBackToDesktop={() => setIsMobileDeviceView(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black relative">
      {/* Desktop Window Header */}
      <DesktopHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBypassActive={isBypassActive}
        stagedFilesCount={files.length}
        serverRunning={serverState.isRunning}
        onExportJavaProject={handleExportJavaProject}
        onOpenCloudVault={() => setShowCloudVault(true)}
        cloudPackagesCount={cloudPackages.length}
        onOpenKhanKaifModal={() => setShowKhanKaifModal(true)}
        onOpenTermsModal={(tab) => {
          setTermsModalTab(tab);
          setShowTermsModal(true);
        }}
        isDevUnlocked={isDevUnlocked}
        onOpenDevUnlockModal={() => setShowDevUnlockModal(true)}
        onRelockDevMode={handleRelockDevCode}
      />

      {/* Floating Notification Toast */}
      {devToast && (
        <div className="fixed top-16 right-6 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="bg-emerald-950 border border-emerald-600/80 text-emerald-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-mono max-w-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex-1">{devToast}</div>
            <button onClick={() => setDevToast(null)} className="text-emerald-400 hover:text-white font-bold ml-2">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Floating Mobile Switcher for Mobile Device Users */}
      <div className="fixed bottom-4 right-4 z-30 lg:hidden">
        <button
          onClick={() => setIsMobileDeviceView(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-full shadow-xl flex items-center gap-2 text-xs font-mono transition border border-amber-300"
        >
          <Smartphone className="w-4 h-4" />
          <span>Switch to Mobile View</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Simple Drag & Drop Mode vs Developer Mode Banner */}
        {!isDevUnlocked ? (
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <div>
                <span className="text-slate-200 font-bold">Simple Drag &amp; Drop Mode:</span>{' '}
                <span className="text-slate-400">Drag &amp; drop any files below to package and share via QR code.</span>
              </div>
            </div>
            <button
              id="btn-simple-mode-secret-code-prompt"
              onClick={() => setShowDevUnlockModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-mono transition shrink-0 self-start sm:self-auto"
              title="Enter secret code (KaifOmniMind447) to reveal Java code & developer suite"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Enter Secret Code &quot;KaifOmniMind447&quot;</span>
            </button>
          </div>
        ) : (
          <div className="bg-emerald-950/40 border border-emerald-700/60 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2.5">
              <Unlock className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-emerald-300 font-bold">Developer Suite Unlocked:</span>{' '}
                <span className="text-emerald-200/90">Java Source Code Suite (7 files + POM) and raw terminal console are active.</span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setActiveTab('java-source')}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition shadow-sm"
              >
                Inspect Java Code
              </button>
              <button
                onClick={handleRelockDevCode}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs border border-slate-700 transition"
              >
                Relock to Simple Mode
              </button>
            </div>
          </div>
        )}

        {activeTab === 'gui' && (
          <>
            {/* Top: Mandatory Security & Watermark Logic Dashboard */}
            <WatermarkDashboard
              isBypassActive={isBypassActive}
              onUnlockBypass={handleUnlockBypass}
              onRelockWatermark={handleRelockWatermark}
              stagedFilesCount={files.length}
              onUnlockDevCode={handleUnlockDevCode}
              isDevUnlocked={isDevUnlocked}
            />

            {/* Central Split: Staging Queue (Left) & ZXing QR Canvas (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              <div className="lg:col-span-7 flex flex-col">
                <DropZoneAndFileList
                  files={files}
                  onAddFiles={handleAddFiles}
                  onRemoveFile={handleRemoveFile}
                  onClearFiles={handleClearFiles}
                  onInspectFile={(f) => setInspectedFile(f)}
                  isBypassActive={isBypassActive}
                  selectedQrFileId={selectedQrFileId}
                  onSelectQrFile={setSelectedQrFileId}
                  onOpenSaveToCloud={() => setShowCloudVault(true)}
                />
              </div>

              <div className="lg:col-span-5 flex flex-col">
                <QrCodePanel
                  files={files}
                  hostIp={serverState.host}
                  port={serverState.port}
                  isBypassActive={isBypassActive}
                  packageId={packageId}
                  selectedQrFileId={selectedQrFileId}
                  onSelectQrFile={setSelectedQrFileId}
                  onDownloadDirectZip={handleDownloadZip}
                  onOpenMobileSimulator={() => setShowMobileModal(true)}
                  isPackaging={isPackaging}
                  isSyncingServer={isSyncingServer}
                />
              </div>
            </div>

            {/* Bottom: Micro-Server Controls or Simple Server Status */}
            {isDevUnlocked ? (
              <ServerControlAndConsole
                serverState={serverState}
                interfaces={interfaces}
                logs={logs}
                progressPercent={progressPercent}
                progressMessage={progressMessage}
                onToggleServer={handleToggleServer}
                onPortChange={handlePortChange}
                onInterfaceChange={handleInterfaceChange}
                onClearLogs={handleClearAllLogs}
                onSimulateMobileConnection={handleSimulateMobileConnection}
              />
            ) : (
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-semibold">Local Micro-Server Active</span>
                  <span className="text-slate-600 hidden sm:inline">•</span>
                  <span className="text-slate-400 hidden sm:inline">Port: {serverState.port}</span>
                  <span className="text-slate-600 hidden sm:inline">•</span>
                  <span className="text-slate-400 hidden sm:inline">Network: {serverState.host}</span>
                </div>
                <button
                  onClick={() => setShowDevUnlockModal(true)}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400 transition text-[11px] self-start sm:self-auto"
                >
                  <Key className="w-3 h-3 text-amber-400" />
                  <span>Show Advanced Server Console (Requires KaifOmniMind447)</span>
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === 'java-source' && (
          isDevUnlocked ? (
            <JavaSourceViewer onExportProjectZip={handleExportJavaProject} />
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-lg mx-auto my-8 space-y-4 font-mono shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Java Source Code Suite Locked</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                The multi-file Java architecture and Maven project files are secured. Please enter the master secret code <strong>&quot;KaifOmniMind447&quot;</strong> to view and export the Java source code.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setShowDevUnlockModal(true)}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-amber-500/20 flex items-center gap-2 mx-auto"
                >
                  <Key className="w-4 h-4" />
                  <span>Enter &quot;KaifOmniMind447&quot;</span>
                </button>
              </div>
            </div>
          )
        )}

        {activeTab === 'mobile' && (
          <div className="py-2">
            <div className="max-w-md mx-auto mb-4 bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Viewing Mobile Receiver Screen:</span>
              <button
                onClick={() => setActiveTab('gui')}
                className="text-amber-400 hover:text-amber-300 underline text-[11px]"
              >
                Back to Workstation
              </button>
            </div>
            <div className="max-w-md mx-auto border-2 border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
              <MobileReceiverView
                packageId={packageId}
                fileId={selectedQrFileId}
                localFiles={files}
                localIsBypassActive={isBypassActive}
                onBackToDesktop={() => setActiveTab('gui')}
              />
            </div>
          </div>
        )}
      </main>

      {/* Prominent Website Footer with inline Terms & Conditions, Privacy Policy & 3D Protocol */}
      <WebsiteFooter
        onOpenTermsModal={(tab) => {
          setTermsModalTab(tab);
          setShowTermsModal(true);
        }}
        isBypassActive={isBypassActive}
        onQuickUnlockBypass={(key) => handleUnlockBypass(key)}
      />

      {/* Terms & Conditions, Privacy Policy & 3D Protocol Modal */}
      <TermsAndPrivacyModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        defaultTab={termsModalTab}
        onAuthorizeBypass={(key) => handleUnlockBypass(key)}
        isBypassActive={isBypassActive}
      />

      {/* File Inspector Modal */}
      {inspectedFile && (
        <FileInspectorModal
          file={inspectedFile}
          isBypassActive={isBypassActive}
          onClose={() => setInspectedFile(null)}
        />
      )}

      {/* Floating Mobile Simulator Modal (when opened from QR panel button) */}
      {showMobileModal && activeTab !== 'mobile' && (
        <MobileReceiverModal
          files={files}
          hostIp={serverState.host}
          port={serverState.port}
          isBypassActive={isBypassActive}
          packageId={packageId}
          selectedQrFileId={selectedQrFileId}
          onClose={() => setShowMobileModal(false)}
          onDownloadZip={handleDownloadZip}
          isPackaging={isPackaging}
        />
      )}

      {/* Cloud Firestore Package Vault Modal */}
      <CloudVaultModal
        isOpen={showCloudVault}
        onClose={() => setShowCloudVault(false)}
        packages={cloudPackages}
        isLoading={isLoadingCloud}
        onRefresh={() => fetchCloudPackages(getWorkspaceId())}
        onRestorePackage={handleRestorePackage}
        onDeletePackage={handleDeleteCloudPackage}
        onSaveCurrentStaging={handleSaveToCloud}
        currentStagedFilesCount={files.length}
      />

      {/* Master Developer Secret Code Unlock Modal */}
      <DeveloperUnlockModal
        isOpen={showDevUnlockModal}
        onClose={() => setShowDevUnlockModal(false)}
        onUnlock={handleUnlockDevCode}
        isDevUnlocked={isDevUnlocked}
        onRelock={handleRelockDevCode}
      />

      {/* Remarkable Creation: Khan Kaif Cryptographic Protocol Suite & Inspector Modal */}
      <KhanKaifProtocolModal
        isOpen={showKhanKaifModal}
        onClose={() => setShowKhanKaifModal(false)}
        isBypassActive={isBypassActive}
        onToggleBypass={(activate) => {
          if (activate) {
            handleUnlockBypass(SECRET_AUTH_CODE);
          } else {
            handleRelockWatermark();
          }
        }}
        stagedFiles={files}
      />
    </div>
  );
}
