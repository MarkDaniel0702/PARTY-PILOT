import { useCallback, useState } from "react";

// Ports createRoster(): a player count (clamped to [min,max]) plus name
// inputs that keep prior values when the count changes. getNames() falls
// back to "Player N" for any blank/whitespace-only input, exactly like the
// original.
export function useRoster({ min, max, initialCount }) {
  const [count, setCountRaw] = useState(initialCount ?? min);
  const [names, setNames] = useState([]);

  const setCount = useCallback(
    (n) => setCountRaw(Math.max(min, Math.min(max, n))),
    [min, max]
  );

  const setName = useCallback((i, value) => {
    setNames((prev) => {
      const next = prev.slice();
      next[i] = value;
      return next;
    });
  }, []);

  const getNames = useCallback(
    () =>
      Array.from({ length: count }, (_, i) =>
        names[i] && names[i].trim().length ? names[i].trim() : `Player ${i + 1}`
      ),
    [count, names]
  );

  return { count, setCount, names, setName, getNames, min, max };
}
