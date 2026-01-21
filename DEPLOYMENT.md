# Deployment Guide

This guide covers deploying the KDP Coloring Pages AI application to various platforms.

## Prerequisites

- All environment variables configured (see `.env.example`)
- Database migrations run in Supabase
- Supabase Storage bucket created (`coloring-pages`)
- Stripe account configured
- Image provider API keys ready

## Deployment Options

### 1. Vercel (Recommended for Next.js)

#### Setup

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login
   vercel login
   
   # Deploy
   vercel
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all variables from `.env.example`
   - Set for Production, Preview, and Development

3. **Deploy Worker Separately**
   - Use Vercel Cron Jobs or separate service
   - Or deploy worker as serverless function with scheduled triggers

#### Worker Deployment on Vercel

Create `api/cron/process-jobs.ts`:

```typescript
import { processJob } from '@/worker';

export default async function handler(req: any, res: any) {
  // Process pending jobs
  // This runs on a schedule via Vercel Cron
}
```

Configure in `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/process-jobs",
    "schedule": "* * * * *"
  }]
}
```

### 2. Docker Deployment

#### Build Images

```bash
# Build app image
docker build -t kdp-coloring-pages:latest .

# Build worker image
docker build -f Dockerfile.worker -t kdp-coloring-pages-worker:latest .
```

#### Run with Docker Compose

```bash
# Create .env.production file
cp .env.example .env.production
# Edit .env.production with production values

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

#### Manual Docker Run

```bash
# App container
docker run -d \
  --name kdp-app \
  -p 3000:3000 \
  --env-file .env.production \
  kdp-coloring-pages:latest

# Worker container
docker run -d \
  --name kdp-worker \
  --env-file .env.production \
  kdp-coloring-pages-worker:latest
```

### 3. Railway

1. **Connect Repository**
   - Go to Railway Dashboard
   - New Project → Deploy from GitHub
   - Select repository

2. **Configure Services**
   - App service: Uses `railway.json` config
   - Worker service: Add as separate service with `npm run worker`

3. **Environment Variables**
   - Add all variables in Railway Dashboard
   - Variables are automatically available to all services

### 4. AWS (ECS/EKS)

#### ECS Deployment

1. **Build and Push to ECR**
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
   
   docker build -t kdp-coloring-pages .
   docker tag kdp-coloring-pages:latest <account>.dkr.ecr.us-east-1.amazonaws.com/kdp-coloring-pages:latest
   docker push <account>.dkr.ecr.us-east-1.amazonaws.com/kdp-coloring-pages:latest
   ```

2. **Create ECS Task Definition**
   - Use provided Dockerfile
   - Configure environment variables
   - Set up service with load balancer

3. **Worker as Separate Service**
   - Create separate ECS service for worker
   - Use same task definition with different command

### 5. Google Cloud Run

```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/kdp-coloring-pages

# Deploy app
gcloud run deploy kdp-app \
  --image gcr.io/PROJECT_ID/kdp-coloring-pages \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Deploy worker
gcloud run deploy kdp-worker \
  --image gcr.io/PROJECT_ID/kdp-coloring-pages-worker \
  --platform managed \
  --region us-central1 \
  --no-allow-unauthenticated \
  --set-env-vars="NODE_ENV=production"
```

## Worker Deployment Strategies

### Option 1: Separate Process (Recommended)

Run worker as a separate service/container:
- Better resource isolation
- Independent scaling
- Easier monitoring

### Option 2: Cron Job

Use platform cron (Vercel, GitHub Actions, etc.):
- Simpler setup
- Less control over timing
- May have execution limits

### Option 3: Queue-Based (Advanced)

Use message queue (Redis, SQS, etc.):
- Most scalable
- Requires additional infrastructure
- Better for high volume

## Health Checks

The application includes health check endpoints:

- `GET /api/health` - Basic health check
- `GET /api/ready` - Readiness check (includes provider validation)

Configure your platform to use these for:
- Load balancer health checks
- Container orchestration health checks
- Monitoring alerts

## Environment Variables

### Required for Production

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Image Provider (one required)
IMAGE_PROVIDER=openai
OPENAI_API_KEY=sk-...

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Optional

```env
WORKER_MAX_CONCURRENCY=2
WORKER_MAX_RETRIES=3
```

## Database Setup

1. **Run Migrations**
   ```sql
   -- Execute supabase/migrations/001_initial_schema.sql
   ```

2. **Create Storage Bucket**
   - Go to Supabase Dashboard → Storage
   - Create bucket: `coloring-pages`
   - Set policies as needed

3. **Set up RLS Policies** (if needed)
   ```sql
   -- Example: Users can only see their own jobs
   CREATE POLICY "Users can view own jobs"
   ON jobs FOR SELECT
   USING (auth.uid() = user_id);
   ```

## Monitoring

### Recommended Tools

1. **Application Monitoring**
   - Sentry (error tracking)
   - Datadog (APM)
   - New Relic

2. **Logging**
   - CloudWatch (AWS)
   - Google Cloud Logging
   - Papertrail

3. **Uptime Monitoring**
   - UptimeRobot
   - Pingdom
   - StatusCake

### Key Metrics to Monitor

- Job processing time
- Job failure rate
- API response times
- Image generation success rate
- Storage usage
- Database connection pool

## Scaling Considerations

### Horizontal Scaling

- **App**: Stateless, can scale horizontally
- **Worker**: Can run multiple instances (job queue handles concurrency)

### Database Scaling

- Use Supabase connection pooling
- Monitor query performance
- Add indexes as needed

### Storage Scaling

- Supabase Storage scales automatically
- Consider CDN for download URLs
- Monitor storage usage

## Security Checklist

- [ ] All API keys in environment variables (never in code)
- [ ] HTTPS enabled
- [ ] Security headers configured (middleware.ts)
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Database RLS policies set
- [ ] Signed URLs for downloads
- [ ] Input validation on all endpoints
- [ ] Audit logging enabled

## Troubleshooting

### Worker Not Processing Jobs

1. Check worker logs
2. Verify database connection
3. Check image provider API keys
4. Verify job status in database

### Image Generation Failing

1. Check provider API keys
2. Verify rate limits not exceeded
3. Check validation logs
4. Review error messages in job table

### Database Connection Issues

1. Verify Supabase credentials
2. Check connection pool limits
3. Review Supabase dashboard for issues

## Rollback Procedure

1. **Vercel**: Use deployment history to rollback
2. **Docker**: Tag previous image and redeploy
3. **Database**: Keep migration backups

## Support

For deployment issues:
1. Check application logs
2. Review health check endpoints
3. Verify environment variables
4. Check platform-specific documentation
