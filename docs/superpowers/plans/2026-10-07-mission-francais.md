# Mission Français — plan de réalisation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan
> task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** une appli « Mission Français » (un seul HTML, hors ligne) qui mène des francophones natifs de
l'orthographe du primaire au DALF C2, en réutilisant le moteur de Mission Bilingue.

**Architecture:** copie du moteur vanilla JS (modules ES groupés par esbuild dans `index.html`, contenu JSON
injecté en `window.__CONTENT__` / `__EXTRA__` / `__DICT__`). Le code pur (conjugueur, réponses, générateurs,
correcteur, placement, SRS, Tour) est testé avec `node:test` ; l'interface avec playwright-core + Edge.

**Tech Stack:** Node 22, esbuild 0.28, playwright-core 1.63, @anthropic-ai/sdk (correction IA optionnelle),
Lexique 3.83 (CC BY-SA 4.0).

Conception : `docs/superpowers/specs/2026-10-07-mission-francais-design.md`.

---

## Phase 0 — Projet

- [x] Créer `E:\work\Anglais\Francais-Learning`, copier `build.mjs`, `src/`, `tests/`, `tools/`,
  `assets/chikh-faycal-avatar.png`, `content/mentor.json` (jamais `assets/bilal|hamza|lynda`, ni `video/`).
- [x] `git init -b main`, `.gitignore` (+ `vendor/`), `package.json` (`mission-francais`), `npm install`.
- [x] `tools/fetch-lexique.mjs` → `vendor/Lexique383.tsv`.
- [ ] Commit « chore: copy the Mission Bilingue engine ».

## Phase 1 — Moteur pur (TDD)

### Tâche 1.1 — Stockage et identité
- Modifier `src/storage.js` : `mission-francais:v1|global|p:<id>`, sonde `mission-francais:probe`.
- Modifier `src/store.js` : codes `MF1.`, registre `mission-francais:towers`, rangs et badges français,
  étapes `lesson / dictee / words / practice / test`.
- Modifier `src/profiles.js` : sauvegardes `mission-francais-family` / `mission-francais-profile`.
- Tests : `tests/profiles.test.mjs`, `tests/lives.test.mjs`, `tests/tower-register.test.mjs` adaptés.

