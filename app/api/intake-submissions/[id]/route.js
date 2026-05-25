import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureUserProfileByClerkId } from "@/lib/user-profile";
import { sanitizeString } from "@/lib/utils";

export async function PATCH(request, { params }) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const submissionId = sanitizeString(params.id, 80);
    const body = await request.json();
    const status = sanitizeString(body.status, 20);
    if (!["new", "used"].includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const profile = await ensureUserProfileByClerkId(admin, userId);
    const { error } = await admin
      .from("intake_submissions")
      .update({ status })
      .eq("id", submissionId)
      .eq("user_id", profile.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to update submission." }, { status: 500 });
  }
}
