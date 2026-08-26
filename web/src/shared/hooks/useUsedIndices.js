import { useCallback, useRef } from "react";

// In-memory "don't repeat until the pool is exhausted" picker — ports
// js/shared.js's pickRandomUnused(). Used by games whose used-index
// tracking resets every session (a plain `new Set()` in the original).
export function useUsedIndices() {
  const usedRef = useRef(new Set());

  const pickUnused = useCallback((arr) => {
    const used = usedRef.current;
    const available = [];
    for (let i = 0; i < arr.length; i++) {
      if (!used.has(i)) available.push(i);
    }
    if (available.length === 0) {
      used.clear();
      for (let i = 0; i < arr.length; i++) available.push(i);
    }
    const idx = available[Math.floor(Math.random() * available.length)];
    used.add(idx);
    return { item: arr[idx], index: idx };
  }, []);

  const reset = useCallback(() => {
    usedRef.current.clear();
  }, []);

  return { pickUnused, reset };
}
