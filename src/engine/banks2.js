// Hand-written banks for the French question generators, part 2 (original sentences). Pure data.

// Spelling rules of the first station (ç, ge, gu, m before m / b / p): [word, wrongs, rule].
export const LETTRES = [
  ["garçon", ["garcon", "garsson"], "Devant a, o, u, le c fait [k] : pour entendre [s], on ajoute une cédille → ç."], ["leçon", ["lecon", "lesson"], "Devant o, il faut la cédille pour faire [s] : leçon."],
  ["reçu", ["recu", "ressu"], "Devant u, la cédille fait [s] : reçu."], ["glaçon", ["glacon", "glasson"], "Devant o, la cédille fait [s] : glaçon."], ["maçon", ["macon", "masson"], "Devant o, cédille : maçon."],
  ["français", ["francais", "franssais"], "Devant a, la cédille fait [s] : français."], ["déçu", ["décu", "déssu"], "Devant u, cédille : déçu."], ["citron", ["çitron", "sitron"], "Devant i et e, le c fait déjà [s] : pas de cédille."],
  ["pigeon", ["pigon", "pijon"], "Pour faire [ʒ] devant o, on ajoute un e : ge → pigeon."], ["nageoire", ["nagoire", "najoire"], "Devant o, on écrit ge pour garder le son [ʒ] : nageoire."], ["plongeon", ["plongon", "plonjon"], "Devant o, ge : plongeon."],
  ["guitare", ["gitare", "ghitare"], "Devant i et e, le g fait [ʒ] : pour entendre [g], on ajoute un u → gui."], ["guêpe", ["gêpe", "gaipe"], "Devant e, gu pour faire [g] : guêpe."], ["bague", ["bage", "baghe"], "Devant e, gu pour faire [g] : bague."], ["fatigue", ["fatige", "fatighe"], "Devant e, gu : fatigue."],
  ["jambe", ["janbe", "jembe"], "Devant m, b, p, on écrit m (et non n) : jambe."], ["tempête", ["tenpête", "tampête"], "Devant p, on écrit m : tempête."], ["champ", ["chanp", "chan"], "Devant p, m : champ."],
  ["ombre", ["onbre", "hombre"], "Devant b, m : ombre."], ["impossible", ["inpossible", "imposible"], "Devant p, m : impossible."], ["nombre", ["nonbre", "nombr"], "Devant b, m : nombre."], ["emmener", ["enmener", "emener"], "Devant m, on écrit m : emmener."],
  ["timbre", ["tinbre", "teimbre"], "Devant b, m : timbre."], ["tante", ["tamte", "tantte"], "Devant t, on écrit n : tante."],
];

// Gender of nouns often mistaken: [noun, gender, level].
export const GENRES = [
  ["arbre", "m", 1], ["armoire", "f", 1], ["éléphant", "m", 1], ["horloge", "f", 1], ["écharpe", "f", 1], ["avion", "m", 1], ["image", "f", 1], ["orange", "f", 1], ["oreille", "f", 1], ["orteil", "m", 2],
  ["autoroute", "f", 3], ["épisode", "m", 3], ["espèce", "f", 3], ["incendie", "m", 3], ["intervalle", "m", 4], ["ongle", "m", 3], ["atmosphère", "f", 4], ["éloge", "m", 6], ["hémisphère", "m", 6],
  ["astérisque", "m", 8], ["tentacule", "m", 6], ["oasis", "f", 6], ["pétale", "m", 6], ["antidote", "m", 7], ["armistice", "m", 7], ["acné", "f", 6], ["anagramme", "f", 8], ["azalée", "f", 9],
  ["éclair", "m", 2], ["épitaphe", "f", 9], ["haltère", "m", 8], ["en-tête", "m", 9], ["icône", "f", 6], ["emblème", "m", 8], ["pore", "m", 9], ["orbite", "f", 8], ["tubercule", "m", 10],
  ["météore", "m", 9], ["obélisque", "m", 9], ["apogée", "m", 10], ["amalgame", "m", 10], ["abîme", "m", 9], ["alvéole", "f", 11], ["ecchymose", "f", 11], ["effluve", "m", 11], ["entracte", "m", 9], ["éphéméride", "f", 12],
  ["équivoque", "f", 11], ["interstice", "m", 11], ["opprobre", "m", 12], ["ovule", "m", 10], ["tribu", "f", 6], ["termite", "m", 9], ["héliport", "m", 10], ["oriflamme", "f", 12], ["arcane", "m", 12],
];

