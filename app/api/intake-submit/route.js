import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sanitizeString } from "@/lib/utils";

export async function POST(request) {
  try {
    const body = await request.json();
    const token = sanitizeString(body.token, 120);
    const coupleNames = sanitizeString(body.coupleNames, 160);
    if (!token || !coupleNames) {
      return NextResponse.json({ error: "Token and couple names are required." }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const { data: link } = await admin
      .from("intake_links")
      .select("id, user_id, is_active")
      .eq("token", token)
      .maybeSingle();

    if (!link?.id || !link.is_active) {
      return NextResponse.json({ error: "Intake link is invalid." }, { status: 404 });
    }

    const payload = {
      user_id: link.user_id,
      intake_link_id: link.id,
      couple_names: coupleNames,
      wedding_date: sanitizeString(body.weddingDate, 40) || null,
      venue_name: sanitizeString(body.venueName, 180) || null,
      venue_type: sanitizeString(body.venueType, 80) || null,
      guest_count: sanitizeString(body.guestCount, 40) || null,
      photography_style: sanitizeString(body.photographyStyle, 80) || null,
      ceremony_time: sanitizeString(body.ceremonyTime, 40) || null,
      coverage_hours: sanitizeString(body.coverageHours, 40) || null,
      special_moments: sanitizeString(body.specialMoments, 1200) || null,
      extra_details: sanitizeString(body.extraDetails, 2000) || null
    };

    const { error } = await admin.from("intake_submissions").insert(payload);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Submission failed." }, { status: 500 });
  }
}
