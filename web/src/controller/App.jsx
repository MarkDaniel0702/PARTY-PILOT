import { useEffect, useState } from "react";
import { Gamepad2, Wifi, WifiOff, RotateCcw } from "lucide-react";
import { useControllerClient } from "../shared/controller/useControllerClient";
import { buzz, action, VIEW, ACTION } from "../shared/controller/protocol";
import { Button } from "../shared/components/Button";
import { SettingsMenu } from "../shared/components/SettingsMenu";
import { UnoCard } from "../games/uno/UnoCard";
import { StrokeCanvas } from "../shared/draw/StrokeCanvas";
import { useStrokeBatcher } from "../shared/draw/useStrokeBatcher";
import { PALETTE, WIDTHS } from "../shared/draw/strokes";
import { PhoneTetris } from "../games/tetris/PhoneTetris";
import cardStyles from "../shared/cards/cards.module.css";
import styles from "./controller.module.css";

// The phone side of a pairing session. This page never runs any game
// logic — the main screen (host) is the single source of truth and pushes
// a small view descriptor; this component only ever renders that.
const RESULT_FLASH_MS = 2500;

export default function App() {
  const { status, error, code, view, send, joinWithName, retry, lastBuzzResult, lastEvent } =
    useControllerClient();
  const [name, setName] = useState("");
  const [buzzed, setBuzzed] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [flash, setFlash] = useState(null); // "won" | "lost" | null
  const [leavingId, setLeavingId] = useState(null);
  const [myStrokes, setMyStrokes] = useState([]);
  const [liveStroke, setLiveStroke] = useState(null);
  const [drawColour, setDrawColour] = useState(PALETTE[0]);
  const [drawWidth, setDrawWidth] = useState(WIDTHS[1]);
  const [guessText, setGuessText] = useState("");
  const [aimAngle, setAimAngle] = useState(45);
  const [aimPower, setAimPower] = useState(70);

  function handleJoin(e) {
    e.preventDefault();
    if (name.trim()) joinWithName(name.trim());
  }

  function handleManualCode(e) {
    e.preventDefault();
    if (manualCode.trim()) {
      window.location.hash = manualCode.trim().toUpperCase();
      window.location.reload();
    }
  }

  function handleBuzz() {
    if (buzzed) return;
    setBuzzed(true);
    send(buzz(`${Date.now()}-${Math.random()}`));
  }

  function handlePlayCard(cardId) {
    // Lift it immediately rather than waiting on the host round-trip, so the
    // tap feels answered; the card leaves the hand for real when the next
    // HAND view arrives.
    setLeavingId(cardId);
    send(action(ACTION.PLAY_CARD, { cardId }));
  }

  function handleDrawCard() {
    send(action(ACTION.DRAW_CARD, {}));
  }

  function handleChoice(optionId) {
    send(action(ACTION.CHOOSE_COLOUR, { colour: optionId }));
  }

  // ---------- drawing ----------
  // The batcher keeps the local line perfectly responsive (onLocal) while
  // shipping points to the host ~20x a second instead of once per event.
  const batcher = useStrokeBatcher({
    onStart: (id, c, w, x, y) => send(action(ACTION.STROKE_START, { id, colour: c, width: w, x, y })),
    onPoints: (id, pts) => send(action(ACTION.STROKE_POINTS, { id, pts })),
    onEnd: (id) => send(action(ACTION.STROKE_END, { id })),
    onLocal: setLiveStroke
  });

  function handleUndo() {
    setMyStrokes((prev) => prev.slice(0, -1));
    send(action(ACTION.UNDO, {}));
  }

  function handleClear() {
    setMyStrokes([]);
    setLiveStroke(null);
    send(action(ACTION.CLEAR, {}));
  }

  function handleStrokeEnd() {
    // Keep a local copy so the drawer's own pad shows the finished line
    // without waiting for anything to come back from the host.
    const finished = liveStroke;
    batcher.end();
    if (finished) setMyStrokes((prev) => [...prev, finished]);
  }

  function handleGuess(e) {
    e.preventDefault();
    const text = guessText.trim();
    if (!text) return;
    setGuessText("");
    send(action(ACTION.GUESS, { text }));
  }

  // A fresh non-buzz view means a new round started — clear any stale lock.
  useEffect(() => {
    if (view && view.view !== VIEW.BUZZ && view.view !== VIEW.LOCKED) setBuzzed(false);
  }, [view]);

  // Any new view means the host has acted, so the optimistic lift is spent.
  useEffect(() => {
    setLeavingId(null);
  }, [view]);

  // Leaving the sketch pad means a new turn — drop the local drawing so the
  // next drawer doesn't inherit the last one.
  useEffect(() => {
    if (view && view.view !== VIEW.DRAW) {
      setMyStrokes([]);
      setLiveStroke(null);
    }
  }, [view]);

  // The host almost always pushes a fresh `view` right after this (next
  // round's BUZZ, or an IDLE "watch the main screen"), so the outcome can't
  // be tied to whatever view is currently showing — it needs its own
  // independent, briefly-visible banner instead.
  useEffect(() => {
    if (!lastBuzzResult) return undefined;
    setFlash(lastBuzzResult.won ? "won" : "lost");
    const t = setTimeout(() => setFlash(null), RESULT_FLASH_MS);
    return () => clearTimeout(t);
  }, [lastBuzzResult]);

  let body;

  if (status === "no-code") {
    body = (
      <form className={styles.form} onSubmit={handleManualCode}>
        <p className={styles.lead}>Enter the code shown on the main screen.</p>
        <input
          className={styles.input}
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          maxLength={6}
          placeholder="ABC123"
          autoCapitalize="characters"
        />
        <Button type="submit" disabled={!manualCode.trim()}>Join</Button>
      </form>
    );
  } else if (status === "error") {
    body = (
      <div className={styles.form}>
        <p className={styles.lead}>
          <WifiOff size={18} strokeWidth={2.25} /> {error || "Connection lost."}
        </p>
        <Button onClick={retry}>
          <RotateCcw size={15} /> Retry
        </Button>
      </div>
    );
  } else if (status === "connecting") {
    body = <p className={styles.lead}>Connecting…</p>;
  } else if (status === "idle") {
    // A code is present (otherwise the hook would have set "no-code") but no
    // stored name was found, so we haven't auto-joined yet — ask for one.
    body = (
      <form className={styles.form} onSubmit={handleJoin}>
        <p className={styles.lead}>What's your name?</p>
        <input
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={16}
          placeholder="Your name"
          autoFocus
        />
        <Button type="submit" disabled={!name.trim()}>Join session {code}</Button>
      </form>
    );
  } else if (status === "connected") {
    if (!view || view.view === VIEW.LOBBY) {
      body = (
        <div className={styles.waiting}>
          <Wifi size={20} strokeWidth={2.25} className={styles.online} />
          <p className={styles.lead}>{view?.title || "You're in!"}</p>
          <p className={styles.sub}>{view?.subtitle || "Waiting for the host to start."}</p>
        </div>
      );
    } else if (view.view === VIEW.BUZZ) {
      body = (
        <div className={styles.buzzWrap}>
          {view.title && <p className={styles.lead}>{view.title}</p>}
          <button
            type="button"
            className={styles.buzzBtn}
            disabled={buzzed}
            onClick={handleBuzz}
          >
            {view.button?.label || "BUZZ"}
          </button>
        </div>
      );
    } else if (view.view === VIEW.HAND) {
      // The only view carrying private state. The host sends it to exactly
      // one player, so no other phone's channel ever receives these cards.
      const playable = new Set(view.playable || []);
      body = (
        <div className={styles.handWrap}>
          <p className={styles.lead}>{view.title || "Your turn"}</p>
          {view.subtitle && <p className={styles.sub}>{view.subtitle}</p>}
          <div className={cardStyles.fan}>
            {(view.cards || []).map((card) => (
              <UnoCard
                key={card.id}
                card={card}
                disabled={!playable.has(card.id)}
                className={[
                  card.id === view.justDrawnId ? cardStyles.dealt : "",
                  card.id === leavingId ? cardStyles.leaving : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={playable.has(card.id) ? () => handlePlayCard(card.id) : undefined}
              />
            ))}
          </div>
          {view.canDraw && (
            <Button variant="secondary" onClick={handleDrawCard}>
              {view.drawLabel || "Draw a card"}
            </Button>
          )}
        </div>
      );
    } else if (view.view === VIEW.CHOICE) {
      body = (
        <div className={styles.form}>
          <p className={styles.lead}>{view.title || "Choose"}</p>
          {view.subtitle && <p className={styles.sub}>{view.subtitle}</p>}
          <div className={styles.choiceGrid}>
            {(view.options || []).map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`${styles.choiceBtn} ${opt.colour ? styles.choiceBtnTinted : ""}`.trim()}
                style={opt.colour ? { background: opt.colour } : undefined}
                onClick={() => handleChoice(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      );
    } else if (view.view === VIEW.DRAW) {
      body = (
        <div className={styles.drawWrap}>
          <p className={styles.drawWord}>{view.word}</p>
          <p className={styles.sub}>{view.title || "Draw it — no letters or numbers!"}</p>
          <StrokeCanvas
            strokes={myStrokes}
            liveStroke={liveStroke}
            interactive
            colour={drawColour}
            width={drawWidth}
            onStrokeStart={batcher.start}
            onStrokePoint={batcher.point}
            onStrokeEnd={handleStrokeEnd}
            label="Your sketch pad"
          />
          <div className={styles.swatches}>
            {(view.colours || PALETTE).map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`colour ${c}`}
                className={`${styles.swatch} ${c === drawColour ? styles.swatchOn : ""}`.trim()}
                style={{ background: c }}
                onClick={() => setDrawColour(c)}
              />
            ))}
          </div>
          <div className={styles.drawTools}>
            {(view.widths || WIDTHS).map((w) => (
              <button
                key={w}
                type="button"
                aria-label={`brush ${w}`}
                className={`${styles.widthBtn} ${w === drawWidth ? styles.widthOn : ""}`.trim()}
                onClick={() => setDrawWidth(w)}
              >
                <span style={{ width: w / 2 + 4, height: w / 2 + 4 }} />
              </button>
            ))}
            <button type="button" className={styles.toolBtn} onClick={handleUndo}>
              Undo
            </button>
            <button type="button" className={styles.toolBtn} onClick={handleClear}>
              Clear
            </button>
          </div>
        </div>
      );
    } else if (view.view === VIEW.GUESS) {
      body = (
        <div className={styles.form}>
          <p className={styles.lead}>{view.title || "What is it?"}</p>
          {view.hint && <p className={styles.hintWord}>{view.hint}</p>}
          {!view.locked && (
            <form className={styles.guessForm} onSubmit={handleGuess}>
              <input
                className={styles.input}
                value={guessText}
                onChange={(e) => setGuessText(e.target.value)}
                maxLength={40}
                placeholder="Type your guess"
                autoComplete="off"
                autoCapitalize="none"
              />
              <Button type="submit" disabled={!guessText.trim()}>
                Guess
              </Button>
            </form>
          )}
          {view.locked && <p className={styles.won}>Nice — sit tight for the next round.</p>}
          {(view.feed || []).length > 0 && (
            <div className={styles.guessFeed}>
              {view.feed.map((f, i) => (
                <p key={i} className={f.correct ? styles.feedHit : styles.feedLine}>
                  <strong>{f.name}</strong> {f.correct ? "got it!" : f.text}
                </p>
              ))}
            </div>
          )}
        </div>
      );
    } else if (view.view === VIEW.TETRIS) {
      // The only view where the phone runs the game itself — see PhoneTetris.
      // Keyed on the seed so a rematch starts a genuinely fresh board.
      body = (
        <PhoneTetris
          key={view.seed}
          seed={view.seed}
          mode={view.mode}
          garbageEvent={lastEvent && lastEvent.kind === "garbage" ? lastEvent.payload : null}
          onState={(snap) => send(action(ACTION.TETRIS_STATE, snap))}
          onGarbage={(rows) => send(action(ACTION.TETRIS_GARBAGE, { rows }))}
          onOver={(res) => send(action(ACTION.TETRIS_OVER, res))}
        />
      );
    } else if (view.view === VIEW.AIM) {
      body = (
        <div className={styles.form}>
          <p className={styles.lead}>{view.title}</p>
          {view.subtitle && <p className={styles.sub}>{view.subtitle}</p>}
          <div className={styles.weaponRow}>
            {(view.weapons || []).map((w) => (
              <button
                key={w.id}
                type="button"
                className={`${styles.weaponPick} ${w.id === view.weaponId ? styles.weaponPickOn : ""}`.trim()}
                onClick={() => send(action(ACTION.SELECT_WEAPON, { weaponId: w.id }))}
              >
                <span aria-hidden="true">{w.emoji}</span>
                <span className={styles.weaponPickName}>{w.name}</span>
              </button>
            ))}
          </div>
          <label className={styles.aimSlider}>
            <span>Angle {aimAngle}&deg;</span>
            <input
              type="range"
              min={-20}
              max={200}
              value={aimAngle}
              onChange={(e) => {
                const v = Number(e.target.value);
                setAimAngle(v);
                send(action(ACTION.AIM, { angle: v, power: aimPower }));
              }}
            />
          </label>
          <label className={styles.aimSlider}>
            <span>Power {aimPower}</span>
            <input
              type="range"
              min={10}
              max={100}
              value={aimPower}
              onChange={(e) => {
                const v = Number(e.target.value);
                setAimPower(v);
                send(action(ACTION.AIM, { angle: aimAngle, power: v }));
              }}
            />
          </label>
          <div className={styles.moveRow}>
            <button type="button" className={styles.toolBtn} onClick={() => send(action(ACTION.MOVE, { dir: -1 }))}>
              ← Walk
            </button>
            <button type="button" className={styles.toolBtn} onClick={() => send(action(ACTION.MOVE, { dir: 1 }))}>
              Walk →
            </button>
          </div>
          <Button
            onClick={() => send(action(ACTION.FIRE, { angle: aimAngle, power: aimPower, weaponId: view.weaponId }))}
          >
            🔥 Fire
          </Button>
        </div>
      );
    } else if (view.view === VIEW.LOCKED || view.view === VIEW.WAIT) {
      body = (
        <div className={styles.waiting}>
          <p className={styles.lead}>{view.title || "Not your turn"}</p>
          <p className={styles.sub}>{view.subtitle || "Hang tight."}</p>
        </div>
      );
    } else {
      body = (
        <div className={styles.waiting}>
          <p className={styles.lead}>{view.title || "Waiting…"}</p>
          {view.subtitle && <p className={styles.sub}>{view.subtitle}</p>}
        </div>
      );
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Gamepad2 size={16} strokeWidth={2.5} aria-hidden="true" />
        <span>B-Rotation Controller</span>
      </header>
      <div className={styles.content}>
        <div className={styles.contentInner}>
          {flash === "won" && <p className={styles.won}>You got it!</p>}
          {flash === "lost" && <p className={styles.lost}>Missed it!</p>}
          {body}
        </div>
      </div>
      <SettingsMenu />
    </main>
  );
}
