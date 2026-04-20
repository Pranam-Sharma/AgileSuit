// Placeholder for Stripe.js SDK initialization
// import { loadStripe } from '@stripe/stripe-js';

// export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export const stripeConfig = {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
};
