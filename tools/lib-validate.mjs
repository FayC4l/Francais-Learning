// Shared checks of the content validators. Pure (needs the dictionary loaded: see loadDict()).
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { clean, matches } from "../src/answer.js";
import { wordCountMismatches } from "../src/fill.js";
import { frTypo } from "../src/typo.js";
import { loadDictionary, tierOf, distance } from "../src/writing/spell.js";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..");
export const loadDict = () => loadDictionary(readFileSync(join(root, "data", "dict-fr.txt"), "utf8"));

export const str = (v) => typeof v === "string" && v.trim().length > 0;
export const words = (s) => String(s).split(/\s+/).filter((w) => /[\p{L}\d]/u.test(w)).length;
/** Correct words the dictionary lacks: first names, places, grammar terms (tools/mots-connus.txt). */
export const KNOWN = new Set(
  readFileSync(join(root, "tools", "mots-connus.txt"), "utf8")
    .split(/\r?\n/)
    .map((x) => x.trim().toLowerCase())
    .filter((x) => x && !x.startsWith("#")),
);
// Endings and letter groups quoted in the lessons (-ent, -ons, ge, gu, ss…).
const FRAGMENTS = new Set("er ir re oir ez ons ent ais ait aient ions iez ge gu ss eau eaux eux euse al aux ail ou oux é ée és ées ère ve ette elle enne onne ance ence ant ent amment emment ment tion sion".split(" "));

/** Unknown words of a French text (names with a capital inside a sentence and ~~wrong forms~~ are skipped). */
export function unknownWords(text) {
  const t = String(text || "").replace(/~~.+?~~/g, " ").replace(/\[\[|\]\]|\*\*/g, "");
  const out = [];
  const re = /[\p{L}]+(?:['’-][\p{L}]+)*/gu;
  let m;
  while ((m = re.exec(t))) {
    const w = m[0].replace(/’/g, "'");
    const before = t.slice(Math.max(0, m.index - 3), m.index);
    if (/^\p{Lu}/u.test(w) && !/(^|[.!?…]\s*|«\s*|—\s*)$/.test(before) && m.index > 0) continue; // a name
    if (/^\p{Lu}{2,}$/u.test(w)) continue; // an acronym or a key word in capitals
    if (/[-…]$/.test(before) || FRAGMENTS.has(w.toLowerCase())) continue; // an ending quoted in a lesson
    if (/^-(?!\p{L})/u.test(t.slice(m.index + m[0].length, m.index + m[0].length + 2))) continue; // a stem (finiss-)
    const parts = w.split("'");
    const core = parts.length > 1 && /^(c|d|j|l|m|n|s|t|qu|jusqu|lorsqu|puisqu|quoiqu|presqu|quelqu)$/i.test(parts[0]) ? parts.slice(1).join("'") : w;
    if (parts.length > 1 && /^\p{Lu}/u.test(core)) continue; // d'Afrique, l'Élysée
    if (KNOWN.has(core.toLowerCase()) || KNOWN.has(w.toLowerCase())) continue;
    if (core.length > 1 && tierOf(core) === 0 && tierOf(w) === 0) out.push(w);
  }
  return out;
}

/** A grammar exercise (mcq / fill / error): structure, one answer, French typography of the error tokens. */
export function checkGrammar(g, W, { err, warn, spell, count = {} }) {
  if (!str(g.q)) return err(W, "q requis");
  if (!str(g.explain)) err(W, "explain requis");
  if (g.type in count) count[g.type]++;
  if (g.type === "mcq") {
    if (!Array.isArray(g.choices) || g.choices.length < 2 || g.choices.length > 4) return err(W, "mcq : 2 à 4 choix");
    if (!Number.isInteger(g.answer) || g.answer < 0 || g.answer >= g.choices.length) err(W, "answer hors limites");
    const cs = g.choices.map((c) => c.trim());
    if (new Set(cs).size !== cs.length) err(W, "choix en double");
    if ((g.q.match(/___/g) || []).length > 1) warn(W, "plus d'un trou");
    spell(W, `${g.q.replace(/___/g, " ")} ${g.explain}`);
  } else if (g.type === "fill") {
    if ((g.q.match(/___/g) || []).length !== 1) err(W, "fill : ___ exactement une fois");
    if (/_{4,}/.test(g.q)) err(W, "exactement trois soulignés");
    if (!Array.isArray(g.answer) || !g.answer.length || !g.answer.every(str)) return err(W, "answer : tableau de chaînes");
    if (g.hint !== undefined && !str(g.hint)) err(W, "hint non vide");
    const mism = wordCountMismatches(g.answer);
    if (mism.length) err(W, `réponses avec un autre nombre de mots que "${g.answer[0]}" : ${mism.join(" | ")}`);
    if (g.key && !g.answer.every((a) => a.toUpperCase().includes(g.key.toUpperCase()))) err(W, `chaque réponse doit contenir le mot imposé ${g.key}`);
    spell(W, `${g.q.replace(/___/g, " ")} ${g.answer.join(" ")} ${g.explain} ${g.lead || ""}`);
  } else if (g.type === "error") {
    const tokens = frTypo(g.q).split(" ");
    if (!Number.isInteger(g.wrong) || g.wrong < 0 || g.wrong >= tokens.length) return err(W, `wrong hors limites (${tokens.length} mots après typographie)`);
    if (!/\p{L}/u.test(tokens[g.wrong])) err(W, `le mot faux "${tokens[g.wrong]}" n'est pas un mot`);
    if (!Array.isArray(g.fix) || !g.fix.length || !g.fix.every(str)) err(W, "fix : tableau de chaînes");
    else if (g.fix.some((f) => matches(tokens[g.wrong], [f], { caseSensitive: !!g.case }) && (!g.case || tokens[g.wrong].replace(/[.,!?;:…»]+$/, "") === f))) err(W, `la correction est identique au mot faux "${tokens[g.wrong]}"`);
    const rest = tokens.filter((_, i) => i !== g.wrong).join(" ");
    spell(W, `${rest} ${g.fix?.join(" ")} ${g.explain}`);
    // A wrong index usually points next to the real mistake: a neighbour much closer to the fix (« ont regardées » → « regardé »).
    const bare = (t) => String(t || "").replace(/[.,!?;:…»\s ]+$/u, "").toLowerCase();
    const fixWord = String(g.fix?.[0] || "").toLowerCase();
    const own = distance(bare(tokens[g.wrong]), fixWord, 9);
    const closer = [-2, -1, 1, 2].map((d) => tokens[g.wrong + d]).filter((t) => t && bare(t).length >= 4 && distance(bare(t), fixWord, 9) <= 2 && distance(bare(t), fixWord, 9) < own);
    if (fixWord && closer.length) warn(W, `« ${closer[0]} », à côté du mot faux, ressemble plus à la correction « ${fixWord} » : vérifie l'index wrong`);
    if (process.env.SHOW_ERRORS) console.log(`    [${W}] mot faux : « ${tokens[g.wrong]} » → ${g.fix}`);
  } else err(W, `type inconnu "${g.type}"`);
}

