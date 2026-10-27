import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { IdeaSchema } from "../schema/marketing-content";
import { loadScripts } from "./load-scripts";
import { studioRoot } from "./paths";

const ideasPath = path.join(studioRoot, "content", "ideas", "launch-ideas.json");
const outputDir = path.join(studioRoot, "content", "calendar");
const scripts = await loadScripts();
const ideas = z.array(IdeaSchema).length(30).parse(JSON.parse(await readFile(ideasPath, "utf8")) as unknown);
const platforms = ["instagram-reels", "tiktok", "youtube-shorts", "x"] as const;
const inputs = [
  ...scripts.map((script, index) => ({
    contentId: script.id,
    template: script.template,
    format: "animated-video",
    channel: platforms[index % platforms.length],
    variantId: script.variantId,
    caption: script.hook,
    cta: script.cta.label,
    ctaDestination: script.cta.destination,
    assetPath: `renders/drafts/${script.id}.mp4`,
    reducedMotionAssetPath: `renders/drafts/${script.id}-reduced-motion.mp4`,
    notes: "Draft render paths. Trust-gate and exact human approval required before publication.",
  })),
  ...ideas.slice(0, 20).map((idea) => ({
    contentId: idea.id,
    template: idea.pillar,
    format: idea.format,
    channel: idea.channel,
    variantId: "concept-a",
    caption: idea.hook,
    cta: idea.cta,
    ctaDestination: idea.destination,
    assetPath: null,
    reducedMotionAssetPath: null,
    notes: "Unproduced concept. Requires scripting, rendering, trust-gate, and exact human approval.",
  })),
];

const calendar = inputs.map((input, index) => {
  const plannedAt = new Date(Date.UTC(2026, 9, 28 + index, 18, 0, 0)).toISOString();
  return {
    contentId: input.contentId,
    campaignId: "room-zero-launch",
    channel: input.channel,
    format: input.format,
    template: input.template,
    variantId: input.variantId,
    status: "draft",
    owner: "human",
    plannedAt,
    publishedAt: null,
    caption: input.caption,
    cta: input.cta,
    ctaDestination: input.ctaDestination,
    utm: {
      source: input.channel,
      medium: "organic-social",
      campaign: "room-zero-launch",
      content: input.contentId,
    },
    assetPath: input.assetPath,
    reducedMotionAssetPath: input.reducedMotionAssetPath,
    notes: input.notes,
  };
});

function csvCell(value: unknown) {
  const text = value === null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

const headers = ["contentId", "campaignId", "channel", "format", "template", "variantId", "status", "owner", "plannedAt", "publishedAt", "caption", "cta", "ctaDestination", "utmSource", "utmMedium", "utmCampaign", "utmContent", "assetPath", "reducedMotionAssetPath", "notes"];
const rows = calendar.map((item) => [item.contentId, item.campaignId, item.channel, item.format, item.template, item.variantId, item.status, item.owner, item.plannedAt, item.publishedAt, item.caption, item.cta, item.ctaDestination, item.utm.source, item.utm.medium, item.utm.campaign, item.utm.content, item.assetPath, item.reducedMotionAssetPath, item.notes]);
const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");

await mkdir(outputDir, { recursive: true });
await Promise.all([
  writeFile(path.join(outputDir, "content-calendar.json"), `${JSON.stringify(calendar, null, 2)}\n`),
  writeFile(path.join(outputDir, "content-calendar.csv"), `${csv}\n`),
]);

console.log(`Wrote a ${calendar.length}-day draft calendar from 2026-10-28 through 2026-11-26.`);
