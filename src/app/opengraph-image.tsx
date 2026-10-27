import { ImageResponse } from "next/og";

export const alt = "Manywise — many perspectives, held with care";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#f4efe5", color: "#18332e", padding: 72, position: "relative", fontFamily: "serif" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "70%" }}><div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: "sans-serif", fontSize: 28, fontWeight: 700 }}><div style={{ display: "flex", width: 38, height: 38, background: "#173f37" }} />Manywise</div><div style={{ display: "flex", flexDirection: "column" }}><div style={{ fontFamily: "sans-serif", textTransform: "uppercase", letterSpacing: 4, color: "#9b4e37", fontSize: 18 }}>THE 1–2% CLUB* · RARE ≠ RANKED</div><div style={{ display: "flex", fontSize: 57, lineHeight: 1.04, letterSpacing: -3, marginTop: 18, whiteSpace: "pre-line" }}>{"Meet us after class.\nBring your whole inner world."}</div></div><div style={{ fontFamily: "sans-serif", fontSize: 21, color: "#51635f" }}>Rare does not mean ranked. Adults 18+.</div></div>
      <div style={{ width: "30%", display: "flex", flexWrap: "wrap", alignContent: "center", justifyContent: "center", gap: 12 }}><div style={{ width: 110, height: 110, background: "#ea9a72" }} /><div style={{ width: 110, height: 110, border: "3px solid #173f37" }} /><div style={{ width: 110, height: 110, border: "3px solid #173f37" }} /><div style={{ width: 110, height: 110, background: "#789078" }} /></div>
      <div style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: 9, background: "#173f37" }} />
    </div>, size,
  );
}
