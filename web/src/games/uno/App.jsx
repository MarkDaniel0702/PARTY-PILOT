import { useEffect, useMemo, useRef, useState } from "react";
import { Layers, Flag, ArrowRight } from "lucide-react";
import { GameShell } from "../../shared/components/GameShell";
import { Screen, ScreenTitle, ScreenSub, BigIcon, SetupBlock } from "../../shared/components/Screen";
import { HowToPlay } from "../../shared/components/HowToPlay";
import { Button, ButtonRow } from "../../shared/components/Button";
import { Roster } from "../../shared/components/Roster";
import { PassCard } from "../../shared/components/PassCard";
import { QRPairing } from "../../shared/components/QRPairing";
import { useRoster } from "../../shared/hooks/useRoster";
import { useHostSession } from "../../shared/controller/useHostSession";
import { useSeats, seatsMode } from "../../shared/cards/useSeats";
import { VIEW, MSG, ACTION, view as viewMsg } from "../../shared/controller/protocol";
import { playSound } from "../../shared/audio/sounds";
import { CardFrame } from "../../shared/cards/CardFrame";
import { UnoCard, UNO_COLOUR_HEX } from "./UnoCard";
import {
  COLOURS,
  createGame,
  currentSeat,
  topCard,
  getPlayable,
  handFor,
  publicView,
  playCard,
  chooseColour,
  drawCard,
  passTurn
} from "./engine";
import cardStyles from "../../shared/cards/cards.module.css";
import styles from "./uno.module.css";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;

