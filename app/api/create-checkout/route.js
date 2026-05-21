import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/env";
import { PLANS } from "@/lib/plans";
import { createStripeClient } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAuthedUser } from "@/lib/supabase/server";

export async function POST(request) {
  const { user } = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await request.json();
  const selectedPlan = PLANS[plan];
  if (!selectedPlan || !selectedPlan.stripePriceEnv) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const priceId = process.env[selectedPlan.stripePriceEnv];
  if (!priceId) return NextResponse.json({ error: "Stripe price ID is not configured." }, { status: 500 });

  try {
    const admin = createSupabaseAdminClient();
    const stripe = createStripeClient();
    const { data: profile } = await admin.from("users").select("*").eq("id", user.id).maybeSingle();

    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: profile?.name || undefined,
        metadata: { user_id: user.id }
      });
      customerId = customer.id;
      await admin.from("users").update({ stripe_customer_id: customerId }).eq("id", user.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${getSiteUrl()}/dashboard/account?checkout=success`,
      cancel_url: `${getSiteUrl()}/dashboard/account?checkout=cancelled`,
      metadata: { user_id: user.id, plan }
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Checkout failed." }, { status: 500 });
  }
}
