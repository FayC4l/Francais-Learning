// Procedural question generators for French. Each question has a stable ref "gen:<id>|<params>" and can be rebuilt
// from it (mistakes notebook, spaced repetition). Pure: no DOM.
import { makeRng } from "./rng.js";
import { VERBS, verbInfo, conjugations, participle, TENSES, tenseById, isPronominalInf, stripPron, elides, simpleForms } from "./conjugue.js";
import { HOMOPHONES, PLURALS, FEMININES, ADJECTIVES, GN_SUBJECTS, ADVERBS, ADVERB_FRAMES, COD_BEFORE, PRONOMINAUX, PP_SPECIAL, PPR_ADJ, MODES, RELATIFS, PARONYMES, CONNECTEURS, FIGURES, REGISTRES, COMPOSES, USAGE } from "./banks.js";
import { LETTRES, GENRES, PONCTUATION, PRONOMS, PLEONASMES, SI, CONCESSION, NOMINALISATIONS, TOUT, COULEURS, MAJUSCULES, DISCOURS_TENSES, PASSIFS, SANS_NE } from "./banks2.js";
import { numberToFrench } from "./french.js";

// ---------- Subjects and frames ----------

const S = (t, p, g, who = t) => ({ t, p, g, who });
/** Pronouns first (0-7), then nouns. g = null: the gender is unknown (both agreements accepted). */
const SUBJECTS = [
  S("je", 0, null), S("tu", 1, null), S("il", 2, "m"), S("elle", 2, "f"), S("nous", 3, null), S("vous", 4, null), S("ils", 5, "m"), S("elles", 5, "f"),
  S("Léa", 2, "f", "elle"), S("Hugo", 2, "m", "il"), S("mon frère", 2, "m", "il"), S("ma sœur", 2, "f", "elle"), S("les enfants", 5, "m", "ils"), S("mes cousines", 5, "f", "elles"),
  S("Chikh Fayçal", 2, "m", "il"), S("nos voisins", 5, "m", "ils"), S("la directrice", 2, "f", "elle"), S("Inès et Sarah", 5, "f", "elles"),
];
const PRONOUN_SUBJECTS = SUBJECTS.slice(0, 8);

// Verb + complement that make sense with any subject.
const FRAMES = [
  ["chanter", "une chanson"], ["regarder", "un film"], ["manger", "une pomme"], ["finir", "le puzzle"], ["choisir", "un dessert"], ["prendre", "le train"],
  ["apprendre", "la leçon"], ["faire", "les courses"], ["lire", "le journal"], ["écrire", "une lettre"], ["boire", "un jus d'orange"], ["voir", "la mer"],
  ["recevoir", "un colis"], ["ouvrir", "la fenêtre"], ["mettre", "la table"], ["attendre", "le bus"], ["répondre", "au téléphone"], ["vendre", "des légumes"],
  ["perdre", "les clés"], ["conduire", "la voiture"], ["construire", "une cabane"], ["peindre", "la clôture"], ["dire", "la vérité"], ["envoyer", "un message"],
  ["acheter", "du pain"], ["appeler", "le médecin"], ["jeter", "les vieux papiers"], ["essayer", "la robe rouge"], ["nettoyer", "la cuisine"], ["payer", "l'addition"],
  ["commencer", "le repas"], ["ranger", "la chambre"], ["nager", "dans le lac"], ["tenir", "la porte"], ["courir", "dans le parc"], ["dormir", "dans le train"],
  ["partir", "en vacances"], ["arriver", "à l'heure"], ["venir", "à la fête"], ["sortir", "avec des amis"], ["rester", "à la maison"], ["tomber", "dans l'escalier"],
  ["aller", "au marché"], ["descendre", "à la cave"], ["monter", "au grenier"], ["entrer", "dans la cuisine"], ["revenir", "de l'école"],
  ["se lever", "tôt"], ["se promener", "au bord de la mer"], ["se coucher", "tard"], ["se dépêcher", "pour le bus"], ["s'asseoir", "au premier rang"], ["se tromper", "de chemin"],
  ["se souvenir", "de ce voyage"], ["se taire", "pendant le film"], ["s'amuser", "dans le jardin"], ["s'ennuyer", "à la réunion"], ["se réveiller", "en sursaut"], ["s'habiller", "en vitesse"],
  ["vouloir", "un chien"], ["pouvoir", "nager longtemps"], ["devoir", "partir tôt"], ["savoir", "la réponse"], ["connaître", "le chemin"], ["croire", "cette histoire"],
  ["vivre", "à la campagne"], ["suivre", "le guide"], ["résoudre", "l'énigme"], ["acquérir", "de l'expérience"], ["craindre", "l'orage"], ["rire", "aux éclats"],
  ["offrir", "des fleurs"], ["cueillir", "des cerises"], ["accueillir", "les invités"], ["battre", "le record"], ["vaincre", "la peur"], ["obtenir", "le diplôme"],
  ["coudre", "un bouton"], ["fuir", "le danger"], ["servir", "le dessert"], ["réussir", "l'examen"], ["grandir", "vite"], ["réfléchir", "longtemps"],
  ["obéir", "aux règles"], ["remplir", "le formulaire"], ["haïr", "les injustices"], ["être", "en retard"], ["avoir", "de la chance"], ["jouer", "aux cartes"],
  ["étudier", "le piano"], ["créer", "un jeu"], ["céder", "sa place"], ["placer", "les invités"], ["lancer", "la balle"], ["employer", "un mot rare"],
];
const frameVerb = (f) => stripPron(f[0]);
const frameIs = (pred) => FRAMES.map((f, i) => (pred(f) ? i : -1)).filter((i) => i >= 0);
const group = (f) => verbInfo(frameVerb(f))?.group;
// "devoir partir tôt" makes no sense with a duration or a passive: modal verbs are kept for simple tenses.
const MODAL = new Set(["vouloir", "pouvoir", "devoir", "savoir"]);

