import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);

    // Get card data from query params
    const name = url.searchParams.get("name") || "";
    const score = url.searchParams.get("score") || "";
    const desc = url.searchParams.get("desc") || "";
    const element = url.searchParams.get("elem") || "chaos";

    // If no data, show fallback
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

    const elementColors: Record<string, string> = {
      data: "#3b82f6",
      chaos: "#ef4444",
      strategy: "#8b5cf6",
      shipping: "#22c55e",
      politics: "#f59e0b",
      vision: "#ec4899",
    };
    const color = elementColors[element] || "#ef4444";

    return new ImageResponse(
      (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", backgroundColor: "#0a0a0a", color: "white" }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: color, marginBottom: 8 }}>{name}</div>
          <div style={{ fontSize: 72, fontWeight: 700 }}>{score}/100</div>
          <div style={{ fontSize: 18, color: "#888", marginTop: 16, maxWidth: 600, textAlign: "center" }}>{desc}</div>
          <div style={{ fontSize: 14, color: color, marginTop: 24 }}>pmroast.com</div>
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
