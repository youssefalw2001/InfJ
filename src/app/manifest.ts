import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Manywise",
    short_name: "Manywise",
    description: "The after-class clubroom for adults who love INFJ reflection, anime character study, and meaningful conversation.",
    start_url: "/home",
    display: "standalone",
    background_color: "#f4efe5",
    theme_color: "#173f37",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
