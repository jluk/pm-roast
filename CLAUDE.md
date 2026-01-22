# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PM Roast - A "Linear-style" web app that provides brutally honest AI career coaching for product managers, powered by wisdom from 200+ Lenny's Podcast transcripts. Users get a personalized Pokemon TCG-style trading card with their PM archetype.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS v4, Shadcn/UI components
- **Animations**: Framer Motion
- **Font**: Geist Sans
- **AI Models**:
  - Gemini Flash 2.0 for text generation (roast analysis)
  - Gemini 2.0 Flash Exp for image generation (card artwork)
- **PDF Parsing**: pdf-parse
- **Card Storage**: Vercel KV (Redis) for permanent card URLs

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Run ESLint
```

## Environment Variables

Copy `.env.example` to `.env.local` and add your API key:
```
GEMINI_API_KEY=your_api_key_here
```

Get a free Gemini API key at: https://aistudio.google.com/app/apikey

## Design System

Dark mode by default:
- Background: `#09090b`
- Accent: `#6366f1` (Indigo)
- Components: Minimalist cards with subtle borders, glowing hover effects

CSS variables defined in `src/app/globals.css`

## Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── roast/route.ts     # Main roast generation (text + image via Gemini)
│   │   ├── card-image/route.ts # Standalone card image generation
│   │   ├── linkedin/route.ts  # LinkedIn profile scraping via Proxycurl
│   │   ├── website/route.ts   # Website scraping for portfolio URLs
│   │   ├── stats/route.ts     # Roast counter stats
│   │   └── og/route.tsx       # Dynamic OG image generation
│   ├── card/[id]/             # Permanent shareable card pages (KV storage)
│   ├── share/[data]/          # Legacy shareable result pages (URL-encoded)
│   ├── globals.css            # Theme variables, Tailwind config
│   ├── layout.tsx             # Root layout with fonts, metadata
│   └── page.tsx               # Main page with multi-step flow
├── components/
│   ├── steps/
│   │   ├── AnalyzingLoader.tsx # Loading animation
│   │   └── Results.tsx        # Bento Grid results with flippable card
│   ├── HoloCard.tsx           # Holographic card with rarity effects
│   ├── PokemonCard.tsx        # Pokemon-style card front
│   ├── CardBack.tsx           # Card back with roast summary
│   ├── CardModalContext.tsx   # Global modal for expanded card view
│   ├── InteractiveCard.tsx    # 3D tilt card with flip/modal
│   ├── FamousCardsGallery.tsx # Mt. Roastmore famous cards gallery
│   ├── ExampleGallery.tsx     # Archetype examples gallery
│   └── ui/                    # Shadcn/UI components
├── lib/
│   ├── types.ts               # TypeScript types for roast result
│   ├── famous-cards.ts        # Tech/SV Mt. Roastmore card definitions (50 cards)
│   ├── celebrity-cards.ts     # Celebrity Mt. Roastmore card definitions (50 cards)
│   ├── image-generation.ts    # Shared ELEMENT_SETTINGS for card image prompts
│   ├── linkedin.ts            # LinkedIn data parsing utilities
│   ├── share.ts               # URL sharing/encoding utilities
│   └── utils.ts               # cn() utility
scripts/
├── generate-famous-cards.ts   # Generate AI card images for SV/tech people
├── generate-celebrity-cards.ts # Generate AI card images for celebrities
├── download-profile-images.ts # Download SV profile photos from Twitter
└── download-celebrity-images.ts # Download celebrity photos from Wikipedia
public/
└── famous/
    ├── sv/                    # Silicon Valley / tech personalities
    │   ├── *.jpg              # Source profile photos
    │   └── generated/         # AI-generated card images
    └── celebrities/           # Entertainment / celebrity personalities
        ├── *.jpg              # Source profile photos
        └── generated/         # AI-generated card images
