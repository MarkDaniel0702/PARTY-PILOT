/* Background music: two tracks looped as a playlist, shared by every page.
   Follows the site's mute/volume setting (sounds.js). Pages are separate
   documents, so track + position are kept in sessionStorage and resumed on
   the next page. Starts on the first user gesture (autoplay policy). */
import { getSoundState, subscribeSound } from "./sounds";
import afternoon from "./music/afternoon-high-score.mp3";
import confetti from "./music/confetti-victory-lap.mp3";

const TRACKS = [afternoon, confetti];
const KEY = "br-music";
const MUSIC_GAIN = 0.35; // keep music well under the sound effects
// Phones and the song-guessing game (its own audio) stay silent.
const SILENT = /(controller|guessthesong)\.html/.test(location.pathname);

if (typeof window !== "undefined" && !SILENT) {
  let saved = {};
  try {
    saved = JSON.parse(sessionStorage.getItem(KEY)) || {};
  } catch {
    /* ignore */
  }
  let i = saved.i >= 0 && saved.i < TRACKS.length ? saved.i : 0;
  const audio = new Audio(TRACKS[i]);
  audio.preload = "auto";
  if (saved.t > 0) audio.addEventListener("loadedmetadata", () => (audio.currentTime = saved.t), { once: true });

  const sync = () => {
    const { muted, volume } = getSoundState();
    audio.volume = volume * MUSIC_GAIN;
    if (muted || volume <= 0) audio.pause();
    else if (started) audio.play().catch(() => {});
  };
  let started = false;
  const start = () => {
    started = true;
    window.removeEventListener("pointerdown", start);
    window.removeEventListener("keydown", start);
    sync();
  };

  audio.addEventListener("ended", () => {
    i = (i + 1) % TRACKS.length;
    audio.src = TRACKS[i];
    sync();
  });
  const save = () => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ i, t: audio.currentTime }));
    } catch {
      /* ignore */
    }
  };
  window.addEventListener("pagehide", save);
  document.addEventListener("visibilitychange", () => document.hidden && save());

  subscribeSound(sync);
  window.addEventListener("pointerdown", start, { passive: true });
  window.addEventListener("keydown", start, { passive: true });
  sync();
}
