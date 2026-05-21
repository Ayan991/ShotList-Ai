import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSiteUrl } from "@/lib/env";
import { createStripeClient } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureUserProfileByClerkId } from "@/lib/user-profile";

export async function POST() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const admin = createSupabaseAdminClient();
    const profile = await ensureUserProfileByClerkId(admin, userId);
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
