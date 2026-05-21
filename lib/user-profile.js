import { currentUser } from "@clerk/nextjs/server";

export async function ensureUserProfileByClerkId(admin, clerkUserId) {
  const { data: existing } = await admin
    .from("users")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();

  if (existing) return existing;

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress || null;
  const name = user?.fullName || user?.firstName || null;

  const { data: created, error } = await admin
    .from("users")
    .insert({
      clerk_user_id: clerkUserId,
      email: email || `${clerkUserId}@no-email.local`,
      name,
      plan: "free"
    })
    .select("*")
    .single();

  if (error) throw error;
  return created;
}
