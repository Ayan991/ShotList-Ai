const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "CLERK_SECRET_KEY",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "DODO_SECRET_KEY",
  "DODO_WEBHOOK_SECRET",
  "DODO_PRO_PRODUCT_ID",
  "DODO_STUDIO_PRODUCT_ID",
  "NVIDIA_API_KEY",
  "RESEND_API_KEY"
];

const missing = required.filter((key) => !process.env[key]);
const optional = ["RESEND_API_KEY"];
const blockingMissing = missing.filter((key) => !optional.includes(key));

if (missing.length > 0) {
  missing.forEach((key) => {
    console.error(`[ShotlistAI] Missing required environment variable: ${key}`);
  });
  if (process.env.NODE_ENV === "production" && blockingMissing.length > 0) {
    throw new Error(`Missing ${blockingMissing.length} required environment variable(s). Check Vercel dashboard.`);
  }
}

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  clerkSecretKey: process.env.CLERK_SECRET_KEY,
  dodoSecretKey: process.env.DODO_SECRET_KEY,
  dodoWebhookSecret: process.env.DODO_WEBHOOK_SECRET,
  dodoProProductId: process.env.DODO_PRO_PRODUCT_ID,
  dodoStudioProductId: process.env.DODO_STUDIO_PRODUCT_ID,
  nvidiaApiKey: process.env.NVIDIA_API_KEY,
  resendApiKey: process.env.RESEND_API_KEY
};
