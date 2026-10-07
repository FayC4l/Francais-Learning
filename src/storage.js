// Key-value persistence with a memory fallback (storage can be blocked, e.g. private windows).

// Namespace "mission-francais:" so that Mission Bilingue (mission-bilingue:*) can live in the same browser.
export const NS = "mission-francais";
export const V1_KEY = `${NS}:v1`;
export const GLOBAL_KEY = `${NS}:global`;
export const profileKey = (id) => `${NS}:p:${id}`;

const memory = new Map();
const memoryBackend = {
  get: (k) => (memory.has(k) ? memory.get(k) : null),
  set: (k, v) => memory.set(k, String(v)),
  remove: (k) => memory.delete(k),
};

function browserBackend() {
  try {
    const ls = globalThis.localStorage;
    if (!ls) return null;
    const probe = `${NS}:probe`;
    ls.setItem(probe, "1");
    ls.removeItem(probe);
    return {
      get: (k) => ls.getItem(k),
      set: (k, v) => ls.setItem(k, v),
      remove: (k) => ls.removeItem(k),
    };
  } catch {
    return null;
  }
}

let backend = browserBackend() || memoryBackend;
/** False when progress cannot survive a reload (storage blocked). */
export let persistent = backend !== memoryBackend;

/** Replaces the backend (tests). */
export function setBackend(b) {
  backend = b;
  persistent = true;
}

export function readJSON(key) {
  try {
    const raw = backend.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeJSON(key, value) {
  try {
    backend.set(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key) {
  try {
    backend.remove(key);
  } catch {
    /* ignore */
  }
}
