import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureUserProfileByClerkId } from "@/lib/user-profile";
import { sanitizeString } from "@/lib/utils";

export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createSupabaseAdminClient();
  const profile = await ensureUserProfileByClerkId(admin, userId);
  const { data, error } = await admin
    .from("weddings")
    .select("id, couple_names, date, venue, inputs_json, result_json, created_at")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ weddings: data });
}

export async function POST(request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const inputs = body.inputs || {};
  const result = body.result || {};
  const weddingId = sanitizeString(body.weddingId || "", 80);
  const coupleNames = sanitizeString(inputs.coupleNames || "Untitled wedding", 160);
  const weddingDate = sanitizeString(inputs.weddingDate || "", 40);
  const venueName = sanitizeString(inputs.venueName || "", 180);
  const admin = createSupabaseAdminClient();
  const profile = await ensureUserProfileByClerkId(admin, userId);

  if (weddingId) {
    const { data, error } = await admin
      .from("weddings")
      .update({
        couple_names: coupleNames,
        date: weddingDate || null,
        venue: venueName || null,
        inputs_json: inputs,
        result_json: result
      })
      .eq("id", weddingId)
      .eq("user_id", profile.id)
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ weddingId: data.id });
  }

  const { data, error } = await admin
    .from("weddings")
    .insert({
      user_id: profile.id,
      couple_names: coupleNames,
      date: weddingDate || null,
      venue: venueName || null,
      inputs_json: inputs,
      result_json: result
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ weddingId: data.id });
}
