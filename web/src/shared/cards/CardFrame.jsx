import styles from "./cards.module.css";

// The generic card shell every card game shares: size, radius, shadow,
// face-down back, and the selected/disabled/clickable states. UnoCard and
// PlayingCard (standard deck — see shared/cards/PlayingCard.jsx) both draw
// on top of this, keeping the physical card metaphor identical across games.
export function CardFrame({
  size = "md",
  faceDown = false,
  selected = false,
  disabled = false,
  onClick,
  label,
  style,
  className = "",
  children
}) {
  const cls = [
    styles.frame,
    styles[size],
    faceDown ? styles.faceDown : "",
    selected ? styles.selected : "",
    disabled ? styles.disabled : "",
    onClick ? styles.clickable : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  if (!onClick) {
    return (
      <div className={cls} style={style} aria-label={label}>
        {!faceDown && children}
      </div>
    );
  }

  return (
    <button type="button" className={cls} style={style} disabled={disabled} onClick={onClick} aria-label={label}>
      {!faceDown && children}
    </button>
  );
}
