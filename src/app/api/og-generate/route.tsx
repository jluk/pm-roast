import { ImageResponse } from "@vercel/og";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// Element styling - matching PokemonCard component
const PM_ELEMENTS: Record<string, {
  name: string;
  color: string;
  borderColor: string;
  cardBgStart: string;
  cardBgMid: string;
  cardBgEnd: string;
  bgGradientStart: string;
  bgGradientEnd: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
}> = {
  data: {
    name: "Data",
    color: "#3b82f6",
    borderColor: "#2563eb",
    cardBgStart: "#eff6ff",
    cardBgMid: "#bfdbfe",
    cardBgEnd: "#60a5fa",
    bgGradientStart: "#1e3a8a",
    bgGradientEnd: "#0e7490",
    textPrimary: "#1e3a8a",
    textSecondary: "#1e40af",
    textMuted: "#2563eb",
  },
  chaos: {
    name: "Chaos",
    color: "#ef4444",
    borderColor: "#dc2626",
    cardBgStart: "#fef2f2",
    cardBgMid: "#fecaca",
    cardBgEnd: "#f87171",
    bgGradientStart: "#7f1d1d",
    bgGradientEnd: "#c2410c",
    textPrimary: "#7f1d1d",
    textSecondary: "#991b1b",
    textMuted: "#b91c1c",
  },
  strategy: {
    name: "Strategy",
    color: "#8b5cf6",
    borderColor: "#7c3aed",
    cardBgStart: "#f5f3ff",
    cardBgMid: "#ddd6fe",
    cardBgEnd: "#a78bfa",
    bgGradientStart: "#4c1d95",
    bgGradientEnd: "#3730a3",
    textPrimary: "#4c1d95",
    textSecondary: "#5b21b6",
    textMuted: "#6d28d9",
  },
  shipping: {
    name: "Shipping",
    color: "#22c55e",
    borderColor: "#16a34a",
    cardBgStart: "#f0fdf4",
    cardBgMid: "#bbf7d0",
    cardBgEnd: "#4ade80",
    bgGradientStart: "#14532d",
    bgGradientEnd: "#115e59",
    textPrimary: "#14532d",
    textSecondary: "#166534",
    textMuted: "#15803d",
  },
  politics: {
    name: "Politics",
    color: "#f59e0b",
    borderColor: "#d97706",
    cardBgStart: "#fffbeb",
    cardBgMid: "#fde68a",
    cardBgEnd: "#fbbf24",
    bgGradientStart: "#78350f",
    bgGradientEnd: "#9a3412",
    textPrimary: "#78350f",
    textSecondary: "#92400e",
    textMuted: "#b45309",
  },
  vision: {
    name: "Vision",
    color: "#ec4899",
    borderColor: "#db2777",
    cardBgStart: "#fdf2f8",
    cardBgMid: "#fbcfe8",
    cardBgEnd: "#f472b6",
    bgGradientStart: "#831843",
    bgGradientEnd: "#9d174d",
    textPrimary: "#831843",
    textSecondary: "#9d174d",
    textMuted: "#be185d",
  },
};