// Time markers that make each tense natural.
const TAIL = {
  present: ["tous les matins", "chaque samedi", "souvent"],
  imparfait: ["autrefois", "à cette époque", "chaque été, autrefois"],
  passe_simple: ["ce jour-là", "soudain", "le lendemain"],
  futur: ["demain", "la semaine prochaine", "l'an prochain"],
  passe_compose: ["hier", "ce matin", "la semaine dernière"],
  plus_que_parfait: ["la veille", "deux jours plus tôt", "avant notre arrivée"],
  futur_anterieur: ["avant ce soir", "d'ici demain", "avant la fin du mois"],
  cond_present: ["avec un peu de chance", "volontiers", "si nous avions le temps"],
  cond_passe: ["sans cet orage", "avec un peu plus de temps", "si on l'avait prévenu"],
};
// Tenses that need a main clause or a subordinate clause around the gap.
const AROUND = {
  subj_present: [["Il faut que", ""], ["Il est important que", ""], ["Il est temps que", ""]],
  subj_passe: [["Il est possible que", " hier"], ["Il se peut que", " avant nous"], ["Je ne crois pas que", " la semaine dernière"]],
  subj_imparfait: [["Il fallait que", ""], ["Il était essentiel que", ""], ["On exigeait que", ""]],
  subj_plus_que_parfait: [["Il était regrettable que", ""], ["On craignait que", ""], ["Bien que", ", rien ne changea"]],
  passe_anterieur: [["Dès que", ", tout le monde applaudit"], ["Quand", ", la nuit tomba"], ["Après que", ", on ferma les portes"]],
};

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const sentence = (s) => cap(String(s).replace(/\s+/g, " ").replace(/\s+([,.])/g, "$1").trim());
const quote = (s) => `« ${s} »`;
const infLabel = (f) => f[0];

// ---------- Helpers to build question objects ----------

function fill(base, { q, hint, answer, explain, lead, caseSensitive = false }) {
  const accept = [...new Set(Array.isArray(answer) ? answer : [answer])];
  return { ...base, kind: "fill", q: sentence(q), hint, lead, accept, expected: accept[0], explain, caseSensitive };
}
function mcq(base, rng, { q, right, wrong, explain }) {
  const choices = rng.shuffle([right, ...wrong.filter((w) => w !== right)]);
  return { ...base, kind: "mcq", q: sentence(q), choices, answer: choices.indexOf(right), expected: right, explain };
}
function typeIt(base, { prompt, answer, explain, label }) {
  const accept = Array.isArray(answer) ? answer : [answer];
  return { ...base, kind: "type_mot", def: prompt, label, accept, expected: accept[0], say: accept[0], explain };
}
function errorQ(base, { tokens, wrong, fix, explain }) {
  const t = tokens.slice();
  t[0] = cap(t[0]);
  const accept = Array.isArray(fix) ? fix : [fix];
  return { ...base, kind: "error", tokens: t, wrong, accept, expected: `${t[wrong].replace(/[.,!?;:]+$/, "")} → ${accept[0]}`, explain };
}

/**
 * A conjugation gap: subject + ___ + complement. Returns { q, answers } or null when the form does not exist.
 * mode: 0 affirmative, 1 negative, 2 question (inversion, pronoun subjects only).
 */
function conjGap(frame, tense, subj, mode, tail = "", around = null) {
  const inf = frame[0];
  const t = tenseById(tense);
  const imperative = tense.startsWith("imp_");
  const neg = mode === 1;
  const question = mode === 2 && !imperative && subj.p !== 0 && !around;
  const opts = { g: subj.g, neg, question, who: subj.who };
  let answers = conjugations(inf, tense, subj.p, opts);
  if (!answers.length) return null;
  const comp = frame[1] ? ` ${frame[1]}` : "";
  const end = tail ? ` ${tail}` : "";
  if (imperative) return { q: `___${comp}${end} !`, answers: answers.map(cap) };
  if (question) return { q: `___${comp}${end} ?`, answers: answers.map(cap) };
  const [before, after] = around || ["", ""];
  // « je » elides into the gap: « ___ une pomme » → « J'aime ».
  let subjText = subj.t;
  if (subj.p === 0 && !neg && elides(answers[0], stripPron(inf))) {
    answers = answers.map((a) => `j'${a}`);
    subjText = "";
  }
  let lead = before ? `${before} ${subjText}`.trim() : subjText;
  lead = lead.replace(/\bque ([aeiouéèêhAEIOUÉÈÊH])/g, "qu'$1");
  if (!before && subjText) lead = cap(lead);
  if (!lead) answers = answers.map(cap);
  return { q: `${lead ? `${lead} ` : ""}___${comp}${after || end}.`, answers };
}

const modeLabel = (mode, t) => (mode === 1 ? ", forme négative" : mode === 2 && !t.startsWith("imp_") ? ", question avec inversion" : "");

const STRUCT = {
  present: "radical + terminaisons du présent (-e, -es, -e, -ons, -ez, -ent pour le 1er groupe)",
  imparfait: "radical de « nous » au présent + -ais, -ais, -ait, -ions, -iez, -aient",
  passe_simple: "-ai, -as, -a, -âmes, -âtes, -èrent (1er groupe) ; -is / -us / -ins pour les autres",
  futur: "infinitif (ou radical irrégulier) + -ai, -as, -a, -ons, -ez, -ont",
  passe_compose: "être ou avoir au présent + participe passé (accordé avec le sujet après être)",
  plus_que_parfait: "être ou avoir à l'imparfait + participe passé",
  passe_anterieur: "être ou avoir au passé simple + participe passé",
  futur_anterieur: "être ou avoir au futur + participe passé",
  cond_present: "radical du futur + terminaisons de l'imparfait (-ais, -ais, -ait, -ions, -iez, -aient)",
  cond_passe: "être ou avoir au conditionnel présent + participe passé",
  subj_present: "radical de « ils » au présent + -e, -es, -e, -ions, -iez, -ent (irréguliers : sois, aie, fasse, puisse…)",
  subj_passe: "être ou avoir au subjonctif présent + participe passé",
  subj_imparfait: "passé simple (2e personne) sans le s + -sse, -sses, -^t, -ssions, -ssiez, -ssent",
  subj_plus_que_parfait: "être ou avoir au subjonctif imparfait (fût, eût) + participe passé",
  imp_present: "présent sans le pronom sujet (tu chantes → chante) ; irréguliers : sois, aie, sache, veuille",
  imp_passe: "aie / sois au présent de l'impératif + participe passé",
};
const conjExplain = (inf, tense, answers) => `${cap(tenseById(tense).fr)} de ${quote(inf)} : ${STRUCT[tense]} → ${answers[0]}.`;

