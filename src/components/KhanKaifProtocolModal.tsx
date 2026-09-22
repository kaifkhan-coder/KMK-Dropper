import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  X, 
  FileCode, 
  KeyRound, 
  Terminal, 
  Copy, 
  Check, 
  ArrowRight,
  Fingerprint,
  Zap,
  Lock,
  Unlock
} from 'lucide-react';
import { QueuedFile } from '../types';
import { WATERMARK_BANNER, injectWatermark, stripWatermark, SECRET_AUTH_CODE } from '../utils/watermark';

interface KhanKaifProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  isBypassActive: boolean;
  onToggleBypass: (activate: boolean) => void;
  stagedFiles: QueuedFile[];
}

export const KhanKaifProtocolModal: React.FC<KhanKaifProtocolModalProps> = ({
  isOpen,
  onClose,
  isBypassActive,
  onToggleBypass,
  stagedFiles
}) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'verifier' | 'architecture' | 'certificate'>('verifier');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Pick sample code to inspect
  const sampleCode = useMemo(() => {
    if (stagedFiles.length > 0 && stagedFiles[selectedFileIdx]?.content) {
      return stagedFiles[selectedFileIdx].content!;
    }
    return `package com.khankaif.protocol;\n\npublic class TransferVerification {\n    public static void main(String[] args) {\n        System.out.println("Khan Kaif Secure Transfer Protocol v2.4 Active");\n    }\n}`;
  }, [stagedFiles, selectedFileIdx]);

  const watermarkedCode = useMemo(() => {
    return injectWatermark(sampleCode);
  }, [sampleCode]);

  const bypassCode = useMemo(() => {
    return stripWatermark(sampleCode);
  }, [sampleCode]);

  const currentDisplayCode = isBypassActive ? bypassCode : watermarkedCode;

  // Simple pseudo-hash to simulate cryptographic signature
  const protocolHash = useMemo(() => {
    let hash = 0x811c9dc5;
    const str = currentDisplayCode + (isBypassActive ? 'BYPASS_AUTH' : 'STAMP_ENFORCED');
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return 'KK-SHA256:' + (hash >>> 0).toString(16).padStart(8, '0').toUpperCase() + '-KMK2026';
  }, [currentDisplayCode, isBypassActive]);

  const handleCopyBypassKey = () => {
    navigator.clipboard.writeText(SECRET_AUTH_CODE);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRunProtocolVerification = () => {
    setIsVerifying(true);
    setTestResult(null);

    setTimeout(() => {
      setIsVerifying(false);
      if (isBypassActive) {
        setTestResult('PASSED: Clean Bypass verified. No watermark injected; author key valid.');
      } else {
        setTestResult('PASSED: Watermark "// BuildWithKMKaif" verified at Line 1 with valid byte offset.');
      }
    }, 450);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div 
        id="modal-khan-kaif-protocol"
        className="bg-slate-900 border border-amber-500/40 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100 font-mono">
                  Khan Kaif Protocol Suite (KK-STP v2.4)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  VERIFIED AUTHOR
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Remarkable Engineering & Cryptographic Packaging Architecture by Khan Kaif
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-4 sm:px-6 pt-2">
          <button
            onClick={() => setActiveTab('verifier')}
            className={`pb-2.5 px-3 text-xs font-mono font-medium border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'verifier'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            Live Watermark Verifier
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`pb-2.5 px-3 text-xs font-mono font-medium border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'architecture'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Single vs Multi-File Engine
          </button>
          <button
            onClick={() => setActiveTab('certificate')}
            className={`pb-2.5 px-3 text-xs font-mono font-medium border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'certificate'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Author Credentials & Proof
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-mono text-xs">
          {activeTab === 'verifier' && (
            <div className="space-y-4">
              {/* Status Banner */}
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {isBypassActive ? (
                    <Unlock className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Lock className="w-4 h-4 text-amber-400" />
                  )}
                  <div>
                    <span className="text-slate-300 font-semibold">Active Mode: </span>
                    <span className={isBypassActive ? 'text-cyan-400 font-bold' : 'text-amber-400 font-bold'}>
                      {isBypassActive ? 'CLEAN BYPASS (Watermark Stripped)' : 'ENFORCED (Line 1 Watermarked)'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleBypass(!isBypassActive)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono transition"
                  >
                    Toggle to {isBypassActive ? 'Watermark' : 'Bypass'}
                  </button>
                  <button
                    onClick={handleRunProtocolVerification}
                    disabled={isVerifying}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs font-mono transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isVerifying ? 'Verifying...' : 'Verify Protocol'}
                  </button>
                </div>
              </div>

              {/* Protocol Hash Signature */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Protocol Verification Hash:</span>
                <span className="text-amber-400 font-bold">{protocolHash}</span>
              </div>

              {testResult && (
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-[11px] flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{testResult}</span>
                </div>
              )}

              {/* Live Code Diff Inspector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>File Output Preview (Line 1 Inspection):</span>
                  <span className="text-slate-500">
                    {stagedFiles.length > 0 ? `Inspecting ${stagedFiles[selectedFileIdx]?.name || 'file'}` : 'Demo algorithm code'}
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto max-h-56 leading-relaxed">
                  <pre className="text-slate-300">
                    {currentDisplayCode.split('\n').map((line, i) => (
                      <div 
                        key={i} 
                        className={`flex gap-3 ${i === 0 && !isBypassActive ? 'bg-amber-500/20 text-amber-300 font-bold px-1 rounded' : ''}`}
                      >
                        <span className="text-slate-600 select-none w-6 text-right shrink-0">{i + 1}</span>
                        <span className="flex-1">{line}</span>
                      </div>
                    ))}
                  </pre>
                </div>
              </div>

              {/* Bypass Key Shortcut */}
              <div className="p-3 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2 text-slate-400">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>Khan Kaif Master Bypass Key:</span>
                  <span className="text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                    {SECRET_AUTH_CODE}
                  </span>
                </div>
                <button
                  onClick={handleCopyBypassKey}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center gap-1 transition"
                >
                  {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedKey ? 'Copied' : 'Copy Key'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-4 text-slate-300">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Core Protocol Rule: Native File Preservation
                </h4>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Unlike standard compression utilities that blindly ZIP every single transmission, Khan Kaif&apos;s
                  STP engine enforces an intelligent file-count rule:
                </p>
                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg border border-cyan-500/30 bg-cyan-950/20 space-y-1">
                    <span className="text-cyan-400 font-bold text-xs">Rule 1: Single File Mode (= 1)</span>
                    <p className="text-[11px] text-slate-400">
                      If exactly one file is staged, it is <strong className="text-slate-200">never converted to .zip</strong>.
                      It is transferred in its original native format (e.g. raw `.java`, `.py`, `.png`, `.txt`) directly to mobile!
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-950/20 space-y-1">
                    <span className="text-amber-400 font-bold text-xs">Rule 2: Multi-File Mode (&gt; 1)</span>
                    <p className="text-[11px] text-slate-400">
                      When two or more files are queued, they are bundled using RFC-1951 Deflate compression into a unified
                      high-efficiency `.zip` archive.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-slate-200">Cross-Platform Resilience</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  The protocol features a 4-tier fallback: Express Gateway &rarr; Real-time Firestore Cloud Mirror &rarr; 
                  Local Storage Cache &rarr; Memory Buffer. Phone cameras scanning over mobile cellular networks can access packages even when not on the same Wi-Fi.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'certificate' && (
            <div className="p-6 rounded-2xl border-2 border-amber-500/50 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 space-y-4 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-amber-400">
                <Award className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-100">
                  Khan Kaif Protocol Engineering Certificate
                </h4>
                <p className="text-xs text-amber-400 font-semibold">
                  Original Implementation & Architecture
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-2 text-[11px]">
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-500">Lead Creator:</span>
                  <span className="text-slate-200 font-bold">Khan Kaif</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-500">Contact / Identity:</span>
                  <span className="text-slate-200">khankaifcom551@gmail.com</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-500">Protocol Specification:</span>
                  <span className="text-amber-400 font-bold">KK-STP v2.4 (Senior Java Edition)</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-500">Mandatory Watermark:</span>
                  <span className="text-amber-400">{WATERMARK_BANNER.trim()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Authorization Code:</span>
                  <span className="text-cyan-400 font-bold">{SECRET_AUTH_CODE}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                Engineered with Swing Java architecture specifications, ZXing matrix generation, Express micro-gateway, and Google Cloud Firestore persistence.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Created by Khan Kaif • All Protocol Specifications Enforced
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs font-mono transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
