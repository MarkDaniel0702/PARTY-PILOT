// Pure port of resolveSession()'s ranking step. A game calls this when its
// session ends: if `tied.length <= 1` there's an outright winner and no
// tie-breaker is needed (render results directly with { ranked, winner,
// shared: false, tiebreak: null }); otherwise switch to
// <TieBreakerScreen tied={tied} onResolved={...} /> and build the final
// result object from what it calls back with.
export function resolveStanding(entrants) {
  const ranked = entrants.slice().sort((a, b) => b.score - a.score);
  const topScore = ranked.length ? ranked[0].score : 0;
  const tied = ranked.filter((e) => e.score === topScore);
  return { ranked, tied, winner: tied.length <= 1 ? ranked[0] || null : null };
}
