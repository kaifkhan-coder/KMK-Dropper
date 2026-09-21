import React, { useState } from 'react';
import { Coffee, Copy, Check, Download, FileCode, FolderTree, Terminal } from 'lucide-react';
import { JAVA_PROJECT_FILES, JavaFileDefinition } from '../utils/javaSourceCode';

interface JavaSourceViewerProps {
  onExportProjectZip: () => void;
}

export const JavaSourceViewer: React.FC<JavaSourceViewerProps> = ({ onExportProjectZip }) => {
  const [selectedFile, setSelectedFile] = useState<JavaFileDefinition>(JAVA_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[740px]">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
              <span>Complete Java Architecture Suite (Senior Engineer Edition)</span>
              <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded">
                Java 17/21 + FlatLaf + ZXing
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Pure modular Java separation: Desktop Swing GUI, \`com.sun.net.httpserver\` micro-server, \`java.util.zip\`, and watermark security.
            </p>
          </div>
        </div>

        <button
          id="btn-download-full-maven-project"
          onClick={onExportProjectZip}
          className="flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition shadow-md font-mono"
        >
          <Download className="w-4 h-4" />
          <span>Download Maven Project (.zip)</span>
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left File Tree Navigation */}
        <div className="w-full md:w-72 bg-slate-950/80 border-r border-slate-800 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-800/80 text-xs font-mono text-slate-400 flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-slate-500" />
            <span className="font-semibold uppercase tracking-wider">Project Files</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {JAVA_PROJECT_FILES.map((file) => (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left p-2 rounded-lg font-mono text-xs transition flex items-center gap-2.5 ${
                  selectedFile.path === file.path
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <FileCode className={`w-4 h-4 shrink-0 ${
                  selectedFile.path === file.path ? 'text-amber-400' : 'text-slate-600'
                }`} />
                <div className="truncate">
                  <div className="truncate">{file.fileName}</div>
                  <div className="text-[10px] text-slate-500 truncate font-normal">
                    {file.description}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Quick Maven run snippet */}
          <div className="p-3 border-t border-slate-800 bg-slate-950 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Terminal Run Command:</span>
            </div>
            <code className="block bg-slate-900 p-1.5 rounded border border-slate-800 text-emerald-400 text-[10px]">
              mvn clean package && java -jar target/multi-file-qr-zip-2.4.0.jar
            </code>
          </div>
        </div>

        {/* Right Code Display Pane */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          {/* File Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/60 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-slate-500">{selectedFile.path}</span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 text-xs transition font-mono"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Source!' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Code Viewer */}
          <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-200 leading-relaxed select-text bg-slate-950/90">
            <pre className="whitespace-pre">
              {selectedFile.code}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
