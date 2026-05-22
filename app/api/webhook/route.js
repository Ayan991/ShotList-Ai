import { NextResponse } from "next/server";

export async function POST(request) {
  await request.text();
  return NextResponse.json(
    { error: "Webhook handler not implemented yet. Add Dodo webhook implementation here." },
    { status: 501 }
  );
}
