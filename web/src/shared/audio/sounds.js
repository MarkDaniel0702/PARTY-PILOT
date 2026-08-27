/* B-Rotation sound engine.

   Every effect is synthesised from Web Audio oscillators at play time, so
   there are zero binary assets to download, preload, or cache — the whole
   "sound pack" is this file. That keeps it lightweight and instant, and it
   sidesteps autoplay restrictions cleanly: the shared AudioContext is only
   created/resumed from inside a real user gesture (see unlock() below).

   Public API:
     playSound(name)          — fire one effect (no-op while muted / locked)
     getSoundState()          — { muted, volume } snapshot (stable ref)
     setMuted(bool) / toggleMuted()
     setVolume(0..1)
     subscribeSound(fn)       — for React's useSyncExternalStore
     SOUND_NAMES              — list of valid effect names
*/

const STORAGE_KEY = "br-sound";

export const SOUND_NAMES = [
  "timerStart",
  "timerWarning",
  "timerEnd",
  "timerEndSoft",
  "correct",
  "incorrect",
  "steal",
  "bonus",
  "complete",
];

// ---------------------------------------------------------------------------
// Persisted settings (muted + volume), shared by every game on the site.
// ---------------------------------------------------------------------------

function loadState() {
  const fallback = { muted: false, volume: 0.6 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return {
      muted: typeof parsed.muted === "boolean" ? parsed.muted : fallback.muted,
      volume:
        typeof parsed.volume === "number" && parsed.volume >= 0 && parsed.volume <= 1
          ? parsed.volume
          : fallback.volume,
    };
  } catch {
    return fallback;
  }
}

let state = loadState();
const listeners = new Set();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* private mode / storage disabled — settings just won't persist */
  }
}

function emit() {
  for (const fn of listeners) fn();
}

export function getSoundState() {
  return state;
}

export function subscribeSound(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setMuted(muted) {
  state = { ...state, muted: !!muted };
  persist();
  emit();
}

export function toggleMuted() {
  setMuted(!state.muted);
}

export function setVolume(volume) {
  const v = Math.min(1, Math.max(0, Number(volume) || 0));
  state = { ...state, volume: v };
  if (masterGain && ctx) masterGain.gain.setTargetAtTime(v, ctx.currentTime, 0.01);
  persist();
  emit();
}

// ---------------------------------------------------------------------------
// Web Audio plumbing — lazily created, gesture-unlocked.
// ---------------------------------------------------------------------------

let ctx = null;
let masterGain = null;
let unlocked = false;
let lastBuzzerAt = 0;

function ensureContext() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  masterGain = ctx.createGain();
  masterGain.gain.value = state.volume;
  masterGain.connect(ctx.destination);
  return ctx;
}

// Called from a user gesture (pointerdown / keydown) exactly once, so the
// browser marks the context as user-activated and later playSound() calls
// from timers or effects are allowed to make noise.
function unlock() {
  if (unlocked) return;
  const c = ensureContext();
  if (!c) return;
  if (c.state === "suspended") c.resume().catch(() => {});
  unlocked = true;
  window.removeEventListener("pointerdown", unlock);
  window.removeEventListener("keydown", unlock);
  window.removeEventListener("touchstart", unlock);
}

if (typeof window !== "undefined") {
  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("keydown", unlock, { passive: true });
  window.addEventListener("touchstart", unlock, { passive: true });
}

// One shaped oscillator with an attack/decay gain envelope.
function tone(dest, { type = "sine", freq = 440, freqEnd, dur = 0.15, gain = 0.3, at = 0 }) {
  const t0 = ctx.currentTime + at;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (freqEnd) osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + Math.min(0.02, dur / 2));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(dest);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

// A short buzzer: two detuned saws through a lowpass. `soft` tones it right
// down for games where the countdown just advances a clue rather than ending
// a turn.
function buzzer(dest, soft) {
  const t0 = ctx.currentTime;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = soft ? 900 : 1400;
  const g = ctx.createGain();
  const peak = soft ? 0.18 : 0.34;
  const dur = soft ? 0.22 : 0.5;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.02);
  g.gain.setValueAtTime(peak, t0 + dur - 0.08);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  filter.connect(g).connect(dest);
  const base = soft ? 320 : 174;
  [base, base * 1.01, base * 0.5].forEach((f, i) => {
    const osc = ctx.createOscillator();
    osc.type = i === 2 ? "square" : "sawtooth";
    osc.frequency.setValueAtTime(f, t0);
    osc.connect(filter);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  });
}

function arpeggio(dest, freqs, { type = "sine", step = 0.09, dur = 0.16, gain = 0.28 } = {}) {
  freqs.forEach((f, i) => tone(dest, { type, freq: f, dur, gain, at: i * step }));
}

const RECIPES = {
  timerStart(dest) {
    tone(dest, { type: "sine", freq: 520, freqEnd: 780, dur: 0.12, gain: 0.22 });
  },
  timerWarning(dest) {
    tone(dest, { type: "square", freq: 880, dur: 0.08, gain: 0.2 });
    tone(dest, { type: "square", freq: 880, dur: 0.08, gain: 0.2, at: 0.14 });
  },
  timerEnd(dest) {
    lastBuzzerAt = performance.now();
    buzzer(dest, false);
  },
  timerEndSoft(dest) {
    lastBuzzerAt = performance.now();
    buzzer(dest, true);
  },
  correct(dest) {
    arpeggio(dest, [523.25, 659.25, 783.99], { type: "sine", step: 0.08, dur: 0.15, gain: 0.26 });
  },
  incorrect(dest) {
    tone(dest, { type: "sawtooth", freq: 300, freqEnd: 150, dur: 0.14, gain: 0.24 });
    tone(dest, { type: "sawtooth", freq: 220, freqEnd: 110, dur: 0.22, gain: 0.24, at: 0.13 });
  },
  steal(dest) {
    tone(dest, { type: "sawtooth", freq: 400, freqEnd: 1200, dur: 0.22, gain: 0.2 });
    tone(dest, { type: "square", freq: 1200, dur: 0.08, gain: 0.16, at: 0.2 });
  },
  bonus(dest) {
    arpeggio(dest, [659.25, 987.77, 1318.51], { type: "triangle", step: 0.07, dur: 0.14, gain: 0.22 });
  },
  complete(dest) {
    arpeggio(dest, [523.25, 659.25, 783.99, 1046.5], { type: "triangle", step: 0.11, dur: 0.22, gain: 0.26 });
  },
};

export function playSound(name) {
  const recipe = RECIPES[name];
  if (!recipe) return;
  if (state.muted || state.volume <= 0) return;
  const c = ensureContext();
  if (!c) return;
  if (c.state === "suspended") {
    // Not yet unlocked by a gesture — stay silent rather than queue noise.
    c.resume().catch(() => {});
    if (c.state === "suspended") return;
  }
  // Swallow the "start" chirp when it lands right on top of a buzzer (e.g. a
  // steal timer opening the instant the question timer expired).
  if (name === "timerStart" && performance.now() - lastBuzzerAt < 550) return;
  masterGain.gain.setTargetAtTime(state.volume, c.currentTime, 0.01);
  try {
    recipe(masterGain);
  } catch {
    /* ignore — a dropped effect is never worth breaking gameplay */
  }
}
