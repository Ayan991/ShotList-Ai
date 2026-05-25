import crypto from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureUserProfileByClerkId } from "@/lib/user-profile";

export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const admin = createSupabaseAdminClient();
    const profile = await ensureUserProfileByClerkId(admin, userId);
    const { data: link } = await admin
      .from("intake_links")
      .select("id, token, is_active, created_at")
      .eq("user_id", profile.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .maybeSingle();

    const { data: submissions } = await admin
      .from("intake_submissions")
      .select("id, couple_names, wedding_date, venue_name, venue_type, guest_count, photography_style, ceremony_time, coverage_hours, special_moments, extra_details, status, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20);

    return NextResponse.json({ link: link || null, submissions: submissions || [] });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to load intake data." }, { status: 500 });
  }
}

export async function POST() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const admin = createSupabaseAdminClient();
    const profile = await ensureUserProfileByClerkId(admin, userId);
    const { data: existing } = await admin
      .from("intake_links")
      .select("id, token, is_active, created_at")
      .eq("user_id", profile.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .maybeSingle();

    if (existing) return NextResponse.json({ link: existing });

    const token = crypto.randomBytes(18).toString("hex");
    const { data: created, error } = await admin
      .from("intake_links")
      .insert({ user_id: profile.id, token, is_active: true })
      .select("id, token, is_active, created_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ link: created });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to create intake link." }, { status: 500 });
  }
}
