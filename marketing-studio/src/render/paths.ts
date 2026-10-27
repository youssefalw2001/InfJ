import path from "node:path";
import { fileURLToPath } from "node:url";

export const studioRoot = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
export const repositoryRoot = path.resolve(studioRoot, "..");
export const entryPoint = path.join(studioRoot, "src", "index.ts");
export const publicDir = path.join(repositoryRoot, "public");
export const scriptsDir = path.join(studioRoot, "content", "scripts");
export const captionsDir = path.join(studioRoot, "content", "captions");
export const draftsDir = path.join(studioRoot, "renders", "drafts");
export const postersDir = path.join(studioRoot, "renders", "posters");
