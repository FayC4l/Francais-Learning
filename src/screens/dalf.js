// DALF preparation (C1-C2): every paper, and mock exams marked out of 100 (4 papers of 25 points).
// All texts are original, written for Mission Français in the format of the exam.
import { h, icon, shuffle, dialog, sleep } from "../ui.js";
import { EXTRA } from "../content.js";
import { state, save, addXp, touchStreak, checkBadges, highestLevelDone } from "../store.js";
import { go } from "../router.js";
import { matches } from "../answer.js";
import { speakParts, stopSpeaking, ttsReady, sfx } from "../audio.js";
import { runQuiz, scoreOf } from "../runner.js";
import { micAvailable, listenOnce } from "../mic.js";
import { confetti } from "../fx.js";
import { mentorSays, quip } from "../humor.js";
import { analyze } from "../writing/analyze.js";
import { score } from "../writing/score.js";
import { countWords } from "../writing/tokenize.js";
import { copiedShare } from "../tower.js";
import { dalfPrompts } from "./writing.js";

const LG = () => EXTRA.dalfLangue || {};
const P = () => EXTRA.dalfPapers || {};
const LETTERS = "ABCDEFGH";
const fmt = (x) => String(Math.round(x * 2) / 2).replace(".", ",");
/** A share of right answers → points out of 25. */
export const on25 = (pct) => Math.round(pct * 25 * 2) / 2;

/** Result of a mock: total /100, pass = 50 (official) or 60 for the Tower; each paper at least 10/25. */
export function mockVerdict(papers, need = 60) {
  const total = Math.round(papers.reduce((s, p) => s + p.points, 0) * 2) / 2;
  const minOk = papers.every((p) => p.points >= 10);
  return { total, pass: total >= need && minOk, minOk };
}

const PARTS = [
  { id: "langue1", group: "L", title: "Maîtrise de la langue · texte à trous", fr: "Choisis le mot juste pour chaque trou : collocations, expressions figées, nuances.", count: () => (LG().part1 || []).length },
  { id: "langue2", group: "L", title: "Maîtrise de la langue · trous libres", fr: "Un seul mot par trou : prépositions, pronoms, connecteurs, mots-outils.", count: () => (LG().part2 || []).length },
  { id: "langue3", group: "L", title: "Maîtrise de la langue · formation des mots", fr: "Forme le mot qui convient à partir du mot en majuscules.", count: () => (LG().part3 || []).length },
  { id: "langue4", group: "L", title: "Maîtrise de la langue · transformations", fr: "Réécris la phrase avec le mot imposé, sans changer le sens.", count: () => (LG().part4 || []).length },
  { id: "ecrits", group: "R", title: "Compréhension des écrits", fr: "Un long texte et des questions d'inférence, de ton et d'opinion.", count: () => (P().comprehensionEcrite || []).length },
  { id: "oral", group: "O", title: "Compréhension de l'oral", fr: "Entretiens, chroniques et débats lus par la voix française (deux écoutes).", count: () => (P().comprehensionOrale || []).length },
  { id: "writing", group: "W", title: "Production écrite", fr: "Synthèse de documents et essai argumenté, corrigés et notés sur 20.", count: () => dalfPrompts().length },
  { id: "parole", group: "S", title: "Production orale", fr: "Exposé à partir d'un document, puis débat : chrono et expressions utiles.", count: () => (P().productionOrale || []).length },
];

