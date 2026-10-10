// Every boss of the Tower (level 12), built many times: each question must be well formed and answerable, the
// floor must test its own tenses, difficulty must grow, and every writing boss must be winnable.
// The tests that need content files are skipped while those files are not written yet.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";

const has = (f) => existsSync(`content/${f}`);
const read = (f) => JSON.parse(readFileSync(`content/${f}`, "utf8").replace(/^﻿/, ""));
const levels = readdirSync("content").filter((f) => /^level-\d\d\.json$/.test(f)).sort().map(read);
const extra = { boss: {}, lexicon: {} };
for (const [k, f] of [["wordform", "wordform.json"], ["writing", "writing.json"], ["dalfLangue", "dalf-langue.json"], ["dalfPapers", "dalf-papers.json"]]) if (has(f)) extra[k] = read(f);
for (const f of readdirSync("content")) {
  const m = f.match(/^boss-(\d\d)\.json$/);
  if (m) extra.boss[Number(m[1])] = read(f);
}
globalThis.window = { __CONTENT__: levels, __EXTRA__: extra, speechSynthesis: { getVoices: () => [{ lang: "fr-FR", voiceURI: "x", name: "x" }], addEventListener() {} } };

const { towerExam } = await import("../src/questions.js");
const { state } = await import("../src/store.js");
const { FLOORS, floorSpec } = await import("../src/tower.js");
const { TENSES } = await import("../src/engine/conjugue.js");
const { matches, tileKey } = await import("../src/answer.js");
const { gapWords } = await import("../src/fill.js");
const { loadDictionary } = await import("../src/writing/spell.js");
loadDictionary(readFileSync("data/dict-fr.txt", "utf8"));

const RUNS = 20;
const KINDS = new Set(["type_mot", "choose_def", "listen_type", "spell_choose", "build", "dictation", "mcq", "fill", "error", "reading", "listening"]);
const conjFloors = Array.from({ length: FLOORS - 1 }, (_, i) => i + 1).filter((n) => floorSpec(n).kind === "conj");
const tenseOf = (q) => (String(q.ref).startsWith("gen:conj|") ? TENSES[Number(q.ref.split("|")[1])]?.id : null);
const modeOf = (q) => Number(String(q.ref).split("|")[4]);
/** DALF writing tasks, as the writing screen builds them (src/screens/writing.js). */
const dalfPrompts = () => {
  const P = extra.dalfPapers || {};
  return [...(P.synthese || []).map((x) => ({ ...x, type: "synthese", prompt: x.consigne, texts: x.documents })), ...(P.essai || []).map((x) => ({ ...x, type: "essai" }))].map((x) => ({ ...x, level: 12, cefr: "C2", c2: true, require: x.require || [] }));
};

/** The problems of one question ([] when it is fine). */
function problems(q) {
  const bad = [];
  const say = (m) => bad.push(`${q.kind} ${q.ref || q.q}: ${m}`);
  if (!KINDS.has(q.kind)) return [`type inconnu ${q.kind}`];
  if (!(q.time >= 12 && q.time < 400)) say(`chrono ${q.time}`);
  if (typeof q.expected !== "string" || !q.expected.trim()) say("pas de réponse attendue");
  for (const k of ["q", "hint", "expected", "explain", "def"]) if (/\b(undefined|null|NaN)\b/.test(String(q[k] ?? ""))) say(`« ${k} » affiche undefined / null`);
  if (/\b[Jj]e [aeiouéèêh]|\bque (il|elle|on)\b/.test(String(q.q || ""))) say(`élision oubliée : ${q.q}`);
  switch (q.kind) {
    case "fill":
      if (String(q.q).split("___").length !== 2) say("il faut exactement un trou ___");
      if (!q.accept?.length) say("aucune réponse acceptée");
      else if (!matches(q.expected, q.accept, { caseSensitive: !!q.caseSensitive })) say("la réponse attendue est refusée");
      if (!gapWords(q.expected).length) say("aucune case");
      if (tenseOf(q) && !q.hint) say("conjugaison sans indice");
      break;
    case "mcq": {
      if (q.choices.length < 2) say("moins de 2 choix");
      if (new Set(q.choices).size !== q.choices.length) say(`choix en double ${q.choices.join(" | ")}`);
      if (q.choices[q.answer] !== q.expected) say("l'index ne pointe pas vers la bonne réponse");
      break;
    }
    case "error": {
      if (!(q.wrong >= 0 && q.wrong < q.tokens.length)) say("mot faux hors limites");
      if (!q.accept?.length) say("pas de correction");
      const wrongWord = String(q.tokens[q.wrong] || "").replace(/[.,!?;:…»]+$/, "");
      if (q.accept?.some((a) => matches(wrongWord, [a], { caseSensitive: true }))) say(`le mot faux ${wrongWord} est accepté comme correction`);
      break;
    }
    case "build":
      if (!q.accepted.includes(tileKey(q.words))) say("la phrase elle-même est refusée");
      if (q.words.some((w) => !q.bank.includes(w))) say("un mot manque dans les tuiles");
      break;
    case "type_mot":
    case "listen_type":
    case "dictation":
      if (!matches(q.expected, q.accept, { caseSensitive: q.kind === "dictation" })) say("la réponse attendue est refusée");
      break;
    default:
      if (Array.isArray(q.choices) && q.choices[q.answer] !== q.expected) say("l'index ne pointe pas vers la bonne réponse");
  }
  return bad;
}

