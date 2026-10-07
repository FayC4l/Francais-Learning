// Hand-written banks for the French question generators (original sentences). Pure data.
// Homophones: [sentence with ___, answer]. The explanation of each family gives the trick to decide.

export const HOMOPHONES = {
  a: {
    unit: "1.4",
    hint: "a ou à ?",
    choices: ["a", "à"],
    explain: { a: "On peut dire « avait » : c'est le verbe avoir → a.", à: "On ne peut pas dire « avait » : c'est une préposition → à." },
    items: [
      ["Mon frère ___ peur des araignées.", "a"], ["Elle ___ trouvé un trésor dans le grenier.", "a"], ["Il y ___ trop de bruit dans cette salle.", "a"],
      ["Léa ___ oublié son parapluie au cinéma.", "a"], ["Le chat ___ renversé le pot de lait.", "a"], ["On ___ toujours le choix.", "a"],
      ["Mon grand-père ___ quatre-vingts ans.", "a"], ["Cette tarte ___ un goût de citron.", "a"], ["Qui ___ mangé le dernier biscuit ?", "a"],
      ["Le train ___ dix minutes de retard.", "a"], ["Chikh Fayçal ___ encore renversé son thé.", "a"], ["Ma voisine ___ un chien très bavard.", "a"],
      ["Nous allons ___ la piscine.", "à"], ["Il habite ___ Marseille.", "à"], ["C'est une machine ___ laver.", "à"],
      ["Elle pense ___ ses vacances.", "à"], ["J'ai une question ___ te poser.", "à"], ["Ils sont rentrés ___ minuit.", "à"],
      ["Le gâteau ___ la fraise est délicieux.", "à"], ["Il a prêté sa gomme ___ sa voisine.", "à"], ["Nous partirons ___ pied.", "à"],
      ["Ce stylo est ___ moi.", "à"], ["Il a appris ___ nager cet été.", "à"], ["Elle a mal ___ la tête.", "à"],
    ],
  },
  et: {
    unit: "1.4",
    hint: "et ou est ?",
    choices: ["et", "est"],
    explain: { est: "On peut dire « était » : c'est le verbe être → est.", et: "On peut dire « et puis » : c'est le mot qui relie → et." },
    items: [
      ["Le ciel ___ gris ce matin.", "est"], ["Ma sœur ___ partie avant nous.", "est"], ["Ce film ___ vraiment drôle.", "est"],
      ["Où ___ passé mon cartable ?", "est"], ["Il ___ midi pile.", "est"], ["La porte ___ fermée à clé.", "est"],
      ["Le directeur ___ en réunion.", "est"], ["Cette soupe ___ trop salée.", "est"], ["Chikh Fayçal ___ fier de sa cravate.", "est"],
      ["Mon chien ___ plus têtu qu'une mule.", "est"], ["Le musée ___ fermé le mardi.", "est"],
      ["Il a un chien ___ deux chats.", "et"], ["Elle chante ___ elle danse.", "et"], ["Prends ton manteau ___ ton écharpe.", "et"],
      ["Le pain ___ le fromage sont sur la table.", "et"], ["Il pleut ___ il fait froid.", "et"], ["Mes parents ___ mes cousins arrivent ce soir.", "et"],
      ["Il est grand ___ fort.", "et"], ["J'ai lu ce livre ___ je l'ai adoré.", "et"], ["Une baguette ___ deux croissants, s'il vous plaît.", "et"],
      ["Elle ouvre la boîte ___ découvre un chaton.", "et"], ["Nous avons ri ___ chanté toute la soirée.", "et"],
    ],
  },
  son: {
    unit: "1.4",
    hint: "son ou sont ?",
    choices: ["son", "sont"],
    explain: { sont: "On peut dire « étaient » : c'est le verbe être → sont.", son: "On peut dire « mon » ou « le sien » : c'est un déterminant → son." },
    items: [
      ["Les enfants ___ dans le jardin.", "sont"], ["Mes amis ___ arrivés en retard.", "sont"], ["Ces fraises ___ délicieuses.", "sont"],
      ["Où ___ mes lunettes ?", "sont"], ["Les magasins ___ fermés le dimanche.", "sont"], ["Les voisins ___ partis en vacances.", "sont"],
      ["Tes chaussures ___ pleines de boue.", "sont"], ["Ils ___ toujours à l'heure.", "sont"], ["Les élèves ___ sortis dans la cour.", "sont"],
      ["Léa a perdu ___ cahier.", "son"], ["Il promène ___ chien tous les soirs.", "son"], ["Elle range ___ armoire.", "son"],
      ["Chikh Fayçal boit ___ thé à la menthe.", "son"], ["Le chat dort dans ___ panier.", "son"], ["Mon oncle a vendu ___ vélo.", "son"],
      ["Il a raconté ___ voyage au Japon.", "son"], ["Elle attend ___ tour.", "son"], ["Le boulanger ouvre ___ magasin à sept heures.", "son"],
      ["Chacun fait ___ travail.", "son"], ["Elle a perdu ___ écharpe.", "son"],
    ],
  },
  on: {
    unit: "1.4",
    hint: "on ou ont ?",
    choices: ["on", "ont"],
    explain: { ont: "On peut dire « avaient » : c'est le verbe avoir → ont.", on: "On peut dire « il » : c'est un pronom sujet → on." },
    items: [
      ["Mes cousins ___ un grand jardin.", "ont"], ["Ils ___ gagné le match.", "ont"], ["Les oiseaux ___ construit un nid.", "ont"],
      ["Elles ___ peur de l'orage.", "ont"], ["Les élèves ___ fini leurs exercices.", "ont"], ["Mes parents ___ repeint la cuisine.", "ont"],
      ["Les voisins ___ adopté un chaton.", "ont"], ["Ils ___ raté le dernier bus.", "ont"], ["Ces arbres ___ cent ans.", "ont"],
      ["___ part à huit heures.", "On"], ["Le dimanche, ___ mange chez mamie.", "on"], ["___ dirait qu'il va pleuvoir.", "On"],
      ["Ici, ___ parle trop fort.", "on"], ["Demain, ___ ira au marché.", "on"],
      ["Est-ce qu'___ peut entrer ?", "on"], ["___ a frappé à la porte.", "On"], ["Si ___ jouait aux cartes ?", "on"],
    ],
  },
  ou: {
    unit: "2.5",
    hint: "ou ou où ?",
    choices: ["ou", "où"],
    explain: { ou: "On peut dire « ou bien » : c'est un choix → ou.", où: "Il indique un lieu ou un moment → où (avec un accent)." },
    items: [
      ["Tu préfères le thé ___ le café ?", "ou"], ["Viens lundi ___ mardi.", "ou"], ["C'est oui ___ c'est non ?", "ou"],
      ["Tu prends le bus ___ le métro ?", "ou"], ["Rouge ___ bleu, je m'en moque.", "ou"], ["Tu viens ___ tu restes ?", "ou"],
      ["Il rentrera ce soir ___ demain matin.", "ou"], ["Un gâteau ___ une glace ?", "ou"],
      ["___ habites-tu ?", "Où"], ["La ville ___ je suis né est au bord de la mer.", "où"], ["Je ne sais pas ___ j'ai mis mes clés.", "où"],
      ["Le jour ___ il est arrivé, il neigeait.", "où"], ["D'___ vient ce bruit ?", "où"], ["C'est la maison ___ vivait ma grand-mère.", "où"],
      ["Dis-moi ___ tu vas.", "où"], ["Au moment ___ je partais, le téléphone a sonné.", "où"], ["Par ___ faut-il passer ?", "où"],
      ["Là ___ il y a de la gêne, il n'y a pas de plaisir.", "où"],
    ],
  },
  ce: {
    unit: "2.5",
    hint: "ce ou se ?",
    choices: ["ce", "se"],
    explain: { se: "On peut le remplacer par « me » (je me lave) : c'est un pronom devant un verbe → se.", ce: "On peut dire « cet » ou « cela » : c'est un déterminant ou un pronom démonstratif → ce." },
    items: [
      ["Il ___ lave les mains.", "se"], ["Elle ___ promène au bord du lac.", "se"], ["Ils ___ disputent sans arrêt.", "se"],
      ["Le chat ___ cache sous le lit.", "se"], ["Les enfants ___ couchent tôt.", "se"], ["Elle ___ demande ce qu'il fait.", "se"],
      ["Il ne ___ souvient de rien.", "se"], ["Mon frère ___ moque de moi.", "se"], ["Les feuilles ___ détachent des arbres.", "se"],
      ["___ livre est passionnant.", "Ce"], ["J'aime ___ quartier.", "ce"], ["___ matin, il fait beau.", "Ce"],
      ["Je ne comprends pas ___ qu'il dit.", "ce"], ["___ sont mes amis.", "Ce"], ["Regarde ___ chien !", "ce"],
      ["Tout ___ qui brille n'est pas or.", "ce"], ["___ gâteau a l'air délicieux.", "Ce"], ["Dis-moi ___ que tu en penses.", "ce"],
    ],
  },
  ces: {
    unit: "2.5",
    hint: "ces, ses, c'est ou s'est ?",
    choices: ["ces", "ses", "c'est", "s'est"],
    explain: {
      ces: "On peut dire « ces … -là » : on montre → ces.",
      ses: "On peut dire « les siens » : c'est à lui ou à elle → ses.",
      "c'est": "On peut dire « cela est » → c'est.",
      "s'est": "Devant un participe passé, on peut dire « je me suis » : verbe pronominal → s'est.",
    },
    items: [
      ["Regarde ___ nuages noirs !", "ces"], ["___ chaussures sont à toi ?", "Ces"], ["Je n'aime pas ___ bonbons-là.", "ces"],
      ["Tous ___ livres-là sont à vendre.", "ces"], ["Il range ___ affaires et son cartable.", "ses"], ["Léa a invité ___ amies et sa cousine.", "ses"],
      ["Le chat lèche ___ propres pattes.", "ses"], ["Il a perdu ___ gants et son bonnet.", "ses"], ["Elle a fini ___ devoirs et sa lecture.", "ses"],
      ["___ mon meilleur ami.", "C'est"], ["___ trop tard maintenant.", "C'est"], ["Je crois que ___ une bonne idée.", "c'est"],
      ["___ l'heure de partir.", "C'est"], ["Il ___ trompé de route.", "s'est"], ["Elle ___ endormie devant la télé.", "s'est"],
      ["Le vase ___ brisé en mille morceaux.", "s'est"], ["Mon frère ___ levé à l'aube.", "s'est"], ["La porte ___ ouverte toute seule.", "s'est"],
    ],
  },
  mes: {
    unit: "2.5",
    hint: "mes, mais, met ou mets ?",
    choices: ["mes", "mais", "met", "mets"],
    explain: {
      mes: "On peut dire « les miens » : c'est à moi → mes.",
      mais: "On peut dire « pourtant » : c'est une opposition → mais.",
      met: "C'est le verbe mettre avec il / elle → met.",
      mets: "C'est le verbe mettre avec je / tu → mets (ou le nom « un mets », un plat).",
    },
    items: [
      ["J'ai oublié ___ lunettes.", "mes"], ["___ parents sont en voyage.", "Mes"], ["Je range ___ jouets.", "mes"],
      ["Il fait beau, ___ il fait froid.", "mais"], ["Elle est petite ___ très forte.", "mais"], ["Je voulais venir, ___ je suis malade.", "mais"],
      ["Il ___ la table.", "met"], ["Elle ___ son manteau.", "met"], ["Le facteur ___ le courrier dans la boîte.", "met"],
      ["Je ___ mes chaussures.", "mets"], ["Tu ___ trop de sel.", "mets"], ["Où est-ce que je ___ ce carton ?", "mets"],
      ["Ce restaurant sert des ___ raffinés.", "mets"], ["Non seulement il est en retard, ___ il a oublié le gâteau.", "mais"],
    ],
  },
  la: {
    unit: "3.5",
    hint: "la, l'a ou là ?",
    choices: ["la", "l'a", "là"],
    explain: {
      la: "On peut dire « une » ou « le » : c'est un déterminant ou un pronom → la.",
      "l'a": "On peut dire « l'avait » : pronom + verbe avoir → l'a.",
      là: "On peut dire « ici » : c'est un lieu → là.",
    },
    items: [
      ["Ferme ___ fenêtre, s'il te plaît.", "la"], ["___ maison est au bout de la rue.", "La"], ["Cette robe, je ___ trouve jolie.", "la"],
      ["Ta lettre, il ___ lue hier soir.", "l'a"], ["Le gâteau ? Mon frère ___ mangé.", "l'a"], ["Cette chanson, elle ___ apprise par cœur.", "l'a"],
      ["Son vélo, il ___ réparé tout seul.", "l'a"], ["Le chien ? On ___ retrouvé dans le parc.", "l'a"],
      ["Pose ton sac ___.", "là"], ["Je suis ___ !", "là"], ["Ce jour-___, il pleuvait.", "là"], ["Qui va ___ ?", "là"],
      ["Passe par ___, c'est plus court.", "là"], ["Ce livre-___ est à moi.", "là"],
    ],
  },
  leur: {
    unit: "3.5",
    hint: "leur ou leurs ?",
    choices: ["leur", "leurs"],
    explain: {
      leur: "Devant un verbe, « leur » est un pronom (= à eux) : il ne prend jamais de s. Devant un nom singulier, pas de s non plus.",
      leurs: "Devant un nom au pluriel, le déterminant prend un s : leurs.",
    },
    items: [
      ["Je ___ ai donné mon adresse.", "leur"], ["Dis-___ de venir.", "leur"], ["Le professeur ___ explique la règle.", "leur"],
      ["Nous ___ avons écrit une carte.", "leur"], ["Elle ___ prête ses livres.", "leur"], ["Ils ont vendu ___ maison.", "leur"],
      ["Les enfants ont perdu ___ ballon.", "leur"], ["Mes voisins promènent ___ chien.", "leur"], ["Ils ont rangé ___ chambre.", "leur"],
      ["Les élèves ont pris ___ cahiers.", "leurs"], ["Mes parents ont invité ___ amis.", "leurs"], ["Ils ont oublié ___ clés.", "leurs"],
      ["Les oiseaux nourrissent ___ petits.", "leurs"], ["Elles ont mis ___ bottes.", "leurs"], ["Ils racontent ___ souvenirs.", "leurs"],
    ],
  },
  peu: {
    unit: "3.5",
    hint: "peu, peut ou peux ?",
    choices: ["peu", "peut", "peux"],
    explain: {
      peu: "On peut dire « pas beaucoup » → peu.",
      peut: "C'est le verbe pouvoir avec il / elle / on : on peut dire « pouvait » → peut.",
      peux: "C'est le verbe pouvoir avec je / tu → peux.",
    },
    items: [
      ["Il a très ___ dormi.", "peu"], ["Attends un ___ !", "peu"], ["Elle mange ___ de viande.", "peu"], ["Peu à ___, il apprend.", "peu"],
      ["Il ___ venir demain.", "peut"], ["On ___ entrer ?", "peut"], ["Elle ne ___ pas répondre.", "peut"], ["Ça ___ arriver à tout le monde.", "peut"],
      ["Je ___ t'aider.", "peux"], ["Tu ___ fermer la porte ?", "peux"], ["Je ne ___ pas rester.", "peux"], ["Tu ___ compter sur moi.", "peux"],
    ],
  },
  quel: {
    unit: "4.5",
    hint: "quel, quelle, quels, quelles, qu'elle ou qu'elles ?",
    choices: ["quel", "quelle", "quels", "quelles", "qu'elle", "qu'elles"],
    explain: {
      quel: "Déterminant interrogatif ou exclamatif accordé avec un nom masculin singulier.",
      quelle: "Déterminant accordé avec un nom féminin singulier.",
      quels: "Déterminant accordé avec un nom masculin pluriel.",
      quelles: "Déterminant accordé avec un nom féminin pluriel.",
      "qu'elle": "On peut dire « qu'il » : que + elle → qu'elle.",
      "qu'elles": "On peut dire « qu'ils » : que + elles → qu'elles.",
    },
    items: [
      ["___ heure est-il ?", "Quelle"], ["___ temps fait-il ?", "Quel"], ["___ beaux arbres !", "Quels"], ["___ chansons préfères-tu ?", "Quelles"],
      ["Je crois ___ a raison.", "qu'elle"], ["Il faut ___ parte tôt.", "qu'elle"], ["Je sais ___ sont parties.", "qu'elles"],
      ["___ belle surprise !", "Quelle"], ["À ___ âge as-tu appris à lire ?", "quel"], ["Il dit ___ viendra demain.", "qu'elle"],
      ["___ films as-tu vus ?", "Quels"], ["Je veux ___ m'écrivent.", "qu'elles"],
    ],
  },
  quand: {
    unit: "4.5",
    hint: "quand, quant ou qu'en ?",
    choices: ["quand", "quant", "qu'en"],
    explain: {
      quand: "On peut dire « lorsque » ou « à quel moment » → quand.",
      quant: "Toujours suivi de « à / au / aux » : quant à = en ce qui concerne → quant.",
      "qu'en": "On peut dire « que … en » : que + en → qu'en.",
    },
    items: [
      ["___ pars-tu ?", "Quand"], ["Je t'appellerai ___ j'arriverai.", "quand"], ["___ il pleut, je lis.", "Quand"],
      ["___ à moi, je reste ici.", "Quant"], ["___ aux résultats, ils seront affichés demain.", "Quant"], ["Il est parti ; ___ à sa sœur, elle dort encore.", "quant"],
      ["Qu'est-ce ___ penses-tu ?", "qu'en"], ["Il ne parle ___ anglais.", "qu'en"], ["Je ne sors ___ cas d'urgence.", "qu'en"],
      ["Dis-moi ___ tu seras prêt.", "quand"], ["___ au dessert, c'est une surprise.", "Quant"], ["Ce ___ dira la presse m'importe peu.", "qu'en"],
    ],
  },
  sans: {
    unit: "4.5",
    hint: "sans, s'en, c'en ou sent ?",
    choices: ["sans", "s'en", "c'en", "sent"],
    explain: {
      sans: "C'est le contraire de « avec » → sans.",
      "s'en": "On peut dire « je m'en » : pronom se + en devant un verbe → s'en.",
      "c'en": "On peut dire « cela en » : c'en est trop → c'en.",
      sent: "C'est le verbe sentir → il sent.",
    },
    items: [
      ["Il est parti ___ dire au revoir.", "sans"], ["Un café ___ sucre, s'il vous plaît.", "sans"], ["Elle travaille ___ arrêt.", "sans"],
      ["Il ___ va déjà.", "s'en"], ["Elle ne ___ souvient plus.", "s'en"], ["Ils ___ moquent complètement.", "s'en"],
      ["___ est trop !", "C'en"], ["___ est fini de nos vacances.", "C'en"], ["Ce bouquet ___ bon.", "sent"],
      ["Le chien ___ une odeur de gâteau.", "sent"], ["Il est venu ___ son frère.", "sans"], ["Elle ___ est sortie toute seule.", "s'en"],
    ],
  },
  ni: {
    unit: "3.5",
    hint: "ni ou n'y ?",
    choices: ["ni", "n'y"],
    explain: { ni: "« ni … ni » relie deux éléments dans une phrase négative → ni.", "n'y": "On peut dire « ne … pas là » : ne + y → n'y." },
    items: [
      ["Je n'aime ni le chou ___ les épinards.", "ni"], ["Il ne boit ni thé ___ café.", "ni"], ["Elle n'est ni grande ___ petite.", "ni"],
      ["Je ___ vais jamais.", "n'y"], ["Il ___ a plus de pain.", "n'y"], ["Nous ___ pensions plus.", "n'y"], ["Tu ___ peux rien.", "n'y"],
      ["Ce n'est ni le lieu ___ le moment.", "ni"],
    ],
  },
  si: {
    unit: "4.5",
    hint: "si, s'y ou ci ?",
    choices: ["si", "s'y", "ci"],
    explain: { si: "Condition ou intensité (= tellement) → si.", "s'y": "On peut dire « je m'y » : se + y devant un verbe → s'y.", ci: "Après un nom avec un trait d'union (ce livre-ci), ou dans ci-joint, ci-dessous → ci." },
    items: [
      ["___ tu viens, préviens-moi.", "Si"], ["Il est ___ gentil !", "si"], ["Elle ___ connaît en mécanique.", "s'y"], ["Il ___ attendait.", "s'y"],
      ["Ce livre-___ est passionnant.", "ci"], ["Veuillez trouver ___-joint mon dossier.", "ci"], ["Ils ___ sont installés pour l'été.", "s'y"],
      ["Je ne sais pas ___ elle viendra.", "si"],
    ],
  },
  dans: {
    unit: "4.5",
    hint: "dans ou d'en ?",
    choices: ["dans", "d'en"],
    explain: { dans: "Préposition de lieu ou de temps (= à l'intérieur de, au bout de) → dans.", "d'en": "On peut dire « de … en » : de + en → d'en." },
    items: [
      ["Le chat dort ___ le panier.", "dans"], ["Je pars ___ cinq minutes.", "dans"], ["Il a peur ___ parler.", "d'en"],
      ["Elle a décidé ___ acheter deux.", "d'en"], ["Range tes affaires ___ ton sac.", "dans"], ["Il est temps ___ finir.", "d'en"],
      ["Il vit ___ un petit village.", "dans"], ["Je te demande ___ prendre soin.", "d'en"],
    ],
  },
};

