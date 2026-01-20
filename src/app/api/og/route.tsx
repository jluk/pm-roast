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
        }}
      >
        {/* Pokemon-style Card - Larger and centered */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 380,
            height: 530,
            position: "relative",
          }}
        >
          {/* Holographic glow */}
          <div
            style={{
              position: "absolute",
              top: -10,
              left: -10,
              right: -10,
              bottom: -10,
              background: "linear-gradient(45deg, #ff0080, #ff8c00, #40e0d0, #7b68ee, #ff0080)",
              borderRadius: 28,
              filter: "blur(16px)",
              opacity: 0.7,
            }}
          />

          {/* Main card body */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              position: "relative",
              borderRadius: 16,
              border: `6px solid ${element.color}`,
              overflow: "hidden",
              background: "linear-gradient(180deg, #fefefe 0%, #e5e5e5 30%, #d4d4d4 100%)",
            }}
          >
            {/* Header: Name + HP */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                background: "rgba(255,255,255,0.9)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 26 }}>{card.e}</span>
                <span style={{ fontSize: 16, fontWeight: 900, color: "#1a1a1a" }}>
                  {stripMarkdown(card.n)}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: "#dc2626" }}>{card.s}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#666" }}>/100 HP</span>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: element.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 11,
                    fontWeight: 700,
                    marginLeft: 4,
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
                margin: "0 14px",
                height: 160,
                borderRadius: 8,
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
              <span style={{ fontSize: 72, textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>{card.e}</span>
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

        {/* Side content - Quote and CTA */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: 50,
            maxWidth: 500,
            justifyContent: "center",
          }}
        >
          {/* Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: 40, fontWeight: 900, color: "white" }}>
              PM Roast
            </span>
            <span style={{ fontSize: 20, color: "#666" }}>
              🔥
            </span>
          </div>

          {/* Quote - larger and more prominent */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginBottom: 28,
              padding: "20px 24px",
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))",
              borderRadius: 16,
              border: "1px solid rgba(99, 102, 241, 0.3)",
            }}
          >
            <span style={{ fontSize: 20, color: "#6366f1", marginBottom: 8 }}>&ldquo;</span>
            <span
              style={{
                fontSize: 20,
                color: "white",
                fontStyle: "italic",
                lineHeight: 1.5,
              }}
            >
              {stripMarkdown(card.q).slice(0, 120)}
            </span>
            <span style={{ fontSize: 20, color: "#6366f1", textAlign: "right", marginTop: 8 }}>&rdquo;</span>
          </div>

          {/* Score badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: 12,
              }}
            >
              <span style={{ fontSize: 16, color: "#a3a3a3" }}>Score:</span>
              <span style={{ fontSize: 28, fontWeight: 900, color: "white" }}>{card.s}</span>
              <span style={{ fontSize: 14, color: "#666" }}>/100</span>
            </div>
          </div>

          {/* CTA */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "14px 24px",
              background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
              borderRadius: 14,
              width: "fit-content",
            }}
          >
            <span style={{ fontSize: 18, fontWeight: 700, color: "white" }}>Get your card at pmroast.com</span>
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
