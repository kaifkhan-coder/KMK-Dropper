import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  Eye, 
  EyeOff, 
  Check, 
  RefreshCw, 
  X, 
  Download, 
  Sliders, 
  AlertCircle,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { 
  verifySecretCode, 
  isDownloadProtectionEnabled, 
  setDownloadProtectionEnabled, 
  updateSecretPasscode, 
  lockSecuritySession, 
  isSessionUnlocked 
} from '../utils/securityConfig';

interface SecurityManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDownloadName?: string;
  onAuthorized?: () => void;
  initialMode?: 'verify' | 'settings';
}

export const SecurityManagerModal: React.FC<SecurityManagerModalProps> = ({
  isOpen,
  onClose,
  targetDownloadName,
  onAuthorized,
  initialMode = 'verify'
}) => {
  const [activeTab, setActiveTab] = useState<'verify' | 'settings'>(initialMode);
  const [enteredCode, setEnteredCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Settings State
  const [isProtectionActive, setIsProtectionActive] = useState(() => isDownloadProtectionEnabled());
  const [newCode, setNewCode] = useState('');
  const [confirmNewCode, setConfirmNewCode] = useState('');
  const [showNewCode, setShowNewCode] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Track if current session has already entered the code
  const [isUnlocked, setIsUnlocked] = useState(() => isSessionUnlocked());

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      setEnteredCode('');
      setNewCode('');
      setConfirmNewCode('');
      const unlocked = isSessionUnlocked();
      setIsUnlocked(unlocked);
      setIsProtectionActive(isDownloadProtectionEnabled());
      // If already unlocked and user requested settings, default to settings tab
      if (unlocked || initialMode === 'settings') {
        setActiveTab(unlocked ? 'settings' : 'verify');
      } else {
        setActiveTab('verify');
      }
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!enteredCode.trim()) {
      setErrorMsg('Please enter the secret authorization code.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      const valid = verifySecretCode(enteredCode.trim());
      setIsVerifying(false);

      if (valid) {
        setIsUnlocked(true);
        setSuccessMsg('Authorization verified! Download unlocked.');
        setEnteredCode('');

        // If a pending download was attached, trigger it now!
        if (onAuthorized) {
          setTimeout(() => {
            onAuthorized();
            onClose();
          }, 600);
        } else {
          // Switch to owner settings tab
          setTimeout(() => {
            setActiveTab('settings');
            setSuccessMsg('');
          }, 800);
        }
      } else {
        setErrorMsg('Access Denied: Invalid secret code. Please verify with the owner.');
      }
    }, 250);
  };

  const handleToggleProtection = async () => {
    setIsSavingSettings(true);
    try {
      const nextState = !isProtectionActive;
      await setDownloadProtectionEnabled(nextState);
      setIsProtectionActive(nextState);
      setSuccessMsg(nextState 
        ? 'Protection ENABLED: Downloads now strictly require the secret code.'
        : 'Protection DISABLED: Anyone can now download files directly without a code.'
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
      setErrorMsg('New code and confirmation code do not match.');
      return;
    }

    setIsSavingSettings(true);
    try {
      await updateSecretPasscode(newCode.trim());
      setSuccessMsg('Secret code successfully updated! Use this new code for future downloads.');
      setNewCode('');
      setConfirmNewCode('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg('Failed to update secret code: ' + err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleLockSession = () => {
    lockSecuritySession();
    setIsUnlocked(false);
    setActiveTab('verify');
    setSuccessMsg('Security session locked.');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden font-sans flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg border ${
              isUnlocked 
                ? 'bg-emerald-950/80 border-emerald-700/70 text-emerald-400' 
                : 'bg-amber-950/80 border-amber-700/70 text-amber-400'
            }`}>
              {isUnlocked ? <ShieldCheck className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-1.5">
                <span>{isUnlocked ? 'Owner Access & Security' : 'Passcode Authorization'}</span>
                {isUnlocked && (
                  <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded font-bold uppercase">
                    Authorized
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {targetDownloadName 
                  ? `Required to download: ${targetDownloadName}`
                  : 'Manage download code and protection controls'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation (If Unlocked as Owner) */}
        {isUnlocked && (
          <div className="flex border-b border-slate-800 bg-slate-950/60 p-1 text-xs font-mono">
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-1.5 text-center rounded-md font-semibold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'settings'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Security Settings</span>
            </button>
            <button
              onClick={() => setActiveTab('verify')}
              className={`flex-1 py-1.5 text-center rounded-md font-semibold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'verify'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Verify / Test</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Notification Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs font-mono flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 text-xs font-mono flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">{successMsg}</div>
            </div>
          )}

          {/* VIEW 1: PASSCODE ENTRY & VERIFICATION */}
          {activeTab === 'verify' && (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs font-mono text-slate-300 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>Confidential Authorization Gate</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Downloads are protected by the owner. Please enter your secret code below to initiate the download.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-slate-300 font-medium">
                  Enter Secret Code:
                </label>
                <div className="relative">
                  <input
                    type={showCode ? 'text' : 'password'}
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value)}
                    placeholder="Enter secret authorization code..."
                    autoFocus
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 pr-10 text-slate-100 text-sm font-mono focus:outline-none focus:border-amber-500 transition shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isVerifying || !enteredCode.trim()}
                  className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2 font-mono"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>{targetDownloadName ? 'Verify & Download' : 'Unlock Access'}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* VIEW 2: OWNER SETTINGS (Change Code & Enable/Disable Protection) */}
          {activeTab === 'settings' && isUnlocked && (
            <div className="space-y-4 font-mono text-xs">
              {/* Feature 1: Enable / Disable Code Requirement for Downloads */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg border ${
                      isProtectionActive 
                        ? 'bg-amber-950/60 border-amber-700/60 text-amber-400' 
                        : 'bg-slate-800 border-slate-700 text-slate-500'
                    }`}>
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-200">Require Code For Downloads</h4>
                      <p className="text-[10px] text-slate-400">
                        {isProtectionActive ? 'Currently Active' : 'Currently Disabled'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleToggleProtection}
                    disabled={isSavingSettings}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      isProtectionActive
                        ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>{isProtectionActive ? 'Enabled' : 'Disabled'}</span>
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed border-t border-slate-900 pt-2">
                  {isProtectionActive
                    ? 'When enabled: Mobile and desktop visitors must enter your secret code before any file or ZIP package can be downloaded.'
                    : 'When disabled: Visitors can download files immediately without any passcode requirement.'}
                </p>
              </div>

              {/* Feature 2: Change Secret Code */}
              <form onSubmit={handleChangeCodeSubmit} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                  <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Change Secret Code</span>
                  </h4>
                  <span className="text-[9px] text-slate-500 font-mono">Owner Private Key</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">New Secret Code:</label>
                  <div className="relative">
                    <input
                      type={showNewCode ? 'text' : 'password'}
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      placeholder="Enter new code..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 pr-8 text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewCode(!showNewCode)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                    >
                      {showNewCode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Confirm New Code:</label>
                  <input
                    type={showNewCode ? 'text' : 'password'}
                    value={confirmNewCode}
                    onChange={(e) => setConfirmNewCode(e.target.value)}
                    placeholder="Re-enter new code to confirm..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingSettings || !newCode.trim() || !confirmNewCode.trim()}
                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-lg text-xs font-mono transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  {isSavingSettings ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving New Code...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save New Secret Code</span>
                    </>
                  )}
                </button>
              </form>

              {/* Lock Session Action */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleLockSession}
                  className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-lg text-[11px] font-mono transition flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock Session Now</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-mono transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
