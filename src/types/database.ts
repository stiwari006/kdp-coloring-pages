export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Job {
  id: string;
  user_id: string;
  status: JobStatus;
  book_size: string;
  page_count: number;
  audience: string;
  niche?: string;
  description?: string;
  progress_current: number;
  progress_total: number;
  error_message?: string;
  zip_url?: string;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
  stripe_customer_id?: string;
  created_at: string;
}
