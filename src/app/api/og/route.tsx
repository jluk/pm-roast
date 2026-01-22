import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { kv } from "@vercel/kv";

export const runtime = "edge";

interface StoredCard {
  result: {
    archetype: {
      name: string;
      description: string;
      emoji: string;
      element: string;
      weakness?: string;
      stage?: string;
    };
    careerScore: number;
    bangerQuote?: string;
    moves?: { name: string; energyCost: number; damage: number }[];
  };
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const cardId = url.searchParams.get("cid");

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

    // Fetch card from KV storage
    let storedCard: StoredCard | null = null;
    try {
      const data = await kv.get<string>(`card:${cardId}`);
      if (data) {
        storedCard = typeof data === "string" ? JSON.parse(data) : (data as unknown as StoredCard);
      }
    } catch (kvError) {
      console.error("KV fetch error:", kvError);
    }

    // If card not found, show fallback
    if (!storedCard) {
      return new ImageResponse(
        (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", backgroundColor: "#0a0a0a", color: "white" }}>
            <div style={{ fontSize: 48, fontWeight: 700 }}>PM Roast</div>
            <div style={{ fontSize: 24, color: "#888", marginTop: 16 }}>Card not found</div>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    const { result } = storedCard;

    // Extract values safely
    const name = String(result.archetype?.name || "Unknown").replace(/\*+/g, "").trim();
    const score = String(result.careerScore ?? 0);
    const description = String(result.archetype?.description || "No description").slice(0, 80);
    const element = String(result.archetype?.element || "chaos");

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
          <div style={{ fontSize: 18, color: "#888", marginTop: 16, maxWidth: 600, textAlign: "center" }}>{description}</div>
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
