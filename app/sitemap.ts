import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/square/catalog";
import { policies } from "@/lib/policies";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://atelierdemerieux.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const now = new Date();

  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/custom-order`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/meet-the-maker`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/accessibility`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    ...categories.map((category) => ({
      url: `${SITE_URL}/shop/category/${category.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((product) => ({
      url: `${SITE_URL}/shop/${product.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...policies.map((policy) => ({
      url: `${SITE_URL}/policies/${policy.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