// ---------- Generators ----------
// pick(rng, L) → params (integers), build(params, rng, base) → question, or null.

const G = [];
const def = (id, unit, skill, pick, build) => G.push({ id, unit, skill, pick, build });
const rnd = (rng, n) => rng.int(n);
const EXTRA = () => globalThis.window?.__EXTRA__ || {};

/** A conjugation generator for one or several tenses, on frames chosen by a predicate. */
function conjGen(id, unit, tenses, framePred, { pronounsOnly = false, modes = [0], around = false, label } = {}) {
  const frames = frameIs(framePred);
  const subjects = tenses.every((t) => t.startsWith("imp_")) ? [1, 4, 5] : SUBJECTS.map((_, i) => i).slice(0, pronounsOnly ? 8 : SUBJECTS.length);
  def(id, unit, "conjugaison", (rng) => [rnd(rng, tenses.length), rng.pick(frames), rng.pick(subjects), rng.pick(modes), rnd(rng, 3)], ([ti, fi, si, mode, mi], rng, b) => {
    const tense = tenses[ti];
    const frame = FRAMES[fi];
    const subj = SUBJECTS[si];
    if (!frame || !subj) return null;
    if (tense.startsWith("imp_") && ![1, 3, 4].includes(subj.p)) return null;
    const ar = AROUND[tense] ? AROUND[tense][mi % AROUND[tense].length] : null;
    const tail = AROUND[tense] ? "" : (TAIL[tense] || [""])[mi % (TAIL[tense] || [""]).length];
    const g = conjGap(frame, tense, subj, mode, tail, ar);
    if (!g) return null;
    const person = tense.startsWith("imp_") || mode === 2 ? `${subj.t} / ` : "";
    return fill(b, { q: g.q, hint: `${person}${infLabel(frame)} — ${label || tenseById(tense).short}${modeLabel(mode, tense)}`, answer: g.answers, explain: conjExplain(frame[0], tense, g.answers) });
  });
}

// 1.1 Letters and sounds (ç, ge, gu, m before b / p)
def("lettres", "1.1", "orthographe", (rng) => [rnd(rng, LETTRES.length)], ([i], rng, b) => {
  const [w, wrong, rule] = LETTRES[i];
  return mcq(b, rng, { q: "Quelle est la bonne orthographe ?", right: w, wrong, explain: rule });
});

// 1.2 Gender of nouns
def("genre", "1.2", "grammaire", (rng, L = 12) => {
  const pool = GENRES.map((g, i) => (g[2] <= Math.max(2, L) ? i : -1)).filter((i) => i >= 0);
  return [rng.pick(pool)];
}, ([i], rng, b) => {
  const [n, g] = GENRES[i];
  return mcq(b, rng, { q: `Quel déterminant va avec ${quote(n)} ?`, right: g === "m" ? `un ${n}` : `une ${n}`, wrong: [g === "m" ? `une ${n}` : `un ${n}`], explain: `${cap(n)} est un nom ${g === "m" ? "masculin" : "féminin"} : ${g === "m" ? "un" : "une"} ${n}.` });
});

// 1.3 Present: first group, être, avoir
conjGen("pres_er", "1.3", ["present"], (f) => group(f) === 1 && !isPronominalInf(f[0]) || ["être", "avoir"].includes(f[0]));

// 1.4, 2.5, 3.5, 4.5 Homophones
for (const [key, fam] of Object.entries(HOMOPHONES)) {
  def(`h_${key}`, fam.unit, "orthographe", (rng) => [rnd(rng, fam.items.length), rnd(rng, 3)], ([i, k], rng, b) => {
    const [q, a] = fam.items[i] || [];
    if (!q) return null;
    const explain = fam.explain[a.toLowerCase()] || "";
    // Mostly typed answers (production), sometimes a choice.
    if (k === 0) return mcq(b, rng, { q, right: a, wrong: fam.choices.filter((c) => c.toLowerCase() !== a.toLowerCase()).slice(0, 3).map((c) => (a[0] === a[0].toUpperCase() ? cap(c) : c)), explain });
    return fill(b, { q, hint: fam.hint, answer: [a], explain });
  });
}

// 1.5 End punctuation
def("ponct", "1.5", "grammaire", (rng) => [rnd(rng, PONCTUATION.length)], ([i], rng, b) => {
  const [s, sign, explain] = PONCTUATION[i];
  return mcq(b, rng, { q: `Quel signe termine la phrase : ${quote(`${s} …`)} ?`, right: sign === "." ? "un point ( . )" : sign === "?" ? "un point d'interrogation ( ? )" : "un point d'exclamation ( ! )", wrong: ["un point ( . )", "un point d'interrogation ( ? )", "un point d'exclamation ( ! )"], explain });
});

// 2.1 Plurals
def("pluriel", "2.1", "orthographe", (rng) => [rnd(rng, PLURALS.length), rnd(rng, 3)], ([i, k], rng, b) => {
  const [sg, pl, rule] = PLURALS[i];
  const accept = pl.split("|");
  const q = /^(madame|monsieur)$/.test(sg) ? `Bonjour, ${sg} ! Bonjour, ___ !` : [`Un ${sg}, puis trois ___.`, `Un ${sg}, des ___.`, `Il y a plusieurs ___ dans cette histoire.`][k];
  return fill(b, { q, hint: sg, answer: accept, explain: `${sg} → ${accept[0]} (${rule}).` });
});

