import { Plus, X } from "lucide-react";
import styles from "./roster.module.css";

// Add/remove/rename team rows. Pair with hooks/useTeams.js.
export function TeamSetup({ teams, maxTeams, onAdd, onRemove, onRename }) {
  return (
    <div className={styles.teamsSetup}>
      {teams.map((team, i) => (
        <div className={styles.teamRow} key={i}>
          <span className={styles.teamSwatch} style={{ background: team.color }} />
          <input
            type="text"
            className={styles.teamInput}
            maxLength={16}
            value={team.name}
            onChange={(e) => onRename(i, e.target.value)}
          />
          <button
            type="button"
            className={styles.teamRemove}
            aria-label="Remove team"
            disabled={teams.length <= 1}
            onClick={() => onRemove(i)}
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>
      ))}
      <button
        type="button"
        className={styles.addTeamBtn}
        disabled={teams.length >= maxTeams}
        onClick={() => onAdd()}
      >
        <Plus size={14} strokeWidth={2.5} /> Add Team
      </button>
    </div>
  );
}

// Live scoreboard chips with +/- 10 controls (used during play, not setup).
export function TeamScoreboard({ teams, onAdjust }) {
  return (
    <div className={styles.scoreboard}>
      {teams.map((team, i) => (
        <div className={styles.scoreChip} key={i}>
          <span className={styles.scoreSwatch} style={{ background: team.color }} />
          <span className={styles.scoreName}>{team.name}</span>
          <span className={styles.scoreValue}>{team.score}</span>
          {onAdjust && (
            <span className={styles.scoreBtns}>
              <button type="button" className={styles.scoreBtn} onClick={() => onAdjust(i, 10)}>
                +
              </button>
              <button type="button" className={styles.scoreBtn} onClick={() => onAdjust(i, -10)}>
                −
              </button>
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