export function dalfScreen(view, { tab } = {}) {
  if (tab === "writing") return writingList(view);
  const ready = highestLevelDone() >= 9 || ["C1", "C2"].includes(state.placement?.band);
  const best = (id) => state.c2?.[id]?.best;
  const mock = state.c2?.mock;
  view.append(
    h(
      "div",
      { class: "c2" },
      h("div", { class: "topbar" }, h("button", { type: "button", class: "icon-btn", "aria-label": "Retour", html: icon("back"), onClick: () => go("map") }), h("span", { class: "topbar-title" }, "Prépa DALF")),
      h("h1", { class: "page-title" }, "Prépa DALF C1-C2"),
      h("p", { class: "page-lead" }, "Le DALF (diplôme approfondi de langue française) est le plus haut diplôme de français délivré par le ministère de l'Éducation nationale. Il est noté sur 100 : il faut 50 pour l'obtenir, avec un minimum dans chaque épreuve. Ici, les DALF blancs ont quatre épreuves de 25 points : compréhension de l'oral, compréhension des écrits et maîtrise de la langue, synthèse de documents, essai argumenté."),
      !ready ? mentorSays("Attention, ici c'est la montagne la plus haute. Je te conseille d'avoir fini la ligne 9 avant de grimper… mais tu peux jeter un œil.", "", "warning") : null,
      mock ? h("div", { class: `c2-mock-last ${mock.total >= 60 ? "a" : mock.total >= 50 ? "c" : "no"}` }, h("strong", null, `Dernier DALF blanc : ${fmt(mock.total)}/${mock.max || 100}`), mock.max === 100 || !mock.max ? (mock.total >= 50 ? " · réussi" : " · pas encore") : "") : null,
      h(
        "div",
        { class: "row" },
        h("button", { type: "button", class: "btn btn-primary btn-xl", onClick: () => mockExam(view, "express") }, h("span", { html: icon("clock") }), "DALF blanc express (≈ 50 min)"),
        h("button", { type: "button", class: "btn btn-ghost", onClick: () => mockExam(view, "full") }, "DALF blanc complet (≈ 3 h)"),
      ),
      h("h2", { class: "section-title" }, "S'entraîner épreuve par épreuve"),
      h(
        "div",
        { class: "c2-parts" },
        PARTS.filter((p) => p.count() > 0).map((p) =>
          h(
            "button",
            { type: "button", class: `c2-part paper-${p.group}`, onClick: () => (p.id === "writing" ? go("dalf", { tab: "writing" }) : practice(view, p.id)) },
            h("strong", null, p.title),
            h("small", null, p.fr),
            h("span", { class: "c2-best" }, best(p.id) != null ? `Meilleur : ${Math.round(best(p.id) * 100)} % (≈ ${fmt(on25(best(p.id)))}/25)` : `${p.count()} exercices`),
          ),
        ),
      ),
      h("p", { class: "set-help" }, "Tous les textes sont originaux, écrits pour Mission Français au format de l'examen. Les notes sont des estimations pour te situer, pas un résultat officiel."),
    ),
  );
  return undefined;
}

function writingList(view) {
  const tasks = dalfPrompts();
  view.append(
    h(
      "div",
      { class: "c2" },
      h("div", { class: "topbar" }, h("button", { type: "button", class: "icon-btn", "aria-label": "Retour", html: icon("back"), onClick: () => go("dalf") }), h("span", { class: "topbar-title" }, "DALF · Production écrite")),
      h("h1", { class: "page-title" }, "Production écrite"),
      h("p", { class: "page-lead" }, "La synthèse : un texte objectif qui confronte les documents, sans ton avis, sans recopier (≈ 220 mots). L'essai argumenté : ton point de vue, structuré et nuancé (≈ 250 à 300 mots). Ta copie est corrigée et notée sur 20."),
      h("div", { class: "w-grid" }, tasks.map((t) => h("button", { type: "button", class: "w-card", onClick: () => go("writing", { promptId: t.id }) }, h("span", { class: "tag" }, t.type === "synthese" ? "Synthèse" : "Essai"), h("strong", null, t.title), h("small", null, `${t.words[0]}–${t.words[1]} mots`)))),
    ),
  );
  return undefined;
}

/** Records a practice score and gives XP. */
function record(id, pct) {
  const c = (state.c2[id] ||= { best: 0, attempts: 0 });
  c.best = Math.max(c.best || 0, pct);
  c.attempts++;
  addXp(Math.round(pct * 40));
  touchStreak();
  save();
}

