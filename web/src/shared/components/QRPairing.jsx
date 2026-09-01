import { useEffect, useState } from "react";
import { Smartphone, RotateCcw, Wifi, WifiOff } from "lucide-react";
import { Button } from "./Button";
import styles from "./qrPairing.module.css";

// Drops into a game's setup screen (wrap in <SetupBlock>) to let players
// pair a phone as a controller. `session` is a useHostSession(teams)
// instance owned by the game — this component only starts/renders it, it
// never closes it on its own. Collapsed by default so PeerJS is never
// loaded for a session nobody asks to start.
//
// IMPORTANT: this only ever mounts inside the setup screen (Screen unmounts
// its children on every phase change — see shared/components/Screen.jsx),
// so closing the session in this effect's cleanup would disconnect every
// paired phone the instant the host leaves setup and starts the game. The
// session is only ever closed by an explicit "Play without phones" tap.
export function QRPairing({ session, teams = [] }) {
  // The session outlives this component (see note above), so a remount —
  // e.g. "New Quiz" bouncing back through the setup screen — should show
  // whatever's already running instead of defaulting back to collapsed.
  const [expanded, setExpanded] = useState(() => session.status !== "idle");
  const [qrDataUrl, setQrDataUrl] = useState(null);

  useEffect(() => {
    // Guard against re-starting a session that's already starting/ready/
    // errored from a previous mount — only a genuinely fresh toggle (status
    // still "idle") should open a new one.
    if (expanded && session.status === "idle") session.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  function handleDismiss() {
    session.close();
    setExpanded(false);
  }

  useEffect(() => {
    let cancelled = false;
    if (!session.qrUrl) {
      setQrDataUrl(null);
      return undefined;
    }
    import("qrcode")
      .then(({ default: QRCode }) => QRCode.toDataURL(session.qrUrl, { margin: 1, width: 240 }))
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [session.qrUrl]);

  if (!expanded) {
    return (
      <button type="button" className={styles.toggle} onClick={() => setExpanded(true)}>
        <Smartphone size={16} strokeWidth={2.25} />
        Add phone controllers <span className={styles.optional}>(optional)</span>
      </button>
    );
  }

  return (
    <div className={styles.card}>
      {session.status === "starting" && <p className={styles.status}>Starting a session…</p>}

      {session.status === "error" && (
        <div className={styles.status}>
          <p>{session.error}</p>
          <Button variant="secondary" onClick={() => session.start()}>
            <RotateCcw size={15} /> Retry
          </Button>
        </div>
      )}

      {session.status === "ready" && (
        <div className={styles.ready}>
          <div className={styles.qrBlock}>
            {qrDataUrl && <img className={styles.qrImg} src={qrDataUrl} alt="Scan to join as a controller" />}
            <p className={styles.code}>{session.code}</p>
            <p className={styles.hint}>Scan, or type the code at the site's /controller.html page</p>
          </div>

          <ul className={styles.players}>
            {session.players.length === 0 && <li className={styles.empty}>No phones connected yet</li>}
            {session.players.map((p) => (
              <li key={p.playerId} className={styles.player}>
                {p.connected ? (
                  <Wifi size={14} strokeWidth={2.5} className={styles.online} />
                ) : (
                  <WifiOff size={14} strokeWidth={2.5} className={styles.offline} />
                )}
                <span className={styles.playerName}>{p.name}</span>
                {teams.length > 1 && (
                  <select
                    className={styles.teamSelect}
                    value={p.teamId || ""}
                    onChange={(e) => session.assignPlayerTeam(p.playerId, e.target.value || null)}
                  >
                    <option value="">No team</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button type="button" className={styles.dismiss} onClick={handleDismiss}>
        Play without phones
      </button>
    </div>
  );
}
