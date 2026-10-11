// Marks a text out of 20: respect of the task, efficiency and register, organisation, language (each /5),
// with strengths, priorities and an estimated CEFR level. Pure.

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const BANDS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const bandOfLevel = (L) => (L <= 2 ? "A1" : L <= 4 ? "A2" : L <= 6 ? "B1" : L <= 8 ? "B2" : L <= 10 ? "C1" : "C2");

const FORMAL = new Set(["lettre", "essai", "article", "critique", "rapport", "synthese", "discours", "dissertation", "compte-rendu"]);
const CORRESPONDENCE = new Set(["lettre", "courriel", "message"]);
const WEIGHT = { grammar: 1, vocab: 0.7, spelling: 0.8, mechanics: 0.35, style: 0.25, typo: 0.05 };
const CAT_FR = { grammar: "grammaire et accords", vocab: "vocabulaire", spelling: "orthographe", mechanics: "ponctuation et majuscules", style: "style", typo: "typographie" };
const TENSE_FR = { present: "présent", imparfait: "imparfait", passe_simple: "passé simple", passe_compose: "passé composé", plus_que_parfait: "plus-que-parfait", futur: "futur", conditionnel: "conditionnel", subjonctif: "subjonctif", passif: "voix passive" };
const SYNONYMS = {
  chose: "élément, aspect, point", choses: "éléments, aspects, points", faire: "réaliser, effectuer, accomplir", fait: "réalisé, accompli", dire: "affirmer, déclarer, souligner",
  beaucoup: "nombreux, considérablement, largement", très: "extrêmement, particulièrement, fort", gens: "individus, citoyens, personnes", mettre: "placer, déposer, instaurer",
  important: "essentiel, crucial, primordial", problème: "difficulté, enjeu, obstacle", aussi: "également, de surcroît", bien: "remarquable, judicieux, efficace",
  penser: "estimer, considérer, juger", pense: "estime, considère, juge", voir: "observer, constater, remarquer", vraiment: "réellement, véritablement", avoir: "posséder, disposer de, bénéficier de",
  bon: "bénéfique, judicieux, pertinent", donner: "offrir, accorder, procurer", montrer: "démontrer, révéler, illustrer", grand: "considérable, vaste, majeur",
};

/** Expectations by course level (1-12), for native speakers. */
function expectations(L) {
  return {
    sentence: L <= 2 ? [5, 12] : L <= 4 ? [7, 16] : L <= 6 ? [9, 20] : L <= 8 ? [11, 24] : L <= 10 ? [13, 28] : [14, 32],
    mattr: L <= 2 ? 0.6 : L <= 4 ? 0.64 : L <= 6 ? 0.68 : L <= 8 ? 0.7 : L <= 10 ? 0.72 : 0.74,
    soph: L <= 4 ? 0.05 : L <= 8 ? 0.1 : 0.15,
    connectorsPer100: L <= 2 ? 1.5 : L <= 4 ? 2.5 : L <= 6 ? 3 : L <= 8 ? 3.5 : 4,
    tenses: L <= 2 ? 1 : L <= 4 ? 2 : L <= 6 ? 3 : L <= 8 ? 3 : 4,
    errorZero: L <= 4 ? 9 : L <= 8 ? 7 : 6, // weighted errors per 100 words that bring accuracy to 0
  };
}

export function errorDensity(a) {
  const sum = a.issues.reduce((s, x) => s + (WEIGHT[x.cat] ?? 0.5), 0);
  return a.words ? (sum / a.words) * 100 : 0;
}

/** Rough CEFR level of the text itself (independent of the prompt), calibrated on the model answers. */
export function textBand(a) {
  if (a.words < 15) return "A1";
  const idx = textIndex(a);
  return BANDS[BAND_CUTS.filter((c) => idx >= c).length];
}

