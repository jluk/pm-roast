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
  dreamRole: string;
  createdAt: number;
  isLegend?: boolean;
}

// Fetch card from KV storage
async function getCardFromKV(cardId: string): Promise<StoredCard | null> {
  try {
    const data = await kv.get<string>(`card:${cardId}`);
    if (!data) return null;
    if (typeof data === 'string') {
      return JSON.parse(data);
    }
    return data as unknown as StoredCard;
  } catch (error) {
    console.error("Failed to retrieve card from KV:", error);
    return null;
  }
}

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

    // Fetch card from KV storage
    let storedCard: StoredCard | null = null;
    try {
      storedCard = await getCardFromKV(cardId);
    } catch (kvError) {
      console.error("KV fetch error:", kvError);
      // Return error image instead of failing silently
      return new ImageResponse(
        (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", backgroundColor: "#1a0a0a", color: "white" }}>
            <div style={{ fontSize: 48, fontWeight: 700 }}>PM Roast</div>
            <div style={{ fontSize: 24, color: "#888", marginTop: 16 }}>KV Error</div>
          </div>
        ),
        { width: 1200, height: 630 }
      );
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

    // Safely extract values with String() conversion for Satori
    const name = String(result.archetype?.name || "Unknown").replace(/\*+/g, "").trim();
    const score = String(result.careerScore ?? 0);
    const emoji = String(result.archetype?.emoji || "X");
    const description = String(result.archetype?.description || "No description").slice(0, 80);
    const element = String(result.archetype?.element || "chaos");
    const weakness = String(result.archetype?.weakness || "Meetings");
    const stage = String(result.archetype?.stage || "Senior");
    const move1 = result.moves?.[0];
    const move2 = result.moves?.[1];

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
                  <span style={{ flex: 1, fontSize: 10, fontWeight: 600, color: "#1a1a1a" }}>{String(move1.name)}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>{String(move1.damage)}</span>
                </div>
              )}
              {move2 && (
                <div style={{ display: "flex", alignItems: "center", padding: "6px 8px" }}>
                  <div style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: color, marginRight: 6 }} />
                  <span style={{ flex: 1, fontSize: 10, fontWeight: 600, color: "#1a1a1a" }}>{String(move2.name)}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>{String(move2.damage)}</span>
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
