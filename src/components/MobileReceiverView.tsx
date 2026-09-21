import React, { useState, useEffect } from 'react';
import { 
  Download, 
  FileArchive, 
  ShieldCheck, 
  Smartphone, 
  CheckCircle2, 
  FileText, 
  FileCode, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  ExternalLink,
  Wifi,
  Sparkles,
  Copy,
  Check,
  FileCheck,
  Type
} from 'lucide-react';
import { QueuedFile } from '../types';
import { packageZipArchive } from '../utils/zipCompressor';
import { WATERMARK_BANNER, injectWatermark, stripWatermark } from '../utils/watermark';

interface MobileReceiverViewProps {
  packageId?: string;
  fileId?: string | null;
  onBackToDesktop?: () => void;
  localFiles?: QueuedFile[];
  localIsBypassActive?: boolean;
}

interface ServerPackageData {
  id: string;
  fileName: string;
  isSingleFile?: boolean;
  mimeType?: string;
  isBypassActive: boolean;
  fileCount: number;
  size: number;
  files: Array<{
    id: string;
    name: string;
    size: number;
    isText: boolean;
    content?: string;
  }>;
  createdAt: number;
}

export const MobileReceiverView: React.FC<MobileReceiverViewProps> = ({
  packageId,
  fileId,
  onBackToDesktop,
  localFiles = [],
  localIsBypassActive = false
}) => {
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [packageData, setPackageData] = useState<ServerPackageData | null>(null);
  const [expandedFileId, setExpandedFileId] = useState<string | null>(fileId || null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [previewFontSize, setPreviewFontSize] = useState<'text-xs' | 'text-sm' | 'text-base'>('text-xs');

  // Fetch package metadata from backend API
  useEffect(() => {
    let isMounted = true;
    const fetchPackage = async () => {
      setLoading(true);
      const targetId = packageId || 'latest';
      try {
        const res = await fetch(`/api/package/${targetId}`);
        if (res.ok) {
          const data: ServerPackageData = await res.json();
          if (isMounted) {
            setPackageData(data);
            if (fileId) {
              setExpandedFileId(fileId);
            } else if (data.files.length > 0) {
              setExpandedFileId(data.files[0].id);
            }
          }
        } else {
          // Fallback to local files if available
          useFallbackData();
        }
      } catch (err) {
        console.warn('Could not reach API server, checking local files:', err);
        useFallbackData();
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const useFallbackData = () => {
      // DO NOT store default sample files! Only use files if explicitly present in localFiles
      const activeFiles = localFiles;
      if (activeFiles.length === 0) {
        if (isMounted) setPackageData(null);
        return;
      }

      const isSingle = activeFiles.length === 1;
      const totalSize = activeFiles.reduce((acc, f) => acc + f.size, 0);
      const isBypass = localIsBypassActive;
      const mockPkg: ServerPackageData = {
        id: packageId || 'offline-pkg',
        fileName: isSingle ? activeFiles[0].name : `Package_${isBypass ? 'CLEAN_BYPASS' : 'SECURE_WM'}_Transfer.zip`,
        isSingleFile: isSingle,
        mimeType: isSingle ? (activeFiles[0].type || 'text/plain') : 'application/zip',
        isBypassActive: isBypass,
        fileCount: activeFiles.length,
        size: totalSize,
        files: activeFiles.map(f => ({
          id: f.id,
          name: f.name,
          size: f.size,
          isText: f.isText,
          content: f.content
        })),
        createdAt: Date.now()
      };

      if (isMounted) {
        setPackageData(mockPkg);
        if (fileId) {
          setExpandedFileId(fileId);
        } else if (mockPkg.files.length > 0) {
          setExpandedFileId(mockPkg.files[0].id);
        }
      }
    };

    fetchPackage();

    return () => {
      isMounted = false;
    };
  }, [packageId, fileId, localFiles, localIsBypassActive]);

  // Determine if this view is targeting a single particular file
  const isSingleFileMode = Boolean(
    packageData?.isSingleFile || 
    (packageData?.files && packageData.files.length === 1) || 
    Boolean(fileId)
  );

  const targetedFile = isSingleFileMode && packageData?.files
    ? (fileId ? packageData.files.find(f => f.id === fileId || f.name === fileId) : packageData.files[0]) || packageData.files[0]
    : null;

  // Handle Download: Single file (as-is, no ZIP) OR Multi-file (ZIP)
  const handlePrimaryDownload = async () => {
    if (!packageData) return;
    setDownloading(true);

    try {
      if (isSingleFileMode && targetedFile) {
        // Direct single file download: Not converted to .zip!
        const downloadUrl = `/api/download/${packageData.id}/${targetedFile.id}`;
        const response = await fetch(downloadUrl);

        if (response.ok) {
          const blob = await response.blob();
          triggerBrowserDownload(blob, targetedFile.name);
        } else if (targetedFile.content !== undefined) {
          const content = packageData.isBypassActive
            ? stripWatermark(targetedFile.content)
            : injectWatermark(targetedFile.content);
          const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
          triggerBrowserDownload(blob, targetedFile.name);
        }
      } else {
        // Multi-file ZIP download
        const downloadUrl = `/api/download/${packageData.id}`;
        const response = await fetch(downloadUrl);

        if (response.ok) {
          const blob = await response.blob();
          triggerBrowserDownload(blob, packageData.fileName || 'package.zip');
        } else {
          await generateFallbackZip();
        }
      }
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.warn('Download error:', err);
      if (targetedFile && targetedFile.content) {
        const blob = new Blob([targetedFile.content], { type: 'text/plain;charset=utf-8' });
        triggerBrowserDownload(blob, targetedFile.name);
        setDownloadSuccess(true);
      }
    } finally {
      setDownloading(false);
    }
  };

  const generateFallbackZip = async () => {
    if (!packageData) return;
    const queuedFiles: QueuedFile[] = packageData.files.map(f => {
      const ext = f.name.split('.').pop()?.toLowerCase() || '';
      return {
        id: f.id,
        name: f.name,
        size: f.size,
        type: f.isText ? 'text/plain' : 'application/octet-stream',
        extension: ext,
        isText: f.isText,
        content: f.content || '',
        addedAt: new Date(),
        status: 'ready'
      };
    });

    const result = await packageZipArchive(queuedFiles, packageData.isBypassActive);
    triggerBrowserDownload(result.blob, packageData.fileName);
  };

  const triggerBrowserDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download individual file
  const handleDownloadSingleFile = (file: { name: string; content?: string; id?: string }) => {
    if (!packageData) return;
    if (file.content) {
      const content = packageData.isBypassActive
        ? stripWatermark(file.content)
        : injectWatermark(file.content);
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      triggerBrowserDownload(blob, file.name);
    } else {
      window.open(`/api/download/${packageData.id}/${file.id || file.name}`, '_blank');
    }
  };

  const handleCopyCode = (fileId: string, content?: string) => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopiedCodeId(fileId);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Mobile App Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold font-mono tracking-tight text-slate-100 flex items-center gap-1.5">
              <span>KHAN KAIF STP</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {isSingleFileMode ? 'Direct File Receiver' : 'Package Receiver Gateway'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* In-place Preview Size Controller (allows changing size safely without reloading view) */}
          <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-md border border-slate-700">
            <Type className="w-3 h-3 text-slate-400" />
            {(['text-xs', 'text-sm', 'text-base'] as const).map((sz, idx) => (
              <button
                key={sz}
                onClick={() => setPreviewFontSize(sz)}
                className={`text-[9px] px-1 py-0.5 rounded font-mono transition ${
                  previewFontSize === sz
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Change display text size (stays in current view)"
              >
                {idx === 0 ? 'S' : idx === 1 ? 'M' : 'L'}
              </button>
            ))}
          </div>

          <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
            <Wifi className="w-3 h-3" />
            <span>Ready</span>
          </span>
        </div>
      </header>

      {/* Main Mobile Screen Body */}
      <main className="flex-1 max-w-lg w-full mx-auto p-4 space-y-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-xs font-mono text-slate-400">
              Connecting to Khan Kaif STP Micro-Server...
            </p>
          </div>
        ) : packageData && packageData.files.length > 0 ? (
          <>
            {/* Download Success Notice */}
            {downloadSuccess && (
              <div className="bg-emerald-950/90 border-2 border-emerald-500 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div className="text-xs font-mono">
                  <div className="text-emerald-200 font-bold">Download Complete!</div>
                  <div className="text-emerald-400/90 text-[11px]">
                    Saved <span className="font-semibold">{targetedFile ? targetedFile.name : packageData.fileName}</span> to your device.
                  </div>
                </div>
              </div>
            )}

            {/* Main File/Package Card Hero */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-start justify-between gap-3">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
                  {isSingleFileMode ? <FileCheck className="w-8 h-8" /> : <FileArchive className="w-8 h-8" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                      isSingleFileMode
                        ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60'
                        : 'text-amber-400 bg-amber-950/50 border-amber-800/40'
                    }`}>
                      {isSingleFileMode ? 'Single File Transfer (No .ZIP)' : 'ZIP Archive Ready'}
                    </span>
                  </div>
                  <h1 
                    className="text-sm font-bold text-slate-100 font-mono mt-1.5 truncate" 
                    title={targetedFile ? targetedFile.name : packageData.fileName}
                  >
                    {targetedFile ? targetedFile.name : packageData.fileName}
                  </h1>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {isSingleFileMode && targetedFile
                      ? `Original file: ${(targetedFile.size / 1024).toFixed(1)} KB`
                      : `${packageData.files.length} Files • ~${(packageData.size / 1024).toFixed(1)} KB`}
                  </p>
                </div>
              </div>

              {/* Security Verification Tag */}
              <div className={`mt-4 p-3 rounded-xl border text-xs font-mono flex items-start gap-2.5 ${
                packageData.isBypassActive
                  ? 'bg-emerald-950/50 border-emerald-800/70 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
              }`}>
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold flex items-center justify-between">
                    <span>{packageData.isBypassActive ? 'Clean Bypass Verified' : 'Khan Kaif STP Secured'}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 border border-current">
                      {packageData.isBypassActive ? 'BYPASS' : 'SECURED'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    {packageData.isBypassActive
                      ? 'Watermark removed via coupon code ("KaifGive20@"). Original clean file delivered.'
                      : `Active watermark: "${WATERMARK_BANNER}" stamped on line 1.`}
                  </p>
                </div>
              </div>

              {/* Primary Action Button: Downloads raw file directly if single file, or ZIP if multi-file */}
              <button
                id="btn-mobile-download-primary"
                onClick={handlePrimaryDownload}
                disabled={downloading}
                className="mt-4 w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 font-mono truncate"
              >
                {downloading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 shrink-0" />
                    <span className="truncate">
                      {isSingleFileMode && targetedFile
                        ? `Download ${targetedFile.name}`
                        : 'Download ZIP Package'}
                    </span>
                  </>
                )}
              </button>

              <div className="mt-2 text-center">
                <span className="text-[10px] text-slate-500 font-mono">
                  {isSingleFileMode 
                    ? 'Delivered in original format without ZIP compression'
                    : 'Direct transfer • No external cloud relay required'}
                </span>
              </div>
            </div>

            {/* Contents & File Inspector */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
                    {isSingleFileMode ? 'File Preview' : `Package Contents (${packageData.files.length})`}
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Tap to preview code
                </span>
              </div>

              <div className="divide-y divide-slate-800/80">
                {packageData.files.map((file) => {
                  const isExpanded = expandedFileId === file.id;
                  return (
                    <div key={file.id} className="transition">
                      <div
                        onClick={() => setExpandedFileId(isExpanded ? null : file.id)}
                        className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 active:bg-slate-800 transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 mr-2">
                          <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300 shrink-0">
                            {file.isText ? <FileCode className="w-4 h-4 text-amber-400" /> : <FileArchive className="w-4 h-4 text-cyan-400" />}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-mono font-medium text-slate-200 truncate flex items-center gap-1.5">
                              <span>{file.name}</span>
                              {targetedFile?.id === file.id && isSingleFileMode && (
                                <span className="text-[9px] bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 px-1 rounded">
                                  Selected
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {file.isText ? 'Text Source' : 'Binary Asset'} • {(file.size / 1024).toFixed(1)} KB
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                            packageData.isBypassActive
                              ? 'text-emerald-400 border-emerald-800/60 bg-emerald-950/40'
                              : 'text-amber-400 border-amber-800/60 bg-amber-950/40'
                          }`}>
                            {packageData.isBypassActive ? 'CLEAN' : 'WATERMARKED'}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {/* Expanded File Inspector */}
                      {isExpanded && (
                        <div className="px-3.5 pb-3.5 bg-slate-950/80 border-t border-slate-800/60 animate-in fade-in duration-150">
                          <div className="flex items-center justify-between py-2 text-[10px] font-mono text-slate-400">
                            <span>Line 1 Content & Watermark:</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyCode(file.id, file.content);
                                }}
                                className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                              >
                                {copiedCodeId === file.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedCodeId === file.id ? 'Copied' : 'Copy'}</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadSingleFile(file);
                                }}
                                className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition"
                              >
                                <Download className="w-3 h-3" />
                                <span>Save {file.name}</span>
                              </button>
                            </div>
                          </div>

                          <div className={`rounded-lg bg-slate-950 border border-slate-800 p-2.5 max-h-56 overflow-y-auto font-mono ${previewFontSize} leading-relaxed text-slate-300 select-all`}>
                            {file.content ? (
                              <pre className="whitespace-pre-wrap break-words">
                                {!packageData.isBypassActive && file.isText ? (
                                  <>
                                    <span className="text-amber-400 font-bold block pb-1 border-b border-amber-900/60 mb-1">
                                      {WATERMARK_BANNER}
                                    </span>
                                    {stripWatermark(file.content)}
                                  </>
                                ) : (
                                  file.content
                                )}
                              </pre>
                            ) : (
                              <div className="text-slate-500 italic py-2 text-center">
                                Binary content stream (encoded in payload)
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Protocol Architecture Specs Card */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-[11px] font-mono text-slate-400 space-y-1.5">
              <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
                <span>TRANSFER INTEGRITY</span>
                <span className="text-emerald-400 text-[10px]">Verified 100%</span>
              </div>
              <div className="flex justify-between">
                <span>Format:</span>
                <span className="text-slate-200">
                  {isSingleFileMode ? 'Direct Single File (No ZIP)' : 'ZIP Package (Multi-File)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Protocol:</span>
                <span className="text-slate-200">Khan Kaif STP v2.4</span>
              </div>
              <div className="flex justify-between">
                <span>Transfer Gateway:</span>
                <span className="text-slate-200">HTTP/1.1 Micro-Server</span>
              </div>
            </div>
          </>
        ) : (
          <div className="py-16 text-center text-slate-400 font-mono text-xs border border-dashed border-slate-800 rounded-2xl p-8 bg-slate-900/40">
            <p className="text-slate-300 font-semibold mb-1">No files staged in package</p>
            <p className="text-[11px] text-slate-500">
              Please stage files on the desktop workstation. No default sample files are stored.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
