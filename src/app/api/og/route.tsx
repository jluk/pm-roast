import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const name = url.searchParams.get("name");
  const score = url.searchParams.get("score");

  // Always return fallback for now to debug
  if (!name || !score) {
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

  // Simple card with just name and score
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", backgroundColor: "#0a0a0a", color: "white" }}>
        <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>{name}</div>
        <div style={{ fontSize: 72, fontWeight: 700 }}>{score}/100</div>
        <div style={{ fontSize: 14, color: "#6366f1", marginTop: 24 }}>pmroast.com</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
