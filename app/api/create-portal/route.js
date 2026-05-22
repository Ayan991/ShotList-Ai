import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureUserProfileByClerkId } from "@/lib/user-profile";

export async function POST() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const admin = createSupabaseAdminClient();
    await ensureUserProfileByClerkId(admin, userId);
    const url = process.env.DODO_CUSTOMER_PORTAL_URL || process.env.NEXT_PUBLIC_DODO_CUSTOMER_PORTAL_URL;
    if (!url) {
      return NextResponse.json({ error: "Dodo customer portal URL is not configured." }, { status: 500 });
    }
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Portal failed." }, { status: 500 });
  }
}
