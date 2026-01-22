import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
import { kv } from "@vercel/kv";
import { RoastResult, DreamRole, DREAM_ROLES, PMElement } from "@/lib/types";
import { FamousCard, getFamousCardByName, searchFamousCards } from "@/lib/famous-cards";
import { storeCard } from "@/lib/card-storage";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const genAINew = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Fetch image as base64 from URL
async function fetchImageAsBase64(imageUrl: string): Promise<{ data: string; mimeType: string } | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error("Failed to fetch image:", response.status);
      return null;
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    return { data: base64, mimeType: contentType };
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
}

// Generate a custom card image for a celebrity
async function generateCelebrityImage(
  name: string,
  archetypeName: string,
  archetypeDescription: string,
  element: PMElement,
  profileImageUrl?: string | null
): Promise<string | null> {
  try {
    // If we have a profile photo, use it for personalized generation
    let profileImage: { data: string; mimeType: string } | null = null;

    if (profileImageUrl) {
      console.log("=== FETCHING WIKIPEDIA IMAGE ===");
      console.log("Image URL:", profileImageUrl);
      profileImage = await fetchImageAsBase64(profileImageUrl);
    }

    if (profileImage) {
      console.log("=== GENERATING PERSONALIZED CELEBRITY IMAGE ===");

      const personalizedPrompt = `Create a FUNNY illustrated trading card portrait of THIS EXACT PERSON as "${archetypeName}".

CRITICAL - NO TEXT IN IMAGE:
- NEVER generate ANY text, words, letters, numbers, labels, signs, or writing of any kind
- AI-generated text always looks wrong - avoid it completely

CRITICAL - PRESERVE THE PERSON'S LIKENESS:
- This is THE MOST IMPORTANT requirement - the output MUST look like this specific person: ${name}
- Copy their EXACT face: same eyes, nose, mouth, face shape, skin tone, hair color, hairstyle
- The person in the output should be IMMEDIATELY RECOGNIZABLE as ${name}
- Study every facial detail in the input and replicate it faithfully
- If they have glasses, facial hair, distinctive features - KEEP THEM

STYLE:
- Pokemon trading card illustration style - vibrant, colorful, fun
- Hand-painted watercolor look with magical energy effects
- Premium collectible quality
- They should look powerful and legendary

CHARACTER DESCRIPTION:
${archetypeDescription}

COMPOSITION:
- Upper body portrait, face prominently featured and LARGE
- Front-facing or 3/4 view
- LANDSCAPE 16:9 aspect ratio
- Dynamic pose showing confidence and power

DO NOT:
- Generate any text, words, or writing
- Make the person unrecognizable
- Create photorealistic renders
- Make the face small or obscured`;

      try {
        const response = await genAINew.models.generateContent({
          model: "gemini-2.0-flash-exp-image-generation",
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType: profileImage.mimeType,
                    data: profileImage.data,
                  },
                },
                { text: personalizedPrompt },
              ],
            },
          ],
          config: {
            responseModalities: ["Text", "Image"],
          },
        });

        if (response.candidates && response.candidates[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const anyPart = part as any;
            if (anyPart.inlineData) {
              console.log("=== PERSONALIZED CELEBRITY IMAGE GENERATED ===");
              return `data:${anyPart.inlineData.mimeType};base64,${anyPart.inlineData.data}`;
            }
          }
        }
      } catch (personalizedError) {
        console.error("Personalized image generation failed:", personalizedError);
      }
    }

    // Fallback: Generate illustration without reference photo
    console.log("=== GENERATING CELEBRITY ILLUSTRATION (NO PHOTO) ===");

    const illustrationPrompt = `Create a FUNNY illustrated Pokemon trading card style portrait for a legendary figure named "${name}" with the archetype "${archetypeName}".

CRITICAL - NO TEXT IN IMAGE:
- NEVER generate ANY text, words, letters, numbers, labels, signs, or writing of any kind

STYLE:
- Pokemon/trading card game illustration style
- Vibrant, colorful, hand-painted watercolor look
- Magical energy effects and dynamic lighting
- Premium collectible quality
- Should look LEGENDARY and POWERFUL

CHARACTER:
- ${archetypeDescription}
- Show them in a powerful, confident pose
- Include subtle visual hints about their industry/achievements
- Make them look like a final boss or legendary Pokemon card

COMPOSITION:
- Upper body portrait
- LANDSCAPE 16:9 aspect ratio
- Dynamic and engaging composition
- Face should be expressive and memorable

DO NOT:
- Generate any text or writing
- Make it photorealistic
- Make it boring or generic`;

    const response = await genAINew.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: illustrationPrompt,
      config: {
        responseModalities: ["Text", "Image"],
      },
    });

    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyPart = part as any;
        if (anyPart.inlineData) {
          console.log("=== CELEBRITY ILLUSTRATION GENERATED ===");
          return `data:${anyPart.inlineData.mimeType};base64,${anyPart.inlineData.data}`;
        }
      }
    }

    console.log("No image generated");
    return null;
  } catch (error) {
    console.error("Failed to generate celebrity image:", error);
    return null;
  }
}

