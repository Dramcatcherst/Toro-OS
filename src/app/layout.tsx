import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://toro.dreamcatcherhotel.com"),
  title: {
    default: "TORO",
    template: "%s | TORO",
  },
  description: "Portal privado para coordinar la operación, las herramientas y la evidencia autorizada de Dreamcatcher Hotel.",
  applicationName: "TORO",
  category: "business",
  alternates: {
    canonical: "/portal",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_CR",
    url: "/portal",
    siteName: "TORO",
    title: "TORO",
    description: "Operación conectada con contexto, permisos y evidencia.",
    images: [{
      url: "/opengraph-image",
      width: 1200,
      height: 630,
      alt: "TORO · Operación conectada",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TORO",
    description: "Operación conectada con contexto, permisos y evidencia.",
    images: ["/twitter-image"],
  },
  manifest: "/manifest.webmanifest",
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
