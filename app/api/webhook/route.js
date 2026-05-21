import { NextResponse } from "next/server";
import { createStripeClient } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request) {
  const stripe = createStripeClient();
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${error.message}` }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.user_id;
    const plan = session.metadata?.plan;

    if (userId && ["pro", "studio"].includes(plan)) {
      await admin
        .from("users")
        .update({
          plan,
          stripe_customer_id: typeof session.customer === "string" ? session.customer : session.customer?.id
        })
        .eq("id", userId);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
    if (customerId) {
      await admin.from("users").update({ plan: "free" }).eq("stripe_customer_id", customerId);
    }
  }

  return NextResponse.json({ received: true });
}
