export default function AuthLayout({ children }) {
  return (
    <main className="luxury-shell grid min-h-screen place-items-center px-5 py-10">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
