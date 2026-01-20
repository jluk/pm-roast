/**
 * Script to generate card images for the homepage gallery
 * Run with: npx tsx scripts/generate-card-images.ts
 *
 * Requires GEMINI_API_KEY environment variable (loaded from .env.local)
 */

import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Error: GEMINI_API_KEY not found in .env.local");
  process.exit(1);
}

const genAI = new GoogleGenAI({ apiKey });

// Card definitions - Pokemon TCG nostalgic style with internet meme humor
const CARDS_TO_GENERATE = [
  {
    filename: "rocketship-rider.png",
    prompt: `Generate a POKEMON TRADING CARD style creature illustration for "Ship Lord" - a determined warrior creature.

SCENE (POKEMON TCG AESTHETIC):
- Standing on a rocket launch platform with epic deployment energy
- Background: launch pad with countdown displays, rockets igniting, dramatic sky
- Magical effects: deployment aurora, launch flames, feature flag banners glowing
- Primary colors: launch orange, victory green, midnight blue

CREATURE DESIGN:
- Fierce determined creature with battle-worn appearance and intense focus
- Glowing markings that pulse with shipping energy
- Warrior stance, ready to deploy
- Should feel like a Fire/Fighting type Pokemon

IMAGE DIMENSIONS (CRITICAL):
- LANDSCAPE orientation - 16:9 aspect ratio
- Creature CENTERED, shown from waist up
- Leave breathing room on all sides
- Creature takes up 50-60% of frame height

ART STYLE (CRITICAL - 90s/2000s POKEMON CARD):
- Classic Pokemon TCG illustration style - hand-painted watercolor aesthetic
- Soft edges, vibrant saturated colors, dynamic energy effects
- Nostalgic collectible card feel like Ken Sugimori art
- Premium quality, polished, memorable

DO NOT: Cut off any part, add text, make portrait orientation, photorealistic`
  },
  {
    filename: "metric-monk.png",
    prompt: `Generate a POKEMON TRADING CARD style creature illustration for "Metric Demon" - a mysterious data-obsessed creature.

SCENE (POKEMON TCG AESTHETIC):
- Inside a glowing crystal cave with floating holographic charts
- Background: data streams, floating metric orbs, analytical runes
- Magical effects: glowing spreadsheet tablets, dashboard crystals
- Primary colors: electric blue, cyan glow, deep purple shadows

CREATURE DESIGN:
- Mysterious creature with glowing eyes analyzing floating data
- Digital patterns on its form, wisdom emanating from it
- Scholarly pose, surrounded by information
- Should feel like a Psychic/Electric type Pokemon

IMAGE DIMENSIONS (CRITICAL):
- LANDSCAPE orientation - 16:9 aspect ratio
- Creature CENTERED, shown from waist up
- Leave breathing room on all sides
- Creature takes up 50-60% of frame height

ART STYLE (CRITICAL - 90s/2000s POKEMON CARD):
- Classic Pokemon TCG illustration style - hand-painted watercolor aesthetic
- Soft edges, vibrant saturated colors, magical glow effects
- Nostalgic collectible card feel
- Premium quality, polished, memorable

DO NOT: Cut off any part, add text, make portrait orientation, photorealistic`
  },
  {
    filename: "factory-survivor.png",
    prompt: `Generate a POKEMON TRADING CARD style creature illustration for "This Is Fine" - a chaotic creature thriving in disaster.

SCENE (POKEMON TCG AESTHETIC):
- Swirling vortex dimension with multiple portals and chaotic energy
- Background: notification bubbles flying, task tornados swirling
- Magical effects: fire everywhere but creature is calm, chaos magic
- Primary colors: hot pink, electric orange, warning red, purple lightning

CREATURE DESIGN:
- Wild-eyed creature crackling with chaotic energy
- Fur/feathers standing on end, embracing the chaos
- Manic grin, one eye twitching, riding the storm
- Should feel like a Fire/Chaos type Pokemon

IMAGE DIMENSIONS (CRITICAL):
- LANDSCAPE orientation - 16:9 aspect ratio
- Creature CENTERED, shown from waist up
- Leave breathing room on all sides
- Creature takes up 50-60% of frame height

ART STYLE (CRITICAL - 90s/2000s POKEMON CARD):
- Classic Pokemon TCG illustration style - hand-painted watercolor aesthetic
- Soft edges, vibrant saturated colors, chaotic energy effects
- Nostalgic collectible card feel
- Premium quality, polished, memorable

DO NOT: Cut off any part, add text, make portrait orientation, photorealistic`
  },
  {
    filename: "strategic-visionary.png",
    prompt: `Generate a POKEMON TRADING CARD style creature illustration for "Vision Quest" - an ethereal visionary creature.

SCENE (POKEMON TCG AESTHETIC):
- Cosmic dreamscape with nebulas and floating islands of ideas
- Background: visions of possible futures, reality-bending horizons
- Magical effects: hockey stick constellations, reality distortion waves
- Primary colors: dream pink, cosmic purple, infinite blue gradient

CREATURE DESIGN:
- Ethereal visionary creature with starlight in its eyes
- Cosmic energy flowing around it, gesturing at visions
- Confident mystical pose, commanding presence
- Should feel like a Psychic/Fairy type Pokemon

IMAGE DIMENSIONS (CRITICAL):
- LANDSCAPE orientation - 16:9 aspect ratio
- Creature CENTERED, shown from waist up
- Leave breathing room on all sides
- Creature takes up 50-60% of frame height

ART STYLE (CRITICAL - 90s/2000s POKEMON CARD):
- Classic Pokemon TCG illustration style - hand-painted watercolor aesthetic
- Soft edges, vibrant saturated colors, cosmic glow effects
- Nostalgic collectible card feel
- Premium quality, polished, memorable

DO NOT: Cut off any part, add text, make portrait orientation, photorealistic`
  },
  {
    filename: "prd-perfectionist.png",
    prompt: `Generate a POKEMON TRADING CARD style creature illustration for "PRD Goblin" - a wise strategy sage creature.

SCENE (POKEMON TCG AESTHETIC):
- Ancient temple library with floating scrolls and mystical strategy boards
- Background: glowing 2x2 matrices, framework scrolls, ancient tomes
- Magical effects: knowledge auras, strategy runes glowing
- Primary colors: royal purple, gold accents, mystical green

CREATURE DESIGN:
- Wise sage-like creature with ancient markings
- Knowing eyes, contemplating a glowing 3D strategy diagram
- Scholarly pose, surrounded by documentation magic
- Should feel like a Psychic/Normal type Pokemon

IMAGE DIMENSIONS (CRITICAL):
- LANDSCAPE orientation - 16:9 aspect ratio
- Creature CENTERED, shown from waist up
- Leave breathing room on all sides
- Creature takes up 50-60% of frame height

ART STYLE (CRITICAL - 90s/2000s POKEMON CARD):
- Classic Pokemon TCG illustration style - hand-painted watercolor aesthetic
- Soft edges, vibrant saturated colors, mystical effects
- Nostalgic collectible card feel
- Premium quality, polished, memorable

DO NOT: Cut off any part, add text, make portrait orientation, photorealistic`
  },
  {
    filename: "chaos-navigator.png",
    prompt: `Generate a POKEMON TRADING CARD style creature illustration for "Pivot Master" - an energetic chaos surfer creature.

SCENE (POKEMON TCG AESTHETIC):
- Swirling dimension of constant change with multiple paths diverging
- Background: crossed-out plans transforming, pivot portals opening
- Magical effects: direction-changing energy, meeting notification bubbles
- Primary colors: electric yellow, hot orange, chaos purple

CREATURE DESIGN:
- Hyperactive creature surfing on waves of change
- Wild energy crackling around it, excited expression
- Juggling multiple glowing project orbs
- Should feel like an Electric/Flying type Pokemon

IMAGE DIMENSIONS (CRITICAL):
- LANDSCAPE orientation - 16:9 aspect ratio
- Creature CENTERED, shown from waist up
- Leave breathing room on all sides
- Creature takes up 50-60% of frame height

ART STYLE (CRITICAL - 90s/2000s POKEMON CARD):
- Classic Pokemon TCG illustration style - hand-painted watercolor aesthetic
- Soft edges, vibrant saturated colors, dynamic motion effects
- Nostalgic collectible card feel
- Premium quality, polished, memorable

DO NOT: Cut off any part, add text, make portrait orientation, photorealistic`
  },
  {
    filename: "demo-wizard.png",
    prompt: `Generate a POKEMON TRADING CARD style creature illustration for "Stakeholder Whisperer" - a charming diplomat creature.

SCENE (POKEMON TCG AESTHETIC):
- Grand Pokemon League hall with multiple faction banners
- Background: alliance symbols, political intrigue, relationship webs
- Magical effects: influence auras, persuasion sparkles, diplomacy magic
- Primary colors: royal gold, power red, alliance purple

CREATURE DESIGN:
- Charming trickster creature with a knowing smirk
- Standing confidently between opposing energies
- Diplomatic pose, playing both sides skillfully
- Should feel like a Normal/Fairy type Pokemon

IMAGE DIMENSIONS (CRITICAL):
- LANDSCAPE orientation - 16:9 aspect ratio
- Creature CENTERED, shown from waist up
- Leave breathing room on all sides
- Creature takes up 50-60% of frame height

ART STYLE (CRITICAL - 90s/2000s POKEMON CARD):
- Classic Pokemon TCG illustration style - hand-painted watercolor aesthetic
- Soft edges, vibrant saturated colors, subtle magic effects
- Nostalgic collectible card feel
- Premium quality, polished, memorable

DO NOT: Cut off any part, add text, make portrait orientation, photorealistic`
  },
  {
    filename: "ai-bandwagoner.png",
    prompt: `Generate a POKEMON TRADING CARD style creature illustration for "AI Pilled" - an enthusiastic tech hype creature.

SCENE (POKEMON TCG AESTHETIC):
- Futuristic dimension with AI symbols and neural network patterns everywhere
- Background: floating buzzword bubbles, trend waves, hype energy
- Magical effects: rainbow gradients, sparkle overload, trend surfing
- Primary colors: iridescent rainbow, trendy gradient, hype pink

CREATURE DESIGN:
- Bright enthusiastic creature radiating excitement
- Sparkles in eyes, true believer energy
- Wings/arms spread showing off the latest thing
- Should feel like a Fairy/Electric type Pokemon

IMAGE DIMENSIONS (CRITICAL):
- LANDSCAPE orientation - 16:9 aspect ratio
- Creature CENTERED, shown from waist up
- Leave breathing room on all sides
- Creature takes up 50-60% of frame height

ART STYLE (CRITICAL - 90s/2000s POKEMON CARD):
- Classic Pokemon TCG illustration style - hand-painted watercolor aesthetic
- Soft edges, vibrant saturated colors, sparkle effects
- Nostalgic collectible card feel
- Premium quality, polished, memorable

DO NOT: Cut off any part, add text, make portrait orientation, photorealistic`
  },
  {
    filename: "faang-escapee.png",
    prompt: `Generate a POKEMON TRADING CARD style creature illustration for "Ex-FAANG Energy" - a noble creature adapting to new territory.

SCENE (POKEMON TCG AESTHETIC):
- Transitional dimension between a grand palace and humble grasslands
- Background: fading corporate castle, new startup plains ahead
- Magical effects: scale memories floating, process scrolls fading
- Primary colors: corporate blue fading to scrappy green, nostalgia gold

CREATURE DESIGN:
- Noble creature with remnants of former glory
- Dignified but adapting, slightly wistful expression
- Mix of proud bearing and humble acceptance
- Should feel like a Normal/Ground type Pokemon

IMAGE DIMENSIONS (CRITICAL):
- LANDSCAPE orientation - 16:9 aspect ratio
- Creature CENTERED, shown from waist up
- Leave breathing room on all sides
- Creature takes up 50-60% of frame height

ART STYLE (CRITICAL - 90s/2000s POKEMON CARD):
- Classic Pokemon TCG illustration style - hand-painted watercolor aesthetic
- Soft edges, vibrant saturated colors, transitional lighting
- Nostalgic collectible card feel
- Premium quality, polished, memorable

DO NOT: Cut off any part, add text, make portrait orientation, photorealistic`
  },
  {
    filename: "your-pm-card.png",
    prompt: `Generate a POKEMON TRADING CARD style MYSTERY illustration for "Your Inner PM" - a silhouetted unknown creature.

SCENE (POKEMON TCG MYSTERY AESTHETIC):
- Mysterious dimension with swirling question mark energy
- Background: unknown possibilities, identity clouds, reveal anticipation
- Magical effects: glowing question marks, mystery sparkles, potential energy
- Primary colors: deep mystery purple, anticipation blue, gold sparkles

CREATURE DESIGN:
- SILHOUETTE ONLY - dark shadowy form of an unknown creature
- Shape is ambiguous - could be any archetype
- Glowing question mark energy above/around it
- Inviting mystery vibe - discover YOUR true form

IMAGE DIMENSIONS (CRITICAL):
- LANDSCAPE orientation - 16:9 aspect ratio
- Silhouette CENTERED, shown from waist up
- Leave breathing room on all sides
- Figure takes up 50-60% of frame height

ART STYLE (CRITICAL - 90s/2000s POKEMON CARD):
- Classic Pokemon TCG illustration style - mysterious atmosphere
- Soft edges, deep colors, magical mystery glow
- Nostalgic collectible card feel
- Premium quality, intriguing, memorable

DO NOT: Show actual creature details (keep mystery), add text, make portrait orientation`
  }
];

