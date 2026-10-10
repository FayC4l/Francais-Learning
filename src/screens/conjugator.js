// Reference conjugator (like a Bescherelle): any verb, every mood and tense, affirmative / negative / question,
// pronominal form, masculine / feminine agreement, with audio, and a quick drill on the chosen verb.
import { h, icon, toast, shuffle } from "../ui.js";
import { VERBS, verbInfo, TENSES, conjugations, withSubject, nominalForms, groupLabel, personsOf, auxOf, isPronominalInf, stripPron, USUALLY_PRON } from "../engine/conjugue.js";
import { go } from "../router.js";
import { speak } from "../audio.js";
import { runQuiz, scoreOf } from "../runner.js";
import { save, addXp, touchStreak } from "../store.js";
import { mentorSays, quip } from "../humor.js";

const MODES = [
  ["aff", "Affirmatif"], ["neg", "Négatif"], ["q", "Interrogatif"],
];
const MOOD_ORDER = ["indicatif", "conditionnel", "subjonctif", "impératif"];
const WHO = ["je", "tu", "il", "nous", "vous", "ils"];

const pronLabel = (inf) => (/^[aeiouéèêh]/.test(stripPron(inf)) && !verbInfo(inf)?.ha ? `s'${stripPron(inf)}` : `se ${stripPron(inf)}`);
const label = (inf, pron = verbInfo(inf)?.pron || USUALLY_PRON.has(stripPron(inf))) => (pron ? pronLabel(inf) : stripPron(inf));

export function conjugatorScreen(view, { v = "être" } = {}) {
  let current = verbInfo(v) ? stripPron(v) : "être";
  let mode = "aff";
  let fem = false;
  let pron = USUALLY_PRON.has(current) || !!verbInfo(current)?.pron;
  const input = h("input", { class: "field", id: "verb-search", list: "verb-list", placeholder: "Tape un verbe (finir, prendre, s'asseoir…)", autocomplete: "off", "aria-label": "Verbe", value: label(current), lang: "fr" });
  const list = h("datalist", { id: "verb-list" }, VERBS.map((x) => h("option", { value: x.inf })));
  const head = h("div", { class: "conj-head" });
  const table = h("div", { class: "conj-tables" });
  const femBox = h("input", { type: "checkbox", id: "conj-fem" });
  const pronBox = h("input", { type: "checkbox", id: "conj-pron" });
  femBox.addEventListener("change", () => ((fem = femBox.checked), render()));
  pronBox.addEventListener("change", () => ((pron = pronBox.checked), render()));
  const modes = h(
    "div",
    { class: "conj-modes", role: "tablist" },
    MODES.map(([id, text]) => {
      const b = h("button", { type: "button", role: "tab", class: `chip ${id === mode ? "on" : ""}`, "aria-selected": String(id === mode) }, text);
      b.addEventListener("click", () => {
        mode = id;
        modes.querySelectorAll(".chip").forEach((c) => {
          c.classList.toggle("on", c === b);
          c.setAttribute("aria-selected", String(c === b));
        });
        render();
      });
      return b;
    }),
    h("label", { class: "toggle", for: "conj-pron" }, pronBox, h("span", null, "Forme pronominale")),
    h("label", { class: "toggle", for: "conj-fem" }, femBox, h("span", null, "Au féminin")),
  );

  const cell = (text) => {
    const b = h("button", { type: "button", class: "conj-cell" }, text);
    b.addEventListener("click", () => speak(text));
    return b;
  };

  function render() {
    const e = verbInfo(current);
    const forced = !!e.pron;
    pronBox.checked = pron || forced;
    pronBox.disabled = forced;
    femBox.checked = fem;
    const usePron = pron || forced;
    const n = nominalForms(current);
    const aux = auxOf(current, { pron: usePron });
    head.replaceChildren(
      h("h2", { class: "conj-verb" }, label(current, usePron), h("button", { type: "button", class: "icon-btn", "aria-label": `Écouter ${current}`, html: icon("speaker"), onClick: () => speak(`${current}. ${n.participePresent}. ${n.participePasse[0] || ""}`) })),
      h("p", { class: "conj-fr" }, h("span", { class: "tag" }, groupLabel(current)), " ", h("span", { class: "tag ok" }, `auxiliaire ${aux}`), e.both ? h("span", { class: "tag" }, "avoir avec un COD") : null),
      h(
        "div",
        { class: "conj-forms" },
        [["Infinitif", label(current, usePron)], ["Infinitif passé", n.infinitifPasse], ["Participe présent", n.participePresent], ["Participe passé", n.participePasse.filter(Boolean).join(", ")], ["Gérondif", n.gerondif]].map(([k, val]) => h("div", null, h("small", null, k), h("strong", null, val || "—"))),
      ),
    );
    const g = fem ? "f" : "m";
    const sections = [];
    for (const mood of MOOD_ORDER) {
      const tenses = TENSES.filter((t) => t.mode === mood);
      sections.push(h("h3", { class: "conj-mood" }, mood.charAt(0).toUpperCase() + mood.slice(1)));
      for (const t of tenses) {
        const rows = personsOf(t.id).map((p) => {
          const who = fem && (p === 2 || p === 5) ? (p === 2 ? "elle" : "elles") : WHO[p];
          let txt = "";
          if (mode === "q") {
            const f = conjugations(current, t.id, p, { g, pron: usePron, question: true, who })[0];
            txt = f ? `${f.charAt(0).toUpperCase()}${f.slice(1)} ?` : "";
          } else if (t.mode === "impératif") {
            txt = conjugations(current, t.id, p, { g, pron: usePron, neg: mode === "neg" })[0] || "";
          } else {
            txt = withSubject(current, t.id, p, { g, pron: usePron, neg: mode === "neg", who });
          }
          return txt ? h("tr", null, h("td", null, cell(txt))) : null;
        });
        if (!rows.some(Boolean)) continue;
        sections.push(h("section", { class: "conj-table" }, h("h3", null, t.fr, h("small", null, ` · niveau ${t.level}`)), h("table", null, h("tbody", null, rows))));
      }
    }
    table.replaceChildren(...sections);
  }

  const pick = () => {
    const raw = input.value.trim().toLowerCase();
    const val = stripPron(raw);
    if (verbInfo(val)) {
      current = val;
      pron = isPronominalInf(raw) || USUALLY_PRON.has(val) || !!verbInfo(val)?.pron;
      render();
    } else if (val) toast(`« ${val} » n'est pas dans le conjugueur (${VERBS.length} verbes, et tous les verbes réguliers en -er).`);
  };
  input.addEventListener("change", pick);
  input.addEventListener("keydown", (e) => e.key === "Enter" && pick());

  view.append(
    h(
      "div",
      { class: "conjugator" },
      h("div", { class: "topbar" }, h("button", { type: "button", class: "icon-btn", "aria-label": "Retour", html: icon("back"), onClick: () => go("map") }), h("span", { class: "topbar-title" }, "Conjugueur")),
      h("h1", { class: "page-title" }, "Le conjugueur"),
      h("p", { class: "page-lead" }, `${VERBS.length} verbes des trois groupes, dont tous les irréguliers et les défectifs (clore, gésir, choir…), tous les modes et tous les temps. Les accords avec être et les verbes pronominaux sont faits pour toi. Touche une forme pour l'entendre.`),
      h("div", { class: "row conj-search" }, input, list, h("button", { type: "button", class: "btn btn-small", onClick: pick }, "Conjuguer"), h("button", { type: "button", class: "btn btn-small btn-ghost", onClick: () => {
        current = VERBS[Math.floor(Math.random() * VERBS.length)].inf;
        pron = USUALLY_PRON.has(current) || !!verbInfo(current)?.pron;
        input.value = label(current);
        render();
      } }, "Au hasard")),
      head,
      h("button", { type: "button", class: "btn btn-primary", onClick: () => drill(view, current, pron) }, h("span", { html: icon("gauntlet") }), "M'entraîner sur ce verbe (10 questions)"),
      modes,
      table,
    ),
  );
  render();
  return undefined;
}

