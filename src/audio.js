// French speech synthesis (voices of France first), and synthesized sound effects (no audio files needed).
import { state } from "./store.js";

const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
let voices = [];
const loadVoices = () => {
  try {
    voices = synth?.getVoices?.() || [];
  } catch {
    voices = [];
  }
};
loadVoices();
synth?.addEventListener?.("voiceschanged", loadVoices);

export const frenchVoices = () => voices.filter((v) => /^fr([-_]|$)/i.test(v.lang));

/** True when the device can read French aloud. */
export const ttsReady = () => !!synth && frenchVoices().length > 0;
/** The coach and the exercises use the same French voice. */
export const coachReady = ttsReady;

const NICE = /natural|neural|premium|enhanced|google|siri|online/i;

/** The voice chosen in the profile, else a voice of France (then Belgium, Switzerland, Canada), natural voices first. */
function chooseVoice() {
  const list = frenchVoices();
  if (!list.length) return null;
  const wanted = list.find((v) => v.voiceURI === state.settings.voice);
  if (wanted) return wanted;
  const byLang = (re) => list.filter((v) => re.test(v.lang));
  const ranked = [...byLang(/fr[-_]FR/i), ...byLang(/fr[-_]BE/i), ...byLang(/fr[-_]CH/i), ...byLang(/fr[-_]CA/i), ...list];
  return ranked.find((v) => NICE.test(v.name)) || ranked[0];
}

let token = 0;

/**
 * Speaks a sequence of parts [{text, lang: "en"|"fr", rate, pause}] one after the other.
 * Resolves true when finished, false when interrupted or unavailable.
 */
export function speakParts(parts, { onPart } = {}) {
  return new Promise((resolve) => {
    if (!synth || !parts?.length) return resolve(false);
    const my = ++token;
    try {
      synth.cancel();
    } catch {
      /* ignore */
    }
    // Long texts are split into sentences: some engines stop after ~15 seconds.
    const queue = [];
    parts.forEach((p, idx) => {
      const chunks = String(p.text || "").match(/[^.!?]+[.!?]*["”»]?\s*/g) || [String(p.text || "")];
      chunks.forEach((c, k) => queue.push({ ...p, text: c.trim(), idx, last: k === chunks.length - 1 }));
    });
    let i = 0;
    const next = () => {
      if (my !== token) return resolve(false);
      if (i >= queue.length) return resolve(true);
      const part = queue[i++];
      if (!part.text) return next();
      onPart?.(part.idx);
      const voice = chooseVoice();
      if (!voice) return next();
      const u = new SpeechSynthesisUtterance(part.text);
      u.voice = voice;
      u.lang = voice.lang || "fr-FR";
      const base = state.settings.rate || 0.95;
      u.rate = Math.max(0.5, Math.min(1.6, base * (part.rate || 1)));
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        clearTimeout(guard);
        if (part.last && part.pause) setTimeout(next, part.pause);
        else next();
      };
      u.onend = finish;
      u.onerror = finish;
      const guard = setTimeout(finish, 2500 + part.text.length * 170 / (part.rate || 1));
      try {
        synth.speak(u);
      } catch {
        finish();
      }
    };
    // Safari sometimes needs a tick after cancel().
    setTimeout(next, 30);
  });
}

/** Speaks French text. */
export function speak(text, { rate = 1 } = {}) {
  return speakParts([{ text, lang: "fr", rate }]);
}

/** Splits lesson markup into narration and [[example]] parts (examples are read a little more slowly). */
export function mixedParts(text) {
  const parts = [];
  String(text || "")
    .replace(/\*\*|~~/g, "")
    .split(/(\[\[.+?\]\])/)
    .forEach((seg) => {
      if (!seg.trim()) return;
      const m = seg.match(/^\[\[(.+)\]\]$/);
      if (m) parts.push({ text: m[1], lang: "fr", rate: 0.85, pause: 150 });
      else parts.push({ text: seg.replace(/[«»]/g, "").replace(/\s+/g, " ").trim(), lang: "fr" });
    });
  return parts.filter((p) => /[\p{L}\d]/u.test(p.text));
}

export function stopSpeaking() {
  token++;
  try {
    synth?.cancel();
  } catch {
    /* ignore */
  }
}

// ---------- Dictation ----------

const SAY_PUNCT = { ",": "virgule", ".": "point", ";": "point-virgule", ":": "deux points", "?": "point d'interrogation", "!": "point d'exclamation", "…": "points de suspension", "«": "ouvrez les guillemets", "»": "fermez les guillemets", "(": "ouvrez la parenthèse", ")": "fermez la parenthèse", "—": "à la ligne, tiret" };

/**
 * A text cut into dictation groups (a few words each, up to a punctuation mark), each with the punctuation said
 * aloud as a French teacher does: « Le chat dort, virgule ». Returns [{ text, said }].
 */
export function dictationGroups(text, maxWords = 6) {
  const words = String(text).replace(/[  ]/g, " ").split(/\s+/).filter(Boolean);
  const groups = [];
  let cur = [];
  const flush = () => {
    if (!cur.length) return;
    const raw = cur.join(" ");
    const said = raw
      .replace(/\.\.\./g, "…")
      .replace(/([,.;:?!…«»()—])/g, (m) => ` ${SAY_PUNCT[m]} `)
      .replace(/\s+/g, " ")
      .trim();
    groups.push({ text: raw, said });
    cur = [];
  };
  for (const w of words) {
    cur.push(w);
    const n = cur.filter((x) => /[\p{L}\d]/u.test(x)).length;
    if (/[,.;:?!…»)]$/.test(w) || (n >= maxWords && !/^(le|la|les|un|une|des|de|du|à|au|et|ou|ne|n'|l'|d'|qu'|que|qui|en|y|se|me|te)$/i.test(w))) flush();
  }
  flush();
  return groups;
}

