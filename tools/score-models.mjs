// Marks every model answer of writing.json (and the DALF writing tasks) with the real scorer, to calibrate them.
// Usage: node tools/score-models.mjs [level|promptId …] [--issues]
// Prints one line per model: id, level, words / range, mark, criteria, unmet requirements; --issues adds the flagged spans.
import { readFileSync, existsSync } from "node:fs";

// The Lexique dictionary plus tools/mots-connus.txt, but not the words of the content (unlike the built page):
// a typo in a model must show up here.
const { loadDictionary } = await import("../src/writing/spell.js");
const known = readFileSync("tools/mots-connus.txt", "utf8").split(/\r?\n/).map((x) => x.trim().toLowerCase()).filter((x) => x && !x.startsWith("#")).sort();
let prev = "";
const extraPart = [...new Set(known)]
  .map((w) => {
    let i = 0;
    while (i < 35 && i < prev.length && i < w.length && prev[i] === w[i]) i++;
    prev = w;
    return `${i.toString(36)}${w.slice(i)}~0`;
  })
  .join(",");
loadDictionary(`${readFileSync("data/dict-fr.txt", "utf8")}|${extraPart}`);
const { analyze } = await import("../src/writing/analyze.js");
const { score } = await import("../src/writing/score.js");

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const showIssues = process.argv.includes("--issues");
const prompts = existsSync("content/writing.json") ? JSON.parse(readFileSync("content/writing.json", "utf8")).prompts : [];
if (existsSync("content/dalf-papers.json")) {
  const P = JSON.parse(readFileSync("content/dalf-papers.json", "utf8"));
  for (const s of P.synthese || []) prompts.push({ ...s, level: 12, type: "synthese", prompt: s.consigne });
  for (const e of P.essai || []) prompts.push({ ...e, level: 12, type: "essai" });
}
const wanted = (p) => !args.length || args.some((a) => a === p.id || Number(a) === p.level);
let low = 0;
for (const p of prompts.filter(wanted)) {
  const a = analyze(p.model || "", p);
  const s = score(a, p);
  const unmet = a.checks.filter((c) => !c.ok).map((c) => `${c.label} (${c.got}/${c.min})`);
  if (s.total < 15) low++;
  const c = s.criteria;
  console.log(`${p.id.padEnd(8)} L${String(p.level).padStart(2)} ${String(a.words).padStart(3)} [${p.words}]  ${String(s.total).padStart(4)}/20  tâche ${c.content} · efficacité ${c.communicative} · organisation ${c.organisation} · langue ${c.language}  conn ${Object.keys(a.connectors).length} · §${a.paragraphs} · temps ${Object.entries(a.tenses).filter(([, v]) => v).map(([k]) => k).join(",")}${unmet.length ? `  ✗ ${unmet.join(" ; ")}` : ""}`);
  if (showIssues && a.issues.length) console.log(`         ${a.issues.map((x) => `${x.rule}: « ${a.text.slice(x.start, x.end)} »`).join(" | ")}`);
}
console.log(`${low} modèle(s) sous 15/20`);
