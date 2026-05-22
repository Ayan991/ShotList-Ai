import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { env } from "@/lib/env";
import { PLANS } from "@/lib/plans";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureUserProfileByClerkId } from "@/lib/user-profile";
import { sanitizeString } from "@/lib/utils";

const rateLimitMap = new Map();

function isRateLimited(userId) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 2;
  const timestamps = (rateLimitMap.get(userId) || []).filter((t) => now - t < windowMs);
  if (timestamps.length >= maxRequests) return true;
  rateLimitMap.set(userId, [...timestamps, now]);
  return false;
}

export async function POST(request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (isRateLimited(userId)) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  const { plan: rawPlan } = await request.json();
  const plan = sanitizeString(rawPlan, 20);
  if (!PLANS[plan] || !["pro", "studio"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const productId = plan === "pro" ? env.dodoProProductId : env.dodoStudioProductId;
  if (!productId || !env.dodoSecretKey) return NextResponse.json({ error: "Dodo is not configured." }, { status: 500 });

  try {
    const admin = createSupabaseAdminClient();
    const profile = await ensureUserProfileByClerkId(admin, userId);
    const user = await currentUser();
    const email = encodeURIComponent(sanitizeString(user?.emailAddresses?.[0]?.emailAddress || profile.email || "", 160));
    const name = encodeURIComponent(sanitizeString(profile?.name || "", 160));
    const uid = encodeURIComponent(profile.id);
    const url = `https://checkout.dodopayments.com/buy/${encodeURIComponent(productId)}?email=${email}&name=${name}&external_id=${uid}&plan=${plan}`;
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Checkout failed." }, { status: 500 });
  }
}
