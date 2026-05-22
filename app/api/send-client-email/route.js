import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { env } from "@/lib/env";
import { createResendClient } from "@/lib/resend";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureUserProfileByClerkId } from "@/lib/user-profile";
import { sanitizeString } from "@/lib/utils";

const rateLimitMap = new Map();

function isRateLimited(userId) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 3;
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

  const { weddingId: rawWeddingId, to, content } = await request.json();
  const weddingId = sanitizeString(rawWeddingId, 80);
  if (!weddingId || !to) {
    return NextResponse.json({ error: "Wedding ID and recipient email are required." }, { status: 400 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const profile = await ensureUserProfileByClerkId(admin, userId);
    const { data: wedding, error } = await admin
      .from("weddings")
      .select("couple_names, result_json")
      .eq("id", weddingId)
      .eq("user_id", profile.id)
      .single();

    if (error) throw error;
    const clientEmail = sanitizeString(content || wedding.result_json?.clientEmail || "", 10000);
    if (!clientEmail) {
      return NextResponse.json({ error: "This wedding does not have a client email generated." }, { status: 400 });
    }
    const recipient = sanitizeString(to, 160);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
      return NextResponse.json({ error: "Invalid recipient email." }, { status: 400 });
    }

    if (!env.resendApiKey) {
      return NextResponse.json({ error: "Resend is not configured." }, { status: 500 });
    }

    const resend = createResendClient();
    await resend.emails.send({
      from: "ShotlistAI <onboarding@resend.dev>",
      to: recipient,
      subject: `${sanitizeString(wedding.couple_names, 120)} wedding prep`,
      text: clientEmail
    });

    return NextResponse.json({ sent: true });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Email failed." }, { status: 500 });
  }
}
