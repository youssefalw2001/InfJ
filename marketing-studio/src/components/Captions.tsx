import { useCurrentFrame } from "remotion";
import type { VideoScript } from "../schema/video-script";
import { roomZero } from "../brand/tokens";

type CaptionsProps = Pick<VideoScript, "captions">;

export function Captions({ captions }: CaptionsProps) {
  const frame = useCurrentFrame();
  const cue = captions.find((item) => frame >= item.from && frame < item.to);
  if (!cue) return null;

  return (
    <div
      style={{
        bottom: 350,
        display: "flex",
        justifyContent: "center",
        left: roomZero.video.safeX,
        position: "absolute",
        right: roomZero.video.safeX,
        zIndex: 20,
      }}
    >
      <div
        style={{
          background: "rgba(3, 9, 7, .9)",
          border: `2px solid ${roomZero.colors.lineStrong}`,
          boxShadow: `8px 8px 0 ${roomZero.colors.void}`,
          color: roomZero.colors.ink,
          fontFamily: roomZero.fonts.sans,
          fontSize: 37,
          fontWeight: 750,
          lineHeight: 1.2,
          maxWidth: 900,
          padding: "20px 28px",
          textAlign: "center",
        }}
      >
        {cue.text}
      </div>
    </div>
  );
}
