/**
 * Re-regenerate images that still have text issues
 * Run with: npx tsx scripts/regenerate-text-issues.ts
 */

import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Error: GEMINI_API_KEY not found in .env.local");
  process.exit(1);
}

const genAI = new GoogleGenAI({ apiKey });

// Images that still have text after first regeneration
const CARDS_WITH_TEXT = [
  {
    filename: "nikita-card.png",
    name: "The Teen Whisperer",
    element: "shipping",
    description: "A mischievous creature that understands viral growth"
  },
  {
    filename: "garry-tan-card.png",
    name: "The YC Revivalist",
    element: "shipping",
    description: "A determined warrior creature leading a charge"
  },
];

const ELEMENT_SETTINGS: Record<string, { bg: string; creature: string; colors: string }> = {
  shipping: {
    bg: "epic mountainside with sunrise and flying banners",
    creature: "determined fox-like warrior creature with glowing markings",
    colors: "sunrise orange, victory gold, and deep blue"
  },
};

async function generateImage(card: typeof CARDS_WITH_TEXT[0]): Promise<void> {
  console.log(`\nGenerating: ${card.filename} (${card.name})...`);

  const settings = ELEMENT_SETTINGS[card.element] || ELEMENT_SETTINGS.shipping;

  // Much simpler prompt to avoid text generation
  const prompt = `Create a Pokemon trading card style illustration of ${settings.creature}.

SCENE: The creature stands heroically on ${settings.bg}.
COLORS: ${settings.colors}
STYLE: Classic 90s Pokemon card art, hand-painted watercolor, vibrant colors

THE CREATURE: ${card.description}. Make it cute but determined, like a real Pokemon.

CRITICAL REQUIREMENTS:
1. LANDSCAPE 16:9 orientation (wider than tall)
2. Creature centered, taking 50-60% of frame
3. ABSOLUTELY ZERO TEXT - no words, letters, numbers, signs, labels, buttons, countdowns, or any writing whatsoever
4. No UI elements, no screens with text, no buttons with labels
5. Pure illustration only - like a painting with no text

This is the most important rule: THE IMAGE MUST CONTAIN ZERO TEXT OF ANY KIND.`;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: prompt,
      config: {
        responseModalities: ["Text", "Image"],
      },
    });

    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        const anyPart = part as { inlineData?: { mimeType: string; data: string } };
        if (anyPart.inlineData) {
          const outputPath = path.join(process.cwd(), "public", "famous", "generated", card.filename);
          const imageBuffer = Buffer.from(anyPart.inlineData.data, "base64");
          fs.writeFileSync(outputPath, imageBuffer);
          console.log(`  ✓ Saved: ${outputPath}`);
          return;
        }
      }
    }
    console.log(`  ⚠ Warning: No image generated for ${card.filename}`);
  } catch (error) {
    console.error(`  ✗ Error generating ${card.filename}:`, error);
  }
}

async function main() {
  console.log("=== Re-regenerating Images with Text Issues ===\n");

  for (const card of CARDS_WITH_TEXT) {
    await generateImage(card);
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log("\n=== Done ===");
}

main().catch(console.error);
