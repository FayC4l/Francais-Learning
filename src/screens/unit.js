// A station, as a guided path: 1 Leçon → 2 Dictée → 3 Mots → 4 Pratique → 5 Test.
import { h, icon, rich, esc, shuffle, toast, dialog, sleep } from "../ui.js";
import { unitById, levelById, vocabRefs } from "../content.js";
import { addCards } from "../srs.js";
import { quickCheck } from "./writing.js";
import { state, save, unitState, diff, unitUnlocked, STEPS, stepDone, markStep, missingPrep, pathOf, PRACTICE_GOAL, addXp, touchStreak, checkBadges } from "../store.js";
import { go } from "../router.js";
import { speak, speakParts, mixedParts, stopSpeaking, ttsReady, dictationGroups, sfx } from "../audio.js";
import { compareDictation, dictationMark } from "../answer.js";
import { GAMES } from "../games/index.js";
import { starsHtml } from "./home.js";
import { confetti, floatText } from "../fx.js";
import { mentorSays, quip } from "../humor.js";

export function unitScreen(view, { uid, tab }) {
  const unit = unitById(uid);
  const L = Number(uid.split(".")[0]);
  const U = Number(uid.split(".")[1]);
  const lvl = levelById(L);
  if (!unit || !unitUnlocked(L, U)) {
    go("map");
    return;
  }
  // Open on the first unfinished step, so the learner always knows what to do next.
  const firstOpen = STEPS.find((s) => !stepDone(uid, s.id))?.id || "practice";
  let current = tab || firstOpen;
  state.lessons[uid] = 1;
  save();

  const style = { "--line": `var(--l${L})`, "--line-ink": `var(--l${L}-ink)` };
  const body = h("div", { class: "unit-body" });
  const steps = h("nav", { class: "steps", "aria-label": "Étapes de la station" });
  const renderSteps = () => {
    steps.replaceChildren(
      ...STEPS.map((s, i) =>
        h(
          "button",
          { type: "button", class: `step ${stepDone(uid, s.id) ? "done" : ""} ${s.id === current ? "now" : ""}`, "data-step": s.id, "aria-current": s.id === current ? "step" : null },
          h("span", { class: "step-dot" }, stepDone(uid, s.id) ? h("span", { html: icon("check") }) : String(i + 1)),
          h("span", { class: "step-label" }, s.short),
        ),
      ),
    );
  };
  const st = unitState(uid);
  view.append(
    h(
      "div",
      { class: "unit", style },
      h(
        "div",
        { class: "topbar" },
        // The stations of level 12 open from the Tower: going back returns there.
        L === 12
          ? h("button", { type: "button", class: "icon-btn", "aria-label": "Retour à la tour", html: icon("back"), onClick: () => go("tower") })
          : h("button", { type: "button", class: "icon-btn", "aria-label": "Retour au réseau", html: icon("back"), onClick: () => go("map") }),
        h("span", { class: "bullet sm" }, L),
        h("span", { class: "topbar-title" }, `Ligne ${L} · ${lvl.title}`),
      ),
      h(
        "header",
        { class: "unit-hero" },
        h("span", { class: "unit-id" }, `Station ${uid}`),
        h("h1", { class: "unit-name" }, unit.name),
        h("p", { class: "unit-fr" }, unit.title),
        h("p", { class: "unit-goal" }, unit.goal),
        st.redo ? h("p", { class: "redo-banner" }, h("strong", null, "À refaire. "), "Le boss t'a pris tes vies : réussis à nouveau le test de cette station (étape 5) pour les récupérer.") : null,
        st.passed ? h("div", { class: "unit-stars", html: starsHtml(st.stars || 0) }) : null,
      ),
      steps,
      body,
    ),
  );

  let cleanup = null;
  const show = (id, { scroll = false } = {}) => {
    cleanup?.();
    cleanup = null;
    stopSpeaking();
    current = id;
    renderSteps();
    body.replaceChildren();
    body.className = `unit-body body-${id}`;
    const next = (from) => {
      markStep(uid, from);
      // Studied words join the spaced-repetition deck.
      if (from === "words") {
        addCards(state.srs, vocabRefs(unit));
        save();
      }
      const i = STEPS.findIndex((s) => s.id === from);
      show(STEPS[i + 1].id, { scroll: true });
    };
    if (id === "lesson") cleanup = lessonStep(body, unit, () => next("lesson"));
    if (id === "dictee") cleanup = dicteeStep(body, unit, () => next("dictee"), renderSteps);
    if (id === "words") cleanup = wordsStep(body, unit, () => next("words"));
    if (id === "practice") cleanup = practiceStep(body, unit, renderSteps);
    if (id === "test") testStep(body, unit);
    if (scroll) steps.scrollIntoView({ block: "start", behavior: "smooth" });
  };
  steps.addEventListener("click", (e) => {
    const b = e.target.closest(".step");
    if (b) {
      sfx.tap();
      show(b.dataset.step);
    }
  });
  view.addEventListener("click", (e) => {
    const chip = e.target.closest(".say-chip");
    if (chip) speak(chip.dataset.say, { rate: 0.9 });
  });
  show(current);
  return () => cleanup?.();
}

