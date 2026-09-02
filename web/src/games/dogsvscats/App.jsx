import { useEffect, useMemo, useRef, useState } from "react";
import { Swords, Flag, ArrowRight } from "lucide-react";
import { GameShell } from "../../shared/components/GameShell";
import { Screen, ScreenTitle, ScreenSub, BigIcon, SetupBlock } from "../../shared/components/Screen";
import { HowToPlay } from "../../shared/components/HowToPlay";
import { Button, ButtonRow } from "../../shared/components/Button";
import { GroupedPicker } from "../../shared/components/GroupedPicker";
import { Stepper } from "../../shared/components/Stepper";
import { QRPairing } from "../../shared/components/QRPairing";
import { useHostSession } from "../../shared/controller/useHostSession";
import { VIEW, MSG, ACTION, view as viewMsg } from "../../shared/controller/protocol";
import { playSound } from "../../shared/audio/sounds";
import { Battlefield } from "./Battlefield";
import { BATTLEFIELDS } from "./terrain";
import { WEAPONS, weaponById } from "./weapons";
import { createMatch, fire, endTurn, moveActive, activeCharacter, aliveOf, TEAMS } from "./engine";
import styles from "./dogsvscats.module.css";

const TURN_SECONDS = 45;
const FLIGHT_MS = 1500;

const FIELD_ITEMS = BATTLEFIELDS.map((b) => ({
  key: b.id,
  name: b.name,
  icon: b.emoji
}));

