import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { kv } from "@vercel/kv";

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

// Fetch card from KV storage by ID
async function getCardById(cardId: string): Promise<OGCardData | null> {
  try {
    const data = await kv.get<string>(`card:${cardId}`);
    if (!data) return null;

    // Handle both string and object responses from KV
    const stored = typeof data === 'string' ? JSON.parse(data) : data;
    const result = stored.result;

    // Transform RoastResult to OG card format
    return {
      n: result.archetype.name,
      d: result.archetype.description,
      e: result.archetype.emoji,
      s: result.careerScore,
      el: result.archetype.element,
      q: result.bangerQuote,
      m: result.moves.map((move: { name: string; energyCost: number; damage: number; effect?: string }) => ({
        n: move.name,
        c: move.energyCost,
        d: move.damage,
        e: move.effect,
      })),
      w: result.archetype.weakness,
      st: result.archetype.stage,
    };
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

// Element type colors and gradients
const PM_ELEMENTS: Record<string, { color: string; bg: string; textColor: string }> = {
  data: {
    color: "#3b82f6",
    bg: "linear-gradient(180deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)",
    textColor: "#bfdbfe",
  },
  chaos: {
    color: "#ef4444",
    bg: "linear-gradient(180deg, #7f1d1d 0%, #991b1b 50%, #dc2626 100%)",
    textColor: "#fecaca",
  },
  strategy: {
    color: "#8b5cf6",
    bg: "linear-gradient(180deg, #4c1d95 0%, #5b21b6 50%, #7c3aed 100%)",
    textColor: "#ddd6fe",
  },
  shipping: {
    color: "#22c55e",
    bg: "linear-gradient(180deg, #14532d 0%, #166534 50%, #16a34a 100%)",
    textColor: "#bbf7d0",
  },
  politics: {
    color: "#f59e0b",
    bg: "linear-gradient(180deg, #78350f 0%, #92400e 50%, #d97706 100%)",
    textColor: "#fde68a",
  },
  vision: {
    color: "#ec4899",
    bg: "linear-gradient(180deg, #831843 0%, #9d174d 50%, #db2777 100%)",
    textColor: "#fbcfe8",
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cardId = searchParams.get("id");
  const data = searchParams.get("data");

  // Try to get card data from ID (for /card/[id] pages) or from data param (for legacy /share pages)
  let card: OGCardData | null = null;

  if (cardId) {
    card = await getCardById(cardId);
  } else if (data) {
    card = decodeCardData(data);
  }

  if (!card) {
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
      { width: 1200, height: 630 }
    );
  }

  if (!card) {
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
            color: "white",
            fontSize: 32,
          }}
        >
          Card not found
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  const element = PM_ELEMENTS[card.el] || PM_ELEMENTS.chaos;
  const moves = card.m || [];

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
          position: "relative",
        }}
      >
        {/* Background gradient */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0a0a0a 70%)",
          }}
        />

        {/* Pokemon-style Card - Large and centered like a physical object */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 420,
            height: 588,
            position: "relative",
          }}
        >
          {/* Holographic glow - more dramatic */}
          <div
            style={{
              position: "absolute",
              top: -20,
              left: -20,
              right: -20,
              bottom: -20,
              background: "linear-gradient(45deg, #ff0080, #ff8c00, #40e0d0, #7b68ee, #ff0080)",
              borderRadius: 32,
              filter: "blur(24px)",
              opacity: 0.8,
            }}
          />

          {/* Secondary inner glow */}
          <div
            style={{
              position: "absolute",
              top: -8,
              left: -8,
              right: -8,
              bottom: -8,
              background: `linear-gradient(135deg, ${element.color}66, transparent, ${element.color}66)`,
              borderRadius: 24,
              filter: "blur(8px)",
              opacity: 0.6,
            }}
          />

          {/* Main card body */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              position: "relative",
              borderRadius: 18,
              border: `6px solid ${element.color}`,
              overflow: "hidden",
              background: "linear-gradient(180deg, #fefefe 0%, #e5e5e5 30%, #d4d4d4 100%)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* Header: Name + HP */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                background: "rgba(255,255,255,0.95)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 30 }}>{card.e}</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: "#1a1a1a" }}>
                  {stripMarkdown(card.n)}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 26, fontWeight: 900, color: "#dc2626" }}>{card.s}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#666" }}>/100 HP</span>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: element.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 700,
                    marginLeft: 6,
                  }}
                >
                  {card.el?.charAt(0).toUpperCase() || "C"}
                </div>
              </div>
            </div>

            {/* Image frame */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 16px",
                height: 190,
                borderRadius: 10,
                border: `4px solid ${element.color}66`,
                background: element.bg,
                position: "relative",
              }}
            >
              {/* Gradient overlay for depth */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)",
                }}
              />
              <span style={{ fontSize: 84, textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>{card.e}</span>
            </div>

            {/* Element type badge */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                margin: "10px 14px",
              }}
            >
              <div
                style={{
                  padding: "4px 10px",
                  borderRadius: 20,
                  backgroundColor: element.color,
                  color: "white",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {(card.el || "chaos").charAt(0).toUpperCase() + (card.el || "chaos").slice(1)} Type PM
              </div>
              <span style={{ fontSize: 11, fontStyle: "italic", color: "#666" }}>
                {card.st || "Senior"}
              </span>
            </div>

            {/* Moves */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                margin: "0 14px",
                background: "rgba(255,255,255,0.7)",
                borderRadius: 8,
                border: `1px solid ${element.color}33`,
              }}
            >
              {moves.slice(0, 2).map((move: { n: string; c: number; d: number; e?: string }, index: number) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "6px 10px",
                    borderBottom: index === 0 ? `1px solid ${element.color}33` : "none",
                  }}
                >
                  {/* Energy cost */}
                  <div style={{ display: "flex", gap: 2, width: 45 }}>
                    {Array.from({ length: Math.min(move.c || 1, 3) }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 7,
                          backgroundColor: element.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: 7,
                          fontWeight: 700,
                        }}
                      >
                        {(card.el || "C").charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>
                  {/* Move name + effect */}
                  <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#1a1a1a" }}>
                      {move.n}
                    </span>
                    {move.e && (
                      <span style={{ fontSize: 8, color: "#666" }}>{move.e}</span>
                    )}
                  </div>
                  {/* Damage */}
                  <span style={{ fontSize: 16, fontWeight: 900, color: "#1a1a1a" }}>
                    {move.d}
                  </span>
                </div>
              ))}
            </div>

            {/* Description / Flavor text */}
            <div
              style={{
                display: "flex",
                margin: "10px 14px",
                padding: "6px 10px",
                background: "rgba(255,255,255,0.5)",
                borderRadius: 8,
                border: `1px solid ${element.color}33`,
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  fontStyle: "italic",
                  color: "#444",
                  textAlign: "center",
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {stripMarkdown(card.d)}
              </p>
            </div>

            {/* Footer: Weakness + branding */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 14px",
                marginTop: "auto",
                background: `${element.color}22`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 10, color: "#666" }}>weakness</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#1a1a1a" }}>{card.w || "Meetings"}</span>
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: element.color }}>pmroast.com</span>
            </div>
          </div>
        </div>

        {/* Side content - PSA-style grading slab info */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: 60,
            maxWidth: 480,
            justifyContent: "center",
          }}
        >
          {/* PSA-style grading header */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "24px 28px",
              background: "linear-gradient(135deg, rgba(39, 39, 42, 0.95), rgba(24, 24, 27, 0.95))",
              borderRadius: 20,
              border: "2px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* Header with logo */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: 20 }}>🔥</span>
                </div>
                <span style={{ fontSize: 24, fontWeight: 900, color: "white" }}>PM ROAST</span>
              </div>
              {/* Certified seal */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  background: "linear-gradient(135deg, #fef3c7, #fcd34d, #f59e0b)",
                  boxShadow: "0 4px 12px rgba(245, 158, 11, 0.4)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    background: "linear-gradient(180deg, #fffbeb, #fef3c7)",
                    border: "2px solid rgba(180, 83, 9, 0.4)",
                  }}
                >
                  <span style={{ fontSize: 6, fontWeight: 900, color: "#92400e", letterSpacing: 1 }}>CERTIFIED</span>
                  <span style={{ fontSize: 10, fontWeight: 900, color: "#78350f" }}>PM</span>
                </div>
              </div>
            </div>

            {/* Score display - large */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 72, fontWeight: 900, color: "white", lineHeight: 1 }}>{card.s}</span>
              <span style={{ fontSize: 24, color: "#71717a" }}>/100</span>
            </div>

            {/* Quote */}
            <div
              style={{
                display: "flex",
                padding: "16px 20px",
                background: "rgba(99, 102, 241, 0.1)",
                borderRadius: 12,
                border: "1px solid rgba(99, 102, 241, 0.2)",
                marginBottom: 20,
              }}
            >
              <p
                style={{
                  fontSize: 16,
                  color: "rgba(255, 255, 255, 0.85)",
                  fontStyle: "italic",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                &ldquo;{stripMarkdown(card.q).slice(0, 100)}&rdquo;
              </p>
            </div>

            {/* CTA */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "14px 24px",
                background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                borderRadius: 12,
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 700, color: "white" }}>Get your card → pmroast.com</span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
