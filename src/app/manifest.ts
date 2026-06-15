import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dreamcatcher Hotel Santa Teresa",
    short_name: "Dreamcatcher",
    description: "Boutique hotel, private villas and full-property buyout inquiries in Santa Teresa.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#120f0b",
    theme_color: "#120f0b",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/dreamcatcher-media/hero-santa-teresa.svg",
        sizes: "1600x1100",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
