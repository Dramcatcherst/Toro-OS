import type { MetadataRoute } from "next";

const siteUrl = "https://toro-os-v03.vercel.app";
const lastModified = new Date("2026-06-15T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/dreamcatcher`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/os`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
