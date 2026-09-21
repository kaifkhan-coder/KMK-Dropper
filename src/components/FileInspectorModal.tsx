import React, { useState } from 'react';
import { X, ShieldCheck, ShieldAlert, FileText, Check, Copy } from 'lucide-react';
import { QueuedFile } from '../types';
import { WATERMARK_BANNER, injectWatermark, stripWatermark } from '../utils/watermark';

interface FileInspectorModalProps {
  file: QueuedFile | null;
  isBypassActive: boolean;
  onClose: () => void;
}

export const FileInspectorModal: React.FC<FileInspectorModalProps> = ({
  file,
  isBypassActive,
  onClose
}) => {
  const [viewMode, setViewMode] = useState<'streamed' | 'raw'>('streamed');
  const [copied, setCopied] = useState(false);

  if (!file) return null;

  const rawContent = file.content || '';
  const finalStreamedContent = isBypassActive
    ? stripWatermark(rawContent)
    : injectWatermark(rawContent);

  const displayedContent = viewMode === 'streamed' ? finalStreamedContent : rawContent;

  const handleCopy = () => {
    navigator.clipboard.writeText(displayedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-amber-400" />
            <div>
              <span className="font-bold text-slate-100">{file.name}</span>
              <span className="text-slate-500 ml-2">({file.size} bytes)</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded border text-[11px] ${
              isBypassActive
                ? 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300'
                : 'bg-amber-950/70 border-amber-700/60 text-amber-300'
            }`}>
              {isBypassActive ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
              <span>{isBypassActive ? 'Bypass Active: Clean Export' : 'Watermark Injected'}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Toggle Bar & Watermark Explanation */}
        <div className="px-5 py-2.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('streamed')}
              className={`px-3 py-1 rounded transition ${
                viewMode === 'streamed'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Compressed Output Stream View
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-3 py-1 rounded transition ${
                viewMode === 'raw'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Original Source View
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-xs transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Content'}</span>
          </button>
        </div>

        {/* Inspection Notice Box */}
        {!isBypassActive && viewMode === 'streamed' && (
          <div className="px-5 py-2 bg-amber-950/30 border-b border-amber-800/40 text-[11px] font-mono text-amber-300/90 flex items-center gap-2">
            <span className="font-bold">Line 1 Injection:</span>
            <code className="bg-slate-950/80 px-2 py-0.5 rounded border border-amber-700/50 text-amber-300">
              {WATERMARK_BANNER}
            </code>
          </div>
        )}

        {isBypassActive && viewMode === 'streamed' && (
          <div className="px-5 py-2 bg-emerald-950/30 border-b border-emerald-800/40 text-[11px] font-mono text-emerald-300/90 flex items-center gap-2">
            <span className="font-bold">Bypass Mode Verified:</span>
            <span>All watermark banners have been stripped. Pure original file delivered to output channel.</span>
          </div>
        )}

        {/* Code Content Area */}
        <div className="flex-1 overflow-auto p-5 bg-slate-950 font-mono text-xs text-slate-200 leading-relaxed select-text">
          <pre className="whitespace-pre-wrap">{displayedContent}</pre>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-lg transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
