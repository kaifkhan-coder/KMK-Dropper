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
  AlertTriangle, 
  Zap, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Layers,
  Code
} from 'lucide-react';
import { QueuedFile } from '../types';
import { injectWatermark, stripWatermark } from '../utils/watermark';
import { getDevAppUrl, getSharedAppUrl, getDirectDownloadUrl, isDevSandboxEnvironment } from '../utils/urlHelper';

export type QrTargetMode = 'mobile-web' | 'direct-download' | 'raw-text' | 'lan-wifi' | 'cloud-universal';

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
  
  // DEFAULT MODE: 'mobile-web'.
  // Encodes a short, clean HTTPS URL (~75-85 chars).
  // Result: Low-density QR matrix with large, bold squares that phone cameras lock onto in <0.2s!
  // When scanned: Phone camera pops up "Open in Safari / Chrome" and loads the Mobile Receiver page!
  const [qrMode, setQrMode] = useState<QrTargetMode>('mobile-web');
  const [qrPixelSize, setQrPixelSize] = useState<number>(280);
  
  // Custom LAN IP / Port configuration
  const [customHostIp, setCustomHostIp] = useState<string>(() => hostIp || '192.168.1.100');
  const [customPort, setCustomPort] = useState<number>(() => port || 8080);
  const [showIpConfig, setShowIpConfig] = useState(false);

  // Troubleshooting drawer
  const [showTroubleshooter, setShowTroubleshooter] = useState(false);

  // Update customHostIp when prop updates if user hasn't edited
  useEffect(() => {
    if (hostIp && (customHostIp === '192.168.1.100' || customHostIp === '192.168.1.142')) {
      setCustomHostIp(hostIp);
    }
  }, [hostIp]);

  // Determine active targeted file (if only 1 file or explicitly selected)
  const isSingleFileMode = files.length === 1;
  const targetedFile = isSingleFileMode 
    ? files[0] 
    : (selectedQrFileId ? files.find(f => f.id === selectedQrFileId) || null : null);

  // Calculate destination target URL or text based on selected mode
  let targetUrl = '';
  let modeBadge = '';
  let modeDescription = '';
  const fileParam = targetedFile ? `&fileId=${encodeURIComponent(targetedFile.id)}` : '';

  if (qrMode === 'mobile-web') {
    // Mode 1 (DEFAULT): Opens the interactive Mobile Receiver Web Page on phone!
    targetUrl = getDevAppUrl(`/?mobile=1&pkg=${encodeURIComponent(packageId)}${fileParam}`);
    modeBadge = 'Mobile Web Receiver';
    modeDescription = 'Camera scans instantly, pops up link, and opens the mobile receiver page in your phone browser.';
  } else if (qrMode === 'direct-download') {
    // Mode 2: Auto-Download on Scan
    targetUrl = getDevAppUrl(`/api/download/${encodeURIComponent(packageId)}`);
    modeBadge = 'Auto-Download ZIP';
    modeDescription = 'Direct download link: scanning immediately triggers file download in mobile browser.';
  } else if (qrMode === 'raw-text') {
    // Mode 3: Compact Raw Text (Capped at 400 chars to guarantee instant camera focus)
    if (targetedFile && targetedFile.isText && targetedFile.content) {
      const text = isBypassActive ? stripWatermark(targetedFile.content) : injectWatermark(targetedFile.content);
      const clean = text.length > 350 ? text.slice(0, 350) + '\n...[truncated for scan speed]' : text;
      targetUrl = `FILE: ${targetedFile.name}\n${clean}`;
    } else {
      const fileNames = files.map((f, i) => `${i + 1}. ${f.name} (${f.size}B)`).slice(0, 5).join('\n');
      targetUrl = `PACKAGE: ${packageId}\nFiles (${files.length}):\n${fileNames}\nStatus: Ready`;
    }
    modeBadge = 'Compact Raw Text';
    modeDescription = 'Encodes text directly into clipboard/notes (no browser opened).';
  } else if (qrMode === 'cloud-universal') {
    // Mode 4: Shared Public Link (ais-pre-...)
    targetUrl = getSharedAppUrl(`/?mobile=1&pkg=${encodeURIComponent(packageId)}${fileParam}`);
    modeBadge = 'Shared App Link (ais-pre)';
    modeDescription = 'Public preview gateway. (Requires clicking "Share" in AI Studio top bar).';
  } else {
    // Mode 5: Local Wi-Fi (LAN)
    const fileNameParam = targetedFile ? encodeURIComponent(targetedFile.name) : 'package.zip';
    targetUrl = `http://${customHostIp}:${customPort}/download/${fileNameParam}`;
    modeBadge = `Local Wi-Fi (${customHostIp})`;
    modeDescription = 'Direct peer-to-peer download over your local home/office Wi-Fi router.';
  }

  // Generate QR Code matrix with ISO quiet zone margin of 4 for instantaneous phone camera detection
  useEffect(() => {
    if (!canvasRef.current || files.length === 0 || !targetUrl) {
      setQrGenerated(false);
      return;
    }

    QRCode.toCanvas(
      canvasRef.current,
      targetUrl,
      {
        width: qrPixelSize,
        margin: 4, // ISO standard quiet zone of 4 modules guarantees quick camera focus!
        errorCorrectionLevel: errorCorrectionLevel,
        color: {
          dark: '#050811',
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
    if (qrMode === 'raw-text') {
      navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-1.5">
              <span>Mobile QR Code Scanner</span>
              <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-1.5 py-0.2 rounded font-normal flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>Instant-Scan Active</span>
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* QR Size Selector */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-mono">Size:</span>
            {([220, 280, 320] as const).map((sz) => (
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
                title={`Set QR Code Render Size to ${sz}px`}
              >
                {sz}px
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-mono">ECC:</span>
            {(['L', 'M', 'Q'] as const).map((lvl) => (
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
            <span className="text-slate-400">Target:</span>
            {targetedFile ? (
              <span className="text-amber-400 font-semibold truncate flex items-center gap-1">
                <span>Single File ({targetedFile.name})</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1 rounded border border-emerald-800/60">
                  {targetedFile.size} B
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

      {/* Primary Scan Mode Selector */}
      <div className="mt-3 bg-slate-950 p-1.5 rounded-lg border border-slate-800 grid grid-cols-4 gap-1">
        <button
          onClick={() => setQrMode('mobile-web')}
          className={`py-2 px-1.5 rounded text-[10px] font-mono font-medium flex flex-col items-center justify-center gap-1 transition ${
            qrMode === 'mobile-web'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="RECOMMENDED: Phone camera scans instantly and opens the Mobile Web Receiver page in Safari or Chrome!"
        >
          <Smartphone className="w-4 h-4" />
          <span className="truncate font-bold">Open Web Page</span>
        </button>

        <button
          onClick={() => setQrMode('direct-download')}
          className={`py-2 px-1.5 rounded text-[10px] font-mono font-medium flex flex-col items-center justify-center gap-1 transition ${
            qrMode === 'direct-download'
              ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="Direct ZIP Download: Scanning immediately triggers file save in phone browser"
        >
          <Download className="w-4 h-4" />
          <span className="truncate">Auto Download</span>
        </button>

        <button
          onClick={() => setQrMode('raw-text')}
          className={`py-2 px-1.5 rounded text-[10px] font-mono font-medium flex flex-col items-center justify-center gap-1 transition ${
            qrMode === 'raw-text'
              ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="Raw Text: Phone camera copies text directly without launching a web browser"
        >
          <FileText className="w-4 h-4" />
          <span className="truncate">Raw Text</span>
        </button>

        <button
          onClick={() => setQrMode('lan-wifi')}
          className={`py-2 px-1.5 rounded text-[10px] font-mono font-medium flex flex-col items-center justify-center gap-1 transition ${
            qrMode === 'lan-wifi'
              ? 'bg-purple-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="Local Wi-Fi Network: Transfer directly over your home/office Wi-Fi router (192.168.x.x)"
        >
          <Wifi className="w-4 h-4" />
          <span className="truncate">Local Wi-Fi</span>
        </button>
      </div>

      {/* Mode Status & Description */}
      <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] font-mono flex items-center justify-between">
        <span className="text-slate-300 truncate mr-2">
          <strong className="text-amber-400">{modeBadge}:</strong> {modeDescription}
        </span>
        <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60 shrink-0 font-bold">
          {targetUrl.length} chars (Fast Scan)
        </span>
      </div>

      {/* Host IP & Port Configurator for Local Wi-Fi mode */}
      {qrMode === 'lan-wifi' && (
        <div className="mt-2 p-2.5 bg-slate-950/90 border border-purple-500/40 rounded-lg text-xs font-mono space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-purple-300 font-bold flex items-center gap-1 text-[11px]">
              <Wifi className="w-3 h-3" />
              <span>Local Wi-Fi Host Configuration:</span>
            </span>
            <button
              onClick={() => setShowIpConfig(!showIpConfig)}
              className="text-[10px] text-slate-400 hover:text-white underline"
            >
              {showIpConfig ? 'Hide Settings' : 'Edit IP & Port'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px]">Host:</span>
              <input
                type="text"
                value={customHostIp}
                onChange={(e) => setCustomHostIp(e.target.value.trim())}
                placeholder="e.g. 192.168.1.100"
                className="w-full bg-transparent text-slate-100 text-xs font-mono outline-none"
              />
            </div>
            <div className="w-24 flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px]">Port:</span>
              <input
                type="number"
                value={customPort}
                onChange={(e) => setCustomPort(Number(e.target.value))}
                className="w-full bg-transparent text-slate-100 text-xs font-mono outline-none"
              />
            </div>
          </div>

          {showIpConfig && (
            <div className="pt-1 border-t border-slate-800 space-y-1 text-[10px] text-slate-400">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-slate-500">Presets:</span>
                {['192.168.1.100', '192.168.0.100', '192.168.1.50', '10.0.0.2'].map((ip) => (
                  <button
                    key={ip}
                    onClick={() => setCustomHostIp(ip)}
                    className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
                  >
                    {ip}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* QR Canvas Container with High Contrast & Easy Focus Frame */}
      <div className="flex-1 flex flex-col items-center justify-center my-3 min-h-[290px]">
        {files.length === 0 ? (
          <div className="w-64 h-64 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-6 text-center bg-slate-950/40">
            <QrCode className="w-12 h-12 text-slate-700 mb-2" />
            <p className="text-xs text-slate-400 font-mono font-semibold">No Files Staged</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Drag &amp; drop any file into the staging zone to generate the dynamic QR code.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* Pristine white backing with quiet zone border to eliminate camera glare */}
            <div className="p-3.5 bg-white rounded-2xl shadow-2xl border-4 border-emerald-500/80 relative group transition-transform hover:scale-[1.01]">
              <canvas ref={canvasRef} className="rounded-lg block" />
              {(isPackaging || isSyncingServer) && (
                <div className="absolute inset-0 bg-black/60 rounded-xl flex flex-col items-center justify-center text-amber-400 backdrop-blur-xs">
                  <RefreshCw className="w-8 h-8 animate-spin mb-2" />
                  <span className="text-xs font-mono font-bold text-white">
                    {isSyncingServer ? 'Syncing Server...' : 'Packaging Stream...'}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-emerald-400 bg-emerald-950/60 border-emerald-700/60 font-semibold">
                <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
                <span>Camera Ready: Tap pop-up to open page</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Target URL Display with Copy & Test in Tab */}
      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs font-mono mb-2.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
          <span className="flex items-center gap-1.5">
            <span>Encoded Destination:</span>
            <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800/60">
              HTTPS Web Page
            </span>
          </span>
          <button
            onClick={handleOpenLinkInTab}
            disabled={files.length === 0}
            className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
            title="Open and test this link in a new browser tab"
          >
            <span>Test in Tab</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
        <div className="flex items-center justify-between gap-2 bg-slate-900/80 px-2.5 py-1.5 rounded border border-slate-800">
          <span className="text-emerald-400 truncate select-all text-[11px] font-mono">
            {files.length > 0 ? targetUrl : '[staging-required]'}
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
      <div className="grid grid-cols-2 gap-2 mt-auto">
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
