import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if image provider is configured (lazy import to avoid build-time issues)
    const { getImageProvider } = await import('@/lib/imageProviders');
    
    try {
      getImageProvider();
      return NextResponse.json(
        {
          status: 'ready',
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return NextResponse.json(
        {
          status: 'not ready',
          timestamp: new Date().toISOString(),
          error: err.message,
        },
        { status: 503 }
      );
    }
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: err.message,
      },
      { status: 500 }
    );
  }
}
