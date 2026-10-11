# Mission Français — guide du contenu

L'appli mène des **francophones natifs** (enfants, ados, parents) de l'orthographe du primaire au style du
**DALF C2**. Le moteur est écrit à part ; le contenu est en JSON dans `content/`. Ce guide décrit les formats et le
programme. Après chaque fichier : `node tools/validate.mjs` (niveaux, dictées, missions) ou
`node tools/validate-v2.mjs` (le reste) doit afficher **0 erreur** ; les avertissements « mot inconnu » se lisent un
par un (coquille, ou mot rare à vérifier).

## Règles d'or

1. **Tout est original.** Aucun extrait de manuel, de dictée célèbre, de sujet d'examen ou de roman protégé.
   Les citations classiques du domaine public (Corneille, Racine, Molière, La Fontaine, Hugo…) sont permises en
   très courts exemples de figures de style.
2. **Juste et sans ambiguïté.** Une seule bonne réponse possible avec les indices donnés, ou toutes les bonnes
   réponses listées. Les rectifications de 1990 sont acceptées automatiquement (paraître / paraitre,
   événement / évènement, numéraux avec traits d'union) : inutile de les lister.
3. **Français de France**, registre courant dans les explications, tutoiement, une pointe d'humour (Chikh Faycal,
   le prof, est pince-sans-rire et bienveillant). Repas : petit-déjeuner, déjeuner, dîner. Prénoms et lieux variés
   (Léa, Hugo, Inès, Malik, Chloé, Nathan, Yasmine, Lucas, Sarah, Théo, Jade, Karim… ; Lyon, Marseille, Lille,
   la Bretagne, les Alpes, Bordeaux…).
4. **Familial.** Pas de sujet choquant ; on se moque de la langue, de la situation ou de Chikh Faycal, jamais du
   joueur.
