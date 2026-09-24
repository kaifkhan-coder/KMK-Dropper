import React, { useState } from 'react';
import { Key, Lock, Unlock, ShieldAlert, CheckCircle2, Code2, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';

interface DeveloperUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: (code: string) => boolean;
  isDevUnlocked: boolean;
  onRelock: () => void;
}

export const DeveloperUnlockModal: React.FC<DeveloperUnlockModalProps> = ({
  isOpen,
  onClose,
  onUnlock,
  isDevUnlocked,
  onRelock
}) => {
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!code.trim()) {
      setErrorMsg('Please enter the secret code.');
      return;
    }

    const success = onUnlock(code.trim());
    if (success) {
      setSuccessMsg('Authorization verified! Java Source Code Suite & Developer Architecture are now unlocked.');
      setCode('');
      setTimeout(() => {
        onClose();
      }, 900);
    } else {
      setErrorMsg('Invalid secret code. Secret code is "KaifOmniMind447".');
    }
  };

  const handleRelockClick = () => {
    onRelock();
    setSuccessMsg('Developer mode locked. Java code section hidden.');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="developer-unlock-modal-dialog" 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden font-sans"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono">
                {isDevUnlocked ? 'Developer Suite Unlocked' : 'Enter Secret Code'}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {isDevUnlocked ? 'Java Source & Architecture Active' : 'Unlock Java Code & Developer Suite'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {isDevUnlocked ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-950/50 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs font-mono space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Developer Access Active</span>
                </div>
                <p className="text-emerald-300/90 text-xs leading-relaxed">
                  The complete multi-file Java architecture (7 source files, POM.xml, FlatLaf swing engine, and ZIP packaging routines) is currently visible in your workspace.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleRelockClick}
                  className="w-full py-2.5 px-4 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-600/40 font-mono text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Relock &amp; Return to Simple Drag &amp; Drop</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                By default, this app operates in a clean, distraction-free <strong>Drag &amp; Drop mode</strong>. Enter the master secret key to reveal the underlying Java architecture, source code files, and developer export tools.
              </p>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  Secret Key
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder='Enter "KaifOmniMind447"...'
                    autoComplete="off"
                    autoFocus
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Fill Helper */}
              <div className="flex items-center justify-between text-[11px] font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500">Master Secret Key:</span>
                <button
                  type="button"
                  onClick={() => setCode('KaifOmniMind447')}
                  className="text-amber-400 hover:text-amber-300 font-bold underline transition"
                >
                  Fill &quot;KaifOmniMind447&quot;
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Developer Mode</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
