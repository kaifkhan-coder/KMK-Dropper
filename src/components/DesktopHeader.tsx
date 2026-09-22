import React from 'react';
import { Coffee, Shield, Terminal, Smartphone, Download, HardDrive, Cloud, Award } from 'lucide-react';

interface DesktopHeaderProps {
  activeTab: 'gui' | 'java-source' | 'mobile';
  setActiveTab: (tab: 'gui' | 'java-source' | 'mobile') => void;
  isBypassActive: boolean;
  stagedFilesCount: number;
  serverRunning: boolean;
  onExportJavaProject: () => void;
  onOpenCloudVault?: () => void;
  cloudPackagesCount?: number;
  onOpenKhanKaifModal?: () => void;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  activeTab,
  setActiveTab,
  isBypassActive,
  stagedFilesCount,
  serverRunning,
  onExportJavaProject,
  onOpenCloudVault,
  cloudPackagesCount = 0,
  onOpenKhanKaifModal
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
      {/* Desktop Window Title Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800/80 text-xs select-none">
        <div className="flex items-center gap-2">
          {/* Mac / Modern OS Window Dots */}
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block border border-rose-600/50" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block border border-amber-600/50" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block border border-emerald-600/50" />
          </div>

          <div className="flex items-center gap-2 text-slate-300 font-mono font-medium">
            <Coffee className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Multi-File ZIP Package Generator via QR</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60 text-[10px]">
              Java Swing / FlatLaf v2.4
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${serverRunning ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
            <span className={serverRunning ? 'text-emerald-400' : 'text-rose-400'}>
              {serverRunning ? 'Micro-Server: 8080 [ACTIVE]' : 'Micro-Server: [STOPPED]'}
            </span>
          </div>
          <span className="text-slate-700">•</span>
          
          {onOpenKhanKaifModal ? (
            <button
              onClick={onOpenKhanKaifModal}
              className="flex items-center gap-1.5 text-slate-300 hover:text-amber-300 bg-slate-900 hover:bg-amber-950/40 border border-slate-700 hover:border-amber-500/50 px-2 py-0.5 rounded transition"
              title="Inspect Khan Kaif Cryptographic Protocol & Author Verification"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Created by <strong className="text-amber-300">Khan Kaif</strong></span>
            </button>
          ) : (
            <div className="text-slate-300">
              Author: <span className="text-amber-300 font-semibold">Khan Kaif</span>
            </div>
          )}

          {onOpenCloudVault && (
            <>
              <span className="text-slate-700">•</span>
              <button
                id="btn-cloud-vault-open"
                onClick={onOpenCloudVault}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 text-[11px] font-mono border border-slate-700 transition"
                title="Open Cloud Package Vault & Saved Archives"
              >
                <Cloud className="w-3 h-3 text-cyan-400" />
                <span>Snapshots</span>
                {cloudPackagesCount > 0 && (
                  <span className="px-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/60 text-[9px] font-bold">
                    {cloudPackagesCount}
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Navigation & Action Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 gap-3">
        <div className="flex items-center gap-2">
          <button
            id="tab-gui-workstation"
            onClick={() => setActiveTab('gui')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium text-xs transition-all ${
              activeTab === 'gui'
                ? 'bg-amber-500 text-slate-950 shadow-md font-semibold shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Desktop Workstation</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">
              {stagedFilesCount}
            </span>
          </button>

          <button
            id="tab-java-source"
            onClick={() => setActiveTab('java-source')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium text-xs transition-all ${
              activeTab === 'java-source'
                ? 'bg-amber-500 text-slate-950 shadow-md font-semibold shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>Java Source Code Suite</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 border border-slate-700">
              7 Files + POM
            </span>
          </button>

          <button
            id="tab-mobile-preview"
            onClick={() => setActiveTab('mobile')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium text-xs transition-all ${
              activeTab === 'mobile'
                ? 'bg-amber-500 text-slate-950 shadow-md font-semibold shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Mobile Receiver View</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Security Badge in Header */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono border ${
            isBypassActive 
              ? 'bg-emerald-950/70 border-emerald-600/60 text-emerald-300' 
              : 'bg-amber-950/60 border-amber-600/60 text-amber-300'
          }`}>
            <Shield className="w-3.5 h-3.5" />
            <span>{isBypassActive ? 'BYPASS ACTIVE (Clean Export)' : 'WATERMARK ENFORCED'}</span>
          </div>

          <button
            id="btn-export-java-project"
            onClick={onExportJavaProject}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-mono border border-slate-700 transition"
            title="Download full Maven Java Project with source files, pom.xml, and FlatLaf setup"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Java Project (.zip)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
