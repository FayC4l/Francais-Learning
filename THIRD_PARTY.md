# Données et bibliothèques tierces

## Dictionnaire du correcteur — Lexique 3.83 (CC BY-SA 4.0)

Le dictionnaire orthographique du correcteur d'écriture (`data/dict-fr.txt`) est dérivé de la base lexicale
**Lexique 3.83** (www.lexique.org), distribuée sous licence **Creative Commons Attribution – Partage dans les
mêmes conditions 4.0 International (CC BY-SA 4.0)**.

- Source : https://www.lexique.org/databases/Lexique383/Lexique383.tsv (téléchargée par `tools/fetch-lexique.mjs`
  dans `vendor/`, qui n'est pas versionné).
- Transformation : `tools/make-dict.mjs` ne garde que l'orthographe, une classe de fréquence (trois niveaux) et la
  catégorie grammaticale de chaque forme, puis ajoute les formes produites par le conjugueur de l'appli.
- Licence du fichier dérivé : `data/dict-fr.txt` est distribué sous la même licence, CC BY-SA 4.0.

Références à citer :

- New, B., Pallier, C., Brysbaert, M., & Ferrand, L. (2004). Lexique 2 : A New French Lexical Database.
  *Behavior Research Methods, Instruments, & Computers*, 36(3), 516-524.
- New, B., Pallier, C., Ferrand, L., & Matos, R. (2001). Une base de données lexicales du français contemporain sur
  internet : LEXIQUE. *L'Année Psychologique*, 101, 447-462.

Texte de la licence : https://creativecommons.org/licenses/by-sa/4.0/deed.fr

## SDK Anthropic pour TypeScript (`@anthropic-ai/sdk`)

Inclus dans la page pour la correction par IA, optionnelle. Licence MIT, © Anthropic, PBC.

## Polices (Google Fonts)

Chargées depuis Google Fonts quand une connexion est disponible : Atkinson Hyperlegible, Bricolage Grotesque et
JetBrains Mono, toutes trois sous licence SIL Open Font License 1.1.

## esbuild, playwright-core

Outils de construction et de test uniquement (ils ne sont pas inclus dans la page). Licences MIT et Apache-2.0.

## Contenu pédagogique

Toutes les leçons, dictées, lectures, sujets, documents DALF et blagues ont été écrits pour Mission Français. Les
seules citations sont de très courts exemples tirés d'auteurs du domaine public (Corneille, Molière, La Fontaine,
Hugo…), employés pour illustrer une figure de style.
