import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { roomZero } from "../brand/tokens";

export function SignalBackdrop({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const frame = useCurrentFrame();
  const drift = reducedMotion ? 0 : interpolate(frame, [0, roomZero.video.durationInFrames], [0, 48]);
  const scan = reducedMotion ? -200 : interpolate(frame % 180, [0, 179], [-120, 2040]);

  return (
    <AbsoluteFill style={{ backgroundColor: roomZero.colors.void, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${roomZero.colors.signal}10 1px, transparent 1px), linear-gradient(90deg, ${roomZero.colors.signal}10 1px, transparent 1px)`,
          backgroundPosition: `${drift}px ${drift}px`,
          backgroundSize: "48px 48px",
          opacity: 0.72,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 82% 18%, ${roomZero.colors.cyan}24, transparent 32%), radial-gradient(circle at 8% 78%, ${roomZero.colors.signal}18, transparent 34%)`,
        }}
      />
      <div
        style={{
          background: `linear-gradient(180deg, transparent, ${roomZero.colors.cyan}20, transparent)`,
          height: 120,
          left: 0,
          position: "absolute",
          right: 0,
          top: scan,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: "repeating-linear-gradient(180deg, transparent 0, transparent 5px, rgba(255,255,255,.018) 6px)",
        }}
      />
    </AbsoluteFill>
  );
}
