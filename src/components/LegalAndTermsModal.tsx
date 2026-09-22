import React, { useState } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Lock, 
  X, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  Box, 
  Layers, 
  Cpu, 
  Award,
  Sparkles
} from 'lucide-react';
import { WATERMARK_BANNER, SECRET_AUTH_CODE } from '../utils/watermark';

interface LegalAndTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'terms' | 'privacy' | 'author' | 'spec';
}

export const LegalAndTermsModal: React.FC<LegalAndTermsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'terms'
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'author' | 'spec'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div 
        id="legal-terms-privacy-modal"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Compliance & Architecture Documentation</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-normal">
                  Verified Local Protocol
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Multi-File QR Package Generator • Local Transfer & 3D Animation Pipeline
              </p>
            </div>
          </div>

          <button
            id="close-legal-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 pt-2 gap-1 overflow-x-auto text-xs font-mono">
          <button
            id="tab-terms-btn"
            onClick={() => setActiveTab('terms')}
            className={`px-4 py-2.5 rounded-t-lg font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'terms'
                ? 'border-amber-500 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>TERMS & CONDITIONS</span>
          </button>

          <button
            id="tab-privacy-btn"
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2.5 rounded-t-lg font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'border-amber-500 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>PRIVACY POLICY</span>
          </button>

          <button
            id="tab-spec-btn"
            onClick={() => setActiveTab('spec')}
            className={`px-4 py-2.5 rounded-t-lg font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'spec'
                ? 'border-amber-500 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-cyan-400" />
            <span>3D & SECURITY SPEC</span>
          </button>

          <button
            id="tab-author-btn"
            onClick={() => setActiveTab('author')}
            className={`px-4 py-2.5 rounded-t-lg font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'author'
                ? 'border-amber-500 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>ARCHITECT PROFILE</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-300 leading-relaxed">
          {/* TERMS & CONDITIONS TAB */}
          {activeTab === 'terms' && (
            <div id="terms-content-section" className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold text-slate-100 uppercase tracking-wide">
                  TERMS & CONDITIONS
                </h3>
                <p className="text-xs font-mono text-amber-400/90 mt-1">
                  Last Updated: September 21, 2026
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-slate-200">
                Welcome to the application. By executing or utilizing this local transfer utility (&quot;Software&quot;), you agree to be bound by the following structural rules and conditions:
              </div>

              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-amber-400 font-mono font-bold text-xs flex items-center justify-center">
                    1
                  </div>
                  <h4 className="text-base font-bold text-slate-100 uppercase tracking-wide">
                    LOCALIZED SERVICE OPERABILITY
                  </h4>
                </div>
                <div className="pl-8 text-slate-300">
                  This Software operates strictly as a local micro-web server utility over an offline Local Area Network (LAN). It does not maintain permanent remote databases, external cloud integrations, or hosting pipelines. The user assumes full operational responsibility for the stability of the local network interface connection.
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-amber-400 font-mono font-bold text-xs flex items-center justify-center">
                    2
                  </div>
                  <h4 className="text-base font-bold text-slate-100 uppercase tracking-wide">
                    ASSET MANIPULATION & INTEGRITY PROOFS
                  </h4>
                </div>
                <div className="pl-8 space-y-2 text-slate-300">
                  <p>
                    The Software utilizes automated runtime processing pipelines to handle custom file extensions (including text-based components and .kaif bundles). The system automatically appends tracking indicators or validation metadata structures to processed files.
                  </p>
                  <ul className="space-y-1.5 list-disc list-inside bg-slate-950/50 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-300">
                    <li>
                      A dedicated administrative authorization layout (&quot;Bypass Mode&quot;) is provided via the security input key <span className="text-amber-400 font-bold">&quot;BuildWithKMKaif&quot;</span>.
                    </li>
                    <li>
                      Submitting the verified bypass key removes system tracking elements during compilation. Unauthorized attempts to alter the underlying bypass validation logic are prohibited.
                    </li>
                  </ul>
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-amber-400 font-mono font-bold text-xs flex items-center justify-center">
                    3
                  </div>
                  <h4 className="text-base font-bold text-slate-100 uppercase tracking-wide">
                    LIMITATION OF SYSTEM LIABILITY
                  </h4>
                </div>
                <div className="pl-8 text-slate-300">
                  This Software is provided &quot;as is&quot; without warranty of any kind. The architect is not liable for data loss, network blocks resulting from university/college AP isolation rules, or interruptions caused by local firewall configurations.
                </div>
              </section>
            </div>
          )}

          {/* PRIVACY POLICY TAB */}
          {activeTab === 'privacy' && (
            <div id="privacy-content-section" className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold text-slate-100 uppercase tracking-wide">
                  PRIVACY POLICY
                </h3>
                <p className="text-xs font-mono text-emerald-400/90 mt-1">
                  Last Updated: September 21, 2026
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-slate-200">
                Your data privacy is anchored directly to the architectural environment of this system. Because this Software runs entirely locally on your machine, your information never leaves your control.
              </div>

              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
                    1
                  </div>
                  <h4 className="text-base font-bold text-slate-100 uppercase tracking-wide">
                    ZERO-COLLECTION DATA MODEL
                  </h4>
                </div>
                <div className="pl-8 text-slate-300">
                  The Software explicitly does not collect, harvest, store, or transmit any personally identifiable information (PII) to remote servers. No cookies, external analytical tracking scripts, or profiling mechanisms are built into the source engine.
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
                    2
                  </div>
                  <h4 className="text-base font-bold text-slate-100 uppercase tracking-wide">
                    LOCAL NETWORK STREAMING EXCLUSIVITY
                  </h4>
                </div>
                <div className="pl-8 text-slate-300">
                  All file conversions, ZIP packaging routines, and QR data mapping streams occur strictly in temporary system memory (RAM) or designated local paths on the hosting PC. When a mobile device requests a download by scanning the generated QR code, the network transfer happens via a direct, secure local peer-to-peer route bypassing the public internet.
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
                    3
                  </div>
                  <h4 className="text-base font-bold text-slate-100 uppercase tracking-wide">
                    SECURITY WATERMARKS & METADATA
                  </h4>
                </div>
                <div className="pl-8 space-y-2 text-slate-300">
                  <p>
                    To verify system integrity and prevent unauthorized redistribution of the software framework, text-based and PDF file streams include embedded generation hashes.
                  </p>
                  <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-300">
                    Using the security bypass key <span className="text-emerald-400 font-bold">&quot;BuildWithKMKaif&quot;</span> entirely stops data logging adjustments, allowing completely unmodified file streams to pass directly through the download channel.
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* 3D & SECURITY SPEC TAB */}
          {activeTab === 'spec' && (
            <div id="spec-content-section" className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-amber-400">
                  <Lock className="w-5 h-5" />
                  <h3 className="text-xl font-bold text-slate-100 uppercase tracking-wide">
                    MANDATORY SECURITY & WATERMARK LOGIC WITH 3D ANIMATION EXTENSION SUPPORT
                  </h3>
                </div>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  Authorship & Verification Pipeline Specification for Text, .kaif, and 3D Assets
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase">
                    <FileText className="w-4 h-4" />
                    <span>1. Text & .kaif Signature</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    When text-based files (.txt, .java, etc.) or custom &quot;.kaif&quot; scripts are queued, an explicit comment banner is injected at line 1:
                  </p>
                  <code className="block bg-slate-900 border border-slate-800 p-2 rounded text-[11px] font-mono text-amber-300 break-all">
                    // [Created by Khan Mohammed Kaif] - 3D Animation & Local Secure Transfer Protocol
                  </code>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase">
                    <Box className="w-4 h-4" />
                    <span>2. 3D Manifest Layer</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Detects 3D extensions: <strong className="text-cyan-300">.obj, .fbx, .stl, .blend</strong>. Raw binary bytes are never altered. During ZIP bundling, companion metadata ledger <code className="text-amber-300 font-mono">animation_manifest.kaif</code> is injected with:
                  </p>
                  <pre className="bg-slate-900 border border-slate-800 p-2 rounded text-[10px] font-mono text-cyan-200 overflow-x-auto whitespace-pre">
{`Project Architect: Khan Mohammed Kaif (3D Animation Suite)
Verification Status: Authenticated Build Signature`}
                  </pre>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase">
                    <ShieldCheck className="w-4 h-4" />
                    <span>3. Clearance Bypass</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The GUI bypass entry field accepts secret clearance code:
                  </p>
                  <code className="block bg-slate-900 border border-slate-800 p-2 rounded text-[11px] font-mono text-emerald-300 font-bold text-center">
                    BuildWithKMKaif
                  </code>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    When submitted, text loses the comment banner, 3D packages omit the companion animation manifest file, and raw files export directly.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>Active Secret Key: <strong className="text-amber-400">{SECRET_AUTH_CODE}</strong></span>
                <span>Active Banner: <strong className="text-slate-200">{WATERMARK_BANNER}</strong></span>
              </div>
            </div>
          )}

          {/* ARCHITECT PROFILE TAB */}
          {activeTab === 'author' && (
            <div id="architect-profile-section" className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold text-slate-100 uppercase tracking-wide">
                  Lead Software Architect & 3D Specialist
                </h3>
                <p className="text-xs font-mono text-amber-400/90 mt-1">
                  Creator Profile & Architectural Stewardship
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-5 flex justify-center">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <img 
                      src="/author.jpg" 
                      alt="Khan Mohammed Kaif - Software Architect & 3D Animation Specialist"
                      referrerPolicy="no-referrer"
                      className="relative w-64 h-80 object-cover rounded-xl border border-slate-700 shadow-2xl"
                      onError={(e) => {
                        // Fallback placeholder if image takes a second
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>
                </div>

                <div className="md:col-span-7 space-y-4">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">
                      System Architect & 3D Lead
                    </span>
                    <h4 className="text-2xl font-black text-slate-100 mt-1">
                      Khan Mohammed Kaif
                    </h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Contact: khankaifcom551@gmail.com
                    </p>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    Specializing in high-performance local network protocols, custom ZIP stream compression engines, and 3D animation asset pipelines. Architected the single-touch QR-to-device wireless staging workflow, zero-collection offline local micro-servers, and the proprietary <code className="text-cyan-300 font-mono text-xs">.kaif</code> asset specification.
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block">Domain</span>
                      <span className="text-amber-400 font-semibold">3D Animation & P2P Stream</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block">Auth Signature</span>
                      <span className="text-emerald-400 font-semibold">BuildWithKMKaif Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs font-mono">
          <div className="text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Khan Mohammed Kaif © 2026 • Local LAN Protocol</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
