# Production Readiness Checklist

Use this checklist before deploying to production.

## Pre-Deployment

### Environment Variables
- [ ] All required environment variables set
- [ ] Production API keys configured (not development keys)
- [ ] Supabase production project configured
- [ ] Stripe production keys configured
- [ ] Image provider API keys configured
- [ ] `NEXT_PUBLIC_APP_URL` set to production domain
- [ ] `NODE_ENV=production` set

### Database
- [ ] Database migrations run in production
- [ ] Storage bucket created (`coloring-pages`)
- [ ] RLS policies configured (if needed)
- [ ] Database backups configured
- [ ] Connection pooling configured

### Security
- [ ] All API keys in environment variables (never in code)
- [ ] HTTPS enabled
- [ ] Security headers configured (middleware.ts)
- [ ] CORS properly configured
- [ ] Rate limiting configured
- [ ] Input validation on all endpoints
- [ ] Signed URLs for downloads
- [ ] Audit logging enabled

### Application
- [ ] Build succeeds: `npm run build`
- [ ] Tests pass: `npm test`
- [ ] Linter passes: `npm run lint`
- [ ] Health check endpoint working: `/api/health`
- [ ] Readiness check working: `/api/ready`
- [ ] Worker process configured
- [ ] Error handling tested

### Monitoring
- [ ] Application monitoring configured (Sentry, Datadog, etc.)
- [ ] Logging service configured
- [ ] Uptime monitoring configured
- [ ] Alerts configured for:
  - Job failures
  - High error rates
  - Worker downtime
  - Database connection issues

### Performance
- [ ] Image optimization enabled
- [ ] Caching configured
- [ ] CDN configured (if applicable)
- [ ] Database indexes created
- [ ] Connection pooling optimized

## Deployment

### Platform-Specific
- [ ] Platform deployment configured
- [ ] Environment variables set in platform
- [ ] Health checks configured
- [ ] Auto-scaling configured (if applicable)
- [ ] Worker service deployed separately

### Post-Deployment
- [ ] Application accessible at production URL
- [ ] Health check returns 200
- [ ] Worker processing jobs
- [ ] Test job creation works
- [ ] Test image generation works
- [ ] Test downloads work
- [ ] Error handling works
- [ ] Logs are being collected

## Testing Checklist

### Functional Tests
- [ ] Create job via API
- [ ] Worker processes job
- [ ] Images generated successfully
- [ ] ZIP download works
- [ ] PDF download works
- [ ] Progress tracking works
- [ ] Error messages display correctly

### Security Tests
- [ ] Unauthenticated requests rejected
- [ ] Input sanitization works
- [ ] Copyrighted content blocked
- [ ] Signed URLs expire correctly
- [ ] Rate limiting works

### Performance Tests
- [ ] Page load times acceptable
- [ ] API response times acceptable
- [ ] Image generation completes in reasonable time
- [ ] Database queries optimized
- [ ] No memory leaks

## Rollback Plan
- [ ] Previous version tagged
- [ ] Database migration rollback plan
- [ ] Rollback procedure documented
- [ ] Team knows rollback process

## Documentation
- [ ] README.md updated
- [ ] DEPLOYMENT.md reviewed
- [ ] API documentation updated
- [ ] Runbooks created for common issues
- [ ] Team trained on deployment process

## Sign-Off
- [ ] Code review completed
- [ ] Security review completed
- [ ] Performance review completed
- [ ] Stakeholder approval obtained
- [ ] Deployment window scheduled

---

**Deployment Date:** _______________

**Deployed By:** _______________

**Version:** _______________

**Notes:**
_________________________________
_________________________________
_________________________________