// End punctuation: [sentence without its final sign, sign, explanation].
export const PONCTUATION = [
  ["Quelle belle journée", "!", "Phrase exclamative : elle exprime un sentiment fort → point d'exclamation."], ["Où as-tu rangé mes clés", "?", "Phrase interrogative : elle pose une question → point d'interrogation."],
  ["Le train part à huit heures", ".", "Phrase déclarative : elle donne une information → point."], ["Est-ce que tu viens ce soir", "?", "Question avec « est-ce que » → point d'interrogation."],
  ["Comme tu as grandi", "!", "Exclamation avec « comme » → point d'exclamation."], ["Je me demande s'il viendra", ".", "Interrogation indirecte : la phrase est déclarative → point (pas de point d'interrogation !)."],
  ["Que c'est beau", "!", "Exclamation avec « que » → point d'exclamation."], ["Viens-tu avec nous", "?", "Question avec inversion du sujet → point d'interrogation."],
  ["Dis-moi pourquoi tu ris", ".", "Ordre suivi d'une question indirecte : pas de point d'interrogation."], ["Quel courage tu as eu", "!", "Exclamation avec « quel » → point d'exclamation."],
];

// Object pronouns: [sentence with ___, answers, explanation].
export const PRONOMS = [
  ["Tu as vu Léa ? Oui, je ___ ai vue hier.", ["l'"], "Voir quelqu'un (COD) : la → l' devant une voyelle."], ["Tu parles à tes parents ? Oui, je ___ parle tous les jours.", ["leur"], "Parler À quelqu'un (COI pluriel) → leur."],
  ["Tu as écrit à ta grand-mère ? Oui, je ___ ai écrit.", ["lui"], "Écrire À quelqu'un (COI singulier) → lui."], ["Tu veux du gâteau ? Oui, j'___ veux bien.", ["en"], "Du gâteau (de + nom) → en."],
  ["Tu vas à la piscine ? Oui, j'___ vais demain.", ["y"], "À la piscine (lieu) → y."], ["Tu penses à ton examen ? Oui, j'___ pense sans arrêt.", ["y"], "Penser À quelque chose → y."],
  ["Tu as acheté les billets ? Oui, je ___ ai achetés.", ["les"], "Les billets (COD pluriel) → les."], ["Tu connais ce film ? Non, je ne ___ connais pas.", ["le"], "Ce film (COD masculin) → le."],
  ["Combien de sœurs as-tu ? J'___ ai deux.", ["en"], "Avec un nombre, on reprend le nom par en : j'en ai deux."], ["As-tu répondu aux questions ? Oui, j'___ ai répondu.", ["y"], "Répondre À quelque chose → y."],
  ["As-tu répondu à ton professeur ? Oui, je ___ ai répondu.", ["lui"], "Répondre À quelqu'un → lui."], ["Tu te souviens de ce voyage ? Oui, je m'___ souviens.", ["en"], "Se souvenir DE quelque chose → en."],
  ["Le livre, donne-___ à ta sœur.", ["le"], "À l'impératif affirmatif, le pronom COD vient après le verbe avec un trait d'union : donne-le."], ["Ces fleurs, offre-___ à ta mère.", ["les"], "Offrir quelque chose (COD pluriel) : offre-les."],
  ["Ton secret, je ne ___ dirai à personne.", ["le"], "Dire quelque chose (COD masculin) → le."], ["Ta cousine ? Je ___ téléphone ce soir.", ["lui"], "Téléphoner À quelqu'un → lui."],
];

