'use client';

import { FolderSync, Layers } from 'lucide-react';
import React from 'react';

interface HeaderProps {
  onRefresh: () => void;
  selectedCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, selectedCount }) => {
  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-zinc-800 text-zinc-100 border border-zinc-700/50">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-base tracking-tight text-zinc-100">
                EnigmaBlitz
              </h1>
              <span className="text-[10px] uppercase font-mono font-medium tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                Prompt Context
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              Context Compiler for Prompt Engineering
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
            <span>Root:</span>
            <code className="text-zinc-200 font-mono">PROJECT_CONTEXT</code>
          </div>

          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 transition-colors"
            title="Refresh directory view"
          >
            <FolderSync className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Sync</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-100 text-zinc-950 font-medium text-xs">
            <span>{selectedCount} Selected</span>
          </div>
        </div>
      </div>
    </header>
  );
};
