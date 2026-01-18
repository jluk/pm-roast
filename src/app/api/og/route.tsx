import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

// Decode card data from URL (handles UTF-8/Unicode)
function decodeCardData(encoded: string) {
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const data = searchParams.get("data");

  if (!data) {
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

  const card = decodeCardData(data);

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

  const StarRating = ({ score }: { score: number }) => {
    const stars = Math.round(score / 20);
    return (
      <div style={{ display: "flex", gap: 2 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <div
            key={star}
            style={{
              width: 16,
              height: 16,
              color: star <= stars ? "#ffd700" : "#4b5563",
            }}
          >
            ★
          </div>
        ))}
      </div>
    );
  };

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
            width: 500,
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)",
            borderRadius: 24,
            border: "2px solid rgba(99, 102, 241, 0.3)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              height: 48,
              background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #6366f1 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "white", fontSize: 16, fontWeight: "bold", letterSpacing: 4 }}>
              PM ROAST
            </span>
          </div>

          {/* Content */}
          <div style={{ padding: 32, display: "flex", flexDirection: "column" }}>
            {/* Score + Emoji */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    fontSize: 72,
                    fontWeight: 900,
                    background: "linear-gradient(180deg, #ffd700 0%, #ff8c00 100%)",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {card.s}
                </div>
                <span style={{ fontSize: 10, color: "rgba(255, 215, 0, 0.7)", letterSpacing: 2 }}>
                  OVERALL
                </span>
              </div>
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 16,
                  background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))",
                  border: "1px solid rgba(99, 102, 241, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 56,
                }}
              >
                {card.e}
              </div>
            </div>

            {/* Archetype Name */}
            <div style={{ marginBottom: 20, display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 28, fontWeight: "bold", color: "white", marginBottom: 8 }}>
                {stripMarkdown(card.n)}
              </span>
              <span style={{ fontSize: 14, color: "#d1d5db", lineHeight: 1.4 }}>
                {stripMarkdown(card.d)}
              </span>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>🎯</span>
                  <span style={{ fontSize: 14, color: "#d1d5db" }}>Product Sense</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20, fontWeight: "bold", color: "#6366f1" }}>{card.ps}</span>
                  <StarRating score={card.ps} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>⚡</span>
                  <span style={{ fontSize: 14, color: "#d1d5db" }}>Execution</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20, fontWeight: "bold", color: "#6366f1" }}>{card.ex}</span>
                  <StarRating score={card.ex} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>👥</span>
                  <span style={{ fontSize: 14, color: "#d1d5db" }}>Leadership</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20, fontWeight: "bold", color: "#6366f1" }}>{card.ld}</span>
                  <StarRating score={card.ld} />
                </div>
              </div>
            </div>

            {/* Quote */}
            <div
              style={{
                padding: 16,
                background: "rgba(99, 102, 241, 0.1)",
                borderRadius: 12,
                border: "1px solid rgba(99, 102, 241, 0.2)",
              }}
            >
              <span style={{ fontSize: 13, color: "#d1d5db", fontStyle: "italic", textAlign: "center" }}>
                &quot;{stripMarkdown(card.q)}&quot;
              </span>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              height: 40,
              background: "rgba(99, 102, 241, 0.1)",
              borderTop: "1px solid rgba(99, 102, 241, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 12, color: "#9ca3af" }}>pmroast.com • Get your roast</span>
          </div>
        </div>

        {/* Side CTA */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: 60,
            maxWidth: 400,
          }}
        >
          <span style={{ fontSize: 48, fontWeight: "bold", color: "white", marginBottom: 16 }}>
            Get Roasted.
          </span>
          <span style={{ fontSize: 20, color: "#a3a3a3", lineHeight: 1.5 }}>
            Brutally honest AI feedback on your PM career, powered by 200+ Lenny&apos;s Podcast interviews.
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