// A time marker that makes each tense natural in the drill sentences.
const TAIL = { present: " en ce moment", imparfait: " autrefois", passe_simple: " ce jour-là", futur: " demain", passe_compose: " hier", plus_que_parfait: " la veille", passe_anterieur: " ce jour-là", futur_anterieur: " avant ce soir", cond_present: " volontiers", cond_passe: " sans cet orage" };
const SUBJ = ["je", "tu", "il", "elle", "nous", "vous", "ils", "elles"];
const P = { je: 0, tu: 1, il: 2, elle: 2, nous: 3, vous: 4, ils: 5, elles: 5 };

/** 10 fill-in questions on one verb, in random tenses and persons. */
function drill(view, inf, pron) {
  const usePron = pron || !!verbInfo(inf)?.pron;
  const pool = TENSES.filter((t) => t.mode !== "impératif");
  const questions = [];
  for (const t of shuffle(pool)) {
    if (questions.length >= 10) break;
    const s = SUBJ[questions.length % SUBJ.length];
    const p = P[s];
    const g = /^elle/.test(s) ? "f" : s === "il" || s === "ils" ? "m" : null;
    let answers = conjugations(inf, t.id, p, { g, pron: usePron, who: s });
    if (!answers.length) continue;
    const subjunctive = t.mode === "subjonctif";
    let q;
    if (s === "je" && /^[aeiouyéèêh]/i.test(answers[0]) && !(answers[0].startsWith("h") && verbInfo(inf)?.ha)) {
      answers = answers.map((a) => `j'${a}`);
      q = `${subjunctive ? "Il faut que " : ""}___${TAIL[t.id] || ""}.`;
    } else q = `${subjunctive ? `Il faut ${/^[aeiouéè]/.test(s) ? "qu'" : "que "}` : ""}${subjunctive ? s : s.charAt(0).toUpperCase() + s.slice(1)} ___${TAIL[t.id] || ""}.`;
    questions.push({
      kind: "fill",
      ref: null,
      skill: "conjugaison",
      unitId: "0.0",
      level: 0,
      q: q.charAt(0).toUpperCase() + q.slice(1),
      hint: `${label(inf, usePron)} — ${t.fr}`,
      accept: answers,
      expected: answers[0],
      explain: `${t.fr} de ${label(inf, usePron)} : ${answers[0]}.`,
      time: 45,
    });
  }
  const quiz = runQuiz(view, questions, {
    title: `Entraînement : ${label(inf, usePron)}`,
    accent: "var(--l4)",
    onDone: (results, { quit }) => {
      if (quit) return go("conjugator", { v: inf });
      const good = results.filter((r) => r.ok).length;
      addXp(good * 2);
      touchStreak();
      save();
      view.replaceChildren(
        h(
          "div",
          { class: "results" },
          h("h1", { class: "results-title" }, `${good} / ${results.length}`),
          mentorSays(quip(scoreOf(results) >= 0.8 ? "perfect" : "fail")),
          h("div", { class: "result-actions" }, h("button", { type: "button", class: "btn btn-primary btn-xl", onClick: () => drill(view, inf, pron) }, "Encore"), h("button", { type: "button", class: "btn btn-ghost", onClick: () => go("conjugator", { v: inf }) }, "Retour au conjugueur")),
        ),
      );
    },
  });
  return () => quiz.stop();
}
