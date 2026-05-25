import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sanitizeString } from "@/lib/utils";

export async function GET(_request, { params }) {
  try {
    const token = sanitizeString(params.token, 120);
    const admin = createSupabaseAdminClient();
    const { data: link } = await admin
      .from("intake_links")
      .select("id, is_active")
      .eq("token", token)
      .maybeSingle();

    if (!link?.id || !link.is_active) {
      return NextResponse.json({ valid: false }, { status: 404 });
    }

    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json({ valid: false }, { status: 404 });
  }
}
