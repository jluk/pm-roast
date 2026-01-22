import { ImageResponse } from "@vercel/og";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// Element color schemes - matching the actual card colors
const ELEMENT_COLORS: Record<string, { bg: string; accent: string; glow: string }> = {
  data: { bg: "#0f172a", accent: "#3b82f6", glow: "#3b82f640" },
  chaos: { bg: "#1f0a1f", accent: "#f472b6", glow: "#f472b640" },
  strategy: { bg: "#1a0f2e", accent: "#a78bfa", glow: "#a78bfa40" },
  shipping: { bg: "#0a1f14", accent: "#4ade80", glow: "#4ade8040" },
  politics: { bg: "#1f1708", accent: "#fbbf24", glow: "#fbbf2440" },
  vision: { bg: "#0a1520", accent: "#22d3ee", glow: "#22d3ee40" },
};

export async function POST(request: NextRequest) {
  try {
    const { cardId, name, score, archetypeName, archetypeImage, element, userName } = await request.json();

    if (!cardId || score === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const safeArchetype = String(archetypeName || name || "PM").slice(0, 40);
    const safeScore = String(score);
    const safeUserName = userName ? String(userName).slice(0, 25) : null;
    const colors = ELEMENT_COLORS[element] || ELEMENT_COLORS.chaos;

    // Generate OG image with centered card preview
    const imageResponse = new ImageResponse(
      (
        <div style={{
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0a0a",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
        }}>
          {/* Centered container */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 60,
          }}>
            {/* Card preview */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              width: 320,
              height: 450,
              backgroundColor: colors.bg,
              borderRadius: 16,
              border: `2px solid ${colors.accent}50`,
              overflow: "hidden",
              boxShadow: `0 0 80px ${colors.glow}, 0 0 40px ${colors.glow}`,
            }}>
              {/* Card header with name and score */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                borderBottom: `1px solid ${colors.accent}30`,
              }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: "white", maxWidth: 200 }}>{safeArchetype}</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: colors.accent }}>{safeScore}</span>
              </div>

              {/* Card image area */}
              <div style={{
                display: "flex",
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
                backgroundColor: `${colors.accent}08`,
              }}>
                {archetypeImage ? (
                  <img
                    src={archetypeImage.startsWith("data:") ? archetypeImage : `data:image/png;base64,${archetypeImage}`}
                    width={260}
                    height={260}
                    style={{
                      objectFit: "contain",
                      borderRadius: 8,
                    }}
                  />
                ) : (
                  <div style={{
                    display: "flex",
                    width: 260,
                    height: 260,
                    backgroundColor: `${colors.accent}15`,
                    borderRadius: 8,
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <span style={{ fontSize: 72 }}>🎴</span>
                  </div>
                )}
              </div>

              {/* Card footer */}
              <div style={{
                display: "flex",
                padding: "10px 16px",
                borderTop: `1px solid ${colors.accent}30`,
                justifyContent: "center",
                backgroundColor: `${colors.accent}10`,
              }}>
                <span style={{ fontSize: 11, color: colors.accent, textTransform: "uppercase", letterSpacing: 3, fontWeight: 600 }}>
                  {element || "chaos"} type
                </span>
              </div>
            </div>

            {/* Right side - Info */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              maxWidth: 450,
            }}>
              {safeUserName && (
                <span style={{ fontSize: 24, color: "#666", marginBottom: 4 }}>{safeUserName}</span>
              )}
              <span style={{ fontSize: 42, fontWeight: 700, color: "white", marginBottom: 20 }}>
                PM Roast Card
              </span>
              <div style={{ display: "flex", alignItems: "baseline", marginBottom: 20 }}>
                <span style={{ fontSize: 88, fontWeight: 800, color: colors.accent, lineHeight: 1 }}>{safeScore}</span>
                <span style={{ fontSize: 32, fontWeight: 600, color: "#555", marginLeft: 6 }}>/100</span>
              </div>
              <span style={{ fontSize: 22, color: "#777", marginBottom: 30 }}>
                &ldquo;{safeArchetype}&rdquo;
              </span>
              <span style={{ fontSize: 18, color: "#6366f1", fontWeight: 500 }}>pmroast.com</span>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );

    // Convert to buffer
    const imageBuffer = await imageResponse.arrayBuffer();

    // Store in Vercel Blob
    const blob = await put(`og/${cardId}.png`, imageBuffer, {
      access: "public",
      contentType: "image/png",
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("OG generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to generate OG image", details: errorMessage }, { status: 500 });
  }
}
