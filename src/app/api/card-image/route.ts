import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { PMElement } from "@/lib/types";

const genAINew = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const ELEMENT_SETTINGS: Record<PMElement, { bg: string; setting: string; creature: string; colors: string; props: string }> = {
  data: {
    bg: "glowing crystal cave with floating holographic charts and data streams, Pokemon TCG style",
    setting: "surrounded by floating glowing orbs of data, analyzing patterns in the air",
    creature: "mysterious creature with glowing eyes and digital patterns on its form",
    colors: "electric blue, cyan glow, and deep purple shadows",
    props: "floating crystals showing metrics, mystical dashboard runes, glowing spreadsheet tablets"
  },
  chaos: {
    bg: "swirling vortex dimension with multiple portals and chaotic energy, classic Pokemon battle arena",
    setting: "surfing on a wave of notifications while juggling multiple glowing objects",
    creature: "wild-eyed creature crackling with chaotic energy, fur/feathers standing on end",
    colors: "hot pink, electric orange, warning red, and purple lightning",
    props: "floating notification bubbles, swirling task tornados, coffee cup meteors"
  },
  strategy: {
    bg: "ancient temple library with floating scrolls and mystical strategy boards, Pokemon Gym aesthetic",
    setting: "contemplating a glowing 3D chess board hovering in midair",
    creature: "wise sage-like creature with ancient markings and knowing eyes",
    colors: "royal purple, gold accents, and mystical green glow",
    props: "floating framework scrolls, glowing 2x2 matrices, ancient strategy tomes"
  },
  shipping: {
    bg: "rocket launch platform with countdown displays and epic deployment energy, Pokemon Stadium vibes",
    setting: "dramatically pressing a giant glowing launch button as rockets ignite",
    creature: "determined warrior creature with battle scars and intense focus",
    colors: "launch orange, victory green, and midnight blue",
    props: "countdown holographics, feature flag banners, deployment aurora effects"
  },
  politics: {
    bg: "grand Pokemon League hall with multiple faction banners and political intrigue",
    setting: "standing confidently between two opposing groups, playing both sides",
    creature: "charming trickster creature with a knowing smirk and diplomatic pose",
    colors: "royal gold, power red, and alliance purple",
    props: "floating alliance symbols, relationship web threads, influence auras"
  },
  vision: {
    bg: "cosmic dreamscape with nebulas, floating islands, and reality-bending horizons",
    setting: "floating in space surrounded by visions of possible futures",
    creature: "ethereal visionary creature with starlight in its eyes and cosmic energy",
    colors: "dream pink, cosmic purple, and infinite blue gradient",
    props: "floating future visions, hockey stick constellations, reality distortion waves"
  },
};

// Generate archetype image using Gemini
async function generateArchetypeImage(
  archetypeName: string,
  archetypeDescription: string,
  element: PMElement
): Promise<string | null> {
  try {
    const elementSettings = ELEMENT_SETTINGS[element] || ELEMENT_SETTINGS.chaos;

    console.log("=== GENERATING POKEMON-STYLE CREATURE IMAGE ===");

    const imagePrompt = `Generate a POKEMON TRADING CARD style creature illustration. The character is "${archetypeName}" - ${elementSettings.creature}.

Character vibe: ${archetypeDescription}

SCENE (POKEMON TCG AESTHETIC):
- The creature is ${elementSettings.setting}
- Background: ${elementSettings.bg}
- Include magical props: ${elementSettings.props}
- Primary colors: ${elementSettings.colors}

CREATURE DESIGN:
- A ${elementSettings.creature}
- Original Pokemon-inspired creature design
- Expressive and full of personality - internet meme energy
- Can be any fantastical creature - not limited to real animals
- Should feel like a real Pokemon you'd find in a game

IMAGE DIMENSIONS (CRITICAL):
- LANDSCAPE orientation - 16:9 aspect ratio (wider than tall)
- Creature must be CENTERED horizontally in the frame
- Show the full creature or from waist up - NOT a close-up face shot
- Leave breathing room on all sides - don't crop any part of the creature
- Creature takes up 50-60% of frame height, centered
- Background details visible on both sides

ART STYLE (CRITICAL - POKEMON TCG NOSTALGIC):
- Classic Pokemon trading card illustration style from the 90s/2000s
- Hand-painted watercolor aesthetic with soft edges and texture
- Vibrant saturated colors, dynamic poses, magical energy effects
- Nostalgic collectible card game feel - like Ken Sugimori meets trading card art
- Premium quality - polished, engaging, and memorable
- Should evoke nostalgia for classic Pokemon cards

CRITICAL - NO TEXT:
- NEVER generate ANY text, words, letters, numbers, labels, signs, or writing
- AI-generated text always looks wrong - avoid it completely

DO NOT:
- Cut off the creature's head, ears, or any body parts
- Make it photorealistic, 3D rendered, or AI-looking
- Generate any text, words, labels, signs, or writing of any kind
- Make portrait/vertical orientation - MUST be landscape/horizontal
- Make it generic or boring - should have personality and charm`;

    const response = await genAINew.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: imagePrompt,
      config: {
        responseModalities: ["Text", "Image"],
      },
    });

    console.log("Response received");

    // Check for image in response
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyPart = part as any;
        if (anyPart.inlineData) {
          console.log("=== IMAGE GENERATED ===");
          return `data:${anyPart.inlineData.mimeType};base64,${anyPart.inlineData.data}`;
        }
      }
    }

    console.log("No image data found in response");
    return null;
  } catch (error) {
    console.error("Failed to generate archetype image:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { archetypeName, archetypeDescription, element } = body;

    if (!archetypeName || !element) {
      return NextResponse.json(
        { error: "Missing required fields: archetypeName, element" },
        { status: 400 }
      );
    }

    const image = await generateArchetypeImage(
      archetypeName,
      archetypeDescription || archetypeName,
      element as PMElement
    );

    if (!image) {
      return NextResponse.json(
        { error: "Failed to generate image" },
        { status: 500 }
      );
    }

    return NextResponse.json({ image });
  } catch (error) {
    console.error("Card image API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
