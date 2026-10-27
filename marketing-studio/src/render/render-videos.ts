import { mkdir } from "node:fs/promises";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import type { VideoScript } from "../schema/video-script";
import { draftsDir, entryPoint, postersDir, publicDir, studioRoot } from "./paths";

const compositionByTemplate: Record<VideoScript["template"], string> = {
  "signal-test": "RoomZeroSignalTest",
  "scene-under-scene": "RoomZeroSceneUnderScene",
  "social-code": "RoomZeroSocialCode",
};

export async function renderVideos(scripts: VideoScript[]) {
  await Promise.all([mkdir(draftsDir, { recursive: true }), mkdir(postersDir, { recursive: true })]);
  const serveUrl = await bundle({ entryPoint, publicDir, rootDir: studioRoot, enableCaching: true });

  for (const script of scripts) {
    const inputProps = { ...script, reducedMotion: false };
    const reducedMotionProps = { ...script, reducedMotion: true };
    const compositionId = compositionByTemplate[script.template];
    const composition = await selectComposition({ serveUrl, id: compositionId, inputProps });
    const reducedMotionComposition = await selectComposition({ serveUrl, id: compositionId, inputProps: reducedMotionProps });
    const outputLocation = path.join(draftsDir, `${script.id}.mp4`);
    const reducedMotionOutput = path.join(draftsDir, `${script.id}-reduced-motion.mp4`);
    const posterLocation = path.join(postersDir, `${script.id}.png`);

    await renderMedia({ codec: "h264", composition, concurrency: 2, inputProps, logLevel: "warn", outputLocation, serveUrl });
    await renderMedia({ codec: "h264", composition: reducedMotionComposition, concurrency: 2, inputProps: reducedMotionProps, logLevel: "warn", outputLocation: reducedMotionOutput, serveUrl });
    await renderStill({ composition, frame: 360, imageFormat: "png", inputProps, logLevel: "warn", output: posterLocation, serveUrl });
    console.log(`Rendered ${script.id}: standard MP4, reduced-motion MP4, and poster.`);
  }
}
