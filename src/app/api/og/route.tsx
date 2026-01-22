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
      // Return debug info as image
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
            <div style={{ fontSize: 32, fontWeight: "bold" }}>Card not found</div>
            <div style={{ fontSize: 18, color: "#a3a3a3", marginTop: 16 }}>ID: {cardId || "none"}</div>
            <div style={{ fontSize: 18, color: "#a3a3a3", marginTop: 8 }}>Base: {baseUrl}</div>
          </div>
        ),
        { width: 1200, height: 630, headers: OG_CACHE_HEADERS }
      );
    }

    const archetypeName = stripMarkdown(card.n || "Unknown");

    // Minimal test version - card found
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
          <div style={{ fontSize: 64 }}>{card.e || "?"}</div>
          <div style={{ fontSize: 48, fontWeight: "bold", marginTop: 20 }}>{archetypeName}</div>
          <div style={{ fontSize: 72, fontWeight: "bold", color: "#ef4444", marginTop: 20 }}>{card.s || 0}/100</div>
          <div style={{ fontSize: 24, color: "#a3a3a3", marginTop: 20 }}>pmroast.com</div>
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
