import { test } from "node:test";
import assert from "node:assert/strict";
import { gapWords, joinBoxes, wordCountMismatches } from "../src/fill.js";

test("une case par mot attendu", () => {
  assert.deepEqual(gapWords("ne mange pas"), ["ne", "mange", "pas"]);
  assert.deepEqual(gapWords("s'est-il levé"), ["s'est-il", "levé"]);
  assert.deepEqual(gapWords(" à "), ["à"]);
});

test("les cases sont réunies en une réponse", () => {
  assert.equal(joinBoxes(["ne ", " mange", "", "pas"]), "ne mange pas");
});

test("toutes les réponses acceptées ont le même nombre de mots", () => {
  assert.deepEqual(wordCountMismatches(["me suis levé", "me suis levée"]), []);
  assert.deepEqual(wordCountMismatches(["a", "à la"]), ["à la"]);
  assert.deepEqual(wordCountMismatches(["peut-être", "peut être"]), ["peut être"]);
});