// Plurals of nouns: [singular, plural(s), rule].
export const PLURALS = [
  ["cheval", "chevaux", "-al → -aux"], ["journal", "journaux", "-al → -aux"], ["animal", "animaux", "-al → -aux"], ["hôpital", "hôpitaux", "-al → -aux"], ["général", "généraux", "-al → -aux"], ["canal", "canaux", "-al → -aux"],
  ["bal", "bals", "exception en -al : bal, carnaval, chacal, festival, récital, régal prennent un s"], ["carnaval", "carnavals", "exception en -al (+s)"], ["festival", "festivals", "exception en -al (+s)"], ["chacal", "chacals", "exception en -al (+s)"], ["récital", "récitals", "exception en -al (+s)"], ["régal", "régals", "exception en -al (+s)"],
  ["travail", "travaux", "-ail → -aux (bail, corail, émail, soupirail, travail, vantail, vitrail)"], ["corail", "coraux", "-ail → -aux"], ["vitrail", "vitraux", "-ail → -aux"], ["émail", "émaux", "-ail → -aux"], ["bail", "baux", "-ail → -aux"],
  ["détail", "détails", "-ail → -ails en général"], ["éventail", "éventails", "-ail → -ails en général"], ["rail", "rails", "-ail → -ails en général"], ["portail", "portails", "-ail → -ails en général"],
  ["bateau", "bateaux", "-eau → -eaux"], ["gâteau", "gâteaux", "-eau → -eaux"], ["chapeau", "chapeaux", "-eau → -eaux"], ["cheveu", "cheveux", "-eu → -eux"], ["jeu", "jeux", "-eu → -eux"], ["neveu", "neveux", "-eu → -eux"],
  ["pneu", "pneus", "exception en -eu : bleu, pneu, émeu, lieu (le poisson) prennent un s"], ["bleu", "bleus", "exception en -eu (+s)"], ["tuyau", "tuyaux", "-au → -aux"], ["noyau", "noyaux", "-au → -aux"], ["landau", "landaus", "exception en -au : landau, sarrau (+s)"],
  ["bijou", "bijoux", "-ou → -oux pour les sept : bijou, caillou, chou, genou, hibou, joujou, pou"], ["caillou", "cailloux", "un des sept noms en -ou qui prennent un x"], ["chou", "choux", "un des sept noms en -ou qui prennent un x"], ["genou", "genoux", "un des sept noms en -ou qui prennent un x"], ["hibou", "hiboux", "un des sept noms en -ou qui prennent un x"], ["pou", "poux", "un des sept noms en -ou qui prennent un x"], ["joujou", "joujoux", "un des sept noms en -ou qui prennent un x"],
  ["clou", "clous", "-ou → -ous en général"], ["trou", "trous", "-ou → -ous en général"], ["verrou", "verrous", "-ou → -ous en général"], ["fou", "fous", "-ou → -ous en général"],
  ["nez", "nez", "un nom terminé par -s, -x ou -z ne change pas"], ["prix", "prix", "terminé par -x : invariable au pluriel"], ["bras", "bras", "terminé par -s : invariable au pluriel"], ["voix", "voix", "terminé par -x : invariable au pluriel"], ["souris", "souris", "terminé par -s : invariable"], ["gaz", "gaz", "terminé par -z : invariable"],
  ["œil", "yeux", "pluriel irrégulier"], ["ciel", "cieux|ciels", "pluriel irrégulier (ciels pour les ciels de lit ou en peinture)"], ["monsieur", "messieurs", "mon- devient mes- : messieurs"], ["madame", "mesdames", "ma- devient mes- : mesdames"],
];