export async function POST(request: NextRequest) {
  try {
    const { cardId, score, archetypeName, archetypeImage, element, userName, emoji, description, moves, stage, weakness } = await request.json();

    if (!cardId || score === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const el = PM_ELEMENTS[element] || PM_ELEMENTS.chaos;
    const displayName = userName || archetypeName || "PM";
    const safeEmoji = emoji || "🎴";
    const safeDescription = description ? String(description).slice(0, 120) : "";
    const safeStage = stage || "Senior";
    const safeWeakness = weakness || "Meetings";
    const cardMoves = Array.isArray(moves) ? moves.slice(0, 2) : [];

    // Generate OG image with full card design - matching PokemonCard dimensions
    // Card: 400x560 (aspect ratio 2.5/3.5), 6px border
    const imageResponse = new ImageResponse(
      (
        <div style={{
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0a0a",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {/* Full Pokemon-style card - exact dimensions from PokemonCard.tsx */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            width: 400,
            height: 560,
            borderRadius: 12,
            border: `6px solid ${el.borderColor}`,
            background: `linear-gradient(180deg, ${el.cardBgStart} 0%, ${el.cardBgMid} 30%, ${el.cardBgEnd} 100%)`,
            overflow: "hidden",
            boxShadow: `0 0 60px ${el.color}40`,
          }}>
            {/* Header: Emoji + Name + Score - px-4 py-3 = 16px 12px */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 24 }}>{safeEmoji}</span>
                <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 900, color: el.textPrimary }}>{displayName}</span>
                  {userName && archetypeName && userName !== archetypeName && (
                    <span style={{ fontSize: 10, color: el.textSecondary, opacity: 0.8 }}>{archetypeName}</span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: "#dc2626" }}>{score}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: el.textMuted }}>/100</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: el.textSecondary, marginLeft: 4 }}>HP</span>
                <div style={{
                  display: "flex",
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: el.color,
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: 4,
                }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "white" }}>{(element || "C")[0].toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Image Frame - h-[196px] mx-4 mb-3 border-4 */}
            <div style={{
              display: "flex",
              margin: "0 16px 12px 16px",
              height: 196,
              borderRadius: 8,
              border: `4px solid ${el.borderColor}66`,
              background: `linear-gradient(135deg, ${el.bgGradientStart} 0%, ${el.bgGradientEnd} 100%)`,
              overflow: "hidden",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {archetypeImage ? (
                <img
                  src={archetypeImage.startsWith("data:") ? archetypeImage : `data:image/png;base64,${archetypeImage}`}
                  width={360}
                  height={188}
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: 72, textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>{safeEmoji}</span>
              )}
            </div>

            {/* Type Badge + Stage - mx-4 mb-2 */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              margin: "0 16px 8px 16px",
            }}>
              <div style={{
                display: "flex",
                padding: "4px 12px",
                borderRadius: 20,
                backgroundColor: el.color,
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{el.name} Type PM</span>
              </div>
              <span style={{ fontSize: 14, fontStyle: "italic", color: el.textSecondary }}>{safeStage}</span>
            </div>

            {/* Moves - mx-4 mb-2, px-4 py-2, energy w-14 (56px) with w-5 h-5 (20px) symbols */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              margin: "0 16px 8px 16px",
              backgroundColor: "rgba(255,255,255,0.7)",
              borderRadius: 8,
              border: `1px solid ${el.borderColor}30`,
            }}>
              {cardMoves.length > 0 ? cardMoves.map((move: { name?: string; energyCost?: number; damage?: number; effect?: string }, idx: number) => (
                <div key={idx} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  padding: "8px 16px",
                  borderBottom: idx === 0 ? `1px solid ${el.borderColor}30` : "none",
                  gap: 8,
                }}>
                  {/* Energy Cost - w-14 (56px) with gap-0.5 (2px) */}
                  <div style={{ display: "flex", gap: 2, width: 56, flexShrink: 0 }}>
                    {Array.from({ length: Math.min(move.energyCost || 1, 3) }).map((_, i) => (
                      <div key={i} style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: el.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "white" }}>{(element || "C")[0].toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                  {/* Move Name & Effect */}
                  <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: el.textPrimary }}>{move.name || "Attack"}</span>
                    {move.effect && (
                      <span style={{ fontSize: 11, color: el.textMuted, marginTop: 2 }}>{String(move.effect).slice(0, 45)}</span>
                    )}
                  </div>
                  {/* Damage */}
                  <span style={{ fontSize: 18, fontWeight: 900, color: el.textPrimary, flexShrink: 0 }}>{move.damage || 0}</span>
                </div>
              )) : (
                <div style={{ display: "flex", padding: "12px", justifyContent: "center" }}>
                  <span style={{ fontSize: 12, color: el.textMuted }}>No moves data</span>
                </div>
              )}
            </div>

            {/* Description - mx-4 mb-2 px-3 py-2 */}
            {safeDescription && (
              <div style={{
                display: "flex",
                margin: "0 16px 8px 16px",
                padding: "8px 12px",
                backgroundColor: "rgba(255,255,255,0.5)",
                borderRadius: 6,
                border: `1px solid ${el.borderColor}30`,
                flex: 1,
                alignItems: "center",
              }}>
                <span style={{ fontSize: 12, fontStyle: "italic", color: el.textSecondary, textAlign: "center", width: "100%" }}>
                  {safeDescription}
                </span>
              </div>
            )}

            {/* Footer - px-4 py-2 = 16px 8px */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 16px",
              marginTop: "auto",
              backgroundColor: `${el.borderColor}33`,
            }}>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ fontSize: 14, color: el.textSecondary }}>weakness</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: el.textPrimary }}>{safeWeakness}</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: el.textMuted }}>pmroast.com</span>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );

    // Convert to buffer
    const imageBuffer = await imageResponse.arrayBuffer();

    // Store in Vercel Blob (allow overwriting for regeneration)
    const blob = await put(`og/${cardId}.png`, imageBuffer, {
      access: "public",
      contentType: "image/png",
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("OG generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to generate OG image", details: errorMessage }, { status: 500 });
  }
}
