import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';
import { sanitizeInput } from '@/lib/kdpCompliance';
import { getAvailableSizes, type BookSize } from '@/lib/kdpSizes';
import type { Audience } from '@/lib/kdpCompliance/promptBuilder';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { book_size, page_count, audience, niche, description } = body;

    // Validate inputs
    if (!book_size || !getAvailableSizes().includes(book_size as BookSize)) {
      return NextResponse.json(
        { error: 'Invalid book_size' },
        { status: 400 }
      );
    }

    if (!page_count || page_count < 1 || page_count > 100) {
      return NextResponse.json(
        { error: 'page_count must be between 1 and 100' },
        { status: 400 }
      );
    }

    if (!audience || !['toddlers', 'kids', 'adults'].includes(audience)) {
      return NextResponse.json(
        { error: 'Invalid audience' },
        { status: 400 }
      );
    }

    // Sanitize input (Layer 2: Input Sanitization)
    if (niche) {
      const sanitization = sanitizeInput(niche);
      if (!sanitization.isValid) {
        return NextResponse.json(
          { error: sanitization.reason },
          { status: 400 }
        );
      }
    }

    if (description) {
      const sanitization = sanitizeInput(description);
      if (!sanitization.isValid) {
        return NextResponse.json(
          { error: sanitization.reason },
          { status: 400 }
        );
      }
    }

    // Create job
    const { data: job, error } = await supabaseClient
      .from('jobs')
      .insert({
        user_id: user.id,
        status: 'pending',
        book_size,
        page_count,
        audience,
        niche: niche || null,
        description: description || null,
        progress_current: 0,
        progress_total: page_count,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create job:', error);
      return NextResponse.json(
        { error: 'Failed to create job' },
        { status: 500 }
      );
    }

    // Audit log
    await supabaseClient.from('audit_logs').insert({
      user_id: user.id,
      action: 'job_created',
      resource_type: 'job',
      resource_id: job.id,
      metadata: { book_size, page_count, audience },
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error: any) {
    console.error('Job creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('id');

    if (jobId) {
      // Get single job
      const { data: job, error } = await supabaseClient
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .eq('user_id', user.id)
        .single();

      if (error || !job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }

      return NextResponse.json({ job });
    } else {
      // Get user's jobs
      const { data: jobs, error } = await supabaseClient
        .from('jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch jobs' },
          { status: 500 }
        );
      }

      return NextResponse.json({ jobs });
    }
  } catch (error: any) {
    console.error('Job fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
