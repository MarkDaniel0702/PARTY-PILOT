import { useMemo, useState } from "react";
import { RotateCw, Shuffle, Check } from "lucide-react";
import { BoardGrid } from "./BoardGrid";
import { ACTION, action } from "../../shared/controller/protocol";
import { playSound } from "../../shared/audio/sounds";
import {
  SHIP_DEFS,
  ORIENTATION,
  computeShipCells,
  isInBounds,
  cellLabel,
  shipDef
} from "./engine";
import gridStyles from "./boardGrid.module.css";
import styles from "./phoneBattleship.module.css";

function orientationOf(cells) {
  if (cells.length < 2) return ORIENTATION.H;
  return cells[0][0] === cells[1][0] ? ORIENTATION.H : ORIENTATION.V;
}

// The private ship-placement screen. `view` is the PLACEMENT descriptor the
// host pushed (this player's own fleet only — see protocol.js's VIEW.PLACEMENT
// comment); `send` fires phone -> host actions. All placement rules are
// re-checked locally before sending anything, purely so an invalid tap gets
// an instant shake instead of a silent round trip to the host, which is the
// real authority and will reject it again regardless.
export function PhonePlacement({ view, send }) {
  const ships = view.ships || SHIP_DEFS;
  const placed = view.placed || [];
  const [selectedId, setSelectedId] = useState(() => {
    const firstUnplaced = ships.find((s) => !placed.some((p) => p.shipId === s.id));
    return firstUnplaced ? firstUnplaced.id : ships[0]?.id || null;
  });
  const [orientation, setOrientation] = useState(ORIENTATION.H);
  const [shakeId, setShakeId] = useState(null);

  const placedMap = useMemo(() => new Map(placed.map((p) => [p.shipId, p.cells])), [placed]);
  const occupied = useMemo(() => {
    const set = new Set();
    for (const [shipId, cells] of placedMap) {
      if (shipId === selectedId) continue;
      for (const [r, c] of cells) set.add(`${r},${c}`);
    }
    return set;
  }, [placedMap, selectedId]);

  function flash() {
    playSound("incorrect");
    setShakeId(selectedId);
    setTimeout(() => setShakeId(null), 350);
  }

  function attemptPlacement(shipId, row, col, nextOrientation) {
    const def = shipDef(shipId) || ships.find((s) => s.id === shipId);
    if (!def) return;
    const cells = computeShipCells(row, col, def.size, nextOrientation);
    const fits = cells.every(([r, c]) => isInBounds(r, c));
    const clashes = cells.some(([r, c]) => occupied.has(`${r},${c}`));
    if (!fits || clashes) {
      flash();
      return;
    }
    send(action(ACTION.PLACE_SHIP, { shipId, row, col, orientation: nextOrientation }));
  }

  function handleCellTap(row, col) {
    const shipHere = placed.find((p) => p.cells.some(([r, c]) => r === row && c === col));
    if (shipHere && shipHere.shipId !== selectedId) {
      // Tapping a different ship picks it up instead of trying (and
      // failing) to drop the current selection on top of it.
      setSelectedId(shipHere.shipId);
      setOrientation(orientationOf(shipHere.cells));
      return;
    }
    if (!selectedId) return;
    attemptPlacement(selectedId, row, col, orientation);
    // Optimistically move on to the next unplaced ship so placing the whole
    // fleet is a straight run of taps rather than a select-place-select loop.
    const remaining = ships.filter((s) => s.id !== selectedId && !placedMap.has(s.id));
    if (remaining.length) {
      setSelectedId(remaining[0].id);
      setOrientation(ORIENTATION.H);
    }
  }

  function handleSelect(shipId) {
    setSelectedId(shipId);
    const cells = placedMap.get(shipId);
    setOrientation(cells ? orientationOf(cells) : ORIENTATION.H);
  }

  function handleRotate() {
    if (!selectedId) return;
    const next = orientation === ORIENTATION.H ? ORIENTATION.V : ORIENTATION.H;
    const cells = placedMap.get(selectedId);
    if (cells) {
      attemptPlacement(selectedId, cells[0][0], cells[0][1], next);
    }
    setOrientation(next);
  }

  function handleRemove() {
    if (!selectedId || !placedMap.has(selectedId)) return;
    send(action(ACTION.REMOVE_SHIP, { shipId: selectedId }));
  }

  function handleRandomize() {
    send(action(ACTION.RANDOM_FLEET, {}));
  }

  function handleConfirm() {
    if (!view.allPlaced) return;
    send(action(ACTION.CONFIRM_FLEET, {}));
  }

  function cellRenderer(row, col) {
    const shipHere = placed.find((p) => p.cells.some(([r, c]) => r === row && c === col));
    const def = shipHere ? ships.find((s) => s.id === shipHere.shipId) : null;
    const isSelected = shipHere && shipHere.shipId === selectedId;
    const className = [
      shipHere ? gridStyles.ship : "",
      isSelected ? gridStyles.shipActive : "",
      shakeId && isSelected ? styles.shake : ""
    ]
      .filter(Boolean)
      .join(" ");
    return {
      className,
      style: def ? { "--ship": def.color } : undefined,
      content: shipHere ? (def?.emoji ?? "🚢") : "",
      onClick: () => handleCellTap(row, col),
      ariaLabel: `${cellLabel(row, col)}${def ? `, ${def.name}` : ""}`
    };
  }

  return (
    <div className={styles.placementWrap}>
      <p className={styles.lead}>{view.title || "Place your fleet"}</p>
      <p className={styles.sub}>Tap a ship below, then tap the board to drop it.</p>

      <div className={styles.shipList}>
        {ships.map((def) => {
          const isPlaced = placedMap.has(def.id);
          return (
            <button
              key={def.id}
              type="button"
              className={`${styles.shipChip} ${def.id === selectedId ? styles.shipChipOn : ""}`.trim()}
              style={{ "--ship": def.color }}
              onClick={() => handleSelect(def.id)}
            >
              <span className={styles.shipEmoji}>{def.emoji}</span>
              <span className={styles.shipName}>{def.name}</span>
              <span className={styles.shipSize}>{def.size}</span>
              {isPlaced && <Check size={13} strokeWidth={3} className={styles.shipCheck} aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      <BoardGrid cellRenderer={cellRenderer} ariaLabel="Your fleet placement board" />

      <div className={styles.placementActions}>
        <button type="button" className={styles.toolBtn} onClick={handleRotate} disabled={!selectedId}>
          <RotateCw size={15} strokeWidth={2.5} /> Rotate
        </button>
        <button
          type="button"
          className={styles.toolBtn}
          onClick={handleRemove}
          disabled={!selectedId || !placedMap.has(selectedId)}
        >
          Remove
        </button>
        <button type="button" className={styles.toolBtn} onClick={handleRandomize}>
          <Shuffle size={15} strokeWidth={2.5} /> Randomize
        </button>
      </div>

      <button type="button" className={styles.confirmBtn} disabled={!view.allPlaced} onClick={handleConfirm}>
        <Check size={16} strokeWidth={3} /> Confirm fleet
      </button>
    </div>
  );
}
