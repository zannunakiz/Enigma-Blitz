import { NextRequest, NextResponse } from 'next/server';
import { getDirectoryContents, getAllFilesRecursively, searchFiles } from '@/lib/file-system';
import { DEFAULT_IGNORE_PATTERNS } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subPath = searchParams.get('path') || '';
    const action = searchParams.get('action') || 'list';
    const query = searchParams.get('query') || '';
    const rawIgnores = searchParams.get('ignores');

    const customIgnores = rawIgnores
      ? rawIgnores.split(',').map((s) => s.trim()).filter(Boolean)
      : DEFAULT_IGNORE_PATTERNS;

    if (action === 'scan_folder') {
      const files = getAllFilesRecursively(subPath, customIgnores);
      return NextResponse.json({ success: true, files }, { status: 200 });
    }

    if (action === 'search') {
      const files = searchFiles(query, customIgnores);
      return NextResponse.json({ success: true, files }, { status: 200 });
    }

    const data = getDirectoryContents(subPath, customIgnores);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Failed to read directory contents';
    const status = errMessage.includes('not found') ? 404 : 500;
    return NextResponse.json(
      { success: false, error: errMessage },
      { status }
    );
  }
}
