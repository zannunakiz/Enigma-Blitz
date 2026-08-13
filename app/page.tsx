'use client';

import { ContextPreviewModal } from '@/components/ContextPreviewModal';
import { FolderExplorer } from '@/components/FolderExplorer';
import { Header } from '@/components/Header';
import { SelectionPanel } from '@/components/SelectionPanel';
import { FSResponse } from '@/lib/constants';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function Home() {
  const [currentPath, setCurrentPath] = useState<string>('');
  const [fsData, setFsData] = useState<FSResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [addingFolder, setAddingFolder] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [createdMessage, setCreatedMessage] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [generatedFilePath, setGeneratedFilePath] = useState<string>('');

  const fetchDirectory = useCallback(async (subPath: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/fs?path=${encodeURIComponent(subPath)}`);
      const json = await res.json();
      if (json.success) {
        setFsData(json.data);
        setCurrentPath(json.data.currentPath);
      }
    } catch {

    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadInitial() {
      try {
        const res = await fetch('/api/fs?path=');
        const json = await res.json();
        if (!ignore && json.success) {
          setFsData(json.data);
          setCurrentPath(json.data.currentPath);
        }
      } catch {

      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    loadInitial();
    return () => {
      ignore = true;
    };
  }, []);

  const selectedPathsSet = useMemo(() => new Set(selectedFiles), [selectedFiles]);

  const handleAddFile = (filePath: string) => {
    if (!selectedPathsSet.has(filePath)) {
      setSelectedFiles((prev) => [...prev, filePath]);
      setCreatedMessage(null);
    }
  };

  const handleAddFolder = async (folderPath: string) => {
    setAddingFolder(folderPath);
    try {
      const res = await fetch(`/api/fs?action=scan_folder&path=${encodeURIComponent(folderPath)}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.files)) {
        const newFiles = json.files.filter((f: string) => !selectedPathsSet.has(f));
        if (newFiles.length > 0) {
          setSelectedFiles((prev) => [...prev, ...newFiles]);
          setCreatedMessage(null);
        }
      }
    } catch {

    } finally {
      setAddingFolder(null);
    }
  };

  const handleRemoveFile = (filePath: string) => {
    setSelectedFiles((prev) => prev.filter((p) => p !== filePath));
    setCreatedMessage(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setSelectedFiles((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    setSelectedFiles((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
    setCreatedMessage(null);
  };

  const handleCreateContext = async () => {
    if (selectedFiles.length === 0) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths: selectedFiles })
      });
      const json = await res.json();

      if (json.success) {
        setGeneratedContent(json.content);
        setGeneratedFilePath(json.filePath);
        setCreatedMessage(`Context.txt created with ${json.count} files!`);
        setPreviewModalOpen(true);
        fetchDirectory(currentPath);
      } else {
        alert(`Error: ${json.error || 'Failed to create Context.txt'}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      alert(`Error: ${msg}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-zinc-100 selection:text-zinc-950">
      <Header
        onRefresh={() => fetchDirectory(currentPath)}
        selectedCount={selectedFiles.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60">
          <h2 className="text-sm font-semibold tracking-tight text-zinc-100">
            PROJECT_CONTEXT Directory Browser
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-3xl">
            Navigate through files and folders inside <code className="text-zinc-200 font-mono">PROJECT_CONTEXT</code>, add target files, arrange the sequence, and compile them instantly into a single <code className="text-zinc-200 font-mono">Context.txt</code>.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 h-160">
            <FolderExplorer
              data={fsData}
              loading={loading}
              onNavigate={(path) => fetchDirectory(path)}
              onAddFile={handleAddFile}
              onAddFolder={handleAddFolder}
              selectedPaths={selectedPathsSet}
              addingFolder={addingFolder}
            />
          </div>

          <div className="lg:col-span-5 h-160">
            <SelectionPanel
              selectedFiles={selectedFiles}
              onRemove={handleRemoveFile}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onClearAll={handleClearAll}
              onCreateContext={handleCreateContext}
              isCreating={isCreating}
              onOpenPreview={() => setPreviewModalOpen(true)}
              createdMessage={createdMessage}
            />
          </div>
        </div>
      </main>

      <ContextPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        content={generatedContent}
        filePath={generatedFilePath}
      />
    </div>
  );
}