// ---------- One exercise of a part ----------

function practice(view, partId, { set, onDone, onQuit } = {}) {
  const pools = { langue1: LG().part1, langue2: LG().part2, langue3: LG().part3, ecrits: P().comprehensionEcrite, oral: P().comprehensionOrale, parole: P().productionOrale };
  const done = state.c2?.[`seen-${partId}`] || [];
  const pick = (arr) => set || arr.find((x) => !done.includes(x.id)) || shuffle(arr)[0];
  const finish = (pct, item) => {
    if (item) state.c2[`seen-${partId}`] = [...done.filter((x) => x !== item.id), item.id].slice(-50);
    record(partId, pct);
    checkBadges();
    if (onDone) return onDone(pct);
    resultPanel(view, partId, pct);
  };
  if (partId === "langue4") return transformations(view, finish, onDone, onQuit);
  const item = pick(pools[partId] || []);
  if (!item) return go("dalf");
  // In a mock exam a text counts as seen as soon as it is shown: quitting will not bring it back.
  if (onDone) state.c2[`seen-${partId}`] = [...done.filter((x) => x !== item.id), item.id].slice(-50);
  if (__MB_TEST__) window.__mbItem = { partId, item };
  const shell = (title, sub, ...body) => {
    view.replaceChildren(
      h(
        "div",
        { class: "c2 c2-ex" },
        h("div", { class: "topbar" }, h("button", { type: "button", class: "icon-btn", "aria-label": "Quitter", html: icon("close"), onClick: () => (stopSpeaking(), onDone ? confirmQuit(view, onQuit) : go("dalf")) }), h("span", { class: "topbar-title" }, PARTS.find((p) => p.id === partId).title)),
        h("h1", { class: "c2-title" }, title),
        sub ? h("p", { class: "set-help" }, sub) : null,
        ...body,
      ),
    );
    window.scrollTo({ top: 0 });
  };
  if (["langue1", "langue2", "langue3"].includes(partId)) return gapped(item, partId, shell, finish);
  if (partId === "ecrits") return mcText(item, shell, finish);
  if (partId === "oral") return listening(item, shell, finish);
  if (partId === "parole") return speaking(item, shell, finish);
  return undefined;
}

async function confirmQuit(view, onQuit) {
  const body = onQuit ? "<p><strong>C'est le boss final de la tour : abandonner = perdre un cœur.</strong></p>" : "<p>Ta progression dans ce DALF blanc sera perdue.</p>";
  const ok = await dialog({ title: "Quitter le DALF blanc ?", body, actions: [{ label: "Continuer", value: false, primary: true }, { label: "Quitter", value: true, danger: true }] });
  if (ok) (onQuit ? onQuit() : go("dalf"));
}

const submitBtn = (label = "Corriger") => h("button", { type: "button", class: "btn btn-primary btn-xl" }, label);
const explainEl = (ok, txt) => h("div", { class: `c2-explain ${ok ? "ok" : "ko"}` }, txt);
const continueBtn = (fn) => h("button", { type: "button", class: "btn btn-primary btn-xl c2-continue", onClick: fn }, "Continuer");

