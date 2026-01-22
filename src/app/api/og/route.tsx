import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const cardId = url.searchParams.get("c");

  // If card ID provided, try to redirect to blob storage
  if (cardId) {
    const blobUrl = `https://ee3jrhyuiuxmfuri.public.blob.vercel-storage.com/og/${cardId}.png`;
    try {
      const response = await fetch(blobUrl, { method: "HEAD" });
      if (response.ok) {
        return Response.redirect(blobUrl, 302);
      }
    } catch {
      // Blob not found, fall through to default
    }
  }

  // Default fallback image
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", backgroundColor: "#0a0a0a", color: "white" }}>
        <span style={{ fontSize: 48, fontWeight: 700 }}>PM Roast</span>
        <span style={{ fontSize: 24, color: "#888", marginTop: 16 }}>Get your PM trading card</span>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
