import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Check database connection
    const { error: dbError } = await supabase.from('jobs').select('id').limit(1);

    // Check environment
    const hasRequiredEnv = !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const status = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: !dbError ? 'connected' : 'disconnected',
        environment: hasRequiredEnv ? 'configured' : 'missing',
      },
    };

    const isHealthy = !dbError && hasRequiredEnv;

    return NextResponse.json(status, {
      status: isHealthy ? 200 : 503,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
      { status: 503 }
    );
  }
}