/** Appends children, skipping the optional ones left empty (the DOM would print them as "null"). */
const put = (el, ...xs) => el.append(...xs.flat().filter((x) => x != null && x !== false));
const putIn = (el, ...xs) => el.replaceChildren(...xs.flat().filter((x) => x != null && x !== false));

const stepHead = (n, title, sub) => h("div", { class: "step-head" }, h("span", { class: "step-num" }, `Étape ${n} sur 5`), h("h2", { class: "step-title" }, title), sub ? h("p", { class: "step-sub" }, sub) : null);

// ---------- 1. Lesson ----------

function lessonStep(body, unit, onDone) {
  const blocks = [];
  const narrate = h("button", { type: "button", class: "btn btn-small coach-btn" }, h("span", { html: icon("speaker") }), "Écouter la leçon");
  if (!ttsReady()) narrate.hidden = true;
  body.append(stepHead(1, "La leçon", "Lis tranquillement. Touche les exemples soulignés pour les entendre."), narrate);
  for (const b of unit.lesson) {
    let el = null;
    let parts = [];
    switch (b.type) {
      case "p":
        el = h("p", { class: "l-p", html: rich(b.text) });
        parts = mixedParts(b.text);
        break;
      case "rule":
        el = h("div", { class: "l-rule" }, h("div", { class: "l-rule-title" }, b.title), h("p", { html: rich(b.text) }));
        parts = [...mixedParts(`${b.title}.`), ...mixedParts(b.text)];
        break;
      case "tip":
        el = h("div", { class: "l-tip" }, h("div", { class: "l-tip-title" }, b.title || "Piège à éviter"), h("p", { html: rich(b.text) }));
        parts = [{ text: "Attention, piège !", lang: "fr" }, ...mixedParts(b.text)];
        break;
      case "fun":
        el = h("div", { class: "l-fun" }, h("p", { html: rich(b.text) }));
        parts = mixedParts(b.text);
        break;
      case "table":
        el = h(
          "div",
          { class: "l-table-wrap" },
          h("table", { class: "l-table" }, h("thead", null, h("tr", null, b.head.map((c) => h("th", { html: rich(c) })))), h("tbody", null, b.rows.map((r) => h("tr", null, r.map((c) => h("td", { html: rich(c) })))))),
        );
        break;
      case "examples":
        el = h(
          "ul",
          { class: "l-examples" },
          b.items.map((it) => h("li", null, h("button", { type: "button", class: "ex-play", "aria-label": `Écouter : ${it.ex}`, html: icon("speaker"), onClick: () => speak(it.ex, { rate: 0.9 }) }), h("div", null, h("div", { class: "ex-en", html: rich(it.ex) }), it.note ? h("div", { class: "ex-fr", html: rich(it.note) }) : null))),
        );
        parts = b.items.flatMap((it) => [{ text: it.ex.replace(/\*\*/g, ""), lang: "fr", rate: 0.9, pause: 300 }]);
        break;
      case "compare":
        el = h(
          "div",
          { class: "l-compare" },
          b.title ? h("div", { class: "l-rule-title" }, b.title) : null,
          b.items.map((it) =>
            h(
              "div",
              { class: "cmp-row" },
              h("div", { class: "cmp-ko" }, h("span", { class: "cmp-tag" }, "Non"), h("span", { html: rich(it.ko) })),
              h("div", { class: "cmp-ok" }, h("span", { class: "cmp-tag" }, "Oui"), h("span", { html: rich(it.ok) })),
              it.why ? h("p", { class: "cmp-why", html: rich(it.why) }) : null,
            ),
          ),
        );
        parts = b.items.flatMap((it) => [{ text: `On écrit : ${it.ok.replace(/\*\*/g, "")}`, lang: "fr", pause: 200 }, ...(it.why ? mixedParts(it.why) : [])]);
        break;
      case "texte": {
        const play = h("button", { type: "button", class: "btn btn-small" }, h("span", { html: icon("play") }), "Écouter le texte");
        play.addEventListener("click", () => speak(b.text));
        el = h("div", { class: "l-texte" }, h("div", { class: "l-dialogue-head" }, h("div", null, h("div", { class: "l-dialogue-kicker" }, "Texte"), h("div", { class: "l-dialogue-title" }, b.title || "")), ttsReady() ? play : null), b.text.split(/\n\n+/).map((p) => h("p", { html: rich(p) })));
        break;
      }
    }
    if (el) {
      body.append(el);
      blocks.push({ el, parts });
    }
  }
  let playing = false;
  narrate.addEventListener("click", async () => {
    if (playing) {
      stopSpeaking();
      return;
    }
    playing = true;
    narrate.classList.add("on");
    narrate.lastChild.textContent = "Arrêter la lecture";
    const all = [];
    const owner = [];
    blocks.forEach((b, i) =>
      b.parts.forEach((p) => {
        all.push(p);
        owner.push(i);
      }),
    );
    let lastBlock = -1;
    await speakParts(all, {
      onPart: (k) => {
        const bi = owner[k];
        if (bi === lastBlock) return;
        lastBlock = bi;
        blocks.forEach((b, i) => b.el.classList.toggle("reading", i === bi));
        blocks[bi]?.el.scrollIntoView({ block: "center", behavior: "smooth" });
      },
    });
    blocks.forEach((b) => b.el.classList.remove("reading"));
    playing = false;
    narrate.classList.remove("on");
    narrate.lastChild.textContent = "Écouter la leçon";
  });
  body.append(h("div", { class: "step-end" }, h("p", null, "Tu as tout lu ? Place à la dictée de la station."), h("button", { type: "button", class: "btn btn-primary btn-xl", onClick: onDone }, "J'ai compris, étape suivante")));
  return () => stopSpeaking();
}

