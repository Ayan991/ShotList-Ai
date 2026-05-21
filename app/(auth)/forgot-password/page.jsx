import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export const metadata = {
  title: "Forgot password"
};

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <AuthForm mode="forgot" />
    </Suspense>
  );
}
