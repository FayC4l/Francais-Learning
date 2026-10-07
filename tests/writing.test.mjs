import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loadDictionary, tierOf, suggest, maskOf, TAGS } from "../src/writing/spell.js";
import { tokenize, countWords } from "../src/writing/tokenize.js";
import { checkRules } from "../src/writing/rules.js";
import { analyze } from "../src/writing/analyze.js";
import { score } from "../src/writing/score.js";

loadDictionary(readFileSync(new URL("../data/dict-fr.txt", import.meta.url), "utf8"));
const issues = (text) => checkRules(tokenize(text)).map((x) => ({ ...x, text: text.slice(x.start, x.end) }));
const finds = (text, rule, fix) => {
  const found = issues(text).find((x) => x.rule === rule);
  assert.ok(found, `${rule} attendu dans « ${text} » : ${JSON.stringify(issues(text).map((x) => x.rule))}`);
  if (fix) assert.ok(found.fix.includes(fix), `${rule} : ${fix} attendu, reçu ${found.fix}`);
};

test("dictionnaire : formes, rectifications, ligatures, composés", () => {
  for (const w of ["école", "élève", "sœur", "soeur", "cœur", "connaît", "connait", "paraître", "paraitre", "évènement", "aujourd'hui", "peut-être", "dit-il", "mange-t-il", "acquerrai", "cèderai", "vînmes", "fussions"]) assert.ok(tierOf(w) > 0, w);
  for (const w of ["dilemne", "parmis", "acceuil", "apeler", "rénumération"]) assert.equal(tierOf(w), 0, w);
  assert.ok(maskOf("robe") & TAGS.NS && maskOf("robe") & TAGS.F);
  assert.ok(maskOf("manger") & TAGS.INF);
  assert.equal(suggest("acceuil")[0], "accueil");
  assert.equal(suggest("parmis")[0], "parmi");
  assert.equal(suggest("eleve")[0], "élève");
});

test("découpage : élisions séparées, mots composés gardés, comptage DALF", () => {
  const tk = tokenize("L'enfant qu'il a vu aujourd'hui, c'est-à-dire hier.");
  assert.deepEqual(tk.tokens.filter((t) => t.word).map((t) => t.text), ["L'", "enfant", "qu'", "il", "a", "vu", "aujourd'hui", "c'est-à-dire", "hier"]);
  assert.equal(countWords("Je ne l'ai pas vu depuis 2010, c'est-à-dire longtemps."), 9);
});

test("homophones et confusions", () => {
  finds("Il à faim.", "a-subject", "Il a");
  finds("Il y à du monde.", "il-y-a", "Il y a");
  finds("Je pars a cause de la pluie.", "a-expression", "à cause");
  finds("Elle et fatiguée.", "et-est", "est");
  finds("Ils on raison.", "on-ont", "ont");
  finds("Ont va au cinéma.", "on-ont", "On");
  finds("Ils son partis.", "son-sont", "sont");
  finds("La ville ou je suis né.", "ou-lieu", "ville où je");
  finds("Ou est mon sac ?", "ou-question", "Où est");
  finds("Il ce lave les mains.", "ce-se", "se");
  finds("Il c'est trompé.", "ces-sest", "Il s'est trompé");
  finds("Sa va bien.", "sa-ca", "Ça va");
  finds("Je leurs ai dit la vérité.", "leur-verb", "leur");
  finds("Ils ont pris leur enfants.", "leur-plural", "leurs");
  finds("Tout les jours, il court.", "tout-les", "Tous les");
  finds("Il a du partir.", "du-du", "a dû partir");
  finds("Je suis sur qu'il viendra.", "sur-sur");
  finds("Quand à moi, je reste.", "quand-a", "Quant à");
});

test("accords", () => {
  finds("Les enfant jouent.", "plural", "enfants");
  finds("Des fleurs blanche.", "adj-agreement", "blanches");
  finds("Une robe bleu.", "adj-agreement", "bleue");
  finds("Un autoroute dangereux.", "gender", "Une");
  finds("Elle est parti tôt.", "etre-agreement", "partie");
  finds("Ils sont arrivé hier.", "etre-agreement", "arrivés");
  finds("Elles ont mangées une glace.", "avoir-agreement", "mangé");
  finds("Ma amie arrive.", "mon-amie", "Mon");
});

test("conjugaison, -é / -er, modes", () => {
  finds("Ils mange des pommes.", "subject-verb", "mangent");
  finds("Je peut venir.", "subject-verb", "peux");
  finds("Tu mange trop.", "subject-verb", "manges");
  finds("Il fini son travail.", "subject-verb-form", "finit");
  finds("Je vais mangé une pomme.", "e-er", "manger");
  finds("Hier, j'ai manger une tarte.", "er-e", "mangé");
  finds("Il faut que tu fais tes devoirs.", "subjunctive", "fasses");
  finds("Si j'aurais su, je serais venu.", "si-conditionnel", "avais");
  finds("Ils croivent tout.", "croivent", "croient");
  finds("Vous faisez du bruit.", "faisez", "Vous faites");
  finds("On a pas fini.", "ne-missing", "n'a");
  finds("Je sais pas.", "ne-missing", "ne sais");
});

