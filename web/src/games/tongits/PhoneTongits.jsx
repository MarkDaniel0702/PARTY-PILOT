import { useEffect, useMemo, useState } from "react";
import { Layers, RotateCcw } from "lucide-react";
import { PlayingCard } from "../../shared/cards/PlayingCard";
import { ACTION, action } from "../../shared/controller/protocol";
import { meldType, canExtendMeld, rankLabel, SUIT_LABEL } from "./engine";
import cardStyles from "../../shared/cards/cards.module.css";
import styles from "./phoneTongits.module.css";

// The private Tong-Its screen: your own hand, the shared table melds, and
// (on your turn) the draw/meld/sapaw/discard controls. `view` is the
// TONGITS descriptor the host pushed — see protocol.js's VIEW.TONGITS
// comment — carrying only this seat's own hand, never anyone else's. All
// rules are re-checked locally purely so an invalid tap gets instant
// feedback instead of a silent round trip; the host is the real authority
// and re-validates everything regardless.
export function PhoneTongits({ view, send }) {
  const hand = view.hand || [];
  const melds = view.melds || [];
  const myTurn = !!view.myTurn;
  const canAct = myTurn && view.turnStage === "act";
  const canDraw = myTurn && view.turnStage === "draw";

  const [selected, setSelected] = useState([]);

  // A fresh turn (or the turn moving on) clears any stale selection.
  useEffect(() => {
    setSelected([]);
  }, [myTurn, view.turnStage]);

  const selectedCards = useMemo(
    () => selected.map((id) => hand.find((c) => c.id === id)).filter(Boolean),
    [selected, hand]
  );
  const proposedMeldType = useMemo(
    () => (selectedCards.length >= 3 ? meldType(selectedCards) : null),
    [selectedCards]
  );
  const sapawTargets = useMemo(() => {
    if (selectedCards.length !== 1) return new Set();
    const [card] = selectedCards;
    return new Set(melds.filter((m) => canExtendMeld(m, card)).map((m) => m.id));
  }, [selectedCards, melds]);

  function toggleCard(cardId) {
    if (!canAct) return;
    setSelected((prev) => (prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]));
  }

  function handleLayMeld() {
    if (!proposedMeldType) return;
    send(action(ACTION.LAY_MELD, { cardIds: selected }));
    setSelected([]);
  }

  function handleSapaw(meldId) {
    if (selectedCards.length !== 1 || !sapawTargets.has(meldId)) return;
    send(action(ACTION.ADD_TO_MELD, { meldId, cardId: selectedCards[0].id }));
    setSelected([]);
  }

  // Mirrors the engine: the card just taken from the discard can't go straight back.
  const blockedDiscard = !!view.justDrawnFromDiscard && selectedCards[0]?.id === view.justDrawnId;

  function handleDiscard() {
    if (selectedCards.length !== 1 || blockedDiscard) return;
    send(action(ACTION.DISCARD, { cardId: selectedCards[0].id }));
    setSelected([]);
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.lead}>{view.title || (myTurn ? "Your turn" : "Tong-Its")}</p>
      {view.subtitle && <p className={styles.sub}>{view.subtitle}</p>}

      {canDraw && (
        <div className={styles.drawRow}>
          <button type="button" className={styles.drawBtn} onClick={() => send(action(ACTION.DRAW_STOCK, {}))}>
            <Layers size={18} strokeWidth={2.5} aria-hidden="true" />
            Draw pile
            <span className={styles.drawCount}>{view.stockCount}</span>
          </button>
          <button
            type="button"
            className={styles.drawBtn}
            disabled={!view.discardTop}
            onClick={() => send(action(ACTION.DRAW_DISCARD, {}))}
          >
            {view.discardTop ? (
              <PlayingCard card={view.discardTop} size="sm" />
            ) : (
              <span className={styles.emptyPile}>Discard empty</span>
            )}
            Take discard
          </button>
        </div>
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
            disabled={!canAct}
            selected={selected.includes(card.id)}
            className={card.id === view.justDrawnId ? cardStyles.dealt : ""}
            onClick={canAct ? () => toggleCard(card.id) : undefined}
          />
        ))}
      </div>

      {canAct && (
        <div className={styles.actionBar}>
          <button type="button" className={styles.actionBtn} disabled={!proposedMeldType} onClick={handleLayMeld}>
            Lay {proposedMeldType ? (proposedMeldType === "set" ? "set" : "run") : "meld"}
          </button>
          <button type="button" className={styles.actionBtn} disabled={selectedCards.length !== 1 || blockedDiscard} onClick={handleDiscard}>
            Discard
          </button>
          {selected.length > 0 && (
            <button type="button" className={styles.clearBtn} onClick={() => setSelected([])}>
              <RotateCcw size={13} strokeWidth={2.5} /> Clear
            </button>
          )}
        </div>
      )}

      {canAct && selectedCards.length > 0 && (
        <p className={styles.hint}>
          {selectedCards.map((c) => `${rankLabel(c.rank)}${SUIT_LABEL[c.suit]}`).join(", ")}
          {proposedMeldType ? ` — valid ${proposedMeldType}` : selectedCards.length >= 3 ? " — not a set or run" : ""}
          {blockedDiscard ? " — can't discard the card you just took" : ""}
        </p>
      )}
    </div>
  );
}
