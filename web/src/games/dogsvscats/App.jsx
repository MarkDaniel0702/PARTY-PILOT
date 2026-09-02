import { useCallback, useEffect, useRef, useState } from "react";
import { Swords, Flag, ArrowRight, Wind as WindIcon } from "lucide-react";
import { GameShell } from "../../shared/components/GameShell";
import { Screen, ScreenTitle, ScreenSub, SetupBlock } from "../../shared/components/Screen";
import { HowToPlay } from "../../shared/components/HowToPlay";
import { Button, ButtonRow } from "../../shared/components/Button";
import { GroupedPicker } from "../../shared/components/GroupedPicker";
import { Stepper } from "../../shared/components/Stepper";
import { QRPairing } from "../../shared/components/QRPairing";
import { useHostSession } from "../../shared/controller/useHostSession";
import { VIEW, MSG, ACTION, view as viewMsg } from "../../shared/controller/protocol";
import { playSound } from "../../shared/audio/sounds";
import { Battlefield } from "./Battlefield";
import { FieldThumb } from "./FieldThumb";
import { AngleDial, PowerMeter } from "./AimControls";
import { BATTLEFIELDS } from "./terrain";
import { WEAPONS, weaponById } from "./weapons";
import { createMatch, fire, endTurn, moveActive, activeCharacter, aliveOf, TEAMS, MAX_HP } from "./engine";
import styles from "./dogsvscats.module.css";

const TURN_SECONDS = 45;
const FLIGHT_MS = 1500;
const FLOAT_MS = 1100;
const BANNER_MS = 1500;
const MAX_CRATERS = 40;