// 2.2 Feminine
def("feminin", "2.2", "orthographe", (rng) => [rnd(rng, FEMININES.length)], ([i], rng, b) => {
  const [m, f, kind, rule] = FEMININES[i];
  const q = kind === "adj" ? `Il est ${m}. Elle est ___.` : `un ${m}, une ___`;
  return fill(b, { q, hint: m, answer: [f], explain: `${m} → ${f} (${rule}).` });
});

// 2.3 Agreement of the adjective
def("accord_adj", "2.3", "grammaire", (rng) => [rnd(rng, GN_SUBJECTS.length), rnd(rng, ADJECTIVES.length)], ([si, ai], rng, b) => {
  const [s, g, pl] = GN_SUBJECTS[si];
  const a = ADJECTIVES[ai];
  const form = a[(g === "f" ? 1 : 0) + (pl ? 2 : 0)];
  const verb = pl ? "sont" : "est";
  return fill(b, { q: `${s} ${verb} ___.`, hint: a[0], answer: [form], explain: `${s} : ${g === "f" ? "féminin" : "masculin"} ${pl ? "pluriel" : "singulier"} → ${form}.` });
});

// 2.4 Present of the 2nd and 3rd groups
conjGen("pres_irr", "2.4", ["present"], (f) => [2, 3].includes(group(f)) && !isPronominalInf(f[0]) && f[0] !== "être" && f[0] !== "avoir", { modes: [0, 0, 1] });

// 3.1 Imperfect
conjGen("imparfait", "3.1", ["imparfait"], (f) => !MODAL.has(frameVerb(f)), { modes: [0, 0, 1] });

// 3.2 Passé composé with avoir, and past participles
conjGen("pc_avoir", "3.2", ["passe_compose"], (f) => !isPronominalInf(f[0]) && verbInfo(frameVerb(f))?.aux === "avoir" && !MODAL.has(frameVerb(f)), { modes: [0, 0, 1] });
const PP_VERBS = VERBS.filter((v) => v.group === 3 && v.band <= 2 && simpleForms(v.inf)?.pp && !["être", "avoir"].includes(v.inf)).map((v) => v.inf);
def("pp_form", "3.2", "conjugaison", (rng) => [rnd(rng, PP_VERBS.length)], ([i], rng, b) => {
  const v = PP_VERBS[i];
  const pp = participle(v);
  if (!v || !pp.length) return null;
  return typeIt(b, { prompt: `Participe passé de ${quote(v)} (masculin singulier)`, label: "Participe passé", answer: pp, explain: `${v} → ${pp[0]} (féminin : ${participle(v, "f")[0]}).` });
});

// 3.3 Passé composé with être (agreement with the subject)
conjGen("pc_etre", "3.3", ["passe_compose"], (f) => verbInfo(frameVerb(f))?.aux === "être" && !isPronominalInf(f[0]) && f[0] !== "être");

// 3.4 -é, -er, -ez, -ait
const ER_FRAMES = frameIs((f) => group(f) === 1 && !isPronominalInf(f[0]) && verbInfo(frameVerb(f))?.aux === "avoir");
def("e_er", "3.4", "orthographe", (rng) => [rng.pick(ER_FRAMES), rnd(rng, 7)], ([fi, k], rng, b) => {
  const [inf, comp] = FRAMES[fi];
  const st = inf.slice(0, -2);
  const forms = { inf, pp: participle(inf)[0], ez: conjugations(inf, "present", 4)[0], ait: conjugations(inf, "imparfait", 2)[0] };
  const T = [
    [`Je vais ___ ${comp}.`, "inf", "Après un verbe conjugué (je vais), on met l'infinitif : on peut dire « je vais vendre » → -er."],
    [`Il faut ___ ${comp}.`, "inf", "Après « il faut », l'infinitif : on peut dire « il faut vendre » → -er."],
    [`Elle est partie sans ___ ${comp}.`, "inf", "Après une préposition (sans, pour, de, à), l'infinitif : « sans vendre » → -er."],
    [`Hier, nous avons ___ ${comp}.`, "pp", "Après avoir, le participe passé : on peut dire « nous avons vendu » → -é."],
    [`Il a ___ ${comp} ce matin.`, "pp", "Après avoir, le participe passé : « il a vendu » → -é."],
    [`Vous ___ ${comp} tous les jours.`, "ez", "Avec vous, le présent se termine en -ez."],
    [`Autrefois, il ___ ${comp} chaque semaine.`, "ait", "Une habitude passée avec il : imparfait en -ait."],
  ][k];
  const answer = forms[T[1]];
  return fill(b, { q: T[0], hint: `${st}… (é, er, ez ou ait ?)`, answer: [answer], explain: T[2] });
});

// 4.1 Future, 4.2 conditional
conjGen("futur", "4.1", ["futur"], () => true, { modes: [0, 0, 1] });
conjGen("cond", "4.2", ["cond_present"], () => true, { modes: [0, 0, 1] });
const RAI_FRAMES = frameIs((f) => !isPronominalInf(f[0]) && f[0] !== "être");
def("rai_rais", "4.2", "conjugaison", (rng) => [rng.pick(RAI_FRAMES), rnd(rng, 4)], ([fi, k], rng, b) => {
  const [inf, comp] = FRAMES[fi];
  const futur = conjugations(inf, "futur", 0)[0];
  const cond = conjugations(inf, "cond_present", 0)[0];
  const el = elides(futur, inf);
  const je = el ? "j'" : "je ";
  const T = [
    [`Demain, ${je}___ ${comp}.`, futur, "Demain, c'est sûr : futur → -rai (on peut dire « nous -rons »)."],
    [`Si j'avais le temps, ${je}___ ${comp}.`, cond, "Si + imparfait → conditionnel : -rais (on peut dire « nous -rions »)."],
    [`Je te promets que ${je}___ ${comp} la semaine prochaine.`, futur, "Une promesse pour l'avenir : futur → -rai."],
    [`À ta place, ${je}___ ${comp}.`, cond, "Une situation imaginaire (à ta place) : conditionnel → -rais."],
  ][k];
  return fill(b, { q: T[0], hint: `${inf} — futur ou conditionnel ?`, answer: [T[1]], explain: T[2] });
});

