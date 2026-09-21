import { CardFrame } from "./CardFrame";
import styles from "./playingCard.module.css";

// Standard 52-card deck face, drawn on the shared CardFrame shell — the
// "later PlayingCard" the frame's own comment already anticipated. Suit- and
// rank-agnostic beyond the card's own { suit, rank } shape, so any game
// dealing off a standard deck (Tong-Its today) can reuse it as-is.

const SUIT_GLYPH = { S: "♠", H: "♥", D: "♦", C: "♣" };
const RANK_LABEL = { 1: "A", 11: "J", 12: "Q", 13: "K" };
// Fixed hex, not theme tokens: a red suit has to stay red in both light and
// dark mode or the deck stops reading correctly at a glance.
const SUIT_COLOUR = { S: "#1b1d2b", C: "#1b1d2b", H: "#e0293b", D: "#e0293b" };

export function rankLabel(rank) {
  return RANK_LABEL[rank] || String(rank);
}

export function cardLabel(card) {
  if (!card) return "card";
  const suitName = { S: "spades", H: "hearts", D: "diamonds", C: "clubs" }[card.suit];
  return `${rankLabel(card.rank)} of ${suitName}`;
}

export function PlayingCard({ card, size = "md", faceDown = false, selected, disabled, onClick, className = "" }) {
  if (!card) return null;
  const colour = SUIT_COLOUR[card.suit];

  return (
    <CardFrame
      size={size}
      faceDown={faceDown}
      selected={selected}
      disabled={disabled}
      onClick={onClick}
      label={faceDown ? "face-down card" : cardLabel(card)}
      className={`${!faceDown ? styles.face : ""} ${className}`.trim()}
      style={faceDown ? undefined : { color: colour }}
    >
      <span className={styles.corner} aria-hidden="true">
        <span className={styles.rank}>{rankLabel(card.rank)}</span>
        <span className={styles.pip}>{SUIT_GLYPH[card.suit]}</span>
      </span>
      <span className={styles.centerPip} aria-hidden="true">{SUIT_GLYPH[card.suit]}</span>
      <span className={`${styles.corner} ${styles.cornerFlipped}`} aria-hidden="true">
        <span className={styles.rank}>{rankLabel(card.rank)}</span>
        <span className={styles.pip}>{SUIT_GLYPH[card.suit]}</span>
      </span>
    </CardFrame>
  );
}
