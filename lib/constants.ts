export const PROJECT_CONTEXT_DIR_NAME = 'PROJECT_CONTEXT';
export const CONTEXT_FILE_NAME = 'Context.txt';

export const DEFAULT_IGNORE_PATTERNS: string[] = [
  'node_modules',
  'nodemodule',
  '.git',
  '.next',
  'dist',
  'build',
  'out',
  '.DS_Store',
  'Context.txt',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  '.vscode',
  '.idea'
];

export interface FileItem {
  name: string;
  relativePath: string;
  isDirectory: boolean;
  sizeBytes?: number;
  extension?: string;
  ignored: boolean;
  childrenCount?: number;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface FSResponse {
  currentPath: string;
  breadcrumbs: BreadcrumbItem[];
  items: FileItem[];
  ignoredCount: number;
}