// 4.3 Object pronouns
def("pronoms", "4.3", "grammaire", (rng) => [rnd(rng, PRONOMS.length)], ([i], rng, b) => {
  const [q, a, explain] = PRONOMS[i];
  return fill(b, { q, hint: "le, la, l', les, lui, leur, en ou y ?", answer: a, explain });
});

// 4.4 Adverbs in -ment
def("adverbe", "4.4", "orthographe", (rng) => [rnd(rng, ADVERBS.length), rnd(rng, ADVERB_FRAMES.length)], ([i, k], rng, b) => {
  const [adj, adv, rule] = ADVERBS[i];
  return fill(b, { q: ADVERB_FRAMES[k], hint: `adverbe formé sur ${quote(adj)}`, answer: [adv], explain: `${adj} → ${adv} (${rule}).` });
});

// 5.1, 5.2 Passé simple
conjGen("ps_12", "5.1", ["passe_simple"], (f) => [1, 2].includes(group(f)), { modes: [0, 0, 0, 1] });
conjGen("ps_3", "5.2", ["passe_simple"], (f) => group(f) === 3 && simpleForms(frameVerb(f))?.passe_simple?.[2], { modes: [0, 0, 0, 1] });

// 5.3 Passé simple or imperfect (je mangeai / je mangeais)
const AI_FRAMES = frameIs((f) => group(f) === 1 && !isPronominalInf(f[0]) && verbInfo(frameVerb(f))?.aux === "avoir");
def("ps_imp", "5.3", "conjugaison", (rng) => [rng.pick(AI_FRAMES), rnd(rng, 4)], ([fi, k], rng, b) => {
  const [inf, comp] = FRAMES[fi];
  const ps = conjugations(inf, "passe_simple", 0)[0];
  const imp = conjugations(inf, "imparfait", 0)[0];
  const je = elides(ps, inf) ? "j'" : "je ";
  const T = [
    [`Ce jour-là, ${je}___ ${comp} pour la première fois.`, ps, "Action ponctuelle, de premier plan (ce jour-là) : passé simple → -ai (on peut dire « il -a »)."],
    [`Autrefois, ${je}___ ${comp} tous les dimanches.`, imp, "Habitude dans le passé : imparfait → -ais (on peut dire « il -ait »)."],
    [`Soudain, ${je}___ ${comp}.`, ps, "Action soudaine : passé simple → -ai."],
    [`Pendant que ${je}___ ${comp}, l'orage éclata.`, imp, "Action en cours, en arrière-plan : imparfait → -ais."],
  ][k];
  return fill(b, { q: T[0], hint: `${inf} — passé simple ou imparfait ?`, answer: [T[1]], explain: T[2] });
});

// 5.4 Plus-que-parfait and passé antérieur
conjGen("pqp", "5.4", ["plus_que_parfait", "passe_anterieur"], (f) => !MODAL.has(frameVerb(f)));

// 5.5 Inversion in the speech tags (dit-il, demanda-t-elle)
const INCISES = ["dire", "répondre", "demander", "crier", "murmurer", "ajouter", "répliquer", "soupirer", "expliquer", "conclure", "s'écrier", "s'exclamer"];
const QUOTES = ["Viens ici", "Je ne sais pas", "Quelle surprise", "Nous sommes en retard", "C'est fini", "Écoute-moi bien"];
def("incise", "5.5", "grammaire", (rng) => [rnd(rng, INCISES.length), rnd(rng, 4), rnd(rng, QUOTES.length), rnd(rng, 2)], ([vi, si, qi, ti], rng, b) => {
  const v = INCISES[vi];
  const subj = [SUBJECTS[2], SUBJECTS[3], SUBJECTS[6], SUBJECTS[7]][si];
  const tense = ti ? "passe_simple" : "present";
  const ans = conjugations(v, tense, subj.p, { question: true, who: subj.who, g: subj.g });
  if (!ans.length) return null;
  return fill(b, { q: `« ${QUOTES[qi]} ! » ___ avant de partir.`, hint: `${subj.t} / ${v} — ${tenseById(tense).short}, incise`, answer: ans, explain: `Dans une incise, le sujet est inversé et relié par un trait d'union ; on ajoute -t- entre deux voyelles : ${ans[0]}.` });
});

// 6.1 Participle with être or avoir
def("pp_basic", "6.1", "grammaire", (rng) => [rng.pick(frameIs((f) => !isPronominalInf(f[0]) && !MODAL.has(frameVerb(f)) && f[0] !== "être")), rnd(rng, SUBJECTS.length)], ([fi, si], rng, b) => {
  const frame = FRAMES[fi];
  const subj = SUBJECTS[si];
  const aux = verbInfo(frameVerb(frame))?.aux;
  const g = conjGap(frame, "passe_compose", subj, 0, "hier");
  if (!g) return null;
  const explain = aux === "être" ? `Avec être, le participe passé s'accorde avec le sujet (${subj.t}) → ${g.answers[0]}.` : `Avec avoir, le participe passé ne s'accorde pas avec le sujet → ${g.answers[0]}.`;
  return fill(b, { q: g.q, hint: `${frame[0]} — passé composé`, answer: g.answers, explain });
});

