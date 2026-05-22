import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { env } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureUserProfileByClerkId } from "@/lib/user-profile";

export async function POST() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const admin = createSupabaseAdminClient();
    await ensureUserProfileByClerkId(admin, userId);
    if (!env.dodoSecretKey) {
      return NextResponse.json({ error: "Dodo is not configured." }, { status: 500 });
    }
    const url = "https://app.dodopayments.com";
    if (!url) {
      return NextResponse.json({ error: "Dodo customer portal URL is not configured." }, { status: 500 });
    }
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Portal failed." }, { status: 500 });
  }
}
