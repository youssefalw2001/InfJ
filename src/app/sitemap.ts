import type { MetadataRoute } from "next";
import { spaces } from "@/lib/demo-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const publicRoutes = ["", "/guidelines", "/privacy", "/join", "/login", "/spaces"];
  return [...publicRoutes.map((route) => ({ url: `${base}${route}`, lastModified: new Date("2026-10-27"), changeFrequency: route === "" ? "weekly" as const : "monthly" as const, priority: route === "" ? 1 : 0.6 })), ...spaces.map((space) => ({ url: `${base}/spaces/${space.slug}`, lastModified: new Date("2026-10-27"), changeFrequency: "weekly" as const, priority: 0.7 }))];
}
