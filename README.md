# KDP Coloring Pages AI - Next.js SaaS

A production-ready Next.js SaaS application for generating Amazon KDP-compliant black-and-white coloring pages using AI image generation.

## Features

- **Multi-Provider AI Image Generation**: Support for OpenAI, Stability AI, and Replicate
- **KDP Compliance**: 3-layer guardrails ensuring all outputs meet Amazon KDP requirements
- **Real-Time Progress Tracking**: Live updates on job processing status
- **Supabase Integration**: Auth, database, and storage
- **Stripe Subscriptions**: Plan-based access control
- **Worker Queue System**: Background job processing with retry logic
- **Watermarking**: Automatic watermarking for free plan users
- **Multiple Output Formats**: PNGs, ZIP, and KDP-ready PDF

## Architecture

### Image Generation Providers

The app supports three configurable image providers:

1. **OpenAI** (default): Uses DALL-E 3 for high-quality image generation
2. **Stability AI**: Uses Stable Diffusion XL
3. **Replicate**: Supports various models via Replicate API

### KDP Compliance Guardrails

**Layer 1: Prompt Locking**
- All user input is sanitized and wrapped in KDP-compliant templates
- Audience-specific rules (toddlers, kids, adults)
- Mandatory compliance keywords included in every prompt

**Layer 2: Input Sanitization**
- Blocklist of copyrighted characters (Disney, Marvel, Pokémon, etc.)
- Trademark detection
- Input validation and length limits

**Layer 3: Output Validation**
- Automated validation of generated images
- Checks for shading, gray tones, and background compliance
- Auto-retry with enhanced prompts on validation failure

## Setup

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- Stripe account
- At least one image provider API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kdp-coloring-pages
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Image Provider (choose one)
IMAGE_PROVIDER=openai  # or 'stability' or 'replicate'
OPENAI_API_KEY=your_openai_api_key
# OR
STABILITY_API_KEY=your_stability_api_key
# OR
REPLICATE_API_TOKEN=your_replicate_api_token

# Worker Configuration
WORKER_MAX_CONCURRENCY=2
WORKER_MAX_RETRIES=3

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

Run the following SQL in your Supabase SQL editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  book_size TEXT NOT NULL CHECK (book_size IN ('8.5x11', '8x10', '8.25x11')),
  page_count INTEGER NOT NULL CHECK (page_count > 0 AND page_count <= 100),
  audience TEXT NOT NULL CHECK (audience IN ('toddlers', 'kids', 'adults')),
  niche TEXT,
  description TEXT,
  progress_current INTEGER DEFAULT 0,
  progress_total INTEGER NOT NULL,
  error_message TEXT,
  zip_url TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
```

### Storage Setup

1. In Supabase Dashboard, go to Storage
2. Create a bucket named `coloring-pages`
3. Set it to public or configure RLS policies as needed

### Running the Application

1. Start the Next.js development server:
```bash
npm run dev
```

2. In a separate terminal, start the worker:
```bash
npm run worker
```

The app will be available at `http://localhost:3000`.

## Image Provider Setup

### OpenAI

1. Sign up at [OpenAI](https://platform.openai.com/)
2. Create an API key
3. Set `IMAGE_PROVIDER=openai` and `OPENAI_API_KEY=your_key`

### Stability AI

1. Sign up at [Stability AI](https://platform.stability.ai/)
2. Create an API key
3. Set `IMAGE_PROVIDER=stability` and `STABILITY_API_KEY=your_key`

### Replicate

1. Sign up at [Replicate](https://replicate.com/)
2. Get your API token
3. Set `IMAGE_PROVIDER=replicate` and `REPLICATE_API_TOKEN=your_token`

**Note**: You can configure the Replicate model in `src/lib/imageProviders/replicate.ts`

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Production Deployment

### Environment Variables

Ensure all environment variables are set in your production environment (Vercel, Railway, etc.).

### Worker Deployment

The worker can be deployed as:
- A separate Node.js process (PM2, systemd)
- A serverless function (Vercel Cron, AWS Lambda)
- A containerized service (Docker, Kubernetes)

Example with PM2:

```bash
pm2 start npm --name "kdp-worker" -- run worker
```

### Database Migrations

Run the SQL schema in your production Supabase instance.

## API Usage

### Create a Job

```bash
POST /api/jobs
Authorization: Bearer <supabase_token>
Content-Type: application/json

{
  "book_size": "8.5x11",
  "page_count": 10,
  "audience": "kids",
  "niche": "animals",
  "description": "cute puppies"
}
```

### Get Job Status

```bash
GET /api/jobs?id=<job_id>
Authorization: Bearer <supabase_token>
```

## KDP Compliance

All generated images are validated to ensure:

- ✅ Black and white only (no gray, no shading)
- ✅ White background (60%+ white pixels)
- ✅ Thick clean outlines
- ✅ No text or watermarks (except free plan)
- ✅ Proper dimensions for print (300 DPI)
- ✅ No copyrighted content

## Security

- All API keys are server-side only
- Signed URLs for downloads (7-day expiration)
- Input sanitization prevents IP violations
- Rate limiting on API endpoints
- Audit logging for compliance

## License

[Your License Here]

## Support

For issues and questions, please open an issue in the repository.
