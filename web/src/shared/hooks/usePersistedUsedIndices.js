import { useCallback, useRef } from "react";

// localStorage-backed "don't repeat" picker — ports js/shared.js's
// createUsedRegistry(namespace) exactly, including its one non-obvious
// behavior: when a pool resets after full exhaustion, the item used right
// before the reset is excluded from the first pick of the new cycle (unless
// the pool has only one item), so nothing repeats back-to-back across a
// reset. Falls back to an in-memory Map if localStorage is unavailable.
export function usePersistedUsedIndices(namespace) {
  const memoryRef = useRef(new Map());

  const storageKey = useCallback((key) => `br:${namespace}:${key}`, [namespace]);

  const readSet = useCallback(
    (key) => {
      const memory = memoryRef.current;
      if (memory.has(key)) return memory.get(key);
      let arr = [];
      try {
        const raw = localStorage.getItem(storageKey(key));
        if (raw) arr = JSON.parse(raw);
      } catch {
        arr = [];
      }
      const set = new Set(Array.isArray(arr) ? arr : []);
      memory.set(key, set);
      return set;
    },
    [storageKey]
  );

  const writeSet = useCallback(
    (key, set) => {
      memoryRef.current.set(key, set);
      try {
        localStorage.setItem(storageKey(key), JSON.stringify(Array.from(set)));
      } catch {
        // ignore — in-memory Map still holds the current session's history
      }
    },
    [storageKey]
  );

  const pickUnused = useCallback(
    (key, arr) => {
      const used = readSet(key);
      let available = [];
      for (let i = 0; i < arr.length; i++) {
        if (!used.has(i)) available.push(i);
      }
      if (available.length === 0) {
        const lastKey = `${storageKey(key)}:last`;
        let lastIndex = -1;
        try {
          const raw = localStorage.getItem(lastKey);
          if (raw != null) lastIndex = Number(raw);
        } catch {
          lastIndex = -1;
        }
        available = [];
        for (let i = 0; i < arr.length; i++) available.push(i);
        if (arr.length > 1 && available.includes(lastIndex)) {
          available = available.filter((i) => i !== lastIndex);
        }
        writeSet(key, new Set());
      }
      const idx = available[Math.floor(Math.random() * available.length)];
      const set = readSet(key);
      set.add(idx);
      writeSet(key, set);
      try {
        localStorage.setItem(`${storageKey(key)}:last`, String(idx));
      } catch {
        // ignore
      }
      return { item: arr[idx], index: idx };
    },
    [readSet, writeSet, storageKey]
  );

  const clear = useCallback((key) => writeSet(key, new Set()), [writeSet]);

  return { pickUnused, clear };
}
