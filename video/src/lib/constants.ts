// Video settings
export const VIDEO_WIDTH = 1920;
export const VIDEO_HEIGHT = 1080;
export const FPS = 30;
export const DURATION_FRAMES = 720; // 24 seconds

// Scene timings (in frames)
export const SCENE_TIMINGS = {
  intro: { start: 0, end: 89 },      // 3s
  loader: { start: 90, end: 209 },   // 4s
  packOpen: { start: 210, end: 389 }, // 6s
  cardReveal: { start: 390, end: 569 }, // 6s
  holoShowcase: { start: 570, end: 659 }, // 3s
  cta: { start: 660, end: 719 },     // 2s
} as const;

// Colors
export const COLORS = {
  background: '#09090b',
  accent: '#6366f1',
  gold: '#ffd700',
  white: '#ffffff',
  textMuted: '#a1a1aa',
} as const;

// Card data for reveals
export const FEATURED_CARDS = [
  {
    id: 'demis',
    name: 'Demis Hassabis',
    score: 99,
    rarity: 'Mythical',
    image: 'famous/sv/generated/demis-card.png',
  },
  {
    id: 'brian',
    name: 'Brian Chesky',
    score: 94,
    rarity: 'Legendary',
    image: 'famous/sv/generated/brian-card.png',
  },
  {
    id: 'lenny',
    name: 'Lenny Rachitsky',
    score: 88,
    rarity: 'Elite',
    image: 'famous/sv/generated/lenny-card.png',
  },
  {
    id: 'jensen',
    name: 'Jensen Huang',
    score: 96,
    rarity: 'Legendary',
    image: 'famous/sv/generated/jensen-huang-card.png',
  },
] as const;

// Loader stages
export const LOADER_STAGES = [
  { emoji: '🔍', label: 'Profile Scanner' },
  { emoji: '🧠', label: 'Career Analyzer' },
  { emoji: '🎯', label: 'Weakness Detector' },
  { emoji: '⚡', label: 'Power Calculator' },
  { emoji: '🃏', label: 'Archetype Matcher' },
  { emoji: '🔥', label: 'Card Forge' },
] as const;