// ---------- 2. Dictation ----------

/**
 * The dictation of the station: the voice reads the whole text, dictates it group by group with the punctuation
 * said aloud, then reads it again for the final check. Correction word by word, mark out of 20.
 * Without a French voice: the text is shown for a while, then hidden (copie différée).
 */
function dicteeStep(body, unit, onDone, refreshSteps) {
  const d = unit.dictee;
  if (!d) {
    body.append(stepHead(2, "Dictée", "La dictée de cette station arrive bientôt."), h("div", { class: "step-end" }, h("button", { type: "button", class: "btn btn-primary", onClick: onDone }, "Étape suivante")));
    return null;
  }
  let alive = true;
  let run = 0;
  const groups = dictationGroups(d.texte);
  const area = h("textarea", { class: "field dictee-area", id: "dictee-text", rows: 8, spellcheck: "false", autocorrect: "off", autocapitalize: "sentences", lang: "fr", placeholder: "Écris le texte ici, avec la ponctuation et les majuscules…", "aria-label": "Ta dictée" });
  const status = h("p", { class: "dictee-status", "aria-live": "polite" });
  const best = state.dictees?.[unit.id];
  const btn = (label, ic, fn, cls = "btn-small") => {
    const b = h("button", { type: "button", class: `btn ${cls}` }, h("span", { html: icon(ic) }), label);
    b.addEventListener("click", fn);
    return b;
  };
  const stopAll = () => {
    run++;
    stopSpeaking();
  };
  const readAll = async (label) => {
    stopAll();
    status.textContent = label;
    await speak(d.texte, { rate: 0.95 });
    if (alive) status.textContent = "";
  };
  let g = 0;
  const playGroup = async () => {
    const me = ++run;
    if (g >= groups.length) {
      status.textContent = "Fin de la dictée. Écoute la relecture, puis corrige.";
      return;
    }
    status.textContent = `Groupe ${g + 1} sur ${groups.length}`;
    await speakParts([{ text: groups[g].said, lang: "fr", rate: 0.8, pause: 700 }, { text: groups[g].said, lang: "fr", rate: 0.75 }]);
    if (me !== run || !alive) return;
    // A pause to write, about one second per word, then the next group.
    const words = groups[g].text.split(/\s+/).length;
    await sleep(1400 + words * 900);
    if (me !== run || !alive) return;
    g++;
    playGroup();
  };
  const controls = ttsReady()
    ? h(
        "div",
        { class: "dictee-controls" },
        btn("1. Lecture du texte", "play", () => readAll("Lecture du texte : écoute sans écrire.")),
        btn("2. Dicter", "speaker", () => {
          g = 0;
          area.focus();
          playGroup();
        }, "btn-small btn-primary"),
        btn("Répéter le groupe", "refresh", () => {
          stopAll();
          g = Math.max(0, g - (status.textContent.startsWith("Groupe") ? 0 : 1));
          playGroup();
        }),
        btn("Pause", "close", () => {
          stopAll();
          status.textContent = `En pause au groupe ${Math.min(g + 1, groups.length)} sur ${groups.length}. Appuie sur « Reprendre ».`;
        }),
        btn("Reprendre", "play", () => playGroup()),
        btn("3. Relecture", "eye", () => readAll("Relecture : vérifie les accords et les accents.")),
      )
    : null;
  // Without a voice: show the text, then hide it.
  let shown = null;
  if (!ttsReady()) {
    const secs = Math.max(20, Math.round(d.texte.split(/\s+/).length * 0.7));
    shown = h("div", { class: "dictee-show" }, h("p", { class: "set-help" }, `Ton appareil n'a pas de voix française : voici une « copie différée ». Lis bien le texte (${secs} secondes), il va disparaître, puis écris-le de mémoire.`), h("blockquote", { class: "dictee-text" }, d.texte));
    let left = secs;
    const tick = setInterval(() => {
      left--;
      if (!alive) return clearInterval(tick);
      if (left <= 0) {
        clearInterval(tick);
        shown.replaceChildren(h("p", { class: "set-help" }, "Le texte a disparu. À toi de l'écrire !"));
        area.focus();
      }
    }, 1000);
  }
  const out = h("div", { class: "dictee-out" });
  const correct = h("button", { type: "button", class: "btn btn-primary btn-xl" }, h("span", { html: icon("check") }), "Corriger ma dictée");
  correct.addEventListener("click", () => {
    if (area.value.trim().split(/\s+/).length < 3) return toast("Écris d'abord la dictée.");
    stopAll();
    const r = compareDictation(area.value, d.texte);
    const mark = dictationMark(r.faults);
    state.dictees ||= {};
    const first = state.dictees[unit.id] == null;
    state.dictees[unit.id] = Math.max(state.dictees[unit.id] ?? 0, mark);
    addXp(Math.round(mark) + (first ? 10 : 0));
    touchStreak();
    markStep(unit.id, "dictee");
    save();
    checkBadges();
    refreshSteps();
    const words = r.words.map((x) => h("span", { class: `dw ${x.status}`, title: x.status === "ok" ? "" : x.typed ? `Tu as écrit : ${x.typed}` : "Mot oublié" }, x.w));
    const faults = r.words.filter((x) => x.status !== "ok");
    putIn(
      out,
      h("div", { class: "dictee-mark" }, h("strong", null, `${String(mark).replace(".", ",")}/20`), h("span", null, `${String(r.faults).replace(".", ",")} faute${r.faults > 1 ? "s" : ""}`)),
      mentorSays(quip(mark >= 18 ? "perfect" : mark >= 12 ? "correct" : "fail")),
      h("p", { class: "set-help" }, "Le texte, mot à mot : vert = juste, orange = accent ou majuscule (½ faute), rouge = faute ou mot oublié (1 faute). Touche un mot pour voir ce que tu as écrit."),
      h("div", { class: "dictee-correct" }, words),
      r.extra.length ? h("p", { class: "set-help" }, `Mots en trop : ${r.extra.join(", ")}.`) : null,
      faults.length
        ? h("details", { class: "w-all", open: faults.length <= 8 }, h("summary", null, `Tes ${faults.length} erreur${faults.length > 1 ? "s" : ""}`), h("ul", { class: "dictee-faults" }, faults.map((x) => h("li", null, h("span", { class: "ko" }, x.typed || "(oublié)"), " → ", h("strong", null, x.w)))))
        : null,
      d.points?.length ? h("div", { class: "l-tip" }, h("div", { class: "l-tip-title" }, "Les pièges de cette dictée"), h("ul", null, d.points.map((p) => h("li", { html: rich(p) })))) : null,
      h("div", { class: "row" }, h("button", { type: "button", class: "btn btn-ghost", onClick: () => (area.value = "", out.replaceChildren(), area.focus()) }, "Recommencer la dictée"), h("button", { type: "button", class: "btn btn-primary", onClick: onDone }, "Étape suivante")),
    );
    out.scrollIntoView({ block: "start", behavior: "smooth" });
    if (mark >= 18) {
      sfx.win();
      confetti({ count: 70 });
    } else sfx.level();
  });
  put(
    body,
    stepHead(2, `Dictée : ${d.titre}`, ttsReady() ? "Comme en classe : écoute d'abord le texte en entier, puis écris pendant que la voix dicte (la ponctuation est dite à voix haute), puis vérifie pendant la relecture." : null),
    best != null ? h("p", { class: "test-best" }, `Ta meilleure note : ${String(best).replace(".", ",")}/20`) : null,
    controls,
    status,
    shown,
    area,
    correct,
    out,
    h("div", { class: "step-end" }, h("button", { type: "button", class: "btn btn-ghost", onClick: onDone }, "Passer la dictée pour l'instant")),
  );
  return () => {
    alive = false;
    stopAll();
  };
}

