import { useEffect, useState } from "react";
import { Gamepad2, Wifi, WifiOff, RotateCcw } from "lucide-react";
import { useControllerClient } from "../shared/controller/useControllerClient";
import { buzz, VIEW } from "../shared/controller/protocol";
import { Button } from "../shared/components/Button";
import { SettingsMenu } from "../shared/components/SettingsMenu";
import styles from "./controller.module.css";

// The phone side of a pairing session. This page never runs any game
// logic — the main screen (host) is the single source of truth and pushes
// a small view descriptor; this component only ever renders that.
const RESULT_FLASH_MS = 2500;

export default function App() {
  const { status, error, code, view, send, joinWithName, retry, lastBuzzResult } = useControllerClient();
  const [name, setName] = useState("");
  const [buzzed, setBuzzed] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [flash, setFlash] = useState(null); // "won" | "lost" | null

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

  // A fresh non-buzz view means a new round started — clear any stale lock.
  useEffect(() => {
    if (view && view.view !== VIEW.BUZZ && view.view !== VIEW.LOCKED) setBuzzed(false);
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
    } else if (view.view === VIEW.LOCKED) {
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
