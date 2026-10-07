// Reverse index of the conjugator: conjugated form → [{ inf, tense, p }], and past participle → infinitive.
// Built on first use (≈ 35 000 forms). Pure.
import { VERBS, simpleForms, participle } from "../engine/conjugue.js";

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

/** Finite readings of a word: [{ inf, tense, p }] (empty when it is not a conjugated form of a known verb). */
export function readings(word) {
  if (!INDEX) build();
  return INDEX.get(String(word).toLowerCase()) || [];
}

/** Participle readings: [{ inf, g, pl }]. */
export function ppReadings(word) {
  if (!PP) build();
  return PP.get(String(word).toLowerCase()) || [];
}

export const isFinite = (word) => readings(word).length > 0;
export { FINITE };
