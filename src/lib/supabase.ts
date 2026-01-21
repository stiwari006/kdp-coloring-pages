import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Use placeholder values during build to avoid errors
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey
);

export const supabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey
);
