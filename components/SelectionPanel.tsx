'use client';

import React from 'react';
import {
  FileText,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Eye,
  Layers
} from 'lucide-react';

interface SelectionPanelProps {
  selectedFiles: string[];
  onRemove: (path: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onClearAll: () => void;
  onCreateContext: () => void;
  isCreating: boolean;
  onOpenPreview: () => void;
  createdMessage: string | null;
}

export const SelectionPanel: React.FC<SelectionPanelProps> = ({
  selectedFiles,
  onRemove,
  onMoveUp,
  onMoveDown,
  onClearAll,
  onCreateContext,
  isCreating,
  onOpenPreview,
  createdMessage
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyPaths = () => {
    if (selectedFiles.length === 0) return;
    const text = selectedFiles.map((p, i) => `[${i + 1}] root/${p}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-zinc-800 bg-zinc-900/40 shadow-sm overflow-hidden">
      <div className="p-3.5 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-zinc-400" />
          <h2 className="text-xs font-semibold text-zinc-200">Selected Files</h2>
          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-xs font-mono font-medium border border-zinc-700">
            {selectedFiles.length}
          </span>
        </div>

        {selectedFiles.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPaths}
              className="p-1 rounded border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 text-xs transition-colors"
              title="Copy file list as text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-zinc-200" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClearAll}
              className="text-xs text-zinc-400 hover:text-zinc-100 transition-colors px-2 py-0.5 rounded hover:bg-zinc-800"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/40 p-2 space-y-1 min-h-[300px]">
        {selectedFiles.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-2">
            <div className="p-2.5 rounded-lg bg-zinc-800/60 border border-zinc-700/50 text-zinc-400">
              <FileText className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-zinc-400">No files added yet.</p>
            <p className="text-[11px] text-zinc-500 max-w-xs">
              Select files or folders inside <code className="font-mono text-zinc-300">PROJECT_CONTEXT</code> to compile your context.
            </p>
          </div>
        ) : (
          selectedFiles.map((fileRelPath, index) => (
            <div
              key={fileRelPath}
              className="flex items-center justify-between p-2 rounded-lg border border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="text-[11px] font-mono font-semibold text-zinc-400 w-5 text-center flex-shrink-0">
                  #{index + 1}
                </span>
                <div className="truncate">
                  <p className="text-xs font-medium text-zinc-200 truncate">
                    {fileRelPath.split('/').pop()}
                  </p>
                  <p className="text-[10px] font-mono text-zinc-500 truncate">
                    root/{fileRelPath}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 pl-2">
                <button
                  onClick={() => onMoveUp(index)}
                  disabled={index === 0}
                  className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 disabled:opacity-30 disabled:pointer-events-none"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onMoveDown(index)}
                  disabled={index === selectedFiles.length - 1}
                  className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 disabled:opacity-30 disabled:pointer-events-none"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onRemove(fileRelPath)}
                  className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-3.5 border-t border-zinc-800 bg-zinc-900/80 space-y-2.5">
        {createdMessage && (
          <div className="p-2.5 rounded border border-zinc-700 bg-zinc-800/80 text-zinc-200 text-xs flex items-center justify-between gap-2">
            <span className="truncate">{createdMessage}</span>
            <button
              onClick={onOpenPreview}
              className="flex items-center gap-1 font-medium underline underline-offset-2 hover:text-white flex-shrink-0"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>
        )}

        <button
          onClick={onCreateContext}
          disabled={selectedFiles.length === 0 || isCreating}
          className="w-full py-2.5 px-4 rounded-lg font-medium text-xs text-zinc-950 bg-zinc-100 hover:bg-white active:bg-zinc-200 transition-all duration-150 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isCreating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-950" />
              <span>Compiling Context.txt...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
              <span>
                Create Context ({selectedFiles.length} selected)
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
