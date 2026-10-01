import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dices, Flag, ArrowRight, Skull, WifiOff } from "lucide-react";
import { GameShell } from "../../shared/components/GameShell";
import { Screen, ScreenTitle, ScreenSub, BigIcon, SetupBlock } from "../../shared/components/Screen";
import { HowToPlay } from "../../shared/components/HowToPlay";
import { Button, ButtonRow, ToggleCheck } from "../../shared/components/Button";
import { Roster } from "../../shared/components/Roster";
import { Stepper } from "../../shared/components/Stepper";
import { PassCard } from "../../shared/components/PassCard";
import { QRPairing } from "../../shared/components/QRPairing";
import { OfflineBanner } from "../../shared/components/OfflineBanner";
import { ResultsList } from "../../shared/components/ResultsList";
import { useRoster } from "../../shared/hooks/useRoster";
import { useHostSession } from "../../shared/controller/useHostSession";
import { useSeats, seatsMode, offlineSeats } from "../../shared/controller/useSeats";
import { VIEW, MSG, ACTION, view as viewMsg } from "../../shared/controller/protocol";
import { playSound } from "../../shared/audio/sounds";
import { Die, DiceBack } from "./Die";
import { PhoneDice } from "./PhoneDice";
import { buildDiceView } from "./viewBuilder";
import {
  MIN_DICE_EACH,
  MAX_DICE_EACH,
  DEFAULT_DICE_EACH,
  createGame,
  currentSeat,
  aliveSeats,
  placeBid,
  callLiar,
  nextRound,
  removeSeat,
  standings
} from "./engine";
import styles from "./liarsdice.module.css";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 6;