// ---------- Sound effects ----------

let ctx;
let master;
function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq, dur, { type = "sine", vol = 0.2, at = 0, slide, attack = 0.005 } = {}) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + at;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(dur, { vol = 0.2, at = 0, freq = 1200, q = 0.8, type = "bandpass" } = {}) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + at;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = c.createGain();
  g.gain.value = vol;
  src.connect(f).connect(g).connect(master);
  src.start(t);
}

const on = () => state.settings.sound !== false;

export const sfx = {
  tap: () => on() && tone(660, 0.05, { type: "triangle", vol: 0.08 }),
  correct: () => {
    if (!on()) return;
    tone(784, 0.1, { type: "triangle", vol: 0.16 });
    tone(1175, 0.18, { type: "triangle", vol: 0.16, at: 0.08 });
  },
  combo: (n = 2) => {
    if (!on()) return;
    const base = 523 * Math.pow(2, Math.min(n, 8) / 12);
    [0, 4, 7, 12].forEach((s, i) => tone(base * Math.pow(2, s / 12), 0.12, { type: "square", vol: 0.05, at: i * 0.05 }));
  },
  wrong: () => {
    if (!on()) return;
    tone(220, 0.28, { type: "sawtooth", vol: 0.09, slide: 110 });
    tone(233, 0.28, { type: "square", vol: 0.04, slide: 116 });
  },
  tick: () => on() && tone(1400, 0.03, { type: "square", vol: 0.04 }),
  flip: () => on() && noise(0.09, { vol: 0.18, freq: 2400, q: 0.6 }),
  pop: () => {
    if (!on()) return;
    tone(900, 0.08, { type: "sine", vol: 0.2, slide: 300 });
    noise(0.05, { vol: 0.08, freq: 3000 });
  },
  whoosh: () => on() && noise(0.25, { vol: 0.15, freq: 900, q: 0.4, type: "lowpass" }),
  hit: () => {
    if (!on()) return;
    noise(0.18, { vol: 0.35, freq: 500, q: 0.5, type: "lowpass" });
    tone(140, 0.2, { type: "sine", vol: 0.3, slide: 50 });
  },
  hurt: () => {
    if (!on()) return;
    tone(160, 0.35, { type: "sawtooth", vol: 0.12, slide: 60 });
    noise(0.3, { vol: 0.2, freq: 300, type: "lowpass" });
  },
  win: () => {
    if (!on()) return;
    const notes = [523, 659, 784, 1047, 784, 1047, 1319];
    notes.forEach((f, i) => tone(f, i === notes.length - 1 ? 0.6 : 0.14, { type: "triangle", vol: 0.14, at: i * 0.11 }));
  },
  lose: () => {
    if (!on()) return;
    [392, 370, 349, 262].forEach((f, i) => tone(f, i === 3 ? 0.6 : 0.22, { type: "triangle", vol: 0.13, at: i * 0.22 }));
  },
  level: () => {
    if (!on()) return;
    [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.16, { type: "square", vol: 0.06, at: i * 0.07 }));
    tone(2093, 0.7, { type: "triangle", vol: 0.12, at: 0.45 });
  },
  type: () => on() && tone(1800 + Math.random() * 400, 0.015, { type: "square", vol: 0.015 }),
  /** "Dun dun duuun": a heart is lost in the Tower. */
  drama: () => {
    if (!on()) return;
    [[196, 0], [185, 0.45], [147, 0.9]].forEach(([f, at], i) => {
      tone(f, i === 2 ? 2.2 : 0.4, { type: "sawtooth", vol: 0.09, at, attack: 0.02 });
      tone(f / 2, i === 2 ? 2.4 : 0.45, { type: "triangle", vol: 0.18, at, attack: 0.02 });
      noise(0.35, { vol: 0.12, at, freq: 180, type: "lowpass" });
    });
    tone(73, 3, { type: "sine", vol: 0.22, at: 0.9, slide: 55 });
  },
  /** A floor appears in the Tower: rumble, a rising "ta-daaa", then the mocking "wah wah". */
  surprise: () => {
    if (!on()) return;
    noise(0.7, { vol: 0.2, freq: 140, type: "lowpass" });
    [392, 523, 659].forEach((f, i) => tone(f, i === 2 ? 0.45 : 0.14, { type: "square", vol: 0.07, at: 0.5 + i * 0.12 }));
    [[311, 1.25], [294, 1.6], [277, 1.95]].forEach(([f, at], i) => tone(f, i === 2 ? 0.9 : 0.32, { type: "sawtooth", vol: 0.07, at, slide: i === 2 ? 220 : f * 0.97, attack: 0.03 }));
  },
  /** The Tower collapses: long rumble and falling tones. */
  collapse: () => {
    if (!on()) return;
    for (let i = 0; i < 8; i++) noise(0.6, { vol: 0.25, at: i * 0.35, freq: 120 + i * 20, type: "lowpass" });
    [392, 349, 311, 262, 233, 196, 147, 98].forEach((f, i) => tone(f, 0.5, { type: "sawtooth", vol: 0.07, at: i * 0.32, slide: f * 0.8 }));
    tone(55, 3.5, { type: "sine", vol: 0.28, at: 0.2, slide: 35 });
  },
};

/** Must be called from a user gesture once, so later sounds may play. */
export function unlockAudio() {
  ac();
  loadVoices();
}