// Gender: [masculine, feminine, kind (adj | nom), rule].
export const FEMININES = [
  ["boulanger", "boulangère", "nom", "-er → -ère"], ["berger", "bergère", "nom", "-er → -ère"], ["fier", "fière", "adj", "-er → -ère"], ["léger", "légère", "adj", "-er → -ère"],
  ["heureux", "heureuse", "adj", "-eux → -euse"], ["jaloux", "jalouse", "adj", "-oux → -ouse"], ["sportif", "sportive", "adj", "-f → -ve"], ["neuf", "neuve", "adj", "-f → -ve"], ["veuf", "veuve", "nom", "-f → -ve"],
  ["lion", "lionne", "nom", "-on → -onne"], ["chat", "chatte", "nom", "-at → -atte"], ["cruel", "cruelle", "adj", "-el → -elle"], ["gentil", "gentille", "adj", "-il → -ille"], ["pareil", "pareille", "adj", "-eil → -eille"],
  ["muet", "muette", "adj", "-et → -ette"], ["complet", "complète", "adj", "-et → -ète (complet, concret, discret, incomplet, inquiet, replet, secret)"], ["inquiet", "inquiète", "adj", "-et → -ète"], ["secret", "secrète", "adj", "-et → -ète"], ["discret", "discrète", "adj", "-et → -ète"],
  ["vieux", "vieille", "adj", "irrégulier"], ["beau", "belle", "adj", "irrégulier"], ["nouveau", "nouvelle", "adj", "irrégulier"], ["fou", "folle", "adj", "irrégulier"], ["mou", "molle", "adj", "irrégulier"],
  ["blanc", "blanche", "adj", "-c → -che"], ["franc", "franche", "adj", "-c → -che"], ["sec", "sèche", "adj", "-ec → -èche"], ["frais", "fraîche", "adj", "irrégulier"], ["doux", "douce", "adj", "irrégulier"], ["roux", "rousse", "adj", "irrégulier"], ["faux", "fausse", "adj", "irrégulier"],
  ["long", "longue", "adj", "-g → -gue"], ["public", "publique", "adj", "-c → -que"], ["grec", "grecque", "adj", "-c → -cque"], ["turc", "turque", "adj", "-c → -que"], ["favori", "favorite", "adj", "irrégulier"], ["malin", "maligne", "adj", "irrégulier"],
  ["acteur", "actrice", "nom", "-teur → -trice"], ["directeur", "directrice", "nom", "-teur → -trice"], ["chanteur", "chanteuse", "nom", "-eur → -euse"], ["menteur", "menteuse", "nom", "-eur → -euse"], ["vendeur", "vendeuse", "nom", "-eur → -euse"],
  ["prince", "princesse", "nom", "+ -esse"], ["comte", "comtesse", "nom", "+ -esse"], ["héros", "héroïne", "nom", "irrégulier"], ["loup", "louve", "nom", "irrégulier"], ["paysan", "paysanne", "nom", "-an → -anne"],
  ["musicien", "musicienne", "nom", "-ien → -ienne"], ["gardien", "gardienne", "nom", "-ien → -ienne"], ["ancien", "ancienne", "adj", "-ien → -ienne"], ["bon", "bonne", "adj", "-on → -onne"],
  ["épais", "épaisse", "adj", "-s → -sse"], ["gros", "grosse", "adj", "-s → -sse"], ["bas", "basse", "adj", "-s → -sse"], ["net", "nette", "adj", "-et → -ette"], ["sot", "sotte", "adj", "-ot → -otte"], ["idiot", "idiote", "adj", "-ot → -ote"],
];

