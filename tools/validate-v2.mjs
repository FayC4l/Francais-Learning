// Validates the content files around the levels (see docs/CONTENT_FORMATS.md): boss banks, lexicons, placement test,
// writing prompts, humour, word formation, DALF language parts and DALF papers.
// Usage: node tools/validate-v2.mjs content/boss-03.json [more files]   (no argument: every such file)
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import { clean, matches } from "../src/answer.js";
import { root, loadDict, str, words, unknownWords, checkGrammar } from "./lib-validate.mjs";

loadDict();
const contentDir = join(root, "content");
const KINDS = /^(boss-\d\d|lexicon-\d\d|placement|writing|humor|wordform|dalf-langue|dalf-papers)\.json$/;
let files = process.argv.slice(2);
if (!files.length) files = readdirSync(contentDir).filter((f) => KINDS.test(f)).sort().map((f) => join(contentDir, f));

const readJson = (p) => JSON.parse(readFileSync(p, "utf8").replace(/^﻿/, ""));
const levelFile = (L) => join(contentDir, `level-${String(L).padStart(2, "0")}.json`);
const allLevels = readdirSync(contentDir).filter((f) => /^level-\d\d\.json$/.test(f)).sort().map((f) => readJson(join(contentDir, f)));
const BANDS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const TENSES = ["present", "imparfait", "passe_simple", "passe_compose", "plus_que_parfait", "futur", "conditionnel", "subjonctif", "passif"];
const WTYPES = ["description", "portrait", "lettre", "courriel", "message", "recit", "dialogue", "article", "essai", "critique", "compte-rendu", "discours", "dissertation"];
const NATURES = ["nom", "verbe", "adj", "adv", "expr", "autre"];
const AGES = ["enfant", "ado", "adulte"];
const SITUATIONS = ["welcome", "correct", "wrong", "streak", "timeout", "perfect", "fail", "comeback", "writing_good", "writing_bad"];

let totalErrors = 0;
let totalWarnings = 0;

/** A question with 3 or 4 choices and an explanation (reading, listening, DALF). */
function mcq(q, W, err, spell, n = [3, 4]) {
  if (!str(q?.q)) return err(W, "q requis");
  if (!Array.isArray(q.choices) || !n.includes(q.choices.length)) return err(W, `${n.join(" ou ")} choix`);
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.choices.length) err(W, "answer hors limites");
  if (new Set(q.choices.map((c) => c.trim())).size !== q.choices.length) err(W, "choix en double");
  if (!str(q.explain)) err(W, "explain requis");
  spell(W, `${q.q} ${q.choices.join(" ")} ${q.explain}`);
}

/** {1} … {n} each exactly once. */
function gapCheck(text, n, W, err) {
  for (let i = 1; i <= n; i++) {
    const c = text.split(`{${i}}`).length - 1;
    if (c !== 1) err(W, `le trou {${i}} apparaît ${c} fois`);
  }
  if (text.includes(`{${n + 1}}`)) err(W, `trou {${n + 1}} en trop`);
}

/** A model text, its length and its spelling. */
function model(p, W, err, spell) {
  if (!Array.isArray(p.words) || p.words.length !== 2 || !(p.words[0] < p.words[1])) return err(W, "words : [min, max]");
  if (!str(p.model)) return err(W, "model requis");
  const n = words(p.model);
  if (n < p.words[0] * 0.95 || n > p.words[1] * 1.05) err(W, `le modèle a ${n} mots, hors de ${p.words.join("-")}`);
  spell(`${W} modèle`, p.model);
}

function checkRequire(req, W, err) {
  if (req === undefined) return;
  if (!Array.isArray(req)) return err(W, "require : un tableau");
  req.forEach((r, j) => {
    const R = `${W} require[${j}]`;
    if (!str(r?.label)) err(R, "label requis");
    if (!Number.isInteger(r?.min) || r.min < 1) err(R, "min : entier positif");
    if (r?.kind === "tense") {
      if (!TENSES.includes(r.value)) err(R, `temps parmi ${TENSES.join(", ")}`);
    } else if (r?.kind === "words") {
      if (!Array.isArray(r.value) || !r.value.length || !r.value.every(str)) err(R, "words : une liste de mots");
    } else if (!["connectors", "paragraphs", "questions"].includes(r?.kind)) err(R, `kind inconnu "${r?.kind}"`);
  });
}

