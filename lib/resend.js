import { Resend } from "resend";

export function createResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Resend API key is not configured.");
  }

  return new Resend(process.env.RESEND_API_KEY);
}
