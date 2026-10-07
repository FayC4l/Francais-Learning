// Builds data/dict-fr.txt, the spelling dictionary of the writing corrector, from Lexique 3.83 (CC BY-SA 4.0,
// www.lexique.org — downloaded by tools/fetch-lexique.mjs) plus every form produced by the conjugator.
// Format: three frequency tiers separated by "|"; inside a tier, words sorted and prefix-coded ("3ple" = 3 letters
// of the previous word + "ple"), each followed by "~" and a base-36 mask of what the word can be (see TAGS in
// src/writing/spell.js). Usage: node tools/make-dict.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { VERBS, simpleForms, participle } from "../src/engine/conjugue.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "vendor", "Lexique383.tsv");
if (!existsSync(src)) {
  console.error("vendor/Lexique383.tsv manque : lance d'abord node tools/fetch-lexique.mjs");
  process.exit(1);
}

// Must match src/writing/spell.js.
const T = { NS: 1, NP: 2, AS: 4, AP: 8, M: 16, F: 32, V: 64, INF: 128, PP: 256, X: 512 };
const OK = /^[a-zàâäçéèêëîïôöùûüœæ]+(?:['-][a-zàâäçéèêëîïôöùûüœæ]+)*$/;

const words = new Map(); // form → { mask, freq }
// Lexique writes « oe » for « œ » (soeur, coeur, oeil): the ligature is restored (both spellings stay known).
const ligature = (w) => w.replace(/oeu/g, "œu").replace(/oei/g, "œi").replace(/^oe/, "œ").replace(/foet/g, "fœt").replace(/coel/g, "cœl");
const add = (w, mask, freq) => {
  const lig = ligature(w.toLowerCase());
  if (lig !== w.toLowerCase()) addOne(lig, mask, freq);
  addOne(w, mask, freq);
};
const addOne = (w, mask, freq) => {
  const x = w.toLowerCase();
  if (!OK.test(x)) return;
  const e = words.get(x) || { mask: 0, freq: 0 };
  e.mask |= mask;
  e.freq = Math.max(e.freq, freq);
  words.set(x, e);
};

const lines = readFileSync(src, "utf8").split(/\r?\n/);
const head = lines[0].split("\t");
const col = (name) => head.indexOf(name);
const [cO, cC, cG, cN, cF1, cF2, cI] = ["ortho", "cgram", "genre", "nombre", "freqfilms2", "freqlivres", "infover"].map(col);
for (const line of lines.slice(1)) {
  if (!line) continue;
  const f = line.split("\t");
  const cg = f[cC];
  const g = f[cG];
  const n = f[cN];
  const inf = f[cI] || "";
  let mask = 0;
  if (cg === "NOM") mask |= n === "p" ? T.NP : n === "s" ? T.NS : T.NS | T.NP;
  else if (cg === "ADJ") mask |= n === "p" ? T.AP : n === "s" ? T.AS : T.AS | T.AP;
  else if (cg === "VER" || cg === "AUX") {
    mask |= T.V;
    if (/inf/.test(inf)) mask |= T.INF;
    if (/par:pas/.test(inf)) mask |= T.PP;
  } else mask |= T.X;
  if (cg === "NOM" || cg === "ADJ" || /par:pas/.test(inf)) {
    if (g === "m") mask |= T.M;
    else if (g === "f") mask |= T.F;
  }
  add(f[cO], mask, Math.max(Number(f[cF1]) || 0, Number(f[cF2]) || 0));
}

// Every form of the conjugator (rare tenses of common verbs are often missing from the corpus).
for (const v of VERBS) {
  const F = simpleForms(v.inf);
  for (const t of ["present", "imparfait", "passe_simple", "futur", "cond_present", "subj_present", "subj_imparfait", "imp_present"]) {
    for (const forms of F[t] || []) for (const x of forms || []) add(x, T.V, 0.2);
  }
  add(v.inf, T.V | T.INF, 0.2);
  for (const ppr of F.ppr || []) add(ppr, T.V, 0.2);
  for (const g of ["m", "f"]) for (const pl of [false, true]) for (const pp of participle(v.inf, g, pl)) add(pp, T.V | T.PP | (g === "f" ? T.F : T.M), 0.2);
}

// Tiers: 1 frequent (≥ 20 per million), 2 intermediate (≥ 1), 3 rare.
const tiers = [[], [], []];
for (const [w, e] of words) tiers[e.freq >= 20 ? 0 : e.freq >= 1 ? 1 : 2].push([w, e.mask]);

function encode(list) {
  list.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  let prev = "";
  return list
    .map(([w, m]) => {
      let p = 0;
      while (p < 35 && p < prev.length && p < w.length && prev[p] === w[p]) p++;
      prev = w;
      return `${p.toString(36)}${w.slice(p)}~${m.toString(36)}`;
    })
    .join(",");
}

const out = tiers.map(encode).join("|");
mkdirSync(join(root, "data"), { recursive: true });
writeFileSync(join(root, "data", "dict-fr.txt"), out);
console.log(`${words.size} formes · niveaux ${tiers.map((t) => t.length).join(" / ")} · ${Math.round(out.length / 1024)} Ko`);
