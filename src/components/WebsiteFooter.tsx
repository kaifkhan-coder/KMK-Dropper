import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Lock, 
  Box, 
  ChevronDown, 
  ChevronUp, 
  Key, 
  Copy, 
  Check, 
  Layers, 
  UserCheck, 
  ExternalLink 
} from 'lucide-react';

interface WebsiteFooterProps {
  onOpenTermsModal: (tab: 'terms' | 'privacy' | '3d-protocol' | 'architect') => void;
  isBypassActive: boolean;
  onQuickUnlockBypass?: (key: string) => void;
}

export const WebsiteFooter: React.FC<WebsiteFooterProps> = ({
  onOpenTermsModal,
  isBypassActive,
  onQuickUnlockBypass
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText('BuildWithKMKaif');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <footer id="app-website-footer" className="w-full bg-slate-950 border-t border-slate-800 text-slate-400 text-xs font-sans mt-8 select-text">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200 font-mono text-xs sm:text-sm">
                Khan Mohammed Kaif • 3D Animation &amp; Local Secure Transfer Protocol
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-700 text-emerald-400 font-semibold">
                v2.4 Production
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Offline peer-to-peer micro-server • Zero cloud harvesting • Strict Local Area Network operability
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <button
            onClick={() => onOpenTermsModal('terms')}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition font-mono text-xs flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Terms</span>
          </button>

          <button
            onClick={() => onOpenTermsModal('privacy')}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition font-mono text-xs flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Privacy</span>
          </button>

          <button
            onClick={() => onOpenTermsModal('3d-protocol')}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition font-mono text-xs flex items-center gap-1.5"
          >
            <Box className="w-3.5 h-3.5 text-cyan-400" />
            <span>3D Manifest</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg transition font-mono text-xs flex items-center gap-1.5"
          >
            <span>{isExpanded ? 'Hide Inline Legal Text' : 'Read Full Terms & Privacy Below'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Inline Terms & Privacy View (Verbatim User Text) */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 transition-all duration-300 ease-in-out ${isExpanded ? 'py-8 block' : 'hidden'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
          
          {/* COLUMN 1: TERMS & CONDITIONS */}
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-amber-400 font-mono uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>TERMS &amp; CONDITIONS</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                Last Updated: September 21, 2026
              </span>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              Welcome to the application. By executing or utilizing this local transfer utility (&quot;Software&quot;), you agree to be bound by the following structural rules and conditions:
            </p>

            <div className="space-y-3">
              <div className="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-xl">
                <h4 className="text-[11px] font-bold text-amber-300 font-mono uppercase tracking-wide mb-1.5">
                  LOCALIZED SERVICE OPERABILITY
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  This Software operates strictly as a local micro-web server utility over an offline Local Area Network (LAN). It does not maintain permanent remote databases, external cloud integrations, or hosting pipelines. The user assumes full operational responsibility for the stability of the local network interface connection.
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-xl">
                <h4 className="text-[11px] font-bold text-amber-300 font-mono uppercase tracking-wide mb-1.5">
                  ASSET MANIPULATION &amp; INTEGRITY PROOFS
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  The Software utilizes automated runtime processing pipelines to handle custom file extensions (including text-based components and .kaif bundles). The system automatically appends tracking indicators or validation metadata structures to processed files.
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-2">
                  A dedicated administrative authorization layout (&quot;Bypass Mode&quot;) is provided via the security input key <span className="font-bold text-amber-300 font-mono">&quot;BuildWithKMKaif&quot;</span>.
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-2">
                  Submitting the verified bypass key removes system tracking elements during compilation. Unauthorized attempts to alter the underlying bypass validation logic are prohibited.
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-xl">
                <h4 className="text-[11px] font-bold text-amber-300 font-mono uppercase tracking-wide mb-1.5">
                  LIMITATION OF SYSTEM LIABILITY
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  This Software is provided &quot;as is&quot; without warranty of any kind. The architect is not liable for data loss, network blocks resulting from university/college AP isolation rules, or interruptions caused by local firewall configurations.
                </p>
              </div>
            </div>
          </div>

          {/* COLUMN 2: PRIVACY POLICY */}
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>PRIVACY POLICY</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                Last Updated: September 21, 2026
              </span>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              Your data privacy is anchored directly to the architectural environment of this system. Because this Software runs entirely locally on your machine, your information never leaves your control.
            </p>

            <div className="space-y-3">
              <div className="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-xl">
                <h4 className="text-[11px] font-bold text-emerald-300 font-mono uppercase tracking-wide mb-1.5">
                  ZERO-COLLECTION DATA MODEL
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  The Software explicitly does not collect, harvest, store, or transmit any personally identifiable information (PII) to remote servers. No cookies, external analytical tracking scripts, or profiling mechanisms are built into the source engine.
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-xl">
                <h4 className="text-[11px] font-bold text-cyan-300 font-mono uppercase tracking-wide mb-1.5">
                  LOCAL NETWORK STREAMING EXCLUSIVITY
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  All file conversions, ZIP packaging routines, and QR data mapping streams occur strictly in temporary system memory (RAM) or designated local paths on the hosting PC. When a mobile device requests a download by scanning the generated QR code, the network transfer happens via a direct, secure local peer-to-peer route bypassing the public internet.
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-xl">
                <h4 className="text-[11px] font-bold text-amber-300 font-mono uppercase tracking-wide mb-1.5">
                  SECURITY WATERMARKS &amp; METADATA
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  To verify system integrity and prevent unauthorized redistribution of the software framework, text-based and PDF file streams include embedded generation hashes. Using the security bypass key <span className="font-bold text-amber-300 font-mono">&quot;BuildWithKMKaif&quot;</span> entirely stops data logging adjustments, allowing completely unmodified file streams to pass directly through the download channel.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Animation & Clearance Code Quick Banner */}
        <div className="mt-6 bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200 font-mono">
                3D Animation Asset Manifest Protocol (.obj, .fbx, .stl, .blend)
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Preserves raw 3D binaries untouched; bundles root companion ledger <code className="text-amber-400">animation_manifest.kaif</code> unless cleared with key.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyKey}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono border border-slate-700 transition flex items-center gap-1.5"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey ? 'Key Copied!' : 'Copy "BuildWithKMKaif"'}</span>
            </button>

            {onQuickUnlockBypass && !isBypassActive && (
              <button
                onClick={() => onQuickUnlockBypass('BuildWithKMKaif')}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs font-mono transition"
              >
                Apply Bypass Key Now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Verification Line */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-slate-500 border-t border-slate-900">
        <div>
          © 2026 Khan Mohammed Kaif. All rights reserved. Governed under Local Area Network Security Specifications.
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onOpenTermsModal('architect')}
            className="text-slate-400 hover:text-amber-400 transition"
          >
            Architect Profile
          </button>
          <span>•</span>
          <button 
            onClick={() => onOpenTermsModal('terms')}
            className="text-slate-400 hover:text-amber-400 transition"
          >
            Terms of Use
          </button>
          <span>•</span>
          <button 
            onClick={() => onOpenTermsModal('privacy')}
            className="text-slate-400 hover:text-amber-400 transition"
          >
            Privacy Policy
          </button>
        </div>
      </div>
    </footer>
  );
};
