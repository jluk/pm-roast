import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

interface OGCardData {
  n: string;
  d: string;
  e: string;
  s: number;
  el: string;
  q: string;
  m: { n: string; c: number; d: number; e?: string }[];
  w: string;
  st: string;
}

async function getCardById(cardId: string, request: NextRequest): Promise<OGCardData | null> {
  try {
    // Get the origin from the request headers
    const host = request.headers.get("host") || "www.pmroast.com";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    const fetchUrl = `${baseUrl}/api/card-data?id=${encodeURIComponent(cardId)}`;

    const response = await fetch(fetchUrl, {
      headers: {
        "Accept": "application/json",
        // Pass through headers to help with request routing
        "x-forwarded-host": host,
      },
    });

    if (!response.ok) {
      console.error("Card fetch failed:", response.status);
      return null;
    }

    const data = await response.json();
    if (data.error) {
      console.error("Card data error:", data.error);
      return null;
    }
    return data as OGCardData;
  } catch (err) {
    console.error("Card fetch exception:", err);
    return null;
  }
}

function decodeCardData(encoded: string): OGCardData | null {
  try {
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) base64 += "=";
    const binaryString = atob(base64);
    const utf8Bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      utf8Bytes[i] = binaryString.charCodeAt(i);
    }
    return JSON.parse(new TextDecoder().decode(utf8Bytes));
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const cardId = url.searchParams.get("id");
    const data = url.searchParams.get("data");

    let card: OGCardData | null = null;
    if (cardId) {
      card = await getCardById(cardId, request);
    } else if (data) {
      card = decodeCardData(data);
    }

    // If no card, show fallback
    if (!card) {
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

    // Card found - show minimal card info
    // Ensure all values are strings to avoid Satori issues
    const name = String(card.n || "Unknown").replace(/\*+/g, "").trim();
    const score = String(card.s ?? 0);
    const emoji = String(card.e || "🔥");

    return new ImageResponse(
      (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", backgroundColor: "#0a0a0a", color: "white" }}>
          <div style={{ fontSize: 80 }}>{emoji}</div>
          <div style={{ fontSize: 48, fontWeight: 700, marginTop: 24 }}>{name}</div>
          <div style={{ fontSize: 64, fontWeight: 700, color: "#ef4444", marginTop: 16 }}>{score}/100</div>
          <div style={{ fontSize: 24, color: "#888", marginTop: 24 }}>pmroast.com</div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (err) {
    console.error("OG generation error:", err);
    // Return fallback on any error
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