// Pleonasms and mistakes of usage: [wrong sentence, corrected sentence, explanation].
export const PLEONASMES = [
  ["Il faut monter en haut de la tour.", "Il faut monter au sommet de la tour.", "Monter en haut est un pléonasme : on ne monte jamais en bas."],
  ["Nous avons prévu cela à l'avance.", "Nous avons prévu cela.", "Prévoir à l'avance : prévoir, c'est déjà voir à l'avance."],
  ["Au jour d'aujourd'hui, tout va plus vite.", "Aujourd'hui, tout va plus vite.", "« Au jour d'aujourd'hui » répète trois fois « jour » : aujourd'hui suffit."],
  ["Il faut pallier à ce problème.", "Il faut pallier ce problème.", "Pallier est transitif direct : on pallie un problème (sans « à »)."],
  ["Je me rappelle de cette histoire.", "Je me rappelle cette histoire.", "Se rappeler quelque chose (sans « de ») ; mais se souvenir DE quelque chose."],
  ["Malgré qu'il pleuve, nous sortons.", "Bien qu'il pleuve, nous sortons.", "« Malgré que » est fautif à l'écrit : on dit « bien que » ou « malgré la pluie »."],
  ["Ils croivent tout ce qu'on leur dit.", "Ils croient tout ce qu'on leur dit.", "Le verbe croire : ils croient (et non « croivent »)."],
  ["Il a solutionné le problème.", "Il a résolu le problème.", "« Solutionner » est critiqué : on préfère résoudre."],
  ["Je vous rappelle à nouveau.", "Je vous rappelle.", "Rappeler, c'est déjà appeler à nouveau."],
  ["Il est sorti dehors en courant.", "Il est sorti en courant.", "Sortir dehors : on ne sort jamais dedans."],
  ["Elle a réalisé qu'elle s'était trompée.", "Elle s'est rendu compte qu'elle s'était trompée.", "Réaliser au sens de « se rendre compte » est un anglicisme critiqué."],
  ["Cela fait du sens.", "Cela a du sens.", "« Faire du sens » est un calque de l'anglais : on dit « avoir du sens »."],
  ["Suite à votre appel, je vous écris.", "À la suite de votre appel, je vous écris.", "« Suite à » est critiqué dans la langue soignée : on écrit « à la suite de » ou « après »."],
  ["Ils se sont entraidés mutuellement.", "Ils se sont entraidés.", "S'entraider, c'est déjà s'aider mutuellement."],
  ["C'est un faux prétexte.", "C'est un prétexte.", "Un prétexte est déjà une fausse raison."],
  ["Ils ont collaboré ensemble.", "Ils ont collaboré.", "Collaborer, c'est déjà travailler ensemble."],
  ["Il faut s'en rappeler.", "Il faut s'en souvenir.", "Se rappeler se construit sans « de » : « s'en rappeler » est critiqué ; on dit « s'en souvenir » ou « se le rappeler »."],
  ["Il a été jusqu'à Paris.", "Il est allé jusqu'à Paris.", "Dans la langue soignée, « aller » et non « être » pour un déplacement."],
  ["Il s'est accaparé du pouvoir.", "Il a accaparé le pouvoir.", "Accaparer est transitif direct : on accapare quelque chose (et « s'accaparer de » est fautif)."],
  ["Je vous emprunte votre stylo et je vous le rends de suite.", "Je vous emprunte votre stylo et je vous le rends tout de suite.", "« De suite » signifie « à la suite, sans interruption » ; « immédiatement » se dit « tout de suite »."],
];

