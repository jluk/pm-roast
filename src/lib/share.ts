import { RoastResult, DreamRole, PMElement, PMMove } from "./types";

// Shareable card data - includes all fields needed to reconstruct the full results
export interface ShareableCard {
  s: number; // careerScore
  n: string; // archetype name
  e: string; // archetype emoji
  d: string; // archetype description
  el: string; // element type (data, chaos, strategy, shipping, politics, vision)
  st: string; // stage (Junior, Senior, Staff, etc.)
  w: string; // weakness (funny one-word)
  f: string; // flavor text (Pokédex-style)
  m: { n: string; c: number; d: number; e?: string }[]; // moves array (name, energyCost, damage, effect)
  ps: number; // productSense
  ex: number; // execution
  ld: number; // leadership
  dr: string; // dreamRole
  q: string; // bangerQuote
  rr: string; // dreamRoleReaction
  // Additional fields for full results page reconstruction
  rb?: string[]; // roastBullets
  g?: string[]; // gaps
  rm?: { t: string; a: string[] }[]; // roadmap (title, actions)
  pe?: { t: string; g: string; r: string }[]; // podcastEpisodes (title, guest, reason)
  u?: string; // userName
  np?: string; // naturalPredator
}

// Convert ShareableCard back to RoastResult for reusing the Results component
export function shareableCardToRoastResult(card: ShareableCard): RoastResult {
  // Reconstruct moves
  const moves: PMMove[] = card.m ? card.m.map(m => ({
    name: m.n,
    energyCost: m.c,
    damage: m.d,
    effect: m.e,
  })) : [];

  // Reconstruct roadmap
  const roadmap = card.rm ? card.rm.map((r, i) => ({
    month: i + 1,
    title: r.t,
    actions: r.a,
  })) : [];

  // Reconstruct podcast episodes
  const podcastEpisodes = card.pe ? card.pe.map(p => ({
    title: p.t,
    guest: p.g,
    reason: p.r,
  })) : [];

  return {
    careerScore: card.s,
    archetype: {
      name: card.n,
      emoji: card.e,
      description: card.d,
      element: card.el as PMElement,
      stage: card.st || "Senior",
      weakness: card.w || "Meetings",
      flavor: card.f || card.d,
    },
    moves,
    capabilities: {
      productSense: card.ps,
      execution: card.ex,
      leadership: card.ld,
    },
    roastBullets: card.rb || [],
    gaps: card.g || [],
    roadmap,
    podcastEpisodes,
    bangerQuote: card.q,
    dreamRoleReaction: card.rr,
    userName: card.u,
    naturalPredator: card.np || "",
  };
}

// Encode card data for URL (handles UTF-8/Unicode)
export function encodeCardData(card: ShareableCard): string {
  const json = JSON.stringify(card);
  // Encode UTF-8 string to base64url
  const utf8Bytes = new TextEncoder().encode(json);
  const binaryString = Array.from(utf8Bytes, (byte) => String.fromCharCode(byte)).join('');
  const base64 = btoa(binaryString)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return base64;
}

// Decode card data from URL (handles UTF-8/Unicode)
export function decodeCardData(encoded: string): ShareableCard | null {
  try {
    // Restore base64 padding and characters
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binaryString = atob(base64);
    const utf8Bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      utf8Bytes[i] = binaryString.charCodeAt(i);
    }
    const json = new TextDecoder().decode(utf8Bytes);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Move type for sharing (compressed)
export interface ShareableMove {
  n: string; // name
  c: number; // energyCost
  d: number; // damage
  e?: string; // effect (optional)
}

// Generate share URL from full result
export function generateShareUrl(
  baseUrl: string,
  result: {
    careerScore: number;
    archetype: {
      name: string;
      emoji: string;
      description: string;
      element?: string;
      stage?: string;
      weakness?: string;
      flavor?: string;
    };
    moves?: { name: string; energyCost: number; damage: number; effect?: string }[];
    capabilities?: { productSense: number; execution: number; leadership: number };
    bangerQuote: string;
    dreamRoleReaction: string;
    roastBullets?: string[];
    gaps?: string[];
    roadmap?: { title: string; actions: string[] }[];
    podcastEpisodes?: { title: string; guest: string; reason: string }[];
    userName?: string;
    naturalPredator?: string;
  },
  dreamRole: string
): string {
  // Compress moves for URL
  const compressedMoves: ShareableMove[] = (result.moves || []).slice(0, 2).map(m => ({
    n: m.name.slice(0, 20),
    c: Math.min(m.energyCost, 2),
    d: m.damage,
    ...(m.effect ? { e: m.effect.slice(0, 50) } : {}),
  }));

  // Compress roadmap
  const compressedRoadmap = (result.roadmap || []).slice(0, 4).map(r => ({
    t: r.title.slice(0, 20),
    a: r.actions.slice(0, 2).map(a => a.slice(0, 40)),
  }));

  // Compress podcast episodes
  const compressedPodcasts = (result.podcastEpisodes || []).slice(0, 3).map(p => ({
    t: p.title.slice(0, 50),
    g: p.guest.slice(0, 30),
    r: p.reason.slice(0, 40),
  }));

  const card: ShareableCard = {
    s: result.careerScore,
    n: result.archetype.name.slice(0, 30),
    e: result.archetype.emoji,
    d: result.archetype.description.slice(0, 95),
    el: result.archetype.element || "chaos",
    st: result.archetype.stage || "Senior",
    w: result.archetype.weakness || "Meetings",
    f: (result.archetype.flavor || result.archetype.description).slice(0, 95),
    m: compressedMoves,
    ps: result.capabilities?.productSense || 70,
    ex: result.capabilities?.execution || 70,
    ld: result.capabilities?.leadership || 70,
    dr: dreamRole,
    q: result.bangerQuote.slice(0, 140),
    rr: result.dreamRoleReaction.slice(0, 80),
    // Full results data
    rb: (result.roastBullets || []).slice(0, 4).map(b => b.slice(0, 80)),
    g: (result.gaps || []).slice(0, 4).map(g => g.slice(0, 60)),
    rm: compressedRoadmap,
    pe: compressedPodcasts,
    u: result.userName?.slice(0, 50),
    np: result.naturalPredator?.slice(0, 80),
  };

  const encoded = encodeCardData(card);
  return `${baseUrl}/share/${encoded}`;
}