// ---------- 3. Words ----------

function wordsStep(body, unit, onDone) {
  const list = h(
    "ul",
    { class: "word-list" },
    unit.vocab.map((v) =>
      h(
        "li",
        { class: "word" },
        h("button", { type: "button", class: "word-play", "aria-label": `Écouter ${v.mot}`, html: icon("speaker"), onClick: () => speak(v.mot) }),
        h("div", { class: "word-main" }, h("div", { class: "word-en" }, v.mot), h("div", { class: "word-fr" }, v.def), v.ex ? h("button", { type: "button", class: "word-ex", onClick: () => speak(v.ex) }, v.ex) : null),
      ),
    ),
  );
  const cardsBtn = h("button", { type: "button", class: "btn btn-primary" }, h("span", { html: icon("cards") }), "Réviser en cartes");
  const area = h("div");
  cardsBtn.addEventListener("click", () => flashcards(area, unit, onDone));
  put(
    body,
    stepHead(3, "Les mots", `${unit.vocab.length} mots à savoir écrire et employer. Lis leur définition, écoute-les, puis révise-les en cartes.`),
    h("div", { class: "words-head" }, cardsBtn),
    area,
    list,
    h("div", { class: "step-end" }, h("button", { type: "button", class: "btn btn-ghost", onClick: onDone }, "Je les connais, étape suivante")),
  );
  return () => stopSpeaking();
}

