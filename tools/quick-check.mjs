// Quick browser check while writing content: opens the app, creates a profile, walks through a station
// (lesson, dictation, words, test) and reports page errors. Usage: node tools/quick-check.mjs [1.1] [--shots]
import { chromium } from "playwright-core";
import { resolve } from "node:path";
import { mkdirSync, existsSync } from "node:fs";

const uid = process.argv.find((a) => /^\d+\.\d+$/.test(a)) || "1.1";
const shots = process.argv.includes("--shots");
mkdirSync("shots", { recursive: true });
const file = resolve("index.html");
const CANDIDATES = [process.env.PW_CHROME, "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Google/Chrome/Application/chrome.exe"].filter(Boolean);
const browser = await chromium.launch({ executablePath: CANDIDATES.find((p) => existsSync(p)) });
const page = await browser.newPage({ viewport: { width: 1000, height: 900 } });
page.setDefaultTimeout(8000);
await page.addInitScript(() => {
  const voices = [{ name: "Mock FR", lang: "fr-FR", voiceURI: "fr", default: true, localService: true }];
  window.__spoken = [];
  Object.defineProperty(window, "speechSynthesis", { value: { getVoices: () => voices, speak(u) { window.__spoken.push(u.text); setTimeout(() => u.onend && u.onend(), 5); }, cancel() {}, addEventListener() {} }, configurable: true });
  window.SpeechSynthesisUtterance = function (t) { this.text = t; };
});
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => m.type() === "error" && !/fonts\.g|ERR_|net::/.test(m.text()) && errors.push(`console: ${m.text()}`));
const shot = async (name) => shots && page.screenshot({ path: `shots/qc-${name}.png`, fullPage: true });

await page.goto(`file:///${file.replace(/\\/g, "/")}`, { waitUntil: "domcontentloaded" });
await page.fill("#player-name", "Testeur");
await page.click(".age-opt[data-age=ado]");
await page.click("text=Monter à bord");
await page.click("text=Je commence au début");
await page.waitForSelector(".map");
await shot("map");
await page.evaluate((u) => {
  // Unlock the station's level for the check.
  const g = JSON.parse(localStorage.getItem("mission-francais:global"));
  const key = `mission-francais:p:${g.activeId}`;
  const s = JSON.parse(localStorage.getItem(key));
  const L = Number(u.split(".")[0]);
  for (let k = 1; k < L; k++) s.bosses[k] = { defeated: true };
  for (let k = 1; k < Number(u.split(".")[1]); k++) s.units[`${L}.${k}`] = { passed: true, stars: 1 };
  localStorage.setItem(key, JSON.stringify(s));
}, uid);
await page.reload({ waitUntil: "domcontentloaded" });
await page.waitForSelector(".map");
await page.click(`.station-btn[aria-label^="${uid} "]`);
await page.waitForSelector(".unit-body");
await shot("lesson");
await page.click(".step[data-step=dictee]");
await page.waitForSelector(".dictee-area");
await page.click("text=2. Dicter");
await page.waitForTimeout(300);
await page.fill(".dictee-area", "Ce matin le petit garcon joue de la gitare pres de la fenêtre.");
await page.click("text=Corriger ma dictée");
await page.waitForSelector(".dictee-mark");
await shot("dictee");
await page.click(".step[data-step=words]");
await page.click("text=Réviser en cartes");
await page.click(".fc");
await page.click("text=Je savais");
await shot("words");
await page.click(".step[data-step=practice]");
await shot("practice");
await page.click(".step[data-step=test]");
await page.click("text=Commencer le test");
await page.click("text=Tenter quand même").catch(() => {});
let answered = 0;
for (let i = 0; i < 15; i++) {
  await page.waitForSelector(".q-mount:not(.answered) .q-card");
  const kind = await page.$eval(".q-card", (el) => el.className);
  if (await page.$(".choice")) await page.click(".choice >> nth=0");
  else if (await page.$(".tile")) {
    await page.click(".tile >> nth=0");
    await page.click(".btn-validate");
  } else if (await page.$(".word-chip")) {
    await page.click(".word-chip >> nth=0");
    if (await page.$(".error-fix:not([hidden]) #answer-input")) {
      await page.fill("#answer-input", "essai");
      await page.click(".error-fix .btn-validate");
    }
  }
  else if (await page.$(".gap-box")) {
    for (const b of await page.$$(".gap-box")) await b.fill("essai");
    await page.click(".btn-validate");
  } else if (await page.$("#answer-input")) {
    await page.fill("#answer-input", "essai");
    await page.click(".btn-validate");
  }
  answered++;
  await page.waitForSelector(".btn-continue");
  if (i === 2) await shot(`q-${kind.replace(/\s+/g, "_")}`);
  await page.click(".btn-continue");
}
await page.waitForSelector(".results");
await shot("results");
console.log(`${answered} questions, erreurs : ${errors.length}`);
errors.forEach((e) => console.log(" ", e));
await browser.close();
process.exitCode = errors.length ? 1 : 0;
