// Rules for the typical mistakes of French native speakers: homophones, agreements, -é / -er, conjugation after a
// subject, subjunctive and « si », negation, elision, capitals and punctuation, pleonasms and usage.
// checkRules(tk) → issues [{ start, end, cat, rule, msg, fix: [] }] (character offsets). Pure.
import { conjugations, participle, verbInfo } from "../engine/conjugue.js";
import { tierOf, maskOf, TAGS, suggest as suggestWord } from "./spell.js";
import { readings, ppReadings } from "./verbindex.js";
import { stripAccents } from "../answer.js";

const keepCase = (orig, rep) => (/^\p{Lu}/u.test(orig) ? rep.charAt(0).toUpperCase() + rep.slice(1) : rep);
const T = TAGS;
const m = (w) => maskOf(w);

// ---------- Word classes ----------

const SUBJECT = { je: 0, "j'": 0, tu: 1, il: 2, elle: 2, on: 2, ils: 5, elles: 5 };
const PERSON_NAME = ["je", "tu", "il / elle / on", "nous", "vous", "ils / elles"];
const SKIP_AFTER_SUBJECT = new Set(["ne", "n'", "me", "m'", "te", "t'", "se", "s'", "le", "la", "l'", "les", "lui", "leur", "y", "en", "nous", "vous"]);
const PREPOSITIONS = new Set(["à", "avec", "pour", "sans", "chez", "de", "d'", "contre", "entre", "vers", "par", "sur", "sous", "devant", "derrière", "après", "avant", "comme", "selon", "envers", "malgré", "parmi", "et", "ou", "ni", "que", "qu'"]);
const PREP_ONLY = new Set(["à", "avec", "pour", "sans", "chez", "contre", "entre", "vers", "par", "sur", "sous", "devant", "derrière", "après", "avant", "selon", "envers", "malgré"]);
const DET_PL = new Set(["les", "des", "ces", "mes", "tes", "ses", "nos", "vos", "leurs", "plusieurs", "quelques", "certains", "certaines", "divers", "diverses", "aux", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "douze", "quinze", "vingt", "cent", "mille", "nombreux", "nombreuses", "tous", "toutes"]);
const DET_SG = new Set(["un", "une", "le", "la", "mon", "ma", "ton", "ta", "son", "sa", "ce", "cet", "cette", "chaque", "aucun", "aucune", "du", "au"]);
const DET_M = new Set(["un", "le", "ce", "cet", "du", "au"]);
const DET_F = new Set(["une", "la", "cette"]);
const NEG2 = new Set(["pas", "jamais", "plus", "rien", "personne", "guère", "point"]);
const AUX_AVOIR = new Set(["ai", "as", "a", "avons", "avez", "ont", "avais", "avait", "avions", "aviez", "avaient", "aurai", "auras", "aura", "aurons", "aurez", "auront", "aurais", "aurait", "aurions", "auriez", "auraient", "eus", "eut", "eûmes", "eurent", "aie", "aies", "ait", "ayons", "ayez", "aient", "eût"]);
const AUX_ETRE = new Set(["suis", "es", "est", "sommes", "êtes", "sont", "étais", "était", "étions", "étiez", "étaient", "serai", "seras", "sera", "serons", "serez", "seront", "serais", "serait", "serions", "seriez", "seraient", "fus", "fut", "fûmes", "furent", "sois", "soit", "soyons", "soyez", "soient", "fût"]);
const ADVERBS = new Set(["pas", "jamais", "plus", "déjà", "bien", "mal", "tout", "encore", "beaucoup", "trop", "vite", "toujours", "souvent", "enfin", "presque", "aussi", "vraiment", "sans", "peut-être", "très", "si", "assez", "tellement", "rien", "même", "longtemps", "probablement", "sûrement", "certainement", "forcément", "tant", "moins"]);
// Verbs and words followed by an infinitive (so a 1st-group verb after them ends in -er).
const INF_TRIGGERS = /^(vais|vas|va|allons|allez|vont|allait|allaient|allais|veux|veut|voulons|voulez|veulent|voulais|voulait|voudrais|voudrait|peux|peut|pouvons|pouvez|peuvent|pouvait|pourrait|pourrais|dois|doit|devons|devez|doivent|devait|devrait|devrais|faut|fallait|faudra|faudrait|sais|sait|savons|savez|savent|aime|aimes|aimons|aimez|aiment|adore|adores|adorent|déteste|détestent|préfère|préfères|préfèrent|ose|osent|pour|sans|afin|d'|de)$/;
// Contexts after which « de » + verb wants an infinitive (essayer de manger, avant de partir…).
const DE_TRIGGERS = /^(essaie|essaye|essaies|essayons|essayez|essaient|essayé|essayait|décide|décidé|décidons|arrête|arrêté|arrêtons|oublie|oublié|oublions|avant|afin|temps|envie|besoin|train|peur|refuse|refusé|accepte|accepté|permis|interdit|commencé|fini|finis|finit|choisi|promis|tente|tenté|rêve|rêvé|propose|proposé|demande|demandé|conseille|conseillé)$/;
// Verbs commonly followed by « à » + infinitive.
const A_TRIGGERS = /^(commence|commences|commencent|commençait|commencé|continue|continues|continuent|continuait|apprend|apprends|apprennent|appris|aide|aides|aident|aidé|réussit|réussis|réussissent|réussi|pense|penses|pensent|pensé|cherche|cherches|cherchent|cherché|hésite|hésites|hésitent|hésité|arrive|arrives|arrivent|arrivé|invite|invitent|invité|encourage|encouragé|sert|servent|servi|tient|tiennent|tenu|machine|salle|fer|brosse|chambre|boîte|sac|verre|planche|moulin|rouleau|cuillère|bête|maison|facile|difficile|prêt|prête|prêts|prêtes|premier|première|dernier|dernière|seul|seule)$/;
const SUBJUNCTIVE_TRIGGERS = [
  "il faut que", "il faut qu'", "pour que", "pour qu'", "afin que", "afin qu'", "bien que", "bien qu'", "avant que", "avant qu'", "quoique", "quoiqu'",
  "à condition que", "à condition qu'", "sans que", "sans qu'", "jusqu'à ce que", "jusqu'à ce qu'", "de peur que", "de peur qu'", "à moins que", "à moins qu'",
  "je veux que", "je veux qu'", "il veut que", "il veut qu'", "elle veut que", "elle veut qu'", "je voudrais que", "je voudrais qu'", "il est nécessaire que", "il est nécessaire qu'",
  "il est important que", "il est important qu'", "il est possible que", "il est possible qu'", "il se peut que", "il se peut qu'", "je doute que", "je doute qu'",
  "je souhaite que", "je souhaite qu'", "il faudrait que", "il faudrait qu'", "il fallait que", "il fallait qu'", "en attendant que", "en attendant qu'",
];
const H_ASPIRE = new Set("haricot haricots hibou hiboux héros hasard hasards haine hache hachette haie haies hall halte hamac hamster hanche handicap hangar hareng harpe hausse haut hauts haute hauteur hérisson hêtre hiérarchie hockey homard honte hors hublot huit hurler haïr hutte hall hameau hamburger hantise harcèlement hardi hargne hernie hiboux hold-up hollandais hongrois hurlement hurle hurlent hâte hâter halle halles harnais hasarder hausser haussement".split(" "));
const DAYS_MONTHS = new Set("lundi mardi mercredi jeudi vendredi samedi dimanche janvier février mars avril mai juin juillet août septembre octobre novembre décembre".split(" "));
const STARTS_CLAUSE = new Set([",", "et", "mais", "ou", "car", "donc", "même", ";"]);
const ELIDE = new Set(["le", "la", "de", "je", "me", "te", "se", "ne", "que", "ce", "lorsque", "puisque", "quoique", "jusque"]);
const NO_ELISION = /^(un|une|onze|onzième|huit|huitième|oui|ouistiti|yaourt|yoga|yacht|uhlan|ouate)$/;

// ---------- Helpers ----------

// Families with an aspirated h (honteux, hanter, harceler…), beyond the words listed above.
const H_ASPIRE_STEM = /^(hont|hant|harc[eè]l|hargn|hasard|hauss|hach|haï|hais|hait|hurl|hiss|hoch|houl|houss|hâte|hardi|harpon|hamac|hangar|hareng|hibou|hiérarch|homard|hublot|hutt|halte|hamst|hanch|handicap)/;
const isVowelStart = (w) => {
  if (/^[aeiouyàâäéèêëîïôöùûüœæ]/i.test(w)) return true;
  if (!/^h/i.test(w)) return false;
  const low = w.toLowerCase().replace(/[^a-zâêîôûàéèëïüç-]/g, "");
  return !H_ASPIRE.has(low) && !H_ASPIRE_STEM.test(low);
};
// Adjectives that never agree (une livraison express, des chaussures marron).
const INVARIABLE_ADJ = new Set(["express", "standard", "chic", "marron", "orange", "kaki", "cerise", "olive", "turquoise", "extra", "super", "sympa", "snob", "bio", "pop", "rock"]);
/** Feminine of an adjective or participle, when it exists in the dictionary. */
function feminine(w) {
  const c = [];
  if (/eux$/.test(w)) c.push(w.replace(/eux$/, "euse"));
  if (/eur$/.test(w)) c.push(w.replace(/eur$/, "euse"), w.replace(/teur$/, "trice"));
  if (/er$/.test(w)) c.push(w.replace(/er$/, "ère"));
  if (/f$/.test(w)) c.push(w.replace(/f$/, "ve"));
  if (/el$/.test(w)) c.push(`${w}le`);
  if (/eil$/.test(w)) c.push(`${w}le`);
  if (/[ie]n$/.test(w)) c.push(`${w}ne`);
  if (/on$/.test(w)) c.push(`${w}ne`);
  if (/et$/.test(w)) c.push(`${w}te`, w.replace(/et$/, "ète"));
  if (/c$/.test(w)) c.push(w.replace(/c$/, "che"), w.replace(/c$/, "que"));
  if (/g$/.test(w)) c.push(`${w}ue`);
  const special = { beau: "belle", nouveau: "nouvelle", vieux: "vieille", fou: "folle", mou: "molle", frais: "fraîche", doux: "douce", faux: "fausse", roux: "rousse", gentil: "gentille", favori: "favorite", long: "longue" };
  if (special[w]) c.unshift(special[w]);
  c.push(`${w}e`);
  return c.find((x) => x !== w && tierOf(x) > 0 && m(x) & T.F) || null;
}
/** Plural of a noun, adjective or participle, when it exists in the dictionary. */
function plural(w, wantMask) {
  if (/[sxz]$/.test(w)) return null;
  const c = [`${w}s`, `${w}x`, w.replace(/al$/, "aux"), w.replace(/ail$/, "aux")];
  return c.find((x) => x !== w && tierOf(x) > 0 && m(x) & wantMask) || null;
}
/** Singular of a plural noun, when it exists in the dictionary. */
function singular(w) {
  const c = [w.replace(/s$/, ""), w.replace(/x$/, ""), w.replace(/aux$/, "al")];
  return c.find((x) => x !== w && tierOf(x) > 0 && m(x) & T.NS) || null;
}

// ---------- Phrase rules ----------
// JavaScript's \b only knows ASCII letters (« il à » has no \b after « à ») : every \b of the patterns becomes a
// boundary between a letter and a non-letter.
const B = "(?:(?<=[\\p{L}'])(?![\\p{L}])|(?<![\\p{L}'])(?=[\\p{L}]))";
const U = (re) => new RegExp(re.source.replace(/\\b/g, B), re.flags.includes("u") ? re.flags : `${re.flags}u`);
// [id, cat, regex (case-insensitive, Unicode), message, fix(match, ...groups) → string | string[] | null]

const PHRASES = [
  ["a-subject", "grammar", /\b(il|elle|on|qui|ça|cela) à\b/giu, "Après un sujet, c'est le verbe avoir : **a** (on peut dire « avait »).", (x, s) => `${s} a`],
  ["il-y-a", "grammar", /\bil y à\b|\bil y'a\b|\bil ya\b/giu, "On écrit **il y a** (trois mots, sans accent ni apostrophe).", () => "il y a"],
  ["a-expression", "grammar", /\ba (cause|partir|côté|travers|peu près|nouveau|peine|part|moins|propos|bientôt|demain|l'aide|l'heure|la fois|pied|vélo|mon avis|ton avis|son avis|notre avis|votre avis|leur avis|chaque fois|la place|l'avance|l'instant|l'époque|condition)\b/giu, "Dans cette locution, c'est la préposition **à** (on ne peut pas dire « avait »).", (x, e) => `à ${e}`],
  ["jusqu-a", "grammar", /\bjusqu'a\b/giu, "On écrit **jusqu'à**.", () => "jusqu'à"],
  ["est-et-cest", "grammar", /\bc'et\b/giu, "On écrit **c'est** (cela est).", () => "c'est"],
  ["quand-a", "grammar", /\bquand (à|au|aux)\b/giu, "« En ce qui concerne » se dit **quant à** (avec un t).", (x, a) => `quant ${a}`],
  ["quant-il", "grammar", /\bquant (il|elle|on|je|tu|nous|vous|ils|elles|j')\b/giu, "« Lorsque » se dit **quand** (avec un d).", (x, s) => `quand ${s}`],
  ["ou-lieu", "grammar", /\b(jour|moment|ville|endroit|lieu|pays|maison|époque|année|instant|soir|matin|quartier|village|pièce|région|période|heure|mois|cas|temps|là|d'|par) ou (je|j'|tu|il|elle|on|nous|vous|ils|elles|les|le|la|l')\b/giu, "Pour un lieu ou un moment, on écrit **où** (avec un accent).", (x, a, b) => `${a}${a === "d'" ? "" : " "}où ${b}`],
  ["ou-question", "grammar", /(^|[.!?]\s+)ou (est|sont|vas|va|vont|allez|habites|habite|se trouve|as-tu|est-ce)\b/giu, "Pour demander un lieu, on écrit **où** (avec un accent).", (x, pre, v) => `${pre}Où ${v}`],
  ["ces-sest", "grammar", /\b(il|elle|on|qui) c'est ([a-zéèêàùîôç]+é(e|s|es)?)\b/giu, "Devant un participe passé, c'est le verbe pronominal : **s'est** (je me suis, il s'est).", (x, s, pp) => `${s} s'est ${pp}`],
  ["sa-ca", "grammar", /\bsa (va|fait|marche|suffit|dépend|m'énerve|me plaît|me plait|veut dire|sert|change|commence|y est)\b/giu, "Devant un verbe, c'est le pronom **ça** (cela).", (x, v) => `ça ${v}`],
  ["ni-a", "grammar", /\bil ni a\b/giu, "On écrit **il n'y a** (négation + y).", () => "il n'y a"],
  ["peu-verb", "grammar", /\b(il|elle|on|ça|cela) peu\b/giu, "C'est le verbe pouvoir : **peut** (on peut dire « pouvait »).", (x, s) => `${s} peut`],
  ["un-peut", "grammar", /\b(un|très|trop|si|assez) peut\b(?!-être)/giu, "Ici, c'est l'adverbe **peu** (le contraire de « beaucoup »).", (x, a) => `${a} peu`],
  ["tout-les", "grammar", /\b(tout) (les|ces|mes|tes|ses|nos|vos|leurs)\b/giu, "Devant un nom masculin pluriel : **tous** (tous les jours).", (x, t, d) => `${keepCase(t, "tous")} ${d}`],
  ["tous-le", "grammar", /\b(tous) (le|ce|mon|ton|son|notre|votre|leur)\b/giu, "Devant un nom masculin singulier : **tout** (tout le monde).", (x, t, d) => `${keepCase(t, "tout")} ${d}`],
  ["toute-les", "grammar", /\b(toute) (les|ces|mes|tes|ses|nos|vos|leurs)\b/giu, "Devant un nom féminin pluriel : **toutes** (toutes les filles).", (x, t, d) => `${keepCase(t, "toutes")} ${d}`],
  ["du-du", "grammar", /\b(ai|as|a|avons|avez|ont|avait|avaient|aurait|aurais) du ([a-zéèêàùîôç]+(er|ir|re|oir))\b/giu, "Participe passé de devoir : **dû** (avec un accent, pour ne pas le confondre avec « du »).", (x, a, v) => `${a} dû ${v}`],
  ["sur-sur", "grammar", /\b(suis|es|est|sommes|êtes|sont|être|était|étais|bien|pas) sur (que|qu'|de|d')/giu, "« Certain » se dit **sûr** (avec un accent).", (x, a, b) => `${a} sûr ${b}`],
  ["bien-sur", "spelling", /\bbien sur\b(?!\s+(le|la|les|un|une|des|ce|mon|ton|son|sa|ma|ta|mes|tes|ses))/giu, "On écrit **bien sûr** (avec un accent).", () => "bien sûr"],
  ["comme-meme", "spelling", /\bcomme même\b/giu, "L'expression s'écrit **quand même**.", () => "quand même"],
  ["sense-cense", "vocab", /\b(sensé|sensée|sensés|sensées) (être|faire|aller|avoir|venir|partir|arriver|savoir|rendre|remplacer|aider|protéger|devenir)\b/giu, "« Supposé » se dit **censé** (avec un c) ; sensé = qui a du bon sens.", (x, s, v) => `${s.replace(/^s/, "c")} ${v}`],
  ["d-avantage", "spelling", /\bd'avantage\b(?!\s+(de|d'|à|sur|pour))/giu, "« Plus » se dit **davantage** (en un mot).", () => "davantage"],
  ["quelque-soit", "grammar", /\bquelque soi(en)?t\b/giu, "On écrit **quel que soit** en deux mots, accordé avec le sujet (quelle que soit, quels que soient…).", (x, en) => (en ? ["quels que soient", "quelles que soient"] : ["quel que soit", "quelle que soit"])],
  ["quelques-soient", "grammar", /\bquelques soient\b/giu, "On écrit **quels / quelles que soient** en deux mots, accordé avec le sujet.", () => ["quels que soient", "quelles que soient"]],
  ["malgre-que", "grammar", /\bmalgré qu(e|')/giu, "« Malgré que » est fautif à l'écrit : on écrit **bien que** (+ subjonctif) ou « malgré + nom ».", (x, e) => `bien qu${e}`],
  ["pallier-a", "vocab", /\b(pallier|pallie|pallies|pallient|pallié|palliait|palliera|pallions|palliez) (à|au|aux)\b/giu, "**Pallier** se construit sans « à » : on pallie un problème.", (x, v) => v],
  ["rappeler-de", "vocab", /\b(me|te|se|nous|vous) (rappelle|rappelles|rappellent|rappelons|rappelez|rappelais|rappelait|rappelé|rappelée|rappeler) (de|du|des|d')\s?(?=[a-zéèêàùîôç])/giu, "**Se rappeler** quelque chose, sans « de » (mais se souvenir DE quelque chose).", (x, p, v) => `${p} ${v} `],
  ["apres-que-subj", "grammar", /\baprès qu(e|')\s?(je|j'|tu|il|elle|on|nous|vous|ils|elles) (soit|soient|sois|soyons|soyez|ait|aient|aies|ayons|ayez|aie|parte|partent|vienne|viennent|fasse|fassent)\b/giu, "**Après que** est suivi de l'indicatif (le fait a eu lieu), contrairement à « avant que ».", null],
  ["pleonasme-monter", "style", /\b(monter|monte|montent|monté|montons|montez|montait) en haut\b/giu, "Pléonasme : on ne monte jamais en bas. **Monter** suffit (ou « monter au sommet »).", (x, v) => v],
  ["pleonasme-descendre", "style", /\b(descendre|descends|descend|descendent|descendu|descendons|descendez) en bas\b/giu, "Pléonasme : **descendre** suffit.", (x, v) => v],
  ["pleonasme-sortir", "style", /\b(sortir|sors|sort|sortent|sorti|sortie|sortis|sortons|sortez) dehors\b/giu, "Pléonasme : **sortir** suffit.", (x, v) => v],
  ["pleonasme-prevoir", "style", /\b(prévoir|prévois|prévoit|prévoient|prévu|prévue|prévus|prévoyons|prévoyez) (à l'avance|d'avance)\b/giu, "Pléonasme : prévoir, c'est déjà voir à l'avance.", (x, v) => v],
  ["pleonasme-ensemble", "style", /\b(collaborer|collabore|collaborent|collaboré|réunir|réunit|réunissent|réuni|réunis|cohabiter|cohabitent|cohabité) ensemble\b/giu, "Pléonasme : le verbe contient déjà l'idée d'« ensemble ».", (x, v) => v],
  ["pleonasme-mutuellement", "style", /\b(s'entraider|s'entraident|se sont entraidés|entraidés|entraident) mutuellement\b/giu, "Pléonasme : s'entraider, c'est déjà s'aider mutuellement.", (x, v) => v],
  ["pleonasme-aujourdhui", "style", /\bau jour d'aujourd'hui\b/giu, "Pléonasme : **aujourd'hui** suffit (ou « de nos jours »).", () => ["aujourd'hui", "de nos jours"]],
  ["pleonasme-car-en-effet", "style", /\bcar en effet\b/giu, "Pléonasme : **car** et **en effet** disent la même chose. Garde l'un des deux.", () => ["car", "en effet"]],
  ["pleonasme-puis-ensuite", "style", /\bpuis ensuite\b/giu, "Pléonasme : **puis** ou **ensuite**, pas les deux.", () => ["puis", "ensuite"]],
  ["pleonasme-voire-meme", "style", /\bvoire même\b/giu, "Pléonasme : **voire** suffit.", () => "voire"],
  ["pleonasme-comme-exemple", "style", /\bcomme par exemple\b/giu, "Pléonasme : **comme** ou **par exemple**, pas les deux.", () => ["comme", "par exemple"]],
  ["faire-sens", "vocab", /\b(fait|font|faisait|faire) du sens\b/giu, "Calque de l'anglais : on dit **avoir du sens** (ou « être sensé »).", (x, v) => `${{ fait: "a", font: "ont", faisait: "avait", faire: "avoir" }[v.toLowerCase()]} du sens`],
  ["suite-a", "style", /\bsuite (à|au|aux) /giu, "« Suite à » est critiqué dans la langue soignée : écris **à la suite de** ou **après**.", (x, a) => `à la suite ${{ à: "de", au: "du", aux: "des" }[a.toLowerCase()]} `],
  ["au-final", "style", /\bau final\b/giu, "« Au final » est familier : préfère **finalement** ou **en fin de compte**.", () => ["finalement", "en fin de compte"]],
  ["c-est-de-ca-dont", "grammar", /\bc'est (de [a-zéèêàùîôç' ]{1,20}) dont\b/giu, "Double complément : « c'est de ça **dont** » est fautif. Écris « c'est de cela **que** je parle » ou « c'est cela dont je parle ».", (x, de) => `c'est ${de} que`],
  ["croivent", "grammar", /\b(croivent|croyent)\b/giu, "Le verbe croire : **ils croient**.", () => "croient"],
  ["voyent", "grammar", /\bvoyent\b/giu, "Le verbe voir : **ils voient**.", () => "voient"],
  ["faisez", "grammar", /\bvous (faisez|disez)\b/giu, "Exception : **vous faites**, **vous dites**.", (x, v) => `vous ${v.toLowerCase() === "faisez" ? "faites" : "dites"}`],
  ["va-y", "grammar", /\bva-y\b/giu, "Devant y, l'impératif reprend son s : **vas-y**.", () => "vas-y"],
  ["parmis", "spelling", /\bparmis\b/giu, "**Parmi** ne prend jamais de s.", () => "parmi"],
  ["malgres", "spelling", /\bmalgrès?\b(?<!malgré)/giu, "On écrit **malgré** (accent aigu, sans s).", () => "malgré"],
  ["remuneration", "spelling", /\brénumér(ation|er|é|ée)\b/giu, "On écrit **rémunér…** (de « munus », le cadeau) : rémunération, rémunérer.", (x, e) => `rémunér${e}`],
  ["dilemne", "spelling", /\bdilemne(s?)\b/giu, "On écrit **dilemme** (deux m).", (x, s) => `dilemme${s}`],
  ["aeroport", "spelling", /\baréoport(s?)\b/giu, "On écrit **aéroport** (aéro-, l'air).", (x, s) => `aéroport${s}`],
  ["infarctus", "spelling", /\binfractus\b/giu, "On écrit **infarctus**.", () => "infarctus"],
  ["language", "spelling", /\blanguage(s?)\b/giu, "En français : **langage** (sans u).", (x, s) => `langage${s}`],
  ["ne-pas-personne", "grammar", /\b(ne|n') ?([a-zéèêàùîôç]+) pas (personne|rien|aucun|aucune|jamais)\b/giu, "Double négation : « ne … pas » et « personne / rien / jamais » ne vont pas ensemble.", (x, n, v, w) => `${n}${n.endsWith("'") ? "" : " "}${v} ${w}`],
  ["realiser", "style", /\b(réalise|réalises|réalisent|réalisé|réalisée|réaliser|réalisait|réalisons|réalisez) (que|qu')/giu, "Anglicisme : au sens de « comprendre », on dit **se rendre compte** (je me rends compte que…).", null],
  ["par-contre", "style", /\bpar contre\b/giu, "« Par contre » est admis, mais l'écrit soigné préfère **en revanche**.", () => "en revanche"],
  ["solutionner", "vocab", /\bsolutionn(er|é|ée|és|ées|e|es|ent|ons|ez)\b/giu, "« Solutionner » est critiqué : préfère **résoudre**.", null],
  ["ca-fait-que", "style", /\b(du coup)\b/giu, "« Du coup » est un tic de l'oral : à l'écrit, préfère **donc**, **alors** ou **par conséquent**.", () => ["donc", "par conséquent"]],
];

const PHRASES_U = PHRASES.map(([id, cat, re, msg, fix]) => [id, cat, U(re), msg, fix]);

// ---------- Token rules ----------

function tokenRules(tk) {
  const out = [];
  const Tk = tk.tokens;
  const add = (from, to, cat, rule, msg, fix) => out.push({ start: Tk[from].start, end: Tk[to].end, cat, rule, msg, fix: [].concat(fix).filter(Boolean) });
  const low = (i) => Tk[i]?.lower || "";
  for (const s of tk.sentences) {
    const W = s.tokens.filter((i) => Tk[i].word);
    // Capital letter at the start of the sentence.
    const first = Tk[s.tokens[0]];
    // After suspension points, the sentence may go on in lower case (« Je tiendrai… du moins jusqu'en février »),
    // and so does a dialogue tag after ? or ! (« — Qui a mangé le gâteau ? demanda Inès. »).
    const before = tk.text.slice(0, first?.start ?? 0);
    const dialogueTag = /[?!]\s*$/.test(before) && first?.word && (readings(first.lower).length > 0 || /^(s'|se|lui|leur|me|m'|t')$/.test(first.lower));
    if (first?.word && /^\p{Ll}/u.test(first.text) && !/(…|\.\.\.)\s*$/.test(before) && !dialogueTag) add(first.i, first.i, "mechanics", "capital-start", "Une phrase commence par une **majuscule**.", first.text.charAt(0).toUpperCase() + first.text.slice(1));
    // Clause starts (for « si », « nous / vous » subjects).
    const clauseStart = (k) => k === 0 || STARTS_CLAUSE.has(low(W[k] - 1)) || STARTS_CLAUSE.has(low(W[k - 1]));
    for (let k = 0; k < W.length; k++) {
      const i = W[k];
      const t = Tk[i];
      const lw = t.lower;
      const prev = k > 0 ? Tk[W[k - 1]] : null;
      const next = k + 1 < W.length ? Tk[W[k + 1]] : null;
      const adjacent = next && W[k + 1] === i + 1;

      // Days and months take no capital in French (except at the start of a sentence).
      if (k > 0 && DAYS_MONTHS.has(lw) && /^\p{Lu}/u.test(t.text)) add(i, i, "mechanics", "capital-day", "En français, les jours et les mois s'écrivent en **minuscules**.", lw);
      // Repeated word.
      if (prev && prev.lower === lw && W[k - 1] === i - 1 && !["nous", "vous", "très", "si", "bien", "le", "la"].includes(lw)) add(i, i, "mechanics", "repeat", "Mot répété deux fois.", "");

      // Elision: le / la / de / je / me / te / se / ne / que / ce (est) before a vowel or a mute h.
      if (adjacent && next.word && ELIDE.has(lw) && isVowelStart(next.lower) && !NO_ELISION.test(next.lower)) {
        const ok =
          (lw === "ce" && /^(est|était|étaient|eût|eut|en)$/.test(next.lower)) ||
          (/^(lorsque|puisque|quoique)$/.test(lw) && /^(il|elle|ils|elles|on|un|une|en)$/.test(next.lower)) ||
          (lw === "jusque" && /^(à|au|aux|en|ici|où)$/.test(next.lower)) ||
          /^(le|la|de|je|me|te|se|ne|que)$/.test(lw);
        if (ok) {
          const el = lw === "ce" ? "c'" : `${lw.slice(0, -1)}'`;
          add(i, W[k + 1], "spelling", "elision", `Devant une voyelle (ou un h muet), **${lw}** s'élide : ${el}${next.lower}.`, keepCase(t.text, `${el}${next.text}`));
        }
      }
      if (adjacent && lw === "si" && /^(il|ils)$/.test(next.lower)) add(i, W[k + 1], "spelling", "elision-si", "**Si** s'élide devant il / ils : s'il, s'ils.", keepCase(t.text, `s'${next.text}`));
      // ma / ta / sa before a vowel → mon / ton / son (mon amie).
      if (adjacent && /^(ma|ta|sa)$/.test(lw) && isVowelStart(next.lower) && m(next.lower) & (T.NS | T.AS)) add(i, i, "grammar", "mon-amie", `Devant un mot féminin qui commence par une voyelle, on dit **${{ ma: "mon", ta: "ton", sa: "son" }[lw]}** (mon amie, ton école).`, keepCase(t.text, { ma: "mon", ta: "ton", sa: "son" }[lw]));

      // Subject + verb agreement (je mange, tu manges, ils mangent).
      let person = SUBJECT[lw];
      if (person == null && (lw === "nous" || lw === "vous") && clauseStart(k)) person = lw === "nous" ? 3 : 4;
      const stressed = prev && PREPOSITIONS.has(prev.lower) && /^(elle|elles|nous|vous)$/.test(lw);
      if (person != null && !stressed) {
        let j = k + 1;
        while (j < W.length && SKIP_AFTER_SUBJECT.has(low(W[j])) && j < k + 4) j++;
        const v = W[j] != null ? Tk[W[j]] : null;
        if (v && W[j] - i === j - k) {
          const r = readings(v.lower);
          if (r.length && !r.some((x) => x.p === person) && !(m(v.lower) & (T.NS | T.NP | T.AS | T.AP) && r.length < 2)) {
            const fixes = [...new Set(r.flatMap((x) => conjugations(x.inf, x.tense, person).slice(0, 1)).map((f) => f.split(" ").pop()))].slice(0, 3);
            if (fixes.length) add(v.i, v.i, "grammar", "subject-verb", `Avec **${PERSON_NAME[person]}**, le verbe ne s'écrit pas ainsi : ${fixes.map((f) => `**${f}**`).join(" ou ")}.`, fixes.map((f) => keepCase(v.text, f)));
          } else if (!r.length) {
            // A participle or an infinitive right after the subject: « il fini », « il manger ».
            const pp = ppReadings(v.lower);
            const isInf = m(v.lower) & T.INF && verbInfo(v.lower) && !(m(v.lower) & T.AS);
            const inf = pp[0]?.inf || (isInf ? v.lower : null);
            const skipped = W.slice(k + 1, j).map(low);
            if (inf && (isInf || !(m(v.lower) & (T.NS | T.NP))) && !skipped.some((x) => /^(le|la|l'|les|lui|leur|y|en)$/.test(x) && isInf)) {
              const pres = conjugations(inf, "present", person)[0];
              const pc = conjugations(inf, "passe_compose", person)[0];
              if (pres && pres !== v.lower && !(isInf && skipped.length)) add(v.i, v.i, "grammar", "subject-verb-form", `Après le sujet, il faut un verbe conjugué : **${pres}** (présent) ou **${pc}** (passé composé).`, [pres, pc].filter(Boolean).map((f) => keepCase(v.text, f)));
            }
          }
        }
      }

      // Plural determiner + singular noun or adjective (les maison, des grand).
      if (DET_PL.has(lw) && adjacent && next.word && !/^\p{Lu}/u.test(next.text)) {
        for (const n of [next, Tk[W[k + 2]]].filter(Boolean)) {
          const mk = m(n.lower);
          if (!mk || mk & (T.NP | T.AP | T.V | T.X)) break;
          if (mk & (T.NS | T.AS)) {
            const p = plural(n.lower, mk & T.NS ? T.NP : T.AP);
            if (p) add(n.i, n.i, "grammar", "plural", `Après « ${lw} », le nom (ou l'adjectif) se met au **pluriel** : ${p}.`, keepCase(n.text, p));
            if (!(mk & T.AS) || mk & T.NS) break; // stop after the noun
          } else break;
        }
      }
      // Singular determiner + plural-only noun (un amis).
      if (DET_SG.has(lw) && adjacent && next.word) {
        const mk = m(next.lower);
        if (mk & T.NP && !(mk & (T.NS | T.AS | T.V | T.X)) && /[sx]$/.test(next.lower) && !/^(fois|gens|mœurs|moeurs)$/.test(next.lower)) {
          const sg = singular(next.lower);
          if (sg) add(next.i, next.i, "grammar", "singular", `Après « ${lw} », le nom est au **singulier** : ${sg}.`, keepCase(next.text, sg));
        }
      }
      // Gender of the determiner (un autoroute, une incendie).
      if ((DET_M.has(lw) || DET_F.has(lw)) && adjacent && next.word && !/^\p{Lu}/u.test(next.text)) {
        const mk = m(next.lower);
        const noun = mk & T.NS && !(mk & (T.AS | T.AP | T.V | T.X));
        if (noun && (mk & T.M) !== (mk & T.F)) {
          const fem = !!(mk & T.F);
          if (fem && DET_M.has(lw) && !(lw === "cet" && fem)) {
            const fix = { un: "une", le: "la", ce: "cette", cet: "cette", du: "de la", au: "à la" }[lw];
            add(i, i, "grammar", "gender", `**${next.lower}** est un nom **féminin** : ${fix} ${next.lower}.`, keepCase(t.text, fix));
          } else if (!fem && DET_F.has(lw)) {
            const fix = { une: "un", la: "le", cette: isVowelStart(next.lower) ? "cet" : "ce" }[lw];
            add(i, i, "grammar", "gender", `**${next.lower}** est un nom **masculin** : ${fix} ${next.lower}.`, keepCase(t.text, fix));
          }
        }
      }
      // Noun + adjective agreement (une robe bleu, des fleurs blanche).
      if (adjacent && next.word && (m(lw) & (T.NS | T.NP)) && !(m(lw) & (T.V | T.X | T.AS | T.AP)) && lw !== "fois" && !(prev && /^(de|d'|du)$/.test(prev.lower)) && !/^\p{Lu}/u.test(next.text) && !/^\p{Lu}/u.test(t.text)) {
        const nm = m(lw);
        const am = m(next.lower);
        const adjOnly = am & (T.AS | T.AP) && !(am & T.X) && !(am & T.V && !(am & T.PP)) && !readings(next.lower).length && !INVARIABLE_ADJ.has(next.lower);
        if (adjOnly) {
          const nounFem = nm & T.F && !(nm & T.M);
          const nounPl = nm & T.NP && !(nm & T.NS);
          let want = next.lower;
          if (nounFem && am & T.M && !(am & T.F)) want = feminine(next.lower) || want;
          if (nounPl && am & T.AS && !(am & T.AP)) want = plural(want, T.AP) || want;
          if (want !== next.lower) add(next.i, next.i, "grammar", "adj-agreement", `L'adjectif s'accorde avec le nom « ${lw} » (${nounFem ? "féminin" : "masculin"}${nounPl ? " pluriel" : ""}) : **${want}**.`, keepCase(next.text, want));
        }
      }

      // leur + verb / leurs before a verb, leur + plural noun.
      if (lw === "leurs" && adjacent && readings(next.lower).length && !(m(next.lower) & (T.NP | T.AP))) add(i, i, "grammar", "leur-verb", "Devant un verbe, **leur** est un pronom (= à eux) : il ne prend jamais de s.", keepCase(t.text, "leur"));
      // (A noun in -s, -x or -z without a singular form is invariable: leur avis, leur choix.)
      const invariable = (w) => /[sxz]$/.test(w) && !m(w.slice(0, -1));
      if (lw === "leur" && adjacent && m(next.lower) & T.NP && !(m(next.lower) & (T.NS | T.V | T.AS)) && !invariable(next.lower)) add(i, i, "grammar", "leur-plural", "Devant un nom au pluriel, le déterminant prend un s : **leurs**.", keepCase(t.text, "leurs"));

      // être + participle / adjective agreed with elle, elles, ils (elle est parti → partie).
      if (/^(elle|elles|ils)$/.test(lw) && !(prev && PREPOSITIONS.has(prev.lower))) {
        let j = k + 1;
        if (/^(ne|n')$/.test(low(W[j]))) j++;
        if (AUX_ETRE.has(low(W[j]))) {
          let a = j + 1;
          while (a < W.length && ADVERBS.has(low(W[a])) && a < j + 3) a++;
          const w = W[a] != null ? Tk[W[a]] : null;
          if (w && (ppReadings(w.lower).length || !(m(w.lower) & (T.NS | T.NP | T.X)))) {
            const mk = m(w.lower);
            const fem = lw !== "ils";
            const pl = lw !== "elle";
            if (mk & (T.PP | T.AS | T.AP)) {
              let base = w.lower;
              const pp = ppReadings(base);
              let want = null;
              if (pp.length) want = participle(pp[0].inf, fem ? "f" : "m", pl)[0];
              else if (mk & T.AS || mk & T.AP) {
                want = base;
                if (fem && mk & T.M && !(mk & T.F)) want = feminine(base) || want;
                if (pl && !(m(want) & T.AP) && !/[sx]$/.test(want)) want = plural(want, T.AP) || want;
              }
              if (want && want !== base && tierOf(want) > 0 && !(pp.length && pp.some((x) => x.g === (fem ? "f" : "m") && x.pl === pl))) add(w.i, w.i, "grammar", "etre-agreement", `Avec être, le participe ou l'adjectif s'accorde avec le sujet (**${lw}**) : ${want}.`, keepCase(w.text, want));
            }
          }
        }
      }

      // avoir + participle agreed with the subject (elles ont mangées une pomme → mangé).
      if (AUX_AVOIR.has(lw)) {
        const before = W.slice(Math.max(0, k - 3), k).map(low);
        // A relative « que » further back also brings a COD (la pièce que des générations d'élèves ont étudiée).
        const relQue = W.slice(Math.max(0, k - 8), k).some((j, n, arr) => /^(que|qu')$/.test(low(j)) && n > 0 && Tk[j].s === t.s && m(low(arr[n - 1])) & (T.NS | T.NP) && !readings(low(arr[n - 1])).length);
        const codBefore = relQue || before.some((x) => /^(que|qu'|l'|la|les|le|me|m'|te|t'|nous|vous|combien|quel|quels|quelle|quelles|lesquels|lesquelles|laquelle)$/.test(x));
        let a = k + 1;
        while (a < W.length && ADVERBS.has(low(W[a])) && a < k + 3) a++;
        const w = W[a] != null ? Tk[W[a]] : null;
        if (w && !codBefore && W[a] - i === a - k) {
          const pp = ppReadings(w.lower);
          if (pp.length && !pp.some((x) => x.g === "m" && !x.pl) && !(m(w.lower) & (T.NS | T.NP))) {
            const ms = participle(pp[0].inf, "m", false)[0];
            if (ms && ms !== w.lower && verbInfo(pp[0].inf)?.aux !== "être") add(w.i, w.i, "grammar", "avoir-agreement", "Avec avoir, le participe passé ne s'accorde **jamais avec le sujet** (seulement avec un COD placé avant).", keepCase(w.text, ms));
          }
        }
      }

      // -er / -é after avoir or être (j'ai manger → mangé) and after a verb or a preposition (je vais mangé → manger).
      if (AUX_AVOIR.has(lw) || /^(suis|es|est|sommes|êtes|sont|été)$/.test(lw)) {
        let a = k + 1;
        while (a < W.length && ADVERBS.has(low(W[a])) && a < k + 3) a++;
        const w = W[a] != null ? Tk[W[a]] : null;
        // (« Écrire, c'est chercher ses mots » : after « , c'est » the infinitive is the attribute.)
        const definition = lw === "est" && prev?.lower === "c'" && /^[,:;]$/.test(Tk[prev.i - 1]?.text || "");
        if (w && !definition && W[a] - i === a - k && /er$/.test(w.lower) && verbInfo(w.lower)?.group === 1 && !(m(w.lower) & T.AS) && !(lw === "a" && prev && A_TRIGGERS.test(prev.lower))) {
          const pp = `${w.lower.slice(0, -2)}é`;
          if (tierOf(pp) > 0) add(w.i, w.i, "grammar", "er-e", `Après **${lw}**, il faut le participe passé : **${pp}** (on peut dire « vendu », pas « vendre »).`, keepCase(w.text, pp));
        }
      }
      const infAfter = INF_TRIGGERS.test(lw) && !(lw === "de" || lw === "d'") ? true : (lw === "de" || lw === "d'") && prev && DE_TRIGGERS.test(prev.lower);
      if (infAfter || (lw === "à" && prev && A_TRIGGERS.test(prev.lower))) {
        let a = k + 1;
        while (a < W.length && SKIP_AFTER_SUBJECT.has(low(W[a])) && a < k + 3) a++;
        const w = W[a] != null ? Tk[W[a]] : null;
        if (w && W[a] - i === a - k) {
          const pp = ppReadings(w.lower);
          const r = readings(w.lower);
          const inf = pp[0]?.inf || r[0]?.inf;
          const firstGroup = inf && verbInfo(inf)?.group === 1;
          if (firstGroup && /(é|ée|és|ées|ez|ai|ais|ait)$/.test(w.lower) && !(m(w.lower) & (T.NS | T.NP | T.AS | T.AP)) && w.lower !== inf) add(w.i, w.i, "grammar", "e-er", `Après **${t.text}**, le verbe reste à l'infinitif : **${inf}** (on peut dire « vendre », pas « vendu »).`, keepCase(w.text, inf));
        }
      }
      // Sentence-initial « Vous » + infinitive: Vous manger → Vous mangez.
      if (lw === "vous" && k === 0 && next && adjacent && /er$/.test(next.lower) && verbInfo(next.lower)?.group === 1) {
        const f = conjugations(next.lower, "present", 4)[0];
        if (f) add(next.i, next.i, "grammar", "vous-ez", `Avec **vous**, le verbe se termine par **-ez** : ${f}.`, keepCase(next.text, f));
      }

      // Subjunctive after il faut que, pour que, bien que…
      if (/^(que|qu')$/.test(lw) || /^quoiqu'?$/.test(lw)) {
        const ctx = `${W.slice(Math.max(0, k - 4), k).map(low).join(" ")} ${lw}`.replace(/ (qu')$/, " qu'").trim();
        const trig = SUBJUNCTIVE_TRIGGERS.find((x) => ctx.endsWith(x));
        if (trig) {
          const subj = Tk[W[k + 1]];
          const person2 = subj ? SUBJECT[subj.lower] ?? (subj.lower === "nous" ? 3 : subj.lower === "vous" ? 4 : null) : null;
          if (person2 != null) {
            let j = k + 2;
            while (j < W.length && SKIP_AFTER_SUBJECT.has(low(W[j])) && j < k + 5) j++;
            const v = Tk[W[j]];
            const r = v ? readings(v.lower) : [];
            if (r.length && !r.some((x) => x.p === person2 && x.tense === "subj_present") && r.some((x) => x.p === person2 && ["present", "futur"].includes(x.tense))) {
              const fix = conjugations(r[0].inf, "subj_present", person2)[0];
              if (fix) add(v.i, v.i, "grammar", "subjunctive", `Après « ${trig.replace(/'$/, "e")} », on emploie le **subjonctif** : ${fix}.`, keepCase(v.text, fix.split(" ").pop()));
            }
          }
        }
      }

      // si + conditional (si j'aurais → si j'avais).
      if ((lw === "si" || lw === "s'") && clauseStart(k)) {
        const subj = Tk[W[k + 1]];
        const person2 = subj ? SUBJECT[subj.lower] ?? (subj.lower === "nous" ? 3 : subj.lower === "vous" ? 4 : null) : null;
        if (person2 != null) {
          let j = k + 2;
          while (j < W.length && SKIP_AFTER_SUBJECT.has(low(W[j])) && j < k + 5) j++;
          const v = Tk[W[j]];
          const r = v ? readings(v.lower) : [];
          if (r.length && r.every((x) => x.tense === "cond_present")) {
            const fix = conjugations(r[0].inf, "imparfait", person2)[0];
            if (fix) add(v.i, v.i, "grammar", "si-conditionnel", `Après **si** (condition), jamais de conditionnel : on met l'**imparfait** (si j'avais… je serais).`, keepCase(v.text, fix));
          }
        }
      }

      // Incomplete negation (on a pas, c'est pas, je sais pas).
      if ((lw === "pas" || lw === "jamais") && k >= 2) {
        const v = Tk[W[k - 1]];
        const before = W.slice(Math.max(0, k - 4), k - 1).map(low);
        const subjBefore = before.some((x) => /^(je|j'|tu|il|elle|on|nous|vous|ils|elles|c'|ça|y)$/.test(x));
        const hasNe = W.slice(Math.max(0, k - 5), k).map(low).some((x) => /^(ne|n')$/.test(x));
        if (subjBefore && !hasNe && v && (readings(v.lower).length || AUX_AVOIR.has(v.lower) || AUX_ETRE.has(v.lower))) {
          add(v.i, v.i, "grammar", "ne-missing", "À l'écrit, la négation a deux parties : **ne** (ou n') … pas.", keepCase(v.text, `${isVowelStart(v.lower) ? "n'" : "ne "}${v.text}`));
        }
      }

      // Confusion on / ont at the start of a clause (Ont va au cinéma → On va).
      if (lw === "ont" && clauseStart(k) && next && readings(next.lower).length && !ppReadings(next.lower).length) add(i, i, "grammar", "on-ont", "Ici, c'est le pronom **on** (on peut dire « il »).", keepCase(t.text, "on"));
      if (lw === "on" && prev && /^(ils|elles)$/.test(prev.lower)) add(i, i, "grammar", "on-ont", "Après ils / elles, c'est le verbe avoir : **ont** (on peut dire « avaient »).", "ont");
      if (lw === "son" && prev && /^(ils|elles)$/.test(prev.lower)) add(i, i, "grammar", "son-sont", "Après ils / elles, c'est le verbe être : **sont** (on peut dire « étaient »).", "sont");
      if (lw === "et" && prev && /^(il|elle|on|c'|ce|cela|ça|qui)$/.test(prev.lower) && next && m(next.lower) & (T.AS | T.AP | T.PP) && !(m(next.lower) & (T.NS | T.NP | T.X)) && !PREP_ONLY.has(low(W[k - 2]))) add(i, i, "grammar", "et-est", "Ici, c'est le verbe être : **est** (on peut dire « était »).", "est");
      if (lw === "ce" && prev && /^(il|elle|on|ils|elles)$/.test(prev.lower) && next && readings(next.lower).length) add(i, i, "grammar", "ce-se", "Devant un verbe, c'est le pronom **se** (je me lave, il se lave).", "se");
      if (lw === "sans" && prev && /^(il|elle|on|ils|elles)$/.test(prev.lower) && next && readings(next.lower).length) add(i, i, "grammar", "sans-sen", "Devant un verbe, c'est **s'en** (se + en) : il s'en va.", "s'en");
      if (/^(quelle|quelles)$/.test(lw) && next && readings(next.lower).length && !(m(next.lower) & (T.NS | T.NP | T.AS | T.AP)) && prev && /^(que|crois|pense|sais|dit|veux|faut|espère)$/.test(prev.lower)) add(i, i, "grammar", "quelle-quelle", "Devant un verbe, c'est **qu'elle** (que + elle) : on peut dire « qu'il ».", lw === "quelle" ? "qu'elle" : "qu'elles");
    }
    // Final punctuation of the sentence — but a signature alone on its line after a comma (« À bientôt,\nLéa ») is not a sentence.
    const last = Tk[s.tokens[s.tokens.length - 1]];
    const comma = s.tokens.findLastIndex((i) => Tk[i].text === ",");
    const tail = comma >= 0 ? s.tokens.slice(comma + 1) : [];
    const afterComma = tail.length > 0 && tail.length <= 4 && tk.text.slice(Tk[s.tokens[comma]].end, Tk[tail[0]].start).includes("\n");
    // … or the last line of a letter, alone after the closing formula (« M. et Mme Petit »).
    const lastLine = s === tk.sentences[tk.sentences.length - 1] && W.length <= 5 && /\n\s*$/.test(tk.text.slice(0, Tk[s.tokens[0]].start)) && W.every((i) => /^\p{Lu}/u.test(Tk[i].text) || /^(et|de|du|des|la|le)$/.test(Tk[i].lower));
    // A title on the first line (« Une vache en vadrouille sur l'autoroute ») needs no point either.
    const title = s === tk.sentences[0] && W.length <= 12 && /^[^\S\n]*\n/.test(tk.text.slice(last?.end ?? 0));
    const signature = afterComma || lastLine || title;
    if (last && last.word && W.length >= 3 && !signature) add(last.i, last.i, "mechanics", "end-punct", "Termine ta phrase par un **point** (ou ? ! …).", `${last.text}.`);
  }
  return out;
}

/** French spacing: a space before ; : ! ? and inside « » (light remarks). */
function typoRules(text) {
  const out = [];
  const re = /(\p{L})([;:!?])(?=\s|$)/gu;
  let x;
  let n = 0;
  while ((x = re.exec(text)) && n < 3) {
    out.push({ start: x.index, end: x.index + 2, cat: "typo", rule: "space-before", msg: "En français, on met une espace avant ; : ! ? (et dans les guillemets « »).", fix: [`${x[1]} ${x[2]}`] });
    n++;
  }
  return out;
}

function phraseRules(text) {
  const out = [];
  for (const [rule, cat, re0, msg, fix] of PHRASES_U) {
    const re = re0;
    re.lastIndex = 0;
    let x;
    while ((x = re.exec(text))) {
      const f = fix ? fix(...x) : [];
      if (f == null) continue;
      const lead = x[0].match(/^[.!?\s]*/)[0].length;
      const start = x.index + lead;
      const end = x.index + x[0].trimEnd().length;
      const fixes = [].concat(f).map((y) => keepCase(text.slice(start, end), String(y).replace(/^[.!?\s]+/, "").trimEnd()));
      out.push({ start, end, cat, rule, msg, fix: fixes });
      if (x[0].length === 0) re.lastIndex++;
    }
  }
  return out;
}

/** Unknown words (capitalized words inside a sentence are taken as names). */
function spellingRules(tk, suggestFn) {
  const out = [];
  const firstOfSentence = new Set(tk.sentences.map((s) => s.tokens[0]));
  const names = new Set(tk.tokens.filter((t) => t.word && /^\p{Lu}/u.test(t.text) && !firstOfSentence.has(t.i)).map((t) => t.lower));
  const shortSentence = new Set(tk.sentences.filter((s) => s.tokens.filter((i) => tk.tokens[i].word).length <= 2).flatMap((s) => s.tokens));
  for (const t of tk.tokens) {
    if (!t.word || t.text.length < 2) continue;
    if (/^\p{Lu}/u.test(t.text) && (!firstOfSentence.has(t.i) || names.has(t.lower) || shortSentence.has(t.i))) continue;
    if (/^\p{Lu}{2,}$/u.test(t.text)) continue;
    if (tierOf(t.lower) > 0) continue;
    // A rarer form of a verb the dictionary knows (cultiveront, baignerais), checked by the conjugator.
    if (readings(t.lower).length || ppReadings(t.lower).length) continue;
    // A missing apostrophe: « sétait » → « s'était », « jai » → « j'ai ».
    const ap = t.lower.match(/^(c|d|j|l|m|n|s|t|qu)(.+)$/);
    const fix = [];
    if (ap && tierOf(ap[2]) > 0 && isVowelStart(ap[2])) fix.push(keepCase(t.text, `${ap[1]}'${ap[2]}`));
    else if (ap && /^[sct]é/.test(t.lower) && tierOf(`é${t.lower.slice(2)}`) > 0) fix.push(keepCase(t.text, `${t.lower[0]}'é${t.lower.slice(2)}`));
    out.push({ start: t.start, end: t.end, cat: "spelling", rule: "spelling", msg: fix.length ? "Il manque une apostrophe." : "Mot inconnu : vérifie l'orthographe.", fix: fix.length ? fix : suggestFn ? suggestFn(t.text) : [] });
  }
  return out;
}

/** All issues of a text, sorted by position, overlapping duplicates removed (the most specific wins). */
export function checkRules(tk, { suggest = suggestWord } = {}) {
  const all = [...phraseRules(tk.text), ...tokenRules(tk), ...spellingRules(tk, suggest), ...typoRules(tk.text)];
  const prio = { grammar: 0, vocab: 1, spelling: 2, style: 3, mechanics: 4, typo: 5 };
  all.sort((a, b) => a.start - b.start || prio[a.cat] - prio[b.cat] || b.end - b.start - (a.end - a.start));
  const out = [];
  for (const x of all) {
    if (out.some((y) => x.start < y.end && y.start < x.end && (y.rule === x.rule || (x.cat !== "mechanics" && y.cat !== "mechanics" && x.cat !== "typo")))) continue;
    out.push(x);
  }
  return out;
}

export const RULE_COUNT = PHRASES.length + 30;
export { stripAccents };