export default function App() {
  const [phase, setPhase] = useState("setup"); // setup | pass | play | results
  const [game, setGame] = useState(null);
  // Local (pass-and-play) mode only: whether the current seat's hand is
  // currently revealed on the shared screen.
  const [handRevealed, setHandRevealed] = useState(false);

  const roster = useRoster({ min: MIN_PLAYERS, max: MAX_PLAYERS, initialCount: 4 });
  // Depend on getNames (itself memoised on count+names) rather than the
  // roster object, which is a fresh literal on every render.
  const rosterNames = useMemo(() => roster.getNames(), [roster.getNames]);

  const session = useHostSession([]);
  const { onMessage, sendTo, players: sessionPlayers } = session;

  const seats = useSeats({ sessionPlayers, rosterNames });
  const mode = seatsMode(seats);
  // Frozen at kickoff so a phone dropping mid-game can't reshuffle the seats
  // out from under an in-progress hand.
  const [activeSeats, setActiveSeats] = useState([]);

  const seatById = useMemo(() => {
    const map = {};
    activeSeats.forEach((s) => {
      map[s.seatId] = s;
    });
    return map;
  }, [activeSeats]);

  const pub = game ? publicView(game) : null;
  const turnSeatId = game ? currentSeat(game) : null;
  const turnSeat = turnSeatId ? seatById[turnSeatId] : null;

  // ---------- Phone input ----------
  // Read through a ref so the listener registers once instead of
  // resubscribing on every state change (same pattern as the buzz games).
  const stateRef = useRef();
  stateRef.current = { game, phase, seatById };

  useEffect(() => {
    return onMessage((msg) => {
      if (msg.type !== MSG.ACTION) return;
      const { game, phase } = stateRef.current;
      if (!game || phase !== "play") return;
      const seatId = msg.playerId; // phone seats use playerId as seatId

      // Resolved against the ref's current game and applied directly, rather
      // than inside a setGame updater — updaters run twice under StrictMode,
      // which would double-fire the sounds below.
      let next = game;
      if (msg.kind === ACTION.PLAY_CARD) {
        next = playCard(game, seatId, msg.payload?.cardId);
        if (next !== game) playSound("correct");
      } else if (msg.kind === ACTION.DRAW_CARD) {
        next = drawCard(game, seatId);
        if (next !== game) playSound("timerEndSoft");
      } else if (msg.kind === ACTION.CHOOSE_COLOUR) {
        next = chooseColour(game, seatId, msg.payload?.colour);
      }
      if (next !== game) setGame(next);
    });
  }, [onMessage]);

  // Push each phone its own view. The HAND view goes to exactly one player,
  // so no other phone's channel ever carries another player's cards.
  useEffect(() => {
    if (mode !== "phone" || !game || phase !== "play") return;
    activeSeats.forEach((seat) => {
      if (!seat.playerId) return;
      if (game.winner) {
        sendTo(seat.playerId, viewMsg({ view: VIEW.WAIT, title: "Round over", subtitle: "Check the main screen." }));
        return;
      }
      if (game.pendingWild && game.pendingWild.seatId === seat.seatId) {
        sendTo(
          seat.playerId,
          viewMsg({
            view: VIEW.CHOICE,
            title: "Pick a colour",
            options: COLOURS.map((c) => ({ id: c, label: c.toUpperCase(), colour: UNO_COLOUR_HEX[c] }))
          })
        );
        return;
      }
      if (seat.seatId === currentSeat(game) && !game.pendingWild) {
        const playable = getPlayable(game, seat.seatId);
        sendTo(
          seat.playerId,
          viewMsg({
            view: VIEW.HAND,
            title: "Your turn",
            subtitle: playable.length ? "Tap a card to play it." : "No legal card — draw one.",
            cards: handFor(game, seat.seatId),
            playable,
            canDraw: !game.drawnCardId,
            drawLabel: "Draw a card"
          })
        );
        return;
      }
      sendTo(
        seat.playerId,
        viewMsg({
          view: VIEW.HAND,
          title: `${seatById[currentSeat(game)]?.name || "Someone"}'s turn`,
          subtitle: "Your hand — wait for your turn.",
          cards: handFor(game, seat.seatId),
          playable: [],
          canDraw: false
        })
      );
    });
  }, [game, phase, mode, activeSeats, seatById, sendTo]);

  // Lobby view while still on the setup screen.
  useEffect(() => {
    if (mode !== "phone" || phase !== "setup") return;
    sessionPlayers.forEach((p) => {
      if (p.connected) {
        sendTo(p.playerId, viewMsg({ view: VIEW.LOBBY, title: "You're in!", subtitle: "Waiting for the host to deal." }));
      }
    });
  }, [mode, phase, sessionPlayers, sendTo]);

  // ---------- Local (pass-and-play) input ----------
  // Each of these resolves the next state from the `game` already in render
  // scope and commits it directly, so the reveal/sound side effects run
  // exactly once (a setGame updater would run them twice under StrictMode).
  function commitLocal(next, { hideHand }) {
    if (!game || next === game) return;
    setGame(next);
    if (hideHand) setHandRevealed(false);
  }

  function localPlay(cardId) {
    if (!game || !cardId) return;
    const next = playCard(game, turnSeatId, cardId);
    if (next !== game) playSound("correct");
    // A wild keeps the turn on this seat until a colour is picked, so the
    // hand must stay visible; anything else ends the turn and hides it.
    commitLocal(next, { hideHand: !next.pendingWild });
  }

  function localDraw() {
    if (!game) return;
    const next = drawCard(game, turnSeatId);
    if (next !== game) playSound("timerEndSoft");
    // Drawing an unplayable card ends the turn; a playable one keeps it.
    commitLocal(next, { hideHand: currentSeat(next) !== turnSeatId });
  }

  function localPass() {
    if (!game) return;
    commitLocal(passTurn(game, turnSeatId), { hideHand: true });
  }

  function localColour(colour) {
    if (!game) return;
    commitLocal(chooseColour(game, turnSeatId, colour), { hideHand: true });
  }

  // ---------- Lifecycle ----------
  useEffect(() => {
    if (game?.winner && phase === "play") {
      playSound("completion");
      setPhase("results");
    }
  }, [game?.winner, phase]);

  function handleStart() {
    const dealt = seats.slice(0, MAX_PLAYERS);
    setActiveSeats(dealt);
    setGame(createGame(dealt.map((s) => s.seatId)));
    setHandRevealed(false);
    setPhase("play");
  }

  function handlePlayAgain() {
    setGame(createGame(activeSeats.map((s) => s.seatId)));
    setHandRevealed(false);
    setPhase("play");
  }

  function handleNewGame() {
    setGame(null);
    setActiveSeats([]);
    setPhase("setup");
  }

  const canStart = seats.length >= MIN_PLAYERS;
  const winnerName = game?.winner ? seatById[game.winner]?.name : null;
  const localTurnPlayable = game && mode === "local" ? getPlayable(game, turnSeatId) : [];

  return (
    <GameShell title="UNO" titleIcon={Layers}>
      <Screen active={phase === "setup"}>
        <ScreenTitle>UNO</ScreenTitle>
        <ScreenSub>
          Match the colour or the number, dump your hand first. Play with everyone's phone as their
          hand — or pass one device around if nobody's pairing.
        </ScreenSub>

        <HowToPlay
          steps={[
            <>Add players below, then tap <strong>Deal</strong>. Pair phones to keep every hand private, or skip it and pass the device.</>,
            "Play a card matching the discard pile's colour, number, or symbol — wilds go on anything.",
            <><strong>Skip</strong> jumps the next player, <strong>Reverse</strong> flips direction, <strong>+2</strong> and <strong>+4</strong> make the next player draw and lose their turn.</>,
            "No legal card? Draw one — you can play it right away if it works, otherwise your turn passes.",
            "First player to empty their hand wins the round."
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
          <QRPairing session={session} teams={[]} />
        </SetupBlock>

        <Button disabled={!canStart} onClick={handleStart}>
          Deal <ArrowRight size={15} strokeWidth={2.5} style={{ verticalAlign: "-0.15em" }} />
        </Button>
        {!canStart && (
          <p className={styles.startHint}>Needs at least {MIN_PLAYERS} players — add more, or pair another phone.</p>
        )}
      </Screen>

      <Screen active={phase === "play"}>
        {game && pub && (
          <>
            <div className={styles.table}>
              <div className={styles.seatStrip}>
                {activeSeats.map((seat) => {
                  const count = pub.counts.find((c) => c.seatId === seat.seatId)?.count ?? 0;
                  return (
                    <div
                      key={seat.seatId}
                      className={`${styles.seatChip} ${seat.seatId === turnSeatId ? styles.seatChipActive : ""}`.trim()}
                    >
                      <span className={styles.seatName}>{seat.name}</span>
                      <span className={styles.seatCount}>{count}</span>
                      {count === 1 && <span className={styles.unoFlag}>UNO!</span>}
                    </div>
                  );
                })}
              </div>

              <div className={styles.pileRow}>
                <div className={styles.pileSlot}>
                  <span className={styles.pileLabel}>Draw</span>
                  <CardFrame size="md" faceDown label="draw pile" />
                  <span className={styles.pileCount}>{pub.drawPileCount} left</span>
                </div>
                <div className={styles.pileSlot}>
                  <span className={styles.pileLabel}>Discard</span>
                  <UnoCard card={topCard(game)} size="lg" />
                  <span className={styles.colourDot} style={{ background: UNO_COLOUR_HEX[pub.activeColour] }} />
                </div>
              </div>

              <p className={styles.turnBanner}>
                <span style={{ color: UNO_COLOUR_HEX[pub.activeColour] }}>●</span> {turnSeat?.name || "—"}'s turn
                <span className={styles.dirHint}>{pub.direction === 1 ? "↻ clockwise" : "↺ counter-clockwise"}</span>
              </p>
            </div>

            {mode === "phone" && (
              <p className={styles.phoneNote}>
                Everyone plays from their own phone. {turnSeat?.name || "Someone"} is up.
              </p>
            )}

            {mode === "local" && !handRevealed && !game.winner && (
              <PassCard
                icon="🃏"
                name={turnSeat?.name || ""}
                hint={<>Nobody else look — your hand is about to show.</>}
                buttonLabel="Show my hand"
                onReveal={() => setHandRevealed(true)}
              />
            )}

            {mode === "local" && handRevealed && !game.winner && (
              <div className={styles.localHand}>
                {game.pendingWild ? (
                  <>
                    <p className={styles.handTitle}>Pick a colour</p>
                    <div className={styles.colourGrid}>
                      {COLOURS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={styles.colourBtn}
                          style={{ background: UNO_COLOUR_HEX[c] }}
                          onClick={() => localColour(c)}
                        >
                          {c.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <p className={styles.handTitle}>
                      {turnSeat?.name}'s hand
                      {localTurnPlayable.length === 0 && " — no legal card, draw one"}
                    </p>
                    <div className={cardStyles.fan}>
                      {handFor(game, turnSeatId).map((card) => {
                        const playable = localTurnPlayable.includes(card.id);
                        return (
                          <UnoCard
                            key={card.id}
                            card={card}
                            disabled={!playable}
                            onClick={playable ? () => localPlay(card.id) : undefined}
                          />
                        );
                      })}
                    </div>
                    <ButtonRow>
                      <Button variant="secondary" onClick={localDraw} disabled={!!game.drawnCardId}>
                        Draw a card
                      </Button>
                      <Button variant="secondary" onClick={localPass} disabled={!game.drawnCardId}>
                        Pass turn
                      </Button>
                    </ButtonRow>
                  </>
                )}
              </div>
            )}

            <div className={styles.endWrap}>
              <Button variant="secondary" onClick={handleNewGame}>
                <Flag size={14} strokeWidth={2.5} style={{ verticalAlign: "-0.1em" }} /> End Game
              </Button>
            </div>
          </>
        )}
      </Screen>

      <Screen active={phase === "results"}>
        <BigIcon>🏁</BigIcon>
        <ScreenTitle>{winnerName} wins!</ScreenTitle>
        <ScreenSub>Hand emptied first. Cards left with everyone else:</ScreenSub>
        {game && (
          <ul className={styles.finalList}>
            {activeSeats
              .filter((s) => s.seatId !== game.winner)
              .map((s) => (
                <li key={s.seatId} className={styles.finalRow}>
                  <span>{s.name}</span>
                  <span className={styles.finalCount}>{handFor(game, s.seatId).length} cards</span>
                </li>
              ))}
          </ul>
        )}
        <ButtonRow>
          <Button onClick={handlePlayAgain}>Play Again</Button>
          <Button variant="secondary" onClick={handleNewGame}>New Game</Button>
        </ButtonRow>
      </Screen>
    </GameShell>
  );
}
