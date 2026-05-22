import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// SECURITY: This client uses the service role key.
// NEVER import this file in client components or pages.
// Only use in app/api/** routes.
export function createSupabaseAdminClient() {
  const url = env.supabaseUrl;
  const serviceRoleKey = env.supabaseServiceRoleKey;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase admin client is not configured.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
