/* Site-wide light/dark theme.

   The actual paint switch is a single `data-theme="light|dark"` attribute on
   <html>; every game's palette.css defines a `:root[data-theme="light"]`
   block, so flipping the attribute retints the whole page through the design
   tokens. Each *.html also runs a tiny inline copy of resolveInitial() in
   <head> so first paint is already correct (no flash) — this module then
   keeps that in sync and lets React subscribe.

   Persistence: localStorage "br-theme" holds "light", "dark", or (default)
   "system". "system" follows prefers-color-scheme, falling back to light.
*/

const STORAGE_KEY = "br-theme";
const TRANSITION_CLASS = "theme-transition";

const listeners = new Set();

function prefersDark() {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false; // no matchMedia / no preference -> default to light
  }
}

function readPref() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "light" || raw === "dark" || raw === "system") return raw;
  } catch {
    /* ignore */
  }
  return "system";
}

// The concrete theme ("light" | "dark") a preference resolves to right now.
function resolve(pref) {
  if (pref === "light" || pref === "dark") return pref;
  return prefersDark() ? "dark" : "light";
}

let pref = readPref();

function apply(theme, animate) {
  const root = document.documentElement;
  if (root.getAttribute("data-theme") === theme && !animate) return;
  if (animate) {
    root.classList.add(TRANSITION_CLASS);
    window.clearTimeout(apply._t);
    apply._t = window.setTimeout(() => root.classList.remove(TRANSITION_CLASS), 550);
  }
  root.setAttribute("data-theme", theme);
}

// Keep "system" preference live if the OS setting changes mid-session.
try {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onChange = () => {
    if (pref === "system") {
      apply(resolve(pref), true);
      listeners.forEach((fn) => fn());
    }
  };
  if (mq.addEventListener) mq.addEventListener("change", onChange);
  else if (mq.addListener) mq.addListener(onChange);
} catch {
  /* ignore */
}

// Make sure the runtime attribute matches what we think it should be
// (the inline head script normally already did this).
apply(resolve(pref), false);

export function getThemePref() {
  return pref;
}

// What's actually on screen: "light" | "dark".
export function getActiveTheme() {
  return resolve(pref);
}

export function subscribeTheme(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setThemePref(next) {
  if (next !== "light" && next !== "dark" && next !== "system") return;
  pref = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
  apply(resolve(pref), true);
  listeners.forEach((fn) => fn());
}

// Toggle between the two concrete themes (drops "system" — an explicit
// choice is what the user just made).
export function toggleTheme() {
  setThemePref(getActiveTheme() === "dark" ? "light" : "dark");
}
