import { ImageResponse } from "@vercel/og";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// Element color schemes
const ELEMENT_COLORS: Record<string, { bg: string; accent: string; border: string }> = {
  data: { bg: "#0c1929", accent: "#3b82f6", border: "#1e40af" },
  chaos: { bg: "#1a0a1a", accent: "#ec4899", border: "#9d174d" },
  strategy: { bg: "#0f0a1a", accent: "#8b5cf6", border: "#5b21b6" },
  shipping: { bg: "#0a1a14", accent: "#22c55e", border: "#166534" },
  politics: { bg: "#1a1408", accent: "#f59e0b", border: "#b45309" },
  vision: { bg: "#0a0f1a", accent: "#06b6d4", border: "#0e7490" },
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

    // Generate OG image with card preview
    const imageResponse = new ImageResponse(
      (
        <div style={{
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0a0a",
          padding: 40,
        }}>
          {/* Left side - Card preview */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            width: 380,
            height: 550,
            backgroundColor: colors.bg,
            borderRadius: 20,
            border: `3px solid ${colors.border}`,
            overflow: "hidden",
            boxShadow: `0 0 60px ${colors.accent}33`,
          }}>
            {/* Card header */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 20px",
              backgroundColor: `${colors.accent}22`,
              borderBottom: `1px solid ${colors.border}`,
            }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: "white" }}>{safeArchetype}</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: colors.accent }}>{safeScore}</span>
            </div>

            {/* Card image area */}
            <div style={{
              display: "flex",
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}>
              {archetypeImage ? (
                <img
                  src={archetypeImage.startsWith('data:') ? archetypeImage : `data:image/png;base64,${archetypeImage}`}
                  style={{
                    width: 300,
                    height: 300,
                    objectFit: "contain",
                    borderRadius: 12,
                  }}
                />
              ) : (
                <div style={{
                  display: "flex",
                  width: 300,
                  height: 300,
                  backgroundColor: `${colors.accent}11`,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <span style={{ fontSize: 80 }}>🎴</span>
                </div>
              )}
            </div>

            {/* Card footer */}
            <div style={{
              display: "flex",
              padding: "12px 20px",
              backgroundColor: `${colors.accent}11`,
              borderTop: `1px solid ${colors.border}`,
              justifyContent: "center",
            }}>
              <span style={{ fontSize: 14, color: `${colors.accent}`, textTransform: "uppercase", letterSpacing: 2 }}>
                {element || "chaos"} type
              </span>
            </div>
          </div>

          {/* Right side - Info */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            paddingLeft: 50,
            justifyContent: "center",
          }}>
            {safeUserName && (
              <span style={{ fontSize: 28, color: "#888", marginBottom: 8 }}>{safeUserName}</span>
            )}
            <span style={{ fontSize: 48, fontWeight: 700, color: "white", marginBottom: 16 }}>
              PM Roast Card
            </span>
            <div style={{ display: "flex", alignItems: "baseline", marginBottom: 24 }}>
              <span style={{ fontSize: 96, fontWeight: 800, color: colors.accent }}>{safeScore}</span>
              <span style={{ fontSize: 36, fontWeight: 600, color: "#666", marginLeft: 8 }}>/100</span>
            </div>
            <span style={{ fontSize: 24, color: "#888", marginBottom: 40 }}>
              &ldquo;{safeArchetype}&rdquo;
            </span>
            <span style={{ fontSize: 20, color: "#6366f1" }}>pmroast.com</span>
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