/** Language parts 1-3: a text with 8 numbered gaps. */
function gapped(item, partId, shell, finish) {
  const controls = [];
  const html = item.text.split(/\{(\d)\}/);
  const textEl = h("div", { class: "c2-text" });
  html.forEach((chunk, i) => {
    if (i % 2 === 0) {
      textEl.append(...chunk.split(/\n\n/).flatMap((para, k) => (k ? [h("br"), h("br"), para] : [para])));
      return;
    }
    const n = Number(chunk);
    const g = item.gaps[n - 1];
    let ctl;
    if (partId === "langue1") ctl = h("select", { class: "c2-select", "aria-label": `Trou ${n}` }, h("option", { value: "" }, `(${n})`), g.choices.map((c, k) => h("option", { value: k }, `${LETTERS[k]} ${c}`)));
    else ctl = h("input", { class: "c2-input", type: "text", autocomplete: "off", spellcheck: "false", autocapitalize: "off", lang: "fr", "aria-label": `Trou ${n}`, placeholder: `(${n})`, size: 10 });
    controls[n - 1] = ctl;
    textEl.append(h("span", { class: "c2-gap" }, h("sup", null, n), ctl, partId === "langue3" ? h("span", { class: "c2-stem" }, g.stem) : null));
  });
  const go2 = submitBtn();
  const out = h("div");
  go2.addEventListener("click", () => {
    let good = 0;
    const rows = item.gaps.map((g, i) => {
      const v = controls[i].value;
      const ok = partId === "langue1" ? Number(v) === g.answer && v !== "" : matches(v, g.answer);
      if (ok) good++;
      controls[i].classList.add(ok ? "ok" : "ko");
      controls[i].disabled = true;
      const right = partId === "langue1" ? g.choices[g.answer] : g.answer.join(" / ");
      return explainEl(ok, h("span", null, h("strong", null, `(${i + 1}) ${right}`), ` — ${g.explain}`));
    });
    go2.remove();
    const pct = good / item.gaps.length;
    out.replaceChildren(h("p", { class: "c2-score" }, `${good} / ${item.gaps.length}`), ...rows, continueBtn(() => finish(pct, item)));
    sfx[pct >= 0.6 ? "win" : "lose"]();
  });
  shell(item.title, partId === "langue1" ? "Choisis le mot qui convient pour chaque trou." : partId === "langue2" ? "Écris UN seul mot par trou." : "Écris la bonne forme du mot en majuscules (un seul mot).", textEl, go2, out);
}

/** Language part 4: rewrite the sentence with the imposed word (normal quiz runner, one box per word). */
function transformations(view, finish, inMock, onQuit) {
  const all = LG().part4 || [];
  const seen = new Set(state.c2?.["seen-langue4"] || []);
  const fresh = all.filter((t) => !seen.has(t.id));
  const chosen = shuffle(fresh.length >= 6 ? fresh : all).slice(0, 6);
  const questions = chosen.map((t) => ({ kind: "fill", ref: null, skill: "grammaire", unitId: "12.0", level: 12, q: t.q, lead: t.lead, key: t.key, accept: t.answer, expected: t.answer[0], explain: t.explain, time: 150 }));
  if (inMock) state.c2["seen-langue4"] = [...seen, ...chosen.map((t) => t.id)].slice(-60);
  const quiz = runQuiz(view, questions, {
    title: "Transformations",
    accent: "var(--l12)",
    quitBody: onQuit ? "<p><strong>C'est le boss final de la tour : abandonner = perdre un cœur.</strong></p>" : undefined,
    onDone: (results, { quit }) => {
      if (quit) return onQuit ? onQuit() : go("dalf");
      state.c2["seen-langue4"] = [...seen, ...chosen.map((t) => t.id)].slice(-60);
      finish(scoreOf(results));
    },
  });
  return () => quiz.stop();
}

/** Reading: a long text and multiple-choice questions. */
function mcText(item, shell, finish) {
  const qs = item.questions.map((q, i) => mcBlock(q, i));
  const go2 = submitBtn();
  go2.addEventListener("click", () => {
    const good = qs.filter((b) => b.check()).length;
    go2.replaceWith(h("p", { class: "c2-score" }, `${good} / ${qs.length}`), continueBtn(() => finish(good / qs.length, item)));
  });
  shell(item.title, item.source ? `Lis le texte (${item.source}), puis réponds aux questions.` : "Lis le texte, puis réponds aux questions.", h("div", { class: "c2-text long" }, item.text.split(/\n\n/).map((p) => h("p", null, p))), ...qs.map((b) => b.el), go2);
}

