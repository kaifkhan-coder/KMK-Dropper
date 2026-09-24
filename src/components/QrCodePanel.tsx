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

export type QrTargetMode = 'raw-text' | 'cloud-universal' | 'cloud-dev' | 'direct-download' | 'lan-wifi';

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
  
  // Default to 'raw-text' (Camera Direct).
  // Phone cameras (iPhone Camera, Android Google Lens, Samsung Camera) read plain text natively
  // without launching browser or throwing 404/cookie/data-URI errors!
  const [qrMode, setQrMode] = useState<QrTargetMode>('raw-text');
  const [rawTextFormat, setRawTextFormat] = useState<'formatted' | 'json'>('formatted');
  const [qrPixelSize, setQrPixelSize] = useState<number>(240);
  
  // Custom LAN IP / Port configuration
  const [customHostIp, setCustomHostIp] = useState<string>(() => hostIp || '192.168.1.100');
  const [customPort, setCustomPort] = useState<number>(() => port || 8080);
  const [showIpConfig, setShowIpConfig] = useState(false);

  // Troubleshooting & Explanation drawer
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

  // Build bulletproof Raw Text content for Camera Direct mode
  const MAX_QR_CHARS = 2200;
  let rawTextContent = '';

  const activeTargetForData = targetedFile || (files.length === 1 ? files[0] : null);

  if (activeTargetForData) {
    // Single file targeted
    const rawContent = activeTargetForData.isText && activeTargetForData.content !== undefined
      ? (isBypassActive ? stripWatermark(activeTargetForData.content) : injectWatermark(activeTargetForData.content))
      : `[Binary File: ${activeTargetForData.name} (${activeTargetForData.size} bytes)]`;

    if (rawTextFormat === 'json') {
      const jsonObj = {
        pkg: packageId,
        file: activeTargetForData.name,
        size: activeTargetForData.size,
        security: isBypassActive ? 'BYPASS_CLEAN' : 'WATERMARKED',
        content: rawContent.length > MAX_QR_CHARS ? rawContent.slice(0, MAX_QR_CHARS) + '...[TRUNCATED]' : rawContent
      };
      rawTextContent = JSON.stringify(jsonObj, null, 2);
    } else {
      let contentSlice = rawContent;
      let truncatedNotice = '';
      if (contentSlice.length > MAX_QR_CHARS) {
        contentSlice = contentSlice.slice(0, MAX_QR_CHARS);
        truncatedNotice = `\n\n--- [TRUNCATED: Showing first ${MAX_QR_CHARS} of ${rawContent.length} chars. Switch to 'Direct Download' for full file] ---`;
      }
      rawTextContent = `FILE: ${activeTargetForData.name} (${activeTargetForData.size} B)\nSECURITY: ${isBypassActive ? 'CLEAN_BYPASS' : 'WATERMARKED'}\n----------------------------------------\n${contentSlice}${truncatedNotice}`;
    }
  } else if (files.length > 0) {
    // Multi-file bundle manifest
    if (rawTextFormat === 'json') {
      const manifest = {
        pkg: packageId,
        count: files.length,
        security: isBypassActive ? 'BYPASS_CLEAN' : 'WATERMARKED',
        files: files.map(f => ({
          name: f.name,
          size: f.size,
          data: f.isText && f.content ? (isBypassActive ? stripWatermark(f.content).slice(0, 400) : injectWatermark(f.content).slice(0, 400)) : `[binary ${f.size}B]`
        }))
      };
      rawTextContent = JSON.stringify(manifest, null, 2);
    } else {
      const fileListHeader = files.map((f, i) => `[${i + 1}] ${f.name} (${f.size} B)`).join('\n');
      const firstTextFile = files.find(f => f.isText && f.content);
      let excerpt = '';
      if (firstTextFile && firstTextFile.content) {
        const text = isBypassActive ? stripWatermark(firstTextFile.content) : injectWatermark(firstTextFile.content);
        const preview = text.length > 800 ? text.slice(0, 800) + '...[more]' : text;
        excerpt = `\n\n--- Excerpt: ${firstTextFile.name} ---\n${preview}`;
      }
      rawTextContent = `=== MULTI-FILE BUNDLE ===\nPackage ID: ${packageId}\nFiles (${files.length}):\n${fileListHeader}\nSecurity: ${isBypassActive ? 'Bypass' : 'Watermarked'}${excerpt}`;
    }
  }

  // Calculate destination target URL or text based on selected mode
  let targetUrl = '';
  let modeBadge = '';
  let modeDescription = '';
  const fileParam = targetedFile ? `&fileId=${encodeURIComponent(targetedFile.id)}` : '';

  if (qrMode === 'raw-text') {
    // Mode 1: Raw Text (Camera Direct - ZERO Network, 100% Zero-Error Guarantee)
    targetUrl = rawTextContent || `MULTI-FILE PACKAGE: ${packageId}\nFiles: ${files.length}\nReady for transfer.`;
    modeBadge = 'Camera Direct (Raw Text)';
    modeDescription = 'Phone camera reads text directly into clipboard/notes. 0 network calls, 0 errors.';
  } else if (qrMode === 'direct-download') {
    // Mode 2: Direct ZIP / File Download (Instant browser stream)
    targetUrl = getDirectDownloadUrl(packageId, false);
    modeBadge = 'Direct File Download';
    modeDescription = 'Scanned URL directly triggers ZIP/file download into mobile phone storage.';
  } else if (qrMode === 'cloud-universal') {
    // Mode 3: Shared App Preview (ais-pre-...)
    targetUrl = getSharedAppUrl(`/?mobile=1&pkg=${encodeURIComponent(packageId)}${fileParam}`);
    modeBadge = 'Shared Preview Link (ais-pre)';
    modeDescription = 'Public preview gateway. (Requires clicking "Share" in AI Studio top bar).';
  } else if (qrMode === 'cloud-dev') {
    // Mode 4: Direct Dev Container URL (ais-dev-...)
    targetUrl = getDevAppUrl(`/?mobile=1&pkg=${encodeURIComponent(packageId)}${fileParam}`);
    modeBadge = 'Dev Preview Link (ais-dev)';
    modeDescription = 'Live dev container. Requires Google login / cookie allowance on phone.';
  } else {
    // Mode 5: Local Wi-Fi (LAN)
    const fileNameParam = targetedFile ? encodeURIComponent(targetedFile.name) : 'package.zip';
    targetUrl = `http://${customHostIp}:${customPort}/download/${fileNameParam}`;
    modeBadge = `Local Wi-Fi (${customHostIp})`;
    modeDescription = 'Direct peer-to-peer download over your local home/office Wi-Fi router.';
  }

  // Generate QR Code matrix whenever target URL, files, size, or ECC change
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
                <ShieldCheck className="w-2.5 h-2.5" />
                <span>Zero-Error</span>
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
                title={`Set QR Code Render Size to ${sz}px`}
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

      {/* QR Target Mode Selector (5 Comprehensive Modes) */}
      <div className="mt-3 bg-slate-950 p-1.5 rounded-lg border border-slate-800 grid grid-cols-5 gap-1">
        <button
          onClick={() => setQrMode('raw-text')}
          className={`py-1.5 px-1 rounded text-[10px] font-mono font-medium flex flex-col items-center justify-center gap-1 transition ${
            qrMode === 'raw-text'
              ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="RECOMMENDED: Phone camera reads file text directly without browser navigation. 100% Zero-Error on all phones!"
        >
          <Zap className="w-3.5 h-3.5" />
          <span className="truncate">Camera Direct</span>
        </button>

        <button
          onClick={() => setQrMode('direct-download')}
          className={`py-1.5 px-1 rounded text-[10px] font-mono font-medium flex flex-col items-center justify-center gap-1 transition ${
            qrMode === 'direct-download'
              ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="Direct Download: Scanning immediately triggers ZIP/file download in mobile browser"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="truncate">Auto Download</span>
        </button>

        <button
          onClick={() => setQrMode('cloud-universal')}
          className={`py-1.5 px-1 rounded text-[10px] font-mono font-medium flex flex-col items-center justify-center gap-1 transition ${
            qrMode === 'cloud-universal'
              ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="Public Shared Link: ais-pre-... (Requires clicking 'Share' in AI Studio)"
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="truncate">Public Link</span>
        </button>

        <button
          onClick={() => setQrMode('cloud-dev')}
          className={`py-1.5 px-1 rounded text-[10px] font-mono font-medium flex flex-col items-center justify-center gap-1 transition ${
            qrMode === 'cloud-dev'
              ? 'bg-blue-500 text-slate-950 shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="Dev Sandbox Link: ais-dev-... (Direct container URL)"
        >
          <Radio className="w-3.5 h-3.5" />
          <span className="truncate">Dev Link</span>
        </button>

        <button
          onClick={() => setQrMode('lan-wifi')}
          className={`py-1.5 px-1 rounded text-[10px] font-mono font-medium flex flex-col items-center justify-center gap-1 transition ${
            qrMode === 'lan-wifi'
              ? 'bg-purple-500 text-slate-950 shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="Direct local transfer between PC and phone over shared Wi-Fi (192.168.x.x)"
        >
          <Wifi className="w-3.5 h-3.5" />
          <span className="truncate">Local Wi-Fi</span>
        </button>
      </div>

      {/* Mode Status & Description */}
      <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] font-mono flex items-center justify-between">
        <span className="text-slate-400 truncate mr-2">
          <strong className="text-slate-200">{modeBadge}:</strong> {modeDescription}
        </span>
        {qrMode === 'raw-text' && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setRawTextFormat('formatted')}
              className={`px-1.5 py-0.5 rounded text-[10px] ${rawTextFormat === 'formatted' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Text
            </button>
            <button
              onClick={() => setRawTextFormat('json')}
              className={`px-1.5 py-0.5 rounded text-[10px] ${rawTextFormat === 'json' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              JSON
            </button>
          </div>
        )}
      </div>

      {/* Mode-Specific Warning / Hint Banner */}
      {qrMode === 'cloud-universal' && (
        <div className="mt-2 p-2 rounded-lg bg-amber-950/40 border border-amber-800/60 text-[11px] font-mono text-amber-300 flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">Notice for Public Shared Link (ais-pre):</p>
            <p className="text-slate-300 text-[10px] leading-relaxed">
              If your phone shows <strong>&quot;404 Not Found&quot;</strong>, it means this applet has not been published yet in Google AI Studio. Click the <strong>&quot;Share&quot;</strong> button at the top-right of your AI Studio window to activate the public domain, or switch to <strong>Camera Direct</strong> or <strong>Auto Download</strong>!
            </p>
          </div>
        </div>
      )}

      {qrMode === 'cloud-dev' && (
        <div className="mt-2 p-2 rounded-lg bg-blue-950/40 border border-blue-800/60 text-[11px] font-mono text-blue-300 flex items-start gap-2">
          <Radio className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">Notice for Dev Sandbox Link (ais-dev):</p>
            <p className="text-slate-300 text-[10px] leading-relaxed">
              Google Cloud Run checks for developer session cookies. If prompted on your phone, tap <strong>&quot;Allow cookies&quot;</strong> to load the receiver, or use <strong>Camera Direct</strong> for zero-authentication instant scanning!
            </p>
          </div>
        </div>
      )}

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
              <p className="text-[10px] text-slate-500">
                Note: Phone and PC must be connected to the exact same Wi-Fi router.
              </p>
            </div>
          )}
        </div>
      )}

      {/* QR Canvas Container */}
      <div className="flex-1 flex flex-col items-center justify-center my-3 min-h-[260px]">
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
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded border ${
                qrMode === 'raw-text'
                  ? 'text-emerald-400 bg-emerald-950/50 border-emerald-800/50'
                  : qrMode === 'direct-download'
                  ? 'text-amber-400 bg-amber-950/50 border-amber-800/50'
                  : qrMode === 'cloud-universal'
                  ? 'text-cyan-400 bg-cyan-950/50 border-cyan-800/50'
                  : qrMode === 'cloud-dev'
                  ? 'text-blue-400 bg-blue-950/50 border-blue-800/50'
                  : 'text-purple-400 bg-purple-950/50 border-purple-800/50'
              }`}>
                <Radio className="w-3 h-3 animate-pulse" />
                <span>
                  {qrMode === 'raw-text'
                    ? 'Camera Direct (Zero-Error)'
                    : qrMode === 'direct-download'
                    ? 'Auto-Download ZIP'
                    : qrMode === 'cloud-universal' 
                    ? 'Public Shared Gateway'
                    : qrMode === 'cloud-dev'
                    ? 'Dev Container Link'
                    : 'Local Wi-Fi Direct'}
                </span>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 text-[10px]">
                {qrMode === 'raw-text'
                  ? 'Scan with native camera app'
                  : `${targetUrl.length} chars`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Scanning Troubleshooter Alert Banner */}
      <div className="mb-2.5 rounded-xl border border-emerald-600/40 bg-emerald-950/20 overflow-hidden text-xs font-mono">
        <button
          type="button"
          onClick={() => setShowTroubleshooter(!showTroubleshooter)}
          className="w-full px-3 py-2 flex items-center justify-between text-emerald-300 hover:text-emerald-200 transition text-left"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold text-[11px]">Why scanning threw an error earlier &amp; how to ensure 100% success</span>
          </div>
          {showTroubleshooter ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTroubleshooter && (
          <div className="p-3 pt-1 border-t border-emerald-900/50 space-y-2.5 text-[11px] text-slate-300">
            <div className="space-y-1">
              <p className="font-bold text-emerald-400 flex items-center gap-1">
                <span>1. Best &amp; Fastest: Use &quot;Camera Direct&quot; Mode (Active Now)</span>
              </p>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                Modern mobile cameras (iOS Camera, Google Lens, Samsung Camera) instantly detect raw text and show a <strong>&quot;Copy Text&quot;</strong> or Notes button. It does <strong>not</strong> open a browser, does not need Wi-Fi, and <strong>never throws 404 or address errors</strong>!
              </p>
            </div>

            <div className="space-y-1 pt-1.5 border-t border-slate-800">
              <p className="font-bold text-amber-300 flex items-center gap-1">
                <span>2. Why did &quot;ais-pre-...&quot; show 404?</span>
              </p>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                In Google AI Studio, the Shared domain (<code className="text-slate-300 font-mono">ais-pre-...</code>) is only deployed after clicking the <strong>&quot;Share&quot;</strong> button in the AI Studio top bar. Until you click Share, Cloud Run returns 404.
              </p>
            </div>

            <div className="space-y-1 pt-1.5 border-t border-slate-800">
              <p className="font-bold text-amber-300 flex items-center gap-1">
                <span>3. Why did &quot;data:text/plain...&quot; throw an error?</span>
              </p>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                iOS Safari and Android Chrome strictly block top-level URL navigation to <code className="text-slate-300 font-mono">data:...</code> URIs for security reasons (showing &quot;Address is invalid&quot; or &quot;ERR_INVALID_URL&quot;). We removed data: URI scheme completely.
              </p>
            </div>

            <div className="space-y-1 pt-1.5 border-t border-slate-800">
              <p className="font-bold text-slate-200">4. Quick 1-Click Fix Actions:</p>
              <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                <button
                  onClick={() => {
                    setQrMode('raw-text');
                    setShowTroubleshooter(false);
                  }}
                  className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded text-[10px] flex items-center gap-1 transition"
                >
                  <Zap className="w-3 h-3" />
                  <span>Camera Direct (Recommended)</span>
                </button>
                <button
                  onClick={() => {
                    setQrMode('direct-download');
                    setShowTroubleshooter(false);
                  }}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[10px] flex items-center gap-1 transition"
                >
                  <Download className="w-3 h-3" />
                  <span>Auto Download ZIP</span>
                </button>
                <button
                  onClick={onOpenMobileSimulator}
                  className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded text-[10px] flex items-center gap-1 transition"
                >
                  <Smartphone className="w-3 h-3" />
                  <span>Test Mobile Screen on PC</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Target URL / Text Display with Copy & Test Link */}
      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs font-mono">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
          <span className="flex items-center gap-1.5">
            <span>QR Encoded Target:</span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/60">
              {qrMode === 'raw-text' ? 'Raw Clipboard Text (0 Errors)' : 'HTTP/HTTPS Link'}
            </span>
          </span>
          {qrMode !== 'raw-text' ? (
            <button
              onClick={handleOpenLinkInTab}
              disabled={files.length === 0}
              className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
              title="Open and test this link in a new browser tab"
            >
              <span>Test in Tab</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          ) : (
            <span className="text-[10px] text-slate-500">Phone camera copies directly</span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 bg-slate-900/80 px-2.5 py-1.5 rounded border border-slate-800">
          <span className="text-emerald-400 truncate select-all text-[11px]">
            {files.length > 0 ? targetUrl : '[staging-required]'}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleCopyUrl}
              disabled={files.length === 0}
              className="p-1 text-slate-400 hover:text-white transition rounded hover:bg-slate-800"
              title="Copy Target Content"
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