export default function App() {
  const [phase, setPhase] = useState("setup"); // setup | play | over
  const [fieldId, setFieldId] = useState(BATTLEFIELDS[0].id);
  const [perTeam, setPerTeam] = useState(2);

  const [match, setMatch] = useState(null);
  const [terrainVersion, setTerrainVersion] = useState(0);
  const [angle, setAngle] = useState(45);
  const [power, setPower] = useState(70);
  const [weaponId, setWeaponId] = useState(WEAPONS[0].id);
  const [shot, setShot] = useState(null);
  const [shotProgress, setShotProgress] = useState(0);
  const [explosion, setExplosion] = useState(null);
  const [turnLeft, setTurnLeft] = useState(TURN_SECONDS);
  const [message, setMessage] = useState("");

  const session = useHostSession([]);
  const { onMessage, sendTo, players: sessionPlayers } = session;

  const actor = match ? activeCharacter(match) : null;
  const team = match ? TEAMS[match.turnTeamIndex] : null;
  const weapon = weaponById(weaponId);
  const busy = !!shot || (match && match.phase !== "aim");

  // Handlers read fresh state through a ref so the listener registers once.
  const ref = useRef();
  ref.current = { match, phase, weaponId, angle, power, busy };

  // ---------- phone gamepad ----------
  useEffect(() => {
    return onMessage((msg) => {
      if (msg.type !== MSG.ACTION) return;
      const st = ref.current;
      if (st.phase !== "play" || st.busy) return;
      const p = msg.payload || {};
      if (msg.kind === ACTION.AIM) {
        if (typeof p.angle === "number") setAngle(p.angle);
        if (typeof p.power === "number") setPower(p.power);
      } else if (msg.kind === ACTION.SELECT_WEAPON) {
        setWeaponId(p.weaponId);
      } else if (msg.kind === ACTION.MOVE) {
        setMatch((m) => (m ? moveActive(m, p.dir > 0 ? 1 : -1) : m));
      } else if (msg.kind === ACTION.FIRE) {
        doFire(p.angle ?? st.angle, p.power ?? st.power, p.weaponId ?? st.weaponId);
      }
    });
  }, [onMessage]);

  // Only the phone belonging to the team on turn gets the controls; everyone
  // else is told to watch, so two people can't aim the same shot at once.
  useEffect(() => {
    if (sessionPlayers.length === 0) return;
    if (phase !== "play" || !team) {
      sessionPlayers.forEach((p) => {
        if (p.connected) {
          sendTo(p.playerId, viewMsg({ view: VIEW.LOBBY, title: "You're in!", subtitle: "Watch the main screen." }));
        }
      });
      return;
    }
    sessionPlayers.forEach((p, i) => {
      if (!p.connected) return;
      // Alternate connected phones between the teams by join order.
      const controls = i % 2 === match.turnTeamIndex;
      sendTo(
        p.playerId,
        viewMsg(
          controls && !busy
            ? {
                view: VIEW.AIM,
                title: `${team.emoji} ${actor?.name || team.name}`,
                subtitle: `Wind ${match.wind > 0 ? "→" : match.wind < 0 ? "←" : "·"} ${Math.abs(match.wind)}`,
                angle,
                power,
                weaponId,
                weapons: WEAPONS.map((w) => ({ id: w.id, name: w.name, emoji: w.emoji }))
              }
            : { view: VIEW.WAIT, title: "Enemy turn", subtitle: "Watch the main screen." }
        )
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, team, actor, angle, power, weaponId, busy, match, sessionPlayers, sendTo]);

  // ---------- turn timer ----------
  useEffect(() => {
    if (phase !== "play" || busy || !match || match.phase === "over") return undefined;
    setTurnLeft(TURN_SECONDS);
    const id = setInterval(() => {
      setTurnLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          setMessage("Out of time!");
          setMatch((m) => (m ? endTurn(m) : m));
          return TURN_SECONDS;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, match?.turnTeamIndex, match?.activeByTeam, busy]);

  function handleStart() {
    const seed = Math.floor(Math.random() * 1e9);
    const m = createMatch({ battlefieldId: fieldId, perTeam, seed });
    setMatch(m);
    setTerrainVersion((v) => v + 1);
    setMessage("");
    setPhase("play");
  }

  function doFire(a, p, wid) {
    const m = ref.current.match;
    if (!m || m.phase !== "aim") return;
    const { state, shot: s } = fire(m, { weaponId: wid, angle: a, power: p });
    playSound("incorrect");
    setMatch(state);
    setTerrainVersion((v) => v + 1);
    setShot(s);
    setShotProgress(0);
  }

  // Animate the (already-resolved) flight, then show the blast and pass the turn.
  useEffect(() => {
    if (!shot) return undefined;
    let raf;
    const start = performance.now();
    const dur = shot.reason === "melee" ? 220 : Math.min(FLIGHT_MS, 220 + shot.path.length * 7);
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      setShotProgress(t);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const w = shot.weapon;
      setExplosion({ x: shot.impact.x, y: shot.impact.y, radius: w.radius, t: 0 });
      playSound("timerEnd");
      const boomStart = performance.now();
      const boom = (n) => {
        const bt = Math.min(1, (n - boomStart) / 420);
        setExplosion((e) => (e ? { ...e, t: bt } : e));
        if (bt < 1) {
          raf = requestAnimationFrame(boom);
          return;
        }
        setExplosion(null);
        setShot(null);
        setMatch((m) => {
          if (!m) return m;
          if (m.winner) return m;
          return endTurn(m);
        });
      };
      raf = requestAnimationFrame(boom);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shot]);

  useEffect(() => {
    if (match?.winner && phase === "play") {
      playSound("complete");
      setPhase("over");
    }
  }, [match?.winner, phase]);

  function handleNewGame() {
    setMatch(null);
    setShot(null);
    setPhase("setup");
  }

  const winnerTeam = match?.winner && match.winner !== "draw" ? TEAMS.find((t) => t.id === match.winner) : null;

  return (
    <GameShell title="DOGS VS CATS" titleIcon={Swords}>
      <Screen active={phase === "setup"}>
        <ScreenTitle>Dogs vs Cats</ScreenTitle>
        <ScreenSub>
          Turn-based artillery. Pick your shot, mind the wind, and blow the ground out from under
          the other team. Every battlefield is generated fresh — no two matches are the same.
        </ScreenSub>

        <HowToPlay
          steps={[
            <>Pick a battlefield and team size, then tap <strong>Start Battle</strong>.</>,
            "Teams alternate turns. On your turn, walk a little, choose a weapon, then set angle and power.",
            <>Watch the <strong>wind</strong> — it pushes shots sideways, and the Fish Lobber especially.</>,
            "Shots blow craters in the ground. Anyone left standing on nothing takes a fall.",
            "Last team with a survivor wins."
          ]}
        />

        <SetupBlock label="1. Battlefield" wide>
          <GroupedPicker groups={{ "Pick one": FIELD_ITEMS }} value={fieldId} onChange={setFieldId} />
        </SetupBlock>

        <SetupBlock label="2. Team size">
          <div className={styles.row}>
            <span>Characters per team</span>
            <Stepper value={perTeam} min={1} max={4} onChange={setPerTeam} />
          </div>
        </SetupBlock>

        <SetupBlock label="3. Phone controllers">
          <QRPairing session={session} teams={[]} />
        </SetupBlock>

        <Button onClick={handleStart}>
          Start Battle <ArrowRight size={15} strokeWidth={2.5} style={{ verticalAlign: "-0.15em" }} />
        </Button>
      </Screen>

      <Screen active={phase === "play"}>
        {match && (
          <>
            <div className={styles.hud}>
              <span className={styles.turnTag} style={{ color: team?.colour }}>
                {team?.emoji} {actor?.name || team?.name}
              </span>
              <span className={styles.wind}>
                Wind {match.wind > 0 ? "→" : match.wind < 0 ? "←" : "·"} {Math.abs(match.wind)}
              </span>
              <span className={busy ? styles.clockIdle : styles.clock}>{turnLeft}s</span>
            </div>

            <Battlefield
              terrain={match.terrain}
              terrainVersion={terrainVersion}
              battlefield={match.battlefield}
              characters={match.characters}
              activeId={actor?.id}
              aim={{ angle, power }}
              shot={shot}
              shotProgress={shotProgress}
              explosion={explosion}
            />

            <div className={styles.teamsRow}>
              {TEAMS.map((t) => (
                <span key={t.id} className={styles.teamCount} style={{ borderColor: t.colour }}>
                  {t.emoji} {aliveOf(match, t.id).length} left
                </span>
              ))}
            </div>

            {message && <p className={styles.message}>{message}</p>}

            <div className={styles.weapons}>
              {WEAPONS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  disabled={busy}
                  className={`${styles.weaponBtn} ${w.id === weaponId ? styles.weaponOn : ""}`.trim()}
                  onClick={() => setWeaponId(w.id)}
                >
                  <span className={styles.weaponEmoji}>{w.emoji}</span>
                  <span className={styles.weaponName}>{w.name}</span>
                </button>
              ))}
            </div>
            <p className={styles.blurb}>{weapon.blurb}</p>

            <div className={styles.controls}>
              <div className={styles.moveRow}>
                <button
                  type="button"
                  className={styles.moveBtn}
                  disabled={busy}
                  onClick={() => setMatch((m) => moveActive(m, -1))}
                >
                  ← Walk
                </button>
                <button
                  type="button"
                  className={styles.moveBtn}
                  disabled={busy}
                  onClick={() => setMatch((m) => moveActive(m, 1))}
                >
                  Walk →
                </button>
              </div>

              <label className={styles.slider}>
                <span>Angle {angle}°</span>
                <input
                  type="range"
                  min={-20}
                  max={200}
                  value={angle}
                  disabled={busy}
                  onChange={(e) => setAngle(Number(e.target.value))}
                />
              </label>
              <label className={styles.slider}>
                <span>Power {power}</span>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={power}
                  disabled={busy}
                  onChange={(e) => setPower(Number(e.target.value))}
                />
              </label>

              <Button disabled={busy} onClick={() => doFire(angle, power, weaponId)}>
                🔥 Fire
              </Button>
            </div>

            <div className={styles.endWrap}>
              <Button variant="secondary" onClick={handleNewGame}>
                <Flag size={14} strokeWidth={2.5} style={{ verticalAlign: "-0.1em" }} /> End battle
              </Button>
            </div>
          </>
        )}
      </Screen>

      <Screen active={phase === "over"}>
        <BigIcon>{winnerTeam ? winnerTeam.emoji : "🤝"}</BigIcon>
        <ScreenTitle>{winnerTeam ? `${winnerTeam.name} win!` : "Everyone's down — a draw!"}</ScreenTitle>
        <ScreenSub>
          {winnerTeam
            ? `${aliveOf(match || { characters: [] }, winnerTeam.id).length} left standing.`
            : "Nobody made it."}
        </ScreenSub>
        <ButtonRow>
          <Button onClick={handleStart}>Rematch</Button>
          <Button variant="secondary" onClick={handleNewGame}>New Battle</Button>
        </ButtonRow>
      </Screen>
    </GameShell>
  );
}