function flashcards(area, unit, onDone) {
  const deck = shuffle(unit.vocab);
  const total = deck.length;
  let i = 0;
  let known = 0;
  const front = h("div", { class: "fc-face fc-front" });
  const back = h("div", { class: "fc-face fc-back" });
  const card = h("button", { type: "button", class: "fc", "aria-label": "Retourner la carte" }, h("div", { class: "fc-inner" }, front, back));
  const count = h("span", { class: "fc-count" });
  const yes = h("button", { type: "button", class: "btn btn-go" }, "Je savais");
  const no = h("button", { type: "button", class: "btn btn-stop" }, "À revoir");
  const close = h("button", { type: "button", class: "icon-btn", "aria-label": "Fermer les cartes", html: icon("close") });
  const show = () => {
    if (i >= deck.length) {
      area.replaceChildren(
        h(
          "div",
          { class: "fc-done" },
          h("strong", null, `${known} / ${total} mots sus du premier coup.`),
          h("p", null, known === total ? "Parfait. Tu es prêt pour la pratique." : "Les cartes « à revoir » sont revenues jusqu'à ce que tu les saches. Bien joué."),
          h("div", { class: "row" }, h("button", { type: "button", class: "btn btn-ghost", onClick: () => flashcards(area, unit, onDone) }, "Recommencer"), h("button", { type: "button", class: "btn btn-primary", onClick: onDone }, "Étape suivante")),
        ),
      );
      sfx.win();
      return;
    }
    const v = deck[i];
    card.classList.remove("flipped");
    front.replaceChildren(h("span", { class: "fc-hint" }, "Quel est le mot ?"), h("span", { class: "fc-word def" }, v.def), h("span", { class: "fc-tap" }, "Pense au mot (et à son orthographe !), puis touche pour retourner"));
    back.replaceChildren(h("span", { class: "fc-word en" }, v.mot), v.ex ? h("span", { class: "fc-ex" }, v.ex) : null);
    count.textContent = `${Math.min(i + 1, deck.length)} / ${deck.length}`;
    yes.disabled = no.disabled = true;
  };
  card.addEventListener("click", () => {
    card.classList.toggle("flipped");
    sfx.flip();
    if (card.classList.contains("flipped")) {
      speak(deck[i].mot);
      yes.disabled = no.disabled = false;
    }
  });
  yes.addEventListener("click", () => {
    if (i < total) known++;
    i++;
    sfx.correct();
    show();
  });
  no.addEventListener("click", () => {
    deck.push(deck[i]);
    i++;
    show();
  });
  close.addEventListener("click", () => area.replaceChildren());
  area.replaceChildren(h("div", { class: "fc-wrap" }, h("div", { class: "fc-top" }, count, close), card, h("div", { class: "fc-actions" }, no, yes)));
  show();
}

