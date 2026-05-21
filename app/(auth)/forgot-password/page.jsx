import Link from "next/link";

export const metadata = {
  title: "Forgot password"
};

export default function ForgotPasswordPage() {
  return (
    <div className="rounded border border-line bg-surface p-8 shadow-editorial">
      <h1 className="font-serif text-4xl text-text">Reset password</h1>
      <p className="mt-4 font-sans text-sm leading-6 text-muted">
        Password reset is handled in the Clerk sign-in flow. Open login and choose “Forgot password?”.
      </p>
      <Link href="/login" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-sm bg-gold px-5 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-obsidian">
        Go to Login
      </Link>
    </div>
  );
}
