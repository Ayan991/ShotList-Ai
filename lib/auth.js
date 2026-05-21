import { auth } from "@clerk/nextjs/server";

export function getClerkUserId() {
  const { userId } = auth();
  return userId || null;
}