function mcBlock(q, i) {
  const name = `q${i}-${Math.random().toString(36).slice(2, 6)}`;
  const opts = q.choices.map((c, k) => h("label", { class: "c2-opt" }, h("input", { type: "radio", name, value: k }), h("span", null, `${LETTERS[k]}. ${c}`)));
  const exp = h("div");
  const el = h("fieldset", { class: "c2-q" }, h("legend", null, `${i + 1}. ${q.q}`), opts, exp);
  return {
    el,
    check() {
      const v = el.querySelector("input:checked")?.value;
      const ok = Number(v) === q.answer && v != null;
      opts.forEach((o, k) => {
        o.querySelector("input").disabled = true;
        if (k === q.answer) o.classList.add("right");
        else if (String(k) === v) o.classList.add("wrong");
      });
      exp.replaceChildren(explainEl(ok, q.explain || ""));
      return ok;
    },
  };
}

/** Listening: the recording is read twice at most (as in the exam), then questions. */
function listening(item, shell, finish) {
  let plays = 0;
  const playBtn = h("button", { type: "button", class: "btn btn-primary" }, h("span", { html: icon("speaker") }), "Écouter le document (2 écoutes)");
  const status = h("span", { class: "set-help" });
  playBtn.addEventListener("click", async () => {
    if (plays >= 2) return;
    plays++;
    playBtn.disabled = true;
    status.textContent = `Écoute ${plays} / 2…`;
    await speakParts(item.lines.map((l) => ({ text: l.text, lang: "fr", pause: 400 })));
    status.textContent = plays >= 2 ? "Plus d'écoute disponible." : "Tu peux réécouter une fois.";
    playBtn.disabled = plays >= 2;
  });
  const qs = item.questions.map((q, i) => mcBlock(q, i));
  const go2 = submitBtn();
  const transcript = () => h("div", { class: "w-model-text" }, item.lines.map((l) => h("p", null, l.who ? h("strong", null, `${l.who} : `) : null, l.text)));
  go2.addEventListener("click", () => {
    stopSpeaking();
    const good = qs.filter((b) => b.check()).length;
    go2.replaceWith(h("p", { class: "c2-score" }, `${good} / ${qs.length}`), h("details", { class: "w-model" }, h("summary", null, "Lire la transcription"), transcript()), continueBtn(() => finish(good / qs.length, item)));
  });
  if (!ttsReady()) return shell(item.title, "Ton appareil n'a pas de voix française : voici la transcription à lire (une seule fois !).", h("div", { class: "c2-text" }, transcript()), ...qs.map((b) => b.el), go2);
  shell(item.title, `${item.kind ? `${item.kind}. ` : ""}Lis d'abord les questions, puis écoute.`, h("div", { class: "row" }, playBtn, status), ...qs.map((b) => b.el), go2);
}