async function generateImage(prompt: string, filename: string): Promise<void> {
  console.log(`\nGenerating: ${filename}...`);

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: prompt,
      config: {
        responseModalities: ["Text", "Image"],
      },
    });

    // Extract image from response
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        const anyPart = part as { inlineData?: { mimeType: string; data: string } };
        if (anyPart.inlineData) {
          // Save image to public/cards directory
          const outputPath = path.join(process.cwd(), "public", "cards", filename);
          const imageBuffer = Buffer.from(anyPart.inlineData.data, "base64");
          fs.writeFileSync(outputPath, imageBuffer);
          console.log(`  Saved: ${outputPath}`);
          return;
        }
      }
    }

    console.log(`  Warning: No image generated for ${filename}`);
  } catch (error) {
    console.error(`  Error generating ${filename}:`, error);
  }
}

async function main() {
  console.log("=== Card Image Generator ===");
  console.log(`Generating ${CARDS_TO_GENERATE.length} card images...\n`);

  // Ensure output directory exists
  const outputDir = path.join(process.cwd(), "public", "cards");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate images sequentially to avoid rate limits
  for (const card of CARDS_TO_GENERATE) {
    await generateImage(card.prompt, card.filename);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log("\n=== Generation Complete ===");
}

main().catch(console.error);
