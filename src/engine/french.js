// French helpers for the generators: numbers in letters, plausible misspellings. Pure.
import { wordVariants } from "../answer.js";

const UNITS = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
const TENS = { 2: "vingt", 3: "trente", 4: "quarante", 5: "cinquante", 6: "soixante" };

function below100(n) {
  if (n < 20) return UNITS[n];
  const t = Math.floor(n / 10);
  const u = n % 10;
  if (t === 7) return u === 1 ? "soixante et onze" : `soixante-${UNITS[10 + u]}`;
  if (t === 9) return `quatre-vingt-${UNITS[10 + u]}`;
  if (t === 8) return u === 0 ? "quatre-vingts" : `quatre-vingt-${UNITS[u]}`;
  if (u === 0) return TENS[t];
  if (u === 1) return `${TENS[t]} et un`;
  return `${TENS[t]}-${UNITS[u]}`;
}

function below1000(n, beforeMille = false) {
  const c = Math.floor(n / 100);
  const r = n % 100;
  let s = "";
  if (c === 1) s = "cent";
  else if (c > 1) s = `${UNITS[c]} cent${r === 0 && !beforeMille ? "s" : ""}`;
  if (r) {
    let rs = below100(r);
    if (beforeMille) rs = rs.replace(/vingts$/, "vingt");
    s = s ? `${s} ${rs}` : rs;
  }
  return s;
}

/** A number (0-999 999) in letters, traditional spelling (quatre-vingts, deux cents, mille invariable). */
export function numberToFrench(n) {
  n = Math.floor(Math.abs(n));
  if (n === 0) return "zéro";
  const th = Math.floor(n / 1000);
  const rest = n % 1000;
  let s = "";
  if (th) s = th === 1 ? "mille" : `${below1000(th, true)} mille`;
  if (rest) s = s ? `${s} ${below1000(rest)}` : below1000(rest);
  return s;
}

// ---------- Plausible misspellings ----------

let isWord = null;
/** The app plugs the dictionary in, so that a "misspelling" is never a real word (verre → vers). */
export function setWordCheck(fn) {
  isWord = fn;
}

const CONS = "bcdfglmnprst";
const SWAPS = [
  [/é/, "è"], [/è/, "é"], [/ê/, "è"], [/é/, "e"], [/à/, "a"], [/ô/, "o"], [/ç/, "c"], [/ç/, "ss"], [/on$/, "ond"], [/ème$/, "aime"], [/ph/, "f"], [/th/, "t"], [/y/, "i"], [/qu/, "c"],
  [/an/, "en"], [/en/, "an"], [/ain/, "ein"], [/eau/, "au"], [/au/, "o"], [/ai/, "è"], [/ss/, "s"], [/(?<=[aeiouyéèê])s(?=[aeiouyéèê])/, "ss"], [/ge(?=[ao])/, "g"],
  [/ent$/, "ant"], [/ant$/, "ent"], [/ence$/, "ance"], [/ance$/, "ence"], [/^h/, ""], [/tion$/, "ssion"], [/ill/, "y"], [/gn/, "ni"], [/x$/, "s"], [/s$/, "x"],
];

/** Up to n plausible wrong spellings of a word (never an accepted variant, never a known word). */
export function misspell(word, rng, n = 3) {
  const w = String(word);
  const out = new Set();
  // Doubled consonant → single, single consonant between vowels → doubled.
  for (let i = 1; i < w.length; i++) {
    if (w[i] === w[i - 1] && CONS.includes(w[i])) out.add(w.slice(0, i) + w.slice(i + 1));
    if (CONS.includes(w[i]) && /[aeiouéèêâîôû]/.test(w[i - 1] || "") && /[aeiouéèêâîôû]/.test(w[i + 1] || "") && w[i + 1] !== w[i]) out.add(w.slice(0, i) + w[i] + w.slice(i));
  }
  for (const [re, rep] of SWAPS) if (re.test(w)) out.add(w.replace(re, rep));
  // Silent endings (adding a final s or e would often make a real word: plural, feminine).
  if (/e$/.test(w) && w.length > 4) out.add(w.slice(0, -1));
  if (/[aeiou]$/.test(w)) out.add(`${w}t`);
  const ok = new Set(wordVariants(w).map((x) => x.toLowerCase()));
  const list = [...out].filter((x) => x && x.length > 1 && x !== w && !ok.has(x.toLowerCase()) && !(isWord && isWord(x)));
  return (rng ? rng.shuffle(list) : list).slice(0, n);
}
