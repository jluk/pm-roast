/**
 * Shared image generation settings and utilities
 * Used by: /api/roast, /api/roast-legend, /api/card-image
 */

import { PMElement } from "./types";

// Element-specific visual settings for Pokemon TCG-style card images
export const ELEMENT_SETTINGS: Record<PMElement, {
  bg: string;
  setting: string;
  creature: string;
  colors: string;
  props: string;
}> = {
  data: {
    bg: "glowing crystal cave with floating holographic charts and data streams, Pokemon TCG style",
    setting: "surrounded by floating glowing orbs of data, analyzing patterns in the air",
    creature: "mysterious creature with glowing eyes and digital patterns on its form",
    colors: "electric blue, cyan glow, and deep purple shadows",
    props: "floating crystals showing metrics, mystical dashboard runes, glowing spreadsheet tablets"
  },
  chaos: {
    bg: "swirling vortex dimension with multiple portals and chaotic energy, classic Pokemon battle arena",
    setting: "surfing on a wave of notifications while juggling multiple glowing objects",
    creature: "wild-eyed creature crackling with chaotic energy, fur/feathers standing on end",
    colors: "hot pink, electric orange, warning red, and purple lightning",
    props: "floating notification bubbles, swirling task tornados, coffee cup meteors"
  },
  strategy: {
    bg: "ancient temple library with floating scrolls and mystical strategy boards, Pokemon Gym aesthetic",
    setting: "contemplating a glowing 3D chess board hovering in midair",
    creature: "wise sage-like creature with ancient markings and knowing eyes",
    colors: "royal purple, gold accents, and mystical green glow",
    props: "floating framework scrolls, glowing 2x2 matrices, ancient strategy tomes"
  },
  shipping: {
    bg: "rocket launch platform with countdown displays and epic deployment energy, Pokemon Stadium vibes",
    setting: "dramatically pressing a giant glowing launch button as rockets ignite",
    creature: "determined warrior creature with battle scars and intense focus",
    colors: "launch orange, victory green, and midnight blue",
    props: "countdown holographics, feature flag banners, deployment aurora effects"
  },
  politics: {
    bg: "grand Pokemon League hall with multiple faction banners and political intrigue",
    setting: "standing confidently between two opposing groups, playing both sides",
    creature: "charming trickster creature with a knowing smirk and diplomatic pose",
    colors: "royal gold, power red, and alliance purple",
    props: "floating alliance symbols, relationship web threads, influence auras"
  },
  vision: {
    bg: "cosmic dreamscape with nebulas, floating islands, and reality-bending horizons",
    setting: "floating in space surrounded by visions of possible futures",
    creature: "ethereal visionary creature with starlight in its eyes and cosmic energy",
    colors: "dream pink, cosmic purple, and infinite blue gradient",
    props: "floating future visions, hockey stick constellations, reality distortion waves"
  },
};

// Element-specific color palettes for stylization
export const ELEMENT_COLORS: Record<PMElement, string> = {
  vision: "dream pink, cosmic purple, infinite blue gradient, ethereal glow",
  data: "electric blue, cyan glow, deep purple shadows, holographic shimmer",
  strategy: "royal purple, gold accents, mystical green, ancient wisdom tones",
  politics: "royal gold, power red, alliance purple, influence auras",
  shipping: "launch orange, victory green, midnight blue, deployment energy",
  chaos: "hot pink, electric orange, warning red, purple lightning, pure chaos",
};
