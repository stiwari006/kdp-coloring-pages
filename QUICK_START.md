# Quick Start Guide

Get your KDP Coloring Pages AI application running in minutes.

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Supabase account (free tier works)
- At least one image provider API key

## 1. Clone and Install

```bash
git clone <your-repo-url>
cd kdp-coloring-pages
npm install
```

## 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

**Minimum required:**
- Supabase URL and keys
- One image provider API key (OpenAI, Stability, or Replicate)
- Stripe keys (if using subscriptions)

## 3. Set Up Database

1. Go to your Supabase project dashboard
2. Open SQL Editor
3. Run the migration: `supabase/migrations/001_initial_schema.sql`
4. Go to Storage and create a bucket named `coloring-pages`

## 4. Run Development Server

```bash
# Terminal 1: Next.js app
npm run dev

# Terminal 2: Worker
npm run worker
```

Visit `http://localhost:3000`

## 5. Test the Application

1. Create a test user in Supabase Auth
2. Create a job via API or frontend
3. Worker will process the job
4. Check results at `/results/[jobId]`

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy Options

**Vercel (Easiest):**
```bash
npm i -g vercel
vercel
```

**Docker:**
```bash
docker-compose up -d
```

**Railway:**
- Connect GitHub repo
- Railway auto-detects and deploys

## Troubleshooting

### Worker Not Processing Jobs
- Check worker logs: `npm run worker`
- Verify database connection
- Check image provider API key

### Image Generation Failing
- Verify API key is correct
- Check rate limits
- Review error messages in job table

### Database Errors
- Verify Supabase credentials
- Check migration was run
- Verify RLS policies if using

## Next Steps

- Read [README.md](./README.md) for full documentation
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
- Check [IMPLEMENTATION.md](./IMPLEMENTATION.md) for architecture details
