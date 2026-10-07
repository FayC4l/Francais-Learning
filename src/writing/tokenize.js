// Splits a French text into paragraphs, sentences and tokens with character offsets. Pure.
// Elided words are separate tokens (« l'école » → « l' » + « école », « qu'il » → « qu' » + « il »), except
// words where the apostrophe belongs to the word (aujourd'hui, quelqu'un, presqu'île…).

const WORD = /[\p{L}]+(?:['’][\p{L}]+)*(?:-[\p{L}]+(?:['’][\p{L}]+)*)*['’]?|\d+(?:[.,  ]\d{3})*(?:[.,]\d+)?|\.{3}|[.!?]+|[,;:()"“”«»…—–-]/gu;
const ELIDED = /^(c|d|j|l|m|n|s|t|qu|jusqu|lorsqu|puisqu|quoiqu)['’](?=\p{L})/iu;
const WHOLE = new Set(["aujourd'hui", "quelqu'un", "quelqu'une", "presqu'île", "presqu'îles", "prud'homme", "prud'hommes", "entr'ouvrir", "c'est-à-dire", "d'abord", "d'accord", "d'ailleurs", "d'autant", "d'après"]);

/**
 * tokenize(text) → { tokens, sentences, paragraphs }
 *  token: { text, lower, start, end, word, num, punct, s (sentence index), i }
 *  sentence: { start, end, tokens: [indexes] }
 */
export function tokenize(text) {
  const src = String(text || "");
  const tokens = [];
  let m;
  WORD.lastIndex = 0;
  const push = (t, start) => {
    const x = t.replace(/’/g, "'");
    tokens.push({ text: x, lower: x.toLowerCase(), start, end: start + t.length, word: /^\p{L}/u.test(x), num: /^\d/.test(x), punct: !/^[\p{L}\d]/u.test(x) });
  };
  while ((m = WORD.exec(src))) {
    let t = m[0];
    let at = m.index;
    // Split the elided words at the front, unless the apostrophe belongs to the word.
    while (!WHOLE.has(t.toLowerCase().replace(/’/g, "'")) && ELIDED.test(t)) {
      const e = t.match(ELIDED)[0];
      push(e, at);
      t = t.slice(e.length);
      at += e.length;
    }
    if (t) push(t, at);
  }
  // Sentences end at . ! ? … (or a blank line).
  const sentences = [];
  let cur = [];
  const close = () => {
    if (cur.length) sentences.push({ start: tokens[cur[0]].start, end: tokens[cur[cur.length - 1]].end, tokens: cur });
    cur = [];
  };
  tokens.forEach((t, i) => {
    if (cur.length && /\n\s*\n/.test(src.slice(tokens[i - 1].end, t.start))) close();
    cur.push(i);
    if (/^[.!?]+$|^\.\.\.$|^…$/.test(t.text)) close();
  });
  close();
  tokens.forEach((t, i) => (t.i = i));
  sentences.forEach((s, k) => s.tokens.forEach((i) => (tokens[i].s = k)));
  const paragraphs = src.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return { text: src, tokens, sentences, paragraphs };
}

/** Words only (no punctuation, no numbers), lowercased. */
export const wordsOf = (tk) => tk.tokens.filter((t) => t.word).map((t) => t.lower);

/** Number of words as the DALF counts them: everything between two spaces (« c'est-à-dire » = 1, « l'école » = 1). */
export const countWords = (text) => (String(text).match(/[^\s]*[\p{L}\d][^\s]*/gu) || []).length;
