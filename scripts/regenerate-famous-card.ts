/**
 * Utility script to regenerate famous card images
 *
 * Usage: npx tsx scripts/regenerate-famous-card.ts <card-id>
 * Example: npx tsx scripts/regenerate-famous-card.ts dario-amodei
 *
 * Loads GEMINI_API_KEY from .env.local
 */

import { config } from 'dotenv';
import { readFileSync, writeFileSync, existsSync } from 'fs';

// Load environment variables from .env.local
config({ path: '.env.local' });
import { join } from 'path';

// Card data for regeneration - includes scene details for visual storytelling
const CARDS_TO_REGENERATE: Record<string, {
  name: string;
  archetypeName: string;
  archetypeDescription: string;
  element: string;
  wikipediaSearch: string;
  localImage?: string; // Fallback local image path
  sceneIdea: string; // Visual scene concept for the illustration
  moves: string[]; // Move names for additional context
}> = {
  'dario-amodei': {
    name: 'Dario Amodei',
    archetypeName: 'The Safety Sage',
    archetypeDescription: 'Left OpenAI because it wasn\'t safe enough, immediately built an even more powerful AI',
    element: 'strategy',
    wikipediaSearch: 'Dario Amodei',
    localImage: 'public/famous/dario.jpg',
    sceneIdea: 'Show him nervously building an even BIGGER AI robot while surrounded by safety signs and caution tape, looking ironically worried',
    moves: ['Safety Theater', 'Constitutional AI', 'Scaling Laws Lecture'],
  },
  'nikita-bier': {
    name: 'Nikita Bier',
    archetypeName: 'The Teen Whisperer',
    archetypeDescription: 'Has sold more apps to Facebook than most people have downloaded',
    element: 'shipping',
    wikipediaSearch: 'Nikita Bier',
    localImage: 'public/famous/nikita.jpg',
    sceneIdea: 'Show him surrounded by teenage phone zombies all using his apps, or juggling multiple app icons while teens worship him, money bags flying around',
    moves: ['Viral Loop', 'FOMO Generator', 'Teen Trend Detector'],
  },
  'yann-lecun': {
    name: 'Yann LeCun',
    archetypeName: 'The Godfather of Deep Learning',
    archetypeDescription: 'Was building neural networks before it was cool, and won\'t let you forget it',
    element: 'data',
    wikipediaSearch: 'Yann LeCun',
    localImage: 'public/famous/yann-lecun.jpg',
    sceneIdea: 'Show him as an old-school godfather figure with neural network diagrams as "family photos", lecturing younger AI researchers, looking smug about his early contributions',
    moves: ['Backpropagation Blast', 'Convolutional Crush', 'Meta Reality Check'],
  },
};

async function getWikipediaImage(searchQuery: string): Promise<string | null> {
  try {
    // Search for the person on Wikipedia
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&format=json&origin=*`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.query?.search?.length) {
      console.log('No Wikipedia page found');
      return null;
    }

    const pageTitle = searchData.query.search[0].title;
    console.log(`Found Wikipedia page: ${pageTitle}`);

    // Get the page image
    const pageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&piprop=original&format=json&origin=*`;
    const pageResponse = await fetch(pageUrl);
    const pageData = await pageResponse.json();

    const pages = pageData.query?.pages;
    if (!pages) return null;

    const page = Object.values(pages)[0] as { original?: { source?: string } };
    const imageUrl = page?.original?.source;

    if (imageUrl) {
      console.log(`Found image: ${imageUrl}`);
      return imageUrl;
    }

    return null;
  } catch (error) {
    console.error('Error fetching Wikipedia image:', error);
    return null;
  }
}

async function fetchImageAsBase64(imageUrl: string): Promise<{ data: string; mimeType: string } | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return null;

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    return { data: base64, mimeType: contentType };
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
}

function loadLocalImage(imagePath: string): { data: string; mimeType: string } | null {
  try {
    const fullPath = join(process.cwd(), imagePath);
    if (!existsSync(fullPath)) {
      console.log(`Local image not found: ${fullPath}`);
      return null;
    }

    const imageBuffer = readFileSync(fullPath);
    const base64 = imageBuffer.toString('base64');

    // Determine mime type from extension
    const ext = imagePath.toLowerCase().split('.').pop();
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

    console.log(`Loaded local image: ${fullPath}`);
    return { data: base64, mimeType };
  } catch (error) {
    console.error('Error loading local image:', error);
    return null;
  }
}

