import { useSyncExternalStore } from "react";
import {
  subscribeTheme,
  getThemePref,
  getActiveTheme,
  setThemePref,
  toggleTheme,
} from "./themeStore";

// React binding over the theme store. `active` is the concrete theme on
// screen ("light" | "dark"); `pref` is the stored choice ("light" | "dark"
// | "system").
export function useTheme() {
  const active = useSyncExternalStore(subscribeTheme, getActiveTheme, getActiveTheme);
  const pref = useSyncExternalStore(subscribeTheme, getThemePref, getThemePref);
  return { active, pref, setThemePref, toggleTheme };
}
