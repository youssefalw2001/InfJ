import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Manywise",
    short_name: "Manywise",
    description: "Manywise Room Zero: a private-feeling forum for INFJ signal, anime analysis, live channels, and uncommon conversations.",
    start_url: "/home",
    display: "standalone",
    background_color: "#07100e",
    theme_color: "#c6ff4a",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
