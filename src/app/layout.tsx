import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TORO Brain",
  description: "TORO Brain makes complex business operations easier to understand, coordinate and execute.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#030712] text-slate-100">{children}</body>
    </html>
  );
}
