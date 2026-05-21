"use client";

import { SignOutButton as ClerkSignOutButton } from "@clerk/nextjs";

export function SignOutButton() {
  return (
    <ClerkSignOutButton>
      <button className="font-sans text-sm text-muted transition hover:text-gold">
        Sign out
      </button>
    </ClerkSignOutButton>
  );
}
