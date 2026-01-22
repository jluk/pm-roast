import { ImageResponse } from "@vercel/og";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

// Use Node.js runtime for blob storage
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { cardId, name, score } = await request.json();

    if (!cardId || !name || score === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Sanitize inputs
    const safeName = String(name).replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 30);
    const safeScore = String(score);

    // Generate OG image
    const imageResponse = new ImageResponse(
      (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", backgroundColor: "#0a0a0a", color: "white" }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: "#f59e0b", marginBottom: 8 }}>{safeName}</div>
          <div style={{ fontSize: 80, fontWeight: 700 }}>{safeScore}/100</div>
          <div style={{ fontSize: 16, color: "#6366f1", marginTop: 32 }}>pmroast.com</div>
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
    return NextResponse.json({ error: "Failed to generate OG image" }, { status: 500 });
  }
}
