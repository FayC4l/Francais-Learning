// Downloads the Lexique 3.83 table (CC BY-SA 4.0, www.lexique.org) into vendor/ — about 25 MB, done once.
// tools/make-dict.mjs then derives the compact dictionary data/dict-fr.txt used by the writing corrector.
import { existsSync, mkdirSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "vendor", "Lexique383.tsv");
const URL = "https://www.lexique.org/databases/Lexique383/Lexique383.tsv";

if (existsSync(out) && statSync(out).size > 20_000_000) {
  console.log(`déjà présent : ${out}`);
} else {
  mkdirSync(dirname(out), { recursive: true });
  console.log(`téléchargement de ${URL}…`);
  const res = await fetch(URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(out, buf);
  console.log(`${Math.round(buf.length / 1e6)} Mo écrits dans ${out}`);
}
