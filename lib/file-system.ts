import fs from 'fs';
import path from 'path';
import {
  PROJECT_CONTEXT_DIR_NAME,
  CONTEXT_FILE_NAME,
  DEFAULT_IGNORE_PATTERNS,
  FileItem,
  BreadcrumbItem,
  FSResponse
} from './constants';

export function getProjectContextRoot(): string {
  const root = path.join(process.cwd(), PROJECT_CONTEXT_DIR_NAME);
  if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }
  return root;
}

export function isIgnored(
  itemName: string,
  customIgnores: string[] = DEFAULT_IGNORE_PATTERNS
): boolean {
  const normalized = itemName.toLowerCase().trim();
  return customIgnores.some((pattern) => {
    const p = pattern.toLowerCase().trim();
    if (p.startsWith('*.')) {
      const ext = p.substring(1);
      return normalized.endsWith(ext);
    }
    return normalized === p || normalized.startsWith(`${p}/`) || normalized.startsWith(`${p}\\`);
  });
}

export function sanitizeSubPath(subPath: string = ''): string {
  const root = getProjectContextRoot();
  const normalizedSubPath = path.normalize(subPath).replace(/^(\.\.[\/\\])+/, '');
  const absolutePath = path.join(root, normalizedSubPath);

  if (!absolutePath.startsWith(root)) {
    return '';
  }

  return path.relative(root, absolutePath);
}

export function getDirectoryContents(
  subPath: string = '',
  customIgnores: string[] = DEFAULT_IGNORE_PATTERNS
): FSResponse {
  const root = getProjectContextRoot();
  const safeSubPath = sanitizeSubPath(subPath);
  const targetDir = path.join(root, safeSubPath);

  if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
    throw new Error(`Directory not found: ${subPath}`);
  }

  const entries = fs.readdirSync(targetDir, { withFileTypes: true });
  const items: FileItem[] = [];
  let ignoredCount = 0;

  for (const entry of entries) {
    const entryRelativePath = safeSubPath
      ? path.join(safeSubPath, entry.name).replace(/\\/g, '/')
      : entry.name;

    const ignored = isIgnored(entry.name, customIgnores);

    if (ignored) {
      ignoredCount++;
      continue;
    }

    const fullPath = path.join(targetDir, entry.name);
    let sizeBytes: number | undefined;
    let childrenCount: number | undefined;

    try {
      const stats = fs.statSync(fullPath);
      if (entry.isDirectory()) {
        const subEntries = fs.readdirSync(fullPath);
        childrenCount = subEntries.filter((e) => !isIgnored(e, customIgnores)).length;
      } else {
        sizeBytes = stats.size;
      }
    } catch {
      
    }

    const ext = entry.isFile() ? path.extname(entry.name).slice(1) : undefined;

    items.push({
      name: entry.name,
      relativePath: entryRelativePath,
      isDirectory: entry.isDirectory(),
      sizeBytes,
      extension: ext,
      ignored: false,
      childrenCount
    });
  }

  items.sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
  });

  const pathSegments = safeSubPath ? safeSubPath.split(/[/\\]/).filter(Boolean) : [];
  const breadcrumbs: BreadcrumbItem[] = [{ name: PROJECT_CONTEXT_DIR_NAME, path: '' }];
  let accumulatedPath = '';

  for (const seg of pathSegments) {
    accumulatedPath = accumulatedPath ? `${accumulatedPath}/${seg}` : seg;
    breadcrumbs.push({ name: seg, path: accumulatedPath });
  }

  return {
    currentPath: safeSubPath.replace(/\\/g, '/'),
    breadcrumbs,
    items,
    ignoredCount
  };
}

export function getAllFilesRecursively(
  subPath: string = '',
  customIgnores: string[] = DEFAULT_IGNORE_PATTERNS
): string[] {
  const root = getProjectContextRoot();
  const safeSubPath = sanitizeSubPath(subPath);
  const targetDir = path.join(root, safeSubPath);
  const filePaths: string[] = [];

  if (!fs.existsSync(targetDir)) return filePaths;

  function traverse(dirPath: string, currentRel: string) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (isIgnored(entry.name, customIgnores)) continue;

      const fullEntryPath = path.join(dirPath, entry.name);
      const relEntryPath = currentRel ? `${currentRel}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        traverse(fullEntryPath, relEntryPath);
      } else if (entry.isFile()) {
        filePaths.push(relEntryPath.replace(/\\/g, '/'));
      }
    }
  }

  traverse(targetDir, safeSubPath.replace(/\\/g, '/'));
  return filePaths;
}

export function searchFiles(
  query: string,
  customIgnores: string[] = DEFAULT_IGNORE_PATTERNS
): FileItem[] {
  const root = getProjectContextRoot();
  const results: FileItem[] = [];
  const q = query.trim().toLowerCase();

  if (!q) return results;

  function traverse(dirPath: string, currentRel: string) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (isIgnored(entry.name, customIgnores)) continue;

      const relEntryPath = currentRel ? `${currentRel}/${entry.name}` : entry.name;
      const fullEntryPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        traverse(fullEntryPath, relEntryPath);
      }

      const haystack = `${relEntryPath.toLowerCase()} ${entry.name.toLowerCase()}`;
      if (!haystack.includes(q)) continue;

      const stats = entry.isFile() ? fs.statSync(fullEntryPath) : undefined;
      results.push({
        name: entry.name,
        relativePath: relEntryPath,
        isDirectory: entry.isDirectory(),
        sizeBytes: stats?.size,
        extension: entry.isFile() ? path.extname(entry.name).slice(1) : undefined,
        ignored: false
      });
    }
  }

  traverse(root, '');
  return results;
}

export function generateContextFile(selectedRelativePaths: string[]): {
  filePath: string;
  content: string;
  count: number;
} {
  const root = getProjectContextRoot();
  const contentBlocks: string[] = [];

  selectedRelativePaths.forEach((relPath, index) => {
    const safePath = sanitizeSubPath(relPath);
    const fullPath = path.join(root, safePath);
    const displayPath = `root/${safePath.replace(/\\/g, '/')}`;

    let fileContent = '';
    try {
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        fileContent = fs.readFileSync(fullPath, 'utf-8');
      } else {
        fileContent = `File not found or unreadable: ${relPath}`;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      fileContent = `Error reading file: ${msg}`;
    }

    const block = `File ${index + 1}: ${displayPath}:\n${fileContent}`;
    contentBlocks.push(block);
  });

  const finalOutput = `${contentBlocks.join('\n\n')}\n\n{Context end}`;
  const contextFilePath = path.join(root, CONTEXT_FILE_NAME);

  fs.writeFileSync(contextFilePath, finalOutput, 'utf-8');

  return {
    filePath: contextFilePath,
    content: finalOutput,
    count: selectedRelativePaths.length
  };
}
