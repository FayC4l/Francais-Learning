# Mission Français — conception

Version française de l'appli familiale **Mission Bilingue** (dépôt `FayC4l/Anglais-Learning`), pour des
**francophones natifs** qui veulent perfectionner leur français, de l'orthographe de l'école primaire jusqu'au
style du **DALF C2**. Projet et site séparés : l'appli anglaise n'est jamais modifiée.

## Décisions prises avec l'utilisateur

- Public : francophones natifs, tous âges (enfants, ados, parents). Explications en français, tutoiement.
- Français de France (pas de Québec) : vocabulaire, repas (petit-déjeuner, déjeuner, dîner), exemples (Paris, Lyon,
  Marseille, la Bretagne…), typographie française (espaces insécables avant `; : ! ?`, guillemets « »).
- Objectif final : DALF jusqu'au C2. Le sommet de la Tour = un DALF C2 blanc complet.
- Niveaux calqués sur le CECRL comme l'appli anglaise, mais pour des natifs : A1 = orthographe du primaire,
  C2 = style et argumentation du supérieur.
- On garde : Chikh Fayçal et son humour pince-sans-rire, la Tour (étages surprises, 200 cœurs), l'écran de
  récompense (un jeu PlayStation de ton choix + 25 $), la dictée comme exercice central avec la voix française,
  les règles du chrono (+10 s par question, réponse tapée envoyée à la fin du temps, +20 s dès l'étage 12).
- Nouveau nom : **Mission Français**. Espace de stockage séparé : `mission-francais:*` (les deux applis
  peuvent vivre dans le même navigateur). Codes de sauvegarde `MF1.…`, sauvegardes `mission-francais-family`.
- Dépôt proposé : `FayC4l/Francais-Learning` (GitHub Pages). **Rien n'est créé ni poussé sur GitHub sans
  l'accord explicite de l'utilisateur.**
- Tout le contenu est original (aucun texte d'examen, aucun extrait protégé).

## Ce qui change par rapport au moteur anglais

| Moteur anglais | Mission Français |
|---|---|
| Étape 2 « Son » (atelier de prononciation) | Étape 2 **« Dictée »** : la voix française dicte un texte (lecture, dictée par groupes de mots avec la ponctuation, relecture), correction mot à mot, fautes expliquées, note sur 20 |
| Vocabulaire `en` / `fr` (traduction) | Vocabulaire `mot` / `def` (définition → mot, mot → définition, orthographe à l'oreille) |
| Phrases `en` / `fr` (construction, dictée) | Phrases `phrase` / `indice` (phrase en désordre avec pièges homophones, dictée) |
| Questions « Écris en anglais », « Que veut dire… » | « Écris le mot », « Que signifie… », « Écoute et écris », « Choisis la bonne orthographe » |
| Conjugueur anglais (≈ 250 verbes) | **Conjugueur français** : 3 groupes, verbes irréguliers et défectifs, tous les modes et temps, temps composés avec accord (être, pronominaux), négation, inversion avec -t- |
| Générateurs (pluriels, comparatifs…) | Générateurs : homophones, accords du participe passé, pluriels et féminins, conjugaison de tous les temps, -é/-er/-ez, transformations |
| Correcteur anglais (SCOWL) | **Correcteur français** : dictionnaire Lexique 3.83 (CC BY-SA 4.0) avec catégorie, genre et nombre, règles des fautes typiques des natifs, note /20 calibrée sur les copies modèles |
| Prépa C2 Proficiency (Cambridge) | **Prépa DALF** : compréhension de l'oral (voix française), compréhension des écrits, maîtrise de la langue, synthèse de documents, essai argumenté, production orale ; DALF blanc noté sur 100 |
| Voix anglaise + coach français | Une seule langue : voix **fr-FR** de préférence (puis fr-BE, fr-CH, fr-CA) |

## Niveaux et stations

| Ligne | CECRL | Titre | Boss |
|---|---|---|---|
| 1 | A1 | Les bases de l'écrit | Monsieur Sans-Accent |
| 2 | A1 | Accorder | La Reine des Pluriels |
| 3 | A2 | Raconter au passé | Le Capitaine Imparfait |
| 4 | A2 | Futur et nuances | Madame Conditionnelle |
| 5 | B1 | Le récit | Le Fantôme du Passé Simple |
| 6 | B1 | Les accords du participe | Le Professeur Participe |
| 7 | B2 | Les modes | Sa Majesté le Subjonctif |
| 8 | B2 | La phrase complexe | Le Seigneur des Subordonnées |
| 9 | C1 | Le mot juste | Le Pléonasme Masqué |
| 10 | C1 | Argumenter | Le Sophiste |
| 11 | C2 | Le style | Le Marquis de Registre |
| 12 | C2 | La Tour de Chikh Fayçal | (50 étages, DALF C2 au sommet) |

Le détail des 60 stations est dans `CONTENT_GUIDE.md` (programme). Chaque station : leçon, dictée, mots,
pratique (mission + mini-jeux), test de 15 questions (85 %). Chaque ligne : un boss à 3 phases, 3 vies.

## La Tour (ligne 12)

Même mécanique que l'appli anglaise (`src/tower.js`) : 50 étages, 5 visibles + le boss final, un étage surprise
à chaque victoire passé le 5e, 200 cœurs pour toute la montée, fuir ou abandonner = un cœur, registre de
l'appareil (`mission-francais:towers`), un boss d'écriture tous les 5 étages, +20 s par question dès l'étage 12.
Blocs :

1. Le présent (étages 1-4) · 2. L'imparfait et le passé composé · 3. Le passé simple · 4. Futur et
conditionnel · 5. L'accord du participe passé · 6. Le subjonctif · 7. Les temps composés et la concordance ·
8. Les accords experts · 9. Temps rares et mot juste · 10. La grande révision C2.

Étage 45 : boss d'écriture au format DALF C2. Étage 50 : DALF C2 blanc complet — compréhension de l'oral
(/25), compréhension des écrits et maîtrise de la langue (/25), production écrite (synthèse /25 et essai
argumenté /25). Il faut **60/100** (le vrai DALF demande 50) et au moins 10 points dans chaque épreuve.

## Réponses et orthographe

- Les accents comptent toujours. La casse est ignorée sauf quand une question l'exige (`"case": true`) et en
  dictée (sauf la majuscule de début de phrase). Une majuscule non accentuée tapée (« Ecole ») est acceptée.
- Les traits d'union comptent (« peut-être » ≠ « peut être »). Apostrophes droites ou courbes acceptées ;
  « oe » accepté pour « œ ».
- Les **rectifications de 1990** sont acceptées partout (accent circonflexe sur i et u sauf exceptions,
  « évènement », « je cèderai », « il étiquète », numéraux composés avec traits d'union…), comme l'appli anglaise
  acceptait l'orthographe britannique et américaine.
- La typographie française est appliquée automatiquement au contenu à la compilation (espace insécable
  avant `; : ! ?`, dans les guillemets).

## Dictionnaire et licence

`tools/fetch-lexique.mjs` télécharge Lexique 3.83 (vendor/, ignoré par git), `tools/make-dict.mjs` en dérive
`data/dict-fr.txt` : formes classées en 3 niveaux de fréquence, avec un masque (nom/adjectif, singulier/pluriel,
masculin/féminin, verbe, infinitif, participe passé). Les formes produites par le conjugueur et les mots du
contenu y sont ajoutés. Données dérivées sous CC BY-SA 4.0, documentées dans `THIRD_PARTY.md`.

## Tests

Comme l'appli anglaise : validateurs de contenu (0 erreur), tests unitaires `node:test` (conjugueur, réponses,
générateurs, correcteur, placement, SRS, Tour, vies, registre…), tests navigateur avec playwright-core et Edge
(`tools/smoke*.mjs`), `tools/monkey.mjs` (clics au hasard), `tools/climb-tower.mjs` (toute la Tour avec un build
de test `MB_TEST=1`).
