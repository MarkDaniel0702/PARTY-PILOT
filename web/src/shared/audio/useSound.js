import { useSyncExternalStore } from "react";
import {
  getSoundState,
  subscribeSound,
  setMuted,
  toggleMuted,
  setVolume,
  playSound,
} from "./sounds";

// Thin React binding over the global sound store. `play` is stable and
// safe to call from anywhere (it no-ops while muted or before the audio
// context has been unlocked by a gesture).
export function useSound() {
  const snapshot = useSyncExternalStore(subscribeSound, getSoundState, getSoundState);
  return {
    play: playSound,
    muted: snapshot.muted,
    volume: snapshot.volume,
    setMuted,
    toggleMuted,
    setVolume,
  };
}
