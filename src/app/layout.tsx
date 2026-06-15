import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://toro-os-v03.vercel.app"),
  title: "TORO OS",
  description: "AI business operator foundation with approval-gated operational scaffolding.",
  applicationName: "Dreamcatcher Hotel",
  appleWebApp: {
    capable: true,
    title: "Dreamcatcher",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#120f0b",
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
