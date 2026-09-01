// Teams are addressed by array index (or, in Quiz, by object identity) —
// see useTeams.js and quiz/App.jsx. A phone only ever knows a team's stable
// `id`, so this is the one place that converts id -> index at the point of
// use, rather than changing any existing mutator.
export function indexOfTeamId(teams, teamId) {
  return teams.findIndex((t) => t.id === teamId);
}
