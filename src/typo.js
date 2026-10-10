// French typography for the content: a no-break space before ; : ! ? » and after «, applied at build time. Pure.

const NB = " "; // no-break space (narrow spaces are not displayed well by every font)

/** One string: « Bonjour » → « Bonjour », « Vraiment ? » → « Vraiment ? ». */
export function frTypo(s) {
  return String(s)
    .replace(/([«])[   ]*/g, `$1${NB}`)
    .replace(/[   ]*([»])/g, `${NB}$1`)
    .replace(/(\S)[   ]*([;:!?])(?=\s|$|[»"”)\]])/g, (m, a, p) => (/[\d]/.test(a) && p === ":" ? m : `${a}${NB}${p}`))
    .replace(/([;:!?])(?=[A-Za-zÀ-ÿ])/g, "$1 ")
    .replace(/ {2,}/g, " ");
}

/** Every string of a JSON value, recursively (keys are kept). */
export function frTypoDeep(v) {
  if (typeof v === "string") return frTypo(v);
  if (Array.isArray(v)) return v.map(frTypoDeep);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, frTypoDeep(x)]));
  return v;
}
