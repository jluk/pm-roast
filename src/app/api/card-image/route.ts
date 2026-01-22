import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { PMElement } from "@/lib/types";
import { ELEMENT_SETTINGS } from "@/lib/image-generation";

const genAINew = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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

CRITICAL - NO TEXT IN IMAGE:
- NEVER generate ANY text, words, letters, numbers, labels, signs, or writing of any kind
- This includes: names, titles, speech bubbles, captions, watermarks, logos with text
- AI-generated text always looks wrong - avoid it completely
- The image should be PURELY visual with no readable characters

ABSOLUTELY DO NOT:
- Cut off the creature's head, ears, or any body parts
- Make it photorealistic, 3D rendered, or AI-looking
- Generate ANY text, words, letters, numbers, signs, labels, speech bubbles, or writing (AI text always looks wrong)
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
