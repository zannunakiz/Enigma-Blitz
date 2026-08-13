'use client';

import { FSResponse, FileItem } from '@/lib/constants';
import {
  Check,
  ChevronRight,
  EyeOff,
  File,
  FileCode,
  FileText,
  Folder,
  FolderPlus,
  HardDrive,
  Plus,
  RefreshCw,
  Search
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface FolderExplorerProps {
  data: FSResponse | null;
  loading: boolean;
  onNavigate: (path: string) => void;
  onAddFile: (path: string) => void;
  onAddFolder: (path: string) => void;
  selectedPaths: Set<string>;
  addingFolder: string | null;
}

export const FolderExplorer: React.FC<FolderExplorerProps> = ({
  data,
  loading,
  onNavigate,
  onAddFile,
  onAddFolder,
  selectedPaths,
  addingFolder
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<FileItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const term = searchTerm.trim();
    if (!term) {
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/fs?action=search&query=${encodeURIComponent(term)}`);
        const json = await res.json();
        if (!cancelled) {
          setSearchResults(json.success ? json.files || [] : []);
        }
      } catch {
        if (!cancelled) {
          setSearchResults([]);
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchTerm]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/50">
        <RefreshCw className="w-6 h-6 text-zinc-400 animate-spin" />
        <p className="text-xs text-zinc-400 font-medium">Scanning PROJECT_CONTEXT...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2">
        <p className="text-xs text-zinc-400">Unable to load directory structure.</p>
      </div>
    );
  }

  const isSearchMode = searchTerm.trim().length > 0;

  const filteredItems = data.items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedItems = isSearchMode ? searchResults : filteredItems;

  const getFileIcon = (item: FileItem) => {
    if (item.isDirectory) return <Folder className="w-4 h-4 text-zinc-300" />;

    const ext = item.extension?.toLowerCase() || '';
    if (['ts', 'tsx', 'js', 'jsx', 'go', 'py', 'java', 'c', 'cpp', 'rs', 'php', 'json', 'html', 'css'].includes(ext)) {
      return <FileCode className="w-4 h-4 text-zinc-400" />;
    }
    if (['txt', 'md', 'doc', 'rst'].includes(ext)) {
      return <FileText className="w-4 h-4 text-zinc-400" />;
    }
    return <File className="w-4 h-4 text-zinc-500" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return null;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-zinc-800 bg-zinc-900/40 shadow-sm overflow-hidden">
      <div className="p-3.5 border-b border-zinc-800 bg-zinc-900/80 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex items-center flex-wrap gap-1 text-xs font-medium">
          <HardDrive className="w-3.5 h-3.5 text-zinc-400 mr-1" />
          {data.breadcrumbs.map((crumb, idx) => {
            const isLast = idx === data.breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.path}>
                {idx > 0 && <ChevronRight className="w-3 h-3 text-zinc-600" />}
                <button
                  onClick={() => onNavigate(crumb.path)}
                  disabled={isLast}
                  className={`px-2 py-1 rounded transition-colors text-xs ${isLast
                      ? 'font-semibold text-zinc-100 bg-zinc-800'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                    }`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        <div className="relative w-full sm:w-44">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search entire project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-xs rounded-md border border-zinc-800 bg-zinc-950 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/40 p-2 space-y-0.5 min-h-75">
        {displayedItems.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500">
            {searchLoading
              ? 'Searching entire project...'
              : isSearchMode
                ? 'No files found anywhere in PROJECT_CONTEXT.'
                : 'This directory is empty.'}
          </div>
        ) : (
          displayedItems.map((item) => {
            const isSelected = selectedPaths.has(item.relativePath);
            const isFolderBusy = addingFolder === item.relativePath;

            return (
              <div
                key={item.relativePath}
                className="group flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
              >
                <div
                  className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                  onClick={() => {
                    if (item.isDirectory) {
                      onNavigate(item.relativePath);
                    }
                  }}
                >
                  <div className="p-1.5 rounded bg-zinc-800/60 group-hover:bg-zinc-800 transition-colors">
                    {getFileIcon(item)}
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs truncate ${item.isDirectory
                            ? 'text-zinc-100 font-medium group-hover:text-white'
                            : 'text-zinc-300'
                          }`}
                      >
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                      <span className="truncate">
                        {isSearchMode
                          ? item.relativePath
                          : item.isDirectory
                            ? 'Folder'
                            : formatFileSize(item.sizeBytes) || 'File'}
                      </span>
                      {!isSearchMode && item.isDirectory && item.childrenCount !== undefined && (
                        <>
                          <span>•</span>
                          <span>{item.childrenCount} items</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-2">
                  {item.isDirectory ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddFolder(item.relativePath);
                      }}
                      disabled={isFolderBusy}
                      className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors disabled:opacity-50"
                      title="Add all non-ignored files in folder"
                    >
                      {isFolderBusy ? (
                        <RefreshCw className="w-3 h-3 animate-spin text-zinc-400" />
                      ) : (
                        <FolderPlus className="w-3 h-3 text-zinc-400" />
                      )}
                      <span className="hidden xs:inline">Add Folder</span>
                    </button>
                  ) : isSelected ? (
                    <span className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded border border-zinc-700 bg-zinc-800 text-zinc-300">
                      <Check className="w-3 h-3 text-zinc-400" />
                      <span>Added</span>
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddFile(item.relativePath);
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded border border-zinc-800 bg-zinc-950 hover:bg-zinc-100 hover:text-zinc-950 hover:border-zinc-100 text-zinc-300 transition-all"
                      title="Add file to context"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {data.ignoredCount > 0 && (
        <div className="p-2.5 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
          <div className="flex items-center gap-1.5">
            <EyeOff className="w-3 h-3 text-zinc-500" />
            <span>
              {data.ignoredCount} item{data.ignoredCount > 1 ? 's' : ''} hidden by ignore filter
            </span>
          </div>
          <span className="font-mono text-[10px] text-zinc-600">node_modules, .git, etc.</span>
        </div>
      )}
    </div>
  );
};
