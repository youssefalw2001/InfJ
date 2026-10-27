export const roomZero = {
  colors: {
    void: "#030907",
    paper: "#07100e",
    surface: "#0e1d19",
    surfaceStrong: "#132720",
    ink: "#e6f1ea",
    inkSoft: "#c0d2c8",
    muted: "#8ba096",
    line: "#263b34",
    lineStrong: "#3d574d",
    signal: "#c6ff4a",
    cyan: "#55d8e3",
    amber: "#ff986d",
    danger: "#ff6c68",
  },
  fonts: {
    sans: "Manrope, Inter, ui-sans-serif, system-ui, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace",
  },
  video: {
    width: 1080,
    height: 1920,
    fps: 30,
    durationInFrames: 450,
    safeX: 72,
    safeTop: 138,
    safeBottom: 260,
  },
} as const;

export type Accent = "signal" | "cyan" | "amber";

export const accentColor = (accent: Accent) => roomZero.colors[accent];
