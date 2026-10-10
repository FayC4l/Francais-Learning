// Spelling: French dictionary (window.__DICT__, built by tools/make-dict.mjs from Lexique 3.83 and the conjugator:
// 3 frequency tiers, prefix-coded, each word with a mask of what it can be) + suggestions. Pure once loaded.
import { stripAccents, wordVariants } from "../answer.js";

/** Bits of the mask (must match tools/make-dict.mjs). */
export const TAGS = { NS: 1, NP: 2, AS: 4, AP: 8, M: 16, F: 32, V: 64, INF: 128, PP: 256, X: 512 };

let TIER = null; // Map word → tier (1 frequent, 2 intermediate, 3 rare)
let MASK = null; // Map word → mask
let BY_LEN = null; // "length:first letter without accent" → words
let ALIAS = null; // rectified spelling without circumflex → dictionary word (connait → connaît)

/** Decodes the dictionary string "tier1|tier2|tier3". Exposed for tests (pass a string). */
export function loadDictionary(encoded = globalThis.window?.__DICT__ || "") {
  TIER = new Map();
  MASK = new Map();
  BY_LEN = new Map();
  ALIAS = new Map();
  encoded.split("|").forEach((part, k) => {
    let prev = "";
    for (const item of part ? part.split(",") : []) {
      const p = parseInt(item[0], 36);
      const [rest, m = "0"] = item.slice(1).split("~");
      const w = prev.slice(0, p) + rest;
      prev = w;
      if (!TIER.has(w)) {
        TIER.set(w, k < 3 ? k + 1 : 2); // a 4th part (words of the content, added by build.mjs) counts as tier 2
        MASK.set(w, parseInt(m, 36) || 0);
        const key = `${w.length}:${stripAccents(w[0])}`;
        if (!BY_LEN.has(key)) BY_LEN.set(key, []);
        BY_LEN.get(key).push(w);
        if (/[îû]/.test(w)) for (const v of wordVariants(w)) if (v !== w) ALIAS.set(v, w);
      }
    }
  });
  return TIER.size;
}

const ensure = () => TIER || loadDictionary();
export const dictionaryReady = () => ensure().size > 0;

// Inverted pronouns and particles found after a hyphen (dit-il, va-t'en, celui-ci, peut-être…).
const HYPHEN_PARTS = new Set(["je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles", "ce", "t", "là", "ci", "même", "moi", "toi", "lui", "leur", "le", "la", "les", "y", "en", "m", "t'en", "m'en"]);
// Common words of modern life missing from the 2004-2019 corpus.
const MODERN = new Set(["smartphone", "smartphones", "internet", "wifi", "email", "emails", "mail", "mails", "texto", "textos", "appli", "applis", "podcast", "podcasts", "youtubeur", "youtubeuse", "youtubeurs", "influenceur", "influenceuse", "influenceurs", "influenceuses", "tutoriel", "tutoriels", "streaming", "hashtag", "hashtags", "selfie", "selfies", "emoji", "emojis", "covid", "télétravail", "visioconférence", "visioconférences", "cyberharcèlement", "écoresponsable", "écoresponsables", "covoiturage", "trottinette", "trottinettes", "fayçal", "chikh"]);

/** Tier of a known word (1-3), 0 when unknown. Handles elisions, hyphens and the 1990 spelling. */
export function tierOf(word) {
  const dict = ensure();
  const w = String(word).toLowerCase().replace(/’/g, "'");
  if (!w || /\d/.test(w)) return 1;
  if (dict.has(w)) return dict.get(w);
  if (MODERN.has(w)) return 2;
  if (/^(c|d|j|l|m|n|s|t|qu|jusqu|lorsqu|puisqu|quoiqu)'$/.test(w)) return 1;
  // Rectified spellings (paraitre, évènement…) are as good as the traditional ones.
  if (ALIAS.has(w) && !dict.has(w)) return dict.get(ALIAS.get(w));
  for (const v of wordVariants(w)) if (v !== w && dict.has(v)) return dict.get(v);
  if (w.includes("-")) {
    const parts = w.split("-").filter(Boolean);
    if (parts.length > 1 && parts.every((p, i) => (i > 0 && HYPHEN_PARTS.has(p)) || tierOf(p) > 0)) return Math.max(...parts.map((p) => (HYPHEN_PARTS.has(p) ? 1 : tierOf(p))));
    return 0;
  }
  if (w.includes("'")) {
    const parts = w.split("'").filter(Boolean);
    return parts.every((p) => tierOf(p) > 0) ? Math.max(...parts.map(tierOf)) : 0;
  }
  return 0;
}

export const isKnown = (word) => tierOf(word) > 0;
/** Mask of a word (0 when unknown): see TAGS. */
export const maskOf = (word) => {
  ensure();
  const w = String(word).toLowerCase().replace(/’/g, "'");
  return MASK.get(w) ?? MASK.get(ALIAS.get(w) || "") ?? MASK.get(wordVariants(w).find((v) => MASK.has(v)) || "") ?? 0;
};
export const has = (word, tag) => (maskOf(word) & tag) !== 0;

/** Optimal string alignment distance with an early exit above `max`. */
export function distance(a, b, max = 2) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let rowMin = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, d[i - 2][j - 2] + 1);
      d[i][j] = v;
      rowMin = Math.min(rowMin, v);
    }
    if (rowMin > max) return max + 1;
  }
  return d[a.length][b.length];
}

/** Up to n corrections for an unknown word: accents first (eleve → élève), then the closest and most frequent words. */
export function suggest(word, n = 3) {
  ensure();
  const w = String(word).toLowerCase();
  const bw = stripAccents(w);
  const out = [];
  // The first letter is usually right: only words starting with the same letter (accents aside) are compared.
  for (let len = w.length - 2; len <= w.length + 2; len++) {
    for (const c of BY_LEN.get(`${len}:${bw[0]}`) || []) {
      const bc = stripAccents(c);
      const dist = distance(bw, bc, 2);
      if (dist > 2) continue;
      const accents = distance(w, c, 4);
      let prefix = 0;
      while (prefix < w.length && w[prefix] === c[prefix]) prefix++;
      out.push({ c, score: dist * 10 + Math.min(accents, 4) * 2 + TIER.get(c) * 3 + Math.abs(c.length - w.length) - prefix });
    }
  }
  out.sort((a, b) => a.score - b.score);
  const res = out.slice(0, n).map((x) => x.c);
  // Keep the capital letter of the original word.
  return /^\p{Lu}/u.test(word) ? res.map((s) => s[0].toUpperCase() + s.slice(1)) : res;
}