// ---------- 4. Practice: mission + games ----------

function practiceStep(body, unit, refreshSteps) {
  const done = pathOf(unit.id).practice || 0;
  body.append(stepHead(4, "Pratique", `Fais au moins ${PRACTICE_GOAL} activités avant le test (${Math.min(done, PRACTICE_GOAL)}/${PRACTICE_GOAL}). Les jeux n'utilisent que ce que tu viens d'apprendre.`));
  if (unit.mission) body.append(missionCard(unit, refreshSteps));
  const grid = h("div", { class: "games-grid" });
  for (const g of GAMES) {
    const needsAudio = g.audio && !ttsReady();
    const enough = g.available(unit);
    const best = state.games[`${unit.id}:${g.id}`];
    const card = h(
      "button",
      { type: "button", class: `game-card ${needsAudio || !enough ? "off" : ""}`, style: { "--g": g.color } },
      h("span", { class: "game-ic", html: icon(g.icon) }),
      h("span", { class: "game-name" }, g.name),
      h("span", { class: "game-skill" }, g.skill),
      h("span", { class: "game-desc" }, needsAudio ? "Ton appareil ne lit pas le français à voix haute." : g.desc),
      h("span", { class: "game-best" }, best ? `Record : ${best}` : "Pas encore joué"),
    );
    card.addEventListener("click", () => {
      if (needsAudio) return toast("Ce jeu a besoin d'une voix française sur ton appareil (essaie Chrome, Safari ou Edge).");
      if (!enough) return toast("Pas assez d'éléments dans cette station pour ce jeu.");
      sfx.tap();
      go("game", { uid: unit.id, game: g.id });
    });
    grid.append(card);
  }
  body.append(h("h3", { class: "sub-title" }, "Les mini-jeux"), grid);
  return () => stopSpeaking();
}

