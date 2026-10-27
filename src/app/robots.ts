import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return { rules: [{ userAgent: "*", allow: ["/", "/guidelines", "/privacy", "/spaces"], disallow: ["/home", "/chat", "/notifications", "/settings", "/members", "/onboarding"] }], sitemap: `${base}/sitemap.xml` };
}
