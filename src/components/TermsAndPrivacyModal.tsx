import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Lock, 
  Key, 
  Layers, 
  Box, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ExternalLink, 
  Copy, 
  Check, 
  UserCheck 
} from 'lucide-react';

interface TermsAndPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'terms' | 'privacy' | '3d-protocol' | 'architect';
  onAuthorizeBypass?: (key: string) => void;
  isBypassActive?: boolean;
}

export const TermsAndPrivacyModal: React.FC<TermsAndPrivacyModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'terms',
  onAuthorizeBypass,
  isBypassActive = false
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | '3d-protocol' | 'architect'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState(false);

  if (!isOpen) return null;

  const handleCopyClearanceKey = () => {
    navigator.clipboard.writeText('BuildWithKMKaif');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="terms-privacy-modal-dialog" 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100 font-mono">
                  Legal, Privacy &amp; 3D Protocol Governance
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 border border-emerald-800/80 text-emerald-400 font-semibold">
                  Verified Sept 21, 2026
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Architect: Khan Mohammed Kaif • 3D Animation &amp; Local Secure Transfer Suite
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition text-lg leading-none"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-5 bg-slate-950 border-b border-slate-800 flex items-center gap-2 overflow-x-auto py-2.5">
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'terms'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>TERMS &amp; CONDITIONS</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>PRIVACY POLICY</span>
          </button>

          <button
            onClick={() => setActiveTab('3d-protocol')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === '3d-protocol'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D ANIMATION &amp; WATERMARK LOGIC</span>
          </button>

          <button
            onClick={() => setActiveTab('architect')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'architect'
                ? 'bg-purple-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>ARCHITECT IDENTITY</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
          {/* TAB 1: TERMS & CONDITIONS */}
          {activeTab === 'terms' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm sm:text-base font-bold text-amber-400 uppercase tracking-wide font-mono">
                  TERMS &amp; CONDITIONS
                </h3>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                  Last Updated: September 21, 2026
                </span>
              </div>

              <p className="text-slate-200 font-medium">
                Welcome to the application. By executing or utilizing this local transfer utility (&quot;Software&quot;), you agree to be bound by the following structural rules and conditions:
              </p>

              <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-100 text-xs tracking-wider uppercase font-mono text-amber-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  LOCALIZED SERVICE OPERABILITY
                </h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  This Software operates strictly as a local micro-web server utility over an offline Local Area Network (LAN). It does not maintain permanent remote databases, external cloud integrations, or hosting pipelines. The user assumes full operational responsibility for the stability of the local network interface connection.
                </p>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-100 text-xs tracking-wider uppercase font-mono text-amber-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  ASSET MANIPULATION &amp; INTEGRITY PROOFS
                </h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  The Software utilizes automated runtime processing pipelines to handle custom file extensions (including text-based components and .kaif bundles). The system automatically appends tracking indicators or validation metadata structures to processed files.
                </p>
                <p className="text-slate-300 text-xs leading-relaxed">
                  A dedicated administrative authorization layout (&quot;Bypass Mode&quot;) is provided via the security input key <code className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-mono font-bold">&quot;BuildWithKMKaif&quot;</code>.
                </p>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Submitting the verified bypass key removes system tracking elements during compilation. Unauthorized attempts to alter the underlying bypass validation logic are prohibited.
                </p>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-100 text-xs tracking-wider uppercase font-mono text-amber-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  LIMITATION OF SYSTEM LIABILITY
                </h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  This Software is provided &quot;as is&quot; without warranty of any kind. The architect is not liable for data loss, network blocks resulting from university/college AP isolation rules, or interruptions caused by local firewall configurations.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm sm:text-base font-bold text-amber-400 uppercase tracking-wide font-mono">
                  PRIVACY POLICY
                </h3>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                  Last Updated: September 21, 2026
                </span>
              </div>

              <p className="text-slate-200 font-medium">
                Your data privacy is anchored directly to the architectural environment of this system. Because this Software runs entirely locally on your machine, your information never leaves your control.
              </p>

              <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-100 text-xs tracking-wider uppercase font-mono text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  ZERO-COLLECTION DATA MODEL
                </h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  The Software explicitly does not collect, harvest, store, or transmit any personally identifiable information (PII) to remote servers. No cookies, external analytical tracking scripts, or profiling mechanisms are built into the source engine.
                </p>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-100 text-xs tracking-wider uppercase font-mono text-cyan-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  LOCAL NETWORK STREAMING EXCLUSIVITY
                </h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  All file conversions, ZIP packaging routines, and QR data mapping streams occur strictly in temporary system memory (RAM) or designated local paths on the hosting PC. When a mobile device requests a download by scanning the generated QR code, the network transfer happens via a direct, secure local peer-to-peer route bypassing the public internet.
                </p>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-100 text-xs tracking-wider uppercase font-mono text-amber-300 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-400" />
                  SECURITY WATERMARKS &amp; METADATA
                </h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  To verify system integrity and prevent unauthorized redistribution of the software framework, text-based and PDF file streams include embedded generation hashes. Using the security bypass key <code className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-mono font-bold">&quot;BuildWithKMKaif&quot;</code> entirely stops data logging adjustments, allowing completely unmodified file streams to pass directly through the download channel.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: 3D ANIMATION & WATERMARK LOGIC */}
          {activeTab === '3d-protocol' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Box className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm sm:text-base font-bold text-cyan-400 uppercase tracking-wide font-mono">
                    3D Animation &amp; Watermark Pipeline
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-800/80">
                  Mandatory Authorship Architecture
                </span>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                    1. Text and .kaif File Ownership Signature
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When text-based files (<code className="text-amber-300">.txt</code>, <code className="text-amber-300">.java</code>, etc.) or custom <code className="text-cyan-300">.kaif</code> scripts are queued, the backend injects an explicit comment banner at line 1:
                </p>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-emerald-400 font-mono text-xs overflow-x-auto selection:bg-emerald-950">
                  // [Created by Khan Mohammed Kaif] - 3D Animation &amp; Local Secure Transfer Protocol
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                    2. 3D Animation Asset Manifest Layer (.obj, .fbx, .stl, .blend)
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The application explicitly detects 3D design and animation extensions: <span className="font-bold text-cyan-300">.obj, .fbx, .stl, and .blend</span>.
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  For these 3D formats, the system <strong className="text-slate-100">does NOT alter the raw asset binary bytes directly</strong>. Instead, during the ZIP bundling routine, it automatically injects a companion metadata ledger named <code className="text-amber-300 font-bold">animation_manifest.kaif</code> into the root directory of the compressed package.
                </p>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono space-y-1 text-slate-300">
                  <div className="text-cyan-400 font-bold">// Companion Ledger Structure:</div>
                  <div>Project Architect: Khan Mohammed Kaif (3D Animation Suite)</div>
                  <div>Verification Status: Authenticated Build Signature</div>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                    3. Security Removal Bypass Section
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The GUI bypass entry field accepts the secret clearance code: <code className="text-amber-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-mono">&quot;BuildWithKMKaif&quot;</code>.
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  If submitted, the injection system is entirely suppressed: text documents lose the comment banner, and 3D packages omit the companion animation manifest file, exporting the raw, unmodified original files through the QR download link.
                </p>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleCopyClearanceKey}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs font-mono transition flex items-center gap-1.5"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? 'Key Copied!' : 'Copy "BuildWithKMKaif"'}</span>
                  </button>
                  {onAuthorizeBypass && !isBypassActive && (
                    <button
                      onClick={() => {
                        onAuthorizeBypass('BuildWithKMKaif');
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono border border-slate-700 transition"
                    >
                      Quick Apply Key in Dashboard
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ARCHITECT IDENTITY */}
          {activeTab === 'architect' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-purple-400" />
                  <h3 className="text-sm sm:text-base font-bold text-purple-400 uppercase tracking-wide font-mono">
                    Project Architect &amp; Software Lead
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-purple-300 bg-purple-950/80 px-2.5 py-1 rounded border border-purple-800/80">
                  Principal Executive Profile
                </span>
              </div>

              {/* Architect Profile Showcase Card */}
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  {/* Executive Avatar / Badge */}
                  <div className="relative">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-amber-500/60 shadow-2xl bg-slate-950 flex items-center justify-center text-amber-400">
                      <div className="flex flex-col items-center justify-center p-2 text-center">
                        <span className="text-3xl font-black font-mono tracking-tighter text-amber-400">KMK</span>
                        <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 mt-1">Khan Kaif</span>
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 p-1 rounded-full shadow-lg border-2 border-slate-900" title="Verified Creator">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Biography & Credentials */}
                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                      <h4 className="text-lg sm:text-xl font-bold text-slate-100 font-mono">
                        Khan Mohammed Kaif
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-block">
                        3D Animation &amp; Systems Architect
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 font-mono">
                      Lead Creator: Local Area Network Secure Transfer Protocol (KK-STP v2.4)
                    </p>

                    <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Contact Channel:</span>
                        <span className="text-slate-200 font-semibold truncate block">khankaifcom551@gmail.com</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">System Clearances:</span>
                        <span className="text-amber-400 font-semibold block">BuildWithKMKaif</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 text-xs text-slate-400 leading-relaxed font-mono">
                  &quot;Architected to empower developer pipelines with offline peer-to-peer file distribution across local area networks, combining instantaneous multi-file QR routing, 3D asset manifest ledgers, and zero-cloud privacy.&quot;
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Zero Remote Telemetry • Offline Secure Execution</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition shadow font-mono"
          >
            Acknowledge &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
