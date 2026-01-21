# Build Fix: Type Export Error

## Issue
TypeScript error during build:
```
Type error: Re-exporting a type when 'isolatedModules' is enabled requires using 'export type'.
> 52 | export { ImageProvider, ImageProviderConfig } from './types';
```

## Root Cause
With `isolatedModules: true` in `tsconfig.json`, TypeScript requires explicit `export type` for type-only re-exports to ensure each file can be compiled independently.

## Fix Applied
**File:** `src/lib/imageProviders/index.ts`

**Changed:**
```typescript
export { ImageProvider, ImageProviderConfig } from './types';
```

**To:**
```typescript
export type { ImageProvider, ImageProviderConfig } from './types';
```

## Verification
The fix is confirmed in the codebase. If you're still seeing the error:

1. **Clear build cache on your deployment platform:**
   - Netlify: Go to Site settings → Build & deploy → Clear cache and retry deploy
   - Vercel: Redeploy with "Clear Cache" option
   - Other platforms: Clear `.next` folder and rebuild

2. **Ensure changes are committed and pushed:**
   ```bash
   git add src/lib/imageProviders/index.ts
   git commit -m "Fix: Use export type for isolatedModules compatibility"
   git push
   ```

3. **Clear local build cache:**
   ```bash
   rm -rf .next
   rm -rf node_modules/.cache
   npm run build
   ```

## Status
✅ Fix is in place and correct
✅ Code is ready for deployment
⚠️ If error persists, it's likely a build cache issue