// Adjectives for agreement: [m. sing., f. sing., m. plur., f. plur.].
export const ADJECTIVES = [
  ["blanc", "blanche", "blancs", "blanches"], ["heureux", "heureuse", "heureux", "heureuses"], ["long", "longue", "longs", "longues"], ["doux", "douce", "doux", "douces"],
  ["frais", "fraîche", "frais", "fraîches"], ["neuf", "neuve", "neufs", "neuves"], ["ancien", "ancienne", "anciens", "anciennes"], ["cruel", "cruelle", "cruels", "cruelles"],
  ["sec", "sèche", "secs", "sèches"], ["bleu", "bleue", "bleus", "bleues"], ["épais", "épaisse", "épais", "épaisses"], ["public", "publique", "publics", "publiques"],
  ["actif", "active", "actifs", "actives"], ["discret", "discrète", "discrets", "discrètes"], ["inquiet", "inquiète", "inquiets", "inquiètes"], ["gentil", "gentille", "gentils", "gentilles"],
  ["original", "originale", "originaux", "originales"], ["normal", "normale", "normaux", "normales"], ["génial", "géniale", "géniaux", "géniales"], ["naval", "navale", "navals", "navales"],
  ["joyeux", "joyeuse", "joyeux", "joyeuses"], ["sérieux", "sérieuse", "sérieux", "sérieuses"], ["vif", "vive", "vifs", "vives"], ["bas", "basse", "bas", "basses"],
  ["nouveau", "nouvelle", "nouveaux", "nouvelles"], ["beau", "belle", "beaux", "belles"], ["vieux", "vieille", "vieux", "vieilles"], ["fou", "folle", "fous", "folles"],
];
// Subjects for attribute agreement: [text, gender, plural].
export const GN_SUBJECTS = [
  ["Les fleurs", "f", true], ["Ces robes", "f", true], ["Mes cousines", "f", true], ["Les rues", "f", true], ["Ces idées", "f", true], ["La voiture", "f", false],
  ["Ma grand-mère", "f", false], ["La soupe", "f", false], ["Les garçons", "m", true], ["Ces livres", "m", true], ["Les chemins", "m", true], ["Mon voisin", "m", false],
  ["Le gâteau", "m", false], ["Les journaux", "m", true], ["Ces parents", "m", true], ["L'hiver", "m", false],
];

// Adverbs in -ment: [adjective, adverb, rule].
export const ADVERBS = [
  ["rapide", "rapidement", "adjectif + -ment"], ["lent", "lentement", "féminin + -ment (lente → lentement)"], ["doux", "doucement", "féminin + -ment"], ["heureux", "heureusement", "féminin + -ment"],
  ["vrai", "vraiment", "voyelle + -ment, sans e"], ["poli", "poliment", "voyelle + -ment, sans e"], ["absolu", "absolument", "voyelle + -ment, sans e"], ["gai", "gaiement", "exception : gaiement"],
  ["constant", "constamment", "-ant → -amment"], ["courant", "couramment", "-ant → -amment"], ["élégant", "élégamment", "-ant → -amment"], ["bruyant", "bruyamment", "-ant → -amment"], ["méchant", "méchamment", "-ant → -amment"], ["puissant", "puissamment", "-ant → -amment"],
  ["évident", "évidemment", "-ent → -emment"], ["prudent", "prudemment", "-ent → -emment"], ["fréquent", "fréquemment", "-ent → -emment"], ["récent", "récemment", "-ent → -emment"], ["patient", "patiemment", "-ent → -emment"], ["intelligent", "intelligemment", "-ent → -emment"], ["apparent", "apparemment", "-ent → -emment"], ["violent", "violemment", "-ent → -emment"],
  ["précis", "précisément", "-ément (précis, profond, énorme, aveugle, confus, commun, immense, intense)"], ["énorme", "énormément", "-ément"], ["profond", "profondément", "-ément"], ["aveugle", "aveuglément", "-ément"], ["intense", "intensément", "-ément"],
  ["gentil", "gentiment", "exception : gentiment"], ["bref", "brièvement", "exception : brièvement"], ["sec", "sèchement", "féminin sèche + -ment"], ["fou", "follement", "féminin folle + -ment"],
  ["lent", "lentement", "féminin + -ment"], ["présent", "présentement", "exception en -ent : présentement"], ["sûr", "sûrement", "féminin + -ment"], ["franc", "franchement", "féminin + -ment"],
];
export const ADVERB_FRAMES = ["Il parle ___ à sa sœur.", "Elle a répondu ___.", "Ils travaillent ___.", "Le chat s'approche ___.", "Nous avons ___ réussi.", "Tu conduis ___."];

