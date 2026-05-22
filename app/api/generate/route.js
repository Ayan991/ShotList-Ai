import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { buildWeddingPrompt, extractJsonObject, generateWithNvidia } from "@/lib/anthropic";
import { getCurrentMonthKey, getPlanLimit, hasUnlimitedUsage } from "@/lib/plans";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureUserProfileByClerkId } from "@/lib/user-profile";

export async function POST(request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "You must be logged in to generate a wedding plan." }, { status: 401 });
  }

  let inputs;
  try {
    inputs = sanitizeInputs(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!inputs.coupleNames) {
    return NextResponse.json({ error: "Couple names are required." }, { status: 400 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const profile = await ensureUserProfileByClerkId(admin, userId);
    const month = getCurrentMonthKey();
    const { data: usageRow } = await admin
      .from("usage")
      .select("id, count")
      .eq("user_id", profile.id)
      .eq("month", month)
      .maybeSingle();

    const currentCount = usageRow?.count || 0;
    const limit = getPlanLimit(profile.plan);
    if (!hasUnlimitedUsage(profile.plan) && currentCount >= limit) {
      return NextResponse.json({ error: "Free plan limit reached. Upgrade to generate more weddings this month." }, { status: 402 });
    }

    const text = await generateWithNvidia(buildWeddingPrompt(inputs));
    const parsed = normalizeResult(extractJsonObject(text), profile.plan);

    const { data: wedding, error: weddingError } = await admin
      .from("weddings")
      .insert({
        user_id: profile.id,
        couple_names: inputs.coupleNames,
        date: inputs.weddingDate || null,
        venue: inputs.venueName || null,
        inputs_json: inputs,
        result_json: parsed
      })
      .select("id")
      .single();

    if (weddingError) throw weddingError;

    const nextCount = currentCount + 1;
    if (usageRow?.id) {
      await admin.from("usage").update({ count: nextCount }).eq("id", usageRow.id);
    } else {
      await admin.from("usage").insert({ user_id: profile.id, month, count: nextCount });
    }

    return NextResponse.json({ result: parsed, weddingId: wedding.id, usage: { month, count: nextCount } });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Generation failed." }, { status: 500 });
  }
}

function sanitizeInputs(body) {
  return {
    coupleNames: String(body.coupleNames || "").slice(0, 160).trim(),
    weddingDate: String(body.weddingDate || "").slice(0, 40),
    venueName: String(body.venueName || "").slice(0, 180).trim(),
    venueType: String(body.venueType || "Church").slice(0, 80),
    guestCount: String(body.guestCount || "50-150").slice(0, 40),
    photographyStyle: String(body.photographyStyle || "Romantic/Editorial").slice(0, 80),
    ceremonyTime: String(body.ceremonyTime || "").slice(0, 40),
    coverageHours: String(body.coverageHours || "").slice(0, 40),
    specialMoments: String(body.specialMoments || "").slice(0, 1200),
    outputs: Array.isArray(body.outputs) ? body.outputs.map(String).slice(0, 8) : []
  };
}

function normalizeResult(result, plan) {
  const normalized = {
    shotList: Array.isArray(result.shotList)
      ? result.shotList.map((category) => ({
          category: String(category.category || "Coverage"),
          shots: Array.isArray(category.shots) ? category.shots.map(String) : []
        }))
      : [],
    timeline: Array.isArray(result.timeline)
      ? result.timeline.map((item) => ({
          time: String(item.time || ""),
          event: String(item.event || ""),
          duration: String(item.duration || ""),
          note: String(item.note || "")
        }))
      : [],
    secondShooterBrief: String(result.secondShooterBrief || ""),
    clientEmail: String(result.clientEmail || "")
  };

  if (plan === "free") {
    return {
      ...normalized,
      timeline: [],
      secondShooterBrief: "",
      clientEmail: ""
    };
  }

  return normalized;
}
