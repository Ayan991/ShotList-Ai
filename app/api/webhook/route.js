import crypto from "crypto";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function verifyDodoSignature(rawBody, signature, secret) {
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(request) {
  const rawBody = await request.text();
  const signature = request.headers.get("dodo-signature") || request.headers.get("x-dodo-signature");
  if (!signature || !env.dodoWebhookSecret || !verifyDodoSignature(rawBody, signature, env.dodoWebhookSecret)) {
    console.warn("[ShotlistAI] Invalid Dodo webhook signature.");
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const eventType = payload?.type || payload?.event || "";
  const data = payload?.data || payload;
  const productId = data?.product_id || data?.line_item?.product_id || data?.product?.id || "";
  const externalId = data?.external_id || data?.metadata?.external_id || data?.customer?.external_id || "";
  const email = data?.customer?.email || data?.email || "";

  const admin = createSupabaseAdminClient();
  const targetPlan =
    String(productId) === String(env.dodoProProductId)
      ? "pro"
      : String(productId) === String(env.dodoStudioProductId)
        ? "studio"
        : null;

  if (eventType.includes("subscription.cancel") || eventType.includes("subscription.deleted")) {
    if (externalId) {
      await admin.from("users").update({ plan: "free" }).eq("id", externalId);
    } else if (email) {
      await admin.from("users").update({ plan: "free" }).eq("email", email);
    }
    return NextResponse.json({ received: true });
  }

  if ((eventType.includes("payment.succeeded") || eventType.includes("subscription.active") || eventType.includes("checkout.completed")) && targetPlan) {
    if (externalId) {
      await admin.from("users").update({ plan: targetPlan }).eq("id", externalId);
    } else if (email) {
      await admin.from("users").update({ plan: targetPlan }).eq("email", email);
    }
  }

  return NextResponse.json({ received: true });
}
