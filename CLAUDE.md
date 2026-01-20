# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PM Roast - A "Linear-style" web app that provides brutally honest AI career coaching for product managers, powered by wisdom from 200+ Lenny's Podcast transcripts.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS v4, Shadcn/UI components
- **Animations**: Framer Motion
- **Font**: Geist Sans
- **AI Model**: Gemini Flash 2.0 via Google Generative AI SDK (free tier)
- **PDF Parsing**: pdf-parse

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
│   │   ├── roast/route.ts     # Main roast generation (PDF/text + Gemini)
│   │   ├── linkedin/route.ts  # LinkedIn profile scraping via Proxycurl
│   │   ├── website/route.ts   # Website scraping for portfolio URLs
│   │   ├── stats/route.ts     # Roast counter stats
│   │   └── og/route.tsx       # Dynamic OG image generation
│   ├── share/[data]/          # Shareable result pages
│   ├── globals.css            # Theme variables, Tailwind config
│   ├── layout.tsx             # Root layout with fonts, metadata
│   └── page.tsx               # Main page with multi-step flow
├── components/
│   ├── steps/
│   │   ├── AnalyzingLoader.tsx # Loading animation
│   │   └── Results.tsx        # Roast results display
│   ├── HoloCard.tsx           # Holographic card effect
│   ├── PokemonCard.tsx        # Pokemon-style card component
│   ├── InteractiveCard.tsx    # 3D tilt card interactions
│   ├── ExampleGallery.tsx     # Homepage card gallery
│   └── ui/                    # Shadcn/UI components
└── lib/
    ├── types.ts               # TypeScript types for roast result
    ├── linkedin.ts            # LinkedIn data parsing utilities
    ├── share.ts               # URL sharing/encoding utilities
    └── utils.ts               # cn() utility
```

## User Flow

1. **Input**: User provides LinkedIn URL, website URL, or uploads PDF resume
   - LinkedIn: Fetches profile via Proxycurl API
   - Website: Scrapes and extracts text content (e.g., jluk.me)
   - PDF: Parses resume text
2. **Goals**: User selects dream role (Founder, CPO, L6 FAANG, etc.) inline
3. **Analyzing**: Animated loading while Gemini analyzes profile
4. **Results**: Display roast, archetype card, career score, gaps, 6-month roadmap, podcast recommendations
5. **Share**: Generate shareable link with encoded result data

## API Routes

### `/api/roast`
- Accepts `multipart/form-data` with `file` (PDF), `profileText`, and `dreamRole`
- Parses PDF text using pdf-parse or uses provided profile text
- Calls Gemini Flash 2.0 with system prompt mimicking Lenny Rachitsky
- Returns structured JSON with roast, archetype, score, roadmap, etc.

### `/api/linkedin`
- Accepts `POST` with `{ url: "linkedin.com/in/..." }`
- Uses Proxycurl API to fetch profile data
- Returns profile text, quality assessment, and optional profile pic URL

### `/api/website`
- Accepts `POST` with `{ url: "example.com" }`
- Fetches and scrapes HTML content
- Extracts text, title, meta description
- Checks for PM-related keywords to assess content quality
- Returns `high`, `partial`, or error status

## Adding Shadcn Components

```bash
npx shadcn@latest add [component-name]
```
