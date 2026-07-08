import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
import { PMElement, PMMove } from "@/lib/types";
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

type Ref = { data: string; mimeType: string } | null;

async function withTimeout<T>(p: Promise<T>, ms: number, msg: string): Promise<T> {
  return Promise.race([p, new Promise<never>((_, r) => setTimeout(() => r(new Error(msg)), ms))]);
}

function lookupCard(id: string): { card: FusionParent; folder: "sv" | "celebrities" } | null {
  const famous = getFamousCardById(id);
  if (famous) return { card: famous as FusionParent, folder: "sv" };
  const celeb = getCelebrityCardById(id);
  if (celeb) return { card: celeb as FusionParent, folder: "celebrities" };
  return null;
}

// Fetch an image URL -> base64. Prefer the source portrait; fall back to card art.
async function fetchRef(origin: string, folder: string, card: FusionParent): Promise<Ref> {
  const candidates = [`/famous/${folder}/${card.id}.jpg`, card.imageUrl];
  for (const path of candidates) {
    try {
      const res = await fetch(new URL(path, origin).toString());
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      return { data: buf.toString("base64"), mimeType: res.headers.get("content-type") || "image/jpeg" };
    } catch {
      /* next */
    }
  }
  return null;
}

// Decode a data URL (data:image/png;base64,....) into a ref.
function dataUrlToRef(dataUrl: string): Ref {
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) return null;
  return { mimeType: m[1], data: m[2] };
}

function parseJson(text: string): Record<string, unknown> {
  let s = text.trim();
  if (s.startsWith("```json")) s = s.slice(7);
  if (s.startsWith("```")) s = s.slice(3);
  if (s.endsWith("```")) s = s.slice(0, -3);
  const match = s.match(/\{[\s\S]*\}/);
  if (match) s = match[0];
  s = s.replace(/,(\s*[\]}])/g, "$1");
  try {
    return JSON.parse(s);
  } catch {
    const compact = s.replace(/[\n\r\t]/g, " ").replace(/\s+/g, " ").replace(/,(\s*[\]}])/g, "$1");
    return JSON.parse(compact);
  }
}

// A parent is either a legend id, or an inline card + image (e.g. the user's own card).
interface ParentSpec {
  id?: string;
  card?: FusionParent;
  image?: string; // data URL
}

async function resolveParent(spec: ParentSpec, origin: string): Promise<{ card: FusionParent; ref: Ref } | null> {
  if (spec.id) {
    const found = lookupCard(spec.id);
    if (!found) return null;
    return { card: found.card, ref: await fetchRef(origin, found.folder, found.card) };
  }
  if (spec.card) {
    return { card: spec.card, ref: spec.image ? dataUrlToRef(spec.image) : null };
  }
  return null;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const origin = new URL(request.url).origin;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (o: Record<string, unknown>) => controller.enqueue(encoder.encode(JSON.stringify(o) + "\n"));
      const fail = (error: string) => {
        send({ t: "error", error });
        controller.close();
      };
      try {
        const a = await resolveParent({ id: body.aId, card: body.aCard, image: body.aImage }, origin);
        const b = await resolveParent({ id: body.bId, card: body.bCard, image: body.bImage }, origin);
        if (!a || !b) return fail("One or both cards could not be loaded.");
        if (a.card.name === b.card.name) return fail("Pick two different cards to fuse.");

        // Stage 1 — analyze
        send({ t: "stage", key: "analyze", label: "Reading both cards", detail: "Fusing element types via the deterministic fusion matrix" });
        const fusedElement: PMElement = fuseElements(a.card.element, b.card.element);

        // Stage 2 — fused creative text
        send({ t: "stage", key: "text", label: "Writing the hybrid archetype", detail: "gemini-2.5-flash · JSON mode" });
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: { temperature: 0.95, topP: 0.95, maxOutputTokens: 8192, responseMimeType: "application/json" },
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
              return fail("The fusion fizzled while writing. Try again.");
            }
          }
        }
        const c = creative as Record<string, unknown>;

        // Stage 3 — fused likeness (both reference images -> one hybrid character)
        send({ t: "stage", key: "image", label: "Fusing the two likenesses", detail: `${IMAGE_MODEL} · 2 reference photos → 1 character` });
        let archetypeImage: string | null = null;
        try {
          if (a.ref && b.ref) {
            const imgPrompt = buildFusionImagePrompt(
              String(c.archetypeName), String(c.archetypeDescription), fusedElement, a.card.name, b.card.name,
            );
            const imgRes = await withTimeout(
              genAINew.models.generateContent({
                model: IMAGE_MODEL,
                contents: [{ role: "user", parts: [
                  { inlineData: { mimeType: a.ref.mimeType, data: a.ref.data } },
                  { inlineData: { mimeType: b.ref.mimeType, data: b.ref.data } },
                  { text: imgPrompt },
                ] }],
                config: { responseModalities: ["Text", "Image"] },
              }),
              45000, "Fusion image timeout",
            );
            for (const part of imgRes.candidates?.[0]?.content?.parts || []) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const ip = (part as any).inlineData;
              if (ip) { archetypeImage = `data:${ip.mimeType};base64,${ip.data}`; break; }
            }
          }
        } catch (e) {
          console.error("Fusion image failed (continuing without art):", e);
        }

        // Stage 4 — assemble + mint
        send({ t: "stage", key: "store", label: "Minting the fusion card", detail: "Storing a permanent, shareable card" });
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

        if (cardId) {
          fetch(new URL("/api/og-generate", request.url).toString(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cardId, score: card.careerScore, archetypeName: card.archetype.name,
              archetypeImage: card.archetypeImage, element: card.archetype.element,
              userName: card.userName, emoji: card.archetype.emoji, description: card.archetype.description,
              moves: card.moves, stage: card.archetype.stage, weakness: card.archetype.weakness,
            }),
          }).catch(() => {});
        }

        send({ t: "done", card, cardId });
        controller.close();
      } catch (error) {
        console.error("Fusion error:", error);
        fail(error instanceof Error ? error.message : "Fusion failed");
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
