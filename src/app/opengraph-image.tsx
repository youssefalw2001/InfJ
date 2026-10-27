import { ImageResponse } from "next/og";

export const alt = "Manywise Room Zero — the forum behind the obvious conversation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#030907", color: "#e9f3ed", padding: 66, position: "relative", fontFamily: "sans-serif", border: "2px solid #2b4238" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "76%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 15, fontFamily: "monospace", fontSize: 24, fontWeight: 800 }}><div style={{ display: "flex", width: 32, height: 32, background: "#c6ff4a" }} />MANYWISE // ROOM ZERO</div>
        <div style={{ display: "flex", flexDirection: "column" }}><div style={{ color: "#55d8e3", fontFamily: "monospace", fontSize: 17, letterSpacing: 3 }}>PRIVATE SIGNAL NETWORK // GATE 01</div><div style={{ display: "flex", marginTop: 18, color: "#e9f3ed", fontSize: 65, fontWeight: 800, lineHeight: .95, letterSpacing: -4, whiteSpace: "pre-line" }}>{"NOT EVERYONE READS\nTHE LAYER UNDERNEATH."}</div></div>
        <div style={{ color: "#c6ff4a", fontFamily: "monospace", fontSize: 18 }}>IF YOU CAUGHT THE SIGNAL, YOU’RE ALREADY CLOSE.</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", width: "24%", gap: 11 }}><div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: 140, height: 140, color: "#030907", background: "#c6ff4a", borderRadius: 70, fontFamily: "monospace", fontSize: 34, fontWeight: 900 }}>01—02%</div><div style={{ color: "#8ca097", fontFamily: "monospace", fontSize: 12 }}>RARE ≠ RANKED</div></div>
      <div style={{ position: "absolute", left: 0, bottom: 0, display: "flex", width: "100%", height: 8, background: "#c6ff4a" }} />
    </div>, size,
  );
}
