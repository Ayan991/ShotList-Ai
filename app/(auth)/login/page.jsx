import { SignIn } from "@clerk/nextjs";

export const metadata = {
  title: "Login"
};

export default function LoginPage() {
  return (
    <div className="rounded border border-line bg-surface p-6 shadow-editorial">
      <SignIn
        path="/login"
        routing="path"
        signUpUrl="/signup"
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
  );
}
