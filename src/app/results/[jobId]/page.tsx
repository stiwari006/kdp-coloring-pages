'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';
import type { Job } from '@/types/database';

export default function ResultsPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const fetchJob = async () => {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) {
          setError('Please log in to view this job');
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabaseClient
          .from('jobs')
          .select('*')
          .eq('id', jobId)
          .eq('user_id', session.user.id)
          .single();

        if (fetchError || !data) {
          setError('Job not found');
          setLoading(false);
          return;
        }

        setJob(data as Job);
        setLoading(false);

        // Poll for updates if job is still processing
        if (data.status === 'pending' || data.status === 'processing') {
          const interval = setInterval(async () => {
            const { data: updatedJob } = await supabaseClient
              .from('jobs')
              .select('*')
              .eq('id', jobId)
              .single();

            if (updatedJob) {
              setJob(updatedJob as Job);
              if (updatedJob.status === 'completed' || updatedJob.status === 'failed') {
                clearInterval(interval);
              }
            }
          }, 3000); // Poll every 3 seconds

          return () => clearInterval(interval);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load job');
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job status...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Job not found'}</p>
        </div>
      </div>
    );
  }

  const progress = job.progress_total > 0
    ? Math.round((job.progress_current / job.progress_total) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Job Status</h1>

          {/* Status Badge */}
          <div className="mb-6">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                job.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : job.status === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : job.status === 'processing'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </span>
          </div>

          {/* Progress Bar */}
          {(job.status === 'pending' || job.status === 'processing') && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Generating pages...
                </span>
                <span className="text-sm text-gray-500">
                  {job.progress_current} / {job.progress_total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Generating page {job.progress_current} of {job.progress_total}...
              </p>
            </div>
          )}

          {/* Error Message */}
          {job.status === 'failed' && job.error_message && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <strong>Error:</strong> {job.error_message}
              </p>
              {job.error_message.includes('shading') && (
                <p className="mt-2 text-sm text-red-700">
                  We detected shading in the generated image. Retrying...
                </p>
              )}
              {job.error_message.includes('copyrighted') && (
                <p className="mt-2 text-sm text-red-700">
                  This request may contain copyrighted characters; please revise.
                </p>
              )}
            </div>
          )}

          {/* Job Details */}
          <div className="mb-6 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Book Size:</span>
              <span className="font-medium">{job.book_size}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Page Count:</span>
              <span className="font-medium">{job.page_count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Audience:</span>
              <span className="font-medium capitalize">{job.audience}</span>
            </div>
            {job.niche && (
              <div className="flex justify-between">
                <span className="text-gray-600">Niche:</span>
                <span className="font-medium">{job.niche}</span>
              </div>
            )}
          </div>

          {/* Download Links */}
          {job.status === 'completed' && (
            <div className="mt-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Downloads</h2>
              {job.zip_url && (
                <a
                  href={job.zip_url}
                  download
                  className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Download ZIP ({job.page_count} PNGs)
                </a>
              )}
              {job.pdf_url && (
                <a
                  href={job.pdf_url}
                  download
                  className="block w-full bg-green-600 text-white text-center py-3 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  Download PDF (KDP Ready)
                </a>
              )}
            </div>
          )}

          {/* Created At */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Created: {new Date(job.created_at).toLocaleString()}
            </p>
            {job.updated_at && (
              <p className="text-sm text-gray-500">
                Updated: {new Date(job.updated_at).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
