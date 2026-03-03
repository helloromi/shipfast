import type { MetadataRoute } from "next";

function getBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://cote-cour.fr";
  return base.startsWith("http") ? base : `https://${base}`;
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
