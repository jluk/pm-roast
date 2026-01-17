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
│   │   └── roast/
│   │       └── route.ts      # PDF parsing + Claude API call
│   ├── globals.css           # Theme variables, Tailwind config
│   ├── layout.tsx            # Root layout with fonts, metadata
│   └── page.tsx              # Main page with multi-step flow
├── components/
│   ├── steps/
│   │   ├── GoalSelector.tsx  # Dream role selection step
│   │   ├── AnalyzingLoader.tsx # Loading animation
│   │   └── Results.tsx       # Roast results display
│   └── ui/                   # Shadcn/UI components
└── lib/
    ├── types.ts              # TypeScript types for roast result
    └── utils.ts              # cn() utility
```

## User Flow

1. **Upload**: User uploads PDF resume (LinkedIn URL coming soon)
2. **Goals**: User selects dream role (Founder, CPO, L6 FAANG, etc.)
3. **Analyzing**: Animated loading while Claude analyzes resume
4. **Results**: Display roast, archetype, career score, gaps, 6-month roadmap, podcast recommendations

## API Route (`/api/roast`)

- Accepts `multipart/form-data` with `file` (PDF) and `dreamRole`
- Parses PDF text using pdf-parse
- Calls Gemini Flash 2.0 with system prompt mimicking Lenny Rachitsky
- Returns structured JSON with roast, archetype, score, roadmap, etc.

## Adding Shadcn Components

```bash
npx shadcn@latest add [component-name]
```
