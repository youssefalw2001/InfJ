import { z } from "zod";

export const IdeaSchema = z.object({
  id: z.string().regex(/^idea-\d{3}$/),
  pillar: z.enum(["signal-test", "scene-under-scene", "social-code"]),
  destination: z.string().startsWith("/"),
  hook: z.string().trim().min(1).max(130),
  format: z.string().trim().min(1).max(50),
  channel: z.enum(["tiktok", "instagram-reels", "youtube-shorts", "x"]),
  hypothesis: z.string().trim().min(1).max(180),
  cta: z.string().trim().min(1).max(90),
  audience: z.literal("adults-18-plus"),
  status: z.literal("concept"),
});

export const PlatformCopySchema = z.object({
  contentId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  status: z.literal("draft"),
  destination: z.string().startsWith("/"),
  x: z.string().trim().min(1).max(280).refine((copy) => copy.includes("18+"), "X copy must identify the 18+ audience."),
  instagramReels: z.string().trim().min(1).max(500).refine((copy) => copy.includes("18+"), "Instagram copy must identify the 18+ audience."),
  tiktok: z.string().trim().min(1).max(500).refine((copy) => copy.includes("18+"), "TikTok copy must identify the 18+ audience."),
  youtubeShorts: z.string().trim().min(1).max(500).refine((copy) => copy.includes("18+"), "YouTube copy must identify the 18+ audience."),
});

export type MarketingIdea = z.infer<typeof IdeaSchema>;