function missionCard(unit, refreshSteps) {
  const m = unit.mission;
  const oral = m.type === "oral";
  const answer = oral ? null : h("textarea", { class: "field mission-input", rows: 5, placeholder: "Écris ta réponse ici…", id: `mission-${unit.id}`, spellcheck: "false", autocapitalize: "sentences", lang: "fr" });
  const reveal = h("button", { type: "button", class: "btn btn-primary" }, oral ? "J'ai répondu à voix haute : voir le modèle" : "Voir le modèle");
  const model = h("div", { class: "mission-model", hidden: true });
  const card = h(
    "div",
    { class: `mission ${oral ? "oral" : "ecrit"}` },
    h("div", { class: "mission-kicker" }, h("span", { html: icon(oral ? "mic" : "spell") }), oral ? "Mission orale" : "Mission écrite"),
    h("p", { class: "mission-prompt", html: rich(m.prompt) }),
    oral ? h("p", { class: "mission-help" }, "Réponds à voix haute, en phrases complètes, comme si quelqu'un t'écoutait. Prends ton temps.") : null,
    answer,
    reveal,
    model,
  );
  if (!oral) {
    const checkBtn = h("button", { type: "button", class: "btn btn-ghost" }, h("span", { html: icon("check") }), "Faire vérifier mon texte");
    const out = h("div");
    checkBtn.addEventListener("click", () => {
      if (!answer.value.trim()) return toast("Écris d'abord ta réponse.");
      out.replaceChildren(quickCheck(answer.value, Number(unit.id.split(".")[0])));
    });
    card.insertBefore(h("div", null, checkBtn, out), reveal);
  }
  reveal.addEventListener("click", () => {
    reveal.hidden = true;
    const checks = m.checklist.map((c, i) => {
      const id = `chk-${unit.id}-${i}`.replace(/\./g, "-");
      return h("label", { class: "check", for: id }, h("input", { type: "checkbox", id }), h("span", { html: rich(c) }));
    });
    const doneBtn = h("button", { type: "button", class: "btn btn-go" }, "Mission accomplie");
    model.replaceChildren(
      h("div", { class: "pron-kicker" }, "Un exemple de bonne réponse"),
      h("div", { class: "mission-model-text" }, m.model, h("button", { type: "button", class: "icon-btn", "aria-label": "Écouter le modèle", html: icon("speaker"), onClick: () => speak(m.model) })),
      h("div", { class: "pron-kicker" }, "Vérifie ta réponse"),
      h("div", { class: "checks" }, checks),
      doneBtn,
    );
    model.hidden = false;
    doneBtn.addEventListener("click", () => {
      const ticked = checks.filter((c) => c.querySelector("input").checked).length;
      if (ticked < checks.length) {
        toast("Coche chaque point que tu as réussi. Sinon, corrige ta réponse et réessaie : c'est comme ça qu'on progresse.");
        return;
      }
      markStep(unit.id, "practice");
      addXp(20);
      touchStreak();
      save();
      sfx.win();
      confetti({ count: 70 });
      floatText("+20 XP", doneBtn, { color: "var(--amber)" });
      doneBtn.disabled = true;
      doneBtn.textContent = "Mission réussie";
      refreshSteps();
    });
  });
  return card;
}

// ---------- 5. Test ----------

function testStep(body, unit) {
  const st = unitState(unit.id);
  const d = diff();
  const missing = missingPrep(unit.id);
  const start = h("button", { type: "button", class: "btn btn-primary btn-xl" }, st.passed ? "Refaire le test" : "Commencer le test");
  start.addEventListener("click", async () => {
    if (missing.length && !st.passed) {
      const v = await dialog({
        title: "Tu es sûr d'être prêt ?",
        body: `<p>Il te reste : <strong>${esc(missing.map((s) => s.label.toLowerCase()).join(", "))}</strong>.</p><p>Le test est difficile. En suivant les étapes dans l'ordre, tu as beaucoup plus de chances de réussir du premier coup.</p>`,
        actions: [
          { label: "Tenter quand même", value: "go" },
          { label: "Finir la préparation", value: "prep", primary: true },
        ],
      });
      if (v !== "go") return;
    }
    go("test", { uid: unit.id });
  });
  put(
    body,
    stepHead(5, "Le test de la station", missing.length ? "Conseil : termine d'abord les étapes 1 à 4." : "Tu as tout préparé. Respire, prends le temps de lire chaque question."),
    h(
      "div",
      { class: "test-card" },
      h("h3", { class: "test-title" }, "15 questions, sans aide"),
      h(
        "ul",
        { class: "test-rules" },
        h("li", null, h("span", { html: icon("trophy") }), `Il faut ${Math.round(d.pass * 100)} % pour réussir (${Math.ceil(d.pass * 15 - 1e-9)} bonnes réponses sur 15).`),
        h("li", null, h("span", { html: icon("clock") }), "Chaque question a un chrono, assez long pour réfléchir (et se relire)."),
        h("li", null, h("span", { html: icon("spell") }), "Les accents comptent, toujours. Les majuscules comptent dans les dictées."),
        h("li", null, h("span", { html: icon("speaker") }), `Dictées et écoutes : ${d.replays} réécoute${d.replays > 1 ? "s" : ""} maximum.`),
        h("li", null, h("span", { html: icon("refresh") }), "Raté ? Aucun problème : tes erreurs vont dans ton carnet et tu peux refaire le test autant de fois que tu veux."),
      ),
      st.attempts ? h("p", { class: "test-best" }, `Meilleur score : ${Math.round((st.best || 0) * 100)} % · ${st.attempts} essai${st.attempts > 1 ? "s" : ""}`) : null,
      start,
      h("p", { class: "test-note" }, `Mode ${d.label.toLowerCase()}.`),
    ),
  );
}
