// Shareable card data - minimal subset for URL encoding
export interface ShareableCard {
  s: number; // careerScore
  n: string; // archetype name
  e: string; // archetype emoji
  d: string; // archetype description
  ps: number; // productSense
  ex: number; // execution
  ld: number; // leadership
  dr: string; // dreamRole
  q: string; // bangerQuote
  rr: string; // dreamRoleReaction
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

// Generate share URL from full result
export function generateShareUrl(
  baseUrl: string,
  result: {
    careerScore: number;
    archetype: { name: string; emoji: string; description: string };
    capabilities?: { productSense: number; execution: number; leadership: number };
    bangerQuote: string;
    dreamRoleReaction: string;
  },
  dreamRole: string
): string {
  const card: ShareableCard = {
    s: result.careerScore,
    n: result.archetype.name,
    e: result.archetype.emoji,
    d: result.archetype.description.slice(0, 100), // Truncate for URL length
    ps: result.capabilities?.productSense || 70,
    ex: result.capabilities?.execution || 70,
    ld: result.capabilities?.leadership || 70,
    dr: dreamRole,
    q: result.bangerQuote.slice(0, 140), // Truncate for URL length
    rr: result.dreamRoleReaction.slice(0, 80),
  };

  const encoded = encodeCardData(card);
  return `${baseUrl}/share/${encoded}`;
}
