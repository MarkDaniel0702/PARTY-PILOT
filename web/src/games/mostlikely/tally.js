// Pure vote tally for Most Likely To: ranks players by votes and highlights a
// winner only when exactly one player has the top (non-zero) count.
export function rankVotes(names, votes) {
  const ranked = names
    .map((name, i) => ({ name, score: votes[i] || 0 }))
    .sort((a, b) => b.score - a.score);
  const top = ranked.length ? ranked[0].score : 0;
  const tiedNames = top > 0 ? ranked.filter((e) => e.score === top).map((e) => e.name) : [];
  const winner = tiedNames.length === 1 ? ranked[0] : null;
  return { ranked, winner, tiedNames };
}
