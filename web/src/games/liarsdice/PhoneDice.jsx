import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, Megaphone } from "lucide-react";
import { Die } from "./Die";
import { ACTION, action } from "../../shared/controller/protocol";
import { bidAllowed, minQuantityFor, FACES } from "./engine";
import styles from "./phoneDice.module.css";

// The private Liar's Dice screen: your own dice, the standing bid and, on your
// turn, the bidding controls. `view` is the DICE descriptor from
// viewBuilder.js — the same one drives a paired phone and the pass-the-device
// screen, so this component has no idea which it is. The engine re-checks every
// bid, so the local checks below only exist to give instant feedback.

// The face you hold most of is the natural thing to open on. Ones are wild, so
// every one in your hand backs any other face — but a bid on ones itself stands
// on real ones alone, which is why [1, 1, 3] suggests 3s (three dice) over 1s.
function commonestFace(dice, wilds) {
  const tally = {};
  dice.forEach((d) => {
    tally[d] = (tally[d] || 0) + 1;
  });
  let best = 2;
  let bestCount = 0;
  FACES.forEach((f) => {
    const n = (tally[f] || 0) + (wilds && f !== 1 ? tally[1] || 0 : 0);
    if (n > bestCount || (n === bestCount && n > 0 && f > best)) {
      best = f;
      bestCount = n;
    }
  });
  return bestCount ? best : 2;
}

function BidText({ bid }) {
  return (
    <span className={styles.bidText}>
      <strong>{bid.quantity}</strong>
      <span aria-hidden="true">×</span>
      <Die value={bid.face} size="md" />
      <span className={styles.srOnly}>{`${bid.quantity} times ${bid.face}`}</span>
    </span>
  );
}

