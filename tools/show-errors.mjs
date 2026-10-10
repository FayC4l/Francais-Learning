// Lists every "error" item as « wrong token → fix » to eyeball the wrong indexes. Usage: node tools/show-errors.mjs [files]
import { readFileSync, readdirSync } from "node:fs";
import { frTypo } from "../src/typo.js";
const files = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync("content").filter((f) => /^(level|boss)-\d\d\.json$/.test(f)).map((f) => `content/${f}`);
for (const f of files) {
  const d = JSON.parse(readFileSync(f, "utf8"));
  const items = d.questions || (d.units || []).flatMap((u) => u.grammar || []);
  for (const g of items.filter((x) => x.type === "error")) {
    const t = frTypo(g.q).split(" ");
    console.log(`${f.replace(/.*\//, "")}\t${t[g.wrong]} → ${g.fix.join(" / ")}\t| ${g.q}`);
  }
}