test("élisions, majuscules, ponctuation, usage", () => {
  finds("Le arbre est grand.", "elision", "L'arbre");
  finds("Je ai faim.", "elision", "J'ai");
  finds("Si il pleut, on reste.", "elision-si", "S'il");
  finds("le chat dort.", "capital-start", "Le");
  finds("Nous partirons Lundi.", "capital-day", "lundi");
  finds("Il faut pallier à ce problème.", "pallier-a", "pallier");
  finds("Je me rappelle de cette histoire.", "rappeler-de");
  finds("Il monte en haut de la tour.", "pleonasme-monter", "monte");
  finds("Malgré qu'il pleuve, nous sortons.", "malgre-que", "Bien qu'");
  finds("Il sétait trompé.", "spelling", "s'était");
});

test("aucune fausse alerte sur des textes corrects", () => {
  const ok = [
    "Ce matin-là, Léa se leva avant l'aube. Elle prit son vélo et partit vers la mer, où son grand-père l'attendait depuis la veille. Quand elle arriva, il avait déjà préparé le café.",
    "Bien qu'il fasse froid, nous sortirons ce soir. Il faut que tu prennes ton manteau et que vous soyez prêts à huit heures. Si nous avions su, nous serions partis plus tôt.",
    "Les lettres que j'ai reçues hier m'ont beaucoup ému. Mes sœurs les ont lues avant moi, puis elles se sont téléphoné. Elles se sont rendu compte que leur oncle avait raison.",
    "Certes, ces outils offrent des avantages indéniables : on peut accéder à une quantité d'informations considérable. Toutefois, il convient de s'interroger sur leurs effets.",
    "Il était une fois une princesse qui vivait dans un château entouré de forêts. Lui et elle sont partis ensemble ; avec elle et lui, on rit beaucoup.",
    "Elle est allée au marché avec sa mère. Elles y ont acheté des fraises. Ensuite, elles sont rentrées à la maison pour préparer une tarte.",
    "Je ne pense pas que ce projet soit réaliste. Néanmoins, j'admets que ses auteurs ont fourni un travail remarquable. Je ne sais pas s'il viendra demain.",
  ];
  for (const t of ok) assert.deepEqual(issues(t).filter((x) => x.cat !== "typo").map((x) => `${x.rule}:${x.text}`), [], t);
});

test("analyse : temps, connecteurs, registre ; note sur 20", () => {
  const good = "Les nouvelles technologies transforment profondément notre manière de travailler. Certes, elles offrent des avantages indéniables : on peut communiquer plus vite. Toutefois, il convient de s'interroger sur leurs effets à long terme.\n\nEn effet, la dépendance aux écrans inquiète de nombreux spécialistes. Si nous ne faisons rien, nous le regretterons. Il faudrait que les écoles enseignent un usage raisonné du numérique, comme on l'a fait autrefois pour la lecture.\n\nEn définitive, ces outils ne sont ni bons ni mauvais en eux-mêmes : tout dépend de l'usage que nous en faisons. C'est pourquoi chacun devrait apprendre à s'en servir avec discernement.";
  const bad = "Les nouvelle technologie transforme notre facon de travailler. Ont peut communiquer plus vite, mais sa pose des probleme. Les jeune passe trop de temps sur leurs écran et ils sont crevé. Si on aurait su, on aurait agis avant. Du coup, c'est pas simple.";
  const p = { level: 10, type: "essai", words: [100, 200], require: [{ kind: "paragraphs", min: 3, label: "3 paragraphes" }, { kind: "tense", value: "conditionnel", min: 1, label: "conditionnel" }] };
  const a = analyze(good, p);
  assert.ok(a.tenses.present > 3 && a.tenses.conditionnel >= 1 && a.tenses.futur >= 1 && a.tenses.subjonctif >= 1, JSON.stringify(a.tenses));
  assert.ok(a.connectors.certes && a.connectors.toutefois && a.advancedConnectors.includes("en définitive"));
  assert.ok(a.checks.every((c) => c.ok));
  const sg = score(a, p);
  const sb = score(analyze(bad, p), p);
  assert.ok(sg.total >= 16, `bon texte : ${sg.total}`);
  assert.ok(sb.total <= 9, `texte fautif : ${sb.total}`);
  assert.ok(analyze(bad, p).familiar >= 2);
});
