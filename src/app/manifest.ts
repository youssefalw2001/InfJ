import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Manywise",
    short_name: "Manywise",
    description: "A thoughtful community for people who use INFJ as a lens, never a box.",
    start_url: "/home",
    display: "standalone",
    background_color: "#f4efe5",
    theme_color: "#173f37",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
