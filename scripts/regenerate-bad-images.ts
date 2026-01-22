/**
 * Script to regenerate famous card images that have wrong dimensions or text
 * Run with: npx tsx scripts/regenerate-bad-images.ts
 *
 * Issues found:
 * - Portrait orientation (should be 16:9 landscape)
 * - Generated text in images (AI text looks bad)
 * - Wrong aspect ratios
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

// Element settings for image generation
const ELEMENT_SETTINGS: Record<string, { bg: string; setting: string; creature: string; colors: string; props: string }> = {
  data: {
    bg: "glowing crystal cave with floating holographic charts and data streams",
    setting: "surrounded by floating glowing orbs of data, analyzing patterns",
    creature: "mysterious creature with glowing eyes and digital patterns on its form",
    colors: "electric blue, cyan glow, and deep purple shadows",
    props: "floating crystals showing metrics, mystical dashboard runes"
  },
  chaos: {
    bg: "swirling vortex dimension with multiple portals and chaotic energy",
    setting: "surfing on a wave of notifications while juggling multiple glowing objects",
    creature: "wild-eyed creature crackling with chaotic energy, fur standing on end",
    colors: "hot pink, electric orange, warning red, and purple lightning",
    props: "floating notification bubbles, swirling task tornados"
  },
  strategy: {
    bg: "ancient temple library with floating scrolls and mystical strategy boards",
    setting: "contemplating a glowing 3D chess board hovering in midair",
    creature: "wise sage-like creature with ancient markings and knowing eyes",
    colors: "royal purple, gold accents, and mystical green glow",
    props: "floating framework scrolls, glowing 2x2 matrices"
  },
  shipping: {
    bg: "rocket launch platform with countdown displays and epic deployment energy",
    setting: "dramatically pressing a giant glowing launch button as rockets ignite",
    creature: "determined warrior creature with battle scars and intense focus",
    colors: "launch orange, victory green, and midnight blue",
    props: "countdown holographics, feature flag banners"
  },
  politics: {
    bg: "grand hall with multiple faction banners and political intrigue",
    setting: "standing confidently between two opposing groups",
    creature: "charming trickster creature with a knowing smirk",
    colors: "royal gold, power red, and alliance purple",
    props: "floating alliance symbols, relationship web threads"
  },
  vision: {
    bg: "cosmic dreamscape with nebulas and floating islands of ideas",
    setting: "floating in space surrounded by visions of possible futures",
    creature: "ethereal visionary creature with starlight in its eyes",
    colors: "dream pink, cosmic purple, and infinite blue gradient",
    props: "floating future visions, reality distortion waves"
  },
};

// Cards that need regeneration with their data
const CARDS_TO_REGENERATE = [
  // Portrait orientation issues + text
  { filename: "balaji-srinivasan-card.png", name: "The Network State Prophet", element: "chaos", description: "Predicting the future so hard he's building it himself" },
  { filename: "dario-card.png", name: "The Safety Sage", element: "strategy", description: "Left OpenAI because it wasn't safe enough, immediately built an even more powerful AI" },
  { filename: "jason-calacanis-card.png", name: "The Hustle Historian", element: "politics", description: "Turned 'knowing everyone' into a legitimate investment strategy" },
  { filename: "julie-zhuo-card.png", name: "The Design Diplomat", element: "strategy", description: "Made design management into a discipline people actually respect" },
  { filename: "kent-c-dodds-card.png", name: "The Testing Evangelist", element: "shipping", description: "Made people actually want to write tests, which is a miracle" },
  { filename: "nikita-card.png", name: "The Teen Whisperer", element: "shipping", description: "Has sold more apps to Facebook than most people have downloaded" },
  { filename: "yann-lecun-card.png", name: "The Godfather of Deep Learning", element: "data", description: "Was building neural networks before it was cool" },

  // Wrong ratio + text issues
  { filename: "emad-mostaque-card.png", name: "The Open Source Oracle", element: "chaos", description: "Released Stable Diffusion and changed everything" },
  { filename: "jack-card.png", name: "The Zen Billionaire", element: "vision", description: "Meditates for 2 hours daily while his platforms burn" },
  { filename: "jason-fried-card.png", name: "The Anti-Hustle Hustler", element: "vision", description: "Made 'work less, charge more' into a whole philosophy" },
  { filename: "mark-card.png", name: "The Metaverse Missionary", element: "data", description: "Spent $50B trying to make people wear VR headsets" },
  { filename: "shreyas-doshi-card.png", name: "The Thread Lord", element: "strategy", description: "Turned product management wisdom into an art form" },
  { filename: "theo-browne-card.png", name: "The TypeScript Tornado", element: "chaos", description: "Turned strong opinions about JavaScript into a media empire" },
  { filename: "sundar-pichai-card.png", name: "The Careful Captain", element: "data", description: "Running the world's information, very carefully" },

  // Text issues (ratio close but has text)
  { filename: "brian-card.png", name: "The Design Dictator", element: "vision", description: "Believes every problem can be solved with better typography" },
  { filename: "lenny-card.png", name: "The PM Whisperer", element: "strategy", description: "Turned 'I got laid off' into a media empire by asking PMs about frameworks" },
  { filename: "naval-ravikant-card.png", name: "The Philosopher King", element: "strategy", description: "Turned wealth advice into a spiritual practice" },
  { filename: "sam-altman-card.png", name: "The AGI Whisperer", element: "vision", description: "Building the thing that might end humanity, but with good vibes" },
  { filename: "garry-tan-card.png", name: "The YC Revivalist", element: "shipping", description: "Brought the startup energy back to YC and hot takes to Twitter" },
  { filename: "packy-mccormick-card.png", name: "The Optimism Optimizer", element: "vision", description: "Made long-form business analysis exciting" },
];

async function generateImage(card: { filename: string; name: string; element: string; description: string }): Promise<void> {
  console.log(`\nGenerating: ${card.filename} (${card.name})...`);

  const elementSettings = ELEMENT_SETTINGS[card.element] || ELEMENT_SETTINGS.chaos;

  const prompt = `Generate a POKEMON TRADING CARD style creature illustration for "${card.name}" - ${elementSettings.creature}.

Character vibe: ${card.description}

SCENE (POKEMON TCG AESTHETIC):
- The creature is ${elementSettings.setting}
- Background: ${elementSettings.bg}
- Include magical props: ${elementSettings.props}
- Primary colors: ${elementSettings.colors}

CREATURE DESIGN:
- A ${elementSettings.creature}
- Original Pokemon-inspired creature design
- Expressive and full of personality
- Can be any fantastical creature - not limited to real animals
- Should feel like a real Pokemon you'd find in a game

IMAGE DIMENSIONS (CRITICAL - MUST FOLLOW):
- LANDSCAPE orientation - 16:9 aspect ratio (wider than tall)
- Creature must be CENTERED horizontally in the frame
- Show the full creature or from waist up - NOT a close-up face shot
- Leave breathing room on all sides - don't crop any part
- Creature takes up 50-60% of frame height, centered
- Background details visible on both sides

ART STYLE (CRITICAL - 90s/2000s POKEMON CARD):
- Classic Pokemon TCG illustration style
- Hand-painted watercolor aesthetic with soft edges
- Vibrant saturated colors, dynamic poses, magical energy effects
- Nostalgic collectible card game feel
- Premium quality, polished, memorable

ABSOLUTELY NO TEXT (CRITICAL):
- NEVER generate ANY text, words, letters, numbers, labels, signs, or writing
- NO logos, NO brand names, NO character names
- NO speech bubbles, NO captions, NO watermarks
- AI-generated text always looks wrong - avoid it completely
- This is the most important rule - NO TEXT OF ANY KIND

DO NOT:
- Cut off the creature's head, ears, or any body parts
- Make it photorealistic, 3D rendered, or AI-looking
- Generate ANY text, words, labels, signs, logos, or writing
- Make portrait/vertical orientation - MUST be landscape/horizontal
- Make it generic or boring`;

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
  console.log("=== Regenerating Bad Famous Card Images ===");
  console.log(`Found ${CARDS_TO_REGENERATE.length} images to regenerate\n`);

  // Process specific card if provided as argument
  const targetCard = process.argv[2];
  const cardsToProcess = targetCard
    ? CARDS_TO_REGENERATE.filter(c => c.filename.includes(targetCard))
    : CARDS_TO_REGENERATE;

  if (targetCard && cardsToProcess.length === 0) {
    console.log(`No cards found matching: ${targetCard}`);
    console.log("Available cards:", CARDS_TO_REGENERATE.map(c => c.filename).join(", "));
    return;
  }

  console.log(`Processing ${cardsToProcess.length} cards...`);

  for (const card of cardsToProcess) {
    await generateImage(card);
    // Delay between requests to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log("\n=== Regeneration Complete ===");
  console.log("Run 'npm run build' to verify the new images work correctly.");
}

main().catch(console.error);