```

## API Routes

### `/api/roast`
- Accepts `multipart/form-data` with `file` (PDF), `profileText`, `dreamRole`, `profileImageBase64`
- Generates roast text via Gemini Flash 2.0
- Generates personalized card image via Gemini 2.0 Flash Exp (if profile photo provided)
- Falls back to Pokemon creature image if no photo
- Stores result in Vercel KV, returns `cardId` for permanent URL

### `/api/roast-legend`
- Generates roasts for famous people (celebrities, tech leaders, etc.)
- Accepts `{ name, dreamRole, reroll? }`
- First checks `famous-cards.ts` for pre-generated Mt. Roastmore cards
- If not found or `reroll=true`: generates via Gemini with Wikipedia image
- Caches AI-generated legend cards in Redis (30-day TTL)
- Uses scene-based image prompts for funny, meme-style illustrations

### `/api/verify-legend`
- Validates celebrity names via Wikipedia API
- Returns `{ isValid, name, description, imageUrl, wikipediaUrl }`
- Used for the legend verification UI before generating

### `/api/card-image`
- Standalone endpoint for generating card artwork
- Accepts `{ archetypeName, archetypeDescription, element }`
- Returns base64 image data
- Used for regenerating images on shared cards

### `/api/linkedin`
- Accepts `POST` with `{ url: "linkedin.com/in/..." }`
- Uses Proxycurl API to fetch profile data
- Returns profile text, quality assessment, and profile pic URL

### `/api/website`
- Accepts `POST` with `{ url: "example.com" }`
- Scrapes HTML, extracts text and meta
- Checks for PM-related keywords

### `/api/log-usage`
- Analytics tracking for user input types
- Categories: `legend`, `linkedin`, `portfolio`, `resume`, `manual`
- Sanitizes inputs (redacts LinkedIn usernames, extracts domains only)
- Stores daily counts in Vercel KV

### `/api/stats`
- GET: Returns total roast count
- POST: Increments roast counter (called after each successful roast)

## Card System

### Rarity Tiers (based on career score)
- **Common** (0-39): Subtle shine
- **Uncommon** (40-59): Radial effect
- **Rare** (60-74): Cosmic sparkle
- **Ultra** (75-84): Galaxy swirl
- **Rainbow** (85-94): Rainbow spectrum
- **Gold** (95-100): Gold shimmer

### Special Effects (90+ score)
Cards with 90+ score get additional effects:
- Holographic rainbow border (animated gradient)
- Floating sparkle particles (ExampleGallery)
- Enhanced glow effects

### Card Components
- `HoloCard.tsx`: Base card with holographic effects. Key props:
  - `rarity`: Controls effect intensity
  - `score`: 90+ triggers holographic border and sparkle
  - `disableScale`: Prevents hover scale (use for compact cards to avoid layout shift)
  - `disableEffects`: Renders children without any effects
- `PokemonCard.tsx`: Card front with archetype, moves, stats, element typing
  - Compact mode: fixed 300px width, full mode: 360-400px
- `CardBack.tsx`: Card back with roast quote, stats, and rival info
- `InteractiveCard.tsx`: 3D tilt on hover, click to flip
- `CardModalContext.tsx`: Global modal provider for expanded flippable card view

### Elements (typing system)
- `data`, `chaos`, `strategy`, `shipping`, `politics`, `vision`
- Each has unique colors, backgrounds, and thematic props

## Mt. Roastmore (Famous Cards)

Pre-generated cards for 100 famous personalities (50 tech + 50 celebrities) displayed on the homepage with pack selection UX.

### Card Sets
- **SV Cards** (`src/lib/famous-cards.ts`): 50 Silicon Valley / tech personalities
- **Celebrity Cards** (`src/lib/celebrity-cards.ts`): 50 entertainment / celebrity personalities

### Pack Selection
First row shows a mix of 2 tech + 2 celebrity cards. Users then choose a booster pack:
- **Chaos Pack** (red, 🎬): Reveals celebrity cards - "BOLD PULL!"
- **SV Pack** (blue, 💻): Reveals tech cards - "NERDY PULL!"

Selecting a pack reveals 4 more cards with flip animation. Cards with 90+ score get holographic border treatment.

### Adding New Cards

**For SV/Tech cards:**
1. Add profile photo to `public/famous/sv/`
2. Add card definition to `src/lib/famous-cards.ts`
3. Run: `npx tsx scripts/generate-famous-cards.ts <card-id>`

**For Celebrity cards:**
1. Add profile photo to `public/famous/celebrities/`
2. Add card definition to `src/lib/celebrity-cards.ts`
3. Run: `npx tsx scripts/generate-celebrity-cards.ts <card-id>`

### Generating Card Images

```bash
# Generate all SV card images
npx tsx scripts/generate-famous-cards.ts

# Generate specific SV cards
npx tsx scripts/generate-famous-cards.ts paul-graham marc-andreessen

# Generate all celebrity card images
npx tsx scripts/generate-celebrity-cards.ts

