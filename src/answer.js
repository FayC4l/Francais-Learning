// Answer normalization and checking for French. Pure functions shared by the app and the content validators.
// Accents always count. Case only counts where asked (dictations, proper nouns). Hyphens count (« peut-être »).
// The 1990 spelling reform is accepted everywhere (« paraitre », « évènement », « vingt-et-un »…).

const APOS = /[‘’ʼ`´]/g;
const NBSP = /[   ]/g;

/** Removes the accents (é → e, ç → c), keeps the case. */
export const stripAccents = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").normalize("NFC");

/**
 * Basic cleanup: apostrophes, quotes, punctuation, dashes used as punctuation, spaces around apostrophes and
 * hyphens, œ → oe. Lowercases unless keepCase.
 */
export function clean(input, { keepCase = false } = {}) {
  let s = String(input ?? "").normalize("NFC").replace(NBSP, " ");
  if (!keepCase) s = s.toLowerCase();
  s = s.replace(APOS, "'").replace(/[“”«»"]/g, " ");
  s = s.replace(/[‐‑‒–]/g, "-");
  s = s.replace(/—/g, " ");
  s = s.replace(/(^|\s)-+(?=\s|$)/g, " "); // a dash alone is punctuation
  s = s.replace(/[.,!?;:()[\]{}…/\\*]/g, " ");
  s = s.replace(/\s*'\s*/g, "'").replace(/\s*-\s*/g, "-");
  s = s.replace(/(^|\s)['-]+|['-]+(?=\s|$)/g, " ");
  s = s.replace(/œ/g, "oe").replace(/Œ/g, "OE").replace(/æ/g, "ae").replace(/Æ/g, "AE");
  return s.replace(/\s+/g, " ").trim();
}

// ---------- 1990 spelling reform ----------

// The circumflex on i and u may be dropped, except where it distinguishes words (dû, mûr, sûr, jeûne, croît…)
// and in the endings of the passé simple and the subjunctive imperfect (fût, prît, vînmes…).
const KEEP_CIRC = /^(dû|mûre?s?|sûre?s?|sûrement|sûreté|jeûn\w*|crû|crûs|croîs|croît)$/;
const CIRC_ENDING = /(?:^|[^aoAO])[îû]n?t$|[îû]n?(?:mes|tes)$/;
function withoutCircumflex(w) {
  if (!/[îû]/i.test(w)) return null;
  const low = w.toLowerCase();
  if (KEEP_CIRC.test(low) || (CIRC_ENDING.test(low) && low !== "gît")) return null;
  return w.replace(/î/g, "i").replace(/û/g, "u").replace(/Î/g, "I").replace(/Û/g, "U");
}

// Traditional ↔ rectified spellings (both accepted).
const DOUBLETS = [
  ["événement", "évènement"], ["réglementaire", "règlementaire"], ["réglementation", "règlementation"], ["réglementer", "règlementer"],
  ["crémerie", "crèmerie"], ["sécheresse", "sècheresse"], ["allégement", "allègement"], ["abrégement", "abrègement"], ["empiétement", "empiètement"],
  ["affèterie", "afféterie"], ["céleri", "cèleri"], ["oignon", "ognon"], ["nénuphar", "nénufar"], ["clef", "clé"], ["paraphe", "parafe"],
  ["relais", "relai"], ["joaillier", "joailler"], ["interpeller", "interpeler"], ["aiguë", "aigüe"], ["ambiguë", "ambigüe"],
  ["ambiguïté", "ambigüité"], ["exiguë", "exigüe"], ["contiguë", "contigüe"], ["ciguë", "cigüe"], ["gageure", "gageüre"], ["arguer", "argüer"],
  ["porte-monnaie", "portemonnaie"], ["week-end", "weekend"], ["pique-nique", "piquenique"], ["chauve-souris", "chauvesouris"],
  ["croque-monsieur", "croquemonsieur"], ["tire-bouchon", "tirebouchon"], ["plate-forme", "plateforme"], ["haut-parleur", "hautparleur"],
  ["porte-clés", "porteclé"], ["mille-pattes", "millepatte"], ["extra-terrestre", "extraterrestre"], ["contre-attaque", "contrattaque"],
  ["entre-temps", "entretemps"], ["eczéma", "exéma"], ["imbécillité", "imbécilité"], ["bonhomie", "bonhommie"], ["boursoufler", "boursouffler"],
  ["chariot", "charriot"], ["combatif", "combattif"], ["persifler", "persiffler"], ["événements", "évènements"], ["oignons", "ognons"],
  ["clefs", "clés"], ["puissé-je", "puissè-je"], ["aimé-je", "aimè-je"], ["dussé-je", "dussè-je"], ["douceâtre", "douçâtre"],
];
const DOUBLE_MAP = new Map();
for (const [a, b] of DOUBLETS) {
  DOUBLE_MAP.set(a, [...(DOUBLE_MAP.get(a) || []), b]);
  DOUBLE_MAP.set(b, [...(DOUBLE_MAP.get(b) || []), a]);
}
// Future / conditional of céder-like verbs: céderai → cèderai.
const FUT_E = /^(.+)é((?:qu|gu|[bcçdfghjklmnpqrstvwxz])+)er(ai|as|a|ons|ez|ont|ais|ait|ions|iez|aient)$/;

/** Accepted spellings of one word (itself first). */
export function wordVariants(w) {
  const out = [w];
  const low = w.toLowerCase();
  const nc = withoutCircumflex(w);
  if (nc) out.push(nc);
  for (const d of DOUBLE_MAP.get(low) || []) out.push(/^[A-ZÀ-Ý]/.test(w) ? d[0].toUpperCase() + d.slice(1) : d);
  const m = w.match(FUT_E);
  if (m) out.push(`${m[1]}è${m[2]}er${m[3]}`);
  return [...new Set(out)];
}

const NUMWORD = new Set("un une deux trois quatre cinq six sept huit neuf dix onze douze treize quatorze quinze seize vingt vingts trente quarante cinquante soixante cent cents mille et".split(" "));
/** Rectified numerals: every compound numeral may be hyphenated (vingt et un → vingt-et-un, deux cents → deux-cents). */
function hyphenNumerals(words) {
  const isNum = (x) => NUMWORD.has(x.toLowerCase()) && x.toLowerCase() !== "et";
  const out = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const last = out.length ? out[out.length - 1].split("-").pop() : "";
    const joinable = isNum(w.split("-")[0]) || (w.toLowerCase() === "et" && /^(un|une|onze)$/i.test(words[i + 1] || ""));
    if (last && (isNum(last) || last.toLowerCase() === "et") && joinable) out[out.length - 1] += `-${w}`;
    else out.push(w);
  }
  return out;
}

/** All accepted versions of an answer, as arrays of words (each word: its accepted spellings). */
function expected(answer, keepCase) {
  const words = clean(answer, { keepCase }).split(" ").filter(Boolean);
  const versions = [words];
  const hy = hyphenNumerals(words);
  if (hy.join(" ") !== words.join(" ")) versions.push(hy);
  return versions.map((ws) => ws.map((w) => wordVariants(w)));
}

/** One part of a word; a capital without its accent is tolerated (« Ecole » for « École »). */
function partEq(t, a, caseSensitive) {
  if (t === a || (!caseSensitive && t.toLowerCase() === a.toLowerCase())) return true;
  const t0 = t[0];
  const a0 = a[0];
  if (!t0 || !a0 || t.length !== a.length || t0 === t0.toLowerCase()) return false;
  if (stripAccents(a0).toLowerCase() !== t0.toLowerCase()) return false;
  return caseSensitive ? a0 !== a0.toLowerCase() && t.slice(1) === a.slice(1) : t.slice(1).toLowerCase() === a.slice(1).toLowerCase();
}

/** Same word (each part of « l'Élysée » or « Vient-il » is compared on its own). */
function wordEq(typed, accepted, caseSensitive) {
  const tp = typed.split(/(['-])/);
  return accepted.some((a) => {
    const ap = a.split(/(['-])/);
    return ap.length === tp.length && ap.every((x, i) => partEq(tp[i], x, caseSensitive));
  });
}

/**
 * True when the typed answer matches one of the accepted answers.
 * caseSensitive: capitals count (the first word of the answer is always free).
 */
export function matches(typed, accepted, { caseSensitive = false } = {}) {
  const list = Array.isArray(accepted) ? accepted : [accepted];
  const t = clean(typed, { keepCase: true }).split(" ").filter(Boolean);
  if (!t.length) return false;
  for (const a of list) {
    for (const version of expected(a, true)) {
      if (version.length !== t.length) continue;
      if (version.every((alts, i) => wordEq(t[i], alts, caseSensitive && i > 0))) return true;
    }
  }
  return false;
}

/** Splits a sentence into word tiles (punctuation removed, capitals kept, French spaces before ? ! handled). */
export function tiles(sentence) {
  return String(sentence)
    .replace(APOS, "'")
    .split(/\s+/)
    .map((w) => w.replace(/^[«"“(—–-]+|[.,!?;:»"”)…]+$/g, ""))
    .filter((w) => /[\p{L}\d]/u.test(w));
}

/** Canonical key of a tile sequence, for comparing built sentences. */
export function tileKey(words) {
  return words.map((w) => clean(w)).join(" ");
}

// ---------- Dictation ----------

const baseKey = (w) => stripAccents(w.toLowerCase()).replace(/['-]/g, "");

/** A rectified numeral typed in a dictation (deux-cent-vingt-et-un) back to the traditional words (deux cent vingt et un). */
const NUM_BREAK = new Set("et cent cents mille".split(" "));
function unhyphenNumeral(w) {
  const parts = w.split("-");
  if (parts.length < 2 || !parts.every((p) => NUMWORD.has(p.toLowerCase()))) return [w];
  const out = [parts[0]];
  for (let i = 1; i < parts.length; i++) {
    const prev = parts[i - 1].toLowerCase();
    if (NUM_BREAK.has(prev) || NUM_BREAK.has(parts[i].toLowerCase())) out.push(parts[i]);
    else out[out.length - 1] += `-${parts[i]}`;
  }
  return out;
}

/**
 * Word-by-word correction of a dictation. Returns { words: [{ w, typed, status }], extra: [typed words],
 * faults } where status is "ok", "accent" (accents only), "case" (capital only), "wrong" or "missing".
 * Faults: wrong / missing / extra word = 1, accent or capital = ½ (capitals are checked everywhere).
 */
export function compareDictation(typed, expectedText) {
  const exp = clean(expectedText, { keepCase: true }).split(" ").filter(Boolean);
  const got = clean(typed, { keepCase: true }).split(" ").flatMap(unhyphenNumeral).filter(Boolean);
  const a = got.map(baseKey);
  const b = exp.map(baseKey);
  const n = a.length;
  const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const pair = new Array(m).fill(-1);
  const used = new Array(n).fill(false);
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      pair[j] = i;
      used[i] = true;
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  // Unmatched typed words sitting between the same neighbours replace the expected word (« a » for « à »…).
  for (let k = 0; k < m; k++) {
    if (pair[k] >= 0) continue;
    const before = k > 0 ? pair[k - 1] : -1;
    let after = n;
    for (let q = k + 1; q < m; q++) if (pair[q] >= 0) { after = pair[q]; break; }
    for (let x = before + 1; x < after; x++) {
      if (!used[x]) {
        pair[k] = x;
        used[x] = true;
        break;
      }
    }
  }
  let faults = 0;
  const words = exp.map((w, k) => {
    if (pair[k] < 0) {
      faults += 1;
      return { w, typed: "", status: "missing" };
    }
    const t = got[pair[k]];
    const alts = wordVariants(w);
    let status;
    if (wordEq(t, alts, true)) status = "ok";
    else if (wordEq(t, alts, false)) status = "case";
    else if (alts.some((x) => baseKey(x) === baseKey(t))) status = "accent";
    else status = "wrong";
    if (status === "case" || status === "accent") faults += 0.5;
    if (status === "wrong") faults += 1;
    return { w, typed: t, status };
  });
  const extra = got.filter((_, x) => !used[x]);
  faults += extra.length;
  return { words, extra, faults };
}

/** Mark out of 20 for a dictation: two points per fault (half a fault for an accent or a capital). */
export const dictationMark = (faults) => Math.max(0, Math.round((20 - 2 * faults) * 2) / 2);

/** Letter-level diff kept for the old feedback API: [{ w, ok }] over the expected words. */
export function diffWords(typed, expectedText) {
  return compareDictation(typed, expectedText).words.map((x) => ({ w: x.w, ok: x.status === "ok" }));
}