// Hypotheses with si: [sentence with ___, verb hint, answers, explanation].
export const SI = [
  ["Si j'avais su, je ___ plus tôt.", "venir", ["serais venu", "serais venue"], "Si + plus-que-parfait → conditionnel passé."],
  ["Si tu ___ plus tôt, tu aurais vu le spectacle.", "arriver", ["étais arrivé", "étais arrivée"], "Si + plus-que-parfait (jamais « si tu serais »)."],
  ["Si tu viens demain, nous ___ au cinéma.", "aller", ["irons"], "Si + présent → futur."],
  ["Si j'avais une baguette magique, je ___ le monde.", "changer", ["changerais"], "Si + imparfait → conditionnel présent."],
  ["Si nous ___ le temps, nous voyagerions plus.", "avoir", ["avions"], "Si + imparfait (et non « si nous aurions »)."],
  ["S'il ___ beau demain, on ira à la plage.", "faire", ["fait"], "Si + présent pour une condition réalisable dans le futur."],
  ["Si elle ___ la vérité, elle ne serait pas partie.", "connaître", ["avait connu"], "Si + plus-que-parfait → conditionnel passé."],
  ["Si vous étiez à ma place, que ___-vous ?", "faire", ["feriez"], "Si + imparfait → conditionnel présent."],
  ["S'ils avaient pris le train, ils ___ à l'heure.", "arriver", ["seraient arrivés"], "Si + plus-que-parfait → conditionnel passé."],
  ["Si je ___ riche, j'achèterais une île.", "être", ["étais"], "Si + imparfait (jamais « si je serais »)."],
  ["Si tu ___ tes devoirs, tu pourras sortir.", "finir", ["finis"], "Si + présent → futur."],
  ["Si Chikh Faycal ___ moins de thé, il dormirait mieux.", "boire", ["buvait"], "Si + imparfait → conditionnel présent."],
  ["Si tu avais écouté, tu ___ la réponse.", "savoir", ["aurais su"], "Si + plus-que-parfait → conditionnel passé."],
  ["Si les enfants ___ sages, ils auront un dessert.", "être", ["sont"], "Si + présent → futur."],
  ["Je viendrai si tu ___.", "vouloir", ["veux"], "La proposition en si ne prend jamais le futur : si tu veux."],
  ["Si nous étions partis à l'heure, nous ne ___ pas le train.", "rater", ["aurions raté"], "Si + plus-que-parfait → conditionnel passé (nous n'aurions pas raté)."],
];

// Concession: [sentence with ___, hint, answers, explanation].
export const CONCESSION = [
  ["Bien qu'il ___ malade, il est venu.", "être", ["soit"], "Bien que + subjonctif."], ["Quoiqu'elle ___ raison, personne ne l'écoute.", "avoir", ["ait"], "Quoique (= bien que) + subjonctif."],
  ["___ tu dises, je ne changerai pas d'avis.", "quoi que / quoique", ["Quoi que"], "Quoi que (en deux mots) = quelle que soit la chose que."], ["Il a beau ___, il n'y arrive pas.", "essayer", ["essayer"], "Avoir beau + infinitif."],
  ["Si riche qu'il ___, il n'est pas heureux.", "être", ["soit"], "Si + adjectif + que + subjonctif."], ["Même s'il ___, nous sortirons.", "pleuvoir", ["pleut"], "Même si + indicatif."],
  ["___ soient tes raisons, tu aurais dû prévenir.", "quel que (accordé)", ["Quelles que"], "Quel que + être : quel s'accorde avec le sujet (tes raisons → quelles que)."],
  ["Encore qu'il ___ un peu tard, nous pouvons commencer.", "être", ["soit"], "Encore que (soutenu) + subjonctif."], ["___ soit le résultat, nous serons fiers de toi.", "quel que (accordé)", ["Quel que"], "Quel que + être, accordé avec le résultat (masculin singulier)."],
  ["Pour intelligent qu'il ___, il s'est trompé.", "être", ["soit"], "Pour + adjectif + que (soutenu) + subjonctif."],
];

// Nominalisation: [verb, noun].
export const NOMINALISATIONS = [
  ["décider", "la décision"], ["arriver", "l'arrivée"], ["partir", "le départ"], ["réduire", "la réduction"], ["augmenter", "l'augmentation"], ["choisir", "le choix"],
  ["acquérir", "l'acquisition"], ["résoudre", "la résolution"], ["croître", "la croissance"], ["naître", "la naissance"], ["découvrir", "la découverte"], ["perdre", "la perte"],
  ["vendre", "la vente"], ["construire", "la construction"], ["détruire", "la destruction"], ["accueillir", "l'accueil"], ["échouer", "l'échec"], ["réussir", "la réussite"],
  ["protéger", "la protection"], ["exiger", "l'exigence"], ["refuser", "le refus"], ["apparaître", "l'apparition"], ["disparaître", "la disparition"],
  ["fermer", "la fermeture"], ["ouvrir", "l'ouverture"], ["analyser", "l'analyse"], ["comparer", "la comparaison"], ["soutenir", "le soutien"], ["maintenir", "le maintien"],
  ["interdire", "l'interdiction"], ["craindre", "la crainte"], ["rompre", "la rupture"], ["conclure", "la conclusion"], ["envahir", "l'invasion"], ["élire", "l'élection"],
];

