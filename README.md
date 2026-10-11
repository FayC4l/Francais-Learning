# Mission Français

L'appli de français de toute la famille, pour des **francophones natifs** : de l'orthographe des premières années
jusqu'au style du **DALF C2**. Orthographe, homophones, accords, conjugaison, grammaire, syntaxe, vocabulaire soutenu,
style et rédaction, avec des explications en français et un objectif : le DALF C2. Français de France ; les
rectifications orthographiques de 1990 sont acceptées partout.

## Ce qu'il y a dedans

- **Profils familiaux** : écran « Qui joue ? », un profil par personne (prénom, avatar, âge enfant / ado / adulte),
  progression séparée, sauvegarde par fichier ou par code.
- **Sauvegarde quotidienne** : rappel une fois par jour sur la carte (téléchargement en un clic) et, sur ordinateur
  avec Chrome ou Edge, fichier de sauvegarde mis à jour automatiquement.
- **Test de placement adaptatif** (A1 → C2, 150 questions) : les questions montent ou descendent selon tes réponses,
  puis tu commences à la bonne ligne.
- **11 lignes, 55 stations, 11 boss** : leçon narrée, **dictée** lue par la voix française (groupes de mots, ponctuation
  dite à voix haute, relecture, correction mot à mot et note sur 20), mots, 9 mini-jeux, mission orale ou écrite,
  test de 15 questions.
- **Niveau 12 : la Tour de Chikh Faycal** : 50 étages, un boss à chaque étage (conjugaison de plus en plus dure,
  accords experts, temps rares, mot juste, et un boss d'expression écrite tous les 5 étages), 200 cœurs pour toute la
  montée, les leçons de révision du niveau 12 ouvertes depuis la Tour, et au sommet un **DALF C2 blanc complet**
  (60 points sur 100 pour gagner).
- **Difficulté unique « Moyenne +++ »** : 85 % pour réussir un test, chrono serré (10 secondes de bonus, et la réponse
  déjà tapée est corrigée quand le temps est écoulé).
- **3 vies par boss** : sans vie, les stations du niveau sont « à refaire ».
- **Boss imprévisibles** : 3 phases, 60 questions réservées par boss, générateurs de questions et mémoire
  anti-répétition.
- **Conjugueur** de référence (776 verbes, tous les temps et tous les modes, formes négatives et interrogatives) et
  entraînement par verbe.
- **Entraînement du jour** : répétition espacée de Leitner (5 boîtes) avec les mots étudiés, les erreurs du carnet et
  1 831 mots de lexique.
- **Atelier d'écriture** : 96 sujets avec copie modèle (8 par niveau, adaptés à l'âge), correcteur intégré
  (dictionnaire de Lexique 3.83, 90 règles sur les fautes typiques : homophones, accords, participes, élisions,
  ponctuation…), note sur 20 en 4 critères et niveau CECRL estimé. Option : correction par Claude (clé API à saisir
  dans le profil).
- **Prépa DALF C1-C2** : maîtrise de la langue (textes à trous, formation des mots, 48 transformations),
  compréhension des écrits, compréhension de l'oral, synthèse de documents, essai argumenté, production orale, et DALF
  blancs notés sur 100. Tous les textes sont originaux.
- **Tableau de bord** : radar des compétences, niveau estimé, certificats imprimables.
- **Chikh Faycal**, le prof de français de l'appli, pince-sans-rire et bienveillant : 220 répliques et une blague de
  langue par jour (78 jeux de mots expliqués).

## Jouer

Ouvre `index.html` dans Chrome, Edge ou Safari. Tout fonctionne hors ligne, sauf la correction par IA. Pour les
dictées, il faut une voix française (fr-FR) installée sur l'appareil ; sans voix, la dictée peut être passée.

### Correction par IA (optionnelle)

Dans Profil → « Correcteur IA (optionnel) », colle une clé API Anthropic (console.anthropic.com). La clé reste dans
ce navigateur, n'est jamais incluse dans les sauvegardes, et chaque correction est facturée sur le compte de la clé.
Modèle par défaut : Claude Opus 5.5.

## Développer

```bash
npm install
npm run validate     # vérifie tout le contenu (niveaux, dictées, boss, lexiques, DALF…)
npm test             # tests unitaires (conjugueur, générateurs, placement, SRS, correcteur, Tour…)
npm run build        # régénère index.html (minifié ; --dev pour la version lisible)
npm run smoke        # tests navigateur (Playwright + Chrome ou Edge installé)
node tools/climb-tower.mjs    # la Tour en entier comme un joueur parfait (build de test)
node tools/monkey.mjs         # des centaines de clics au hasard (ordinateur et téléphone)
node tools/quick-check.mjs 7.3   # une station de bout en bout dans le navigateur
node tools/score-models.mjs 12   # note les copies modèles avec le vrai correcteur
npm run dict         # régénère data/dict-fr.txt depuis Lexique 3.83 (téléchargement de 25 Mo)
```

Sous Windows avec PowerShell 5.1 : enregistrer les scripts `.ps1` en UTF-8 avec BOM, et passer les messages de commit
par un fichier (`git commit -F`). Les sources sont en fins de ligne LF (`.gitattributes`).

## Contenu

| Fichier | Contenu | Règles |
|---|---|---|
| `content/level-XX.json` | 5 stations par niveau : leçons, mots, phrases, grammaire, lectures | `CONTENT_GUIDE.md` |
| `content/extra-XX.json` | dictées et missions | `CONTENT_GUIDE.md` |
| `content/boss-XX.json` | 60 questions réservées au boss + répliques | `docs/CONTENT_FORMATS.md` |
| `content/lexicon-XX.json` | 150 mots de plus par niveau (entraînement du jour) | idem |
| `content/placement.json` | 150 questions du test de placement | idem |
| `content/writing.json` | 96 sujets de rédaction avec copie modèle | idem |
| `content/humor.json` | répliques de Chikh Faycal et blagues | idem |
| `content/wordform.json` | formation des mots (niveaux 9 à 12) | idem |
| `content/dalf-langue.json`, `content/dalf-papers.json` | épreuves du DALF | idem |
| `content/mentor.json` | images de Chikh Faycal | — |

Code : `src/` (moteur en JavaScript sans framework, un seul fichier HTML produit par esbuild). Le code pur
(conjugueur, générateurs, anti-répétition, placement, SRS, correcteur) est dans `src/engine/`, `src/placement.js`,
`src/srs.js` et `src/writing/`, et testé dans `tests/`.

Licences des données et bibliothèques tierces : `THIRD_PARTY.md`. Les photos de famille et les vidéos privées ne sont
jamais versionnées ni publiées (`.gitignore`).