### Tâche 1.2 — Réponses françaises (`src/answer.js`)
- `clean(s)` : minuscules, NFC, apostrophes, ponctuation retirée, traits d'union gardés, `œ`→`oe`.
- `variants(word)` : rectifications 1990 (circonflexe i/u sauf exceptions, liste de doublets).
- `matches(typed, accepted, { caseSensitive })` : comparaison mot à mot (majuscule non accentuée tolérée).
- `tiles`, `tileKey`, `diffWords` (dictée, LCS sur les mots, fautes d'accent repérées).
- Tests : `tests/answer.test.mjs` (accents, traits d'union, circonflexe, casse, dictée).

### Tâche 1.3 — Conjugueur (`src/engine/conjugue.js`)
- Données : verbes du 1er groupe (règles -cer, -ger, -yer, -eler/-eter, e/è, é/è), 2e groupe, modèles du
  3e groupe + dérivés par préfixe, défectifs, h aspiré, auxiliaire, pronominaux, PP invariables.
- `conjugate(inf, tense, person, { gender, neg, question, pronominal })` → chaîne ; `accepted(...)` → variantes.
- Temps : indicatif (8), subjonctif (4), conditionnel (2), impératif (2), participes, infinitif passé, gérondif.
- Tests : `tests/conjugue.test.mjs` (≈ 200 formes de référence, dont acquérir, s'asseoir, résoudre, mouvoir,
  naître, devoir, envoyer, haïr, clore, accords être/pronominaux, négation, inversion -t-).

### Tâche 1.4 — Générateurs (`src/engine/generators.js`)
- Homophones (a/à, et/est, son/sont, on/ont, ou/où, ce/se, ces/ses/c'est/s'est, la/l'a/là, leur/leurs,
  peu/peut/peux, quel(le)/qu'elle, quand/quant/qu'en, sans/s'en, ni/n'y, si/s'y, dans/d'en, -é/-er/-ez),
  pluriels, féminins, accords GN, PP (être, avoir + COD avant, pronominaux), conjugaison de chaque temps,
  `conj` (tous temps, pour la Tour), transformations (passif, discours indirect), nombres en lettres,
  formation des mots (`content/wordform.json`).
- Référence stable `gen:<id>|<params>` (carnet d'erreurs, SRS).
- Tests : `tests/generators.test.mjs` (chaque générateur produit des questions valides, rejouables).

### Tâche 1.5 — Questions (`src/questions.js`)
- Genres : `type_mot`, `choose_def`, `listen_type`, `spell_choose`, `build`, `dictation`, `mcq`, `fill`,
  `error`, `reading`, `listening`. `spell_choose` = choisir la bonne orthographe d'un mot entendu
  (distracteurs générés : doubles consonnes, accents, -ent/-ant…).
- `unitTest`, `bossExam`, `towerExam` inchangés dans leur logique.

### Tâche 1.6 — Tour (`src/tower.js`)
- Blocs français (tenses = ids du conjugueur), étage 45 DALF, étage 50 `final` DALF (60/100).
- Tests : `tests/tower.test.mjs`, `tests/tower-exams.test.mjs`.

### Tâche 1.7 — Correcteur (`src/writing/`)
- `tools/make-dict.mjs` → `data/dict-fr.txt` (3 niveaux + masque) ; `src/writing/spell.js` (tierOf, tagsOf,
  suggest avec accents).
- `src/writing/rules.js` : règles des natifs (homophones, accords GN et sujet-verbe, -é/-er, PP avec être et
  avoir, « si j'aurais », « malgré que », pléonasmes, « pallier à », « se rappeler de », ponctuation,
  majuscules, typographie) ; `analyze.js` (temps, connecteurs, registre) ; `score.js` (/20, 4 critères).
- `src/writing/ai.js` : consigne française (correction de natifs, critères DALF).
- Tests : `tests/writing.test.mjs` + `tools/calibrate-bands.mjs` (modèles notés ≥ 16/20, copies fautives < 10).

## Phase 2 — Interface

- `src/audio.js` (voix fr-FR), `src/mic.js` (fr-FR), `src/humor.js` (blagues françaises).
- `src/screens/unit.js` : étape Dictée (lecture, dictée avec ponctuation, relecture, correction /20).
- `src/screens/*` : textes, carte, boss, Tour, conjugueur (tableaux type Bescherelle), entraînement du jour,
  placement, profil, tableau de bord (certificats), sauvegarde, atelier d'écriture.
- `src/screens/dalf.js` (remplace `c2.js`) : épreuves et DALF blanc noté sur 100.
- `src/games/*` : jeux adaptés (mot ↔ définition, orthographe, dictée flash, phrases en désordre).
- `build.mjs` : titre, `lang="fr"`, typographie française du contenu, dictionnaire `data/dict-fr.txt`.

## Phase 3 — Contenu (niveau par niveau, validateurs à 0 erreur)

- `CONTENT_GUIDE.md` (programme des 60 stations, formats, règles) et `docs/CONTENT_FORMATS.md`.
- `tools/validate.mjs` (niveaux), `tools/validate-extra.mjs` (dictées, missions), `tools/validate-v2.mjs`
  (boss, lexiques, placement, écriture, humour, formation des mots, DALF) ; chaque texte français passe aussi
  au dictionnaire (mots inconnus signalés).
- Pour chaque ligne 1 → 12 : `content/level-XX.json`, `extra-XX.json` (dictées + missions), `boss-XX.json`,
  `lexicon-XX.json` ; puis `placement.json`, `writing.json`, `humor.json`, `wordform.json`,
  `dalf-langue.json`, `dalf-papers.json`.

## Phase 4 — Vérification

- `npm test`, `npm run validate`, `npm run build`, `npm run smoke`, `node tools/monkey.mjs`,
  `node tools/climb-tower.mjs` (essais originaux en français dans `tests/fixtures/tower-essays.json`).
- README, THIRD_PARTY.md. Commit. **Demander l'accord** avant de créer `FayC4l/Francais-Learning` et de pousser.
