import React, { useState } from 'react';
import { Key, Lock, Unlock, ShieldAlert, CheckCircle2, AlertCircle, Eye, EyeOff, Sliders, Check, RefreshCw } from 'lucide-react';
import { 
  isDownloadProtectionEnabled, 
  setDownloadProtectionEnabled, 
  updateSecretPasscode 
} from '../utils/securityConfig';

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

  // Owner settings state when unlocked
  const [isProtectionActive, setIsProtectionActive] = useState(() => isDownloadProtectionEnabled());
  const [newCode, setNewCode] = useState('');
  const [confirmNewCode, setConfirmNewCode] = useState('');
  const [showNewCode, setShowNewCode] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

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
      setSuccessMsg('Authorization verified! Owner controls unlocked.');
      setCode('');
      setTimeout(() => {
        setSuccessMsg('');
      }, 1200);
    } else {
      setErrorMsg('Access Denied: Invalid secret code. Please verify your credentials.');
    }
  };

  const handleToggleProtection = async () => {
    setIsSavingSettings(true);
    try {
      const nextState = !isProtectionActive;
      await setDownloadProtectionEnabled(nextState);
      setIsProtectionActive(nextState);
      setSuccessMsg(nextState 
        ? 'Downloads now strictly require secret code.'
        : 'Download protection disabled: Anyone can download without code.'
      );
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg('Failed to update protection status: ' + err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleChangeCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newCode.trim()) {
      setErrorMsg('Please enter a new secret code.');
      return;
    }

    if (newCode.trim().length < 4) {
      setErrorMsg('Secret code must be at least 4 characters long.');
      return;
    }

    if (newCode !== confirmNewCode) {
      setErrorMsg('New code and confirmation do not match.');
      return;
    }

    setIsSavingSettings(true);
    try {
      await updateSecretPasscode(newCode.trim());
      setSuccessMsg('Secret code successfully updated! Enforced for all downloads.');
      setNewCode('');
      setConfirmNewCode('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg('Failed to update secret code: ' + err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleRelockClick = () => {
    onRelock();
    setSuccessMsg('Security session locked.');
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
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
              isDevUnlocked 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              {isDevUnlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono">
                {isDevUnlocked ? 'Owner Access & Security' : 'Enter Secret Code'}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {isDevUnlocked ? 'Manage Download Protection & Passcode' : 'Access Restricted To System Owner'}
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

          {isDevUnlocked ? (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/70 rounded-xl text-emerald-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold">Owner Status: Authorized</span>
                </div>
                <span className="text-[10px] bg-emerald-900/60 text-emerald-200 px-2 py-0.5 rounded border border-emerald-700/60">
                  Full Access
                </span>
              </div>

              {/* Feature: Enable / Disable Download Code Requirement */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-200">Require Code For Downloads</h4>
                    <p className="text-[10px] text-slate-400">
                      {isProtectionActive ? 'Currently Enforced' : 'Currently Disabled'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleProtection}
                    disabled={isSavingSettings}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      isProtectionActive
                        ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>{isProtectionActive ? 'Enabled' : 'Disabled'}</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed pt-1 border-t border-slate-900">
                  {isProtectionActive 
                    ? 'When enabled: Visitors must enter your secret code before any file can be downloaded.'
                    : 'When disabled: Visitors can download files without entering a secret code.'}
                </p>
              </div>

              {/* Feature: Change Secret Code */}
              <form onSubmit={handleChangeCodeSubmit} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Change Secret Code</span>
                  </h4>
                  <span className="text-[9px] text-slate-500">Private</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">New Secret Code:</label>
                  <div className="relative">
                    <input
                      type={showNewCode ? 'text' : 'password'}
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      placeholder="Enter new code..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 pr-8 text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewCode(!showNewCode)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showNewCode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Confirm New Code:</label>
                  <input
                    type={showNewCode ? 'text' : 'password'}
                    value={confirmNewCode}
                    onChange={(e) => setConfirmNewCode(e.target.value)}
                    placeholder="Confirm new code..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingSettings || !newCode.trim() || !confirmNewCode.trim()}
                  className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-lg text-xs font-mono transition"
                >
                  {isSavingSettings ? 'Saving...' : 'Save New Secret Code'}
                </button>
              </form>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleRelockClick}
                  className="w-full py-2.5 px-4 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-600/40 font-mono text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Lock Security Session</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Enter your secret authorization code to access the owner security controls, change your passcode, or configure download permissions.
              </p>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  Secret Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter secret authorization code..."
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

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  <span>Verify Secret Code</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
