/**
 * Script to generate card images for the example gallery
 * Run with: npx tsx scripts/generate-card-images.ts
 */

import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

console.log("API Key loaded:", process.env.GEMINI_API_KEY ? "Yes" : "No");

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Element settings for image generation - Pokemon style creatures
const ELEMENT_SETTINGS: Record<string, { bg: string; setting: string; creature: string; colors: string }> = {
  data: {
    bg: "glowing digital landscape with floating data streams and holographic charts",
    setting: "analyzing glowing data orbs floating around them",
    creature: "owl or fox with glowing digital patterns on fur/feathers",
    colors: "blue, cyan, and electric purple",
  },
  chaos: {
    bg: "swirling vortex of colors with scattered papers and sticky notes flying",
    setting: "juggling multiple glowing orbs while balancing on a spinning top",
    creature: "energetic monkey or squirrel with wild fur and sparking energy",
    colors: "red, orange, and electric yellow",
  },
  strategy: {
    bg: "ancient library with floating chess pieces and strategy maps",
    setting: "contemplating a glowing 3D chess board",
    creature: "wise elephant or tortoise with ancient runes on their skin",
    colors: "deep purple, gold, and forest green",
  },
  shipping: {
    bg: "rocket launch pad with stars and deployment confetti",
    setting: "riding a rocket or standing triumphantly on a launched product",
    creature: "determined wolf or falcon with sleek aerodynamic features",
    colors: "green, silver, and bright orange",
  },
  politics: {
    bg: "grand throne room with multiple factions represented",
    setting: "diplomatically mediating between different creature groups",
    creature: "charismatic lion or peacock with regal bearing",
    colors: "royal purple, gold, and deep red",
  },
  vision: {
    bg: "cosmic dreamscape with nebulas and floating islands of ideas",
    setting: "gazing into a crystal ball showing future possibilities",
    creature: "mystical phoenix or dragon with ethereal glowing features",
    colors: "iridescent rainbow, pink, and cosmic purple",
  },
};

// Cards to generate images for
const CARDS = [
  { name: "Rocketship Rider", description: "Joined pre-IPO, rode the wave, now thinks they're a genius.", element: "shipping", filename: "rocketship-rider.png" },
  { name: "Metric Monk", description: "Can quote every A/B test but hasn't talked to a user in months.", element: "data", filename: "metric-monk.png" },
  { name: "Factory Survivor", description: "Ships fast, questions later. Has PTSD from roadmap reviews.", element: "chaos", filename: "factory-survivor.png" },
  { name: "Strategic Visionary", description: "Actually gets it. Probably leaving for a founder role soon.", element: "vision", filename: "strategic-visionary.png" },
  { name: "PRD Perfectionist", description: "Documents everything, ships nothing. Confluence hall of fame.", element: "strategy", filename: "prd-perfectionist.png" },
  { name: "Chaos Navigator", description: "Thrives in ambiguity. May or may not know what they're building.", element: "chaos", filename: "chaos-navigator.png" },
  { name: "Demo Wizard", description: "Every demo is flawless. Production is another story entirely.", element: "politics", filename: "demo-wizard.png" },
  { name: "AI Bandwagoner", description: "Added 'AI-powered' to every PRD since ChatGPT launched.", element: "vision", filename: "ai-bandwagoner.png" },
  { name: "FAANG Escapee", description: "Left big tech for startup life. Misses free food daily.", element: "shipping", filename: "faang-escapee.png" },
];

async function generateImage(card: typeof CARDS[0]): Promise<Buffer | null> {
  const elementSettings = ELEMENT_SETTINGS[card.element];

  const prompt = `Generate a Pokemon-style creature illustration for a trading card. The creature represents the "${card.name}" archetype.

Creature personality: ${card.description}

CREATURE DESIGN:
- Create a cute but powerful creature inspired by a ${elementSettings.creature}
- The creature should be ${elementSettings.setting}
- Background: ${elementSettings.bg}
- Primary colors: ${elementSettings.colors}

COMPOSITION (CRITICAL):
- The creature must be CENTERED in the frame
- Show the FULL creature from head to feet/tail - no cropping
- The creature should take up 60-70% of the image
- Face and eyes must be clearly visible and expressive
- Portrait orientation, creature facing slightly toward viewer

ART STYLE (CRITICAL):
- Hand-drawn watercolor illustration style like classic Pokemon cards
- Soft edges with visible watercolor texture and paper grain
- Gentle color gradients and washes
- Slightly cel-shaded with soft shadows
- Whimsical and fantastical, suitable for a collectible card game
- Expressive eyes that convey the creature's personality

DO NOT:
- Cut off any part of the creature
- Use photorealistic style
- Add any text, labels, or words
- Make the creature too scary or aggressive`;

  try {
    console.log(`Generating image for: ${card.name}...`);

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: prompt,
      config: {
        responseModalities: ["Text", "Image"],
      },
    });

    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyPart = part as any;
        if (anyPart.inlineData) {
          console.log(`  ✓ Image generated for ${card.name}`);
          return Buffer.from(anyPart.inlineData.data, "base64");
        }
      }
    }

    console.log(`  ✗ No image data in response for ${card.name}`);
    return null;
  } catch (error) {
    console.error(`  ✗ Error generating ${card.name}:`, error);
    return null;
  }
}

async function main() {
  const outputDir = path.join(process.cwd(), "public", "cards");

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log("Generating card images...\n");

  for (const card of CARDS) {
    const outputPath = path.join(outputDir, card.filename);

    // Skip if image already exists
    if (fs.existsSync(outputPath)) {
      console.log(`Skipping ${card.name} - image already exists`);
      continue;
    }

    const imageBuffer = await generateImage(card);

    if (imageBuffer) {
      fs.writeFileSync(outputPath, imageBuffer);
      console.log(`  Saved to: ${outputPath}\n`);
    }

    // Rate limiting - wait between requests
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log("\nDone!");
}

main().catch(console.error);
