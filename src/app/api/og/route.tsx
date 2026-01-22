import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

interface OGCardData {
  n: string;  // archetype name
  d: string;  // description
  e: string;  // emoji
  s: number;  // score
  el: string; // element
  q: string;  // banger quote
  m: { n: string; c: number; d: number }[];  // moves
  w: string;  // weakness
  st: string; // stage
}

// Decode card data from URL-safe base64
function decodeCardData(encoded: string): OGCardData | null {
  try {
    // Convert URL-safe base64 back to regular base64
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding if needed
    while (base64.length % 4) {
      base64 += "=";
    }
    // Decode base64 to UTF-8 string
    const binaryString = atob(base64);
    const utf8Bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      utf8Bytes[i] = binaryString.charCodeAt(i);
    }
    const json = new TextDecoder().decode(utf8Bytes);
    return JSON.parse(json);
  } catch (err) {
    console.error("Failed to decode card data:", err);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const data = url.searchParams.get("data");

    // If no data param, show fallback
    if (!data) {
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

    // TEMP: Return immediately when data exists to test
    return new ImageResponse(
      (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", backgroundColor: "#1a1a2e", color: "white" }}>
          <div style={{ fontSize: 48, fontWeight: 700 }}>Data received</div>
          <div style={{ fontSize: 24, color: "#888", marginTop: 16 }}>Param length: {String(data.length)}</div>
        </div>
      ),
      { width: 1200, height: 630 }
    );

    // Decode card data from URL - SKIPPED FOR TEST
    const card = decodeCardData(data);

    // If decoding failed, show error
    if (!card) {
      return new ImageResponse(
        (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", backgroundColor: "#0a0a0a", color: "white" }}>
            <div style={{ fontSize: 48, fontWeight: 700 }}>PM Roast</div>
            <div style={{ fontSize: 24, color: "#888", marginTop: 16 }}>Card decode failed</div>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    // Safely extract values with String() conversion for Satori
    const name = String(card.n || "Unknown").replace(/\*+/g, "").trim();
    const score = String(card.s ?? 0);
    const emoji = String(card.e || "X");  // Use X as fallback instead of emoji
    const description = String(card.d || "No description").slice(0, 80);
    const element = String(card.el || "chaos");
    const weakness = String(card.w || "Meetings");
    const stage = String(card.st || "Senior");
    const move1 = card.m?.[0];
    const move2 = card.m?.[1];

    // Element colors
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
        <div style={{ display: "flex", width: "100%", height: "100%", backgroundColor: "#0a0a0a", padding: 40 }}>
          {/* Card */}
          <div style={{ display: "flex", flexDirection: "column", width: 380, height: 530, borderRadius: 16, border: "5px solid " + color, backgroundColor: "#f5f5f5", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", backgroundColor: "white" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: 26, marginRight: 8 }}>{emoji}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>{name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: "#dc2626" }}>{score}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#666", marginLeft: 2 }}>/100</span>
              </div>
            </div>

            {/* Image area */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "0 12px", height: 160, borderRadius: 8, backgroundColor: color }}>
              <span style={{ fontSize: 64 }}>{emoji}</span>
            </div>

            {/* Type badge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "8px 12px" }}>
              <div style={{ padding: "3px 8px", borderRadius: 10, backgroundColor: color, color: "white", fontSize: 9, fontWeight: 600 }}>
                {element.charAt(0).toUpperCase() + element.slice(1)} Type PM
              </div>
              <span style={{ fontSize: 9, color: "#666" }}>{stage}</span>
            </div>

            {/* Moves */}
            <div style={{ display: "flex", flexDirection: "column", margin: "0 12px", backgroundColor: "white", borderRadius: 6, border: "1px solid #e5e5e5" }}>
              {move1 && (
                <div style={{ display: "flex", alignItems: "center", padding: "6px 8px", borderBottom: "1px solid #e5e5e5" }}>
                  <div style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: color, marginRight: 6 }} />
                  <span style={{ flex: 1, fontSize: 10, fontWeight: 600, color: "#1a1a1a" }}>{String(move1.n)}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>{String(move1.d)}</span>
                </div>
              )}
              {move2 && (
                <div style={{ display: "flex", alignItems: "center", padding: "6px 8px" }}>
                  <div style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: color, marginRight: 6 }} />
                  <span style={{ flex: 1, fontSize: 10, fontWeight: 600, color: "#1a1a1a" }}>{String(move2.n)}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>{String(move2.d)}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div style={{ display: "flex", margin: "8px 12px", padding: "6px 8px", backgroundColor: "white", borderRadius: 6 }}>
              <span style={{ fontSize: 8, color: "#666" }}>{description}</span>
            </div>

            {/* Footer */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", marginTop: "auto", backgroundColor: color + "22" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: 8, color: "#666", marginRight: 4 }}>weakness:</span>
                <span style={{ fontSize: 8, fontWeight: 600, color: "#1a1a1a" }}>{weakness}</span>
              </div>
              <span style={{ fontSize: 8, fontWeight: 600, color: color }}>pmroast.com</span>
            </div>
          </div>

          {/* Side panel */}
          <div style={{ display: "flex", flexDirection: "column", marginLeft: 40, width: 420, padding: 24, backgroundColor: "#18181b", borderRadius: 16, border: "1px solid #27272a" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                <span style={{ fontSize: 18 }}>🔥</span>
              </div>
              <span style={{ fontSize: 22, fontWeight: 700, color: "white" }}>PM ROAST</span>
            </div>

            {/* Score */}
            <div style={{ display: "flex", alignItems: "baseline", marginBottom: 16 }}>
              <span style={{ fontSize: 56, fontWeight: 700, color: "white" }}>{score}</span>
              <span style={{ fontSize: 20, color: "#71717a", marginLeft: 4 }}>/100</span>
            </div>

            {/* Quote */}
            <div style={{ display: "flex", padding: 14, backgroundColor: "#27272a", borderRadius: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 13, color: "#d4d4d8" }}>&quot;{description}&quot;</span>
            </div>

            {/* CTA */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 18px", backgroundColor: "#6366f1", borderRadius: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "white" }}>Get your card → pmroast.com</span>
            </div>
          </div>
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
