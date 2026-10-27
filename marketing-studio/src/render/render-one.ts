import { loadScript } from "./load-scripts";
import { renderVideos } from "./render-videos";

const identifier = process.argv[2];
if (!identifier) throw new Error("Usage: pnpm render <script-id>");

await renderVideos([await loadScript(identifier)]);
