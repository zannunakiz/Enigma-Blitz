import { NextRequest, NextResponse } from 'next/server';
import { generateContextFile } from '@/lib/file-system';

export async function POST(request: NextRequest) {
  try {
    let body: Record<string, unknown> = {};
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload received.' },
        { status: 400 }
      );
    }

    const paths = body?.paths;

    if (!Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one file path must be provided to create context.' },
        { status: 400 }
      );
    }

    const validPaths = paths.filter((p): p is string => typeof p === 'string');
    const result = generateContextFile(validPaths);

    return NextResponse.json(
      {
        success: true,
        message: `Context.txt successfully created with ${result.count} selected files.`,
        count: result.count,
        filePath: result.filePath,
        content: result.content
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Failed to generate Context.txt file.';
    return NextResponse.json(
      { success: false, error: errMessage },
      { status: 500 }
    );
  }
}
