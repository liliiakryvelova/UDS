import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 38, background: "#0b3b43", color: "#d8efeb", fontSize: 104, fontWeight: 700 }}>
      <div style={{ width: 108, height: 108, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 54, background: "#d8efeb", color: "#0b3b43" }}>
        <span style={{ marginTop: -7, fontFamily: "Arial, sans-serif" }}>✳</span>
      </div>
    </div>,
    { ...size },
  );
}