// 6.2 Direct object placed before avoir
def("pp_cod", "6.2", "grammaire", (rng) => [rnd(rng, COD_BEFORE.length), rnd(rng, 4), rnd(rng, 8), rnd(rng, 3)], ([oi, vi, si, k], rng, b) => {
  const [obj, g, pl, verbs, end] = COD_BEFORE[oi];
  const v = verbs[vi % verbs.length];
  const subj = SUBJECTS[si];
  const aux = conjugations("avoir", "present", subj.p)[0];
  const subjAux = subj.p === 0 ? "j'ai" : `${subj.t} ${aux}`;
  const agreed = participle(v, g, pl)[0];
  const plain = participle(v)[0];
  const objLow = obj.charAt(0).toLowerCase() + obj.slice(1);
  const T = [
    [`${obj} que ${subjAux} ___ ${end}`.replace(/\bque ([aeiouéèêhAEIOUÉÈÊH])/, "qu'$1"), agreed, `Le COD « que » (= ${objLow}) est placé avant avoir : accord → ${agreed}.`],
    [`${obj}, ${subj.p === 0 ? "je" : subj.t} ${pl ? "les " : "l'"}${aux} ___ hier.`, agreed, `Le COD « ${pl ? "les" : "l'"} » (= ${objLow}) est placé avant avoir : accord → ${agreed}.`],
    [`${subjAux} ___ ${objLow} hier.`, plain, `Le COD (${objLow}) est placé après le verbe : pas d'accord → ${plain}.`],
  ][k];
  return fill(b, { q: T[0], hint: v, answer: [T[1]], explain: T[2] });
});

// 6.3 Pronominal verbs
def("pp_pron", "6.3", "grammaire", (rng) => [rnd(rng, PRONOMINAUX.length)], ([i], rng, b) => {
  const [q, hint, a, explain] = PRONOMINAUX[i];
  return fill(b, { q, hint, answer: a, explain });
});
// 6.4 Special cases
def("pp_special", "6.4", "grammaire", (rng) => [rnd(rng, PP_SPECIAL.length)], ([i], rng, b) => {
  const [q, hint, a, explain] = PP_SPECIAL[i];
  return fill(b, { q, hint, answer: a, explain });
});
// 6.5 Present participle or verbal adjective
def("ppr_adj", "6.5", "orthographe", (rng) => [rnd(rng, PPR_ADJ.length)], ([i], rng, b) => {
  const [q, a, explain] = PPR_ADJ[i];
  return fill(b, { q, hint: "participe présent ou adjectif ?", answer: a, explain });
});

// 7.1 Subjunctive, 7.3 past subjunctive
conjGen("subj", "7.1", ["subj_present"], () => true, { pronounsOnly: false });
conjGen("subj_passe", "7.3", ["subj_passe"], (f) => !MODAL.has(frameVerb(f)) && f[0] !== "être");
// 7.2 Indicative or subjunctive
def("mode", "7.2", "conjugaison", (rng) => [rnd(rng, MODES.length)], ([i], rng, b) => {
  const [q, right, wrong, explain] = MODES[i];
  return mcq(b, rng, { q, right, wrong: [wrong], explain });
});
// 7.4 Imperative
conjGen("imperatif", "7.4", ["imp_present"], (f) => !MODAL.has(frameVerb(f)) && f[0] !== "pouvoir", { modes: [0, 0, 1] });
// 7.5 Past conditional and hypotheses
conjGen("cond_passe", "7.5", ["cond_passe"], (f) => !MODAL.has(frameVerb(f)));
def("si", "7.5", "conjugaison", (rng) => [rnd(rng, SI.length)], ([i], rng, b) => {
  const [q, hint, a, explain] = SI[i];
  return fill(b, { q, hint, answer: a, explain });
});

// 8.1 Relative pronouns
def("relatif", "8.1", "grammaire", (rng) => [rnd(rng, RELATIFS.length)], ([i], rng, b) => {
  const [q, a, explain] = RELATIFS[i];
  return fill(b, { q, hint: "qui, que, dont, où, lequel…", answer: a, explain });
});

// 8.3 Reported speech: Léa a dit : « Je chante… » → Léa a dit qu'elle chantait…
const SPEAKERS = SUBJECTS.filter((s) => s.p === 2 || s.p === 5).filter((s) => s.who !== s.t);
def("discours", "8.3", "conjugaison", (rng) => [rng.pick(frameIs((f) => !isPronominalInf(f[0]) && !MODAL.has(frameVerb(f)))), rnd(rng, SPEAKERS.length), rnd(rng, DISCOURS_TENSES.length)], ([fi, si, ti], rng, b) => {
  const frame = FRAMES[fi];
  const sp = SPEAKERS[si];
  const [from, to, explain] = DISCOURS_TENSES[ti];
  const firstPerson = sp.p === 5 ? 3 : 0;
  const direct = conjugations(frame[0], from, firstPerson, { g: sp.g })[0];
  const answers = conjugations(frame[0], to, sp.p, { g: sp.g, who: sp.who });
  if (!direct || !answers.length) return null;
  const quoted = firstPerson === 3 ? `Nous ${direct}` : elides(direct, stripPron(frame[0])) ? `J'${direct}` : `Je ${direct}`;
  const said = sp.p === 5 ? "ont dit" : "a dit";
  const lead = `${cap(sp.t)} ${said} : « ${quoted} ${frame[1]}. »`;
  const qu = /^[aeiouéè]/.test(sp.who) ? "qu'" : "que ";
  return fill(b, { lead, q: `${cap(sp.t)} ${said} ${qu}${sp.who} ___ ${frame[1]}.`, hint: `${frame[0]} — discours indirect`, answer: answers, explain });
});