test("chaque étage de conjugaison construit un examen complet et bien formé, encore et encore", () => {
  state.seen.tower = {};
  const bad = [];
  for (const n of conjFloors) {
    const spec = floorSpec(n);
    for (let r = 0; r < RUNS; r++) {
      const qs = towerExam(n);
      if (qs.length !== spec.count) bad.push(`étage ${n} : ${qs.length} questions au lieu de ${spec.count}`);
      for (const q of qs) bad.push(...problems(q).map((m) => `étage ${n} : ${m}`));
    }
  }
  assert.deepEqual([...new Set(bad)].slice(0, 25), []);
});

test("chaque étage fait travailler ses temps (et seulement des temps déjà vus en révision)", () => {
  const bad = [];
  for (const n of conjFloors) {
    const spec = floorSpec(n);
    const allowed = new Set([...spec.tenses, ...spec.review]);
    let own = 0;
    let total = 0;
    for (let r = 0; r < 10; r++) {
      const qs = towerExam(n);
      total += qs.length;
      for (const q of qs) {
        const t = tenseOf(q);
        if (!t) continue;
        if (!allowed.has(t)) bad.push(`étage ${n} : temps ${t} pas encore vu`);
        if (spec.tenses.includes(t)) own++;
      }
    }
    if (spec.tenses.length && own / total < 0.35) bad.push(`étage ${n} : seulement ${Math.round((own / total) * 100)} % sur ses propres temps`);
  }
  assert.deepEqual([...new Set(bad)].slice(0, 20), []);
});

test("la montée se durcit : plus de questions, moins d'erreurs permises, moins de temps, plus de formes négatives et interrogatives", () => {
  const negShare = (n) => {
    let neg = 0;
    let all = 0;
    for (let r = 0; r < 40; r++)
      for (const q of towerExam(n))
        if (tenseOf(q)) {
          all++;
          if (modeOf(q) > 0) neg++;
        }
    return neg / all;
  };
  assert.ok(negShare(49) > negShare(1) + 0.2, "plus de formes négatives et interrogatives au sommet");
  const time = (n) => {
    const qs = towerExam(n).filter((q) => tenseOf(q));
    return qs.reduce((s, q) => s + q.time, 0) / qs.length;
  };
  assert.ok(time(12) >= time(11) + 15, "20 secondes de plus par question dès l'étage 12");
  assert.ok(time(49) < time(12), "le chrono se resserre au-dessus de l'étage 12");
  assert.ok(time(11) < time(1), "et en dessous");
  for (let n = 2; n < FLOORS; n++) {
    const a = floorSpec(n - 1);
    const b = floorSpec(n);
    if (a.kind === "conj" && b.kind === "conj") assert.ok(b.count >= a.count && b.hearts <= a.hearts && b.time <= a.time, `l'étage ${n} n'est pas plus dur que le ${n - 1}`);
  }
});

