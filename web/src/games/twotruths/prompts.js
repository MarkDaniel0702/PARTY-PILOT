import { shuffle } from "../../shared/utils/random";

// Ready-made sets list the lie at a fixed index (mostly 2), so a group that
// plays a few rounds would learn to always vote "#3". Shuffle the statements
// and remap lieIndex so the lie's position is random every time.
export function shufflePromptSet(set, shuffleFn = shuffle) {
  const tagged = set.statements.map((text, i) => ({ text, isLie: i === set.lieIndex }));
  const mixed = shuffleFn(tagged);
  return { statements: mixed.map((t) => t.text), lieIndex: mixed.findIndex((t) => t.isLie) };
}
