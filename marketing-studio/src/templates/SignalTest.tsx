import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { accentColor, roomZero } from "../brand/tokens";
import { Captions } from "../components/Captions";
import { StudioFrame } from "../components/StudioFrame";
import type { VideoScript } from "../schema/video-script";

export function SignalTest(script: VideoScript) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accent = accentColor(script.accent);
  const hookIn = script.reducedMotion ? 1 : spring({ frame: frame - 8, fps, config: { damping: 18, mass: 0.7, stiffness: 120 } });
  const bodyIn = script.reducedMotion ? 1 : spring({ frame: frame - 78, fps, config: { damping: 20, mass: 0.8, stiffness: 110 } });
  const ctaIn = script.reducedMotion ? 1 : spring({ frame: frame - 330, fps, config: { damping: 18, mass: 0.7, stiffness: 130 } });
  const selection = script.reducedMotion ? 0 : Math.min(script.choices.length - 1, Math.max(0, Math.floor(interpolate(frame, [120, 300], [0, script.choices.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))));

  return (
    <StudioFrame accent={script.accent} code="SCAN://01" eyebrow={script.eyebrow} legal={script.legal} reducedMotion={script.reducedMotion}>
      <AbsoluteFill style={{ padding: `${roomZero.video.safeTop + 100}px ${roomZero.video.safeX}px 480px` }}>
        <section style={{ opacity: hookIn, transform: `translateY(${(1 - hookIn) * 70}px)` }}>
          <div style={{ color: accent, fontFamily: roomZero.fonts.mono, fontSize: 22, letterSpacing: 3, marginBottom: 28 }}>INCOMING QUESTION</div>
          <h1 style={{ fontSize: 86, letterSpacing: -4.5, lineHeight: 0.98, margin: 0, maxWidth: 930, textTransform: "uppercase" }}>{script.hook}</h1>
          <p style={{ color: roomZero.colors.inkSoft, fontFamily: roomZero.fonts.mono, fontSize: 25, lineHeight: 1.4, margin: "30px 0 0", maxWidth: 820 }}>{script.supporting[0]}</p>
        </section>

        <section style={{ marginTop: 78, opacity: bodyIn, transform: `translateX(${(1 - bodyIn) * 80}px)` }}>
          {script.question && <p style={{ color: roomZero.colors.cyan, fontFamily: roomZero.fonts.mono, fontSize: 21, letterSpacing: 2, margin: "0 0 24px" }}>{script.question.toUpperCase()}</p>}
          <div style={{ display: "grid", gap: 16 }}>
            {script.choices.map((choice, index) => {
              const active = frame >= 120 && index === selection;
              const itemIn = script.reducedMotion ? 1 : spring({ frame: frame - 95 - index * 9, fps, config: { damping: 18, stiffness: 135 } });
              return (
                <div
                  key={choice}
                  style={{
                    alignItems: "center",
                    background: active ? `${accent}18` : roomZero.colors.surface,
                    border: `2px solid ${active ? accent : roomZero.colors.lineStrong}`,
                    boxShadow: active ? `9px 9px 0 ${accent}35` : `6px 6px 0 ${roomZero.colors.void}`,
                    display: "flex",
                    gap: 25,
                    minHeight: 104,
                    opacity: itemIn,
                    padding: "18px 24px",
                    transform: `translateX(${(1 - itemIn) * 55}px)`,
                  }}
                >
                  <span style={{ color: active ? accent : roomZero.colors.muted, fontFamily: roomZero.fonts.mono, fontSize: 25, fontWeight: 900 }}>{String.fromCharCode(65 + index)}</span>
                  <strong style={{ flex: 1, fontSize: 35, letterSpacing: -0.7 }}>{choice}</strong>
                  <span style={{ color: active ? accent : roomZero.colors.lineStrong, fontFamily: roomZero.fonts.mono, fontSize: 24 }}>{active ? "◉" : "○"}</span>
                </div>
              );
            })}
          </div>
        </section>

        <div style={{ alignItems: "center", bottom: 500, display: "flex", gap: 22, left: roomZero.video.safeX, opacity: ctaIn, position: "absolute", transform: `scale(${0.92 + ctaIn * 0.08})` }}>
          <div style={{ background: accent, color: roomZero.colors.void, fontFamily: roomZero.fonts.mono, fontSize: 25, fontWeight: 950, letterSpacing: 1.4, padding: "24px 30px" }}>{script.cta.label}</div>
          <span style={{ color: roomZero.colors.muted, fontFamily: roomZero.fonts.mono, fontSize: 18 }}>NO CORRECT ANSWER // NO TYPE TEST</span>
        </div>
      </AbsoluteFill>
      <Captions captions={script.captions} />
    </StudioFrame>
  );
}