// Agreement of the past participle with avoir and a direct object placed before: [object, gender, plural, verbs, end].
export const COD_BEFORE = [
  ["Les lettres", "f", true, ["écrire", "recevoir", "envoyer", "lire"], "sont dans le tiroir."], ["La tarte", "f", false, ["préparer", "faire", "acheter", "goûter"], "était délicieuse."],
  ["Les photos", "f", true, ["prendre", "imprimer", "choisir", "mettre"], "sont magnifiques."], ["Le livre", "m", false, ["lire", "prêter", "acheter", "offrir"], "était passionnant."],
  ["Les gâteaux", "m", true, ["préparer", "faire", "acheter", "manger"], "ont eu un grand succès."], ["La chanson", "f", false, ["chanter", "écrire", "apprendre", "entendre"], "me trotte dans la tête."],
  ["Les fleurs", "f", true, ["cueillir", "planter", "offrir", "arroser"], "sont déjà fanées."], ["Les clés", "f", true, ["perdre", "retrouver", "prendre", "cacher"], "étaient sous le tapis."],
  ["Les films", "m", true, ["voir", "regarder", "choisir", "louer"], "étaient en noir et blanc."], ["La lettre", "f", false, ["écrire", "recevoir", "ouvrir", "lire"], "venait de loin."],
  ["La maison", "f", false, ["construire", "peindre", "acheter", "vendre"], "a une vue sur la mer."], ["Les exercices", "m", true, ["finir", "corriger", "faire", "réussir"], "étaient difficiles."],
];

// Pronominal verbs, hand-made: [sentence with ___, verb hint, answers, explanation].
export const PRONOMINAUX = [
  ["Elle s'est ___ ce matin à six heures.", "réveiller", ["réveillée"], "Se réveiller : elle a réveillé qui ? se (= elle), placé avant → accord : réveillée."],
  ["Elle s'est ___ les mains.", "laver", ["lavé"], "Elle a lavé quoi ? les mains, placé après le verbe : pas d'accord."],
  ["Les enfants se sont ___ dans le parc.", "amuser", ["amusés"], "Ils ont amusé qui ? se (= les enfants) → amusés."],
  ["Ils se sont ___ pendant des heures.", "parler", ["parlé"], "On parle à quelqu'un : se est complément indirect → pas d'accord."],
  ["Elles se sont ___ tous les soirs.", "téléphoner", ["téléphoné"], "On téléphone à quelqu'un : se est COI → pas d'accord."],
  ["Les deux amies se sont ___ des lettres pendant des années.", "écrire", ["écrit"], "Elles ont écrit des lettres (COD après) à elles-mêmes (COI) → pas d'accord."],
  ["Elle s'est ___ compte de son erreur.", "rendre", ["rendu"], "Se rendre compte : le COD est « compte », placé après → rendu."],
  ["Les rois se sont ___ sur le trône.", "succéder", ["succédé"], "On succède à quelqu'un : se est COI → succédé, toujours invariable."],
  ["Les deux sœurs se sont ___ dès le premier regard.", "plaire", ["plu"], "Se plaire : on plaît à quelqu'un → plu reste invariable."],
  ["Elle s'est ___ de cet inconnu.", "méfier", ["méfiée"], "Verbe essentiellement pronominal (il n'existe pas sans « se ») : accord avec le sujet."],
  ["Ils se sont ___ sans un bruit.", "enfuir", ["enfuis"], "S'enfuir est essentiellement pronominal : accord avec le sujet → enfuis."],
  ["La lettre qu'elle s'est ___ est arrivée.", "envoyer", ["envoyée"], "Elle a envoyé quoi ? « que » (= la lettre), placé avant → envoyée."],
  ["Elle s'est ___ une robe pour le mariage.", "acheter", ["acheté"], "Le COD « une robe » est après le verbe → acheté."],
  ["Ils se sont ___ de leurs vacances.", "souvenir", ["souvenus"], "Se souvenir est essentiellement pronominal : accord avec le sujet."],
  ["Elles se sont ___ de rire.", "retenir", ["retenues"], "Elles ont retenu qui ? se (= elles) → retenues."],
  ["Les années se sont ___.", "succéder", ["succédé"], "Succéder à : se est COI → succédé."],
  ["Elle s'est ___ les cheveux.", "couper", ["coupé"], "Le COD « les cheveux » suit le verbe : pas d'accord."],
  ["Elle s'est ___ couper les cheveux.", "faire", ["fait"], "Fait suivi d'un infinitif reste toujours invariable."],
  ["Ils se sont ___ au soleil.", "endormir", ["endormis"], "Ils ont endormi qui ? se (= ils) → endormis."],
  ["Elles se sont ___ du professeur.", "moquer", ["moquées"], "Se moquer est essentiellement pronominal : accord avec le sujet."],
  ["Nous nous sommes ___ la main.", "serrer", ["serré"], "Nous avons serré la main (COD après) : pas d'accord."],
  ["Les questions qu'ils se sont ___ restent sans réponse.", "poser", ["posées"], "Ils ont posé quoi ? « que » (= les questions), placé avant → posées."],
  ["Elle s'est ___ à la porte.", "présenter", ["présentée"], "Elle a présenté qui ? se (= elle) → présentée."],
  ["Les trois frères se sont ___ toute la soirée.", "sourire", ["souri"], "On sourit à quelqu'un : se est COI → souri."],
];

// Special cases of the past participle: [sentence with ___, verb hint, answers, explanation].
export const PP_SPECIAL = [
  ["Les chanteuses que j'ai ___ chanter étaient remarquables.", "entendre", ["entendues"], "Ce sont les chanteuses qui chantent : le COD « que » fait l'action de l'infinitif → accord."],
  ["La chanson que j'ai ___ chanter est ancienne.", "entendre", ["entendu"], "La chanson ne chante pas : on a entendu chanter la chanson → pas d'accord."],
  ["Des pommes ? J'en ai ___ trois.", "manger", ["mangé"], "Avec « en », le participe passé ne s'accorde pas."],
  ["Les vingt euros que ce livre m'a ___ sont bien dépensés.", "coûter", ["coûté"], "« Coûter » un prix : complément de mesure, pas un COD → invariable."],
  ["Les efforts que ce travail m'a ___ ont payé.", "coûter", ["coûtés"], "Au sens figuré (causer), coûter a un vrai COD (les efforts) → accord."],
  ["Les trois heures qu'il a ___ ne lui ont pas suffi.", "dormir", ["dormi"], "Dormir n'a pas de COD : « les trois heures » est un complément de durée → invariable."],
  ["J'ai fait tous les efforts que j'ai ___.", "pouvoir", ["pu"], "Sous-entendu « que j'ai pu faire » : le COD est l'infinitif sous-entendu → invariable."],
  ["Quelle chaleur il a ___ cet été !", "faire", ["fait"], "Verbe impersonnel (il a fait) : toujours invariable."],
  ["Les tempêtes qu'il y a ___ ont tout détruit.", "avoir", ["eu"], "« Il y a » est impersonnel : eu reste invariable."],
  ["Quelle belle maison vous avez ___ !", "acheter", ["achetée"], "Le COD « quelle belle maison » est placé avant → achetée."],
  ["Combien de livres as-tu ___ cet été ?", "lire", ["lus"], "Le COD « combien de livres » est avant le verbe → lus."],
  ["Elle s'est ___ convaincre sans résister.", "laisser", ["laissé"], "Ce n'est pas elle qui convainc : laissé reste invariable (et depuis 1990, laissé suivi d'un infinitif est toujours invariable, comme fait)."],
  ["Ces enfants, je les ai ___ grandir.", "voir", ["vus"], "Ce sont les enfants qui grandissent : COD sujet de l'infinitif → vus."],
  ["Ces maisons, je les ai ___ construire.", "voir", ["vu"], "Les maisons ne construisent pas : COD de l'infinitif → vu."],
  ["Les pluies qu'il est ___ ont inondé la vallée.", "tomber", ["tombé"], "« Il est tombé des pluies » est impersonnel : tombé reste invariable."],
  ["Les dix kilos qu'il a ___ l'ont surpris.", "peser", ["pesé"], "Peser dix kilos : complément de mesure → invariable."],
  ["Les valises qu'il a ___ étaient lourdes.", "peser", ["pesées"], "Il a pesé quoi ? les valises (vrai COD, placé avant) → pesées."],
  ["Elle nous a ___ partir.", "faire", ["fait"], "Fait suivi d'un infinitif est toujours invariable."],
];

