import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.email("Enter a valid email address").trim(),
  password: z.string().min(8, "Use at least 8 characters").max(128),
});

export const profileSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  handle: z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9_-]{2,31}$/),
  bio: z.string().trim().max(500),
  pronouns: z.string().trim().max(80),
  timezone: z.string().trim().min(1).max(64),
});

export const discussionSchema = z.object({
  title: z.string().trim().min(6, "Give your thought a little more context").max(180),
  body: z.string().trim().min(20, "Add a little more so people know how to respond").max(50_000),
  spaceSlug: z.string().regex(/^[a-z0-9-]+$/),
  tags: z.array(z.string().trim().min(1).max(32)).max(4),
});

export const replySchema = z.object({
  discussionId: z.string().min(1),
  parentId: z.string().optional(),
  body: z.string().trim().min(2).max(20_000),
});

export const chatMessageSchema = z.object({
  roomId: z.string().min(1),
  body: z.string().trim().min(1).max(10_000),
  replyTo: z.string().optional(),
});

export const reportSchema = z.object({
  targetId: z.string().min(1),
  reason: z.enum(["harassment", "hate_or_abuse", "spam", "privacy", "self_harm_concern", "misinformation", "off_topic", "other"]),
  details: z.string().trim().max(2_000),
});
