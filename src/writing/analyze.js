// Text analysis: tenses, connectors, lexical range, register, requirement checks, then the issues. Pure.
import { tokenize, countWords } from "./tokenize.js";
import { checkRules } from "./rules.js";
import { tierOf, suggest, maskOf, TAGS } from "./spell.js";
import { readings, ppReadings } from "./verbindex.js";
import { verbInfo } from "../engine/conjugue.js";

export const CONNECTORS = [
  // basic
  "et", "mais", "donc", "car", "ou", "puis", "ensuite", "enfin", "alors", "parce que", "quand", "si", "d'abord", "après", "aussi", "comme",
  // intermediate
  "cependant", "pourtant", "toutefois", "néanmoins", "en effet", "de plus", "par ailleurs", "en outre", "d'une part", "d'autre part",
  "par conséquent", "c'est pourquoi", "ainsi", "en revanche", "au contraire", "bien que", "alors que", "tandis que", "afin que", "pour que",
  "puisque", "premièrement", "deuxièmement", "finalement", "en conclusion", "pour conclure", "en somme", "par exemple", "notamment",
  "autrement dit", "c'est-à-dire", "certes", "or", "d'ailleurs", "malgré", "grâce à", "à cause de", "afin de", "au lieu de", "même si", "dès que", "lorsque",
  // advanced
  "dès lors", "partant", "nonobstant", "de surcroît", "qui plus est", "en l'occurrence", "a fortiori", "quoique", "encore que",
  "sans compter que", "force est de constater", "il n'en demeure pas moins", "toujours est-il", "en définitive", "somme toute",
  "au demeurant", "eu égard à", "compte tenu de", "à cet égard", "en d'autres termes", "par voie de conséquence", "dans la mesure où",
  "pour autant", "en tout état de cause", "à l'inverse", "de ce fait", "en ce sens", "à plus forte raison", "il est vrai que",
];
const ADVANCED = new Set(CONNECTORS.slice(CONNECTORS.indexOf("dès lors")));
const BASIC = new Set(CONNECTORS.slice(0, CONNECTORS.indexOf("cependant")));

