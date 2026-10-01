import { Board } from "./Board";
import { ACTION, action } from "../../shared/controller/protocol";
import { decodeBoard } from "./engine";
import styles from "./phoneConnect4.module.css";

// The Connect Four screen on a paired phone: a miniature of the board that is
// tappable on your turn, plus who is winning the series. `view` is the
// CONNECT4 descriptor the host pushed (see protocol.js); everything here is
// presentation — the host re-checks every drop, so a stray tap can't break
// the game.
export function PhoneConnectFour({ view, send }) {
  const { you, names = [], colours = [], board: boardText = "", wins = [0, 0], target = 2 } = view;
  const board = decodeBoard(boardText);
  const opponent = 1 - you;
  const finished = view.winner !== null && view.winner !== undefined;

  let status;
  let tone = "";
  if (!finished) {
    status = view.myTurn ? "Your turn — tap a column" : `Waiting for ${names[opponent] || "your opponent"}…`;
    tone = view.myTurn ? styles.go : "";
  } else if (view.winner === "draw") {
    status = "It's a draw!";
  } else if (view.winner === you) {
    status = view.seriesOver ? "You won the match! 🏆" : "You won the game! 🎉";
    tone = styles.win;
  } else {
    status = view.seriesOver ? `${names[opponent]} took the match.` : `${names[opponent]} won that one.`;
    tone = styles.lose;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.scoreRow}>
        {[you, opponent].map((i) => (
          <div
            key={i}
            className={`${styles.side} ${!finished && view.myTurn === (i === you) ? styles.sideOn : ""}`.trim()}
            style={{ "--chip": colours[i] }}
          >
            <span className={styles.chipDisc} />
            <span className={styles.sideName}>{i === you ? "You" : names[i]}</span>
            <span className={styles.wins} aria-label={`${wins[i]} of ${target} wins`}>
              {Array.from({ length: target }, (_, k) => (
                <span key={k} className={`${styles.pip} ${k < wins[i] ? styles.pipOn : ""}`.trim()} />
              ))}
            </span>
          </div>
        ))}
      </div>

      <p className={`${styles.status} ${tone}`.trim()} role="status">
        {status}
      </p>

      <Board
        board={board}
        lastMove={view.lastMove}
        line={view.line}
        colours={colours}
        hoverPlayer={you}
        legal={view.legal}
        disabled={!view.myTurn || finished}
        onColumn={(col) => send(action(ACTION.DROP_DISC, { col }))}
        label="Connect Four board — tap a column to drop a disc"
      />

      {finished && !view.seriesOver && (
        <button
          type="button"
          className={styles.readyBtn}
          disabled={view.ready}
          onClick={() => send(action(ACTION.READY, {}))}
        >
          {view.ready ? "Waiting for your opponent…" : "Ready for the next game"}
        </button>
      )}
      {finished && view.seriesOver && <p className={styles.sub}>Check the big screen for the final result.</p>}
    </div>
  );
}
