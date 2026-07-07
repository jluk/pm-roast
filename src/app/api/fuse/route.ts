import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
import { PMMove } from "@/lib/types";
import { getFamousCardById } from "@/lib/famous-cards";
import { getCelebrityCardById } from "@/lib/celebrity-cards";
import { storeCard } from "@/lib/card-storage";
import { IMAGE_MODEL } from "@/lib/image-generation";
import {
  FusionParent,
  fuseElements,
  FUSION_TEXT_SYSTEM,
  buildFusionUserPrompt,
  buildFusionImagePrompt,
  assembleFusionCard,
} from "@/lib/fusion";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const genAINew = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Text + two-image fusion can exceed Vercel's default ~15s limit.
export const maxDuration = 60;

async function withTimeout<T>(p: Promise<T>, ms: number, msg: string): Promise<T> {
  return Promise.race([p, new Promise<never>((_, r) => setTimeout(() => r(new Error(msg)), ms))]);
}

// Resolve a legend card by id from either set, tagging its source-photo folder.
function lookupCard(id: string): { card: FusionParent; folder: "sv" | "celebrities" } | null {
  const famous = getFamousCardById(id);
  if (famous) return { card: famous as FusionParent, folder: "sv" };
  const celeb = getCelebrityCardById(id);
  if (celeb) return { card: celeb as FusionParent, folder: "celebrities" };
  return null;
}

// Fetch an image URL -> base64. Prefer the source portrait; fall back to card art.
async function fetchRef(
  origin: string,
  folder: string,
  card: FusionParent,
): Promise<{ data: string; mimeType: string } | null> {
  const candidates = [`/famous/${folder}/${card.id}.jpg`, card.imageUrl];
  for (const path of candidates) {
    try {
      const res = await fetch(new URL(path, origin).toString());
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      return { data: buf.toString("base64"), mimeType: res.headers.get("content-type") || "image/jpeg" };
    } catch {
      // try next candidate
    }
  }
  return null;
}

function parseJson(text: string): Record<string, unknown> {
  let s = text.trim();
  if (s.startsWith("```json")) s = s.slice(7);
  if (s.startsWith("```")) s = s.slice(3);
  if (s.endsWith("```")) s = s.slice(0, -3);
  const match = s.match(/\{[\s\S]*\}/);
  if (match) s = match[0];
  s = s.replace(/,(\s*[\]}])/g, "$1"); // trailing commas
  try {
    return JSON.parse(s);
  } catch {
    // Fallback: collapse whitespace/newlines (common cause of parse breaks)
    const compact = s.replace(/[\n\r\t]/g, " ").replace(/\s+/g, " ").replace(/,(\s*[\]}])/g, "$1");
    return JSON.parse(compact);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { aId, bId } = await request.json();
    if (!aId || !bId || aId === bId) {
      return NextResponse.json({ error: "Pick two different cards to fuse." }, { status: 400 });
    }

    const a = lookupCard(aId);
    const b = lookupCard(bId);
    if (!a || !b) {
      return NextResponse.json({ error: "One or both cards were not found." }, { status: 404 });
    }

    const fusedElement = fuseElements(a.card.element, b.card.element);
    const origin = new URL(request.url).origin;

    // 1) Fused creative text
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.95,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });
    const prompt = `${FUSION_TEXT_SYSTEM}\n\n${buildFusionUserPrompt(a.card, b.card, fusedElement)}`;

    let creative: Record<string, unknown> | null = null;
    for (let attempt = 1; attempt <= 2 && !creative; attempt++) {
      try {
        const res = await withTimeout(model.generateContent(prompt), 30000, "Fusion text timeout");
        creative = parseJson(res.response.text());
      } catch (e) {
        if (attempt === 2) {
          console.error("Fusion text failed:", e);
          return NextResponse.json({ error: "The fusion fizzled. Try again." }, { status: 500 });
        }
      }
    }
    const c = creative as Record<string, unknown>;

    // 2) Fused likeness — both reference images -> one hybrid character
    let archetypeImage: string | null = null;
    try {
      const [refA, refB] = await Promise.all([
        fetchRef(origin, a.folder, a.card),
        fetchRef(origin, b.folder, b.card),
      ]);
      if (refA && refB) {
        const imgPrompt = buildFusionImagePrompt(
          String(c.archetypeName),
          String(c.archetypeDescription),
          fusedElement,
          a.card.name,
          b.card.name,
        );
        const imgRes = await withTimeout(
          genAINew.models.generateContent({
            model: IMAGE_MODEL,
            contents: [
              {
                role: "user",
                parts: [
                  { inlineData: { mimeType: refA.mimeType, data: refA.data } },
                  { inlineData: { mimeType: refB.mimeType, data: refB.data } },
                  { text: imgPrompt },
                ],
              },
            ],
            config: { responseModalities: ["Text", "Image"] },
          }),
          45000,
          "Fusion image timeout",
        );
        const parts = imgRes.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const ip = (part as any).inlineData;
          if (ip) {
            archetypeImage = `data:${ip.mimeType};base64,${ip.data}`;
            break;
          }
        }
      }
    } catch (e) {
      console.error("Fusion image failed (continuing without art):", e);
    }

    // 3) Assemble + store
    const moves = (Array.isArray(c.moves) ? c.moves : []) as PMMove[];
    const caps = (c.capabilities || {}) as { productSense?: number; execution?: number; leadership?: number };
    const card = assembleFusionCard(a.card, b.card, fusedElement, {
      archetypeName: String(c.archetypeName || "The Fusion"),
      archetypeDescription: String(c.archetypeDescription || "Two PMs, one card, infinite chaos."),
      archetypeEmoji: String(c.archetypeEmoji || "⚗️"),
      flavor: String(c.flavor || ""),
      stage: String(c.stage || "Fused"),
      weakness: String(c.weakness || "Identity"),
      moves: moves.length ? moves : a.card.moves,
      roastBullets: (Array.isArray(c.roastBullets) ? c.roastBullets : []).map(String),
      bangerQuote: String(c.bangerQuote || ""),
      naturalRival: String(c.naturalRival || "The original two, working together"),
      capabilities: {
        productSense: Number(caps.productSense) || 80,
        execution: Number(caps.execution) || 80,
        leadership: Number(caps.leadership) || 80,
      },
    }, archetypeImage);

    let cardId: string | null = null;
    try {
      cardId = await storeCard(card, "founder", true);
    } catch (e) {
      console.error("Fusion store failed:", e);
    }

    // Fire-and-forget OG image so shared fusions get a preview
    if (cardId) {
      fetch(new URL("/api/og-generate", request.url).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId,
          score: card.careerScore,
          archetypeName: card.archetype.name,
          archetypeImage: card.archetypeImage,
          element: card.archetype.element,
          userName: card.userName,
          emoji: card.archetype.emoji,
          description: card.archetype.description,
          moves: card.moves,
          stage: card.archetype.stage,
          weakness: card.archetype.weakness,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, cardId, card });
  } catch (error) {
    console.error("Fusion error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Fusion failed" },
      { status: 500 },
    );
  }
}
