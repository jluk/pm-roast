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

// Element settings for image generation
const ELEMENT_SETTINGS: Record<string, { bg: string; setting: string }> = {
  data: {
    bg: "blue-tinted office with glowing screens and data visualizations",
    setting: "surrounded by multiple monitors showing dashboards and metrics",
  },
  chaos: {
    bg: "busy startup environment with sticky notes and whiteboards everywhere",
    setting: "in the middle of a hectic open office with people rushing around",
  },
  strategy: {
    bg: "elegant executive boardroom with mahogany furniture",
    setting: "at a whiteboard covered in frameworks and strategy diagrams",
  },
  shipping: {
    bg: "modern tech office with deployment screens and green status lights",
    setting: "celebrating a product launch with confetti or shipping notifications",
  },
  politics: {
    bg: "corporate meeting room with glass walls and city skyline view",
    setting: "in a stakeholder meeting with executives around a conference table",
  },
  vision: {
    bg: "futuristic innovation lab with prototypes and concept boards",
    setting: "presenting a big vision on stage or at a product keynote",
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

  const prompt = `Generate a stylized illustration of a Product Manager character for a trading card. The character represents "${card.name}".

Character personality: ${card.description}

SCENE REQUIREMENT (CRITICAL):
Show the character ${elementSettings.setting}. The background should be a ${elementSettings.bg}.

Style requirements:
- Illustrated character portrait showing a PERSON (not abstract or emoji)
- Semi-realistic or stylized illustration style (like Hearthstone or trading card game art)
- Vibrant colors with dramatic lighting
- Professional but stylized appearance
- Show the character's personality through their expression and body language
- Professional attire appropriate for a tech PM
- Dynamic composition with the character as the clear focus
- No text, labels, or words in the image
- The scene should tell a story about who this PM archetype is`;

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