// Present participle or verbal adjective: [sentence with ___, answers, explanation].
export const PPR_ADJ = [
  ["Cette randonnée était vraiment ___.", ["fatigante"], "Adjectif verbal (qualité, s'accorde) : fatigant, fatigante — sans u."],
  ["___ ses camarades, il est arrivé premier.", ["Fatiguant"], "Participe présent (action, complément « ses camarades ») : fatiguant, avec u, invariable."],
  ["Ses arguments sont très ___.", ["convaincants"], "Adjectif verbal : convaincant(s), avec c."],
  ["___ tout le monde, il a obtenu le poste.", ["Convainquant"], "Participe présent : convainquant, avec qu, invariable."],
  ["Elle a lu un roman très ___.", ["intrigant"], "Adjectif verbal : intrigant, sans u."],
  ["___ pour obtenir une place, il a fini par réussir.", ["Intriguant"], "Participe présent : intriguant."],
  ["Le personnel ___ est en grève.", ["navigant"], "Adjectif verbal : navigant (le personnel navigant)."],
  ["___ entre les écueils, le bateau avançait lentement.", ["Naviguant"], "Participe présent : naviguant, avec u."],
  ["Le jour ___ la fête, tout le monde était prêt.", ["précédant"], "Participe présent (il a un complément : la fête) : précédant, invariable."],
  ["Le jour ___, il pleuvait.", ["précédent"], "Adjectif : précédent (= d'avant), avec -ent."],
  ["C'est un élève ___ : il oublie tout.", ["négligent"], "Adjectif : négligent."],
  ["___ ses devoirs, il a raté l'examen.", ["Négligeant"], "Participe présent : négligeant, avec e après g."],
  ["Nous avons des opinions ___.", ["différentes"], "Adjectif : différent(es)."],
  ["Les avis ___ sur ce point, ils ont voté.", ["différant"], "Participe présent (= ayant des avis qui diffèrent) : différant, invariable."],
  ["Cette chaleur ___ nous empêchait de dormir.", ["suffocante"], "Adjectif verbal : suffocant(e), avec c."],
  ["Il est sorti, ___ sous la fumée.", ["suffoquant"], "Participe présent : suffoquant."],
  ["C'est un médecin ___ dans sa spécialité.", ["excellent"], "Adjectif : excellent."],
  ["___ en mathématiques, elle aide ses amis.", ["Excellant"], "Participe présent (action, complément « en mathématiques ») : excellant."],
  ["C'est une personne très ___ dans le milieu.", ["influente"], "Adjectif : influent(e)."],
  ["Les deux appartements sont ___.", ["équivalents"], "Adjectif : équivalent(s)."],
  ["Une somme ___ à un mois de salaire a été versée.", ["équivalant"], "Participe présent (complément « à un mois de salaire ») : équivalant, invariable."],
  ["Ses gestes ___ ont choqué le public.", ["provocants"], "Adjectif verbal : provocant(s), avec c."],
  ["En ___ ses voisins, il s'est fait des ennemis.", ["provoquant"], "Gérondif (en + participe présent) : provoquant."],
  ["Les ___ de ce club se réunissent le lundi.", ["adhérents"], "Nom : les adhérents."],
];

// Mode after a word or expression: [sentence with ___, right, wrong, explanation].
export const MODES = [
  ["Bien qu'il ___ tard, je reste.", "soit", "est", "Bien que + subjonctif."], ["Je veux que tu ___ la vérité.", "dises", "dis", "Vouloir que + subjonctif."],
  ["Il faut que nous ___ avant midi.", "partions", "partons", "Il faut que + subjonctif."], ["Je pense qu'il ___ raison.", "a", "ait", "Penser que (affirmatif) + indicatif."],
  ["Je ne pense pas qu'il ___ raison.", "ait", "a", "Ne pas penser que : le doute appelle le subjonctif."], ["Après qu'il ___ parti, nous avons dîné.", "est", "soit", "Après que + indicatif (le fait a eu lieu) — erreur très fréquente !"],
  ["Avant qu'il ___, rangeons tout.", "vienne", "vient", "Avant que + subjonctif."], ["J'espère que tu ___ demain.", "viendras", "viennes", "Espérer que + indicatif (souvent le futur)."],
  ["Il est possible qu'elle ___ en retard.", "soit", "est", "Il est possible que + subjonctif (incertitude)."], ["Il est probable qu'elle ___ en retard.", "sera", "soit", "Il est probable que + indicatif (forte probabilité)."],
  ["Il semble que tu ___ raison.", "aies", "as", "Il semble que + subjonctif."], ["Il me semble que tu ___ raison.", "as", "aies", "Il me semble que + indicatif."],
  ["Je cherche quelqu'un qui ___ parler chinois.", "sache", "sait", "Relative après un antécédent incertain (je cherche) : subjonctif."], ["Je connais quelqu'un qui ___ parler chinois.", "sait", "sache", "Antécédent réel (je connais) : indicatif."],
  ["Pour que tu ___, je parle lentement.", "comprennes", "comprends", "Pour que + subjonctif (but)."], ["Puisque tu ___ là, aide-moi.", "es", "sois", "Puisque + indicatif (cause)."],
  ["Je doute qu'il ___ la réponse.", "connaisse", "connaît", "Douter que + subjonctif."], ["Je suis sûr qu'il ___ la réponse.", "connaît", "connaisse", "Être sûr que + indicatif."],
  ["Attends jusqu'à ce que je ___ revenu.", "sois", "suis", "Jusqu'à ce que + subjonctif."], ["Il travaille sans que personne le ___.", "sache", "sait", "Sans que + subjonctif."],
  ["C'est le meilleur film que j'___ vu.", "aie", "ai", "Après un superlatif (le meilleur … que), on emploie en général le subjonctif."], ["Je crains qu'il ne ___ trop tard.", "soit", "est", "Craindre que + subjonctif (avec souvent le ne explétif)."],
  ["Bien que nous ___ fatigués, nous continuons.", "soyons", "sommes", "Bien que + subjonctif."], ["Tant qu'il ___, nous resterons à l'abri.", "pleuvra", "pleuve", "Tant que + indicatif."],
  ["Où que tu ___, je te retrouverai.", "ailles", "vas", "Où que + subjonctif."], ["Quoi qu'il ___, il a toujours tort.", "dise", "dit", "Quoi que + subjonctif."],
];

// Relative pronouns: [sentence with ___, answers, explanation].
export const RELATIFS = [
  ["Le livre ___ je te parle est épuisé.", ["dont"], "Parler DE quelque chose → dont."], ["La ville ___ je suis né est au bord de la mer.", ["où"], "Lieu → où."],
  ["C'est l'ami à ___ j'ai prêté mon vélo.", ["qui"], "Prêter À quelqu'un → à qui (auquel est possible aussi, sans « à »)."], ["Voici la raison pour ___ il est parti.", ["laquelle"], "Après une préposition (pour) et un nom féminin → laquelle."],
  ["C'est ce ___ j'ai besoin.", ["dont"], "Avoir besoin DE → dont (et non « ce que j'ai besoin »)."], ["C'est ce ___ je pense souvent.", ["à quoi"], "Penser À quelque chose → à quoi."],
  ["La personne ___ tu attends est arrivée.", ["que"], "Attendre quelqu'un (COD) → que."], ["Le chat ___ dort sur le canapé est à moi.", ["qui"], "Sujet du verbe dormir → qui."],
  ["Le jour ___ nous nous sommes rencontrés, il neigeait.", ["où"], "Moment → où."], ["L'entreprise ___ il travaille recrute.", ["où"], "Travailler dans une entreprise → où (on pourrait aussi dire « dans laquelle »)."],
  ["Le projet ___ elle est fière a gagné un prix.", ["dont"], "Être fier DE → dont."], ["Les collègues avec ___ je travaille sont sympathiques.", ["qui", "lesquels"], "Préposition + personne → qui (ou lesquels)."],
  ["La maison ___ le toit est rouge est à vendre.", ["dont"], "Le toit DE la maison → dont."], ["Les questions ___ il a répondu étaient faciles.", ["auxquelles"], "Répondre À des questions (féminin pluriel) → auxquelles."],
  ["Le stylo avec ___ j'écris fuit.", ["lequel"], "Préposition + chose masculine → lequel."], ["Je ne sais pas ___ veut dire ce mot.", ["ce que"], "Vouloir dire quelque chose (COD) → ce que."],
  ["Le film ___ tout le monde parle sort demain.", ["dont"], "Parler DE → dont."], ["Le pont sous ___ passe la rivière est très ancien.", ["lequel"], "Préposition + chose masculine → lequel."],
  ["C'est un sujet ___ je n'ai jamais réfléchi.", ["auquel"], "Réfléchir À quelque chose (masculin) → auquel."], ["Les enfants ___ elle s'occupe sont adorables.", ["dont"], "S'occuper DE → dont."],
];

