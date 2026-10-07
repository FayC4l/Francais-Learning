import { test } from "node:test";
import assert from "node:assert/strict";
import { GENERATORS, generate, regen, conjQuestion, generatorsOf, generatorsUpTo } from "../src/engine/generators.js";
import { makeRng } from "../src/engine/rng.js";
import { wordCountMismatches } from "../src/fill.js";
import { numberToFrench, misspell } from "../src/engine/french.js";
import { wordVariants } from "../src/answer.js";

const valid = (q, id) => {
  assert.ok(q.ref?.startsWith(`gen:${id}|`), `${id} ref`);
  assert.ok(["fill", "mcq", "error", "type_mot"].includes(q.kind), `${id} kind ${q.kind}`);
  if (q.kind === "fill") {
    assert.equal(q.q.split("___").length, 2, `${id}: un seul trou : ${q.q}`);
    assert.ok(q.accept.length && q.accept.every((a) => a && a.trim() === a), `${id}: réponses ${q.accept}`);
    assert.deepEqual(wordCountMismatches(q.accept), [], `${id}: même nombre de mots ${q.accept}`);
    assert.ok(!/\bnull\b|\bundefined\b/.test(q.q + q.hint + q.accept.join()), `${id}: ${q.q}`);
  }
  if (q.kind === "mcq") {
    assert.ok(q.choices.length >= 2 && q.answer >= 0 && q.choices[q.answer] === q.expected, `${id} mcq`);
    assert.equal(new Set(q.choices.map((c) => c.toLowerCase())).size, q.choices.length, `${id}: choix distincts ${q.choices}`);
  }
  if (q.kind === "error") assert.ok(q.tokens[q.wrong] && q.accept.length, `${id} error`);
  if (q.kind === "type_mot") assert.ok(q.def && q.accept.length, `${id} type`);
  assert.ok(q.explain, `${id}: explication`);
};

test("chaque générateur produit des questions valides et rejouables", () => {
  const rng = makeRng(7);
  for (const g of GENERATORS) {
    if (g.id === "wordform") continue; // needs content/wordform.json
    let made = 0;
    for (let k = 0; k < 120; k++) {
      const q = generate(g.id, rng, 12);
      if (!q) continue;
      made++;
      valid(q, g.id);
      const again = regen(q.ref);
      assert.deepEqual(again, q, `${g.id}: même question depuis la référence`);
    }
    assert.ok(made >= 100, `${g.id}: ${made}/120 questions produites`);
  }
});

test("chaque station 1.1 à 11.5 a au moins un générateur, sauf les stations de contenu", () => {
  const content = new Set(["8.2", "9.3", "9.4", "10.2", "12.4", "12.5"]);
  for (let L = 1; L <= 12; L++) for (let U = 1; U <= 5; U++) {
    const uid = `${L}.${U}`;
    if (!content.has(uid)) assert.ok(generatorsOf(uid).length > 0, `station ${uid}`);
  }
  assert.ok(generatorsUpTo("3.5").every((g) => Number(g.unit.split(".")[0]) <= 3));
});

test("questions de conjugaison pour la Tour", () => {
  const rng = makeRng(3);
  for (let k = 0; k < 300; k++) {
    const q = conjQuestion(rng, { tenses: ["subj_present", "passe_simple"], negQ: 0.5 });
    assert.ok(q, "question");
    valid(q, "conj");
    assert.ok(/subjonctif présent|passé simple/.test(q.hint), q.hint);
  }
});

test("nombres en lettres (orthographe traditionnelle)", () => {
  const n = { 0: "zéro", 1: "un", 17: "dix-sept", 21: "vingt et un", 71: "soixante et onze", 72: "soixante-douze", 80: "quatre-vingts", 81: "quatre-vingt-un", 91: "quatre-vingt-onze", 99: "quatre-vingt-dix-neuf", 100: "cent", 101: "cent un", 200: "deux cents", 280: "deux cent quatre-vingts", 203: "deux cent trois", 1000: "mille", 2000: "deux mille", 80000: "quatre-vingt mille", 200000: "deux cent mille", 1980: "mille neuf cent quatre-vingts", 5321: "cinq mille trois cent vingt et un" };
  for (const [k, v] of Object.entries(n)) assert.equal(numberToFrench(Number(k)), v, k);
});

test("les fautes d'orthographe générées ne sont jamais des variantes acceptées", () => {
  const rng = makeRng(1);
  for (const w of ["appeler", "événement", "connaître", "dilemme", "parallèle", "abîme", "rythme", "garçon"]) {
    const wrong = misspell(w, rng, 5);
    assert.ok(wrong.length >= 2, `${w}: ${wrong}`);
    const ok = wordVariants(w);
    for (const x of wrong) assert.ok(!ok.includes(x) && x !== w, `${w} → ${x}`);
  }
});