/** Speaking: the document, a preparation time, the talk, an optional transcript and a self-assessment. */
function speaking(item, shell, finish) {
  const timer = h("div", { class: "c2-timer" }, "10:00");
  let t = 600;
  let iv = null;
  const start = h("button", { type: "button", class: "btn btn-primary" }, h("span", { html: icon("clock") }), "Démarrer : 10 minutes d'exposé");
  start.addEventListener("click", () => {
    clearInterval(iv);
    t = 600;
    iv = setInterval(() => {
      t--;
      timer.textContent = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
      if (t <= 0) {
        clearInterval(iv);
        sfx.level();
      }
    }, 1000);
  });
  const transcript = h("p", { class: "set-help" });
  const micBtn = h("button", { type: "button", class: "btn btn-ghost", hidden: true }, h("span", { html: icon("mic") }), "Transcrire une phrase");
  micAvailable().then((ok) => (micBtn.hidden = !ok));
  micBtn.addEventListener("click", async () => {
    transcript.textContent = "Je t'écoute…";
    try {
      const alts = await listenOnce({ timeout: 12000 });
      transcript.textContent = `J'ai compris : « ${alts[0] || "?"} ». Si c'est bien ce que tu voulais dire, ton élocution est claire !`;
    } catch (e) {
      transcript.textContent = e.message;
    }
  });
  const checks = ["J'ai présenté le document et sa problématique en introduction.", "J'ai annoncé un plan et je l'ai suivi.", "J'ai défendu un point de vue avec des arguments et des exemples précis.", "J'ai employé au moins trois expressions utiles et un registre soutenu.", "J'ai conclu en ouvrant le débat.", "J'ai parlé toute la durée sans lire mes notes."];
  const boxes = checks.map((c, i) => h("label", { class: "check" }, h("input", { type: "checkbox", id: `sp-${i}` }), h("span", null, c)));
  const done = h("button", { type: "button", class: "btn btn-go" }, "Terminé");
  done.addEventListener("click", () => {
    clearInterval(iv);
    finish(boxes.filter((b) => b.querySelector("input").checked).length / checks.length, item);
  });
  shell(
    item.title,
    "Lis le document, prépare-toi (note un plan, pas un texte rédigé), puis présente ton point de vue à voix haute pendant 10 minutes. Enregistre-toi pour te réécouter : c'est l'exercice le plus efficace.",
    h("div", { class: "c2-speak" }, item.document ? h("blockquote", null, item.document) : null, h("p", { class: "c2-speak-prompt" }, item.consigne), item.followups?.length ? h("ul", null, item.followups.map((f) => h("li", null, f))) : null),
    h("h2", { class: "section-title" }, "Expressions utiles"),
    h("ul", { class: "w-list good" }, (item.useful || []).map((u) => h("li", null, u))),
    h("div", { class: "row" }, start, timer, micBtn),
    transcript,
    h("h2", { class: "section-title" }, "Auto-évaluation"),
    ...boxes,
    done,
  );
}

function resultPanel(view, partId, pct) {
  view.replaceChildren(
    h(
      "div",
      { class: "results" },
      h("p", { class: "eyebrow" }, PARTS.find((p) => p.id === partId)?.title || "DALF"),
      h("h1", { class: "results-title" }, `${Math.round(pct * 100)} %`),
      h("p", { class: "results-line" }, `Sur cette épreuve, c'est l'équivalent d'environ ${fmt(on25(pct))}/25 au DALF.`),
      mentorSays(quip(pct >= 0.75 ? "perfect" : pct >= 0.5 ? "correct" : "fail")),
      h("div", { class: "result-actions" }, h("button", { type: "button", class: "btn btn-primary btn-xl", onClick: () => practice(view, partId) }, "Un autre exercice"), h("button", { type: "button", class: "btn btn-ghost", onClick: () => go("dalf") }, "Retour à la prépa DALF")),
    ),
  );
  if (pct >= 0.75) confetti({ count: 70 });
}

// ---------- Writing inside a mock exam ----------

