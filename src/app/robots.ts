import type { MetadataRoute } from "next";

const siteUrl = "https://toro-os-v03.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/dreamcatcher", "/dreamcatcher-media/"],
        disallow: ["/api/", "/os", "/modules"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
