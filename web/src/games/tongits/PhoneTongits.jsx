import { useEffect, useMemo, useState } from "react";
import { Layers, RotateCcw, Hand, Swords, Flag } from "lucide-react";
import { PlayingCard } from "../../shared/cards/PlayingCard";
import { ACTION, action } from "../../shared/controller/protocol";
import { meldType, canExtendMeld, rankLabel, handValue, SUIT_LABEL } from "./engine";
import cardStyles from "../../shared/cards/cards.module.css";
import styles from "./phoneTongits.module.css";

// The private Tong-Its screen: your own hand, the shared table melds, and
// (on your turn) the draw/meld/sapaw/discard controls. `view` is the
// TONGITS descriptor the host pushed — see protocol.js's VIEW.TONGITS
// comment — carrying only this seat's own hand, never anyone else's. All
// rules are re-checked locally purely so an invalid tap gets instant
// feedback instead of a silent round trip; the host is the real authority
// and re-validates everything regardless.
//
// Stages: "draw" (draw the stock, take the discard by melding it, or call
// Draw), "act" (meld / sapaw / discard) and "respond" (a Draw was called and
// this seat must Fold or Challenge).
export function PhoneTongits({ view, send }) {
  const hand = view.hand || [];
  const melds = view.melds || [];
  const myTurn = !!view.myTurn;
  const canAct = myTurn && view.turnStage === "act";
  const canDraw = myTurn && view.turnStage === "draw";
  const responding = !!view.responding;
  const top = view.discardTop;

  const [selected, setSelected] = useState([]);

  // A fresh turn (or the turn moving on) clears any stale selection.
  useEffect(() => {
    setSelected([]);
  }, [myTurn, view.turnStage, responding]);

  const selectedCards = useMemo(
    () => selected.map((id) => hand.find((c) => c.id === id)).filter(Boolean),
    [selected, hand]
  );
  // Act stage: a new meld from the selection. Draw stage: the selection plus
  // the top discard — that's the only legal way to take it.
  const proposedMeldType = useMemo(() => {
    if (canDraw) return top && selectedCards.length >= 2 ? meldType([...selectedCards, top]) : null;
    return selectedCards.length >= 3 ? meldType(selectedCards) : null;
  }, [canDraw, top, selectedCards]);

  const sapawTargets = useMemo(() => {
    let card = null;
    if (canAct && selectedCards.length === 1) card = selectedCards[0];
    else if (canDraw && selectedCards.length === 0) card = top;
    if (!card) return new Set();
    return new Set(melds.filter((m) => canExtendMeld(m, card)).map((m) => m.id));
  }, [canAct, canDraw, selectedCards, melds, top]);

  function toggleCard(cardId) {
    if (!canAct && !canDraw) return;
    setSelected((prev) => (prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]));
  }

  function handleLayMeld() {
    if (!proposedMeldType) return;
    if (canDraw) send(action(ACTION.DRAW_DISCARD, { cardIds: selected }));
    else send(action(ACTION.LAY_MELD, { cardIds: selected }));
    setSelected([]);
  }

  function handleSapaw(meldId) {
    if (!sapawTargets.has(meldId)) return;
    if (canDraw) send(action(ACTION.DRAW_DISCARD, { meldId }));
    else send(action(ACTION.ADD_TO_MELD, { meldId, cardId: selectedCards[0].id }));
    setSelected([]);
  }

  function handleDiscard() {
    if (selectedCards.length !== 1) return;
    send(action(ACTION.DISCARD, { cardId: selectedCards[0].id }));
    setSelected([]);
  }

  const points = handValue(hand);

  return (
    <div className={styles.wrap}>
      <p className={styles.lead}>{view.title || (myTurn ? "Your turn" : "Tong-Its")}</p>
      {view.subtitle && <p className={styles.sub}>{view.subtitle}</p>}

      {responding && (
        <div className={styles.respond}>
          <p className={styles.respondText}>
            <strong>{view.callerName}</strong> called <strong>Draw</strong>. You hold <strong>{points} pts</strong> —
            lowest hand wins, and a tie beats the caller.
          </p>
          <div className={styles.actionBar}>
            <button type="button" className={styles.actionBtn} onClick={() => send(action(ACTION.RESPOND_DRAW, { challenge: false }))}>
              <Flag size={14} strokeWidth={2.5} aria-hidden="true" /> Fold
            </button>
            <button type="button" className={styles.actionBtn} onClick={() => send(action(ACTION.RESPOND_DRAW, { challenge: true }))}>
              <Swords size={14} strokeWidth={2.5} aria-hidden="true" /> Challenge
            </button>
          </div>
        </div>
      )}

      {canDraw && (
        <>
          <div className={styles.drawRow}>
            <button type="button" className={styles.drawBtn} onClick={() => send(action(ACTION.DRAW_STOCK, {}))}>
              <Layers size={18} strokeWidth={2.5} aria-hidden="true" />
              Draw pile
              <span className={styles.drawCount}>{view.stockCount}</span>
            </button>
            <button type="button" className={styles.drawBtn} disabled={!proposedMeldType} onClick={handleLayMeld}>
              {top ? <PlayingCard card={top} size="sm" /> : <span className={styles.emptyPile}>Discard empty</span>}
              Take discard
            </button>
            {view.canCallDraw && (
              <button type="button" className={styles.drawBtn} onClick={() => send(action(ACTION.CALL_DRAW, {}))}>
                <Hand size={18} strokeWidth={2.5} aria-hidden="true" />
                Call Draw
              </button>
            )}
          </div>
          <p className={styles.hint}>
            {top
              ? "To take the discard, tap 2+ cards from your hand that make a set or run with it — or tap a glowing meld to add it there."
              : "The discard pile is empty — draw from the pile."}
          </p>
        </>
      )}

      {melds.length > 0 && (
        <div className={styles.table}>
          <p className={styles.tableLabel}>On the table</p>
          <div className={styles.meldRow}>
            {melds.map((m) => {
              const eligible = sapawTargets.has(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`${styles.meldGroup} ${eligible ? styles.meldEligible : ""}`.trim()}
                  disabled={!eligible}
                  onClick={() => handleSapaw(m.id)}
                >
                  <span className={styles.meldOwner}>{m.ownerName}</span>
                  <span className={styles.meldCards}>
                    {m.cards.map((c) => (
                      <PlayingCard key={c.id} card={c} size="sm" />
                    ))}
                  </span>
                  {eligible && <span className={styles.meldAdd}>+ Add</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className={cardStyles.fan}>
        {hand.map((card) => (
          <PlayingCard
            key={card.id}
            card={card}
            disabled={!canAct && !canDraw}
            selected={selected.includes(card.id)}
            className={card.id === view.justDrawnId ? cardStyles.dealt : ""}
            onClick={canAct || canDraw ? () => toggleCard(card.id) : undefined}
          />
        ))}
      </div>

      {(canAct || canDraw) && <p className={styles.points}>Hand value: {points} pts (lowest wins a Draw)</p>}

      {canAct && (
        <div className={styles.actionBar}>
          <button type="button" className={styles.actionBtn} disabled={!proposedMeldType} onClick={handleLayMeld}>
            Lay {proposedMeldType ? (proposedMeldType === "set" ? "set" : "run") : "meld"}
          </button>
          <button type="button" className={styles.actionBtn} disabled={selectedCards.length !== 1} onClick={handleDiscard}>
            Discard
          </button>
          {selected.length > 0 && (
            <button type="button" className={styles.clearBtn} onClick={() => setSelected([])}>
              <RotateCcw size={13} strokeWidth={2.5} /> Clear
            </button>
          )}
        </div>
      )}

      {canDraw && selected.length > 0 && (
        <button type="button" className={styles.clearBtn} onClick={() => setSelected([])}>
          <RotateCcw size={13} strokeWidth={2.5} /> Clear
        </button>
      )}

      {(canAct || canDraw) && selectedCards.length > 0 && (
        <p className={styles.hint}>
          {selectedCards.map((c) => `${rankLabel(c.rank)}${SUIT_LABEL[c.suit]}`).join(", ")}
          {proposedMeldType
            ? ` — valid ${proposedMeldType}`
            : canDraw
              ? selectedCards.length >= 2
                ? " — doesn't make a set or run with the discard"
                : " — pick at least 2"
              : selectedCards.length >= 3
                ? " — not a set or run"
                : ""}
        </p>
      )}
    </div>
  );
}
