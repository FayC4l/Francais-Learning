// Builds the app into one HTML file (artifact page) plus a standalone full document (index.html for GitHub Pages).
import { build } from "esbuild";
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { frTypoDeep } from "./src/typo.js";

const root = dirname(fileURLToPath(import.meta.url));
const contentDir = process.env.CONTENT_DIR || join(root, "content");
const readJSON = (p) => frTypoDeep(JSON.parse(readFileSync(p, "utf8").replace(/^﻿/, "")));

const levels = [];
for (const f of readdirSync(contentDir).filter((f) => /^level-\d\d\.json$/.test(f)).sort()) {
  const lvl = readJSON(join(contentDir, f));
  const extraPath = join(contentDir, f.replace("level-", "extra-"));
  if (existsSync(extraPath)) {
    const extra = readJSON(extraPath);
    for (const x of extra.units || []) {
      const u = lvl.units.find((u) => u.id === x.unit);
      if (u) {
        u.dictee = x.dictee;
        u.mission = x.mission;
      }
    }
  }
  levels.push(lvl);
}

// Optional content files, injected as window.__EXTRA__ (a missing file simply disables a feature).
const readOpt = (name) => {
  const p = join(contentDir, name);
  return existsSync(p) ? readJSON(p) : null;
};
const extra = { boss: {}, lexicon: {} };
for (const f of readdirSync(contentDir)) {
  let m = f.match(/^boss-(\d\d)\.json$/);
  if (m) extra.boss[Number(m[1])] = readOpt(f);
  m = f.match(/^lexicon-(\d\d)\.json$/);
  if (m) extra.lexicon[Number(m[1])] = readOpt(f).words;
}
for (const [k, f] of [["placement", "placement.json"], ["writing", "writing.json"], ["humor", "humor.json"], ["wordform", "wordform.json"], ["dalfLangue", "dalf-langue.json"], ["dalfPapers", "dalf-papers.json"], ["mentor", "mentor.json"]]) extra[k] = readOpt(f);

// Spelling dictionary (data/dict-fr.txt, from Lexique 3.83 — see THIRD_PARTY.md) + every word of the content.
function dictionary() {
  const p = join(root, "data", "dict-fr.txt");
  if (!existsSync(p)) return "";
  const base = readFileSync(p, "utf8");
  const known = new Set();
  for (const part of base.split("|")) {
    let prev = "";
    for (const item of part ? part.split(",") : []) {
      const w = prev.slice(0, parseInt(item[0], 36)) + item.slice(1).split("~")[0];
      prev = w;
      known.add(w);
    }
  }
  const text = JSON.stringify({ levels, extra: { ...extra, mentor: null } });
  // First names, places and grammar terms the dictionary lacks (tools/mots-connus.txt).
  const extraKnown = readFileSync(join(root, "tools", "mots-connus.txt"), "utf8").split(/\r?\n/).map((x) => x.trim().toLowerCase()).filter((x) => x && !x.startsWith("#"));
  const words = new Set([...(text.match(/[\p{L}]+(?:-[\p{L}]+)*/gu) || []), ...extraKnown].map((w) => w.toLowerCase()).filter((w) => w.length > 1 && !known.has(w)));
  let prev = "";
  const extraPart = [...words]
    .sort()
    .map((w) => {
      let i = 0;
      while (i < 35 && i < prev.length && i < w.length && prev[i] === w[i]) i++;
      prev = w;
      return `${i.toString(36)}${w.slice(i)}~0`;
    })
    .join(",");
  return extraPart ? `${base}|${extraPart}` : base;
}
const dict = dictionary();

const js = await build({
  entryPoints: [join(root, "src/main.js")],
  bundle: true,
  format: "iife",
  target: "es2020",
  write: false,
  minify: !process.argv.includes("--dev"),
  // Test builds (MB_TEST=1) expose the current question to the browser tests; normal builds drop that code.
  define: { __MB_TEST__: process.env.MB_TEST ? "true" : "false" },
  legalComments: "none",
});
const css = ["src/styles.css", "src/styles-v2.css"].filter((p) => existsSync(join(root, p))).map((p) => readFileSync(join(root, p), "utf8")).join("\n");
const data = JSON.stringify(levels).replace(/</g, "\\u003c");
const extraData = JSON.stringify(extra).replace(/</g, "\\u003c");
const dictData = JSON.stringify(dict);
const fonts =
  '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=JetBrains+Mono:wght@500;700&display=swap">';
const TITLE = "Mission Français";
const DESC = "Le défi de français de toute la famille : orthographe, conjugaison, grammaire, dictées, style, jusqu'au DALF C2.";

const body = `<div id="app"><main id="view"><noscript><p>Mission Français a besoin de JavaScript.</p></noscript></main></div>
<script>window.__CONTENT__=${data};window.__EXTRA__=${extraData};window.__DICT__=${dictData};</script>
<script>${js.outputFiles[0].text}</script>`;

const page = `<title>${TITLE}</title>
<meta name="description" content="${DESC}">
${fonts}
<style>${css}</style>
${body}
`;
mkdirSync(join(root, "dist"), { recursive: true });
const out = process.env.OUT_PREFIX || "mission-francais";
writeFileSync(join(root, `dist/${out}.html`), page);

const standalone = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#1f3a93">
<title>${TITLE}</title>
<meta name="description" content="${DESC}">
${fonts}
<style>${css}</style>
</head>
<body>
${body}
</body>
</html>
`;
writeFileSync(join(root, `dist/${out}-standalone.html`), standalone);
// The published site (GitHub Pages) serves index.html at the repository root.
if (!process.env.OUT_PREFIX) writeFileSync(join(root, "index.html"), standalone);

const kb = (s) => `${Math.round(Buffer.byteLength(s) / 1024)} KB`;
console.log(`niveaux : ${levels.map((l) => l.id).join(", ") || "aucun"} · dictées : ${levels.flatMap((l) => l.units).filter((u) => u.dictee).length} · page ${kb(page)}`);
