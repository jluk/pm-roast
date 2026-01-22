import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);

  // Get simple params - all optional
  const name = url.searchParams.get("a") || "";
  const pts = url.searchParams.get("b") || "";

  // Fallback image
  if (!name || !pts) {
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

  // Sanitize inputs - remove any non-alphanumeric except spaces
  const safeName = name.replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 30);
  const safeScore = pts.replace(/[^0-9]/g, "").slice(0, 3);

  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", backgroundColor: "#0a0a0a", color: "white" }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: "#f59e0b", marginBottom: 8 }}>{safeName}</div>
        <div style={{ fontSize: 80, fontWeight: 700 }}>{safeScore}/100</div>
        <div style={{ fontSize: 16, color: "#6366f1", marginTop: 32 }}>pmroast.com</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
