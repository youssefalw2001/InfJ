import { loadScripts } from "./load-scripts";
import { renderVideos } from "./render-videos";

const sampleIds = new Set(["signal-test-001", "scene-under-scene-001", "social-code-001"]);
const scripts = (await loadScripts()).filter((script) => sampleIds.has(script.id));
if (scripts.length !== sampleIds.size) throw new Error(`Expected sample scripts: ${[...sampleIds].join(", ")}`);

await renderVideos(scripts);