const ids = new Set();
const idOk = (x, W, err) => {
  if (!str(x?.id) || ids.has(x.id)) err(W, "id manquant ou en double");
  ids.add(x?.id);
};

const validators = {
  boss(d, err, warn, spell, file) {
    const L = d.level;
    if (!Number.isInteger(L) || L < 1 || L > 12) return err("fichier", "level : 1 à 12");
    const want = `boss-${String(L).padStart(2, "0")}.json`;
    if (basename(file) !== want) err("fichier", `le fichier devrait s'appeler ${want}`);
    for (const k of ["phase2", "phase3", "lose"]) {
      const a = d.taunts?.[k];
      if (!Array.isArray(a) || a.length < 3 || !a.every(str)) err("taunts", `${k} : au moins 3 répliques`);
      else a.forEach((t, i) => spell(`taunts.${k}[${i}]`, t));
    }
    const qs = Array.isArray(d.questions) ? d.questions : [];
    if (qs.length !== 60) err("questions", `exactement 60 (il y en a ${qs.length})`);
    const count = { mcq: 0, fill: 0, error: 0 };
    const perUnit = {};
    const lvl = existsSync(levelFile(L)) ? readJson(levelFile(L)) : null;
    // A duplicate has the same stem AND the same answers (generic stems like « Quelle phrase est correcte ? » are fine).
    const qKey = (g) => clean([g.q, ...(g.choices || []), ...[].concat(g.answer ?? []), ...(g.fix || [])].join(" | "));
    const unitQ = new Set((lvl?.units || []).flatMap((u) => [...(u.grammar || []).map(qKey), ...(u.sentences || []).map((s) => clean(s.phrase))]));
    const seen = new Set();
    qs.forEach((g, i) => {
      const W = `q${i} (${g?.type}) « ${g?.q} »`;
      if (!new RegExp(`^${L}\\.[1-5]$`).test(g?.unit || "")) err(W, `unit : "${L}.1" à "${L}.5"`);
      perUnit[g?.unit] = (perUnit[g?.unit] || 0) + 1;
      checkGrammar(g || {}, W, { err, warn, spell, count });
      const k = qKey(g || {});
      if (seen.has(k)) err(W, "question en double");
      seen.add(k);
      if (unitQ.has(k) || unitQ.has(clean(g?.q))) err(W, "reprend une phrase des stations du niveau");
    });
    if (count.mcq < 18) err("questions", `au moins 18 mcq (${count.mcq})`);
    if (count.fill < 22) err("questions", `au moins 22 fill (${count.fill})`);
    if (count.error < 14) err("questions", `au moins 14 error (${count.error})`);
    for (let U = 1; U <= 5; U++) {
      const n = perUnit[`${L}.${U}`] || 0;
      if (n < 9) err("questions", `station ${L}.${U} : ${n} questions (au moins 9)`);
    }
  },

  lexicon(d, err, warn, spell, file) {
    const L = d.level;
    if (!Number.isInteger(L) || L < 1 || L > 12) return err("fichier", "level : 1 à 12");
    const ws = Array.isArray(d.words) ? d.words : [];
    if (ws.length < 150) err("words", `150 mots (il y en a ${ws.length})`);
    const unitMot = new Map();
    for (const l of allLevels) for (const u of l.units) for (const v of u.vocab || []) unitMot.set(clean(v.mot), u.id);
    const otherLex = new Map();
    for (const f of readdirSync(contentDir).filter((f) => /^lexicon-\d\d\.json$/.test(f) && f !== basename(file))) {
      try {
        for (const w of readJson(join(contentDir, f)).words || []) otherLex.set(clean(w.mot), f);
      } catch {
        /* reported when that file is validated */
      }
    }
    const mots = new Set();
    const defs = new Set();
    ws.forEach((w, i) => {
      const W = `words[${i}] « ${w?.mot} »`;
      if (!str(w?.mot) || !str(w?.def) || !str(w?.ex) || !str(w?.theme)) return err(W, "mot, def, ex, theme requis");
      if (!NATURES.includes(w.nature)) err(W, `nature parmi ${NATURES.join(", ")}`);
      if (/\d/.test(w.ex)) err(W, "pas de chiffres dans ex (lu par la voix)");
      if (w.alt !== undefined && (!Array.isArray(w.alt) || !w.alt.every(str))) err(W, "alt : liste de graphies acceptées");
      if (clean(w.def).split(" ").includes(clean(w.mot))) err(W, "la définition contient le mot");
      if (!clean(w.ex).includes(clean(w.mot).split(" ")[0].slice(0, 4))) warn(W, "l'exemple ne semble pas contenir le mot");
      const k = clean(w.mot);
      if (mots.has(k)) err(W, "mot en double");
      mots.add(k);
      if (unitMot.has(k)) err(W, `déjà enseigné dans la station ${unitMot.get(k)}`);
      if (otherLex.has(k)) err(W, `déjà dans ${otherLex.get(k)}`);
      const f = clean(w.def);
      if (defs.has(f)) err(W, "définition en double");
      defs.add(f);
      spell(W, `${w.mot} ${w.def} ${w.ex}`);
    });
  },

  placement(d, err, warn, spell) {
    const qs = Array.isArray(d.questions) ? d.questions : [];
    const per = Object.fromEntries(BANDS.map((b) => [b, { mcq: 0, fill: 0, reading: 0, listening: 0 }]));
    qs.forEach((q, i) => {
      const W = `${q?.id || i} (${q?.band} ${q?.type})`;
      idOk(q, W, err);
      if (!BANDS.includes(q?.band)) return err(W, "band : A1 à C2");
      if (!(q.type in per[q.band])) return err(W, "type : mcq, fill, reading ou listening");
      per[q.band][q.type]++;
      if (q.type === "mcq" || q.type === "fill") checkGrammar(q, W, { err, warn, spell });
      else {
        mcq(q, W, err, spell, [4]);
        if (q.type === "reading") {
          if (!str(q.text)) err(W, "text requis");
          else {
            if (words(q.text) < 30 || words(q.text) > 140) warn(W, `le texte a ${words(q.text)} mots (40-120)`);
            spell(W, q.text);
          }
        } else if (!str(q.say)) err(W, "say requis");
        else {
          if (/\d/.test(q.say)) err(W, "pas de chiffres dans say (lu par la voix)");
          spell(W, q.say);
        }
      }
    });
    for (const b of BANDS) {
      const c = per[b];
      const tot = c.mcq + c.fill + c.reading + c.listening;
      if (tot < 25) err(b, `25 questions (il y en a ${tot})`);
      if (c.mcq < 12 || c.fill < 7 || c.reading < 3 || c.listening < 3) err(b, `12 mcq / 7 fill / 3 reading / 3 listening (${JSON.stringify(c)})`);
    }
  },

  writing(d, err, warn, spell) {
    const ps = Array.isArray(d.prompts) ? d.prompts : [];
    const per = {};
    ps.forEach((p, i) => {
      const W = `${p?.id || i}`;
      idOk(p, W, err);
      if (!Number.isInteger(p?.level) || p.level < 1 || p.level > 12) return err(W, "level : 1 à 12");
      (per[p.level] ||= []).push(p);
      if (!WTYPES.includes(p.type)) err(W, `type parmi ${WTYPES.join(", ")}`);
      for (const k of ["title", "prompt"]) if (!str(p[k])) err(W, `${k} requis`);
      spell(W, `${p.title} ${p.prompt}`);
      if (p.ages !== undefined && (!Array.isArray(p.ages) || !p.ages.length || p.ages.some((a) => !AGES.includes(a)))) err(W, "ages : parmi enfant, ado, adulte");
      model(p, W, err, spell);
      checkRequire(p.require, W, err);
    });
    for (let L = 1; L <= 12; L++) {
      const list = per[L] || [];
      if (list.length < 8) err(`niveau ${L}`, `8 sujets (il y en a ${list.length})`);
      const fits = (a) => list.filter((p) => !p.ages || p.ages.includes(a)).length;
      if (fits("adulte") < 2) err(`niveau ${L}`, "au moins 2 sujets pour adultes");
      if (fits("enfant") < 2) err(`niveau ${L}`, "au moins 2 sujets pour enfants");
    }
  },

  humor(d, err, warn, spell) {
    for (const s of SITUATIONS) {
      const a = d.quips?.[s];
      if (!Array.isArray(a) || a.length < 20) err("quips", `${s} : au moins 20 répliques (${a?.length || 0})`);
      const seen = new Set();
      (a || []).forEach((q, i) => {
        const W = `quips.${s}[${i}]`;
        if (!str(q?.text)) return err(W, "text requis");
        if (q.text.length > 160) warn(W, `${q.text.length} caractères (140 au plus)`);
        if (q.ages !== undefined && (!Array.isArray(q.ages) || q.ages.some((x) => !AGES.includes(x)))) err(W, "ages : parmi enfant, ado, adulte");
        if ((q.text.match(/\[\[/g) || []).length !== (q.text.match(/\]\]/g) || []).length) err(W, "[[ ]] non équilibrés");
        if (seen.has(clean(q.text))) err(W, "réplique en double");
        seen.add(clean(q.text));
        spell(W, q.text);
      });
    }
    const jokes = Array.isArray(d.jokes) ? d.jokes : [];
    if (jokes.length < 70) err("jokes", `au moins 70 (il y en a ${jokes.length})`);
    const seen = new Set();
    jokes.forEach((j, i) => {
      const W = `jokes[${i}]`;
      if (!str(j?.text) || !str(j?.explication)) return err(W, "text et explication requis");
      if (!Number.isInteger(j.level) || j.level < 1 || j.level > 12) err(W, "level : 1 à 12");
      const k = clean(j.text);
      if (seen.has(k)) err(W, "blague en double");
      seen.add(k);
      spell(W, `${j.text} ${j.explication}`);
    });
  },

  wordform(d, err, warn, spell) {
    const items = Array.isArray(d.items) ? d.items : [];
    if (items.length < 120) err("items", `120 items (il y en a ${items.length})`);
    const seen = new Set();
    items.forEach((it, i) => {
      const W = `items[${i}] ${it?.stem}`;
      if (!Number.isInteger(it?.level) || it.level < 9 || it.level > 12) err(W, "level : 9 à 12");
      if (!str(it?.stem) || it.stem !== it.stem.toUpperCase()) err(W, "stem en MAJUSCULES");
      if (!str(it?.explain)) err(W, "explain requis");
      if (!str(it?.q) || (it.q.match(/___/g) || []).length !== 1) err(W, "q : ___ exactement une fois");
      if (!Array.isArray(it?.answer) || !it.answer.length || it.answer.some((a) => !str(a) || a.trim().includes(" "))) err(W, "answer : des mots seuls");
      else if (it.answer.some((a) => clean(a) === clean(it.stem))) err(W, "la réponse est le mot de départ");
      const k = clean(it?.q);
      if (seen.has(k)) err(W, "q en double");
      seen.add(k);
      spell(W, `${it?.q?.replace(/___/g, " ")} ${it?.answer?.join(" ")} ${it?.explain}`);
    });
  },

  "dalf-langue"(d, err, warn, spell) {
    const sets = (k, n) => {
      const a = Array.isArray(d[k]) ? d[k] : [];
      if (a.length < n) err(k, `${n} exercices (il y en a ${a.length})`);
      return a;
    };
    for (const k of ["part1", "part2", "part3"]) {
      sets(k, 6).forEach((s, i) => {
        const W = `${k}[${i}] ${s?.id}`;
        idOk(s, W, err);
        if (!str(s?.title) || !str(s?.text)) return err(W, "title et text requis");
        gapCheck(s.text, 8, W, err);
        spell(W, s.text.replace(/\{\d\}/g, " "));
        if (!Array.isArray(s.gaps) || s.gaps.length !== 8) return err(W, "8 trous");
        s.gaps.forEach((g, j) => {
          const G = `${W} trou ${j + 1}`;
          if (!str(g?.explain)) err(G, "explain requis");
          if (k === "part1") {
            if (!Array.isArray(g?.choices) || g.choices.length !== 4) err(G, "4 choix");
            else if (!Number.isInteger(g.answer) || g.answer < 0 || g.answer > 3) err(G, "answer hors limites");
            else if (new Set(g.choices).size !== 4) err(G, "choix en double");
          } else {
            if (!Array.isArray(g?.answer) || !g.answer.length || g.answer.some((a) => !str(a) || a.trim().includes(" "))) err(G, "answer : des mots seuls");
            if (k === "part3" && (!str(g?.stem) || g.stem !== g.stem.toUpperCase())) err(G, "stem en MAJUSCULES");
            if (k === "part3" && g.answer?.some((a) => clean(a) === clean(g.stem || ""))) err(G, "la réponse est le mot de départ");
          }
        });
        const n = words(s.text);
        if (n < 120 || n > 260) warn(W, `${n} mots (140-240)`);
      });
    }
    sets("part4", 48).forEach((t, i) => {
      const W = `part4[${i}] ${t?.id}`;
      idOk(t, W, err);
      if (!str(t?.lead)) err(W, "lead requis (la phrase de départ)");
      if (!str(t?.key)) err(W, "key requis (le mot imposé)");
      checkGrammar({ ...t, type: "fill" }, W, { err, warn, spell });
      (t?.answer || []).forEach((a) => {
        const n = words(a);
        if (n < 2 || n > 8) err(W, `la réponse « ${a} » a ${n} mots (2-8)`);
      });
      if (t?.lead && t?.answer?.length && matches(t.lead, [t.q.replace("___", t.answer[0])])) err(W, "la transformation recopie la phrase de départ");
    });
  },

  "dalf-papers"(d, err, warn, spell) {
    const arr = (k, n) => {
      const a = Array.isArray(d[k]) ? d[k] : [];
      if (a.length < n) err(k, `${n} au moins (il y en a ${a.length})`);
      return a;
    };
    arr("comprehensionOrale", 8).forEach((l, i) => {
      const W = `comprehensionOrale[${i}] ${l?.id}`;
      idOk(l, W, err);
      if (!str(l?.title) || !str(l?.kind) || !Array.isArray(l?.lines) || !l.lines.length) return err(W, "title, kind et lines requis");
      l.lines.forEach((ln, j) => {
        if (!str(ln?.text)) err(`${W} ligne ${j}`, "text requis");
        else {
          if (/\d/.test(ln.text)) err(`${W} ligne ${j}`, "pas de chiffres (lu par la voix)");
          spell(`${W} ligne ${j}`, ln.text);
        }
      });
      const n = l.lines.reduce((s, ln) => s + words(ln.text || ""), 0);
      if (n < 250 || n > 900) warn(W, `${n} mots (300-800)`);
      if (!Array.isArray(l.questions) || l.questions.length < 4 || l.questions.length > 8) err(W, "4 à 8 questions");
      (l.questions || []).forEach((q, j) => mcq(q, `${W} q${j}`, err, spell));
    });
    arr("comprehensionEcrite", 4).forEach((r, i) => {
      const W = `comprehensionEcrite[${i}] ${r?.id}`;
      idOk(r, W, err);
      if (!str(r?.title) || !str(r?.text)) return err(W, "title et text requis");
      const n = words(r.text);
      if (n < 500 || n > 1000) warn(W, `${n} mots (600-900)`);
      spell(W, r.text);
      if (!Array.isArray(r.questions) || r.questions.length < 6 || r.questions.length > 8) err(W, "6 à 8 questions");
      (r.questions || []).forEach((q, j) => mcq(q, `${W} q${j}`, err, spell, [4]));
    });
    arr("synthese", 3).forEach((s, i) => {
      const W = `synthese[${i}] ${s?.id}`;
      idOk(s, W, err);
      for (const k of ["title", "consigne"]) if (!str(s?.[k])) err(W, `${k} requis`);
      if (!Array.isArray(s?.documents) || s.documents.length < 2) err(W, "au moins 2 documents");
      (s?.documents || []).forEach((doc, j) => {
        if (!str(doc?.title) || !str(doc?.text)) err(`${W} doc ${j}`, "title et text requis");
        else spell(`${W} doc ${j}`, doc.text);
      });
      const docs = (s?.documents || []).reduce((t, doc) => t + words(doc?.text || ""), 0);
      if (docs < 500 || docs > 1400) warn(W, `${docs} mots de documents (600-1200)`);
      model(s || {}, W, err, spell);
      checkRequire(s?.require, W, err);
    });
    arr("essai", 4).forEach((e, i) => {
      const W = `essai[${i}] ${e?.id}`;
      idOk(e, W, err);
      for (const k of ["title", "prompt"]) if (!str(e?.[k])) err(W, `${k} requis`);
      (e?.documents || []).forEach((doc, j) => (!str(doc?.text) ? err(`${W} doc ${j}`, "text requis") : spell(`${W} doc ${j}`, doc.text)));
      model(e || {}, W, err, spell);
      checkRequire(e?.require, W, err);
    });
    arr("productionOrale", 8).forEach((s, i) => {
      const W = `productionOrale[${i}] ${s?.id}`;
      idOk(s, W, err);
      for (const k of ["title", "document", "consigne"]) if (!str(s?.[k])) err(W, `${k} requis`);
      if (!Array.isArray(s?.followups) || s.followups.length < 3) err(W, "au moins 3 questions de débat (followups)");
      if (!Array.isArray(s?.useful) || s.useful.length < 4) err(W, "4 à 6 expressions utiles");
      spell(W, `${s?.document} ${s?.consigne} ${(s?.followups || []).join(" ")} ${(s?.useful || []).join(" ")}`);
    });
  },
};

