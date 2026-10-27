import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { IdeaSchema, PlatformCopySchema } from "../schema/marketing-content";
import { containsRarityClaim } from "../schema/claims";
import { loadScripts } from "./load-scripts";
import { publicDir, studioRoot } from "./paths";

const AggregateExampleSchema = z.object({
  schemaVersion: z.literal(1),
  status: z.literal("fictional-example"),
  campaignId: z.string(),
  contentId: z.string(),
  variantId: z.string(),
  template: z.enum(["signal-test", "scene-under-scene", "social-code"]),
  platform: z.enum(["tiktok", "instagram-reels", "youtube-shorts", "x"]),
  placement: z.enum(["organic-short-video", "organic-x-post", "paid-short-video"]),
  window: z.object({ start: z.iso.datetime(), end: z.iso.datetime(), timezone: z.literal("UTC") }).strict(),
  sampleSize: z.number().int().min(20),
  metrics: z.object({
    impressions: z.number().int().min(0),
    videoStarts: z.number().int().min(0),
    threeSecondViews: z.number().int().min(0),
    quarterViews: z.number().int().min(0).optional(),
    halfViews: z.number().int().min(0).optional(),
    threeQuarterViews: z.number().int().min(0).optional(),
    completions: z.number().int().min(0),
    averageWatchSeconds: z.number().min(0),
    linkClicks: z.number().int().min(0),
    accessRequests: z.number().int().min(0),
    spend: z.number().min(0).optional(),
  }).strict(),
}).strict();

const scripts = await loadScripts();
const expectedTemplates = new Set(["signal-test", "scene-under-scene", "social-code"]);
const contentRoot = path.join(studioRoot, "content");
const ideas = z.array(IdeaSchema).length(30).parse(JSON.parse(await readFile(path.join(contentRoot, "ideas", "launch-ideas.json"), "utf8")) as unknown);
const platformCopy = z.array(PlatformCopySchema).length(10).parse(JSON.parse(await readFile(path.join(contentRoot, "platform-copy.json"), "utf8")) as unknown);
const analyticsExample = AggregateExampleSchema.parse(JSON.parse(await readFile(path.join(studioRoot, "analytics", "examples", "aggregate-result.example.json"), "utf8")) as unknown);
const analyticsSchema = JSON.parse(await readFile(path.join(studioRoot, "analytics", "schema", "marketing-event.schema.json"), "utf8")) as { additionalProperties?: boolean; properties?: { sampleSize?: { minimum?: number } } };

if (scripts.length !== 10) throw new Error(`Expected exactly 10 launch scripts, found ${scripts.length}.`);
for (const script of scripts) {
  expectedTemplates.delete(script.template);
  if (!script.cta.destination.startsWith("/")) throw new Error(`CTA must use a repository-relative destination: ${script.id}`);
  if (!script.legal.includes("MANYWISE // ROOM ZERO // ADULTS 18+ // DRAFT")) throw new Error(`Missing required draft and age label: ${script.id}`);
  for (const asset of script.assets) {
    const assetPath = path.resolve(publicDir, asset.src);
    if (!assetPath.startsWith(`${publicDir}${path.sep}`)) throw new Error(`Asset escapes public directory: ${asset.src}`);
    await access(assetPath);
  }
}
if (expectedTemplates.size > 0) throw new Error(`Missing templates: ${[...expectedTemplates].join(", ")}`);

const ideaIds = new Set(ideas.map((idea) => idea.id));
if (ideaIds.size !== ideas.length) throw new Error("Content idea IDs must be unique.");
const scriptById = new Map(scripts.map((script) => [script.id, script]));
const platformIds = new Set(platformCopy.map((copy) => copy.contentId));
if (platformIds.size !== platformCopy.length || platformIds.size !== scriptById.size || [...scriptById.keys()].some((id) => !platformIds.has(id))) {
  throw new Error("Platform copy must contain exactly one entry for every launch script.");
}
for (const copy of platformCopy) {
  if (copy.destination !== scriptById.get(copy.contentId)?.cta.destination) throw new Error(`Platform destination differs from reviewed script: ${copy.contentId}`);
}

const creativeCopy = JSON.stringify({
  scripts: scripts.map((script) => ({ ...script, assets: script.assets.map((asset) => ({ alt: asset.alt, provenance: asset.provenance })) })),
  ideas,
  platformCopy,
}).toLowerCase();
if (/\bstudents?\b|after[- ]class|clubroom/.test(creativeCopy)) throw new Error("Marketing content must use explicit adult Room Zero framing, not school-age framing.");
if (containsRarityClaim(JSON.stringify({ ideas, platformCopy }))) throw new Error("Rarity claims are allowed only in video scripts with the complete canonical qualification.");
if (analyticsSchema.additionalProperties !== false || analyticsSchema.properties?.sampleSize?.minimum !== 20) throw new Error("Aggregate analytics schema must reject additional properties and require at least 20 observations.");
if (analyticsExample.sampleSize < 20) throw new Error("Aggregate example is below the privacy threshold.");

console.log(`Validated ${scripts.length} scripts, ${ideas.length} concepts, ${platformCopy.length} platform-copy sets, and aggregate analytics boundaries.`);
