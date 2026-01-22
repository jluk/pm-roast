import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

// Card data format for OG image rendering
interface OGCardData {
  n: string;  // archetype name
  d: string;  // description
  e: string;  // emoji
  s: number;  // score
  el: string; // element
  q: string;  // banger quote
  m: { n: string; c: number; d: number; e?: string }[]; // moves
  w: string;  // weakness
  st: string; // stage
}

// Fetch card from internal API endpoint (which runs in Node.js runtime with KV access)
async function getCardById(cardId: string, baseUrl: string): Promise<OGCardData | null> {
  try {
    const response = await fetch(`${baseUrl}/api/card-data?id=${cardId}`);

    if (!response.ok) {
      console.error("Card data fetch failed:", response.status);
      return null;
    }

    const data = await response.json();

    if (data.error) {
      console.error("Card data error:", data.error);
      return null;
    }

    return data as OGCardData;
  } catch (error) {
    console.error("Failed to fetch card for OG:", error);
    return null;
  }
}

// Decode card data from URL (handles UTF-8/Unicode) - for legacy /share URLs
function decodeCardData(encoded: string): OGCardData | null {
  try {
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const binaryString = atob(base64);
    const utf8Bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      utf8Bytes[i] = binaryString.charCodeAt(i);
    }
    const json = new TextDecoder().decode(utf8Bytes);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Strip markdown
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/_/g, "")
    .replace(/`/g, "")
    .replace(/#{1,6}\s/g, "")
    .trim();
}

// Element type colors
const PM_ELEMENTS: Record<string, { color: string; bgStart: string; bgEnd: string }> = {
  data: { color: "#3b82f6", bgStart: "#1e3a8a", bgEnd: "#2563eb" },
  chaos: { color: "#ef4444", bgStart: "#7f1d1d", bgEnd: "#dc2626" },
  strategy: { color: "#8b5cf6", bgStart: "#4c1d95", bgEnd: "#7c3aed" },
  shipping: { color: "#22c55e", bgStart: "#14532d", bgEnd: "#16a34a" },
  politics: { color: "#f59e0b", bgStart: "#78350f", bgEnd: "#d97706" },
  vision: { color: "#ec4899", bgStart: "#831843", bgEnd: "#db2777" },
};

// Cache headers for OG images
const OG_CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
};

// Fallback image for errors or missing cards
function getFallbackImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          color: "white",
        }}
      >
        <div style={{ fontSize: 48, fontWeight: "bold" }}>PM Roast</div>
        <div style={{ fontSize: 24, color: "#a3a3a3", marginTop: 16 }}>
          Get brutally honest career feedback
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: OG_CACHE_HEADERS }
  );
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const { searchParams } = url;
    const cardId = searchParams.get("id");
    const data = searchParams.get("data");

    // Get base URL for internal API calls
    const baseUrl = `${url.protocol}//${url.host}`;

    // Try to get card data from ID or from data param
    let card: OGCardData | null = null;

    if (cardId) {
      card = await getCardById(cardId, baseUrl);
    } else if (data) {
      card = decodeCardData(data);
    }

    if (!card) {
      return getFallbackImage();
    }

    const element = PM_ELEMENTS[card.el] || PM_ELEMENTS.chaos;
    const move1 = card.m?.[0];
    const move2 = card.m?.[1];
    const archetypeName = stripMarkdown(card.n || "Unknown");
    const description = stripMarkdown(card.d || "");
    const quote = stripMarkdown(card.q || "").slice(0, 100);
    const elementLabel = (card.el || "chaos").charAt(0).toUpperCase() + (card.el || "chaos").slice(1);

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0a0a0a",
            padding: 40,
          }}
        >
          {/* Card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 400,
              height: 560,
              borderRadius: 16,
              border: `6px solid ${element.color}`,
              backgroundColor: "#f5f5f5",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                backgroundColor: "white",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 28 }}>{card.e}</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: "#1a1a1a" }}>
                  {archetypeName}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: "#dc2626" }}>{card.s}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#666" }}>/100</span>
              </div>
            </div>

            {/* Image area */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 12px",
                height: 180,
                borderRadius: 8,
                backgroundColor: element.bgStart,
              }}
            >
              <span style={{ fontSize: 72 }}>{card.e}</span>
            </div>

            {/* Type badge */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                margin: "8px 12px",
              }}
            >
              <div
                style={{
                  padding: "4px 10px",
                  borderRadius: 12,
                  backgroundColor: element.color,
                  color: "white",
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                {elementLabel} Type PM
              </div>
              <span style={{ fontSize: 10, color: "#666" }}>{card.st || "Senior"}</span>
            </div>

            {/* Moves */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                margin: "0 12px",
                backgroundColor: "white",
                borderRadius: 8,
                border: "1px solid #e5e5e5",
              }}
            >
              {move1 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 10px",
                    borderBottom: "1px solid #e5e5e5",
                  }}
                >
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      backgroundColor: element.color,
                      marginRight: 8,
                    }}
                  />
                  <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: "#1a1a1a" }}>
                    {move1.n}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: "#1a1a1a" }}>
                    {move1.d}
                  </span>
                </div>
              )}
              {move2 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 10px",
                  }}
                >
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      backgroundColor: element.color,
                      marginRight: 8,
                    }}
                  />
                  <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: "#1a1a1a" }}>
                    {move2.n}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: "#1a1a1a" }}>
                    {move2.d}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div
              style={{
                display: "flex",
                margin: "8px 12px",
                padding: "8px",
                backgroundColor: "white",
                borderRadius: 8,
              }}
            >
              <span style={{ fontSize: 9, color: "#666", textAlign: "center" }}>
                {description}
              </span>
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                marginTop: "auto",
                backgroundColor: element.color + "22",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 9, color: "#666" }}>weakness:</span>
                <span style={{ fontSize: 9, fontWeight: 600, color: "#1a1a1a" }}>{card.w || "Meetings"}</span>
              </div>
              <span style={{ fontSize: 9, fontWeight: 600, color: element.color }}>pmroast.com</span>
            </div>
          </div>

          {/* Side panel */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: 48,
              width: 440,
              padding: 24,
              backgroundColor: "#18181b",
              borderRadius: 16,
              border: "1px solid #27272a",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#6366f1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 20 }}>🔥</span>
              </div>
              <span style={{ fontSize: 24, fontWeight: 900, color: "white" }}>PM ROAST</span>
            </div>

            {/* Score */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 64, fontWeight: 900, color: "white" }}>{card.s}</span>
              <span style={{ fontSize: 24, color: "#71717a" }}>/100</span>
            </div>

            {/* Quote */}
            <div
              style={{
                display: "flex",
                padding: 16,
                backgroundColor: "#27272a",
                borderRadius: 12,
                marginBottom: 20,
              }}
            >
              <span style={{ fontSize: 14, color: "#d4d4d8" }}>
                &quot;{quote}&quot;
              </span>
            </div>

            {/* CTA */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 20px",
                backgroundColor: "#6366f1",
                borderRadius: 12,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>
                Get your card → pmroast.com
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: OG_CACHE_HEADERS,
      }
    );
  } catch (error) {
    console.error("OG image generation failed:", error);
    return getFallbackImage();
  }
}
