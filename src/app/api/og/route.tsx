import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

// Simple fallback OG image - always works
export async function GET() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", backgroundColor: "#0a0a0a", color: "white" }}>
        <div style={{ fontSize: 48, fontWeight: 700 }}>PM Roast</div>
        <div style={{ fontSize: 24, color: "#888", marginTop: 16 }}>Get your PM trading card</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
