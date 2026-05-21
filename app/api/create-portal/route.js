import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/env";
import { createStripeClient } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAuthedUser } from "@/lib/supabase/server";

export async function POST() {
  const { user } = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const admin = createSupabaseAdminClient();
    const { data: profile } = await admin.from("users").select("stripe_customer_id").eq("id", user.id).maybeSingle();
    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: "No Stripe customer found yet." }, { status: 400 });
    }

    const stripe = createStripeClient();
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${getSiteUrl()}/dashboard/account`
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Portal failed." }, { status: 500 });
  }
}
