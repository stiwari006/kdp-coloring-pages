import { supabase } from '../lib/supabase';
import { generateColoringPage } from '../lib/imageProcessor';
import { uploadImage, uploadFile, createSignedUrl, createZip, createPDF } from '../lib/storage';
import { getPixelSize, type BookSize } from '../lib/kdpSizes';
import { env } from '../lib/env';
import { logger } from '../lib/logger';
import type { Job, User } from '../types/database';

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Check if it's a rate limit error
      const isRateLimit = error.message?.toLowerCase().includes('rate limit');

      if (isRateLimit && attempt < config.maxRetries - 1) {
        const delay = config.baseDelay * Math.pow(2, attempt);
        logger.warn(`Rate limit hit, waiting ${delay}ms before retry`, { attempt: attempt + 1 });
        await sleep(delay);
        continue;
      }

      // If not rate limit or last attempt, throw
      if (attempt === config.maxRetries - 1) {
        throw error;
      }

      // Exponential backoff for other errors
      const delay = config.baseDelay * Math.pow(2, attempt);
      logger.warn(`Retrying after ${delay}ms`, { attempt: attempt + 1, maxRetries: config.maxRetries });
      await sleep(delay);
    }
  }

  throw lastError || new Error('Retry failed');
}

async function updateJobProgress(
  jobId: string,
  current: number,
  total: number,
  status?: 'processing' | 'failed',
  errorMessage?: string
): Promise<void> {
  const update: any = {
    progress_current: current,
    progress_total: total,
    updated_at: new Date().toISOString(),
  };

  if (status) {
    update.status = status;
  }

  if (errorMessage) {
    update.error_message = errorMessage;
  }

  const { error } = await supabase
    .from('jobs')
    .update(update)
    .eq('id', jobId);

  if (error) {
    console.error(`Failed to update job progress: ${error.message}`);
  }
}

async function getUserPlan(userId: string): Promise<'free' | 'pro' | 'enterprise'> {
  const { data, error } = await supabase
    .from('users')
    .select('plan')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.warn(`Could not fetch user plan for ${userId}, defaulting to free`);
    return 'free';
  }

  return data.plan || 'free';
}

async function processJob(job: Job): Promise<void> {
  logger.info(`Processing job ${job.id}`, { jobId: job.id, pageCount: job.page_count });

  try {
    // Update status to processing
    await updateJobProgress(job.id, 0, job.page_count, 'processing');

    // Get user plan
    const userPlan = await getUserPlan(job.user_id);
    const isFreePlan = userPlan === 'free';

    const bookSize = job.book_size as BookSize;
    const { width, height } = getPixelSize(bookSize);

    // Generate all pages
    const pages: Array<{ number: number; buffer: Buffer }> = [];
    const maxConcurrency = env.WORKER_MAX_CONCURRENCY;

    // Process pages with concurrency control
    for (let i = 0; i < job.page_count; i += maxConcurrency) {
      const batch = [];
      for (let j = 0; j < maxConcurrency && i + j < job.page_count; j++) {
        const pageNumber = i + j + 1;
        batch.push(
          retryWithBackoff(
            () =>
              generateColoringPage({
                jobId: job.id,
                pageNumber,
                bookSize,
                audience: job.audience as any,
                niche: job.niche || undefined,
                description: job.description || undefined,
                isFreePlan,
                seed: Date.now(), // Use timestamp as seed for consistency
              }),
            {
              maxRetries: env.WORKER_MAX_RETRIES,
              baseDelay: 1000,
            }
          ).then((result) => ({
            number: pageNumber,
            buffer: result.buffer,
          }))
        );
      }

      const batchResults = await Promise.all(batch);
      pages.push(...batchResults);

      // Update progress
      await updateJobProgress(job.id, pages.length, job.page_count);

      logger.info(`Generated ${pages.length}/${job.page_count} pages`, { jobId: job.id, progress: pages.length });
    }

    // Upload individual PNGs to storage
    const pngPaths: string[] = [];
    for (const page of pages) {
      const path = `jobs/${job.id}/page-${page.number.toString().padStart(3, '0')}.png`;
      await uploadImage('coloring-pages', path, page.buffer);
      pngPaths.push(path);
    }

    // Create ZIP
    const zipBuffer = await createZip(pages);
    const zipPath = `jobs/${job.id}/coloring-pages.zip`;
    await uploadFile('coloring-pages', zipPath, zipBuffer, 'application/zip');
    const zipUrl = await createSignedUrl('coloring-pages', zipPath, 86400 * 7); // 7 days

    // Create PDF
    const pdfBuffer = await createPDF(pages, { width, height });
    const pdfPath = `jobs/${job.id}/coloring-pages.pdf`;
    await uploadFile('coloring-pages', pdfPath, pdfBuffer, 'application/pdf');
    const pdfUrl = await createSignedUrl('coloring-pages', pdfPath, 86400 * 7); // 7 days

    // Update job as completed
    const { error } = await supabase
      .from('jobs')
      .update({
        status: 'completed',
        zip_url: zipUrl,
        pdf_url: pdfUrl,
        progress_current: job.page_count,
        progress_total: job.page_count,
        updated_at: new Date().toISOString(),
      })
      .eq('id', job.id);

    if (error) {
      throw new Error(`Failed to update job: ${error.message}`);
    }

    logger.info(`Job ${job.id} completed successfully`, { jobId: job.id });
  } catch (error: any) {
    logger.error(`Job ${job.id} failed`, error as Error, { jobId: job.id });

    await updateJobProgress(
      job.id,
      job.progress_current,
      job.page_count,
      'failed',
      error.message || 'Unknown error occurred'
    );
  }
}

async function getNextPendingJob(): Promise<Job | null> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Job;
}

async function workerLoop(): Promise<void> {
  logger.info('Worker started', { maxConcurrency: env.WORKER_MAX_CONCURRENCY, maxRetries: env.WORKER_MAX_RETRIES });

  while (true) {
    try {
      const job = await getNextPendingJob();

      if (job) {
        await processJob(job);
      } else {
        // No jobs, wait before checking again
        await sleep(5000);
      }
    } catch (error: any) {
      logger.error('Worker error', error as Error);
      await sleep(5000);
    }
  }
}

// Start worker if run directly
if (require.main === module) {
  workerLoop().catch((error) => {
    logger.error('Fatal worker error', error as Error);
    process.exit(1);
  });
}

export { workerLoop, processJob };
