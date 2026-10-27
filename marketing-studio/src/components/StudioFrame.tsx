import type { PropsWithChildren } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { accentColor, roomZero, type Accent } from "../brand/tokens";
import { BrandMark } from "./BrandMark";
import { SignalBackdrop } from "./SignalBackdrop";

type StudioFrameProps = PropsWithChildren<{
  accent: Accent;
  eyebrow: string;
  legal: string[];
  reducedMotion?: boolean;
  code: string;
}>;

export function StudioFrame({ accent, eyebrow, legal, reducedMotion = false, code, children }: StudioFrameProps) {
  const frame = useCurrentFrame();
  const pulse = reducedMotion ? 1 : interpolate(frame % 90, [0, 45, 89], [0.6, 1, 0.6]);
  const color = accentColor(accent);

  return (
    <AbsoluteFill style={{ color: roomZero.colors.ink, fontFamily: roomZero.fonts.sans }}>
      <SignalBackdrop reducedMotion={reducedMotion} />
      <AbsoluteFill style={{ border: `2px solid ${roomZero.colors.lineStrong}`, margin: 36, pointerEvents: "none" }} />
      <header
        style={{
          alignItems: "center",
          display: "flex",
          gap: 22,
          left: roomZero.video.safeX,
          position: "absolute",
          right: roomZero.video.safeX,
          top: 72,
          zIndex: 30,
        }}
      >
        <BrandMark color={color} />
        <div style={{ flex: 1 }}>
          <div style={{ color, fontFamily: roomZero.fonts.mono, fontSize: 23, fontWeight: 800, letterSpacing: 2.4 }}>{eyebrow}</div>
          <div style={{ color: roomZero.colors.muted, fontFamily: roomZero.fonts.mono, fontSize: 17, letterSpacing: 1.8, marginTop: 8 }}>MANYWISE // ROOM ZERO</div>
        </div>
        <div style={{ alignItems: "center", display: "flex", gap: 12, fontFamily: roomZero.fonts.mono, fontSize: 18, letterSpacing: 1.5 }}>
          <span style={{ background: color, borderRadius: 99, boxShadow: `0 0 20px ${color}`, height: 11, opacity: pulse, width: 11 }} />
          ADULTS 18+ // DRAFT
        </div>
      </header>
      <main style={{ zIndex: 5 }}>{children}</main>
      <footer
        style={{
          alignItems: "flex-start",
          bottom: 265,
          display: "flex",
          gap: 24,
          justifyContent: "space-between",
          left: roomZero.video.safeX,
          position: "absolute",
          right: roomZero.video.safeX,
          zIndex: 30,
        }}
      >
        <div style={{ color: roomZero.colors.muted, fontFamily: roomZero.fonts.mono, fontSize: 24, fontWeight: 700, letterSpacing: 0.8, lineHeight: 1.3, maxWidth: 740 }}>
          {legal.join(" // ")}
        </div>
        <div style={{ color, fontFamily: roomZero.fonts.mono, fontSize: 18, fontWeight: 800, whiteSpace: "nowrap" }}>{code}</div>
      </footer>
    </AbsoluteFill>
  );
}