export function PhoneDice({ view, send, showRound = true }) {
  const { bid, totalDice } = view;
  const bidKey = bid ? `${bid.quantity}-${bid.face}` : "none";
  const defaultFace = bid ? bid.face : commonestFace(view.dice, view.wilds);

  const [face, setFace] = useState(defaultFace);
  const [quantity, setQuantity] = useState(() =>
    bid ? minQuantityFor(bid, defaultFace) : Math.max(1, Math.round(totalDice / 3))
  );

  // A new bid, a new round or a fresh turn starts the picker from the sensible
  // next step: raise the quantity on the same face (or open on your best face).
  useEffect(() => {
    const f = bid ? bid.face : commonestFace(view.dice, view.wilds);
    setFace(f);
    setQuantity(bid ? minQuantityFor(bid, f) : Math.max(1, Math.round(totalDice / 3)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bidKey, view.round, view.myTurn]);

  const minQ = useMemo(() => minQuantityFor(bid, face), [bid, face]);
  const canBid = view.myTurn && bidAllowed(bid, totalDice, quantity, face);
  // When the standing bid already claims every die on the table there is
  // nothing left to raise to — the only move is to call it.
  const maxedOut = !!bid && FACES.every((f) => minQuantityFor(bid, f) > totalDice);

  function pickFace(f) {
    setFace(f);
    setQuantity((q) => Math.min(totalDice, Math.max(q, minQuantityFor(bid, f))));
  }

  const place = () => canBid && send(action(ACTION.BID, { quantity, face }));
  const liar = () => view.myTurn && bid && send(action(ACTION.CALL_LIAR, {}));

  // ---------------------------------------------------------------- game over
  if (view.phase === "over") {
    return (
      <div className={styles.wrap}>
        <p className={styles.lead}>{view.youWon ? "You won! 🏆" : `${view.winner || "Someone"} wins`}</p>
        <p className={styles.sub}>Check the big screen for the final standings.</p>
      </div>
    );
  }

  // ---------------------------------------------------------------- reveal
  if (view.phase === "reveal" && view.reveal) {
    const r = view.reveal;
    return (
      <div className={styles.wrap}>
        <p className={styles.lead}>
          {r.challenger} called {r.bidder} a liar!
        </p>
        <p className={styles.sub}>
          The bid was <BidText bid={r.bid} />
        </p>
        <div className={styles.hands}>
          {r.hands.map((h) => (
            <div key={h.name} className={`${styles.hand} ${h.mine ? styles.handMine : ""}`.trim()}>
              <span className={styles.handName}>{h.mine ? "You" : h.name}</span>
              <span className={styles.handDice}>
                {h.dice.map((d, i) => (
                  <Die
                    key={i}
                    value={d}
                    size="sm"
                    mark={d === r.bid.face ? "match" : view.wilds && d === 1 && r.bid.face !== 1 ? "wild" : null}
                    dim={!(d === r.bid.face || (view.wilds && d === 1 && r.bid.face !== 1))}
                  />
                ))}
              </span>
            </div>
          ))}
        </div>
        <p className={`${styles.verdict} ${r.bidWasGood ? styles.good : styles.bluff}`.trim()}>
          {r.matching} on the table — the bid was {r.bidWasGood ? "good" : "a bluff"}.{" "}
          {r.loserIsMe ? "You lose a die." : `${r.loser} loses a die.`}
          {r.eliminated ? (r.loserIsMe ? " You're out!" : ` ${r.loser} is out!`) : ""}
        </p>
        <button type="button" className={styles.primary} disabled={view.ready} onClick={() => send(action(ACTION.READY, {}))}>
          {view.ready ? "Waiting for the others…" : "Next round"}
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------- bidding
  return (
    <div className={styles.wrap}>
      {showRound && (
        <p className={styles.round}>
          Round {view.round} · {totalDice} dice in play
        </p>
      )}

      {view.out ? (
        <p className={styles.lead}>You're out of dice — watch the big screen.</p>
      ) : (
        <div className={styles.mine}>
          <span className={styles.label}>Your dice</span>
          <div className={styles.myDice}>
            {view.dice.map((d, i) => (
              <Die key={`${view.round}-${i}`} value={d} size="lg" rolling />
            ))}
          </div>
        </div>
      )}

      <div className={styles.bidCard}>
        {bid ? (
          <>
            <span className={styles.label}>{bid.mine ? "Your bid" : `${bid.name} bid`}</span>
            <BidText bid={bid} />
          </>
        ) : (
          <span className={styles.label}>{view.myTurn ? "You open the bidding" : `${view.turnName} opens the bidding`}</span>
        )}
      </div>

      {view.myTurn && !view.out && maxedOut ? (
        <div className={styles.controls}>
          <p className={styles.sub}>Nothing higher is possible — all you can do is call it.</p>
          <button type="button" className={styles.liar} onClick={liar}>
            <Megaphone size={18} strokeWidth={2.5} aria-hidden="true" /> Liar!
          </button>
        </div>
      ) : view.myTurn && !view.out ? (
        <div className={styles.controls}>
          <div className={styles.qtyRow}>
            <button
              type="button"
              className={styles.step}
              aria-label="Fewer dice"
              disabled={quantity <= minQ}
              onClick={() => setQuantity((q) => Math.max(minQ, q - 1))}
            >
              <Minus size={20} strokeWidth={3} />
            </button>
            <span className={styles.qty} aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              className={styles.step}
              aria-label="More dice"
              disabled={quantity >= totalDice}
              onClick={() => setQuantity((q) => Math.min(totalDice, q + 1))}
            >
              <Plus size={20} strokeWidth={3} />
            </button>
          </div>

          <div className={styles.faces} role="group" aria-label="Face to bid on">
            {FACES.map((f) => (
              <button
                key={f}
                type="button"
                className={`${styles.faceBtn} ${f === face ? styles.faceOn : ""}`.trim()}
                disabled={minQuantityFor(bid, f) > totalDice}
                aria-pressed={f === face}
                aria-label={`Bid on ${f}s`}
                onClick={() => pickFace(f)}
              >
                <Die value={f} size="md" />
              </button>
            ))}
          </div>

          <button type="button" className={styles.primary} disabled={!canBid} onClick={place}>
            Bid {quantity} × {face}
          </button>
          {bid && (
            <button type="button" className={styles.liar} onClick={liar}>
              <Megaphone size={18} strokeWidth={2.5} aria-hidden="true" /> Liar!
            </button>
          )}
          {view.wilds && <p className={styles.hint}>Ones are wild — except when you bid on ones.</p>}
        </div>
      ) : (
        !view.out && (
          <p className={styles.sub}>
            {view.turnName ? `Waiting for ${view.turnName} to bid…` : "Waiting…"}
          </p>
        )
      )}

      {view.history.length > 0 && (
        <ol className={styles.history} aria-label="Bids this round">
          {view.history.map((b, i) => (
            <li key={i} className={i === view.history.length - 1 ? styles.latest : ""}>
              <span>{b.name}</span>
              <span className={styles.histBid}>
                {b.quantity} × <Die value={b.face} size="sm" />
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
