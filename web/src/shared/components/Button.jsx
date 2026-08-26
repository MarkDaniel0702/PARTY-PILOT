import styles from "./buttons.module.css";

// Ports party.css's .btn-primary / .btn-secondary. `variant` picks the
// visual style; everything else (onClick, disabled, type...) passes through.
export function Button({ variant = "primary", className = "", children, ...rest }) {
  const cls = variant === "secondary" ? styles.secondary : styles.primary;
  return (
    <button type="button" className={`${cls} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}

// Ports .btn-row / .btn-row-3 — a responsive button grid that collapses to
// one column under 640px (handled entirely in CSS, matching the original).
export function ButtonRow({ cols = 2, children, className = "" }) {
  return (
    <div className={`${styles.row} ${className}`.trim()} style={{ "--cols": cols }}>
      {children}
    </div>
  );
}

// Ports .toggle-check (e.g. Categories' elimination-mode switch).
export function ToggleCheck({ label, checked, onChange, className = "" }) {
  return (
    <label className={`${styles.toggle} ${className}`.trim()}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}
