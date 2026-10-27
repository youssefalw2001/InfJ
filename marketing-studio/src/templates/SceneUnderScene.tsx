import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { accentColor, roomZero } from "../brand/tokens";
import { Captions } from "../components/Captions";
import { StudioFrame } from "../components/StudioFrame";
import type { VideoScript } from "../schema/video-script";

export function SceneUnderScene(script: VideoScript) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accent = accentColor(script.accent);
  const art = script.assets[0];
  const imageScale = script.reducedMotion ? 1.07 : interpolate(frame, [0, 450], [1.03, 1.11]);
  const headlineIn = script.reducedMotion ? 1 : spring({ frame: frame - 10, fps, config: { damping: 18, stiffness: 120 } });
  const firstCard = script.reducedMotion ? 1 : spring({ frame: frame - 115, fps, config: { damping: 20, stiffness: 120 } });
  const secondCard = script.reducedMotion ? 1 : spring({ frame: frame - 190, fps, config: { damping: 20, stiffness: 120 } });
  const ctaIn = script.reducedMotion ? 1 : spring({ frame: frame - 330, fps, config: { damping: 17, stiffness: 130 } });

  return (
    <StudioFrame accent={script.accent} code="READ://02" eyebrow={script.eyebrow} legal={script.legal} reducedMotion={script.reducedMotion}>
      <AbsoluteFill style={{ padding: `${roomZero.video.safeTop + 94}px ${roomZero.video.safeX}px 480px` }}>
        <h1 style={{ fontSize: 77, letterSpacing: -3.8, lineHeight: 1.02, margin: 0, maxWidth: 920, opacity: headlineIn, textTransform: "uppercase", transform: `translateY(${(1 - headlineIn) * 65}px)` }}>{script.hook}</h1>

        <div style={{ border: `2px solid ${accent}`, boxShadow: `14px 14px 0 ${roomZero.colors.cyan}30`, height: 500, marginTop: 38, overflow: "hidden", position: "relative" }}>
          {art ? <Img alt={art.alt} src={staticFile(art.src)} style={{ height: "100%", objectFit: "cover", transform: `scale(${imageScale})`, width: "100%" }} /> : <AbsoluteFill style={{ background: roomZero.colors.surface }} />}
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(3,9,7,.08), rgba(3,9,7,.9))" }} />
          <div style={{ bottom: 22, color: roomZero.colors.ink, fontFamily: roomZero.fonts.mono, fontSize: 17, left: 25, letterSpacing: 1.8, position: "absolute" }}>ORIGINAL ADULT CAST // NO BORROWED WORLDS</div>
          <div style={{ background: accent, color: roomZero.colors.void, fontFamily: roomZero.fonts.mono, fontSize: 18, fontWeight: 900, padding: "10px 14px", position: "absolute", right: 18, top: 18 }}>FRAME 014</div>
        </div>

        <div style={{ display: "grid", gap: 14, marginTop: 28 }}>
          {script.supporting.slice(0, 2).map((line, index) => {
            const progress = index === 0 ? firstCard : secondCard;
            const [label, ...copy] = line.split("//");
            return (
              <div key={line} style={{ background: index === 1 ? `${accent}15` : roomZero.colors.surface, border: `2px solid ${index === 1 ? accent : roomZero.colors.lineStrong}`, opacity: progress, padding: "17px 22px", transform: `translateX(${(1 - progress) * (index === 0 ? -70 : 70)}px)` }}>
                <span style={{ color: index === 1 ? accent : roomZero.colors.muted, fontFamily: roomZero.fonts.mono, fontSize: 18, fontWeight: 800, letterSpacing: 2 }}>{label.trim()}</span>
                <strong style={{ display: "block", fontSize: 31, lineHeight: 1.12, marginTop: 8 }}>{copy.join("//").trim() || line}</strong>
              </div>
            );
          })}
        </div>

        <div style={{ alignItems: "center", bottom: 500, display: "flex", justifyContent: "space-between", left: roomZero.video.safeX, opacity: ctaIn, position: "absolute", right: roomZero.video.safeX }}>
          <p style={{ color: roomZero.colors.inkSoft, fontFamily: roomZero.fonts.mono, fontSize: 22, margin: 0, maxWidth: 500 }}>{script.question}</p>
          <div style={{ background: accent, color: roomZero.colors.void, fontFamily: roomZero.fonts.mono, fontSize: 22, fontWeight: 950, padding: "22px 26px" }}>{script.cta.label}</div>
        </div>
      </AbsoluteFill>
      <Captions captions={script.captions} />
    </StudioFrame>
  );
}
