import { CardFrame } from "../../shared/cards/CardFrame";
import { KIND } from "./engine";
import styles from "./unoCard.module.css";

// UNO-specific card face, drawn on the shared CardFrame shell. It lives with
// the game rather than in shared/cards because it depends on this game's
// KIND constants — only the frame itself is game-agnostic.

// Fixed hex rather than theme tokens: a red UNO card has to stay red in both
// light and dark mode or the game stops making sense.
export const UNO_COLOUR_HEX = {
  red: "#e0293b",
  yellow: "#e8a91d",
  green: "#2fa84f",
  blue: "#2f6fd0"
};

const SYMBOL = {
  [KIND.SKIP]: "⊘",
  [KIND.REVERSE]: "⇄",
  [KIND.DRAW2]: "+2",
  [KIND.WILD]: "✦",
  [KIND.WILD4]: "+4"
};

export function cardLabel(card) {
  if (!card) return "card";
  if (card.kind === KIND.NUMBER) return `${card.colour} ${card.value}`;
  if (card.kind === KIND.WILD) return "wild";
  if (card.kind === KIND.WILD4) return "wild draw four";
  return `${card.colour} ${card.kind}`;
}

export function UnoCard({ card, size = "md", faceDown = false, selected, disabled, onClick, className = "" }) {
  if (!card) return null;

  const isWild = card.colour === "wild";
  const face = card.kind === KIND.NUMBER ? String(card.value) : SYMBOL[card.kind];

  return (
    <CardFrame
      size={size}
      faceDown={faceDown}
      selected={selected}
      disabled={disabled}
      onClick={onClick}
      label={faceDown ? "face-down card" : cardLabel(card)}
      // Face-down must not carry a colour: an inline background would beat
      // the .faceDown card-back pattern in the cascade and leak the colour.
      className={`${!faceDown && isWild ? styles.wild : ""} ${className}`.trim()}
      style={faceDown || isWild ? undefined : { background: UNO_COLOUR_HEX[card.colour] }}
    >
      <span className={styles.pill}>
        <span className={styles.face}>{face}</span>
      </span>
    </CardFrame>
  );
}