// Paronyms: [sentence with ___, right, wrong, explanation].
export const PARONYMES = [
  ["Un danger ___ menace la région : l'orage arrive.", "imminent", "éminent", "Imminent = qui va arriver très bientôt ; éminent = remarquable, supérieur."],
  ["C'est un ___ professeur de médecine.", "éminent", "imminent", "Éminent = remarquable ; imminent = sur le point d'arriver."],
  ["Le voleur est entré par ___ dans la maison.", "effraction", "infraction", "Effraction = bris d'une clôture ou d'une serrure ; infraction = violation d'une loi."],
  ["Brûler un feu rouge est une ___ au code de la route.", "infraction", "effraction", "Infraction = manquement à une règle."],
  ["Après sa maladie, il a enfin ___ la santé.", "recouvré", "recouvert", "Recouvrer = retrouver (la santé, la vue) ; recouvrir = couvrir de nouveau."],
  ["La neige a ___ toute la vallée.", "recouvert", "recouvré", "Recouvrir = couvrir entièrement."],
  ["Le ministre a prononcé une courte ___.", "allocution", "allocation", "Allocution = petit discours ; allocation = somme versée."],
  ["Elle touche une ___ de logement.", "allocation", "allocution", "Allocation = somme d'argent versée."],
  ["Le juge lui a ___ une amende.", "infligé", "affligé", "Infliger = imposer (une peine) ; affliger = causer du chagrin."],
  ["Cette triste nouvelle nous a profondément ___.", "affligés", "infligés", "Affliger = attrister."],
  ["L'___ du volcan a surpris les habitants.", "éruption", "irruption", "Éruption = sortie violente (volcan, boutons) ; irruption = entrée brusque."],
  ["Les supporters ont fait ___ sur le terrain.", "irruption", "éruption", "Faire irruption = entrer brusquement."],
  ["Il a obtenu une ___ de son contrat de deux mois.", "prolongation", "prolongement", "Prolongation = dans le temps ; prolongement = dans l'espace."],
  ["Le ___ de la ligne de tramway est prévu.", "prolongement", "prolongation", "Prolongement = extension dans l'espace."],
  ["L'___ de la tour de Pise attire les touristes.", "inclinaison", "inclination", "Inclinaison = état de ce qui est penché ; inclination = penchant, goût."],
  ["Il a une forte ___ pour la musique.", "inclination", "inclinaison", "Inclination = penchant, attirance."],
  ["Ce n'est qu'une ___ : rien n'est prouvé.", "conjecture", "conjoncture", "Conjecture = supposition ; conjoncture = situation économique ou générale."],
  ["La ___ économique est difficile cette année.", "conjoncture", "conjecture", "Conjoncture = ensemble des circonstances."],
  ["Il dépense sans compter : c'est un fils ___.", "prodigue", "prodige", "Prodigue = qui dépense trop ; prodige = enfant exceptionnellement doué."],
  ["À six ans, elle jouait du Mozart : un vrai ___.", "prodige", "prodigue", "Un prodige = un enfant extraordinairement doué."],
  ["Le malfaiteur a ___ un vol audacieux.", "perpétré", "perpétué", "Perpétrer = commettre (un crime) ; perpétuer = faire durer."],
  ["Ce village ___ une tradition millénaire.", "perpétue", "perpètre", "Perpétuer = faire durer."],
  ["Les deux voitures sont entrées en ___.", "collision", "collusion", "Collision = choc ; collusion = entente secrète."],
  ["On soupçonne une ___ entre les deux entreprises.", "collusion", "collision", "Collusion = entente secrète et frauduleuse."],
  ["Le mot « grève » a plusieurs ___.", "acceptions", "acceptations", "Acception = sens d'un mot ; acceptation = fait d'accepter."],
  ["Nous attendons l'___ de notre dossier.", "acceptation", "acception", "Acceptation = fait d'accepter."],
  ["Son ___ dans le quartier est grande : tout le monde le connaît.", "notoriété", "notabilité", "Notoriété = fait d'être connu ; notabilité = personne importante."],
  ["Il faut ___ le budget avant la fin de l'année.", "évaluer", "évoluer", "Évaluer = estimer la valeur ; évoluer = changer progressivement."],
  ["Le jury a délivré son ___ : coupable.", "verdict", "édit", "Verdict = décision d'un jury ; édit = loi promulguée par un roi."],
];

// Connectors: [sentence with ___, right, wrongs, explanation].
export const CONNECTEURS = [
  ["Il pleuvait ; ___, nous sommes sortis.", "pourtant", ["donc", "car", "en effet"], "Opposition (il pleuvait, et malgré cela nous sommes sortis) → pourtant."],
  ["Il a beaucoup travaillé ; il a ___ réussi.", "donc", ["pourtant", "car", "or"], "Conséquence → donc."],
  ["Je reste à la maison, ___ je suis malade.", "car", ["donc", "pourtant", "ainsi"], "Cause → car."],
  ["Tous les hommes sont mortels ; ___ Socrate est un homme.", "or", ["donc", "car", "ainsi"], "« Or » introduit un fait nouveau qui fait avancer le raisonnement (syllogisme)."],
  ["Le projet coûte cher ; ___, il pollue.", "de plus", ["cependant", "donc", "car"], "Addition d'un argument → de plus."],
  ["___ la pluie, le match a eu lieu.", "Malgré", ["Grâce à", "À cause de", "Pour"], "Opposition + nom → malgré."],
  ["___ ton aide, j'ai fini à temps.", "Grâce à", ["Malgré", "À cause de", "Faute de"], "Cause positive → grâce à."],
  ["Le train est en retard ___ la neige.", "à cause de", ["grâce à", "malgré", "afin de"], "Cause négative → à cause de."],
  ["Il parle fort ___ tout le monde l'entende.", "pour que", ["parce que", "bien que", "alors que"], "But + subjonctif → pour que."],
  ["Elle est sortie ___ il faisait froid.", "alors qu'", ["parce qu'", "pour qu'", "afin qu'"], "Opposition entre deux faits → alors que."],
  ["Il n'a pas révisé ; ___, il a raté l'examen.", "par conséquent", ["néanmoins", "en revanche", "toutefois"], "Conséquence → par conséquent."],
  ["Ce restaurant est cher ; ___, il est excellent.", "en revanche", ["par conséquent", "ainsi", "donc"], "Contraste entre deux aspects → en revanche."],
  ["Je n'aime pas la ville ; ___, j'y vis depuis vingt ans.", "néanmoins", ["ainsi", "donc", "car"], "Concession → néanmoins."],
  ["Il est très fatigué ; ___, il dort debout.", "en effet", ["pourtant", "néanmoins", "or"], "Explication, justification → en effet."],
  ["___ il fasse beau, nous resterons ici.", "Bien qu'", ["Parce qu'", "Puisqu'", "Dès qu'"], "Concession + subjonctif → bien que."],
  ["___ tu es là, aide-moi à porter ces cartons.", "Puisque", ["Bien que", "Pour que", "Afin que"], "Cause évidente → puisque."],
  ["Les prix ont augmenté ; ___, les ventes ont baissé.", "dès lors", ["toutefois", "certes", "cependant"], "Conséquence (registre soutenu) → dès lors."],
  ["___, ce livre est long ; mais il se lit avec plaisir.", "Certes", ["Donc", "Ainsi", "Car"], "Concession (certes … mais) → certes."],
  ["Il faut agir vite, ___ il sera trop tard.", "sinon", ["donc", "car", "ainsi"], "Condition négative → sinon."],
  ["Elle aime le sport ; ___, elle court tous les matins.", "ainsi", ["pourtant", "or", "cependant"], "Illustration, conséquence → ainsi."],
];

