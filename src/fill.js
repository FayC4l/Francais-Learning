// Gap helpers for fill-in questions: one box per expected word. Pure (shared with the validators).
import { clean } from "./answer.js";

/** Words of the canonical answer, as shown by the boxes ("ne mange pas" → ["ne", "mange", "pas"]). */
export function gapWords(expected) {
  return String(expected ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

/** Joins the typed boxes into one answer string. */
export function joinBoxes(values) {
  return values
    .map((v) => String(v ?? "").trim())
    .filter(Boolean)
    .join(" ");
}

const count = (s) => clean(s).split(" ").filter(Boolean).length;

/** Accepted answers whose word count differs from the boxes of answer[0]. */
export function wordCountMismatches(answers) {
  if (!Array.isArray(answers) || !answers.length) return [];
  const ref = count(answers[0]);
  return answers.slice(1).filter((a) => count(a) !== ref);
}
