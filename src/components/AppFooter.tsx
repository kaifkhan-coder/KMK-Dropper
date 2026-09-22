import React, { useState } from 'react';
import { 
  FileText, 
  Lock, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Award, 
  Box, 
  ExternalLink 
} from 'lucide-react';
import { SECRET_AUTH_CODE, WATERMARK_BANNER } from '../utils/watermark';

interface AppFooterProps {
  onOpenLegalModal: (tab: 'terms' | 'privacy' | 'author' | 'spec') => void;
}

export const AppFooter: React.FC<AppFooterProps> = ({ onOpenLegalModal }) => {
  const [isInlineExpanded, setIsInlineExpanded] = useState(false);
  const [inlineTab, setInlineTab] = useState<'terms' | 'privacy'>('terms');

  return (
    <footer id="app-footer" className="mt-8 border-t border-slate-800/80 bg-slate-950/90 text-slate-400">
      {/* Primary Footer Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Architect Attribution & Portrait Avatar */}
          <div className="flex items-center gap-3">
            <button
              id="footer-author-avatar-btn"
              onClick={() => onOpenLegalModal('author')}
              className="relative group focus:outline-none"
              title="View Architect Profile: Khan Mohammed Kaif"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-500/60 shadow-md group-hover:border-amber-400 transition">
                <img 
                  src="/author.jpg" 
                  alt="Khan Mohammed Kaif"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80';
                  }}
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full"></span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200">
                  Khan Mohammed Kaif
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  Lead Architect & 3D Suite
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                3D Animation Pipeline • Local P2P Secure Transfer Protocol
              </p>
            </div>
          </div>

          {/* Center: Direct Quick Links to Terms, Privacy & Spec */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap text-xs font-mono">
            <button
              id="footer-open-terms-btn"
              onClick={() => onOpenLegalModal('terms')}
              className="hover:text-amber-400 transition flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Terms & Conditions</span>
            </button>

            <button
              id="footer-open-privacy-btn"
              onClick={() => onOpenLegalModal('privacy')}
              className="hover:text-emerald-400 transition flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Privacy Policy</span>
            </button>

            <button
              id="footer-open-spec-btn"
              onClick={() => onOpenLegalModal('spec')}
              className="hover:text-cyan-400 transition flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700"
            >
              <Box className="w-3.5 h-3.5 text-cyan-400" />
              <span>3D & Security Spec</span>
            </button>

            <button
              id="toggle-inline-legal-reader-btn"
              onClick={() => setIsInlineExpanded(!isInlineExpanded)}
              className="text-slate-400 hover:text-white transition flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-slate-900 border border-slate-800"
            >
              <span>{isInlineExpanded ? 'Collapse Reader' : 'Quick Read'}</span>
              {isInlineExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Right: Security Clearance Indicator */}
          <div className="text-right text-[11px] font-mono text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Clearance: <code className="text-amber-400">{SECRET_AUTH_CODE}</code></span>
          </div>
        </div>

        {/* Collapsible Inline Reader for Instant Reading */}
        {isInlineExpanded && (
          <div id="inline-legal-reader" className="mt-5 pt-5 border-t border-slate-800/80 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2 text-xs font-mono">
                <button
                  onClick={() => setInlineTab('terms')}
                  className={`px-3 py-1 rounded-md transition ${
                    inlineTab === 'terms' 
                      ? 'bg-amber-500 text-slate-950 font-bold' 
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  TERMS & CONDITIONS
                </button>
                <button
                  onClick={() => setInlineTab('privacy')}
                  className={`px-3 py-1 rounded-md transition ${
                    inlineTab === 'privacy' 
                      ? 'bg-emerald-500 text-slate-950 font-bold' 
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  PRIVACY POLICY
                </button>
              </div>

              <span className="text-[11px] font-mono text-slate-500">
                Last Updated: September 21, 2026
              </span>
            </div>

            {inlineTab === 'terms' ? (
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 text-xs text-slate-300 space-y-4 font-sans leading-relaxed">
                <div>
                  <h4 className="font-bold text-slate-100 uppercase tracking-wide text-sm mb-1">
                    TERMS & CONDITIONS
                  </h4>
                  <p className="text-slate-400">
                    Welcome to the application. By executing or utilizing this local transfer utility (&quot;Software&quot;), you agree to be bound by the following structural rules and conditions:
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h5 className="font-bold text-amber-400 text-xs uppercase">
                    1. LOCALIZED SERVICE OPERABILITY
                  </h5>
                  <p className="text-slate-300">
                    This Software operates strictly as a local micro-web server utility over an offline Local Area Network (LAN). It does not maintain permanent remote databases, external cloud integrations, or hosting pipelines. The user assumes full operational responsibility for the stability of the local network interface connection.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h5 className="font-bold text-amber-400 text-xs uppercase">
                    2. ASSET MANIPULATION & INTEGRITY PROOFS
                  </h5>
                  <p className="text-slate-300">
                    The Software utilizes automated runtime processing pipelines to handle custom file extensions (including text-based components and .kaif bundles). The system automatically appends tracking indicators or validation metadata structures to processed files.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 font-mono text-[11px] pl-2">
                    <li>A dedicated administrative authorization layout (&quot;Bypass Mode&quot;) is provided via the security input key &quot;BuildWithKMKaif&quot;.</li>
                    <li>Submitting the verified bypass key removes system tracking elements during compilation. Unauthorized attempts to alter the underlying bypass validation logic are prohibited.</li>
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <h5 className="font-bold text-amber-400 text-xs uppercase">
                    3. LIMITATION OF SYSTEM LIABILITY
                  </h5>
                  <p className="text-slate-300">
                    This Software is provided &quot;as is&quot; without warranty of any kind. The architect is not liable for data loss, network blocks resulting from university/college AP isolation rules, or interruptions caused by local firewall configurations.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 text-xs text-slate-300 space-y-4 font-sans leading-relaxed">
                <div>
                  <h4 className="font-bold text-slate-100 uppercase tracking-wide text-sm mb-1">
                    PRIVACY POLICY
                  </h4>
                  <p className="text-slate-400">
                    Your data privacy is anchored directly to the architectural environment of this system. Because this Software runs entirely locally on your machine, your information never leaves your control.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h5 className="font-bold text-emerald-400 text-xs uppercase">
                    1. ZERO-COLLECTION DATA MODEL
                  </h5>
                  <p className="text-slate-300">
                    The Software explicitly does not collect, harvest, store, or transmit any personally identifiable information (PII) to remote servers. No cookies, external analytical tracking scripts, or profiling mechanisms are built into the source engine.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h5 className="font-bold text-emerald-400 text-xs uppercase">
                    2. LOCAL NETWORK STREAMING EXCLUSIVITY
                  </h5>
                  <p className="text-slate-300">
                    All file conversions, ZIP packaging routines, and QR data mapping streams occur strictly in temporary system memory (RAM) or designated local paths on the hosting PC. When a mobile device requests a download by scanning the generated QR code, the network transfer happens via a direct, secure local peer-to-peer route bypassing the public internet.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h5 className="font-bold text-emerald-400 text-xs uppercase">
                    3. SECURITY WATERMARKS & METADATA
                  </h5>
                  <p className="text-slate-300">
                    To verify system integrity and prevent unauthorized redistribution of the software framework, text-based and PDF file streams include embedded generation hashes. Using the security bypass key &quot;BuildWithKMKaif&quot; entirely stops data logging adjustments, allowing completely unmodified file streams to pass directly through the download channel.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </footer>
  );
};
