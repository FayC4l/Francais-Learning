# Mission Français — formats des contenus hors niveaux

Les niveaux (`level-XX.json`) et leurs dictées (`extra-XX.json`) sont décrits dans `CONTENT_GUIDE.md`. Ce document
décrit les autres fichiers de `content/`. Après chaque modification : `node tools/validate-v2.mjs` doit afficher
**0 erreur** ; les avertissements « mot inconnu » se lisent un par un (coquille, ou mot à ajouter à
`tools/mots-connus.txt`).

Règles communes : tout est original ; une seule bonne réponse possible ; pas de chiffres dans ce qui est lu à voix
haute (`say`, lignes des documents oraux) ; la typographie française (espaces insécables, guillemets) est ajoutée à
la compilation.

## Règle des trous (`fill`)

`q` contient exactement un `___`. Toutes les réponses de `answer` ont le **même nombre de mots** (une case par mot
dans l'appli). Les rectifications de 1990 et les numéraux avec traits d'union sont acceptés automatiquement : inutile
de les lister. `hint` dit ce qu'on attend (« être, au présent »). `case: true` rend les majuscules obligatoires.

## Erreurs (`error`)

`wrong` est l'index du mot faux quand on découpe `q` par espaces **après typographie** : la ponctuation reste collée au
mot (« fanée. »), et « mot ? » forme un seul mot. `fix` est la correction (un ou plusieurs mots). Pour vérifier :
`node tools/show-errors.mjs content/level-07.json`.

## `boss-XX.json` — 60 questions réservées au boss

```json
{ "level": 7,
  "taunts": { "phase2": ["…"], "phase3": ["…"], "lose": ["…"] },
  "questions": [ { "unit": "7.2", "type": "mcq", "q": "…", "choices": ["…"], "answer": 0, "explain": "…" } ] }
```

Exactement 60 questions, au moins 9 par station, 18 `mcq`, 22 `fill` et 14 `error` ; aucune question ne doit
reprendre une phrase des stations. Au moins 3 répliques par phase. Le niveau 12 est la Tour : sa banque sert aux
étages 46 à 50.

## `lexicon-XX.json` — lexique de l'entraînement du jour

```json
{ "level": 9, "words": [ { "mot": "aménité", "def": "Amabilité, douceur dans les manières.", "ex": "Il nous a reçus avec aménité.", "theme": "les mots rares", "nature": "nom" } ] }
```

Au moins 150 mots ; `nature` parmi nom, verbe, adj, adv, expr, autre ; la définition ne contient pas le mot ; un mot
n'apparaît ni dans les stations (tous niveaux) ni dans un autre lexique ; pas de chiffres dans l'exemple.

## `placement.json` — test de placement

```json
{ "questions": [
  { "id": "p001", "band": "A1", "type": "mcq", "q": "Le chat ___ sur le canapé.", "choices": ["est", "et", "ai", "es"], "answer": 0, "explain": "…" },
  { "id": "p020", "band": "A1", "type": "reading", "text": "…", "q": "…", "choices": ["…", "…", "…", "…"], "answer": 0, "explain": "…" },
  { "id": "p023", "band": "A1", "type": "listening", "say": "…", "q": "…", "choices": ["…"], "answer": 0, "explain": "…" } ] }
```

25 questions par bande (A1 à C2) : au moins 12 `mcq`, 7 `fill`, 3 `reading` (texte de 40 à 120 mots) et 3
`listening` (`say` lu par la voix, sans chiffres). Les `id` ne contiennent que des lettres, des chiffres et `_`.

## `writing.json` — sujets de rédaction

```json
{ "prompts": [ {
  "id": "w07-3", "level": 7, "type": "lettre", "title": "Un voisin bruyant", "ages": ["adulte"],
  "prompt": "…", "words": [120, 180],
  "require": [
    { "kind": "tense", "value": "subjonctif", "min": 2, "label": "Au moins 2 verbes au subjonctif" },
    { "kind": "words", "value": ["certes", "bien que"], "min": 1, "label": "…" },
    { "kind": "connectors", "min": 5, "label": "…" },
    { "kind": "paragraphs", "min": 3, "label": "…" },
    { "kind": "questions", "min": 1, "label": "…" } ],
  "model": "Cher voisin,\n\n…" } ] }
```

- `type` : description, portrait, lettre, courriel, message, recit, dialogue, article, essai, critique,
  compte-rendu, discours, dissertation.
- `tense` : present, imparfait, passe_simple, passe_compose, plus_que_parfait, futur, conditionnel, subjonctif,
  passif.
- 8 sujets par niveau, dont au moins 2 pour les adultes et 2 pour les enfants (`ages` absent = tous les âges).
- Longueurs habituelles : niveaux 1-2 [25, 60], 3-4 [50, 100], 5-6 [80, 140], 7-8 [120, 180], 9-10 [160, 240],
  11-12 [220, 320].
- Le modèle respecte la longueur (± 5 %) et toutes les consignes ; les paragraphes sont séparés par une ligne vide.
  Les sujets des niveaux 9 à 12 servent aux boss d'écriture de la Tour : leurs modèles doivent dépasser la barre de
  l'étage (`npm test`). `node tools/score-models.mjs 9 10 --issues` note chaque modèle avec le vrai correcteur.

## `humor.json` — Chikh Faycal

```json
{ "quips": { "welcome": [ { "text": "…", "ages": ["enfant"] } ], "correct": [], "wrong": [], "streak": [], "timeout": [],
             "perfect": [], "fail": [], "comeback": [], "writing_good": [], "writing_bad": [] },
  "jokes": [ { "level": 4, "text": "…", "explication": "…" } ] }
```

Au moins 20 répliques par situation (140 caractères au plus, `[[ ]]` pour surligner) et 70 blagues de langue
expliquées ; `level` est le niveau à partir duquel la blague est comprise.

## `wordform.json` — formation des mots

```json
{ "items": [ { "level": 10, "stem": "CONVAINCRE", "q": "Son discours était très ___.", "answer": ["convaincant"], "explain": "…" } ] }
```

Au moins 120 items (niveaux 9 à 12) ; `stem` en majuscules ; réponses d'un seul mot, différentes du mot de départ.
Utilisé par la station 9.5 et par la Tour.

## `dalf-langue.json` — maîtrise de la langue

- `part1` (≥ 6) : texte avec les trous `{1}` à `{8}` (140 à 240 mots) ; chaque trou a 4 `choices`, `answer` (index)
  et `explain` : collocations, expressions figées, paronymes.
- `part2` (≥ 6) : même texte à trous, `answer` = liste de mots seuls (prépositions, pronoms, connecteurs).
- `part3` (≥ 6) : idem avec `stem` en majuscules par trou (formation des mots).
- `part4` (≥ 48) : transformations `{ "id", "lead", "key", "q", "answer": [], "explain" }` : `lead` est la phrase de
  départ, `key` le mot imposé (présent dans chaque réponse), `q` la phrase à compléter (un `___`), réponses de 2 à 8
  mots, toutes de même longueur.

## `dalf-papers.json` — épreuves du DALF

- `comprehensionOrale` (≥ 8) : `{ "id", "title", "kind", "lines": [ { "who", "text" } ], "questions": [] }` ; 300 à
  800 mots lus par la voix, sans chiffres ; 4 à 8 questions à 3 ou 4 choix.
- `comprehensionEcrite` (≥ 4) : `{ "id", "title", "source", "text", "questions": [] }` ; 600 à 900 mots, 6 à 8
  questions à 4 choix (inférence, ton, opinion).
- `synthese` (≥ 3) : `{ "id", "title", "consigne", "documents": [ { "title", "source", "text" } ], "words", "require",
  "model" }` ; au moins 2 documents, 600 à 1 200 mots en tout ; modèle objectif, avec un titre, sans avis personnel.
- `essai` (≥ 4) : `{ "id", "title", "prompt", "documents"?, "words", "require", "model" }`.
- `productionOrale` (≥ 8) : `{ "id", "title", "document", "consigne", "followups": [≥ 3], "useful": [4 à 6] }`.

Les modèles de synthèse et d'essai servent au boss d'écriture de l'étage 45 et au DALF blanc final : ils doivent
obtenir au moins 16/20.