// Tout: [sentence with ___, answers, explanation].
export const TOUT = [
  ["Elles sont ___ contentes.", ["toutes"], "Devant un adjectif féminin commençant par une consonne, l'adverbe tout s'accorde : toutes contentes."],
  ["Elle est ___ étonnée.", ["tout"], "Devant un adjectif commençant par une voyelle, l'adverbe tout reste invariable : tout étonnée."],
  ["___ les élèves sont sortis.", ["Tous"], "Déterminant devant un nom masculin pluriel : tous."], ["Elle a mangé ___ la tarte.", ["toute"], "Déterminant : toute la tarte."],
  ["Elle est ___ honteuse.", ["toute"], "Devant un h aspiré, tout s'accorde comme devant une consonne : toute honteuse."], ["Les filles sont ___ émues.", ["tout"], "Devant une voyelle, l'adverbe reste invariable : tout émues."],
  ["Il a lu ___ ces livres.", ["tous"], "Déterminant masculin pluriel : tous ces livres."], ["Ces robes sont ___ simples.", ["toutes"], "Adjectif féminin commençant par une consonne : toutes simples."],
  ["Je les ai ___ vus, un par un.", ["tous"], "Pronom (= chacun d'eux) : tous."], ["Elle est ___ à fait d'accord.", ["tout"], "Locution adverbiale : tout à fait, toujours invariable."],
  ["Ils sont ___ fiers de leur fille.", ["tout"], "Adverbe (= très) devant un adjectif masculin : invariable. (« Tous fiers » voudrait dire « chacun d'eux ».)"],
  ["Elle vit ___ seule dans cette grande maison.", ["toute"], "Adverbe devant un adjectif féminin commençant par une consonne : toute seule."],
];

// Colour adjectives: [noun with ___, colour hint, answers, explanation].
export const COULEURS = [
  ["Elle a des yeux ___.", "marron", ["marron"], "Un nom employé comme couleur (marron, orange, cerise, olive…) reste invariable."], ["Il porte des chemises ___.", "orange", ["orange"], "Orange est un nom de fruit employé comme couleur : invariable."],
  ["Elles ont acheté des robes ___.", "bleu", ["bleues"], "Bleu est un vrai adjectif : il s'accorde."], ["Il tricote des pulls ___.", "vert foncé", ["vert foncé"], "Couleur composée : invariable."],
  ["Le jardin est plein de fleurs ___.", "rose", ["roses"], "Exception : rose, mauve, pourpre, écarlate, fauve s'accordent."], ["Nous avons posé des rideaux ___.", "bleu ciel", ["bleu ciel"], "Couleur composée : invariable."],
  ["Il collectionne les voitures ___.", "noir", ["noires"], "Adjectif simple : accord."], ["Mes cousines ont les cheveux ___.", "châtain", ["châtains"], "Châtain est un adjectif : il s'accorde (châtains)."],
  ["Elle a cousu des tissus ___.", "cerise", ["cerise"], "Nom employé comme couleur : invariable."], ["Il a des chaussettes ___.", "bleu-vert", ["bleu-vert"], "Deux couleurs réunies par un trait d'union : invariable."],
  ["Le salon a des coussins ___.", "mauve", ["mauves"], "Mauve fait partie des exceptions qui s'accordent."], ["Elle porte des écharpes ___.", "jaune paille", ["jaune paille"], "Couleur composée : invariable."],
];

