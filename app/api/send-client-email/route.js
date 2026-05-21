import { NextResponse } from "next/server";
import { createResendClient } from "@/lib/resend";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAuthedUser } from "@/lib/supabase/server";

export async function POST(request) {
  const { user } = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { weddingId, to } = await request.json();
  if (!weddingId || !to) {
    return NextResponse.json({ error: "Wedding ID and recipient email are required." }, { status: 400 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const { data: wedding, error } = await admin
      .from("weddings")
      .select("couple_names, result_json")
      .eq("id", weddingId)
      .eq("user_id", user.id)
      .single();

    if (error) throw error;
    const clientEmail = wedding.result_json?.clientEmail;
    if (!clientEmail) {
      return NextResponse.json({ error: "This wedding does not have a client email generated." }, { status: 400 });
    }

    const resend = createResendClient();
    await resend.emails.send({
      from: "ShotlistAI <onboarding@resend.dev>",
      to,
      subject: `${wedding.couple_names} wedding prep`,
      text: clientEmail
    });

    return NextResponse.json({ sent: true });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Email failed." }, { status: 500 });
  }
}
