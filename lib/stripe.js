import Stripe from "stripe";

export function createStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key is not configured.");
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-12-15.preview"
  });
}
