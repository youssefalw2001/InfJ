import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { accentColor, roomZero } from "../brand/tokens";
import { Captions } from "../components/Captions";
import { StudioFrame } from "../components/StudioFrame";
import type { VideoScript } from "../schema/video-script";

export function SocialCode(script: VideoScript) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accent = accentColor(script.accent);
  const headlineIn = script.reducedMotion ? 1 : spring({ frame: frame - 12, fps, config: { damping: 18, stiffness: 115 } });
  const dividerWidth = script.reducedMotion ? 100 : interpolate(frame, [45, 135], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const questionIn = script.reducedMotion ? 1 : spring({ frame: frame - 285, fps, config: { damping: 18, stiffness: 120 } });
  const ctaIn = script.reducedMotion ? 1 : spring({ frame: frame - 350, fps, config: { damping: 18, stiffness: 130 } });

  return (
    <StudioFrame accent={script.accent} code="CODE://03" eyebrow={script.eyebrow} legal={script.legal} reducedMotion={script.reducedMotion}>
      <AbsoluteFill style={{ justifyContent: "center", padding: `210px ${roomZero.video.safeX}px 520px` }}>
        <div style={{ color: accent, fontFamily: roomZero.fonts.mono, fontSize: 24, letterSpacing: 3, marginBottom: 38 }}>PATTERN RECOGNIZED</div>
        <h1 style={{ fontSize: 102, letterSpacing: -6, lineHeight: 0.94, margin: 0, opacity: headlineIn, textTransform: "uppercase", transform: `translateY(${(1 - headlineIn) * 85}px)` }}>{script.hook}</h1>
        <div style={{ background: accent, height: 5, margin: "52px 0", width: `${dividerWidth}%` }} />
        <div style={{ display: "grid", gap: 22 }}>
          {script.supporting.map((line, index) => {
            const itemIn = script.reducedMotion ? 1 : spring({ frame: frame - 115 - index * 55, fps, config: { damping: 20, stiffness: 115 } });
            return (
              <div key={line} style={{ alignItems: "center", display: "flex", gap: 24, opacity: itemIn, transform: `translateY(${(1 - itemIn) * 45}px)` }}>
                <span style={{ border: `2px solid ${index === script.supporting.length - 1 ? accent : roomZero.colors.lineStrong}`, color: index === script.supporting.length - 1 ? accent : roomZero.colors.muted, fontFamily: roomZero.fonts.mono, fontSize: 19, fontWeight: 900, padding: "10px 13px" }}>0{index + 1}</span>
                <strong style={{ color: index === script.supporting.length - 1 ? roomZero.colors.ink : roomZero.colors.inkSoft, fontSize: 44, lineHeight: 1.08 }}>{line}</strong>
              </div>
            );
          })}
        </div>
        {script.question && <p style={{ borderLeft: `5px solid ${accent}`, color: roomZero.colors.cyan, fontFamily: roomZero.fonts.mono, fontSize: 27, lineHeight: 1.35, margin: "72px 0 0", opacity: questionIn, paddingLeft: 24, transform: `translateX(${(1 - questionIn) * 50}px)` }}>{script.question}</p>}
        <div style={{ alignItems: "center", bottom: 500, display: "flex", gap: 20, left: roomZero.video.safeX, opacity: ctaIn, position: "absolute" }}>
          <div style={{ background: accent, color: roomZero.colors.void, fontFamily: roomZero.fonts.mono, fontSize: 24, fontWeight: 950, letterSpacing: 1.3, padding: "24px 29px" }}>{script.cta.label}</div>
          <span style={{ color: roomZero.colors.muted, fontFamily: roomZero.fonts.mono, fontSize: 18 }}>READ THE LAYER UNDERNEATH</span>
        </div>
      </AbsoluteFill>
      <Captions captions={script.captions} />
    </StudioFrame>
  );
}
