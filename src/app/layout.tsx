import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { TORO_SEARCH_PATH } from "@/lib/search/ui-contract.mjs";
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
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#030712] text-slate-100">
        {children}
        <Link
          href={TORO_SEARCH_PATH}
          aria-label="Buscar en TORO OS"
          className="fixed bottom-4 right-4 z-50 inline-flex h-12 items-center gap-2 border border-cyan-300/40 bg-slate-950/95 px-4 text-sm font-semibold text-cyan-50 shadow-[0_14px_40px_rgba(0,0,0,0.45)] backdrop-blur transition hover:bg-cyan-300/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/40 md:bottom-6 md:right-6"
        >
          <Search className="h-4 w-4" />
          Buscar
        </Link>
      </body>
    </html>
  );
}
