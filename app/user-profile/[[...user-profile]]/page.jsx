import { UserProfile } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { getClerkUserId } from "@/lib/auth";

export const metadata = {
  title: "Profile"
};

export default function UserProfilePage() {
  const userId = getClerkUserId();
  if (!userId) redirect("/login");

  return (
    <main className="min-h-screen bg-obsidian px-5 py-10 text-text md:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">Account</p>
        <h1 className="mt-3 font-serif text-4xl text-text md:text-5xl">Manage your profile.</h1>
        <div className="mt-8 overflow-hidden rounded border border-line bg-surface p-2 md:p-4">
          <UserProfile
            path="/user-profile"
            routing="path"
            appearance={{
              variables: {
                colorBackground: "#1A1915",
                colorInputBackground: "#0F0E0C",
                colorInputText: "#E8E0D4",
                colorText: "#E8E0D4",
                colorTextSecondary: "#7A7268",
                colorPrimary: "#C8A97E",
                colorDanger: "#C87E7E",
                borderRadius: "2px",
                fontFamily: "var(--font-dm-sans)"
              }
            }}
          />
        </div>
      </div>
    </main>
  );
}
