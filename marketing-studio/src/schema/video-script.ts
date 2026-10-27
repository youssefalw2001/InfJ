import { z } from "zod";
import { containsRarityClaim, hasCompleteRarityQualification } from "./claims";

const CaptionCueSchema = z.object({
  from: z.number().int().min(0),
  to: z.number().int().positive(),
  text: z.string().trim().min(1).max(110),
});

const AssetSchema = z.object({
  src: z.string().trim().min(1),
  alt: z.string().trim().min(1),
  provenance: z.enum(["original", "licensed", "public-domain"]),
});

export const VideoScriptSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  template: z.enum(["signal-test", "scene-under-scene", "social-code"]),
  campaignId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  variantId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(1).max(90),
  fps: z.literal(30),
  durationFrames: z.literal(450),
  reducedMotion: z.boolean().default(false),
  locale: z.literal("en"),
  eyebrow: z.string().trim().min(1).max(48),
  hook: z.string().trim().min(1).max(120),
  supporting: z.array(z.string().trim().min(1).max(130)).min(1).max(4),
  question: z.string().trim().max(130).optional(),
  choices: z.array(z.string().trim().min(1).max(72)).max(4).default([]),
  cta: z.object({
    label: z.string().trim().min(1).max(48),
    destination: z.string().trim().min(1).max(120),
  }),
  accent: z.enum(["signal", "cyan", "amber"]),
  captions: z.array(CaptionCueSchema).min(1),
  legal: z.array(z.string().trim().min(1).max(180)).min(1),
  assets: z.array(AssetSchema).default([]),
  publishTargets: z.array(z.enum(["tiktok", "instagram-reels", "youtube-shorts", "x"])).min(1),
  analyticsTags: z.array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)).min(1),
  status: z.literal("draft"),
}).superRefine((script, context) => {
  const allCopy = [
    script.title,
    script.eyebrow,
    script.hook,
    ...script.supporting,
    script.question ?? "",
    ...script.choices,
    script.cta.label,
    ...script.captions.map((cue) => cue.text),
    ...script.assets.map((asset) => asset.alt),
    ...script.legal,
  ].join(" ");
  const legalCopy = script.legal.join(" ");

  if (containsRarityClaim(allCopy) && !hasCompleteRarityQualification(legalCopy)) {
    context.addIssue({ code: "custom", path: ["legal"], message: "Use the complete canonical rarity qualification: some MBTI samples place INFJ around 1–2%; results vary by sample, region, and method; rare does not mean ranked." });
  }

  let previousTo = 0;
  script.captions.forEach((cue, index) => {
    if (cue.to <= cue.from) context.addIssue({ code: "custom", path: ["captions", index], message: "Caption end must follow its start." });
    if (cue.from < previousTo) context.addIssue({ code: "custom", path: ["captions", index], message: "Caption cues cannot overlap." });
    if (cue.to > script.durationFrames) context.addIssue({ code: "custom", path: ["captions", index], message: "Caption exceeds video duration." });
    previousTo = cue.to;
  });
});

export type VideoScript = z.infer<typeof VideoScriptSchema>;
