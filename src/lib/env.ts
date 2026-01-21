import { z } from 'zod';

// Check if we're in build phase (Next.js sets this during build)
const isBuildTime = 
  process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.NEXT_PHASE === 'phase-development-build';

// Make all required fields optional during build to allow builds to complete
const envSchema = z.object({
  // Supabase - optional during build, required at runtime
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // Stripe - optional during build, required at runtime
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),

  // Image Provider
  IMAGE_PROVIDER: z.enum(['openai', 'stability', 'replicate']).default('openai'),
  OPENAI_API_KEY: z.string().optional(),
  STABILITY_API_KEY: z.string().optional(),
  REPLICATE_API_TOKEN: z.string().optional(),

  // Worker
  WORKER_MAX_CONCURRENCY: z.coerce.number().int().positive().default(2),
  WORKER_MAX_RETRIES: z.coerce.number().int().positive().default(3),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
});

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    IMAGE_PROVIDER: process.env.IMAGE_PROVIDER || 'openai',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    STABILITY_API_KEY: process.env.STABILITY_API_KEY,
    REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
    WORKER_MAX_CONCURRENCY: process.env.WORKER_MAX_CONCURRENCY,
    WORKER_MAX_RETRIES: process.env.WORKER_MAX_RETRIES,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  };

  const result = envSchema.safeParse(env);

  if (!result.success) {
    // During build, use placeholder values; at runtime, throw
    if (isBuildTime) {
      return {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_placeholder',
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || 'sk_placeholder',
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
        IMAGE_PROVIDER: (process.env.IMAGE_PROVIDER as any) || 'openai',
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        STABILITY_API_KEY: process.env.STABILITY_API_KEY,
        REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
        WORKER_MAX_CONCURRENCY: Number(process.env.WORKER_MAX_CONCURRENCY) || 2,
        WORKER_MAX_RETRIES: Number(process.env.WORKER_MAX_RETRIES) || 3,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      };
    }
    throw new Error(`Invalid environment variables: ${result.error.message}`);
  }

  const validated = result.data;

  // Validate required fields only at runtime (not during build)
  if (!isBuildTime && typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
    if (!validated.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
    }
    if (!validated.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
    }
    if (!validated.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
    }
    if (!validated.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required');
    }
    if (!validated.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is required');
    }

    // Validate provider-specific keys
    if (validated.IMAGE_PROVIDER === 'openai' && !validated.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required when IMAGE_PROVIDER=openai');
    }
    if (validated.IMAGE_PROVIDER === 'stability' && !validated.STABILITY_API_KEY) {
      throw new Error('STABILITY_API_KEY is required when IMAGE_PROVIDER=stability');
    }
    if (validated.IMAGE_PROVIDER === 'replicate' && !validated.REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN is required when IMAGE_PROVIDER=replicate');
    }
  }

  return validated;
}

export const env = validateEnv();
