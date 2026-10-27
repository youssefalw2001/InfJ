import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { loadScripts } from "./load-scripts";
import { draftsDir, postersDir, publicDir, studioRoot } from "./paths";

async function fingerprint(file: string) {
  const content = await readFile(file);
  const details = await stat(file);
  return {
    path: path.relative(studioRoot, file),
    bytes: details.size,
    sha256: createHash("sha256").update(content).digest("hex"),
  };
}

const sourceFiles = [
  "src/Root.tsx",
  "src/brand/tokens.ts",
  "src/components/BrandMark.tsx",
  "src/components/Captions.tsx",
  "src/components/SignalBackdrop.tsx",
  "src/components/StudioFrame.tsx",
  "src/schema/claims.ts",
  "src/schema/video-script.ts",
  "src/templates/SceneUnderScene.tsx",
  "src/templates/SignalTest.tsx",
  "src/templates/SocialCode.tsx",
].map((file) => path.join(studioRoot, file));
const scripts = await loadScripts();
const artifacts = [];

for (const script of scripts) {
  artifacts.push({
    contentId: script.id,
    inputSha256: createHash("sha256").update(JSON.stringify(script)).digest("hex"),
    standard: await fingerprint(path.join(draftsDir, `${script.id}.mp4`)),
    reducedMotion: await fingerprint(path.join(draftsDir, `${script.id}-reduced-motion.mp4`)),
    poster: await fingerprint(path.join(postersDir, `${script.id}.png`)),
  });
}

const manifest = {
  schemaVersion: 1,
  status: "draft-human-approval-required",
  generatedAt: new Date().toISOString(),
  settings: { width: 1080, height: 1920, fps: 30, durationSeconds: 15, videoCodec: "h264", audio: false },
  sourceFiles: await Promise.all(sourceFiles.map(fingerprint)),
  approvedAssets: [
    await fingerprint(path.join(publicDir, "after-class-cast.svg")),
    await fingerprint(path.join(publicDir, "icon.svg")),
  ],
  artifacts,
};

const reviewsDir = path.join(studioRoot, "reviews");
await mkdir(reviewsDir, { recursive: true });
await writeFile(path.join(reviewsDir, "render-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Bound ${artifacts.length * 3} rendered artifacts to source and input SHA-256 hashes.`);