// Capitals: [sentence with ___, answers (case-sensitive), explanation].
export const MAJUSCULES = [
  ["Les ___ aiment le fromage.", ["Français"], "Nom de peuple (les habitants) : majuscule."], ["Elle parle ___ couramment.", ["français"], "Nom de langue : minuscule."],
  ["Le vin ___ est réputé.", ["français"], "Adjectif : minuscule."], ["J'ai rencontré deux ___ en vacances.", ["Italiens"], "Nom d'habitants : majuscule."],
  ["Nous apprenons l'___ au collège.", ["espagnol"], "Nom de langue : minuscule."], ["Elle vit au bord de la ___.", ["Méditerranée"], "Nom propre de lieu (la mer Méditerranée) : majuscule."],
  ["Il est arrivé ___ matin.", ["lundi"], "Les jours de la semaine s'écrivent en minuscules."], ["Nous partirons en ___.", ["juillet"], "Les mois s'écrivent en minuscules."],
  ["Les ___ ont gagné le match.", ["Marseillais"], "Habitants d'une ville : majuscule."], ["La cuisine ___ est délicieuse.", ["marocaine"], "Adjectif : minuscule."],
];

// Reported speech: [direct speech verb tense in the quote, reported tense].
export const DISCOURS_TENSES = [
  ["present", "imparfait", "Présent dans la phrase citée → imparfait au discours indirect (après un verbe introducteur au passé)."],
  ["passe_compose", "plus_que_parfait", "Passé composé → plus-que-parfait au discours indirect."],
  ["futur", "cond_present", "Futur → conditionnel présent au discours indirect (le futur dans le passé)."],
];

// Passive voice: [subject, gender, plural, verb, end of the sentence].
export const PASSIFS = [
  ["Le pont", "m", false, "construire", "par des ingénieurs italiens."], ["Ces tableaux", "m", true, "peindre", "par un artiste inconnu."], ["La lettre", "f", false, "écrire", "par ma grand-mère."],
  ["Les résultats", "m", true, "publier", "sur le site du lycée."], ["La décision", "f", false, "prendre", "par le conseil municipal."], ["Les invités", "m", true, "accueillir", "par le maire en personne."],
  ["La porte", "f", false, "ouvrir", "par un majordome très digne."], ["Ces chansons", "f", true, "chanter", "par toute la classe."], ["Le voleur", "m", false, "arrêter", "par deux policiers."],
  ["Les arbres", "m", true, "abattre", "par la tempête."], ["La ville", "f", false, "détruire", "par un incendie."], ["Les élèves", "m", true, "récompenser", "par la directrice."],
  ["La tarte", "f", false, "manger", "par le chien de Chikh Faycal."], ["Les fenêtres", "f", true, "nettoyer", "par une entreprise spécialisée."],
];

// Missing "ne" (written French): [sentence with the mistake, index of the wrong word, fixes, explanation].
export const SANS_NE = [
  ["On a pas fini.", 1, ["n'a"], "À l'écrit, la négation a deux parties : on n'a pas (le « ne » s'élide devant une voyelle)."],
  ["Je sais pas quoi faire.", 1, ["ne sais"], "À l'écrit, il faut « ne » : je ne sais pas."],
  ["Il y a plus de pain.", 1, ["n'y"], "Il n'y a plus de pain : sans « ne », la phrase dit le contraire (il y a davantage de pain) !"],
  ["On est jamais trop prudent.", 1, ["n'est"], "On n'est jamais : le « n' » ne s'entend pas, mais il s'écrit."],
  ["Elle veut rien manger.", 1, ["ne veut"], "Négation avec rien : elle ne veut rien manger."],
  ["Nous avons pas compris.", 1, ["n'avons"], "Nous n'avons pas compris."],
  ["Il voit personne.", 1, ["ne voit"], "Négation avec personne : il ne voit personne."],
  ["On en a pas besoin.", 1, ["n'en"], "On n'en a pas besoin : « n' » se place devant « en »."],
  ["C'est pas grave.", 0, ["Ce n'est"], "À l'écrit : ce n'est pas grave."],
  ["Ils ont jamais vu la mer.", 1, ["n'ont"], "Ils n'ont jamais vu la mer."],
];
