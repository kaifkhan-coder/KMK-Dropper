import React, { useState } from 'react';
import { Cloud, Trash2, Download, ArrowRight, X, Clock, HardDrive, RefreshCw, Plus, Check } from 'lucide-react';
import { CloudPackage } from '../utils/cloudSync';
import { QueuedFile } from '../types';

interface CloudVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  packages: CloudPackage[];
  isLoading: boolean;
  onRefresh: () => void;
  onRestorePackage: (pkg: CloudPackage) => void;
  onDeletePackage: (id: string) => void;
  onSaveCurrentStaging: (title: string) => Promise<void>;
  currentStagedFilesCount: number;
}

export const CloudVaultModal: React.FC<CloudVaultModalProps> = ({
  isOpen,
  onClose,
  packages,
  isLoading,
  onRefresh,
  onRestorePackage,
  onDeletePackage,
  onSaveCurrentStaging,
  currentStagedFilesCount
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStagedFilesCount === 0) return;
    setIsSaving(true);
    try {
      await onSaveCurrentStaging(newTitle.trim() || `Transfer Snapshot ${new Date().toLocaleDateString()}`);
      setNewTitle('');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2">
                <span>Firestore Cloud Package Vault</span>
                <span className="text-[10px] bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                  Cloud Synced
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Workstation: <span className="text-amber-300">Khan Kaif Edition</span> • Firestore Persistent Snapshots
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
              title="Refresh cloud packages"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Snapshot Saver Form */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800">
          <form onSubmit={handleSave} className="flex items-center gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Package snapshot title (e.g. Kaif Release Build v2)"
              className="flex-1 bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSaving || currentStagedFilesCount === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition disabled:opacity-50 shrink-0"
              title={currentStagedFilesCount === 0 ? 'Stage files first' : 'Save staged files to Firestore'}
            >
              {isSaving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : saveSuccess ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              <span>{saveSuccess ? 'Saved!' : 'Save Staged to Cloud'}</span>
            </button>
          </form>
          {currentStagedFilesCount === 0 && (
            <p className="text-[10px] text-slate-500 font-mono mt-1">
              * Stage files in the desktop workstation to backup a new package to Cloud Firestore.
            </p>
          )}
        </div>

        {/* Packages List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Fetching cloud packages from Firestore...</span>
            </div>
          ) : packages.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-mono text-xs border border-dashed border-slate-800 rounded-xl p-6">
              <Cloud className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-300 font-semibold mb-1">No Cloud Packages Saved Yet</p>
              <p className="text-[11px] text-slate-500">
                You can save your current staged transfer files to Firestore to access them from any device.
              </p>
            </div>
          ) : (
            packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 flex items-center justify-between gap-3 transition"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-slate-100 truncate">
                      {pkg.title}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                      {pkg.isSingleFile ? '1 File' : `${pkg.fileCount} Files`}
                    </span>
                    {pkg.isBypassActive && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400 shrink-0">
                        Clean Bypass
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mt-1">
                    <span>~{(pkg.totalSize / 1024).toFixed(1)} KB</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {new Date(pkg.createdAt).toLocaleDateString()} {new Date(pkg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      onRestorePackage(pkg);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono transition"
                    title="Load these files into your active workstation staging queue"
                  >
                    <span>Restore</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDeletePackage(pkg.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-950/50 text-slate-500 hover:text-rose-400 transition"
                    title="Delete package from cloud"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>{packages.length} Saved Snapshot{packages.length !== 1 ? 's' : ''}</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
