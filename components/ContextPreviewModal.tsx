'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Download, FileText, Sparkles } from 'lucide-react';

interface ContextPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  filePath: string;
}

export const ContextPreviewModal: React.FC<ContextPreviewModalProps> = ({
  isOpen,
  onClose,
  content,
  filePath
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = 'Context.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
        <div className="p-3.5 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-zinc-800 text-zinc-200">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-xs text-zinc-100">Generated Context.txt</h3>
              <p className="text-[11px] text-zinc-400 font-mono truncate max-w-md">
                {filePath || 'PROJECT_CONTEXT/Context.txt'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-zinc-100" />
                  <span className="text-zinc-100">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-zinc-100 hover:bg-white text-zinc-950 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-zinc-950 text-zinc-200 font-mono text-xs leading-relaxed">
          <pre className="whitespace-pre-wrap break-all select-all font-mono">
            {content}
          </pre>
        </div>

        <div className="p-3 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
            <span>Ready for ChatGPT, Claude, DeepSeek, or Gemini context window</span>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-zinc-300 font-medium hover:underline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
