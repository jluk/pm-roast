import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const cardId = url.searchParams.get("id");

    // If no card ID, show fallback
    if (!cardId) {
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

    // TEMP: Return static test image when id is present
    return new ImageResponse(
      (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", backgroundColor: "#1a2a3a", color: "white" }}>
          <div style={{ fontSize: 48, fontWeight: 700 }}>Card ID Test</div>
          <div style={{ fontSize: 24, color: "#888", marginTop: 16 }}>ID: {cardId.slice(0, 20)}</div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (err) {
    console.error("OG generation error:", err);
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
}
