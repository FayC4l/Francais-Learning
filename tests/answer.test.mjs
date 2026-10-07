import { test } from "node:test";
import assert from "node:assert/strict";
import { clean, matches, tiles, tileKey, compareDictation, dictationMark, wordVariants, stripAccents } from "../src/answer.js";

test("nettoyage : apostrophes, ponctuation, espaces, œ", () => {
  assert.equal(clean("  L’école  est   finie ! "), "l'école est finie");
  assert.equal(clean("l' école"), "l'école");
  assert.equal(clean("« Bonjour », dit-il."), "bonjour dit-il");
  assert.equal(clean("Il est venu — enfin — ici"), "il est venu enfin ici");
  assert.equal(clean("peut - être"), "peut être", "un tiret isolé est une ponctuation");
  assert.equal(clean("Le cœur"), "le coeur");
  assert.equal(clean("Vient-il ?"), "vient-il");
  assert.equal(stripAccents("Élève çà"), "Eleve ca");
});

test("les accents et les traits d'union comptent", () => {
  assert.ok(matches("à", ["à"]));
  assert.ok(!matches("a", ["à"]));
  assert.ok(!matches("ou", ["où"]));
  assert.ok(!matches("mangé", ["manger"]));
  assert.ok(matches("peut-être", ["peut-être"]));
  assert.ok(!matches("peut être", ["peut-être"]));
  assert.ok(matches("coeur", ["cœur"]));
  assert.ok(matches("cœur", ["coeur"]));
  assert.ok(matches("l'a", ["l'a"]));
  assert.ok(matches("l’a", ["l'a"]));
  assert.ok(!matches("", ["à"]));
});

test("la casse est ignorée sauf si on la demande ; majuscule sans accent tolérée", () => {
  assert.ok(matches("PARIS", ["Paris"]));
  assert.ok(matches("Ecole", ["école"]));
  assert.ok(matches("Etre", ["être"]));
  assert.ok(!matches("Ecole", ["Ecoles"]));
  assert.ok(matches("les Français", ["les Français"], { caseSensitive: true }));
  assert.ok(!matches("les français", ["les Français"], { caseSensitive: true }));
  assert.ok(matches("Le français", ["le français"], { caseSensitive: true }), "le premier mot est libre");
  assert.ok(matches("Il est à l'Elysée", ["il est à l'Élysée"], { caseSensitive: true }));
});

test("rectifications de 1990 acceptées", () => {
  assert.ok(matches("il connait", ["il connaît"]));
  assert.ok(matches("paraitre", ["paraître"]));
  assert.ok(matches("le gout", ["le goût"]));
  assert.ok(matches("une ile", ["une île"]));
  assert.ok(matches("évènement", ["événement"]));
  assert.ok(matches("événement", ["évènement"]));
  assert.ok(matches("je cèderai", ["je céderai"]));
  assert.ok(matches("ognon", ["oignon"]));
  assert.ok(matches("vingt-et-un", ["vingt et un"]));
  assert.ok(matches("deux-cent-trois", ["deux cent trois"]));
  assert.ok(matches("trois-cents", ["trois cents"]));
  assert.ok(!matches("dix sept", ["dix-sept"]), "on ne retire pas un trait d'union");
  assert.ok(!matches("du", ["dû"]));
  assert.ok(!matches("sur", ["sûr"]));
  assert.ok(!matches("mur", ["mûr"]));
  assert.ok(!matches("il fut", ["qu'il fût"]) && !matches("fut", ["fût"]));
  assert.ok(!matches("nous fumes", ["nous fûmes"]));
  assert.ok(!matches("il crut", ["il croît"]));
  assert.deepEqual(wordVariants("maître"), ["maître", "maitre"]);
  assert.deepEqual(wordVariants("prît"), ["prît"]);
});

test("tuiles et clés de phrase", () => {
  assert.deepEqual(tiles("Où vas-tu ce soir ?"), ["Où", "vas-tu", "ce", "soir"]);
  assert.deepEqual(tiles("« Viens ! » dit-elle."), ["Viens", "dit-elle"]);
  assert.deepEqual(tiles("L'enfant qu'il a vu…"), ["L'enfant", "qu'il", "a", "vu"]);
  assert.equal(tileKey(["Les", "fleurs", "sont", "fanées"]), "les fleurs sont fanées");
});

test("correction de dictée mot à mot", () => {
  const r = compareDictation("Les fleur que j'ai cueilli sont fanée.", "Les fleurs que j'ai cueillies sont fanées.");
  assert.deepEqual(r.words.map((w) => w.status), ["ok", "wrong", "ok", "ok", "wrong", "ok", "wrong"]);
  assert.equal(r.faults, 3);
  assert.equal(dictationMark(r.faults), 14);
  const acc = compareDictation("Il a ete tres content.", "Il a été très content.");
  assert.deepEqual(acc.words.map((w) => w.status), ["ok", "ok", "accent", "accent", "ok"]);
  assert.equal(acc.faults, 1);
  const cap = compareDictation("les enfants jouent à paris.", "Les enfants jouent à Paris.");
  assert.deepEqual(cap.words.map((w) => w.status), ["case", "ok", "ok", "ok", "case"]);
  const miss = compareDictation("Le chat dort.", "Le petit chat dort.");
  assert.deepEqual(miss.words.map((w) => w.status), ["ok", "missing", "ok", "ok"]);
  const homo = compareDictation("Il a mal a la tête.", "Il a mal à la tête.");
  assert.deepEqual(homo.words.map((w) => w.status), ["ok", "ok", "ok", "accent", "ok", "ok"]);
  const extra = compareDictation("Le le chat.", "Le chat.");
  assert.equal(extra.extra.length, 1);
  assert.equal(compareDictation("Ecole fermée.", "École fermée.").faults, 0);
  assert.equal(compareDictation("Il connait la réponse.", "Il connaît la réponse.").faults, 0);
});