test("un étage raté ne redonne pas le même examen", () => {
  for (const n of [3, 18, 37, 48]) {
    state.seen.tower = {};
    const a = towerExam(n).map((q) => q.ref || q.q);
    const b = new Set(towerExam(n).map((q) => q.ref || q.q));
    const same = a.filter((x) => b.has(x)).length / a.length;
    assert.ok(same <= 0.25, `étage ${n} : ${Math.round(same * 100)} % de questions répétées`);
  }
});

test("chaque boss d'écriture est gagnable : des sujets pour chaque âge, des copies modèles au-dessus de la barre", { skip: !has("writing.json") || !has("dalf-papers.json") }, async () => {
  const { analyze } = await import("../src/writing/analyze.js");
  const { score } = await import("../src/writing/score.js");
  const bad = [];
  for (let n = 5; n < FLOORS; n += 5) {
    const s = floorSpec(n);
    assert.equal(s.kind, "writing");
    for (const age of ["enfant", "ado", "adulte"]) {
      const prompts = s.c2 ? dalfPrompts() : extra.writing.prompts.filter((p) => p.level === s.level && (!p.ages || p.ages.includes(age) || p.ages.includes("adulte")));
      if (prompts.length < 3) bad.push(`étage ${n} : seulement ${prompts.length} sujets pour ${age}`);
      for (const p of prompts) {
        const mark = score(analyze(p.model || "", p), p).total;
        if (mark < s.pass + 1) bad.push(`étage ${n} : le modèle de ${p.id} n'a que ${mark}/20 (barre ${s.pass})`);
      }
    }
  }
  assert.deepEqual([...new Set(bad)], []);
});

test("le boss final a un DALF C2 blanc complet à proposer", { skip: !has("dalf-langue.json") || !has("dalf-papers.json") }, () => {
  const L = extra.dalfLangue;
  const P = extra.dalfPapers;
  for (const k of ["part1", "part2", "part3"]) assert.ok(L[k]?.length >= 2, `${k} manquant`);
  assert.ok(L.part4?.length >= 12, "part4 : au moins 12 transformations");
  assert.ok(P.comprehensionOrale?.length >= 3, "deux documents oraux par DALF blanc, et un de réserve");
  assert.ok(P.comprehensionEcrite?.length >= 2, "compréhension des écrits");
  assert.ok(P.synthese?.length >= 2 && P.essai?.length >= 2, "synthèses et essais");
  for (const t of L.part4) assert.equal(String(t.q).split("___").length, 2, `part4 ${t.id} : un seul trou`);
  for (const it of L.part1) for (const g of it.gaps) assert.ok(g.answer >= 0 && g.answer < g.choices.length, `${it.id} : réponse hors limites`);
  for (const s of P.synthese) assert.ok(s.documents?.length >= 2, `${s.id} : au moins deux documents`);
});

test("des copies originales (pas les modèles) gagnent les boss d'écriture pour lesquels elles sont écrites", { skip: !existsSync("tests/fixtures/tower-essays.json") || !has("writing.json") }, async () => {
  const { analyze } = await import("../src/writing/analyze.js");
  const { score } = await import("../src/writing/score.js");
  const { copiedShare } = await import("../src/tower.js");
  const essays = JSON.parse(readFileSync("tests/fixtures/tower-essays.json", "utf8")).essays;
  for (const e of essays) {
    const p = extra.writing.prompts.find((x) => x.id === e.prompt) || dalfPrompts().find((x) => x.id === e.prompt);
    assert.ok(p, `sujet ${e.prompt} introuvable`);
    const a = analyze(e.text, p);
    const s = score(a, p);
    assert.ok(copiedShare(e.text, p.model) < 0.35, `${e.prompt} : ressemble à une copie du modèle`);
    assert.deepEqual(a.checks.filter((c) => !c.ok).map((c) => c.label), [], `${e.prompt} : consignes`);
    for (const n of e.floors) assert.ok(s.total >= floorSpec(n).pass, `${e.prompt} : ${s.total}/20 < ${floorSpec(n).pass} (étage ${n})`);
  }
});