// 8.4 Passive voice
const PASSIVE_TENSES = ["present", "passe_compose", "futur", "imparfait", "plus_que_parfait"];
def("passif", "8.4", "conjugaison", (rng) => [rnd(rng, PASSIFS.length), rnd(rng, PASSIVE_TENSES.length)], ([i, ti], rng, b) => {
  const [s, g, pl, v, end] = PASSIFS[i];
  const tense = PASSIVE_TENSES[ti];
  const p = pl ? 5 : 2;
  const etre = conjugations("être", tense, p)[0];
  const pp = participle(v, g, pl)[0];
  if (!etre || !pp) return null;
  const ans = `${etre} ${pp}`;
  return fill(b, { q: `${s} ___ ${end}`, hint: `${v} — voix passive, ${tenseById(tense).short}`, answer: [ans], explain: `Passif = être au ${tenseById(tense).short} + participe passé accordé avec le sujet (${s.toLowerCase()}) → ${ans}.` });
});

// 8.5 Negation in writing (the missing « ne ») and inversion
def("ne", "8.5", "grammaire", (rng) => [rnd(rng, SANS_NE.length)], ([i], rng, b) => {
  const [s, wrong, fix, explain] = SANS_NE[i];
  return errorQ(b, { tokens: s.split(" "), wrong, fix, explain });
});
conjGen("inversion", "8.5", ["present", "passe_compose", "futur"], () => true, { pronounsOnly: true, modes: [2] });

// 9.1 Paronyms, 9.2 pleonasms
def("paronyme", "9.1", "vocabulaire", (rng) => [rnd(rng, PARONYMES.length)], ([i], rng, b) => {
  const [q, right, wrong, explain] = PARONYMES[i];
  return mcq(b, rng, { q, right, wrong: [wrong], explain });
});
def("pleonasme", "9.2", "vocabulaire", (rng) => [rnd(rng, PLEONASMES.length), rnd(rng, PLEONASMES.length)], ([i, j], rng, b) => {
  const [wrongS, right, explain] = PLEONASMES[i];
  const other = PLEONASMES[(j === i ? j + 1 : j) % PLEONASMES.length][0];
  return mcq(b, rng, { q: "Quelle phrase est correcte dans une langue soignée ?", right, wrong: [wrongS, other], explain });
});

// 9.5 Word formation (content/wordform.json)
def("wordform", "9.5", "vocabulaire", (rng, L = 12) => {
  const items = EXTRA().wordform?.items || [];
  const pool = items.map((it, i) => (it.level <= Math.max(9, L) ? i : -1)).filter((i) => i >= 0);
  return pool.length ? [rng.pick(pool)] : null;
}, ([i], rng, b) => {
  const it = EXTRA().wordform?.items?.[i];
  return it ? fill(b, { q: it.q, hint: it.stem, answer: it.answer, explain: it.explain }) : null;
});

// 10.1 Connectors, 10.3 concession, 10.4 figures, 10.5 nominalisation
def("connecteur", "10.1", "vocabulaire", (rng) => [rnd(rng, CONNECTEURS.length)], ([i], rng, b) => {
  const [q, right, wrong, explain] = CONNECTEURS[i];
  return mcq(b, rng, { q, right, wrong, explain });
});
def("concession", "10.3", "grammaire", (rng) => [rnd(rng, CONCESSION.length)], ([i], rng, b) => {
  const [q, hint, a, explain] = CONCESSION[i];
  return fill(b, { q, hint, answer: a, explain });
});
def("figure", "10.4", "vocabulaire", (rng) => [rnd(rng, FIGURES.length)], ([i], rng, b) => {
  const [ex, right, wrong, explain] = FIGURES[i];
  return mcq(b, rng, { q: `Quelle figure de style ? ${quote(ex)}`, right, wrong, explain });
});
def("nominalisation", "10.5", "vocabulaire", (rng) => [rnd(rng, NOMINALISATIONS.length)], ([i], rng, b) => {
  const [v, n] = NOMINALISATIONS[i];
  const [det, ...rest] = n.split(" ");
  const noun = n.startsWith("l'") ? n.slice(2) : rest.join(" ");
  const article = n.startsWith("l'") ? "l'" : `${det} `;
  return fill(b, { q: `Le verbe ${quote(v)} donne le nom : ${article}___.`, hint: "nom de la même famille", answer: [noun], explain: `${v} → ${n}. La nominalisation permet de condenser une phrase (utile dans le résumé et la synthèse).` });
});

// 11.1 Registers, 11.2 tricky agreements, 11.3 numbers and compound nouns, 11.4 rare tenses, 11.5 capitals
def("registre", "11.1", "vocabulaire", (rng) => [rnd(rng, REGISTRES.length)], ([i], rng, b) => {
  const [fam, std, q] = REGISTRES[i];
  return fill(b, { q, hint: `${fam} (familier) → registre courant`, answer: [std], explain: `${quote(fam)} est familier ; à l'écrit, on dit ${quote(std)}.` });
});
def("tout", "11.2", "orthographe", (rng) => [rnd(rng, TOUT.length)], ([i], rng, b) => {
  const [q, a, explain] = TOUT[i];
  return fill(b, { q, hint: "tout, toute, tous ou toutes ?", answer: a, explain });
});
def("couleur", "11.2", "orthographe", (rng) => [rnd(rng, COULEURS.length)], ([i], rng, b) => {
  const [q, hint, a, explain] = COULEURS[i];
  return fill(b, { q, hint, answer: a, explain });
});
def("nombre", "11.3", "orthographe", (rng) => {
  const kinds = [() => 21 + rnd(rng, 79), () => 100 + rnd(rng, 900), () => [80, 200, 300, 280, 1000, 2000, 80000, 200000, 380][rnd(rng, 9)], () => 1001 + rnd(rng, 98998)];
  return [kinds[rnd(rng, kinds.length)]()];
}, ([n], rng, b) => {
  const w = numberToFrench(n);
  return typeIt(b, { prompt: `${n.toLocaleString("fr-FR")} — écris le nombre en lettres`, label: "Nombres en lettres", answer: [w], explain: `${n} s'écrit ${w}. Vingt et cent prennent un s quand ils sont multipliés et ne sont suivis de rien ; mille est invariable. Depuis 1990, on peut relier tous les mots par des traits d'union.` });
});
def("compose", "11.3", "orthographe", (rng) => [rnd(rng, COMPOSES.length)], ([i], rng, b) => {
  const [sg, pl, explain] = COMPOSES[i];
  const noun = sg.replace(/^un\s+/, "");
  return fill(b, { q: `${cap(sg)}, des ___.`, hint: noun, answer: pl.map((x) => x.replace(/^des\s+/, "")), explain });
});
conjGen("temps_rares", "11.4", ["subj_imparfait", "subj_plus_que_parfait", "passe_anterieur"], (f) => !MODAL.has(frameVerb(f)) && !isPronominalInf(f[0]));
def("majuscule", "11.5", "orthographe", (rng) => [rnd(rng, MAJUSCULES.length)], ([i], rng, b) => {
  const [q, a, explain] = MAJUSCULES[i];
  return fill(b, { q, hint: "majuscule ou minuscule ?", answer: a, explain, caseSensitive: true });
});