/** A writing paper of the mock: the task, a text box, then the mark out of 20 → points out of 25. */
function mockWriting(view, type, { onDone, onQuit }) {
  const pool = dalfPrompts().filter((p) => p.type === type);
  const seenKey = `seen-${type}`;
  const seen = state.c2[seenKey] || [];
  const p = pool.find((x) => !seen.includes(x.id)) || shuffle(pool)[0];
  if (!p) return onDone({ mark: 0, words: 0 });
  state.c2[seenKey] = [...seen.filter((x) => x !== p.id), p.id].slice(-30);
  save();
  const area = h("textarea", { class: "field w-area", rows: 14, spellcheck: "false", lang: "fr", placeholder: "Écris ta copie ici…", "aria-label": "Ta copie" });
  const counter = h("span", { class: "w-count" });
  const update = () => {
    const n = countWords(area.value);
    counter.textContent = `${n} mot${n > 1 ? "s" : ""} · attendu ${p.words[0]}–${p.words[1]}`;
    counter.className = `w-count ${n < p.words[0] ? "low" : n > p.words[1] * 1.1 ? "high" : "ok"}`;
  };
  area.addEventListener("input", update);
  update();
  const submit = h("button", { type: "button", class: "btn btn-primary btn-xl" }, "Rendre ma copie");
  submit.addEventListener("click", async () => {
    if (countWords(area.value) < 40) {
      const ok = await dialog({ title: "Rendre une copie aussi courte ?", body: "<p>Ta copie fait moins de 40 mots : elle sera notée très bas.</p>", actions: [{ label: "Continuer à écrire", value: false, primary: true }, { label: "Rendre quand même", value: true }] });
      if (!ok) return;
    }
    const a = analyze(area.value, p);
    const s = score(a, p);
    let mark = s.total;
    const docs = (p.texts || []).map((t) => (typeof t === "string" ? t : t.text)).join(" ");
    if (docs && copiedShare(area.value, docs) > 0.2) mark = Math.max(0, mark - 3);
    state.writing.push({ id: Date.now().toString(36), promptId: p.id, title: p.title, type: p.type, level: 12, text: area.value, score: mark, criteria: s.criteria, band: s.textBand, at: new Date().toISOString(), c2: true });
    save();
    onDone({ mark, words: a.words });
  });
  view.replaceChildren(
    h(
      "div",
      { class: "writing" },
      h("div", { class: "topbar" }, h("button", { type: "button", class: "icon-btn", "aria-label": "Quitter", html: icon("close"), onClick: () => confirmQuit(view, onQuit) }), h("span", { class: "topbar-title" }, type === "synthese" ? "DALF blanc · Synthèse" : "DALF blanc · Essai argumenté")),
      h(
        "section",
        { class: "w-prompt" },
        h("h2", null, p.title),
        h("p", null, p.prompt),
        p.texts?.length ? h("div", { class: "w-texts" }, p.texts.map((t, i) => h("blockquote", null, h("strong", null, `Document ${i + 1} : ${t.title || ""}`), ...String(t.text || t).split(/\n\n+/).map((x) => h("p", null, x))))) : null,
      ),
      area,
      h("div", { class: "row w-actions" }, counter, submit),
    ),
  );
  window.scrollTo({ top: 0 });
  return undefined;
}

// ---------- Mock exams ----------

const PLANS = {
  // Comprehension only, about 50 minutes: listening /25, reading + language /25.
  express: [["oral", "O"], ["ecrits", "R"], ["langue1", "R"], ["langue4", "R"]],
  // The whole exam, about 3 hours: listening, reading + language, synthesis, essay.
  full: [["oral", "O"], ["oral", "O"], ["ecrits", "R"], ["langue1", "R"], ["langue2", "R"], ["langue4", "R"], ["synthese", "S"], ["essai", "E"]],
};
const PAPER_NAME = { O: "Compréhension de l'oral", R: "Compréhension des écrits et maîtrise de la langue", S: "Production écrite : synthèse", E: "Production écrite : essai argumenté" };

/** Runs the steps of a plan one after the other; calls back with the points of each paper. */
function runMock(view, plan, { onFinish, onQuit }) {
  const results = [];
  const next = (i) => {
    if (i >= plan.length) {
      const groups = [...new Set(plan.map(([, g]) => g))];
      const papers = groups.map((g) => {
        const rs = results.filter((r) => r.g === g);
        const pct = rs.reduce((s, r) => s + r.pct, 0) / rs.length;
        return { g, name: PAPER_NAME[g], pct, points: on25(pct) };
      });
      return onFinish(papers);
    }
    const [part, g] = plan[i];
    if (part === "synthese" || part === "essai") return mockWriting(view, part, { onDone: ({ mark }) => (results.push({ g, pct: mark / 20 }), next(i + 1)), onQuit });
    practice(view, part, { onDone: (pct) => (results.push({ g, pct }), next(i + 1)), onQuit });
  };
  next(0);
}

