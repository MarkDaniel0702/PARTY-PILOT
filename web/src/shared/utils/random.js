// Pure randomization helpers — direct ports of js/shared.js's pickRandom/shuffle.
// No DOM dependency, so no behavior change from the original.

export function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Groups a flat set of keys into named groups (e.g. themes into their
// category groups), pushing any key not found in `groupDefs` into a
// "More Themes" bucket — ports the grouping+leftover logic that Spy Word,
// Quiz Night, and the homepage each hand-rolled slightly differently.
export function groupKeys(allKeys, groupDefs, leftoverLabel = "More Themes") {
  const groups = {};
  const placed = new Set();
  Object.keys(groupDefs || {}).forEach((groupName) => {
    const names = groupDefs[groupName].filter((n) => allKeys.includes(n));
    if (names.length) {
      groups[groupName] = names;
      names.forEach((n) => placed.add(n));
    }
  });
  const leftovers = allKeys.filter((n) => !placed.has(n));
  if (leftovers.length) groups[leftoverLabel] = leftovers;
  return groups;
}
