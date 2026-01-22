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

      const personalizedPrompt = `Create a HILARIOUS Pokemon trading card illustration of THIS EXACT PERSON as "${archetypeName}".

CRITICAL - NO TEXT IN IMAGE:
- NEVER generate ANY text, words, letters, numbers, labels, signs, or writing of any kind
- This includes: names, titles, speech bubbles, captions, watermarks, logos with text
- AI-generated text always looks wrong - avoid it completely
- The image should be PURELY visual with no readable characters

CRITICAL - PRESERVE THE PERSON'S LIKENESS:
- This is THE MOST IMPORTANT requirement - the output MUST look like this specific person
- Copy their EXACT face: same eyes, nose, mouth, face shape, skin tone, hair color, hairstyle
- The person in the output should be IMMEDIATELY RECOGNIZABLE as the person in the input photo
- Study every facial detail in the input and replicate it faithfully
- If they have glasses, facial hair, distinctive features - KEEP THEM
- Think caricature energy - exaggerate the situation for humor but preserve their identity
- Fans should IMMEDIATELY know who this is

THE HILARIOUS SCENE:
- Depict ${name} in a comedic scene as "${archetypeName}"
- The roast concept: "${archetypeDescription}"
- Show them DOING something funny that matches their archetype
- Include props, items, or background elements that tell the story
- Think "internet meme meets Pokemon card" - visually funny, shareable humor

HUMOR & VIBE (Internet meme energy):
- FUNNY expressions - smug confidence, existential dread, manic energy, "this is fine" vibes
- Internet humor and meme relevance - the kind of image people would share
- Absurd but relatable situations that make people laugh
- The humor comes from "that's definitely ${name} in this ridiculous situation"

ART STYLE (POKEMON TCG - CRITICAL):
- Classic 90s/2000s Pokemon trading card illustration style
- Hand-painted watercolor aesthetic with vibrant saturated colors
- Dynamic energy effects, magical auras, elemental powers
- ${element} element theme in colors and effects
- Premium collectible card quality - like a legendary rare Pokemon card
- Ken Sugimori inspired artwork - nostalgic and iconic

COMPOSITION:
- LANDSCAPE 16:9 aspect ratio (wider than tall)
- Person prominently featured, face clearly visible and LARGE
- Face should take up at least 30-40% of the image
- Upper body or head/shoulders framing preferred
- Front-facing or 3/4 view (never profile or from behind)
- Room for comedic props and scene elements

ABSOLUTELY DO NOT:
- Create abstract art, surreal nightmare imagery, or body horror
- Distort the face beyond recognition or make it monstrous
- Make the person look ugly, scary, or disturbing
- Obscure, shrink, or hide the face
- Generate ANY text, words, letters, numbers, signs, labels, speech bubbles, or writing (AI text always looks wrong)
- Create photorealistic renders
- Make the person unidentifiable
- Use portrait/vertical orientation - MUST be landscape/horizontal`;

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

    const illustrationPrompt = `Create a HILARIOUS Pokemon trading card illustration of "${name}" as "${archetypeName}".

CRITICAL - NO TEXT IN IMAGE:
- NEVER generate ANY text, words, letters, numbers, labels, signs, or writing of any kind
- This includes: names, titles, speech bubbles, captions, watermarks, logos with text
- AI-generated text always looks wrong - avoid it completely
- The image should be PURELY visual with no readable characters

THE HILARIOUS SCENE:
- Depict ${name} in a comedic scene as "${archetypeName}"
- The roast concept: "${archetypeDescription}"
- Show them DOING something funny that matches their archetype
- Include props, items, or background elements that tell the story
- Think "internet meme meets Pokemon card" - visually funny, shareable humor

MAKE THEM RECOGNIZABLE:
- If ${name} is a known figure, capture their recognizable features
- Exaggerate their distinctive traits for caricature effect
- The face should be the clear focal point even in a scene
- Fans should be able to identify who this is

ART STYLE (POKEMON TCG - CRITICAL):
- Classic 90s/2000s Pokemon trading card illustration style
- Hand-painted watercolor aesthetic with vibrant saturated colors
- Dynamic energy effects, magical auras, elemental powers
- ${element} element theme in colors and effects
- Premium collectible card quality - like a legendary rare Pokemon card
- Ken Sugimori inspired artwork - nostalgic and iconic

COMPOSITION:
- LANDSCAPE 16:9 aspect ratio (wider than tall)
- Person prominently featured, face clearly visible and LARGE
- Face should take up at least 30-40% of the image
- Upper body or head/shoulders framing preferred
- Front-facing or 3/4 view (never profile or from behind)
- Room for comedic props and scene elements

ABSOLUTELY DO NOT:
- Crop or cut off ANY part of the face
- Place the face at the edge of the frame
- Generate ANY text, words, letters, numbers, signs, labels, or writing (AI text always looks wrong)
- Use portrait/vertical orientation - MUST be landscape/horizontal
- Make it photorealistic
- Be mean-spirited (affectionate roasting, not cruel)`;

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
      { title: "Browse Lenny's Podcast", guest: "Various PM Leaders", reason: "Explore episodes on product and leadership" },
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

ARCHETYPE NAME RULES (VERY IMPORTANT):
- NEVER start with "The" - just the punchy title (e.g., "Rocket Tweeter" not "The Rocket Tweeter")
- Maximum 2-3 words, shorter is better
- Make it funny, meme-worthy, and specific to THIS person
- Should sound like a nickname their coworkers would use behind their back
- Examples: "Pivot King", "Safety Sage", "Chaos Merchant", "Tweet Deleter", "Vaporware Visionary"

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