export default function App() {
  const [phase, setPhase] = useState("setup"); // setup | play | results
  const [game, setGame] = useState(null);
  const [diceEach, setDiceEach] = useState(DEFAULT_DICE_EACH);
  const [wilds, setWilds] = useState(true);
  // Pass-and-play only: is the current player's dice screen showing?
  const [handRevealed, setHandRevealed] = useState(false);
  // Phone play only: seats that tapped "next round" on the reveal.
  const [readySeats, setReadySeats] = useState([]);

  const roster = useRoster({ min: MIN_PLAYERS, max: MAX_PLAYERS, initialCount: 3 });
  const rosterNames = useMemo(() => roster.getNames(), [roster.getNames]);

  const session = useHostSession([]);
  const { onMessage, sendTo, players: sessionPlayers } = session;

  const seats = useSeats({ sessionPlayers, rosterNames });
  const mode = seatsMode(seats);
  // Frozen at the deal so a phone dropping mid-game can't reshuffle the table.
  const [activeSeats, setActiveSeats] = useState([]);
  // How the game is played follows who was seated, not who is connected now —
  // otherwise every phone dropping at once would flip it to pass-and-play and
  // show everyone's dice on the shared screen.
  const playMode = activeSeats.length ? seatsMode(activeSeats) : mode;
  const offline = offlineSeats(activeSeats, sessionPlayers);

  const seatById = useMemo(() => Object.fromEntries(activeSeats.map((s) => [s.seatId, s])), [activeSeats]);
  const nameOf = useCallback((id) => seatById[id]?.name || "Someone", [seatById]);

  // Who opens the next game — rotates on every rematch.
  const openerRef = useRef(0);

  // The listener and the "all ready" check read the live game through a ref,
  // advanced the instant an action lands, so two taps in the same tick can't
  // both act on a stale position.
  const gameRef = useRef(null);
  gameRef.current = game;
  const apply = useCallback((fn) => {
    const g = gameRef.current;
    if (!g) return false;
    const next = fn(g);
    if (next === g) return false;
    gameRef.current = next;
    setGame(next);
    return true;
  }, []);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // ---------- actions (shared by phones and the pass-the-device screen) ----------
  const doBid = useCallback(
    (seatId, quantity, face) => {
      if (apply((g) => placeBid(g, seatId, quantity, face))) {
        playSound("tick");
        return true;
      }
      return false;
    },
    [apply]
  );

  const doLiar = useCallback(
    (seatId) => {
      let eliminated = false;
      const ok = apply((g) => {
        const next = callLiar(g, seatId);
        eliminated = !!next.reveal?.eliminated;
        return next;
      });
      if (ok) playSound(eliminated ? "crash" : "steal");
      return ok;
    },
    [apply]
  );

  const doNextRound = useCallback(() => {
    if (apply(nextRound)) {
      playSound("roll");
      setReadySeats([]);
      setHandRevealed(false);
    }
  }, [apply]);

  // ---------- phone input ----------
  useEffect(() => {
    return onMessage((msg) => {
      if (msg.type !== MSG.ACTION || phaseRef.current !== "play") return;
      const seatId = msg.playerId; // phone seats use playerId as seatId
      const p = msg.payload || {};
      if (msg.kind === ACTION.BID) doBid(seatId, p.quantity, p.face);
      else if (msg.kind === ACTION.CALL_LIAR) doLiar(seatId);
      else if (msg.kind === ACTION.READY && gameRef.current?.phase === "reveal") {
        setReadySeats((r) => (r.includes(seatId) ? r : [...r, seatId]));
      }
    });
  }, [onMessage, doBid, doLiar]);

  // Everyone still playing (and still connected) has seen the reveal: roll again.
  // `offline.length` is a dependency so that a player dropping out while the
  // others are already waiting lets the round start, instead of leaving it for
  // the host to notice.
  useEffect(() => {
    if (playMode !== "phone" || phase !== "play" || game?.phase !== "reveal") return;
    const alive = new Set(aliveSeats(game));
    const needed = activeSeats.filter((s) => alive.has(s.seatId) && !offline.some((o) => o.seatId === s.seatId));
    if (needed.length > 0 && needed.every((s) => readySeats.includes(s.seatId))) doNextRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readySeats, game, phase, playMode, offline.length]);

  // Each phone gets its own view — its own dice and nobody else's.
  useEffect(() => {
    if (playMode !== "phone" || !game || phase !== "play") return;
    activeSeats.forEach((seat) => {
      if (!seat.playerId) return;
      sendTo(seat.playerId, viewMsg(buildDiceView(game, seat.seatId, nameOf, readySeats)));
    });
    // Phones beyond the table's capacity just watch, rather than staring at a
    // stale "waiting for the host to deal" screen for the whole game.
    sessionPlayers.forEach((p) => {
      if (p.connected && !activeSeats.some((s) => s.playerId === p.playerId)) {
        sendTo(p.playerId, viewMsg({ view: VIEW.LOBBY, title: "Spectating", subtitle: "This table is full — watch the big screen." }));
      }
    });
  }, [game, phase, playMode, activeSeats, readySeats, nameOf, sessionPlayers, sendTo]);

  // Lobby view while still on the setup screen.
  useEffect(() => {
    if (mode !== "phone" || phase !== "setup") return;
    sessionPlayers.forEach((p) => {
      if (p.connected) {
        sendTo(p.playerId, viewMsg({ view: VIEW.LOBBY, title: "You're in!", subtitle: "Waiting for the host to deal." }));
      }
    });
  }, [mode, phase, sessionPlayers, sendTo]);

  // ---------- pass-the-device ----------
  const turnSeatId = game && game.phase === "bidding" ? currentSeat(game) : null;
  const localView = playMode === "local" && game && turnSeatId ? buildDiceView(game, turnSeatId, nameOf, []) : null;

  function localSend(msg) {
    if (!turnSeatId) return;
    const p = msg.payload || {};
    if (msg.kind === ACTION.BID) {
      if (doBid(turnSeatId, p.quantity, p.face)) setHandRevealed(false);
    } else if (msg.kind === ACTION.CALL_LIAR) {
      if (doLiar(turnSeatId)) setHandRevealed(false);
    }
  }

  // ---------- lifecycle ----------
  useEffect(() => {
    if (phase === "play" && game?.phase === "over") setPhase("results");
  }, [phase, game?.phase]);

  function newGame(seatList, opener) {
    setActiveSeats(seatList);
    setGame(
      createGame(
        seatList.map((s) => s.seatId),
        { diceEach, wilds, startIndex: opener }
      )
    );
    setHandRevealed(false);
    setReadySeats([]);
    setPhase("play");
    playSound("roll");
  }

  function handleStart() {
    const dealt = seats.slice(0, MAX_PLAYERS);
    openerRef.current = Math.floor(Math.random() * dealt.length);
    newGame(dealt, openerRef.current);
  }

  function handlePlayAgain() {
    openerRef.current += 1;
    newGame(activeSeats, openerRef.current);
  }

  function handleNewGame() {
    setGame(null);
    setActiveSeats([]);
    setPhase("setup");
  }

  const canStart = seats.length >= MIN_PLAYERS;
  const reveal = game?.reveal || null;
  const bid = game?.bid || null;
  const turnName = turnSeatId ? nameOf(turnSeatId) : "";
  const turnOffline = turnSeatId && offline.some((s) => s.seatId === turnSeatId);

  const finalRanked = useMemo(() => {
    if (!game || game.phase !== "over") return [];
    return standings(game).map((id) => ({ name: nameOf(id), score: game.outRounds[id] ?? game.round }));
  }, [game, nameOf]);
  const result = { ranked: finalRanked, winner: finalRanked[0] || null, shared: false, tiebreak: null };

  return (
    <GameShell title="LIAR'S DICE" titleIcon={Dices}>
      <Screen active={phase === "setup"}>
        <ScreenTitle>Liar's Dice</ScreenTitle>
        <ScreenSub>
          Everyone rolls in secret, bids on what's under all the cups — and somebody is always
          lying. Play on your phones, or pass one device around.
        </ScreenSub>

        <HowToPlay
          steps={[
            <>Add players below, then tap <strong>Deal</strong>. Pair phones to keep every roll private, or skip it and pass the device.</>,
            "Everyone rolls their own dice in secret. Take turns bidding on how many dice of one face are on the WHOLE table — yours and everyone else's.",
            <>Each bid must beat the last: <strong>more dice</strong>, or the <strong>same number of a higher face</strong>. Think "at least four 3s".</>,
            <>Think the last bid is a lie? Call <strong>Liar!</strong> Every die is revealed — if the bid was true, the challenger loses a die; if not, the bidder does.</>,
            <>Ones are <strong>wild</strong> and count as any face (unless the bid is on ones themselves) — you can switch this off.</>,
            "Whoever loses a die opens the next round. Lose all your dice and you're out; the last player left wins."
          ]}
        />

        <SetupBlock label="1. Players">
          <Roster
            count={roster.count}
            names={roster.names}
            min={roster.min}
            max={roster.max}
            onCountChange={roster.setCount}
            onNameChange={roster.setName}
            hint="players"
          />
          <p className={styles.modeNote}>
            {mode === "phone"
              ? `${seats.length} phone${seats.length === 1 ? "" : "s"} paired — these players are the game. The list above is ignored.`
              : "No phones paired — the game will pass this device between these players."}
          </p>
        </SetupBlock>

        <SetupBlock label="2. Phone controllers">
          <QRPairing
            session={session}
            teams={[]}
            description="Scan a QR code so your dice stay private on your own phone."
          />
        </SetupBlock>

        <SetupBlock label="3. House rules">
          <div className={styles.rules}>
            <div className={styles.ruleRow}>
              <span>Dice each</span>
              <Stepper value={diceEach} min={MIN_DICE_EACH} max={MAX_DICE_EACH} onChange={setDiceEach} />
            </div>
            <ToggleCheck label="Ones are wild" checked={wilds} onChange={setWilds} />
          </div>
        </SetupBlock>

        <Button disabled={!canStart} onClick={handleStart}>
          Deal <ArrowRight size={15} strokeWidth={2.5} style={{ verticalAlign: "-0.15em" }} />
        </Button>
        {!canStart && (
          <p className={styles.startHint}>Needs at least {MIN_PLAYERS} players — add more, or pair another phone.</p>
        )}
      </Screen>

      <Screen active={phase === "play"}>
        {game && (
          <div className={styles.table}>
            <div className={styles.roundBar}>
              <span className={styles.roundTag}>Round {game.round}</span>
              <span className={styles.diceInPlay}>
                {game.seatOrder.reduce((n, id) => n + game.dice[id].length, 0)} dice in play
                {game.wilds ? " · ones wild" : ""}
              </span>
            </div>

            <div className={styles.seats}>
              {activeSeats.map((seat) => {
                const n = game.dice[seat.seatId].length;
                const isTurn = seat.seatId === turnSeatId;
                const isOut = n === 0;
                const isOffline = offline.some((o) => o.seatId === seat.seatId);
                return (
                  <div
                    key={seat.seatId}
                    className={[styles.seat, isTurn ? styles.seatTurn : "", isOut ? styles.seatOut : ""].filter(Boolean).join(" ")}
                  >
                    <span className={styles.seatName}>
                      {seat.name}
                      {isOffline && <WifiOff size={12} strokeWidth={2.5} aria-label="offline" className={styles.offlineIcon} />}
                    </span>
                    {isOut ? (
                      <span className={styles.outTag}>
                        <Skull size={13} strokeWidth={2.5} aria-hidden="true" /> Out
                      </span>
                    ) : (
                      <DiceBack count={n} size="md" />
                    )}
                  </div>
                );
              })}
            </div>

            {game.phase === "bidding" && (
              <>
                <div className={styles.bidPanel}>
                  {bid ? (
                    <>
                      <span className={styles.bidBy}>{nameOf(bid.seatId)} bid</span>
                      <span className={styles.bidBig}>
                        <strong>{bid.quantity}</strong> × <Die value={bid.face} size="xl" />
                      </span>
                    </>
                  ) : (
                    <span className={styles.bidBy}>No bid yet — {turnName} opens</span>
                  )}
                  <span className={styles.turnLine}>
                    <span className={styles.turnDot} /> {turnName}'s turn{bid ? " — raise it or call Liar!" : ""}
                  </span>
                </div>

                {game.history.length > 1 && (
                  <ol className={styles.history} aria-label="Bids this round">
                    {game.history.slice(-6).map((b, i, arr) => (
                      <li key={i} className={i === arr.length - 1 ? styles.historyLatest : ""}>
                        <span>{nameOf(b.seatId)}</span>
                        <span className={styles.historyBid}>
                          {b.quantity} × <Die value={b.face} size="sm" />
                        </span>
                      </li>
                    ))}
                  </ol>
                )}

                {playMode === "phone" && (
                  <>
                    <p className={styles.phoneNote}>Everyone plays from their own phone. {turnName} is up.</p>
                    <OfflineBanner
                      names={offline.map((s) => s.name)}
                      waitingOn={turnOffline ? turnName : null}
                      onSkip={turnOffline ? () => apply((g) => removeSeat(g, turnSeatId)) : undefined}
                      skipLabel="Remove them from the game"
                    />
                  </>
                )}

                {playMode === "local" && !handRevealed && (
                  <PassCard
                    icon="🎲"
                    name={turnName}
                    hint={<>Nobody else look — your dice are about to show.</>}
                    buttonLabel="Show my dice"
                    onReveal={() => setHandRevealed(true)}
                  />
                )}

                {playMode === "local" && handRevealed && localView && (
                  <div className={styles.localHand}>
                    <PhoneDice view={localView} send={localSend} showRound={false} />
                  </div>
                )}
              </>
            )}

            {game.phase === "reveal" && reveal && (
              <div className={styles.reveal}>
                <p className={styles.revealLead}>
                  {nameOf(reveal.challengerId)} called {nameOf(reveal.bidderId)} a liar!
                </p>
                <p className={styles.revealBid}>
                  The bid: <strong>{reveal.bid.quantity}</strong> × <Die value={reveal.bid.face} size="md" />
                </p>
                <div className={styles.hands}>
                  {game.seatOrder
                    .filter((id) => reveal.dice[id].length > 0)
                    .map((id) => (
                      <div key={id} className={`${styles.hand} ${id === reveal.loserId ? styles.handLoser : ""}`.trim()}>
                        <span className={styles.handName}>{nameOf(id)}</span>
                        <span className={styles.handDice}>
                          {reveal.dice[id].map((d, i) => {
                            const isMatch = d === reveal.bid.face;
                            const isWild = game.wilds && d === 1 && reveal.bid.face !== 1;
                            return <Die key={i} value={d} size="lg" mark={isMatch ? "match" : isWild ? "wild" : null} dim={!isMatch && !isWild} />;
                          })}
                        </span>
                      </div>
                    ))}
                </div>
                <p className={`${styles.verdict} ${reveal.bidWasGood ? styles.verdictGood : styles.verdictBluff}`.trim()}>
                  {reveal.matching} {reveal.matching === 1 ? "die" : "dice"} showed {reveal.bid.face}
                  {game.wilds && reveal.bid.face !== 1 ? " (counting wilds)" : ""} — the bid was{" "}
                  {reveal.bidWasGood ? "good" : "a bluff"}. <strong>{nameOf(reveal.loserId)}</strong> loses a die
                  {reveal.eliminated ? " and is OUT!" : "."}
                </p>
                {playMode === "phone" && (
                  <p className={styles.phoneNote}>
                    Players tap <em>Next round</em> on their phones ({readySeats.length}/
                    {aliveSeats(game).filter((id) => !offline.some((o) => o.seatId === id)).length} ready).
                  </p>
                )}
                <Button onClick={doNextRound}>
                  {aliveSeats(game).length <= 1 ? "See the winner" : "Next round"}{" "}
                  <ArrowRight size={15} strokeWidth={2.5} style={{ verticalAlign: "-0.15em" }} />
                </Button>
              </div>
            )}

            <div className={styles.endWrap}>
              <Button variant="secondary" onClick={handleNewGame}>
                <Flag size={14} strokeWidth={2.5} style={{ verticalAlign: "-0.1em" }} /> End game
              </Button>
            </div>
          </div>
        )}
      </Screen>

      <Screen active={phase === "results"}>
        <BigIcon>🏆</BigIcon>
        <ScreenTitle>{finalRanked[0] ? `${finalRanked[0].name} wins!` : "Game over"}</ScreenTitle>
        <ScreenSub>Last one holding any dice. Here's how long everyone lasted.</ScreenSub>
        {finalRanked.length > 0 && <ResultsList result={result} unit="rounds" unitSingular="round" />}
        <ButtonRow>
          <Button onClick={handlePlayAgain}>Play Again</Button>
          <Button variant="secondary" onClick={handleNewGame}>New Game</Button>
        </ButtonRow>
      </Screen>
    </GameShell>
  );
}
