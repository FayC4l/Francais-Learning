// Prints the text features of the model answers by CEFR band (writing.json and the DALF writing tasks), and the
// band score.js#textBand gives each model, to calibrate its thresholds. Usage: node tools/calibrate-bands.mjs
import { readFileSync, existsSync } from "node:fs";

const { loadDictionary } = await import("../src/writing/spell.js");
loadDictionary(readFileSync("data/dict-fr.txt", "utf8"));
const { analyze } = await import("../src/writing/analyze.js");
const { textBand } = await import("../src/writing/score.js");
const bandOf = (L) => (L <= 2 ? "A1" : L <= 4 ? "A2" : L <= 6 ? "B1" : L <= 8 ? "B2" : L <= 10 ? "C1" : "C2");
const prompts = JSON.parse(readFileSync("content/writing.json", "utf8")).prompts;
if (existsSync("content/dalf-papers.json")) {
  const P = JSON.parse(readFileSync("content/dalf-papers.json", "utf8"));
  for (const x of [...(P.synthese || []), ...(P.essai || [])]) prompts.push({ ...x, level: 12 });
}
const by = {};
for (const p of prompts) {
  const a = analyze(p.model, p);
  const f = { avg: a.avgSentence, mattr: a.mattr, soph: a.sophistication, conn: Object.keys(a.connectors).length, words: a.words, adv: a.advancedConnectors.length, long: a.tk.tokens.filter((t) => t.word && t.text.length >= 9).length / Math.max(1, a.words), got: textBand(a) };
  (by[bandOf(p.level)] ||= []).push(f);
}
for (const [b, list] of Object.entries(by)) {
  const avg = (k) => (list.reduce((s, x) => s + x[k], 0) / list.length).toFixed(3);
  const got = {};
  for (const x of list) got[x.got] = (got[x.got] || 0) + 1;
  console.log(b, list.length, "avgSent", avg("avg"), "mattr", avg("mattr"), "soph", avg("soph"), "conn", avg("conn"), "adv", avg("adv"), "long", avg("long"), "words", avg("words"), "→ textBand", JSON.stringify(got));
}
