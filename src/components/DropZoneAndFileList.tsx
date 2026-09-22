import React, { useRef, useState } from 'react';
import { UploadCloud, FileCode, FileText, FileSpreadsheet, File, Trash2, Eye, Plus, Sparkles, AlertCircle, QrCode, FileCheck, CloudUpload, Box } from 'lucide-react';
import { QueuedFile } from '../types';
import { isTextFile, is3DAnimationAsset } from '../utils/watermark';
import { INITIAL_SAMPLE_FILES } from '../utils/sampleFiles';

interface DropZoneAndFileListProps {
  files: QueuedFile[];
  onAddFiles: (newFiles: QueuedFile[]) => void;
  onRemoveFile: (fileId: string) => void;
  onClearFiles: () => void;
  onInspectFile: (file: QueuedFile) => void;
  isBypassActive: boolean;
  selectedQrFileId?: string | null;
  onSelectQrFile?: (fileId: string | null) => void;
  onOpenSaveToCloud?: () => void;
}

export const DropZoneAndFileList: React.FC<DropZoneAndFileListProps> = ({
  files,
  onAddFiles,
  onRemoveFile,
  onClearFiles,
  onInspectFile,
  isBypassActive,
  selectedQrFileId,
  onSelectQrFile,
  onOpenSaveToCloud
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showCustomSnippetModal, setShowCustomSnippetModal] = useState(false);
  const [snippetName, setSnippetName] = useState('MyCustomAlgorithm.java');
  const [snippetContent, setSnippetContent] = useState(`public class MyCustomAlgorithm {
    public static void main(String[] args) {
        System.out.println("Hello from Local Secure Transfer via Khan Kaif Protocol!");
    }
}`);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processDroppedFiles = async (fileList: FileList) => {
    const newQueuedFiles: QueuedFile[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      const isText = isTextFile(f.name, f.type);
      let textContent: string | undefined = undefined;

      if (isText) {
        try {
          textContent = await f.text();
        } catch {
          // If read fails as text, keep as binary
        }
      }

      newQueuedFiles.push({
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: f.name,
        size: f.size,
        type: f.type || 'application/octet-stream',
        extension: f.name.split('.').pop() || '',
        isText: isText && textContent !== undefined,
        content: textContent,
        binaryBlob: textContent === undefined ? f : undefined,
        addedAt: new Date(),
        status: 'staged'
      });
    }

    if (newQueuedFiles.length > 0) {
      onAddFiles(newQueuedFiles);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processDroppedFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processDroppedFiles(e.target.files);
      // Reset input value so same files can be re-added if desired
      e.target.value = '';
    }
  };

  const handleCreateSnippet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!snippetName.trim()) return;

    const isText = isTextFile(snippetName);
    const newFile: QueuedFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: snippetName.trim(),
      size: new TextEncoder().encode(snippetContent).length,
      type: 'text/plain',
      extension: snippetName.split('.').pop() || '',
      isText: true,
      content: snippetContent,
      addedAt: new Date(),
      status: 'staged'
    };

    onAddFiles([newFile]);
    setShowCustomSnippetModal(false);
    setSnippetName('NewFile.txt');
    setSnippetContent('');
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileIcon = (fileName: string, isText: boolean) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'kaif') {
      return <Sparkles className="w-4 h-4 text-amber-300" />;
    }
    if (is3DAnimationAsset(fileName)) {
      return <Box className="w-4 h-4 text-cyan-400" />;
    }
    if (ext === 'java' || ext === 'py' || ext === 'js' || ext === 'ts' || ext === 'cpp') {
      return <FileCode className="w-4 h-4 text-emerald-400" />;
    }
    if (ext === 'csv' || ext === 'xlsx') {
      return <FileSpreadsheet className="w-4 h-4 text-cyan-400" />;
    }
    if (isText) {
      return <FileText className="w-4 h-4 text-amber-400" />;
    }
    return <File className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col h-full">
      {/* Visual Drag and Drop Staging Zone */}
      <div
        id="drag-and-drop-zone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 select-none ${
          isDragging
            ? 'border-amber-400 bg-amber-950/20 scale-[0.99]'
            : 'border-slate-700 hover:border-slate-500 bg-slate-950/50 hover:bg-slate-950/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-amber-400 border border-slate-700">
            <UploadCloud className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              Drag & Drop Multiple Files Here
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Supports .java, .py, .txt, .csv, .js, .pdf, archives, or any binary assets
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-md border border-slate-700 font-mono transition">
              Browse From Computer...
            </span>
          </div>
        </div>
      </div>

      {/* List Header & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            Staged Queue ({files.length})
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">
            {formatSize(files.reduce((acc, f) => acc + f.size, 0))} total
          </span>

          {files.length === 1 && (
            <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 rounded text-[10px] font-mono flex items-center gap-1">
              <FileCheck className="w-3 h-3" />
              <span>Single File: Kept as-is (No .zip)</span>
            </span>
          )}

          {files.length > 1 && (
            <span className="px-2 py-0.5 bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 rounded text-[10px] font-mono">
              Multi-File: Bundled as .zip
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onOpenSaveToCloud && files.length > 0 && (
            <button
              id="btn-save-to-cloud-vault"
              onClick={onOpenSaveToCloud}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 text-xs rounded-md border border-cyan-800/60 font-mono transition"
              title="Save staged files to Cloud Firestore Vault"
            >
              <CloudUpload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cloud Backup</span>
            </button>
          )}

          <button
            id="btn-create-snippet"
            onClick={() => setShowCustomSnippetModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-md border border-slate-700 font-mono transition"
            title="Create a custom in-memory code or text file"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>New Snippet</span>
          </button>

          {files.length > 0 && (
            <button
              id="btn-clear-queue"
              onClick={onClearFiles}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs rounded-md border border-rose-800/60 font-mono transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Queued Files Table */}
      <div className="mt-3 flex-1 overflow-y-auto max-h-[340px] border border-slate-800 rounded-lg bg-slate-950/60 divide-y divide-slate-800/60">
        {files.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-300 font-mono font-semibold">No files staged in queue.</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
              Drop files above, click &quot;Browse From Computer&quot;, or create a custom code snippet.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setShowCustomSnippetModal(true)}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-mono transition"
              >
                + New Snippet
              </button>
              <button
                onClick={() => onAddFiles(INITIAL_SAMPLE_FILES)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-mono transition"
                title="Optional: Load demo test files on-demand"
              >
                Load Demo Files
              </button>
            </div>
          </div>
        ) : (
          files.map((file, idx) => (
            <div
              key={file.id}
              className={`flex items-center justify-between p-2.5 transition text-xs font-mono group ${
                selectedQrFileId === file.id ? 'bg-amber-950/20 border-l-2 border-amber-500' : 'hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                <span className="text-slate-600 text-[10px] w-5 text-right shrink-0">
                  {idx + 1}.
                </span>
                <div className="shrink-0">{getFileIcon(file.name, file.isText)}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-slate-200 font-medium truncate flex items-center gap-2">
                    <span>{file.name}</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      ({formatSize(file.size)})
                    </span>
                    {selectedQrFileId === file.id && (
                      <span className="text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                        QR Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span className="capitalize">{file.extension || 'binary'}</span>
                    <span>•</span>
                    {file.isText ? (
                      <span className={isBypassActive ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                        {isBypassActive ? 'Clean Stream (Bypass Active)' : 'Line 1 Header Watermark'}
                      </span>
                    ) : (
                      <span className="text-cyan-400">
                        {isBypassActive ? 'Clean Binary Entry' : 'Zip Manifest Signature'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Specific File QR Code Selector */}
                <button
                  onClick={() => onSelectQrFile?.(selectedQrFileId === file.id ? null : file.id)}
                  className={`p-1.5 rounded transition ${
                    selectedQrFileId === file.id
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'hover:bg-slate-800 text-slate-400 hover:text-amber-400'
                  }`}
                  title={
                    selectedQrFileId === file.id
                      ? "Currently generating QR for this file (Click to reset to package)"
                      : `Generate QR code specifically for '${file.name}'`
                  }
                >
                  <QrCode className="w-3.5 h-3.5" />
                </button>

                {file.isText && (
                  <button
                    onClick={() => onInspectFile(file)}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-amber-400 rounded transition"
                    title="Inspect file content and watermark status"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => onRemoveFile(file.id)}
                  className="p-1.5 hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 rounded transition"
                  title="Remove from queue"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Creator Modal for Snippets */}
      {showCustomSnippetModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-150">
            <h3 className="text-sm font-bold text-slate-100 font-mono mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Create Custom Code / Text File</span>
            </h3>

            <form onSubmit={handleCreateSnippet} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">File Name & Extension:</label>
                <input
                  type="text"
                  value={snippetName}
                  onChange={(e) => setSnippetName(e.target.value)}
                  placeholder="e.g. Solution.java, dataset.csv"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">File Contents:</label>
                <textarea
                  rows={8}
                  value={snippetContent}
                  onChange={(e) => setSnippetContent(e.target.value)}
                  placeholder="Paste or write file contents here..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none focus:border-amber-500 font-mono text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCustomSnippetModal(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded text-xs transition"
                >
                  Add to Staging
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
