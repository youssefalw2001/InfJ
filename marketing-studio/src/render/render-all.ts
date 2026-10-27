import { loadScripts } from "./load-scripts";
import { renderVideos } from "./render-videos";

await renderVideos(await loadScripts());
