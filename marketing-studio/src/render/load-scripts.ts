import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { VideoScriptSchema, type VideoScript } from "../schema/video-script";
import { scriptsDir } from "./paths";

async function listJsonFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listJsonFiles(fullPath);
    return entry.isFile() && entry.name.endsWith(".json") ? [fullPath] : [];
  }));
  return files.flat().sort();
}

export async function loadScripts(): Promise<VideoScript[]> {
  const files = await listJsonFiles(scriptsDir);
  if (files.length === 0) throw new Error(`No script files found under ${scriptsDir}`);

  const scripts = await Promise.all(files.map(async (file) => {
    const raw = JSON.parse(await readFile(file, "utf8")) as unknown;
    const result = VideoScriptSchema.safeParse(raw);
    if (!result.success) {
      throw new Error(`${path.relative(studioRootForMessage(), file)}\n${result.error.issues.map((issue) => `- ${issue.path.join(".")}: ${issue.message}`).join("\n")}`);
    }
    return result.data;
  }));

  const ids = new Set<string>();
  for (const script of scripts) {
    if (ids.has(script.id)) throw new Error(`Duplicate script id: ${script.id}`);
    ids.add(script.id);
  }

  return scripts;
}

function studioRootForMessage(): string {
  return path.resolve(scriptsDir, "..", "..");
}

export async function loadScript(identifier: string): Promise<VideoScript> {
  const scripts = await loadScripts();
  const normalized = identifier.replace(/\.json$/, "");
  const match = scripts.find((script) => script.id === normalized);
  if (!match) throw new Error(`Unknown script “${identifier}”. Available: ${scripts.map((script) => script.id).join(", ")}`);
  return match;
}