const FIELD_ITEMS = BATTLEFIELDS.map((b) => ({
  key: b.id,
  name: b.name,
  icon: <FieldThumb id={b.id} emoji={b.emoji} />
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

  // Presentation-only state: none of this feeds back into the rules.
  const [floats, setFloats] = useState([]);
  const [craters, setCraters] = useState([]);
  const [lastImpact, setLastImpact] = useState(null);
  const [banner, setBanner] = useState(null);

  const session = useHostSession([]);
  const { onMessage, sendTo, players: sessionPlayers } = session;

  const actor = match ? activeCharacter(match) : null;
  const team = match ? TEAMS[match.turnTeamIndex] : null;
  const weapon = weaponById(weaponId);
  const busy = !!shot || (match && match.phase !== "aim");

  // Handlers read fresh state through a ref so the listener registers once.
  const ref = useRef();
  ref.current = { match, phase, weaponId, angle, power, busy, team };

  const doFire = useCallback((a, p, wid) => {
    const st = ref.current;
    const m = st.match;
    if (!m || m.phase !== "aim") return;

    const before = new Map(m.characters.map((c) => [c.id, c.hp]));
    const { state, shot: s } = fire(m, { weaponId: wid, angle: a, power: p });

    // Damage numbers come from diffing HP either side of the resolved shot,
    // so blast damage, direct hits and fall damage are all covered without
    // the engine having to report anything extra.
    const born = performance.now() + (s.reason === "melee" ? 0 : FLIGHT_MS * 0.6);
    const hits = state.characters
      .map((c) => ({ c, lost: (before.get(c.id) ?? 0) - c.hp }))
      .filter(({ lost }) => lost > 0)
      .map(({ c, lost }) => ({ id: c.id + "-" + born, x: c.x, y: c.y, amount: lost, born }));

    playSound("incorrect");
    setMatch(state);
    setTerrainVersion((v) => v + 1);
    setShot(s);
    setShotProgress(0);
    if (hits.length) setFloats((f) => [...f, ...hits]);
  }, []);

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
  }, [onMessage, doFire]);

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
                colour: team.colour,
                hp: actor?.hp ?? MAX_HP,
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

  // ---------- turn-change banner ----------
  useEffect(() => {
    if (phase !== "play" || !match || match.winner) return undefined;
    setBanner({ teamIndex: match.turnTeamIndex, key: Date.now() });
    const t = setTimeout(() => setBanner(null), BANNER_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, match?.turnTeamIndex]);

  // Damage numbers expire on their own.
  useEffect(() => {
    if (floats.length === 0) return undefined;
    const id = setTimeout(() => {
      const cut = performance.now() - FLOAT_MS;
      setFloats((f) => f.filter((x) => x.born > cut));
    }, FLOAT_MS + 120);
    return () => clearTimeout(id);
  }, [floats]);

  function handleStart() {
    const seed = Math.floor(Math.random() * 1e9);
    const m = createMatch({ battlefieldId: fieldId, perTeam, seed });
    setMatch(m);
    setTerrainVersion((v) => v + 1);
    setMessage("");
    setFloats([]);
    setCraters([]);
    setLastImpact(null);
    setPhase("play");
  }

  // Animate the (already-resolved) flight, then show the blast and pass the turn.
  useEffect(() => {
    if (!shot) return undefined;
    const firingTeam = ref.current.team;
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
      // The crater scorch and the spent-shot marker are what replace the aim
      // line: you correct off where the last one actually landed.
      if (shot.reason !== "out" && shot.reason !== "expired") {
        setCraters((c) => [...c, { x: shot.impact.x, y: shot.impact.y, r: w.radius }].slice(-MAX_CRATERS));
      }
      setLastImpact({
        x: shot.impact.x,
        y: shot.impact.y,
        colour: firingTeam?.colour || TEAMS[0].colour,
        born: performance.now()
      });
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

  // ---------- keyboard aiming ----------
  // With no trajectory line, fine adjustment matters, and nudging a slider
  // one degree at a time with the mouse is miserable. Skipped while a form
  // control has focus so the native slider keys still work as expected.
  useEffect(() => {
    if (phase !== "play") return undefined;
    const onKey = (e) => {
      if (ref.current.busy) return;
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const step = e.shiftKey ? 5 : 1;
      switch (e.key) {
        case "ArrowLeft":
          setAngle((a) => Math.min(200, a + step));
          break;
        case "ArrowRight":
          setAngle((a) => Math.max(-20, a - step));
          break;
        case "ArrowUp":
          setPower((p) => Math.min(100, p + step));
          break;
        case "ArrowDown":
          setPower((p) => Math.max(10, p - step));
          break;
        case "a":
        case "A":
          setMatch((m) => (m ? moveActive(m, -1) : m));
          break;
        case "d":
        case "D":
          setMatch((m) => (m ? moveActive(m, 1) : m));
          break;
        case " ": {
          // A focused button already treats Space as "press me"; firing on
          // top of that would walk and shoot from one keystroke.
          if (tag === "BUTTON") return;
          const st = ref.current;
          doFire(st.angle, st.power, st.weaponId);
          break;
        }
        default:
          return;
      }
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, doFire]);

  function handleNewGame() {
    setMatch(null);
    setShot(null);
    setPhase("setup");
  }

  const winnerTeam = match?.winner && match.winner !== "draw" ? TEAMS.find((t) => t.id === match.winner) : null;
  const bannerTeam = banner ? TEAMS[banner.teamIndex] : null;

  return (
    <GameShell title="DOGS VS CATS" titleIcon={Swords}>
      <Screen active={phase === "setup"}>
        <ScreenTitle>Dogs vs Cats</ScreenTitle>
        <ScreenSub>
          Turn-based artillery. Pick your shot, mind the wind, and blow the ground out from under
          the other team. No aiming line — judging the arc is the whole game.
        </ScreenSub>

        <HowToPlay
          steps={[
            <>Pick a battlefield and team size, then tap <strong>Start Battle</strong>.</>,
            "Teams alternate turns. On your turn, walk a little, choose a weapon, then set angle and power.",
            <>There's <strong>no trajectory preview</strong> — you get the direction you're pointing and nothing more. Watch where your last shot landed and walk the next one onto the target.</>,
            <>Mind the <strong>wind</strong> — it pushes shots sideways, and the Fish Lobber especially.</>,
            "Shots blow craters in the ground. Anyone left standing on nothing takes a fall.",
            <>On the big screen: <strong>←/→</strong> angle, <strong>↑/↓</strong> power, <strong>A/D</strong> walk, <strong>Space</strong> fire. Hold Shift for bigger steps.</>,
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
              <TurnCard team={team} actor={actor} />
              <WindGauge wind={match.wind} />
              <ClockRing seconds={turnLeft} total={TURN_SECONDS} idle={busy} />
            </div>

            <div className={styles.stage}>
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
                wind={match.wind}
                craters={craters}
                floats={floats}
                lastImpact={lastImpact}
              />
              {bannerTeam && (
                <div
                  key={banner.key}
                  className={styles.turnBanner}
                  style={{ "--team": bannerTeam.colour }}
                >
                  <span>
                    {bannerTeam.emoji} {bannerTeam.name}' turn
                  </span>
                </div>
              )}
              {message && <p className={styles.message}>{message}</p>}
            </div>

            <div className={styles.squads}>
              {TEAMS.map((t) => (
                <div key={t.id} className={styles.squad} style={{ "--team": t.colour }}>
                  <div className={styles.squadHead}>
                    <span className={styles.squadName}>
                      {t.emoji} {t.name}
                    </span>
                    <span className={styles.squadLeft}>{aliveOf(match, t.id).length} left</span>
                  </div>
                  <div className={styles.squadRow}>
                    {match.characters
                      .filter((c) => c.teamId === t.id)
                      .map((c) => (
                        <span
                          key={c.id}
                          className={[
                            styles.unit,
                            c.alive ? "" : styles.unitDown,
                            c.id === actor?.id ? styles.unitActive : ""
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          <span className={styles.unitName}>{c.name}</span>
                          <span className={styles.unitBar}>
                            <span
                              className={styles.unitFill}
                              style={{
                                width: `${Math.max(0, (c.hp / MAX_HP) * 100)}%`,
                                background: c.hp > 50 ? "#39d98a" : c.hp > 25 ? "#e8a91d" : "#ff6b6b"
                              }}
                            />
                          </span>
                        </span>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.weapons}>
              {WEAPONS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  disabled={busy}
                  className={`${styles.weaponBtn} ${w.id === weaponId ? styles.weaponOn : ""}`.trim()}
                  style={{ "--team": team?.colour }}
                  onClick={() => setWeaponId(w.id)}
                >
                  <span className={styles.weaponEmoji}>{w.emoji}</span>
                  <span className={styles.weaponName}>{w.name}</span>
                  <span className={styles.weaponStats}>
                    {w.damage} dmg · {w.kind === "melee" ? `${w.range} reach` : `${w.radius} blast`}
                  </span>
                </button>
              ))}
            </div>
            <p className={styles.blurb}>{weapon.blurb}</p>

            <div className={styles.controls} style={{ "--team": team?.colour }}>
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

              <div className={styles.aimGrid}>
                <div className={styles.aimCell}>
                  <AngleDial angle={angle} colour={team?.colour} />
                  <input
                    aria-label="Angle"
                    type="range"
                    min={-20}
                    max={200}
                    value={angle}
                    disabled={busy}
                    onChange={(e) => setAngle(Number(e.target.value))}
                  />
                </div>
                <div className={styles.aimCell}>
                  <PowerMeter power={power} />
                  <input
                    aria-label="Power"
                    type="range"
                    min={10}
                    max={100}
                    value={power}
                    disabled={busy}
                    onChange={(e) => setPower(Number(e.target.value))}
                  />
                </div>
              </div>

              <Button disabled={busy} onClick={() => doFire(angle, power, weaponId)}>
                {busy ? "Shot in flight…" : "🔥 Fire"}
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
        <div className={styles.winner} style={{ "--team": winnerTeam?.colour || "var(--accent)" }}>
          <span className={styles.winnerEmoji}>{winnerTeam ? winnerTeam.emoji : "🤝"}</span>
          <ScreenTitle>{winnerTeam ? `${winnerTeam.name} win!` : "Everyone's down — a draw!"}</ScreenTitle>
        </div>
        <ScreenSub>
          {winnerTeam
            ? `${aliveOf(match || { characters: [] }, winnerTeam.id).length} left standing.`
            : "Nobody made it."}
        </ScreenSub>
        {winnerTeam && match && (
          <div className={styles.survivors}>
            {aliveOf(match, winnerTeam.id).map((c) => (
              <span key={c.id} className={styles.survivor} style={{ "--team": winnerTeam.colour }}>
                {winnerTeam.emoji} {c.name}
                <strong>{c.hp} HP</strong>
              </span>
            ))}
          </div>
        )}
        <ButtonRow>
          <Button onClick={handleStart}>Rematch</Button>
          <Button variant="secondary" onClick={handleNewGame}>New Battle</Button>
        </ButtonRow>
      </Screen>
    </GameShell>
  );
}

// ---------- HUD pieces ----------

function TurnCard({ team, actor }) {
  if (!team) return <div className={styles.turnCard} />;
  const hp = actor?.hp ?? MAX_HP;
  return (
    <div className={styles.turnCard} style={{ "--team": team.colour }}>
      <span className={styles.turnAvatar}>{team.emoji}</span>
      <span className={styles.turnBody}>
        <span className={styles.turnTag}>On turn</span>
        <span className={styles.turnName}>{actor?.name || team.name}</span>
        <span className={styles.turnBar}>
          <span
            className={styles.turnFill}
            style={{
              width: `${Math.max(0, (hp / MAX_HP) * 100)}%`,
              background: hp > 50 ? "#39d98a" : hp > 25 ? "#e8a91d" : "#ff6b6b"
            }}
          />
        </span>
      </span>
      <span className={styles.turnHp}>{hp}</span>
    </div>
  );
}

// Wind as a bar you can read across a room, not a number you have to squint
// at — direction from the arrow, strength from how much of the gauge fills.
function WindGauge({ wind }) {
  const strength = Math.min(1, Math.abs(wind) / 12);
  const dir = wind > 0 ? 1 : wind < 0 ? -1 : 0;
  return (
    <div className={styles.wind}>
      <span className={styles.windLabel}>
        <WindIcon size={13} strokeWidth={2.5} aria-hidden="true" /> Wind
      </span>
      <span className={styles.windTrack}>
        <span
          className={styles.windFill}
          style={{
            width: `${strength * 50}%`,
            left: dir >= 0 ? "50%" : `${50 - strength * 50}%`
          }}
        />
        <span className={styles.windCentre} />
      </span>
      <span className={styles.windValue}>
        {dir === 0 ? "calm" : `${Math.abs(wind)} ${dir > 0 ? "→" : "←"}`}
      </span>
    </div>
  );
}

function ClockRing({ seconds, total, idle }) {
  const R = 17;
  const C = 2 * Math.PI * R;
  const frac = Math.max(0, Math.min(1, seconds / total));
  const state = idle ? styles.clockIdle : seconds <= 10 ? styles.clockUrgent : seconds <= 20 ? styles.clockWarn : "";
  return (
    <div className={`${styles.clock} ${state}`.trim()}>
      <svg viewBox="0 0 40 40" width="44" height="44" aria-hidden="true">
        <circle cx="20" cy="20" r={R} className={styles.clockTrack} />
        <circle
          cx="20"
          cy="20"
          r={R}
          className={styles.clockArc}
          strokeDasharray={C}
          strokeDashoffset={C * (1 - frac)}
        />
      </svg>
      <span className={styles.clockText}>{seconds}</span>
    </div>
  );
}