/** Maturity index of a text: sentence length, long words, advanced connectors, rare words, minus the errors. */
export function textIndex(a) {
  const e = errorDensity(a);
  const long = a.tk.tokens.filter((t) => t.word && t.text.length >= 9).length / Math.max(1, a.words);
  return ((a.avgSentence - 7) / 3 + (long - 0.05) / 0.03) / 2 + a.advancedConnectors.length * 0.3 + a.sophistication * 2 - e * 0.2;
}
// Calibrated on the French model answers (tools/calibrate-bands.mjs): the median text of each band sits in its band.
const BAND_CUTS = [0.9, 1.6, 2.2, 2.9, 3.9];

/**
 * score(analysis, prompt) → { total, criteria: {content, communicative, organisation, language}, band, textBand,
 *   strengths: [], priorities: [], details }
 */
export function score(a, prompt = {}) {
  const L = Math.max(1, Math.min(12, prompt.level || 6));
  const ex = expectations(L);
  const [min, max] = prompt.words || [40, 120];
  const n = a.words;
  const strengths = [];
  const priorities = [];

  // ----- Respect of the task: length and the prompt's requirements -----
  const wordFit = n >= min && n <= max * 1.1 ? 1 : n < min ? clamp((n / min - 0.4) / 0.6) : clamp(1 - (n / max - 1.1) * 1.5, 0.5, 1);
  const checks = a.checks || [];
  const reqRatio = checks.length ? checks.filter((c) => c.ok).length / checks.length : 1;
  let content = n < 8 ? 0 : 5 * (0.45 * wordFit + 0.55 * reqRatio);
  if (n < min) priorities.push(`Ton texte est trop court : ${n} mots pour ${min} à ${max} demandés.`);
  else if (n > max * 1.1) priorities.push(`Ton texte est trop long : ${n} mots (${min} à ${max} demandés). Au DALF, on perd des points au-delà de 10 %.`);
  checks.filter((c) => !c.ok).forEach((c) => priorities.push(`Consigne non remplie : ${c.label} (${c.got}/${c.min}).`));
  if (checks.length && reqRatio === 1) strengths.push("Tu as respecté toutes les consignes du sujet.");

  // ----- Efficiency of the message: register, layout of letters, readability -----
  let comm = 3.5;
  const formal = FORMAL.has(prompt.type) || L >= 9;
  if (a.familiar) {
    comm -= Math.min(1.5, a.familiar * (formal ? 0.5 : 0.25));
    priorities.push(`Registre : évite les mots familiers à l'écrit (${a.familiarWords.join(", ")}).`);
  }
  if (CORRESPONDENCE.has(prompt.type)) {
    comm += a.greeting ? 0.4 : -0.5;
    comm += a.signoff ? 0.4 : -0.4;
    if (!a.greeting) priorities.push("Commence par une formule d'appel (Cher Hugo, / Madame, Monsieur,).");
    if (!a.signoff) priorities.push("Termine par une formule de politesse (À bientôt, / Je vous prie d'agréer…) et ta signature.");
    if (a.greeting && a.signoff) strengths.push("Lettre bien présentée : formule d'appel et formule de politesse.");
  }
  const [lo, hi] = ex.sentence;
  if (a.avgSentence >= lo && a.avgSentence <= hi) comm += 0.4;
  else if (a.avgSentence < lo) {
    comm -= 0.3;
    if (L >= 5) priorities.push("Tes phrases sont très courtes : relie-les (qui, que, dont, lorsque, bien que…).");
  } else {
    comm -= 0.4;
    priorities.push("Certaines phrases sont très longues : coupe-les pour rester clair.");
  }
  if (a.sdSentence >= 3 && a.sentences >= 4) comm += 0.4;
  const runOns = a.issues.filter((x) => x.rule === "end-punct").length;
  if (runOns) comm -= Math.min(1, runOns * 0.3);
  comm = clamp(comm, 0, 5);

  // ----- Organisation: connectors and paragraphs -----
  const distinct = Object.keys(a.connectors).length;
  const wantConn = Math.max(1, (ex.connectorsPer100 * Math.max(n, 30)) / 100);
  let conn = clamp(distinct / wantConn);
  if (L >= 7 && a.advancedConnectors.length) conn = clamp(conn + 0.15);
  if (L >= 7 && a.basicOnly && distinct) priorities.push("Varie tes connecteurs : cependant, en effet, par conséquent, en revanche, néanmoins…");
  const needParas = checks.find((c) => c.kind === "paragraphs")?.min || (L >= 7 && n >= 150 ? 3 : 1);
  const para = needParas <= 1 ? 1 : clamp((a.paragraphs - 1) / (needParas - 1));
  if (needParas > 1 && a.paragraphs < needParas) priorities.push(`Organise ton texte en ${needParas} paragraphes (laisse une ligne vide entre deux paragraphes).`);
  let organisation = 5 * (0.6 * conn + 0.4 * para);
  if (a.sentences < 2 && n > 20) organisation -= 1;
  organisation = clamp(organisation, 0, 5);
  if (conn >= 0.9) strengths.push(`Bons connecteurs (${Object.keys(a.connectors).slice(0, 4).join(", ")}).`);
  if (needParas > 1 && a.paragraphs >= needParas) strengths.push("Texte bien découpé en paragraphes.");

  // ----- Language: accuracy, range, sophistication, tenses -----
  const e = errorDensity(a);
  const accuracy = clamp(1 - e / ex.errorZero);
  const range = clamp((a.mattr - (ex.mattr - 0.15)) / 0.15);
  const soph = clamp(a.sophistication / ex.soph);
  const tenseCount = Object.entries(a.tenses).filter(([k, v]) => v > 0 && k !== "passif").length + (a.tenses.passif ? 0.5 : 0);
  const tenseVar = clamp(tenseCount / ex.tenses);
  const language = clamp(5 * (0.6 * accuracy + 0.15 * range + 0.1 * soph + 0.15 * tenseVar), 0, 5);
  if (accuracy >= 0.85 && n >= min * 0.7) strengths.push("Très peu d'erreurs de langue : bravo pour la précision !");
  if (range >= 0.85) strengths.push("Vocabulaire varié.");
  if (tenseVar >= 1) strengths.push(`Bonne variété de temps (${Object.entries(a.tenses).filter(([, v]) => v).map(([k]) => TENSE_FR[k]).slice(0, 4).join(", ")}).`);
  const byCat = {};
  for (const x of a.issues) if (x.cat !== "typo") byCat[x.cat] = (byCat[x.cat] || 0) + 1;
  Object.entries(byCat)
    .sort((x, y) => (WEIGHT[y[0]] || 0) * y[1] - (WEIGHT[x[0]] || 0) * x[1])
    .slice(0, 2)
    .forEach(([cat, k]) => k >= 2 && priorities.push(`${k} erreurs de ${CAT_FR[cat]} : relis-les dans le texte souligné.`));
  if (a.repeated.length) priorities.push(`Tu répètes souvent : ${a.repeated.map(([w, k]) => `${w} (${k}×)${SYNONYMS[w] ? ` → essaie ${SYNONYMS[w]}` : ""}`).join(" ; ")}.`);

  // Mistakes also blur the message, and language weighs a bit more than the other criteria (as in real exams).
  comm = clamp(comm * (0.6 + 0.4 * accuracy), 0, 5);
  const raw = 0.9 * content + 0.9 * comm + 0.8 * organisation + 1.4 * language;
  let total = Math.round(raw * 2) / 2;
  if (n < min * 0.3) total = Math.min(total, 5);
  return {
    total,
    criteria: { content: round1(content), communicative: round1(comm), organisation: round1(organisation), language: round1(language) },
    band: bandOfLevel(L),
    textBand: textBand(a),
    strengths: strengths.slice(0, 4),
    priorities: priorities.slice(0, 5),
    details: { errorDensity: Math.round(e * 10) / 10, accuracy, range, soph, tenseVar, wordFit, reqRatio, conn, para },
  };
}

const round1 = (x) => Math.round(x * 10) / 10;

export const CRITERIA_FR = { content: "Respect de la consigne", communicative: "Efficacité et registre", organisation: "Cohérence et organisation", language: "Langue (orthographe, grammaire, lexique)" };
export { CAT_FR };
