const productionUrl = "https://toro-os-v03.vercel.app";
const previewUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;

export const dynamic = "force-static";

export async function GET() {
  return Response.json({
    ok: true,
    site: "Dreamcatcher Hotel Santa Teresa / TORO OS",
    productionUrl,
    previewUrl,
    validatedRoutes: [
      { path: "/", purpose: "Dreamcatcher public home", expected: "200 + Dreamcatcher metadata" },
      { path: "/dreamcatcher", purpose: "Dreamcatcher review alias", expected: "200 + same microsite" },
      { path: "/os", purpose: "TORO OS operator dashboard", expected: "200 + internal dashboard" },
      { path: "/sitemap.xml", purpose: "SEO route map", expected: "200 + production URLs" },
      { path: "/robots.txt", purpose: "Crawler policy", expected: "200 + sitemap reference" },
      { path: "/manifest.webmanifest", purpose: "PWA metadata", expected: "200 + Dreamcatcher app shell" },
      { path: "/api/connectors/kross", purpose: "Kross direct-booking readiness", expected: "200 + read-only readiness contract" },
    ],
    guardrails: [
      "No Kross price, availability, payment or reservation mutation.",
      "No Airtable, WhatsApp Business, social publishing or channel writes.",
      "Public CTAs prepare guest drafts only; Dreamcatcher/Kross must confirm commercial facts.",
    ],
  });
}