const STOP = new Set("le la les un une des de du d' l' et ou mais donc car ni que qu' qui quoi dont où à au aux en dans par pour sur sous avec sans chez ce cet cette ces mon ma mes ton ta tes son sa ses notre nos votre vos leur leurs je j' tu il elle on nous vous ils elles me m' te t' se s' lui y ne n' pas plus est sont était a ont avait être avoir fait faire c' ça cela très bien tout tous toute toutes même aussi comme si".split(" "));
// Familiar words that weigh down a formal text.
const FAMILIAR = /(?<![\p{L}'])(bosser|bossé|boulot|boulots|truc|trucs|machin|mec|mecs|nana|nanas|bagnole|bagnoles|ouais|bah|kiffer|kiffe|kiffé|chelou|flic|flics|fric|pote|potes|bouquin|bouquins|flemme|crevé|crevée|bouffer|bouffe|piger|pigé|marrant|marrante|super|trop bien|du coup|okay|ok|t'es|chais)(?![\p{L}])/giu;

const GREETING = /^\s*(madame|monsieur|mesdames|messieurs|cher|chère|chers|chères|bonjour|salut|coucou|à l'attention)/iu;
const SIGNOFF = /(cordialement|bien à (toi|vous)|amicalement|bises|bisous|grosses bises|à bientôt|à très vite|je vous prie d'agréer|veuillez agréer|recevez|salutations|affectueusement|je t'embrasse|amitiés|au plaisir)[^.!?]*[,.!]?\s*\n*\s*[\p{L}-]*\s*$/iu;

const DETERMINER = /^(le|la|les|l'|un|une|des|du|de|d'|au|aux|ce|cet|cette|ces|mon|ma|mes|ton|ta|tes|son|sa|ses|notre|nos|votre|vos|leur|leurs|chaque)$/;

/** Verb phrases per tense (approximate, good enough to check a requirement). */
export function detectTenses(tk) {
  const c = { present: 0, imparfait: 0, passe_simple: 0, passe_compose: 0, plus_que_parfait: 0, futur: 0, conditionnel: 0, subjonctif: 0, passif: 0 };
  const W = tk.tokens.filter((t) => t.word);
  const COMPOUND = { present: "passe_compose", imparfait: "plus_que_parfait", futur: "futur", cond_present: "conditionnel", subj_present: "subjonctif", subj_imparfait: "subjonctif", passe_simple: "passe_simple" };
  const SIMPLE = { present: "present", imparfait: "imparfait", passe_simple: "passe_simple", futur: "futur", cond_present: "conditionnel", subj_present: "subjonctif", subj_imparfait: "subjonctif" };
  for (let k = 0; k < W.length; k++) {
    const w = W[k].lower;
    const r = readings(w);
    if (!r.length) continue;
    const isAux = r.some((x) => x.inf === "avoir" || x.inf === "être");
    if (isAux) {
      let a = k + 1;
      while (a < W.length && /^(pas|jamais|plus|déjà|bien|tout|encore|beaucoup|toujours|souvent|parfois|enfin|ne|n'|rien|vraiment|d'abord|peu|à|aussitôt|longtemps|mal|trop|presque|même|vite|assez|certainement|probablement|sûrement|aussi|alors|ensuite)$/.test(W[a].lower) && a < k + 4) a++;
      const pp = W[a] ? ppReadings(W[a].lower) : [];
      const auxR = r.find((x) => x.inf === "avoir" || x.inf === "être");
      if (pp.length && W[a].lower === "été" && auxR.inf === "avoir") {
        // « a été » : a compound tense of être, and a passive when a participle follows (a été organisée).
        const next = W[a + 1] ? ppReadings(W[a + 1].lower) : [];
        if (next.length && W[a + 1].lower !== "été") {
          c.passif++;
          a++;
        }
        c[COMPOUND[auxR.tense] || "passe_compose"]++;
        k = a;
        continue;
      }
      if (pp.length && W[a].lower !== "été") {
        const isEtre = auxR.inf === "être";
        if (isEtre && verbInfo(pp[0].inf)?.aux === "avoir" && !/^(se|s'|me|m'|te|t'|nous|vous)$/.test(W[k - 1]?.lower || "")) c.passif++;
        c[COMPOUND[auxR.tense] || "passe_compose"]++;
        k = a;
        continue;
      }
    }
    const prevQue = [1, 2, 3].some((d) => /^(que|qu')$/.test(W[k - d]?.lower || ""));
    const subj = r.find((x) => x.tense.startsWith("subj_"));
    const pick = prevQue && subj ? subj : r.find((x) => x.tense === "present") || r[0];
    // A noun or an adjective that happens to be a verb form (la porte, une marche) is not counted. Être and avoir
    // (est, a) are verbs unless a determiner comes just before (l'est, un a).
    const mk = maskOf(w);
    const prev = W[k - 1]?.lower || "";
    if (mk & (TAGS.NS | TAGS.NP | TAGS.AS | TAGS.AP)) {
      if (isAux ? DETERMINER.test(prev) : !/^(je|j'|tu|il|elle|on|nous|vous|ils|elles|qui|ne|n'|se|s'|me|m'|te|t')$/.test(prev)) continue;
    }
    c[SIMPLE[pick.tense]]++;
  }
  return c;
}

/** Connectors used (with counts). */
export function detectConnectors(text) {
  const low = ` ${text.toLowerCase().replace(/[’]/g, "'").replace(/[^\p{L}' -]+/gu, " ").replace(/\s+/g, " ")} `;
  const found = {};
  for (const k of CONNECTORS) {
    const n = low.split(` ${k} `).length - 1;
    if (n) found[k] = n;
  }
  return found;
}

/** Moving-average type-token ratio (window 40): lexical diversity independent of length. */
export function mattr(words, win = 40) {
  if (!words.length) return 0;
  if (words.length <= win) return new Set(words).size / words.length;
  let sum = 0;
  let n = 0;
  for (let i = 0; i + win <= words.length; i++) {
    sum += new Set(words.slice(i, i + win)).size / win;
    n++;
  }
  return sum / n;
}

/** Checks the prompt's requirements. */
export function checkRequire(req = [], a) {
  return req.map((r) => {
    let got = 0;
    if (r.kind === "tense") got = a.tenses[r.value] || 0;
    else if (r.kind === "connectors") got = Object.keys(a.connectors).length;
    else if (r.kind === "words") {
      const low = ` ${a.text.toLowerCase().replace(/[’]/g, "'").replace(/[^\p{L}' -]+/gu, " ")} `;
      got = r.value.filter((w) => low.includes(` ${w.toLowerCase()} `)).length;
    } else if (r.kind === "paragraphs") got = a.paragraphs;
    else if (r.kind === "questions") got = a.questions;
    return { ...r, got, ok: got >= r.min };
  });
}

/**
 * analyze(text, prompt) → full analysis used by the scorer and the report.
 * prompt: { level, type, words: [min, max], require: [...] }
 */
export function analyze(text, prompt = {}) {
  const tk = tokenize(text);
  const words = tk.tokens.filter((t) => t.word).map((t) => t.lower);
  const sentLens = tk.sentences.map((s) => s.tokens.filter((i) => tk.tokens[i].word).length).filter((n) => n > 0);
  const avg = sentLens.length ? sentLens.reduce((a, b) => a + b, 0) / sentLens.length : 0;
  const sd = sentLens.length > 1 ? Math.sqrt(sentLens.reduce((s, n) => s + (n - avg) ** 2, 0) / sentLens.length) : 0;
  const content = words.filter((w) => w.length >= 4 && !STOP.has(w));
  const tiers = { 1: 0, 2: 0, 3: 0 };
  for (const w of content) {
    const t = tierOf(w);
    if (t) tiers[t]++;
  }
  const freq = {};
  for (const w of content) freq[w] = (freq[w] || 0) + 1;
  const repeated = Object.entries(freq)
    .filter(([w, n]) => n >= Math.max(3, Math.ceil(words.length / 40)))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const familiar = text.match(FAMILIAR) || [];
  const a = {
    text: tk.text,
    tk,
    words: countWords(text),
    sentences: sentLens.length,
    avgSentence: avg,
    sdSentence: sd,
    paragraphs: tk.paragraphs.length,
    questions: (text.match(/\?/g) || []).length,
    mattr: mattr(words),
    sophistication: content.length ? (tiers[2] + tiers[3] * 1.5) / content.length : 0,
    tenses: detectTenses(tk),
    connectors: detectConnectors(text),
    familiar: familiar.length,
    familiarWords: [...new Set(familiar.map((x) => x.toLowerCase()))].slice(0, 6),
    greeting: GREETING.test(text),
    signoff: SIGNOFF.test(text.trim()),
    repeated,
    issues: checkRules(tk, { suggest }),
  };
  a.advancedConnectors = Object.keys(a.connectors).filter((k) => ADVANCED.has(k));
  a.basicOnly = Object.keys(a.connectors).every((k) => BASIC.has(k));
  a.checks = checkRequire(prompt.require, a);
  return a;
}
