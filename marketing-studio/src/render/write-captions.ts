import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadScripts } from "./load-scripts";
import { captionsDir } from "./paths";

function timestamp(frame: number, fps: number, separator: "," | ".") {
  const totalMs = Math.round((frame / fps) * 1000);
  const hours = Math.floor(totalMs / 3_600_000);
  const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
  const seconds = Math.floor((totalMs % 60_000) / 1000);
  const milliseconds = totalMs % 1000;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}${separator}${String(milliseconds).padStart(3, "0")}`;
}

const scripts = await loadScripts();
await mkdir(captionsDir, { recursive: true });

function containsEquivalentInstruction(cue: string, cta: string) {
  const ignored = new Set(["a", "an", "the", "your", "room", "zero", "to", "into", "inside"]);
  const words = (copy: string) => copy.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((word) => word && !ignored.has(word));
  const cueWords = new Set(words(cue));
  const ctaWords = words(cta);
  return ctaWords.length > 0 && ctaWords.every((word) => cueWords.has(word));
}

for (const script of scripts) {
  const accessibilityNotices = script.template === "signal-test"
    ? ["NO CORRECT ANSWER // NO TYPE TEST"]
    : script.template === "scene-under-scene"
      ? ["ORIGINAL ADULT CAST // NO BORROWED WORLDS"]
      : ["READ THE LAYER UNDERNEATH"];
  const sidecarCues = script.captions.map((cue, index) => {
    if (index !== script.captions.length - 1) return cue;
    const ctaAlreadyPresent = containsEquivalentInstruction(cue.text, script.cta.label);
    const suffix = [...(ctaAlreadyPresent ? [] : [script.cta.label]), ...accessibilityNotices, "Adults 18+", "Draft"].join(". ");
    return { ...cue, text: `${cue.text} ${suffix}.` };
  });
  const srt = sidecarCues.map((cue, index) => `${index + 1}\n${timestamp(cue.from, script.fps, ",")} --> ${timestamp(cue.to, script.fps, ",")}\n${cue.text}`).join("\n\n");
  const vtt = `WEBVTT\n\n${sidecarCues.map((cue) => `${timestamp(cue.from, script.fps, ".")} --> ${timestamp(cue.to, script.fps, ".")}\n${cue.text}`).join("\n\n")}`;
  const transcript = [
    `TITLE: ${script.title}`,
    `HOOK: ${script.hook}`,
    ...script.supporting.map((line) => `SUPPORT: ${line}`),
    ...(script.question ? [`QUESTION: ${script.question}`] : []),
    ...(script.choices.length > 0 ? [`CHOICES: ${script.choices.join("; ")}`] : []),
    `CALL TO ACTION: ${script.cta.label}`,
    `DESTINATION: ${script.cta.destination}`,
    ...accessibilityNotices.map((notice) => `NOTICE: ${notice}`),
    "AUDIENCE: ADULTS 18+",
    "STATUS: DRAFT — HUMAN APPROVAL REQUIRED BEFORE PUBLISHING",
  ].join("\n");
  await Promise.all([
    writeFile(path.join(captionsDir, `${script.id}.srt`), `${srt}\n`),
    writeFile(path.join(captionsDir, `${script.id}.vtt`), `${vtt}\n`),
    writeFile(path.join(captionsDir, `${script.id}.txt`), `${transcript}\n`),
  ]);
}

console.log(`Wrote complete SRT, VTT, and transcript alternatives for ${scripts.length} scripts.`);