5. **Pas de chiffres dans ce qui est lu à voix haute** (dictées, phrases, textes d'écoute) : les nombres en lettres.
6. La typographie française (espace insécable avant `; : ! ?`, dans les guillemets « ») est ajoutée à la
   compilation : écris simplement `Vraiment ?` ou `« Bonjour »`.

## `content/level-XX.json`

```json
{
  "id": 1, "cefr": "A1", "title": "Les bases de l'écrit", "sub": "Orthographe du primaire",
  "intro": "Deux phrases sur la carte du niveau : ce que tu sauras faire.",
  "boss": { "name": "Monsieur Sans-Accent", "taunt": "Réplique avant le combat.", "defeat": "Réplique quand il perd." },
  "units": [ STATION × 5 ]
}
```

STATION :

```json
{
  "id": "1.4", "name": "Les petits mots jumeaux", "title": "a / à, et / est, son / sont, on / ont",
  "goal": "Choisir le bon homophone grâce aux astuces de remplacement.",
  "lesson": [ BLOC, … ],
  "vocab": [ { "mot": "aujourd'hui", "def": "Le jour où nous sommes.", "ex": "Aujourd'hui, il pleut.", "alt": [] } ],
  "sentences": [ { "phrase": "Léa a perdu son écharpe à la plage.", "indice": "Une écharpe oubliée", "trap": ["à", "sont"], "alt": [] } ],
  "grammar": [ EXERCICE, … ],
  "reading": { "title": "…", "text": "…", "questions": [ { "q": "…", "choices": ["…", "…", "…", "…"], "answer": 2 } ] }
}
```

- `name` : nom de station accrocheur (2 à 5 mots) ; `title` : le contenu précis ; `goal` commence par un verbe.
- **Leçon** (5 à 12 blocs), avec au moins `rule`, `examples` et (`tip` ou `compare`) :
  - `{ "type": "p", "text": "…" }`, `{ "type": "rule", "title": "…", "text": "…" }`,
    `{ "type": "tip", "title": "Piège à éviter", "text": "…" }`, `{ "type": "fun", "text": "Le sais-tu ? …" }`
  - `{ "type": "table", "head": ["…"], "rows": [["…"]] }`
  - `{ "type": "examples", "items": [ { "ex": "Il **a** faim.", "note": "on peut dire « il avait faim »" } ] }`
  - `{ "type": "compare", "title": "…", "items": [ { "ko": "Il a manger.", "ok": "Il a **mangé**.", "why": "…" } ] }`
  - `{ "type": "texte", "title": "…", "text": "Un court texte modèle, lu par la voix." }`
  - Balises : `**gras**`, `[[exemple]]` (puce qui se lit à voix haute), `~~fote~~` (forme fautive barrée,
    ignorée par le vérificateur d'orthographe).
- **Vocabulaire** (12 à 16 mots aux niveaux 1-4, 14 à 20 ensuite) : `mot` (sans ponctuation), `def` (unique dans le
  niveau ; elle doit permettre de retrouver le mot sans ambiguïté), `ex` (phrase qui contient le mot), `alt`
  (autres réponses justes). Niveaux 1-4 : des mots d'usage courant à l'orthographe piège, avec une définition
  simple ; niveaux 5-12 : vocabulaire précis, soutenu, littéraire.
- **Phrases** (8 à 12) : `phrase` finit par . ? ! ou … ; `indice` dit ce qu'il faut construire (le sens, pas les
  mots) ; `trap` = 1 à 3 tuiles pièges (homophones, accords fautifs : « à » pour « a », « mangé » pour
  « manger »…) qui ne sont pas des mots de la phrase ; `alt` = autres ordres justes des mêmes mots. Les phrases
  servent aussi à la **dictée** : elles doivent être dictables.
- **Grammaire** (14 à 18, dont au moins 4 `mcq`, 5 `fill`, 3 `error`), chaque item avec un `explain` qui dit
  pourquoi :
  - `{ "type": "mcq", "q": "Il ___ faim.", "choices": ["a", "à"], "answer": 0, "explain": "…" }`
  - `{ "type": "fill", "q": "Hier, elle est ___ tôt.", "hint": "partir", "answer": ["partie"], "explain": "…" }` —
    `___` une seule fois ; une case par mot (toutes les réponses ont le même nombre de mots) ; `"case": true` si la
    majuscule compte ; `lead` et `key` pour les transformations.
  - `{ "type": "error", "q": "Les enfants joue dehors.", "wrong": 2, "fix": ["jouent"], "explain": "…" }` —
    exactement un mot faux ; `wrong` = son index quand on coupe la phrase aux espaces (la ponctuation reste collée).
- **Lecture** (niveaux 3 à 12) : texte original, 4 à 6 questions à 4 choix, dont des questions d'inférence dès
  le niveau 7. Longueur : 80-160 mots (niv. 3-4), 130-220 (5-6), 180-300 (7-8), 220-400 (9-12).

## `content/extra-XX.json` — dictées et missions

```json
{ "level": 1, "units": [ { "unit": "1.1", "dictee": { "titre": "…", "texte": "…", "points": ["…"] }, "mission": { "type": "ecrit", "prompt": "…", "model": "…", "checklist": ["…"] } } ] }
```

- **Dictée** : texte original, sans chiffres, qui concentre les difficultés de la station (et révise les
  précédentes). Longueur : 25-55 mots (niv. 1-2), 40-75 (3-4), 60-105 (5-6), 80-135 (7-8), 100-160 (9-10),
  120-190 (11-12). `points` : 2 à 6 pièges expliqués (balises permises).
- **Mission** : `oral` ou `ecrit` (alterner) ; consigne concrète de la vie réelle ; `model` = une bonne réponse ;
  `checklist` = 3 à 5 points d'auto-vérification.

## Autres fichiers (formats détaillés dans `docs/CONTENT_FORMATS.md`)

`boss-XX.json` (60 questions réservées au boss), `lexicon-XX.json` (150 mots par niveau pour l'entraînement du
jour), `placement.json` (150 questions, 25 par bande CECRL), `writing.json` (8 sujets de rédaction par niveau avec
copie modèle), `humor.json` (répliques de Chikh Faycal et blagues), `wordform.json` (formation des mots),
`dalf-langue.json` et `dalf-papers.json` (prépa DALF et DALF blancs).

## Programme

| Station | Contenu |
|---|---|
| **Ligne 1 · A1 · Les bases de l'écrit** — boss : Monsieur Sans-Accent | |
| 1.1 Sons et lettres | c / ç, g / ge / gu, s / ss, m devant m, b, p ; les accents é, è, ê |
| 1.2 Le nom et ses déterminants | genre et nombre, pluriel en -s, le / la / les, un / une / des |
| 1.3 Le sujet et le verbe | présent des verbes en -er, être, avoir ; accord sujet-verbe (il chante / ils chantent) |
| 1.4 Les petits mots jumeaux | a / à, et / est, son / sont, on / ont |
| 1.5 La phrase | majuscule et point, types de phrases, ponctuation de base |
| **Ligne 2 · A1 · Accorder** — boss : La Reine des Pluriels | |
| 2.1 Pluriels particuliers | -al / -aux, -ail, -eau / -eu / -au, les sept noms en -ou, -s / -x / -z |
| 2.2 Le féminin | noms et adjectifs : -er / -ère, -eux / -euse, -f / -ve, doublement de consonne, irréguliers |
| 2.3 L'accord dans le groupe nominal | déterminant, nom, adjectif ; adjectif attribut |
| 2.4 Le présent des autres verbes | 2e groupe, aller, faire, dire, prendre, venir, pouvoir, vouloir, voir… |
| 2.5 D'autres jumeaux | ou / où, ce / se, ces / ses / c'est / s'est, mes / mais / met / mets |
| **Ligne 3 · A2 · Raconter au passé** — boss : Le Capitaine Imparfait | |
| 3.1 L'imparfait | formation, -ais / -ait / -aient, nous criions, vous payiez |
| 3.2 Le passé composé avec avoir | participes en -é, -i, -u, -is, -it ; participes irréguliers |
| 3.3 Le passé composé avec être | verbes de mouvement, accord avec le sujet |
| 3.4 -é, -er, -ez, -ait | l'astuce « vendre / vendu », infinitif après préposition |
| 3.5 Jumeaux, suite | la / l'a / là, leur / leurs, peu / peut / peux, ni / n'y |
| **Ligne 4 · A2 · Futur et nuances** — boss : Madame Conditionnelle | |
| 4.1 Le futur simple | radicaux irréguliers (irai, verrai, enverrai, courrai, acquerrai…) |
| 4.2 Le conditionnel présent | -rai / -rais, politesse, hypothèse avec si + imparfait |
| 4.3 Les pronoms compléments | le, la, les, lui, leur, en, y ; place des pronoms |
| 4.4 Les adverbes en -ment | -amment / -emment, adverbes irréguliers |
| 4.5 Encore des jumeaux | quel / qu'elle, quand / quant / qu'en, sans / s'en, si / s'y, dans / d'en |
| **Ligne 5 · B1 · Le récit** — boss : Le Fantôme du Passé Simple | |
| 5.1 Le passé simple (1) | 1er et 2e groupes |
| 5.2 Le passé simple (2) | 3e groupe : -is, -us, -ins |
| 5.3 Passé simple ou imparfait ? | premier plan / arrière-plan ; je mangeai / je mangeais |
| 5.4 Plus-que-parfait et passé antérieur | antériorité, concordance dans le récit |
| 5.5 Le dialogue dans le récit | guillemets, tirets, incises (dit-il, répondit-elle, demanda-t-il) |
| **Ligne 6 · B1 · Les accords du participe** — boss : Le Professeur Participe | |
| 6.1 Être et avoir | révision ; avoir sans COD placé avant |
| 6.2 Le COD placé avant | que, le / la / les, combien de, quel |
| 6.3 Les verbes pronominaux | se laver, se laver les mains, se parler, s'enfuir, se rendre compte |
| 6.4 Les cas particuliers | participe + infinitif, fait et laissé, en, coûté, valu, impersonnels |
| 6.5 Participe présent ou adjectif ? | fatiguant / fatigant, convainquant / convaincant, gérondif |
| **Ligne 7 · B2 · Les modes** — boss : Sa Majesté le Subjonctif | |
| 7.1 Le subjonctif présent | formation, irréguliers, -ions / -iez |
| 7.2 Indicatif ou subjonctif ? | verbes et conjonctions ; après que + indicatif ; espérer que |
| 7.3 Subjonctif passé | antériorité, concordance |
| 7.4 L'impératif | -s des verbes en -er, vas-y, donne-le-moi, aie / sois / sache / veuille |
| 7.5 Hypothèses et conditionnel passé | si + plus-que-parfait, jamais « si j'aurais » |
| **Ligne 8 · B2 · La phrase complexe** — boss : Le Seigneur des Subordonnées | |
| 8.1 Les pronoms relatifs | qui, que, dont, où, lequel, auquel, duquel |
| 8.2 Les subordonnées | cause, conséquence, but, concession, temps ; leur mode |
| 8.3 Le discours rapporté | direct, indirect, indirect libre ; concordance des temps |
| 8.4 La voix passive | tous les temps, accord, complément d'agent |
| 8.5 Négation et interrogation | ne … pas à l'écrit, ne explétif, inversion et -t- |
| **Ligne 9 · C1 · Le mot juste** — boss : Le Pléonasme Masqué | |
| 9.1 Les paronymes | éminent / imminent, effraction / infraction, conjecture / conjoncture… |
| 9.2 Pléonasmes et impropriétés | monter en haut, pallier à, malgré que, anglicismes |
| 9.3 Le vocabulaire soutenu | mots rares et précis |
| 9.4 Expressions et locutions | sens et origine, emplois fautifs |
| 9.5 La formation des mots | préfixes, suffixes, familles, racines grecques et latines |
| **Ligne 10 · C1 · Argumenter** — boss : Le Sophiste | |
| 10.1 Les connecteurs logiques | addition, opposition, concession, cause, conséquence, but |
| 10.2 Construire une argumentation | thèse, arguments, exemples ; plans ; introduction et conclusion |
| 10.3 Concession et opposition | bien que, quoique / quoi que, avoir beau, si … que |
| 10.4 Les figures de style | métaphore, litote, euphémisme, oxymore, chiasme, anaphore… |
| 10.5 Résumer et synthétiser | reformuler, condenser, nominaliser ; règles de la synthèse |
| **Ligne 11 · C2 · Le style** — boss : Le Marquis de Registre | |
| 11.1 Les registres de langue | familier, courant, soutenu ; lettre formelle |
| 11.2 Les accords délicats | tout, même, quelque, couleurs, demi, nu, ci-joint, possible |
| 11.3 Nombres et mots composés | vingt, cent, mille ; pluriel des noms composés |
| 11.4 Les temps rares | subjonctif imparfait et plus-que-parfait, passé antérieur |
| 11.5 Ponctuation et typographie | virgule, point-virgule, deux-points, majuscules, abréviations |
| **Ligne 12 · C2 · La Tour de Chikh Faycal** (stations de révision ouvertes pour la Tour) | |
| 12.1 Conjugaison de haut vol | verbes rares et défectifs |
| 12.2 L'orthographe d'usage | doubles consonnes, accents, mots difficiles |
| 12.3 Les accords experts | participes, accords à sens, sujets inversés |
| 12.4 La synthèse et l'essai | méthode DALF |
| 12.5 Le style C2 | variété, précision, rythme, nominalisation, élégance |