// Figures of speech: [example, right, wrongs, explanation].
export const FIGURES = [
  ["Cette obscure clarté qui tombe des étoiles.", "oxymore", ["antithèse", "métaphore", "litote"], "Oxymore : deux mots contradictoires réunis dans une même expression (obscure clarté)."],
  ["Va, je ne te hais point.", "litote", ["euphémisme", "hyperbole", "oxymore"], "Litote : dire moins pour suggérer plus (« je ne te hais point » = je t'aime)."],
  ["Il nous a quittés la semaine dernière.", "euphémisme", ["litote", "métonymie", "hyperbole"], "Euphémisme : adoucir une réalité pénible (il est mort)."],
  ["Je te l'ai dit mille fois !", "hyperbole", ["anaphore", "litote", "gradation"], "Hyperbole : exagération."],
  ["Cet homme est un lion.", "métaphore", ["comparaison", "personnification", "métonymie"], "Métaphore : rapprochement sans outil de comparaison."],
  ["Cet homme est courageux comme un lion.", "comparaison", ["métaphore", "allégorie", "hyperbole"], "Comparaison : rapprochement avec un outil (comme)."],
  ["Le vent hurlait dans la nuit.", "personnification", ["métaphore", "comparaison", "allitération"], "Personnification : attribuer des traits humains à une chose."],
  ["Boire un verre.", "métonymie", ["métaphore", "synecdoque", "litote"], "Métonymie : le contenant pour le contenu (on boit ce qu'il y a dans le verre)."],
  ["Va, cours, vole, et nous venge !", "gradation", ["anaphore", "chiasme", "antithèse"], "Gradation : termes de plus en plus forts."],
  ["Rome, l'unique objet de mon ressentiment ! Rome, à qui vient ton bras d'immoler mon amant !", "anaphore", ["gradation", "chiasme", "hyperbole"], "Anaphore : répétition d'un mot en tête de phrases ou de vers."],
  ["Il faut manger pour vivre et non vivre pour manger.", "chiasme", ["antithèse", "anaphore", "oxymore"], "Chiasme : structure croisée A-B / B-A."],
  ["Je ne vous parlerai pas de son courage ni de sa générosité.", "prétérition", ["litote", "euphémisme", "antiphrase"], "Prétérition : dire qu'on ne va pas parler d'une chose… tout en en parlant."],
  ["Bravo, quelle réussite ! (devant un gâteau brûlé)", "antiphrase", ["hyperbole", "litote", "euphémisme"], "Antiphrase : dire le contraire de ce qu'on pense (ironie)."],
  ["Il prit son chapeau et la porte.", "zeugme", ["chiasme", "métonymie", "anaphore"], "Zeugme : un même verbe relie deux compléments de nature différente (concret / abstrait)."],
  ["Pour qui sont ces serpents qui sifflent sur vos têtes ?", "allitération", ["assonance", "anaphore", "hyperbole"], "Allitération : répétition d'une consonne (le son s)."],
  ["Paris a la tête dans les nuages et les pieds dans la Seine.", "personnification", ["comparaison", "oxymore", "litote"], "La ville reçoit des parties d'un corps humain."],
  ["Le jour et la nuit, le rire et les larmes.", "antithèse", ["oxymore", "chiasme", "gradation"], "Antithèse : opposition de deux idées dans des termes proches (mais pas dans une même expression)."],
];

// Registers: [familiar word or phrase, neutral or formal equivalent, sentence with ___].
export const REGISTRES = [
  ["bosser", "travailler", "Il doit ___ tout le week-end."], ["une bagnole", "une voiture", "Il a acheté ___ d'occasion."], ["le boulot", "le travail", "Elle est partie au ___ tôt ce matin."],
  ["piger", "comprendre", "Je n'arrive pas à ___ cet exercice."], ["un bouquin", "un livre", "J'ai lu ___ passionnant."], ["bouffer", "manger", "Nous allons ___ au restaurant."],
  ["se planter", "se tromper", "Il risque de ___ de chemin."], ["les fringues", "les vêtements", "Range ___ dans l'armoire."], ["un mec", "un homme", "___ est venu livrer le colis."],
  ["flipper", "avoir peur", "Elle commence à ___ avant l'examen."], ["une baraque", "une maison", "Ils ont acheté ___ à la campagne."], ["causer", "parler", "Ils aiment ___ de politique."],
];

// Plurals of compound nouns: [singular, plurals, explanation].
export const COMPOSES = [
  ["un chou-fleur", ["des choux-fleurs"], "Nom + nom : les deux prennent la marque du pluriel."], ["un coffre-fort", ["des coffres-forts"], "Nom + adjectif : les deux s'accordent."],
  ["un chef-d'œuvre", ["des chefs-d'œuvre"], "Nom + préposition + nom : seul le premier nom varie."], ["un arc-en-ciel", ["des arcs-en-ciel"], "Nom + préposition + nom : seul le premier varie."],
  ["un oiseau-mouche", ["des oiseaux-mouches"], "Nom + nom : les deux varient."], ["un sourd-muet", ["des sourds-muets"], "Adjectif + adjectif : les deux varient."],
  ["un tire-bouchon", ["des tire-bouchons"], "Verbe + nom : le verbe ne varie jamais, le nom prend la marque du pluriel."], ["un taille-crayon", ["des taille-crayons"], "Verbe + nom : seul le nom varie."],
  ["un grand-père", ["des grands-pères"], "Adjectif + nom : les deux varient."], ["un timbre-poste", ["des timbres-poste"], "Le second nom est un complément (timbre pour la poste) : il reste au singulier."],
  ["un après-midi", ["des après-midi", "des après-midis"], "Traditionnellement invariable ; « des après-midis » est accepté depuis 1990."], ["un gratte-ciel", ["des gratte-ciel", "des gratte-ciels"], "Traditionnellement invariable ; « des gratte-ciels » est accepté depuis 1990."],
  ["un sous-sol", ["des sous-sols"], "Préposition + nom : seul le nom varie."], ["un avant-bras", ["des avant-bras"], "Bras se termine par s : rien ne change."],
  ["un rouge-gorge", ["des rouges-gorges"], "Adjectif + nom : les deux varient."], ["un cerf-volant", ["des cerfs-volants"], "Nom + adjectif : les deux varient."],
];

// Hard words of everyday spelling: [right, wrongs, explanation].
export const USAGE = [
  ["dilemme", ["dilemne", "dillemme"], "Dilemme s'écrit avec mm (du grec lêmma)."], ["rémunération", ["rénumération", "rémunérration"], "Rémunération vient de « munus » (cadeau) : ré-mu-né-ra-tion."],
  ["infarctus", ["infractus", "infarctu"], "Infarctus : on entend « farc », pas « frac »."], ["aéroport", ["aréoport", "aéroporc"], "Aéroport : aéro- (l'air)."],
  ["occurrence", ["occurence", "ocurrence"], "Occurrence : deux c et deux r."], ["connexion", ["connection", "conexion"], "En français : connexion (avec x)."],
  ["hypothèse", ["hypotèse", "hippothèse"], "Hypothèse : hy-po-thèse, avec y et th."], ["rythme", ["rhythme", "rytme"], "Rythme : y et th, un seul h."],
  ["accueil", ["acceuil", "acueil"], "Après c, on écrit -ueil pour faire le son [œj] : accueil, cueillir, cercueil."], ["parallèle", ["parralèle", "parallelle"], "Parallèle : un r, deux l puis un l."],
  ["symétrie", ["symmétrie", "simétrie"], "Symétrie : un seul m."], ["dysfonctionnement", ["disfonctionnement", "dysfonctionement"], "Dys- (mauvais) et deux n à fonctionnement."],
  ["abréviation", ["abbréviation", "abréviassion"], "Abréviation : un seul b."], ["agrandir", ["aggrandir", "agrendir"], "Agrandir : un seul g (mais aggraver en prend deux)."],
  ["aggraver", ["agraver", "aggravver"], "Aggraver : deux g."], ["apercevoir", ["appercevoir", "apercevoire"], "Apercevoir : un seul p."], ["appeler", ["apeler", "appelerr"], "Appeler : deux p, un l."],
  ["imbécile", ["imbécille", "imbecile"], "Imbécile : un seul l (mais imbécillité en prend deux traditionnellement)."], ["exigence", ["exigeance", "éxigence"], "Exigence : -ence (mais exigeant)."],
  ["eczéma", ["ecséma", "egzéma"], "Eczéma : avec cz (exéma est aussi accepté depuis 1990)."],
  ["honneur", ["honeur", "honnneur"], "Honneur : deux n (mais honorer, honorable : un seul)."], ["honorer", ["honnorer", "honnorrer"], "Honorer : un seul n (mais honneur en prend deux)."],
  ["siffler", ["sifler", "siffller"], "Siffler : deux f (mais persifler, boursoufler : un seul traditionnellement)."], ["bizarre", ["bizare", "bizzare"], "Bizarre : un z, deux r."],
  ["acquérir", ["aquérir", "acquerir"], "Acquérir : cq, comme acquis."], ["échalote", ["échalotte", "échallote"], "Échalote : un l, un t."], ["carotte", ["carrote", "carote"], "Carotte : un r, deux t."],
  ["courrier", ["courier", "courrié"], "Courrier : deux r."],
  ["développement", ["dévelopement", "développemment"], "Développement : un l, deux p."], ["vraisemblable", ["vraissemblable", "vraisemblabe"], "Vraisemblable : un seul s (vrai + semblable)."],
];
