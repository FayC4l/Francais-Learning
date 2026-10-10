// Reverse index of the conjugator: conjugated form → [{ inf, tense, p }], and past participle → infinitive.
// Built on first use (≈ 35 000 forms). Pure.
import { VERBS, simpleForms, participle } from "../engine/conjugue.js";
import { maskOf, TAGS } from "./spell.js";

const FINITE = ["present", "imparfait", "passe_simple", "futur", "cond_present", "subj_present", "subj_imparfait"];
let INDEX = null;
let PP = null;

function build() {
  INDEX = new Map();
  PP = new Map();
  for (const v of VERBS) {
    const F = simpleForms(v.inf);
    if (!F) continue;
    for (const t of FINITE) {
      (F[t] || []).forEach((forms, p) => {
        for (const f of forms || []) {
          if (!INDEX.has(f)) INDEX.set(f, []);
          INDEX.get(f).push({ inf: v.inf, tense: t, p });
        }
      });
    }
    for (const g of ["m", "f"]) for (const pl of [false, true]) for (const pp of participle(v.inf, g, pl)) {
      if (!PP.has(pp)) PP.set(pp, []);
      PP.get(pp).push({ inf: v.inf, g, pl });
    }
  }
}

// Regular verbs of the 1st group are too many for the list: a form missing from the index is matched against the
// infinitives it could come from (broutent → brouter, mangeons → manger, lève → lever, appelle → appeler), kept only
// when the dictionary knows that infinitive and the conjugator really produces the form.
const ER_ENDINGS = ["eraient", "assions", "assiez", "erions", "eriez", "assent", "erais", "erait", "erons", "eront", "aient", "asses", "èrent", "erai", "eras", "erez", "ions", "iez", "ais", "ait", "ons", "ent", "âmes", "âtes", "asse", "era", "ées", "ée", "és", "ez", "es", "ai", "as", "ât", "é", "e", "a"];
const guessed = new Map();
function guessFirstGroup(w) {
  if (guessed.has(w)) return guessed.get(w);
  const out = { fin: [], pp: [] };
  const infs = new Set();
  for (const end of ER_ENDINGS) {
    if (!w.endsWith(end) || w.length - end.length < 2) continue;
    const stem = w.slice(0, -end.length);
    for (const s of [stem, stem.replace(/è(?=[^è]*$)/, "e"), stem.replace(/è(?=[^è]*$)/, "é"), stem.replace(/(ll|tt)$/, (m) => m[0])]) {
      infs.add(`${s}er`);
      if (/e$/.test(s)) infs.add(`${s}r`); // mangeons → manger
      if (/ç$/.test(s)) infs.add(`${s.slice(0, -1)}cer`); // commençons → commencer
    }
  }
  for (const inf of infs) {
    if (!(maskOf(inf) & TAGS.INF)) continue;
    const F = simpleForms(inf);
    if (!F) continue;
    for (const t of FINITE) (F[t] || []).forEach((forms, p) => (forms || []).includes(w) && out.fin.push({ inf, tense: t, p }));
    for (const g of ["m", "f"]) for (const pl of [false, true]) if (participle(inf, g, pl).includes(w)) out.pp.push({ inf, g, pl });
  }
  guessed.set(w, out);
  return out;
}

/** Finite readings of a word: [{ inf, tense, p }] (empty when it is not a conjugated form of a known verb). */
export function readings(word) {
  if (!INDEX) build();
  const w = String(word).toLowerCase();
  return INDEX.get(w) || guessFirstGroup(w).fin;
}

/** Participle readings: [{ inf, g, pl }]. */
export function ppReadings(word) {
  if (!PP) build();
  const w = String(word).toLowerCase();
  return PP.get(w) || guessFirstGroup(w).pp;
}

export const isFinite = (word) => readings(word).length > 0;
export { FINITE };
