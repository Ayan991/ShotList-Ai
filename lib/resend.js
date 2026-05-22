import { Resend } from "resend";
import { env } from "@/lib/env";

export function createResendClient() {
  if (!env.resendApiKey) {
    throw new Error("Resend API key is not configured.");
  }

  return new Resend(env.resendApiKey);
}