// Convert FamousCard to RoastResult format
function famousCardToRoastResult(card: FamousCard, dreamRole: DreamRole): RoastResult {
  return {
    userName: card.name,
    roastBullets: card.roastBullets,
    archetype: {
      name: card.archetypeName,
      description: card.archetypeDescription,
      emoji: card.archetypeEmoji,
      element: card.element,
      flavor: card.flavor,
      stage: card.stage,
      weakness: card.weakness,
    },
    moves: card.moves,
    archetypeImage: card.imageUrl,
    careerScore: card.score,
    capabilities: {
      productSense: Math.min(99, Math.round(card.score * 0.95 + Math.random() * 5)),
      execution: Math.min(99, Math.round(card.score * 0.9 + Math.random() * 8)),
      leadership: Math.min(99, Math.round(card.score * 0.85 + Math.random() * 10)),
    },
    gaps: [
      "Already a legend - gaps are irrelevant",
      "Too famous to have weaknesses",
      "The gaps fear them instead",
    ],
    roadmap: [
      { month: 1, title: "Continue Dominating", actions: ["Stay legendary", "Ignore the haters"] },
      { month: 2, title: "Scale Empire", actions: ["Acquire competitors", "Expand influence"] },
      { month: 3, title: "Build Legacy", actions: ["Write memoirs", "Start foundation"] },
      { month: 4, title: "World Domination", actions: ["Complete ascension", "Transcend mortality"] },
    ],
    podcastEpisodes: [
      { title: "How I Built This", guest: card.name, reason: "Learn from the legend directly" },
    ],
    bangerQuote: card.bangerQuote,
    dreamRoleReaction: `Already surpassed ${DREAM_ROLES[dreamRole].label}. They're playing a different game.`,
    naturalRival: card.naturalRival,
  };
}

