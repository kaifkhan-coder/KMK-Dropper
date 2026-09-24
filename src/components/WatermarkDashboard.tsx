import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Key, Lock, Unlock, Eye, EyeOff, AlertTriangle, Box, FileCode } from 'lucide-react';
import { WATERMARK_BANNER, SECRET_AUTH_CODE } from '../utils/watermark';

interface WatermarkDashboardProps {
  isBypassActive: boolean;
  onUnlockBypass: (code: string) => boolean;
  onRelockWatermark: () => void;
  stagedFilesCount: number;
  onUnlockDevCode?: (code: string) => boolean;
  isDevUnlocked?: boolean;
}

export const WatermarkDashboard: React.FC<WatermarkDashboardProps> = ({
  isBypassActive,
  onUnlockBypass,
  onRelockWatermark,
  stagedFilesCount,
  onUnlockDevCode,
  isDevUnlocked = false
}) => {
  const [codeInput, setCodeInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = codeInput.trim();
    if (!trimmed) {
      setFeedback({
        type: 'error',
        message: 'Please enter your authorization clearance code.'
      });
      return;
    }

    if (trimmed.toLowerCase() === 'kaifomnimind447') {
      if (onUnlockDevCode) {
        onUnlockDevCode(trimmed);
      }
      setFeedback({
        type: 'success',
        message: 'Developer Secret Code Accepted! Java Source Code Suite and Developer Architecture are now UNLOCKED.'
      });
      setCodeInput('');
      return;
    }

    const success = onUnlockBypass(trimmed);
    if (success) {
      setFeedback({
        type: 'success',
        message: 'Security clearance verified! Clean Bypass Mode is now ACTIVE. Line-1 comments suppressed and 3D companion animation manifests omitted.'
      });
      setCodeInput('');
    } else {
      setFeedback({
        type: 'error',
        message: 'Invalid code: Clearance key does not match. Please verify with the owner.'
      });
    }
  };

  const handleRelock = () => {
    onRelockWatermark();
    setFeedback({
      type: 'success',
      message: 'Watermarks re-enabled. Text files stamped on Line 1, and 3D packages (.obj, .fbx, .stl, .blend) will inject animation_manifest.kaif.'
    });
  };

  return (
    <div id="watermark-management-dashboard" className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg border ${
            isBypassActive 
              ? 'bg-emerald-950/70 border-emerald-600/50 text-emerald-400' 
              : 'bg-amber-950/70 border-amber-600/50 text-amber-400'
          }`}>
            {isBypassActive ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Security &amp; 3D Animation Watermark Pipeline
              </h2>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${
                isBypassActive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
              }`}>
                {isBypassActive ? 'CLEAN BYPASS MODE ACTIVE' : 'MANDATORY WATERMARK ENFORCED'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono truncate max-w-xl">
              {isBypassActive 
                ? 'Parsing engine is currently stripping the banner from text and omitting 3D companion manifests.' 
                : `Target Line 1: "${WATERMARK_BANNER}"`}
            </p>
          </div>
        </div>

        {/* Security Quick Status Pills */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300 flex items-center gap-2">
            <span className="text-slate-500">Staged Files:</span>
            <span className="text-amber-400 font-semibold">{stagedFilesCount}</span>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300 flex items-center gap-2">
            <Box className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-500">3D Assets:</span>
            <span className="text-cyan-400 font-semibold">.obj .fbx .stl .blend</span>
          </div>
        </div>
      </div>

      {/* Prominent Bypass Form & Controls */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Key className="w-4 h-4" />
              </div>
              <input
                id="watermark-bypass-input"
                type={showPassword ? 'text' : 'password'}
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder='Enter clearance key: "BuildWithKMKaif"...'
                autoComplete="off"
                className="w-full pl-9 pr-10 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition"
                title={showPassword ? 'Mask input' : 'Reveal input'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              id="submit-watermark-bypass"
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition shadow-sm hover:shadow flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Authorize Bypass</span>
            </button>

            {isBypassActive && (
              <button
                id="relock-watermark-btn"
                type="button"
                onClick={handleRelock}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono rounded-lg border border-slate-700 transition flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Re-Apply Watermark</span>
              </button>
            )}
          </form>
        </div>

        {/* Security / Coupon Policy Info */}
        <div className="lg:col-span-4 bg-slate-950/70 border border-slate-800/80 rounded-lg px-3 py-2 text-[11px] font-mono flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-400">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Clearance Key:</span>
          </span>
          <span className="text-amber-400 font-semibold bg-slate-900 border border-slate-700 px-2.5 py-0.5 rounded text-[11px] font-mono">
            {SECRET_AUTH_CODE}
          </span>
        </div>
      </div>

      {/* Dynamic Feedback Banner */}
      {feedback.type && (
        <div className={`mt-3 p-2.5 rounded-lg text-xs font-mono flex items-start gap-2 border ${
          feedback.type === 'success' 
            ? 'bg-emerald-950/50 border-emerald-700/50 text-emerald-300' 
            : 'bg-rose-950/50 border-rose-700/50 text-rose-300'
        }`}>
          {feedback.type === 'success' ? (
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">{feedback.message}</div>
          <button 
            onClick={() => setFeedback({ type: null, message: '' })}
            className="text-slate-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};