CAREER SCORE - PM RELEVANCE SCORING (THIS IS CRITICAL AND FUNNY):
The score should reflect how good they would ACTUALLY be as a Product Manager. Being famous doesn't mean you'd be a good PM!

SCORING TIERS:
- 90-99: PM GODS ONLY. Reserved for: actual legendary PMs (Shreyas Doshi, Marty Cagan), founders who shipped iconic products (Steve Jobs, Brian Chesky), people who literally invented product management.
- 75-89: ELITE PM MATERIAL. Tech founders, successful product leaders, people who've shipped products used by millions. Must have actual product track record.
- 60-74: DECENT PM POTENTIAL. Tech executives, startup founders with some success, people who understand products even if not PMs.
- 40-59: QUESTIONABLE PM FIT. Famous in tech but not for product skills. Engineers who'd hate stakeholder meetings. VCs who've never shipped anything.
- 20-39: HILARIOUSLY BAD PM FIT. Celebrities, athletes, politicians, influencers. Use this tier for comedy! Imagine them in a sprint planning meeting.
- 0-19: ABSOLUTE CHAOS. People who would cause a P0 incident just by joining the standup. Use for maximum comedy.

EXAMPLES:
- Elon Musk: 70-80 (ships products but would be a nightmare PM to work with)
- Kim Kardashian: 25-35 (great at marketing herself, would derail every roadmap meeting)
- Joe Rogan: 15-25 (would turn every product review into a 3-hour podcast)
- LeBron James: 20-30 (elite competitor, zero PRD-writing skills)
- Satya Nadella: 80-88 (actual product leader who transformed Microsoft)
- A random TikTok influencer: 10-20 (would try to make the app "more aesthetic")

THE COMEDY IS IN THE HONESTY. If someone is totally irrelevant to PM work, give them a hilariously low score and roast WHY they'd be terrible at PM work.

Your response MUST be valid JSON with this exact structure (no markdown, no code blocks, just raw JSON):
{
  "userName": "Their FULL NAME as commonly known (e.g., 'Elon Musk', not just 'Elon')",
  "roastBullets": ["4 roasts based on their public persona, max 100 chars each. If non-PM, roast WHY they'd be a terrible PM!"],
  "archetype": {
    "name": "2-3 word punchy nickname, NO 'The' prefix (e.g., 'Rocket Tweeter' not 'The Rocket Tweeter')",
    "description": "A punchy description of their PM/tech persona (or lack thereof), 60-80 chars",
    "emoji": "Single emoji matching their vibe",
    "element": "data|chaos|strategy|shipping|politics|vision (pick the closest fit, even for non-tech people)",
    "flavor": "Nature-doc style observation about them, 60-80 chars",
    "stage": "Senior|Elite|Legendary|Mythical",
    "weakness": "1-2 word ironic weakness MAX (e.g., 'Meetings', 'Ship Dates', 'Deadlines')"
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
  "careerScore": 0-99 (based on PM RELEVANCE scoring above - be honest and funny!),
  "capabilities": {
    "productSense": 0-99 (would they actually understand user needs?),
    "execution": 0-99 (could they ship a product on time?),
    "leadership": 0-99 (could they lead a cross-functional team?)
  },
  "gaps": ["3 humorous gaps - for non-PM types, roast their actual PM skill gaps; for tech legends, use humble-brags or known quirks, max 60 chars each"],
  "roadmap": [
    {"month": 1, "title": "max 20 chars", "actions": ["2 actions that parody their actual career trajectory, max 40 chars each"]},
    {"month": 2, "title": "max 20 chars", "actions": ["2 more parody actions"]},
    {"month": 3, "title": "max 20 chars", "actions": ["2 more parody actions"]},
    {"month": 4, "title": "max 20 chars", "actions": ["2 more parody actions"]}
  ],
  "podcastEpisodes": [
    {"title": "REAL episode from Lenny's Podcast YouTube channel", "guest": "Actual guest from that episode", "reason": "Why relevant, max 50 chars"}
  ],
  IMPORTANT FOR podcastEpisodes: ONLY use episodes that ACTUALLY EXIST on Lenny's Podcast YouTube channel (@LennysPodcast). If this celebrity was a guest on Lenny's Podcast, use that episode. Otherwise use a thematically relevant episode with a real guest like Shreyas Doshi, Marty Cagan, Julie Zhuo, etc. If unsure, use {"title": "Browse Lenny's Podcast", "guest": "Various PM Leaders", "reason": "Explore episodes on product and leadership"}.
  "bangerQuote": "A quotable roast line about them that captures their essence. Max 140 chars.",
  "dreamRoleReaction": "Sarcastic verdict comparing them to the dream role they were aiming for. Max 80 chars.",
  "naturalRival": "Their known competitor or ironic nemesis. Max 60 chars."
}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, dreamRole, imageUrl, wikipediaExtract, reroll } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Invalid name provided" }, { status: 400 });
    }

    if (!dreamRole || !DREAM_ROLES[dreamRole as DreamRole]) {
      return NextResponse.json({ error: "Invalid dream role" }, { status: 400 });
    }

    const normalizedName = name.trim();
    const profileImageUrl = imageUrl || null;
    const wikiContext = wikipediaExtract || null;

    // Skip pre-generated cards if re-rolling - generate fresh AI roast instead
    if (!reroll) {
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
    }

    // Check Redis cache for previously generated celebrity roasts (skip if reroll)
    const cacheKey = `legend:${normalizedName.toLowerCase().replace(/\s+/g, "-")}`;

    if (!reroll) {
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
      careerScore: roastData.careerScore || 50,
      capabilities: roastData.capabilities || {
        productSense: 50,
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