async function mockExam(view, kind) {
  const ok = await dialog({
    title: kind === "full" ? "DALF blanc complet" : "DALF blanc express",
    body:
      kind === "full"
        ? "<p>Quatre épreuves à la suite : compréhension de l'oral (deux documents), compréhension des écrits et maîtrise de la langue, synthèse de documents, essai argumenté. Environ trois heures : prends de quoi boire et coupe les notifications.</p>"
        : "<p>Les épreuves de compréhension : un document oral, un texte, un texte à trous et des transformations. Environ cinquante minutes.</p>",
    actions: [{ label: "Plus tard", value: false }, { label: "Commencer", value: true, primary: true }],
  });
  if (!ok) return;
  runMock(view, PLANS[kind], { onFinish: (papers) => mockResult(view, kind, papers), onQuit: () => go("dalf") });
}

/** The final boss of the Tower: the full mock exam, then `onFinish({ total, pass, papers })`. */
export function towerFinal(view, onFinish, onQuit) {
  runMock(view, PLANS.full, {
    onFinish: (papers) => {
      const v = mockVerdict(papers, 60);
      state.c2.mock = { total: v.total, max: 100, kind: "full", at: new Date().toISOString(), papers: papers.map((p) => ({ name: p.name, points: p.points })) };
      addXp(300);
      save();
      onFinish({ ...v, papers });
    },
    onQuit,
  });
}

async function mockResult(view, kind, papers) {
  const max = papers.length * 25;
  const v = mockVerdict(papers, 50);
  const total = v.total;
  state.c2.mock = { total, max, kind, at: new Date().toISOString(), papers: papers.map((p) => ({ name: p.name, points: p.points })) };
  addXp(kind === "full" ? 300 : 150);
  touchStreak();
  save();
  const badges = checkBadges();
  const passed = kind === "full" ? v.pass : total >= max / 2 && v.minOk;
  view.replaceChildren(
    h(
      "div",
      { class: "results c2-result" },
      h("p", { class: "eyebrow" }, kind === "full" ? "DALF blanc complet" : "DALF blanc express"),
      h("div", { class: `c2-scale ${passed ? "a" : "no"}` }, h("strong", null, fmt(total)), h("small", null, `sur ${max}`)),
      h("h1", { class: "results-title" }, passed ? "Réussi !" : "Pas encore"),
      h("ul", { class: "history" }, papers.map((p) => h("li", null, h("strong", null, `${fmt(p.points)}/25`), ` · ${p.name} (${Math.round(p.pct * 100)} %)`))),
      h("p", { class: "set-help" }, kind === "full" ? "Au vrai DALF, il faut 50/100 et un minimum dans chaque épreuve. Chikh Faycal, lui, exige 60 au sommet de sa tour." : "Le DALF blanc complet ajoute la synthèse et l'essai."),
      mentorSays(passed ? "Chapeau bas, et barbe aussi. Inscris-toi à la vraie session, tu es prêt(e)." : total >= max * 0.4 ? "Solide. Encore un effort sur l'épreuve la plus faible et c'est dans la poche." : "La montagne est haute, mais tu grimpes. Reprends les épreuves une par une."),
      badges.length ? h("div", { class: "new-badges" }, badges.map((b) => h("div", { class: "badge-pop" }, h("span", { html: icon("trophy") }), h("strong", null, b.name), h("small", null, b.desc)))) : null,
      h("div", { class: "result-actions" }, h("button", { type: "button", class: "btn btn-primary btn-xl", onClick: () => go("dalf") }, "Retour à la prépa DALF")),
    ),
  );
  await sleep(200);
  if (passed) {
    sfx.win();
    confetti({ count: 160 });
  }
}
