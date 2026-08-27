import { useEffect } from "react";
import { playSound } from "../audio/sounds";

// Drop-in for a game's end/summary screen that doesn't use <ResultsList>
// (which plays the fanfare itself). Renders nothing; just plays the
// completion sound once when it mounts.
export function CompletionChime({ sound = "complete" }) {
  useEffect(() => {
    playSound(sound);
  }, [sound]);
  return null;
}