for (const file of files) {
  const errors = [];
  const warnings = [];
  const err = (where, msg) => errors.push(`${where}: ${msg}`);
  const warn = (where, msg) => warnings.push(`${where}: ${msg}`);
  const spell = (where, text) => {
    const u = unknownWords(text);
    if (u.length) warn(where, `mot inconnu : ${[...new Set(u)].join(", ")}`);
  };
  const name = basename(file);
  const kind = name.replace(/-\d\d\.json$/, "").replace(/\.json$/, "");
  let data;
  try {
    data = readJson(file);
  } catch (e) {
    console.log(`\n${file}\n  ERREUR JSON invalide : ${e.message}`);
    totalErrors++;
    continue;
  }
  if (!validators[kind]) {
    console.log(`\n${file}\n  ERREUR type de fichier inconnu « ${kind} »`);
    totalErrors++;
    continue;
  }
  validators[kind](data, err, warn, spell, file);
  totalErrors += errors.length;
  totalWarnings += warnings.length;
  console.log(`\n${name} : ${errors.length} erreur(s), ${warnings.length} avertissement(s)`);
  errors.slice(0, 200).forEach((e) => console.log("  ERREUR " + e));
  if (errors.length > 200) console.log(`  … et ${errors.length - 200} autres erreurs`);
  warnings.forEach((w) => console.log("  attention " + w));
}
console.log(`\nTotal : ${totalErrors} erreur(s), ${totalWarnings} avertissement(s)`);
process.exit(totalErrors ? 1 : 0);
