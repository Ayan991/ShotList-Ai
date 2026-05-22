import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { PLANS } from "@/lib/plans";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureUserProfileByClerkId } from "@/lib/user-profile";

export async function POST(request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await request.json();
  if (!PLANS[plan] || !["pro", "studio"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const checkoutUrl =
    plan === "pro"
      ? process.env.DODO_PRO_CHECKOUT_URL || process.env.NEXT_PUBLIC_DODO_PRO_URL
      : process.env.DODO_STUDIO_CHECKOUT_URL || process.env.NEXT_PUBLIC_DODO_STUDIO_URL;
  if (!checkoutUrl) {
    return NextResponse.json({ error: "Dodo checkout URL is not configured." }, { status: 500 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const profile = await ensureUserProfileByClerkId(admin, userId);
    const user = await currentUser();
    const email = encodeURIComponent(user?.emailAddresses?.[0]?.emailAddress || profile.email || "");
    const name = encodeURIComponent(profile?.name || "");
    const uid = encodeURIComponent(profile.id);
    const url = `${checkoutUrl}${checkoutUrl.includes("?") ? "&" : "?"}email=${email}&name=${name}&external_id=${uid}&plan=${plan}`;
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Checkout failed." }, { status: 500 });
  }
}
