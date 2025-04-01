import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GalaChain React Example",
  description: "React + Next.js example for GalaChain integration",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen p-8">{children}</main>
      </body>
    </html>
  );
}