async function generateCardImage(
  name: string,
  archetypeName: string,
  archetypeDescription: string,
  element: string,
  profileImageBase64: { data: string; mimeType: string },
  sceneIdea: string,
  moves: string[]
): Promise<string | null> {
  const { GoogleGenAI } = await import('@google/genai');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }

  const genAI = new GoogleGenAI({ apiKey });

  const prompt = `Create a HILARIOUS MEME-STYLE trading card illustration of THIS EXACT PERSON as "${archetypeName}".

THE ROAST CONCEPT - THIS IS THE JOKE:
"${archetypeDescription}"

SCENE IDEA (use this for visual inspiration):
${sceneIdea}

THEIR SIGNATURE MOVES (for context): ${moves.join(', ')}

SHOW THEM IN ACTION - NOT JUST A HEADSHOT:
- Depict ${name} DOING something funny that matches their roast archetype
- Show them in a comedic scene or situation that illustrates the joke above
- Include props, items, or background elements that tell the story of their roast
- Think "internet meme meets Pokemon card" - visually funny, shareable humor
- The scene should make someone laugh when they see it

CRITICAL - FACIAL LIKENESS (MUST BE RECOGNIZABLE):
- ${name} MUST be IMMEDIATELY RECOGNIZABLE - this is essential!
- Copy their EXACT face from the reference photo: eye shape, nose, lips, face shape, jawline, skin tone
- Keep their distinctive features: glasses, facial hair, hairstyle, any expressions they're known for
- The face should be the clear focal point even in the scene
- Do NOT beautify or idealize - their real features make it funnier!

CARD-FRIENDLY COMPOSITION:
- PORTRAIT aspect ratio (taller than wide) - this will be cropped to fit a trading card
- Face should be prominent and fill at least 35-45% of the frame
- Upper body and scene context visible
- Leave some margin at edges for card border cropping
- Subject centered or slightly off-center for dynamic composition

STYLE:
- Bold, vibrant, saturated colors - eye-catching and fun
- Stylized cartoon/illustration style (NOT photorealistic, NOT anime)
- Comic book energy with dynamic poses and expressions
- ${element} element theme in colors and effects
- Trading card collectible quality - premium and polished

ABSOLUTELY NO TEXT:
- NEVER generate ANY text, words, letters, numbers, or writing anywhere in the image

DO NOT:
- Make it a boring headshot or passport photo
- Make the face too small or unrecognizable
- Use landscape/wide framing
- Make it photorealistic or uncanny valley
- Lose the facial likeness - they MUST be recognizable
- Be mean-spirited (affectionate roasting, not cruel)`;

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-exp-image-generation',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: profileImageBase64.mimeType,
                data: profileImageBase64.data,
              },
            },
            { text: prompt },
          ],
        },
      ],
      config: {
        responseModalities: ['Text', 'Image'],
      },
    });

    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        const anyPart = part as { inlineData?: { mimeType: string; data: string } };
        if (anyPart.inlineData) {
          return anyPart.inlineData.data;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
}

async function main() {
  const cardId = process.argv[2];

  if (!cardId) {
    console.log('Usage: npx ts-node scripts/regenerate-famous-card.ts <card-id>');
    console.log('Available cards:', Object.keys(CARDS_TO_REGENERATE).join(', '));
    process.exit(1);
  }

  const card = CARDS_TO_REGENERATE[cardId];
  if (!card) {
    console.error(`Unknown card ID: ${cardId}`);
    console.log('Available cards:', Object.keys(CARDS_TO_REGENERATE).join(', '));
    process.exit(1);
  }

  console.log(`\nRegenerating card for: ${card.name}`);
  console.log('='.repeat(50));

  // Step 1: Try Wikipedia image, fall back to local
  console.log('\n1. Fetching source image...');
  let imageBase64: { data: string; mimeType: string } | null = null;

  const wikiImageUrl = await getWikipediaImage(card.wikipediaSearch);
  if (wikiImageUrl) {
    console.log('\n2. Downloading Wikipedia image...');
    imageBase64 = await fetchImageAsBase64(wikiImageUrl);
  }

  // Fallback to local image if Wikipedia fails
  if (!imageBase64 && card.localImage) {
    console.log('\n2. Wikipedia image not available, using local image...');
    imageBase64 = loadLocalImage(card.localImage);
  }

  if (!imageBase64) {
    console.error('Could not load any source image for', card.name);
    process.exit(1);
  }

  // Step 3: Generate card image
  console.log('\n3. Generating card image with Gemini...');
  console.log(`   Scene: ${card.sceneIdea}`);
  const generatedImage = await generateCardImage(
    card.name,
    card.archetypeName,
    card.archetypeDescription,
    card.element,
    imageBase64,
    card.sceneIdea,
    card.moves
  );

  if (!generatedImage) {
    console.error('Failed to generate card image');
    process.exit(1);
  }

  // Step 4: Save to public folder
  const outputPath = join(process.cwd(), 'public', 'famous', 'generated', `${cardId}-card.png`);
  const imageBuffer = Buffer.from(generatedImage, 'base64');
  writeFileSync(outputPath, imageBuffer);

  console.log(`\n✅ Successfully regenerated card image!`);
  console.log(`Saved to: ${outputPath}`);
}

main().catch(console.error);
