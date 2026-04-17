// ═══════════════════════════════════════════
// DineSmart OS — Stripe Utility
// ═══════════════════════════════════════════

import { env } from '../config/env.js';

let Stripe;
try {
    const module = await import('stripe');
    Stripe = module.default;
} catch (e) {
    console.error('❌ CRITICAL ERROR: "stripe" package is missing in node_modules.');
    console.error('👉 Fix: Run "docker-compose build --no-cache api" or "npm install stripe" in the api directory.');
    throw new Error('Stripe package not found. Please ensure dependencies are installed inside the container.');
}

if (!env.STRIPE_SECRET_KEY) {
  console.warn('⚠️ STRIPE_SECRET_KEY is missing in .env');
}

export const stripe = new (Stripe as any)(env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-06-20' as any,
  typescript: true,
});

export const STRIPE_CONFIG = {
  successUrl: `${env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
  cancelUrl: `${env.FRONTEND_URL}/payment/cancel`,
};
