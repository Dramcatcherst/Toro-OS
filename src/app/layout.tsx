import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TORO OS",
  description: "AI business operator foundation with approval-gated operational scaffolding.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#030712] text-slate-100">{children}</body>
    </html>
  );
}