// System prompt for celebrity roasts
const CELEBRITY_ROAST_PROMPT = `You are a savage AI comedian who specializes in roasting tech industry celebrities. You've seen all their interviews, read their tweets, and know their public personas inside and out.

You're creating a PM Roast trading card for a famous person in tech. Your job is to create a hilarious but insightful roast based on their public persona and known achievements.

CRITICAL RULES:
1. Only use PUBLIC knowledge about this person - their companies, known achievements, public statements, common criticisms
2. Keep it fun and roast-y but not mean-spirited or libelous
3. Reference specific things they're known for - companies founded, products shipped, famous quotes, public controversies
4. The roast should feel like something their colleagues might joke about at a roast dinner
5. Make the archetype name clever and specific to them

PM ELEMENT TYPES (choose the most fitting one):
- "data": Obsessed with metrics, analytics, A/B tests
- "chaos": Thrives in ambiguity, firefighting, rapid pivots
- "strategy": Focused on planning, documentation, frameworks
- "shipping": Gets things done, velocity-obsessed
- "politics": Skilled at stakeholder management, influence
- "vision": Big ideas, product intuition, founder-like thinking

STAGE (based on their career level):
- Senior: Established professional
- Elite: Industry leader
- Legendary: Household name in tech
- Mythical: Changed the industry

Your response MUST be valid JSON with this exact structure (no markdown, no code blocks, just raw JSON):
{
  "userName": "Their first name",
  "roastBullets": ["4 roasts based on their public persona, max 100 chars each"],
  "archetype": {
    "name": "2-3 word archetype name specific to them",
    "description": "A punchy description of their PM/tech persona, 60-80 chars",
    "emoji": "Single emoji matching their vibe",
    "element": "data|chaos|strategy|shipping|politics|vision",
    "flavor": "Nature-doc style observation about them, 60-80 chars",
    "stage": "Senior|Elite|Legendary|Mythical",
    "weakness": "One ironic word based on their known weaknesses"
  },
  "moves": [
    {
      "name": "2-3 word move name referencing something they're known for",
      "energyCost": 1-4,
      "damage": 40-150,
      "effect": "Funny effect related to their actual achievements, 30-50 chars"
    },
    {
      "name": "Another signature move",
      "energyCost": 1-4,
      "damage": 40-150,
      "effect": "Another funny effect"
    },
    {
      "name": "Ultimate move",
      "energyCost": 3-4,
      "damage": 80-150,
      "effect": "Their most famous/powerful ability"
    }
  ],
  "careerScore": 70-99 (they're famous for a reason),
  "capabilities": {
    "productSense": 60-99,
    "execution": 60-99,
    "leadership": 60-99
  },
  "gaps": ["3 humorous 'gaps' that are actually humble-brags or known quirks, max 60 chars each"],
  "roadmap": [
    {"month": 1, "title": "max 20 chars", "actions": ["2 actions that parody their actual career trajectory, max 40 chars each"]},
    {"month": 2, "title": "max 20 chars", "actions": ["2 more parody actions"]},
    {"month": 3, "title": "max 20 chars", "actions": ["2 more parody actions"]},
    {"month": 4, "title": "max 20 chars", "actions": ["2 more parody actions"]}
  ],
  "podcastEpisodes": [
    {"title": "A real or plausible podcast", "guest": "Guest name", "reason": "Why funny/relevant, max 50 chars"}
  ],
  "bangerQuote": "A quotable roast line about them that captures their essence. Max 140 chars.",
  "dreamRoleReaction": "Sarcastic verdict comparing them to the dream role they were aiming for. Max 80 chars.",
  "naturalRival": "Their known competitor or ironic nemesis. Max 60 chars."
}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, dreamRole, imageUrl, wikipediaExtract } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Invalid name provided" }, { status: 400 });
    }

    if (!dreamRole || !DREAM_ROLES[dreamRole as DreamRole]) {
      return NextResponse.json({ error: "Invalid dream role" }, { status: 400 });
    }

    const normalizedName = name.trim();
    const profileImageUrl = imageUrl || null;
    const wikiContext = wikipediaExtract || null;

    // First, check for exact match in pre-generated famous cards
    const exactMatch = getFamousCardByName(normalizedName);
    if (exactMatch) {
      const result = famousCardToRoastResult(exactMatch, dreamRole as DreamRole);
      const cardId = await storeCard(result, dreamRole as DreamRole);

      return NextResponse.json({
        success: true,
        source: "pre-generated",
        cached: false,
        card: result,
        cardId,
      });
    }

    // Check for fuzzy match (might be close to a famous person)
    const fuzzyMatches = searchFamousCards(normalizedName);
    if (fuzzyMatches.length > 0) {
      // If the query is very close to a famous card name, use that
      const bestMatch = fuzzyMatches[0];
      const queryLower = normalizedName.toLowerCase();
      const matchLower = bestMatch.name.toLowerCase();

      // If it's a clear match (starts with same chars or is very similar)
      if (matchLower.startsWith(queryLower) || queryLower.startsWith(matchLower.split(" ")[0])) {
        const result = famousCardToRoastResult(bestMatch, dreamRole as DreamRole);
        const cardId = await storeCard(result, dreamRole as DreamRole);

        return NextResponse.json({
          success: true,
          source: "pre-generated",
          cached: false,
          card: result,
          cardId,
        });
      }
    }

    // Check Redis cache for previously generated celebrity roasts
    const cacheKey = `legend:${normalizedName.toLowerCase().replace(/\s+/g, "-")}`;
    const cached = await kv.get<string>(cacheKey);

    if (cached) {
      const cachedResult = typeof cached === "string" ? JSON.parse(cached) : cached;
      const cardId = await storeCard(cachedResult as RoastResult, dreamRole as DreamRole);

      return NextResponse.json({
        success: true,
        source: "ai-generated",
        cached: true,
        card: cachedResult,
        cardId,
      });
    }

    // Generate roast using Gemini (verification already done via /api/verify-legend)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Include Wikipedia context if available
    const wikiContextPrompt = wikiContext
      ? `\n\nHere's some background on this person from Wikipedia:\n${wikiContext}`
      : "";

    const prompt = `Create a PM Roast trading card for: "${normalizedName}"

This person wants to be a: ${DREAM_ROLES[dreamRole as DreamRole].label} (${DREAM_ROLES[dreamRole as DreamRole].description})
${wikiContextPrompt}

Use their PUBLIC persona, achievements, and known characteristics:
- Reference their actual companies, products, famous quotes, or public controversies
- Make it feel like a roast by people who know their work
- Be specific to THIS person's actual career and public image

Remember: This is a fun roast card, keep it entertaining and witty!`;

    const chatResponse = await model.generateContent([
      { text: CELEBRITY_ROAST_PROMPT },
      { text: prompt },
    ]);

    const responseText = chatResponse.response.text();

    // Parse JSON response
    let roastData: RoastResult;
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      roastData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      console.error("Response text:", responseText);
      return NextResponse.json({ error: "Failed to generate roast" }, { status: 500 });
    }

    // Validate and set defaults for missing fields
    const validatedResult: RoastResult = {
      userName: roastData.userName || normalizedName.split(" ")[0],
      roastBullets: roastData.roastBullets || ["A mystery wrapped in an enigma"],
      archetype: {
        name: roastData.archetype?.name || "The Unknown",
        description: roastData.archetype?.description || "A mysterious figure in tech",
        emoji: roastData.archetype?.emoji || "?",
        element: (roastData.archetype?.element as PMElement) || "vision",
        flavor: roastData.archetype?.flavor || "Observes from the shadows",
        stage: roastData.archetype?.stage || "Senior",
        weakness: roastData.archetype?.weakness || "Anonymity",
      },
      moves: roastData.moves || [
        { name: "Mystery Move", energyCost: 2, damage: 50, effect: "Does something unexpected" },
      ],
      careerScore: roastData.careerScore || 75,
      capabilities: roastData.capabilities || {
        productSense: 70,
        execution: 70,
        leadership: 70,
      },
      gaps: roastData.gaps || ["Unknown territory"],
      roadmap: roastData.roadmap || [
        { month: 1, title: "Emerge", actions: ["Make yourself known"] },
      ],
      podcastEpisodes: roastData.podcastEpisodes || [],
      bangerQuote: roastData.bangerQuote || "Who knows what legends lie dormant?",
      dreamRoleReaction: roastData.dreamRoleReaction || "The journey is just beginning.",
      naturalRival: roastData.naturalRival || "The unknown",
    };

    // Generate custom card image
    console.log("=== GENERATING CELEBRITY CARD IMAGE ===");
    const archetypeImage = await generateCelebrityImage(
      normalizedName,
      validatedResult.archetype.name,
      validatedResult.archetype.description,
      validatedResult.archetype.element,
      profileImageUrl
    );

    if (archetypeImage) {
      validatedResult.archetypeImage = archetypeImage;
    }

    // Cache the result in Redis for 30 days
    await kv.set(cacheKey, JSON.stringify(validatedResult), { ex: 30 * 24 * 60 * 60 });

    // Store in KV for sharing
    const cardId = await storeCard(validatedResult, dreamRole as DreamRole);

    return NextResponse.json({
      success: true,
      source: "ai-generated",
      cached: false,
      card: validatedResult,
      cardId,
    });

  } catch (error) {
    console.error("Error in roast-legend API:", error);
    return NextResponse.json(
      { error: "Failed to generate legend roast" },
      { status: 500 }
    );
  }
}