// 12.1 Every tense (the Tower), 12.2 everyday spelling, 12.3 expert agreements
def("usage", "12.2", "orthographe", (rng) => [rnd(rng, USAGE.length)], ([i], rng, b) => {
  const [w, wrong, explain] = USAGE[i];
  return mcq(b, rng, { q: "Quelle est la bonne orthographe ?", right: w, wrong, explain });
});
def("pp_expert", "12.3", "grammaire", (rng) => [rnd(rng, PP_SPECIAL.length + PRONOMINAUX.length)], ([i], rng, b) => {
  const [q, hint, a, explain] = i < PP_SPECIAL.length ? PP_SPECIAL[i] : PRONOMINAUX[i - PP_SPECIAL.length] || [];
  return q ? fill(b, { q, hint, answer: a, explain }) : null;
});

// Any verb, any tense: params [tense index, frame, subject, mode, marker].
const ALL_TENSES = TENSES.map((t) => t.id);
def("conj", "12.1", "conjugaison", (rng) => [rnd(rng, ALL_TENSES.length), rnd(rng, FRAMES.length), rnd(rng, SUBJECTS.length), rnd(rng, 3), rnd(rng, 3)], ([ti, fi, si, mode, mi], rng, b) => {
  const tense = ALL_TENSES[ti];
  const frame = FRAMES[fi];
  const subj = SUBJECTS[si];
  if (!tense || !frame || !subj) return null;
  if (tense.startsWith("imp_") && ![1, 3, 4].includes(subj.p)) return null;
  if (MODAL.has(frameVerb(frame)) && !["present", "imparfait", "futur", "cond_present", "passe_simple", "subj_present"].includes(tense)) return null;
  if (mode === 2 && (subj.p === 0 || si >= 8 || AROUND[tense] || tense.startsWith("imp_"))) mode = 0;
  const ar = AROUND[tense] ? AROUND[tense][mi % AROUND[tense].length] : null;
  const tail = AROUND[tense] ? "" : (TAIL[tense] || [""])[mi % (TAIL[tense] || [""]).length];
  const g = conjGap(frame, tense, subj, mode, tail, ar);
  if (!g) return null;
  const person = tense.startsWith("imp_") || mode === 2 ? `${subj.t} / ` : "";
  return fill(b, { q: g.q, hint: `${person}${infLabel(frame)} — ${tenseById(tense).fr}${modeLabel(mode, tense)}`, answer: g.answers, explain: conjExplain(frame[0], tense, g.answers) });
});

export const GENERATORS = G;
const BY_ID = new Map(G.map((g) => [g.id, g]));

/**
 * A conjugation question in one of the given tenses (ids of TENSES); `negQ` is the share of negative and
 * interrogative forms. Rebuildable from its ref like every generated question.
 */
export function conjQuestion(rng, { tenses = null, negQ = 0.3 } = {}) {
  const allowed = ALL_TENSES.map((t, i) => (!tenses || tenses.includes(t) ? i : -1)).filter((i) => i >= 0);
  if (!allowed.length) return null;
  for (let k = 0; k < 12; k++) {
    const mode = rng() < negQ ? 1 + rng.int(2) : 0;
    const q = assemble(BY_ID.get("conj"), [rng.pick(allowed), rng.int(FRAMES.length), rng.int(SUBJECTS.length), mode, rng.int(3)]);
    if (q) return q;
  }
  return null;
}

const unitKey = (uid) => {
  const [L, U] = String(uid).split(".").map(Number);
  return L * 10 + U;
};

/** Generators introduced in exactly this station. */
export const generatorsOf = (uid) => G.filter((g) => g.unit === uid);
/** Generators available once this station is reached. */
export const generatorsUpTo = (uid) => G.filter((g) => unitKey(g.unit) <= unitKey(uid));

function assemble(g, params) {
  const ref = `gen:${g.id}|${params.join("|")}`;
  const rng = makeRng(ref);
  const L = Number(g.unit.split(".")[0]);
  const base = { ref, unitId: g.unit, level: L, skill: g.skill, generated: true };
  try {
    const q = g.build(params, rng, base);
    if (!q) return null;
    q.explain = q.explain || "";
    return q;
  } catch {
    return null;
  }
}

/** A new question from generator `id` (L = level of the context, for word lists). */
export function generate(id, rng, L = 12) {
  const g = BY_ID.get(id);
  if (!g) return null;
  for (let k = 0; k < 8; k++) {
    const params = g.pick(rng, L);
    if (!params) return null;
    const q = assemble(g, params);
    if (q) return q;
  }
  return null;
}

/** Rebuilds a generated question from its ref. */
export function regen(ref) {
  const m = String(ref).match(/^gen:([a-z0-9_]+)\|(.*)$/);
  if (!m) return null;
  const g = BY_ID.get(m[1]);
  if (!g) return null;
  const params = m[2].split("|").map(Number);
  if (params.some((x) => !Number.isFinite(x))) return null;
  return assemble(g, params);
}

export { FRAMES, SUBJECTS };
