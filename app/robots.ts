import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://atelierdemerieux.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Nothing is gained by indexing a cart or a confirmation page, and a
      // confirmation page in an index is a privacy problem.
      disallow: ["/checkout", "/checkout/", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
