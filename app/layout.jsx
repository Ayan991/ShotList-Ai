import "./globals.css";

export const metadata = {
  title: "ShotlistAI",
  description: "AI shot lists, wedding timelines, and second shooter briefs for photographers.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
