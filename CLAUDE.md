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
│   ├── famous-cards.ts        # Mt. Roastmore card definitions
│   ├── linkedin.ts            # LinkedIn data parsing utilities
│   ├── share.ts               # URL sharing/encoding utilities
│   └── utils.ts               # cn() utility
scripts/
└── generate-famous-cards.ts   # Generate AI card images for famous people
public/
└── famous/
    ├── generated/             # AI-generated card images
    └── *.jpg                  # Source profile photos
```

## API Routes

### `/api/roast`
- Accepts `multipart/form-data` with `file` (PDF), `profileText`, `dreamRole`, `profileImageBase64`
- Generates roast text via Gemini Flash 2.0
- Generates personalized card image via Gemini 2.0 Flash Exp (if profile photo provided)
- Falls back to Pokemon creature image if no photo
- Stores result in Vercel KV, returns `cardId` for permanent URL

### `/api/card-image`
- Standalone endpoint for generating card artwork
- Accepts `{ archetypeName, archetypeDescription, element }`
- Returns base64 image data

### `/api/linkedin`
- Accepts `POST` with `{ url: "linkedin.com/in/..." }`
- Uses Proxycurl API to fetch profile data
- Returns profile text, quality assessment, and profile pic URL

### `/api/website`
- Accepts `POST` with `{ url: "example.com" }`
- Scrapes HTML, extracts text and meta
- Checks for PM-related keywords

## Card System

### Rarity Tiers (based on career score)
- **Common** (0-40): Gray styling
- **Uncommon** (41-55): Blue styling
- **Rare** (56-70): Purple styling
- **Ultra Rare** (71-85): Pink styling
- **Rainbow Rare** (86-95): Animated gradient
- **Gold Crown** (96-100): Gold styling

### Card Components
- `HoloCard.tsx`: Base card with holographic shimmer effects, rarity-based styling
- `PokemonCard.tsx`: Card front with archetype, moves, stats, element typing
- `CardBack.tsx`: Card back with roast quote, stats, and rival info
- `InteractiveCard.tsx`: 3D tilt on hover, click to flip
- `CardModalContext.tsx`: Global modal provider for expanded flippable card view

### Elements (typing system)
- `data`, `chaos`, `strategy`, `shipping`, `politics`, `vision`
- Each has unique colors, backgrounds, and thematic props

## Mt. Roastmore (Famous Cards)

Pre-generated cards for 50+ famous tech/PM personalities displayed in a carousel on the homepage.

### Adding New Famous Cards
1. Add profile photo to `public/famous/`
2. Add card definition to `scripts/generate-famous-cards.ts` with creative scene description
3. Run: `npx tsx scripts/generate-famous-cards.ts [card-id]`
4. Update `src/lib/famous-cards.ts` with the new card data

## Image Generation Guidelines

**CRITICAL: Never generate text in images**
- AI-generated text always looks wrong
- All image generation prompts include explicit instructions to avoid text
- This applies to: `/api/roast`, `/api/card-image`, and `scripts/generate-famous-cards.ts`

### Prompt Requirements
- Preserve person's likeness (for personalized cards)
- Pokemon TCG art style (90s/2000s watercolor aesthetic)
- Landscape 16:9 aspect ratio
- Vibrant, saturated colors matching element type
- NO text, labels, words, signs, or writing of any kind

## Homepage Sections

The homepage has anchor-linked navigation to three main sections:
- `#roast-me` - Hero and input form
- `#mt-roastmore` - Famous Cards Gallery (curated celebrity PM cards)
- `#archetypes` - Example Gallery (archetype showcases)

## User Flow

1. **Input**: LinkedIn URL, website URL, or PDF resume
2. **Goals**: Select dream role (Founder, CPO, etc.)
3. **Analyzing**: Animated loading while Gemini generates roast + card image
4. **Results**: Bento Grid layout with flippable card (front/back), stats, roast, roadmap
5. **Share**: Permanent `/card/[id]` URL stored in Vercel KV

## Adding Shadcn Components

```bash
npx shadcn@latest add [component-name]
```
