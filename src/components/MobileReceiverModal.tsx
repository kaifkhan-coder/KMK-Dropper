import React, { useState } from 'react';
import { X, Smartphone, Download, Wifi, ShieldCheck, FileArchive, CheckCircle2, RefreshCw, ExternalLink, Copy, Check } from 'lucide-react';
import { QueuedFile } from '../types';
import { getPublicUniversalUrl } from '../utils/urlHelper';

interface MobileReceiverModalProps {
  files: QueuedFile[];
  hostIp: string;
  port: number;
  isBypassActive: boolean;
  packageId?: string;
  selectedQrFileId?: string | null;
  onClose: () => void;
  onDownloadZip: () => void;
  onDownloadSingleFile?: (file: QueuedFile) => void;
  isPackaging: boolean;
}

export const MobileReceiverModal: React.FC<MobileReceiverModalProps> = ({
  files,
  hostIp,
  port,
  isBypassActive,
  packageId = 'latest',
  selectedQrFileId,
  onClose,
  onDownloadZip,
  onDownloadSingleFile,
  isPackaging
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isSingleFileMode = files.length === 1 || Boolean(selectedQrFileId);
  const targetedFile = isSingleFileMode
    ? (selectedQrFileId ? files.find((f) => f.id === selectedQrFileId) : files[0]) || files[0]
    : null;

  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);

  const fileParam = targetedFile ? `&fileId=${encodeURIComponent(targetedFile.id)}` : '';
  const mobileWebUrl = getPublicUniversalUrl(`/?mobile=1&pkg=${encodeURIComponent(packageId)}${fileParam}`);

  const handleDownload = () => {
    onDownloadZip();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const handleCopyMobileLink = () => {
    navigator.clipboard.writeText(mobileWebUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleOpenMobileTab = () => {
    window.open(mobileWebUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        {/* Smartphone Notch & Status Bar */}
        <div className="bg-black px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none">
          <span>09:41</span>
          <div className="w-20 h-4 bg-slate-900 rounded-full flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Wifi className="w-3 h-3" />
            <span>5G</span>
          </div>
        </div>

        {/* Mobile Header Bar */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-amber-500/20 text-amber-400 rounded-md">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="text-xs font-mono font-bold text-slate-100">
              Mobile Receiver View
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Screen Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950/60 font-sans text-xs">
          {/* Connection Status Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Mobile Scan Gateway Active</span>
              </span>
              <span className="text-[10px] text-slate-500">Cloud & LAN</span>
            </div>
            <div className="text-slate-300 font-mono text-[10px] mt-1.5 truncate bg-slate-950 px-2 py-1 rounded border border-slate-800 flex items-center justify-between">
              <span className="truncate mr-2">{mobileWebUrl}</span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleCopyMobileLink}
                  className="text-slate-400 hover:text-white p-0.5"
                  title="Copy real mobile scan link"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
                <button
                  onClick={handleOpenMobileTab}
                  className="text-amber-400 hover:text-amber-300 p-0.5"
                  title="Open live mobile view in new tab"
                >
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Package Overview */}
          <div className="text-center py-1.5">
            <div className="w-14 h-14 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400 mx-auto mb-2 shadow-inner">
              <FileArchive className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">
              Student Lab Package Archive
            </h3>
            <p className="text-slate-400 font-mono text-[11px] mt-0.5">
              {files.length} Files Ready • ~{(totalBytes / 1024).toFixed(1)} KB Uncompressed
            </p>
          </div>

          {/* Security Verification Banner */}
          <div className={`p-3 rounded-xl border text-xs font-mono flex items-start gap-2 ${
            isBypassActive
              ? 'bg-emerald-950/50 border-emerald-700/60 text-emerald-300'
              : 'bg-amber-950/50 border-amber-700/60 text-amber-300'
          }`}>
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">
                {isBypassActive ? 'Clean Bypass Verified' : 'Khan Kaif STP Secured'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {isBypassActive
                  ? 'Watermark removed via coupon code ("KaifGive20@"). Original clean files served.'
                  : 'Watermark "BuildWithKMKaif" included on files.'}
              </div>
            </div>
          </div>

          {/* Staged Files List */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/80 divide-y divide-slate-800/80">
            <div className="px-3 py-2 bg-slate-900 text-[11px] font-mono text-slate-400 font-semibold uppercase">
              Archive Contents ({files.length})
            </div>
            {files.map((file) => (
              <div key={file.id} className="p-2.5 flex items-center justify-between text-[11px] font-mono">
                <div className="truncate mr-2">
                  <div className="text-slate-200 truncate">{file.name}</div>
                  <div className="text-[10px] text-slate-500">
                    {file.isText ? 'Text Stream' : 'Binary Asset'} • {file.size} B
                  </div>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded border shrink-0 ${
                  isBypassActive
                    ? 'text-emerald-400 border-emerald-800/60 bg-emerald-950/40'
                    : 'text-amber-400 border-amber-800/60 bg-amber-950/40'
                }`}>
                  {isBypassActive ? 'CLEAN' : 'WATERMARKED'}
                </span>
              </div>
            ))}
          </div>

          {/* Download Action Button */}
          <div className="pt-1">
            <button
              onClick={handleDownload}
              disabled={isPackaging || files.length === 0}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg flex items-center justify-center gap-2 font-mono truncate px-3"
            >
              {isPackaging ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Packaging Stream...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Downloaded Successfully!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 shrink-0" />
                  <span className="truncate">
                    {isSingleFileMode && targetedFile
                      ? `Download ${targetedFile.name}`
                      : 'Download ZIP Package Now'}
                  </span>
                </>
              )}
            </button>
            <div className="text-center mt-2 flex items-center justify-center gap-2">
              <button
                onClick={handleOpenMobileTab}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-mono inline-flex items-center gap-1"
              >
                <span>Open in Full Mobile Window</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
