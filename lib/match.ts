// Keyword fallback for Ask Tariq when the API is unavailable. Ported from the prototype.
const KEYS: Record<string, string[]> = {
  airport: ["airport", "land", "arriv", "2am", "flight", "pick me up", "pickup from"],
  baby: ["baby", "infant", "toddler", "cot", "crib", "pram", "stroller", "high chair"],
  lastday: ["checkout", "check out", "late flight", "bags", "luggage", "noon"],
  trekkit: ["trek", "hike", "toubkal", "snack"],
  desertkit: ["desert night", "cold"],
  sahara3: ["sahara", "merzouga", "dune"],
  agafay: ["agafay", "star", "sunset dinner"],
  henna: ["henna"],
  massage: ["massage", "spa"],
  chef: ["chef", "cook"],
  dinner: ["restaurant", "dinner out", "table", "eat out"],
  balloon: ["balloon"],
  ourika: ["ourika", "day trip", "waterfall"],
  essaouira: ["essaouira", "ocean", "beach", "sea"],
  imlil: ["atlas", "mountain", "imlil"],
  quad: ["quad", "atv"],
  camel: ["camel", "palmeraie"],
};

export const ALCOHOL = /\b(alcohol\w*|beers?|wines?|cocktails?|vodka|whisk(?:e)?y|gin|rum|champagne|liquor|booze|spirits)\b/i;

export function localMatch(q: string, known: Set<string>): string[] {
  const w = q.toLowerCase();
  if (ALCOHOL.test(w)) return [];
  const hits = Object.entries(KEYS)
    .filter(([, ks]) => ks.some((k) => w.includes(k)))
    .map(([id]) => id);
  if (/\b\d+\s*(days|nights)\b/.test(w) && !hits.length) hits.push("airport", "agafay", "ourika", "sahara3");
  return [...new Set(hits)].filter((id) => known.has(id)).slice(0, 4);
}
