import styles from "./picker.module.css";

// Ports renderGroupedPicker() + the ~8 near-identical "theme/category card"
// factories found across games. `groups` = { groupLabel: Array<{ key, icon,
// name, meta }> } — build it with utils/random.js's groupKeys() when a game
// has real sub-groups (Spy Word, Quiz Night), or just `{ "Pick one": items }`
// for the common flat case (every party game).
export function GroupedPicker({ groups, value, onChange }) {
  return (
    <div className={styles.grid}>
      {Object.entries(groups).map(([label, items]) => (
        <div key={label}>
          <h3 className={styles.groupLabel}>{label}</h3>
          <div className={styles.groupRow}>
            {items.map((item) => (
              <PickerCard
                key={item.key}
                item={item}
                selected={item.key === value}
                onClick={() => onChange(item.key)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function PickerCard({ item, selected, onClick }) {
  return (
    <button
      type="button"
      className={`${styles.card} ${selected ? styles.selected : ""}`.trim()}
      onClick={onClick}
    >
      {item.icon && (
        <span className={styles.cardIcon} aria-hidden="true">
          {item.icon}
        </span>
      )}
      <span className={styles.cardName}>{item.name}</span>
      {item.meta && <span className={styles.cardMeta}>{item.meta}</span>}
    </button>
  );
}

// Single-select pill row (Two Truths' "Statement #N is the lie" picker, and
// any similar small-N choice).
export function SelectPillRow({ options, value, onChange, cols = 3 }) {
  return (
    <div className={styles.pillRow} style={{ "--cols": cols }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`${styles.pill} ${opt.value === value ? styles.selected : ""}`.trim()}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
