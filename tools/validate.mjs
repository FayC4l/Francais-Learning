// Validates the level files (content/level-XX.json) and their dictations and missions (content/extra-XX.json).
// Usage: node tools/validate.mjs [content/level-03.json …]   (no argument: every level)
// Errors must be fixed. Warnings must be read: "mot inconnu" lists the words the dictionary does not know
// (a typo, or a rare word to check by hand).
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { clean, tiles, tileKey } from "../src/answer.js";
import { str, words, unknownWords, checkGrammar, loadDict } from "./lib-validate.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
loadDict();
let files = process.argv.slice(2);
if (!files.length) files = readdirSync(join(root, "content")).filter((f) => /^level-\d\d\.json$/.test(f)).map((f) => join(root, "content", f));

let totalErrors = 0;
let totalWarnings = 0;

for (const file of files) {
  const errors = [];
  const warnings = [];
  const err = (where, msg) => errors.push(`${where}: ${msg}`);
  const warn = (where, msg) => warnings.push(`${where}: ${msg}`);
  const spell = (where, text) => {
    const u = unknownWords(text);
    if (u.length) warn(where, `mot inconnu : ${[...new Set(u)].join(", ")}`);
  };
  let data;
  try {
    data = JSON.parse(readFileSync(file, "utf8").replace(/^﻿/, ""));
  } catch (e) {
    console.log(`\n${file}\n  ERREUR JSON invalide : ${e.message}`);
    totalErrors++;
    continue;
  }
  const L = data.id;
  if (!Number.isInteger(L) || L < 1 || L > 12) err("niveau", "id doit être un entier de 1 à 12");
  for (const k of ["cefr", "title", "sub", "intro"]) if (!str(data[k])) err("niveau", `${k} manquant`);
  spell("niveau intro", data.intro);
  if (!data.boss || !str(data.boss.name) || !str(data.boss.taunt) || !str(data.boss.defeat)) err("niveau", "boss : name, taunt, defeat");
  else spell("boss", `${data.boss.taunt} ${data.boss.defeat}`);
  if (!Array.isArray(data.units) || data.units.length !== 5) err("niveau", "il faut 5 stations");

  const levelMot = new Map();
  const levelDef = new Map();
  const markupCheck = (where, text) => {
    if (typeof text !== "string") return;
    if ((text.match(/\[\[/g) || []).length !== (text.match(/\]\]/g) || []).length) err(where, "balises [[ ]] déséquilibrées");
    if ((text.match(/\*\*/g) || []).length % 2) err(where, "balises ** déséquilibrées");
    if ((text.match(/~~/g) || []).length % 2) err(where, "balises ~~ déséquilibrées");
  };

  (data.units || []).forEach((u, ui) => {
    const U = `station ${u?.id ?? ui + 1}`;
    if (u.id !== `${L}.${ui + 1}`) err(U, `id doit être "${L}.${ui + 1}"`);
    for (const k of ["name", "title", "goal"]) if (!str(u[k])) err(U, `${k} manquant`);
    if (str(u.name) && u.name.split(" ").length > 5) warn(U, "name est long pour un nom de station");
    spell(`${U} titres`, `${u.name} ${u.title} ${u.goal}`);

    // Lesson
    const lesson = Array.isArray(u.lesson) ? u.lesson : [];
    if (lesson.length < 5 || lesson.length > 12) err(U, `la leçon doit avoir 5 à 12 blocs (${lesson.length})`);
    const types = new Set(lesson.map((b) => b?.type));
    for (const t of ["rule", "examples"]) if (!types.has(t)) err(U, `la leçon doit contenir un bloc "${t}"`);
    if (!types.has("tip") && !types.has("compare")) err(U, "la leçon doit contenir un bloc \"tip\" ou \"compare\"");
    lesson.forEach((b, bi) => {
      const W = `${U} leçon[${bi}]`;
      switch (b?.type) {
        case "p": case "tip": case "fun":
          if (!str(b.text)) err(W, "text requis");
          markupCheck(W, b.text);
          spell(W, b.text);
          break;
        case "rule":
          if (!str(b.title) || !str(b.text)) err(W, "rule : title et text");
          markupCheck(W, b.text);
          spell(W, `${b.title} ${b.text}`);
          break;
        case "table":
          if (!Array.isArray(b.head) || !Array.isArray(b.rows) || !b.rows.length) err(W, "table : head et rows");
          else b.rows.forEach((r, ri) => {
            if (!Array.isArray(r) || r.length !== b.head.length) err(W, `ligne ${ri} : ${r?.length} cases pour ${b.head.length} colonnes`);
            r?.forEach?.((c) => (markupCheck(W, c), spell(W, c)));
          });
          break;
        case "examples":
          if (!Array.isArray(b.items) || b.items.length < 2) err(W, "examples : au moins 2 items");
          else b.items.forEach((it, k) => {
            if (!str(it.ex)) err(W, `item ${k} : ex requis`);
            markupCheck(W, it.ex);
            markupCheck(W, it.note);
            spell(W, `${it.ex} ${it.note || ""}`);
          });
          break;
        case "compare":
          if (!Array.isArray(b.items) || b.items.length < 2) err(W, "compare : au moins 2 items");
          else b.items.forEach((it, k) => {
            if (!str(it.ko) || !str(it.ok)) err(W, `item ${k} : ko et ok requis`);
            if (clean(it.ko) === clean(it.ok)) err(W, `item ${k} : ko et ok identiques`);
            markupCheck(W, it.why);
            spell(W, `${it.ok} ${it.why || ""}`);
          });
          break;
        case "texte":
          if (!str(b.text)) err(W, "texte : text requis");
          if (/\d/.test(b.text)) warn(W, "chiffres dans un texte lu à voix haute");
          spell(W, `${b.title || ""} ${b.text}`);
          break;
        default:
          err(W, `type de bloc inconnu "${b?.type}"`);
      }
    });

    // Vocabulary
    const vocab = Array.isArray(u.vocab) ? u.vocab : [];
    const [vmin, vmax] = L <= 4 ? [12, 16] : [14, 20];
    if (vocab.length < vmin || vocab.length > vmax) err(U, `vocab : ${vmin} à ${vmax} mots (${vocab.length})`);
    vocab.forEach((v, vi) => {
      const W = `${U} vocab[${vi}] "${v?.mot}"`;
      if (!str(v.mot) || !str(v.def)) return err(W, "mot et def requis");
      if (/[.!?]$/.test(v.mot.trim())) err(W, "mot sans ponctuation finale");
      if (v.alt !== undefined && !Array.isArray(v.alt)) err(W, "alt doit être un tableau");
      if (!str(v.ex)) err(W, "ex requis (une phrase d'exemple)");
      else {
        const stem = clean(v.mot).slice(0, Math.max(3, Math.min(6, clean(v.mot).length - 2)));
        if (!clean(v.ex).includes(stem)) warn(W, "l'exemple ne contient pas le mot");
        if (/\d/.test(v.ex)) warn(W, "chiffres dans l'exemple");
      }
      if (clean(v.def).includes(clean(v.mot)) && clean(v.mot).length > 3) warn(W, "la définition contient le mot");
      const mk = clean(v.mot);
      if (levelMot.has(mk)) err(W, `mot en double avec ${levelMot.get(mk)}`);
      else levelMot.set(mk, W);
      const dk = clean(v.def);
      if (levelDef.has(dk)) err(W, `définition en double avec ${levelDef.get(dk)}`);
      else levelDef.set(dk, W);
      spell(W, `${v.mot} ${v.def} ${v.ex}`);
    });

    // Sentences
    const sentences = Array.isArray(u.sentences) ? u.sentences : [];
    if (sentences.length < 8 || sentences.length > 12) err(U, `sentences : 8 à 12 phrases (${sentences.length})`);
    const [smin, smax] = L <= 4 ? [4, 12] : L <= 8 ? [5, 16] : [6, 20];
    const seen = new Set();
    sentences.forEach((s, si) => {
      const W = `${U} phrases[${si}] "${s?.phrase}"`;
      if (!str(s.phrase) || !str(s.indice)) return err(W, "phrase et indice requis");
      if (!/[.?!…]["»]?$/.test(s.phrase.trim())) err(W, "la phrase doit finir par . ? ! ou …");
      if (/\d/.test(s.phrase)) err(W, "pas de chiffres (la phrase est dictée)");
      if (/\s{2,}/.test(s.phrase)) err(W, "double espace");
      const t = tiles(s.phrase);
      if (t.length < smin || t.length > smax) warn(W, `${t.length} mots (attendu ${smin}-${smax})`);
      const key = tileKey(t);
      if (seen.has(key)) err(W, "phrase en double");
      seen.add(key);
      if (!Array.isArray(s.trap) || s.trap.length < 1 || s.trap.length > 3) err(W, "trap : 1 à 3 mots");
      else {
        const ws = new Set(t.map((w) => clean(w)));
        s.trap.forEach((tr) => {
          if (!str(tr)) err(W, "piège vide");
          else if (ws.has(clean(tr))) err(W, `le piège "${tr}" est aussi un mot de la phrase`);
          if (str(tr) && tr.trim().includes(" ")) warn(W, `piège "${tr}" avec une espace (une tuile = un mot)`);
        });
      }
      if (s.alt !== undefined && !Array.isArray(s.alt)) err(W, "alt doit être un tableau");
      (s.alt || []).forEach((a) => {
        const sortKey = (x) => tiles(x).map((w) => clean(w)).sort().join(" ");
        if (sortKey(a) !== sortKey(s.phrase)) err(W, `alt "${a}" doit utiliser exactement les mêmes mots`);
      });
      spell(W, `${s.phrase} ${s.indice}`);
    });

    // Grammar
    const grammar = Array.isArray(u.grammar) ? u.grammar : [];
    if (grammar.length < 14 || grammar.length > 18) err(U, `grammar : 14 à 18 exercices (${grammar.length})`);
    const count = { mcq: 0, fill: 0, error: 0 };
    grammar.forEach((g, gi) => checkGrammar(g, `${U} grammaire[${gi}] (${g?.type}) "${g?.q}"`, { err, warn, spell, count }));
    if (count.mcq < 4 || count.fill < 5 || count.error < 3) err(U, `grammaire : au moins 4 mcq, 5 fill, 3 error (${count.mcq}/${count.fill}/${count.error})`);

    // Reading (levels 3-12)
    if (L >= 3 && !u.reading) err(U, "reading requis à partir du niveau 3");
    if (u.reading) {
      const r = u.reading;
      const W = `${U} lecture`;
      if (!str(r.title) || !str(r.text)) err(W, "title et text requis");
      const n = words(r.text);
      const [rmin, rmax] = L <= 4 ? [80, 160] : L <= 6 ? [130, 220] : L <= 8 ? [180, 300] : [220, 400];
      if (n < rmin || n > rmax) warn(W, `${n} mots (attendu ${rmin}-${rmax})`);
      if (/\d/.test(r.text)) warn(W, "chiffres (le texte peut être lu à voix haute)");
      if (!Array.isArray(r.questions) || r.questions.length < 4 || r.questions.length > 6) err(W, "4 à 6 questions");
      (r.questions || []).forEach((q, qi) => {
        if (!str(q.q) || !Array.isArray(q.choices) || q.choices.length !== 4) err(`${W} q${qi}`, "q et 4 choix");
        if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) err(`${W} q${qi}`, "answer 0-3");
        spell(`${W} q${qi}`, `${q.q} ${(q.choices || []).join(" ")}`);
      });
      spell(W, `${r.title} ${r.text}`);
    }
  });

  // Dictations and missions (extra-XX.json)
  const extraFile = join(dirname(file), basename(file).replace("level-", "extra-"));
  if (!existsSync(extraFile)) err("extra", `${basename(extraFile)} manquant (dictées et missions)`);
  else {
    let ex;
    try {
      ex = JSON.parse(readFileSync(extraFile, "utf8"));
    } catch (e) {
      err("extra", `JSON invalide : ${e.message}`);
    }
    if (ex) {
      if (ex.level !== L) err("extra", "level doit être celui du niveau");
      const units = ex.units || [];
      if (units.length !== 5) err("extra", "5 entrées");
      const [dmin, dmax] = L <= 2 ? [25, 55] : L <= 4 ? [40, 75] : L <= 6 ? [60, 105] : L <= 8 ? [80, 135] : L <= 10 ? [100, 160] : [120, 190];
      const types = { oral: 0, ecrit: 0 };
      units.forEach((x, k) => {
        const W = `extra ${x.unit}`;
        if (x.unit !== `${L}.${k + 1}`) err(W, `unit doit être "${L}.${k + 1}"`);
        const d = x.dictee;
        if (!d || !str(d.titre) || !str(d.texte)) err(W, "dictee : titre et texte");
        else {
          const n = words(d.texte);
          if (n < dmin || n > dmax) warn(W, `dictée de ${n} mots (attendu ${dmin}-${dmax})`);
          if (/\d/.test(d.texte)) err(W, "pas de chiffres dans une dictée (nombres en lettres)");
          if (!Array.isArray(d.points) || d.points.length < 2) err(W, "dictee.points : au moins 2 pièges expliqués");
          (d.points || []).forEach((p) => markupCheck(W, p));
          spell(`${W} dictée`, `${d.titre} ${d.texte} ${(d.points || []).join(" ")}`);
        }
        const m = x.mission;
        if (!m || !["oral", "ecrit"].includes(m.type) || !str(m.prompt) || !str(m.model)) err(W, "mission : type (oral/ecrit), prompt, model");
        else {
          types[m.type]++;
          if (!Array.isArray(m.checklist) || m.checklist.length < 3 || m.checklist.length > 5) err(W, "mission.checklist : 3 à 5 points");
          spell(`${W} mission`, `${m.prompt} ${m.model} ${(m.checklist || []).join(" ")}`);
        }
      });
      if (types.oral < 2 || types.ecrit < 2) warn("extra", `missions : ${types.oral} orales, ${types.ecrit} écrites (alterner)`);
    }
  }

  totalErrors += errors.length;
  totalWarnings += warnings.length;
  console.log(`\n${basename(file)} : ${errors.length} erreur(s), ${warnings.length} avertissement(s)`);
  errors.forEach((e) => console.log(`  ERREUR ${e}`));
  warnings.forEach((w) => console.log(`  attention ${w}`));
}

console.log(`\nTotal : ${totalErrors} erreur(s), ${totalWarnings} avertissement(s)`);
process.exitCode = totalErrors ? 1 : 0;
