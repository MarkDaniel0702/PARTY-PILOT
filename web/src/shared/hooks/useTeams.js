import { useCallback, useState } from "react";

const TEAM_COLORS = ["#7c5cff", "#ffb84d", "#ff6b81", "#31e0c9", "#7dd956", "#ff9f4a"];

// Ports createTeamScoreboard(): add/remove/rename teams (each auto-assigned
// a color), plus +/- score controls. Used by Quiz Night, Guess the Song,
// and Picture Guess.
export function useTeams({ maxTeams = 6 } = {}) {
  const [teams, setTeams] = useState([]);

  const addTeam = useCallback(
    (name) => {
      setTeams((prev) => {
        if (prev.length >= maxTeams) return prev;
        return [
          ...prev,
          {
            name: name || `Team ${prev.length + 1}`,
            score: 0,
            color: TEAM_COLORS[prev.length % TEAM_COLORS.length]
          }
        ];
      });
    },
    [maxTeams]
  );

  const removeTeam = useCallback((index) => {
    setTeams((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }, []);

  const renameTeam = useCallback((index, name) => {
    setTeams((prev) =>
      prev.map((t, i) => (i === index ? { ...t, name: name.trim() || `Team ${i + 1}` } : t))
    );
  }, []);

  const award = useCallback((index, points) => {
    setTeams((prev) => prev.map((t, i) => (i === index ? { ...t, score: t.score + points } : t)));
  }, []);

  const resetScores = useCallback(() => {
    setTeams((prev) => prev.map((t) => ({ ...t, score: 0 })));
  }, []);

  const reset = useCallback(() => setTeams([]), []);

  return { teams, addTeam, removeTeam, renameTeam, award, resetScores, reset, maxTeams };
}
