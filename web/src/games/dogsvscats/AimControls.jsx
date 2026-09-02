import styles from "./dogsvscats.module.css";

// The two readouts that replace the old trajectory line, shared by the big
// screen and the phone gamepad so both say exactly the same thing.
//
// Neither of these predicts anything. The dial shows the direction the shot
// leaves; the meter shows how hard you're throwing it. Turning one into the
// other — working out where that actually lands — is the game.

export function AngleDial({ angle, colour, size = 86 }) {
  const rad = (angle * Math.PI) / 180;
  const cx = 40;
  const cy = 40;
  const r = 27;
  return (
    <div className={styles.dial} style={{ "--team": colour }}>
      <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden="true">
        <circle cx={cx} cy={cy} r={r + 5} className={styles.dialFace} />
        {[0, 45, 90, 135, 180].map((tick) => {
          const t = (tick * Math.PI) / 180;
          return (
            <line
              key={tick}
              x1={cx + Math.cos(t) * (r - 3)}
              y1={cy - Math.sin(t) * (r - 3)}
              x2={cx + Math.cos(t) * r}
              y2={cy - Math.sin(t) * r}
              className={styles.dialTick}
            />
          );
        })}
        <line
          x1={cx}
          y1={cy}
          x2={cx + Math.cos(rad) * r}
          y2={cy - Math.sin(rad) * r}
          className={styles.dialNeedle}
        />
        <circle cx={cx} cy={cy} r="3.5" className={styles.dialHub} />
      </svg>
      <span className={styles.dialValue}>{angle}&deg;</span>
      <span className={styles.dialLabel}>Angle</span>
    </div>
  );
}

export function PowerMeter({ power }) {
  const filled = Math.round(power / 10);
  return (
    <div className={styles.meterWrap}>
      <div className={styles.meter}>
        {Array.from({ length: 10 }, (_, i) => (
          <span
            key={i}
            className={i < filled ? styles.meterOn : styles.meterOff}
            style={{ "--seg": `hsl(${140 - i * 14} 72% 52%)` }}
          />
        ))}
      </div>
      <span className={styles.meterValue}>{power}</span>
      <span className={styles.meterLabel}>Power</span>
    </div>
  );
}