# Generate specific celebrity cards
npx tsx scripts/generate-celebrity-cards.ts john-cena dwayne-johnson
```

The scripts:
- Load GEMINI_API_KEY from `.env.local`
- Read source photo from `public/famous/{sv|celebrities}/`
- Generate scene-based illustration using archetype + creative scene prompt
- Save to `public/famous/{sv|celebrities}/generated/<card-id>-card.png`
- 3 second delay between generations to avoid rate limits

### Downloading Profile Images

```bash
# Download SV profile photos (from Twitter handles)
npx tsx scripts/download-profile-images.ts

# Download celebrity photos (from Wikipedia)
npx tsx scripts/download-celebrity-images.ts
```

### Card Data Structure
Both `famous-cards.ts` and `celebrity-cards.ts` share the same structure:
- `id`, `name`, `title`, `company`
- `imageUrl` - path to generated card image
- `archetypeName`, `archetypeDescription`, `archetypeEmoji`
- `element` (data/chaos/strategy/shipping/politics/vision)
- `moves[]` with name, energyCost, damage, effect
- `score`, `stage`, `weakness` (1-2 words max), `flavor`
- `roastBullets[]`, `bangerQuote`, `naturalRival`

### Generation Script Data Structure
The generation scripts (`generate-famous-cards.ts`, `generate-celebrity-cards.ts`) use:
- `id`, `name`, `sourceImage`, `outputImage`
- `archetypeName`, `element`
- `creativeScene` - detailed comedic scene description for the AI to illustrate

## Image Generation Guidelines

**CRITICAL: Never generate text in images**
- AI-generated text always looks wrong
- All image generation prompts include explicit instructions to avoid text

### Legend Images (Famous People)
Located in: `/api/roast-legend/route.ts`
- **With reference photo**: Meme-style scene showing person DOING something funny
- **Aspect ratio**: Portrait (for card format)
- **Face size**: 35-45% of frame, must be recognizable
- **Style**: Stylized cartoon with real facial likeness preserved
- **Scene-based**: Depicts the person in a comedic situation matching their roast archetype
- **Fallback (no photo)**: Caricature-style illustration

### Non-Legend Images (Regular Users)
Located in: `/api/roast/route.ts`
- **With profile photo**: Person in funny office scenario from `FUNNY_SCENARIOS` array
- **Aspect ratio**: Landscape 16:9
- **Style**: Illustrated/painted trading card style
- **Fallback (no photo)**: Pokemon-style CREATURE (not a person) representing archetype

### Key Differences
| Aspect | Legends | Non-Legends |
|--------|---------|-------------|
| Aspect ratio | Portrait | Landscape 16:9 |
| No-photo fallback | Caricature of person | Pokemon creature |
| Scene source | Custom per archetype | Random from array |

**TODO**: Consider unifying these to use same aspect ratio and scene approach.

## Homepage Sections

The homepage has anchor-linked navigation to three main sections:
- `#roast-me` - Hero and input form
- `#mt-roastmore` - Famous Cards Gallery (curated celebrity PM cards)
- `#archetypes` - Example Gallery (archetype showcases)

### Navigation State
- `activeSection` tracks which nav item is highlighted
- Intersection Observer updates state as user scrolls
- Hash navigation from other pages (e.g., `/card/[id]` to `/#mt-roastmore`) uses a `useEffect` with double `requestAnimationFrame` to scroll after React hydration completes

## User Flow

1. **Input**: LinkedIn URL, website URL, or PDF resume
2. **Goals**: Select dream role (Founder, CPO, etc.)
3. **Analyzing**: Animated loading while Gemini generates roast + card image
4. **Results**: Bento Grid layout with flippable card (front/back), stats, roast, roadmap
5. **Share**: Permanent `/card/[id]` URL stored in Vercel KV

## Testing

```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- path/to/test   # Run specific test file
```

### Test Files
Located in `__tests__/unit/`:
- `input-detection.test.ts` - Input type detection (LinkedIn, website, X, legend)
- `famous-cards.test.ts` - Famous cards search and data integrity
- `log-usage-sanitization.test.ts` - Privacy sanitization for analytics

## Adding Shadcn Components

```bash
npx shadcn@latest add [component-name]
```

## Input Detection Logic

The homepage detects input type to show appropriate UI:
- **LinkedIn**: Contains `linkedin.com`
- **X/Twitter**: Starts with `@` or contains `twitter.com`/`x.com`
- **Website**: Contains `.` or starts with `http`
- **Legend**: Two+ words OR single word with 5+ chars (e.g., "Grimes", "Madonna")

Detection order matters - URL patterns take priority over legend detection.
