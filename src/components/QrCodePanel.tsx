import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Download, 
  Copy, 
  ExternalLink, 
  Smartphone, 
  Check, 
  RefreshCw, 
  Wifi,
  Globe,
  Radio,
  Share2
} from 'lucide-react';
import { QueuedFile } from '../types';

export type QrTargetMode = 'mobile-web' | 'mobile-direct' | 'lan-java';

interface QrCodePanelProps {
  files: QueuedFile[];
  hostIp: string;
  port: number;
  isBypassActive: boolean;
  packageId: string;
  selectedQrFileId?: string | null;
  onSelectQrFile?: (fileId: string | null) => void;
  onDownloadDirectZip: () => void;
  onOpenMobileSimulator: () => void;
  isPackaging: boolean;
  isSyncingServer?: boolean;
}

export const QrCodePanel: React.FC<QrCodePanelProps> = ({
  files,
  hostIp,
  port,
  isBypassActive,
  packageId,
  selectedQrFileId,
  onSelectQrFile,
  onDownloadDirectZip,
  onOpenMobileSimulator,
  isPackaging,
  isSyncingServer = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [qrMode, setQrMode] = useState<QrTargetMode>('mobile-web');
  const [qrPixelSize, setQrPixelSize] = useState<number>(240);

  // Compute origin safely
  const publicOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  // Determine active targeted file (if only 1 file or explicitly selected)
  const isSingleFileMode = files.length === 1;
  const targetedFile = isSingleFileMode 
    ? files[0] 
    : (selectedQrFileId ? files.find(f => f.id === selectedQrFileId) || null : null);

  // Calculate destination URL based on selected mode and targeted file
  let targetUrl = '';
  if (targetedFile) {
    if (qrMode === 'mobile-web') {
      targetUrl = `${publicOrigin}/?mobile=1&pkg=${encodeURIComponent(packageId)}&fileId=${encodeURIComponent(targetedFile.id)}`;
    } else if (qrMode === 'mobile-direct') {
      targetUrl = `${publicOrigin}/api/download/${encodeURIComponent(packageId)}/${encodeURIComponent(targetedFile.id)}`;
    } else {
      targetUrl = `http://${hostIp}:${port}/download/${encodeURIComponent(targetedFile.name)}`;
    }
  } else {
    if (qrMode === 'mobile-web') {
      targetUrl = `${publicOrigin}/?mobile=1&pkg=${encodeURIComponent(packageId)}`;
    } else if (qrMode === 'mobile-direct') {
      targetUrl = `${publicOrigin}/api/download/${encodeURIComponent(packageId)}`;
    } else {
      targetUrl = `http://${hostIp}:${port}/download/package.zip`;
    }
  }

  // Generate QR Code matrix whenever target URL, files, size, or ECC change
  useEffect(() => {
    if (!canvasRef.current || files.length === 0) {
      setQrGenerated(false);
      return;
    }

    QRCode.toCanvas(
      canvasRef.current,
      targetUrl,
      {
        width: qrPixelSize,
        margin: 2,
        errorCorrectionLevel: errorCorrectionLevel,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      },
      (error) => {
        if (!error) {
          setQrGenerated(true);
        } else {
          console.error('QR rendering error:', error);
          setQrGenerated(false);
        }
      }
    );
  }, [files.length, targetUrl, errorCorrectionLevel, qrPixelSize]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenLinkInTab = () => {
    window.open(targetUrl, '_blank');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-950/60 border border-cyan-800/60 rounded text-cyan-400">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              ZXing QR Code Generator
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* QR Size Selector */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-mono">Size:</span>
            {([180, 240, 280] as const).map((sz) => (
              <button
                key={sz}
                onClick={(e) => {
                  e.preventDefault();
                  setQrPixelSize(sz);
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition ${
                  qrPixelSize === sz
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title={`Set QR Code Render Size to ${sz}px (Safe in-place resize without reloading view)`}
              >
                {sz}px
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-mono">ECC:</span>
            {(['L', 'M', 'Q', 'H'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setErrorCorrectionLevel(lvl)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition ${
                  errorCorrectionLevel === lvl
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title={`Error Correction Level ${lvl}`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Target Active File Banner */}
      {files.length > 0 && (
        <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-1.5 truncate mr-2">
            <span className="text-slate-400">QR Target:</span>
            {targetedFile ? (
              <span className="text-amber-400 font-semibold truncate flex items-center gap-1">
                <span>Single File ({targetedFile.name})</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1 rounded border border-emerald-800/60">
                  No ZIP
                </span>
              </span>
            ) : (
              <span className="text-cyan-400 font-semibold">
                Multi-File Bundle ({files.length} files as .zip)
              </span>
            )}
          </div>
          {targetedFile && !isSingleFileMode && onSelectQrFile && (
            <button
              onClick={() => onSelectQrFile(null)}
              className="text-[10px] text-slate-400 hover:text-rose-400 shrink-0 underline"
              title="Reset QR target to full ZIP archive"
            >
              Reset to All
            </button>
          )}
        </div>
      )}

      {/* QR Target Mode Selector (Real Mobile Scan vs Local LAN) */}
      <div className="mt-3 bg-slate-950 p-1.5 rounded-lg border border-slate-800 flex items-center gap-1">
        <button
          onClick={() => setQrMode('mobile-web')}
          className={`flex-1 py-1 px-2 rounded text-[11px] font-mono font-medium flex items-center justify-center gap-1.5 transition ${
            qrMode === 'mobile-web'
              ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="Opens the Mobile Receiver Web App on physical mobile phone when scanned"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Mobile Web</span>
        </button>

        <button
          onClick={() => setQrMode('mobile-direct')}
          className={`flex-1 py-1 px-2 rounded text-[11px] font-mono font-medium flex items-center justify-center gap-1.5 transition ${
            qrMode === 'mobile-direct'
              ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="Directly triggers download of package.zip on mobile phone upon scanning"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Direct ZIP</span>
        </button>

        <button
          onClick={() => setQrMode('lan-java')}
          className={`flex-1 py-1 px-2 rounded text-[11px] font-mono font-medium flex items-center justify-center gap-1.5 transition ${
            qrMode === 'lan-java'
              ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="For local compiled Java desktop app on home/office Wi-Fi (192.168.x.x)"
        >
          <Wifi className="w-3.5 h-3.5" />
          <span>Local LAN</span>
        </button>
      </div>

      {/* QR Canvas Container */}
      <div className="flex-1 flex flex-col items-center justify-center my-3 min-h-[270px]">
        {files.length === 0 ? (
          <div className="w-64 h-64 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-6 text-center bg-slate-950/40">
            <QrCode className="w-12 h-12 text-slate-700 mb-2" />
            <p className="text-xs text-slate-400 font-mono">No Files Staged</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Add at least 1 file to generate the dynamic QR code.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* White card framing the QR code to ensure pristine contrast on phone cameras */}
            <div className="p-3 bg-white rounded-xl shadow-2xl border-4 border-slate-700 relative group">
              <canvas ref={canvasRef} className="rounded-lg block" />
              {(isPackaging || isSyncingServer) && (
                <div className="absolute inset-0 bg-black/60 rounded-lg flex flex-col items-center justify-center text-amber-400 backdrop-blur-xs">
                  <RefreshCw className="w-8 h-8 animate-spin mb-2" />
                  <span className="text-xs font-mono font-bold text-white">
                    {isSyncingServer ? 'Syncing Server...' : 'Packaging Stream...'}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50">
                <Radio className="w-3 h-3 animate-pulse" />
                <span>
                  {qrMode === 'lan-java' ? 'Local Wi-Fi Socket' : 'Real Mobile Scan Ready'}
                </span>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">
                {qrMode === 'mobile-web' 
                  ? 'Opens on iPhone / Android' 
                  : qrMode === 'mobile-direct'
                  ? 'Auto-Downloads ZIP'
                  : 'Desktop Java Server'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Endpoint URL Display with Copy & Test Link */}
      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs font-mono">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
          <span className="flex items-center gap-1.5">
            <span>QR Encoded Target:</span>
            {qrMode !== 'lan-java' && (
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/60">
                Public Mobile Link
              </span>
            )}
          </span>
          <button
            onClick={handleOpenLinkInTab}
            disabled={files.length === 0}
            className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
            title="Open and test this mobile link in a new browser tab"
          >
            <span>Test in Tab</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
        <div className="flex items-center justify-between gap-2 bg-slate-900/80 px-2.5 py-1.5 rounded border border-slate-800">
          <span className="text-emerald-400 truncate select-all text-[11px]">
            {files.length > 0 ? targetUrl : 'http://[staging-required]'}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleCopyUrl}
              disabled={files.length === 0}
              className="p-1 text-slate-400 hover:text-white transition rounded hover:bg-slate-800"
              title="Copy Target URL"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <button
          id="btn-direct-download-zip"
          onClick={onDownloadDirectZip}
          disabled={files.length === 0 || isPackaging}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-semibold text-xs rounded-lg transition shadow-sm font-mono truncate"
          title={
            isSingleFileMode
              ? `Download '${files[0].name}' directly as original file (no .zip conversion)`
              : targetedFile
              ? `Download '${targetedFile.name}' directly`
              : 'Download the watermarked ZIP archive'
          }
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            {isSingleFileMode
              ? `Download ${files[0].name}`
              : targetedFile
              ? `Download ${targetedFile.name}`
              : 'Download ZIP Now'}
          </span>
        </button>

        <button
          id="btn-open-mobile-simulator"
          onClick={onOpenMobileSimulator}
          disabled={files.length === 0}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 text-slate-200 hover:text-white text-xs rounded-lg border border-slate-700 transition font-mono"
          title="Preview the exact mobile phone receiver screen"
        >
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span>Mobile Phone View</span>
        </button>
      </div>
    </div>
  );
};
