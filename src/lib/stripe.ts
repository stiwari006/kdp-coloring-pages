import Stripe from 'stripe';
import { env } from './env';

// Initialize Stripe with fallback for build time
// At runtime, STRIPE_SECRET_KEY will be validated by env.ts
export const stripe = new Stripe(env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-11-20.acacia' as any,
});
