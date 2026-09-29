import { useEffect, useMemo, useRef, useState } from "react";
import { Club, Flag, ArrowRight, PartyPopper, Crown, Spade } from "lucide-react";
import { GameShell } from "../../shared/components/GameShell";
import { Screen, ScreenTitle, ScreenSub, BigIcon, SetupBlock } from "../../shared/components/Screen";
import { HowToPlay } from "../../shared/components/HowToPlay";
import { Button, ButtonRow } from "../../shared/components/Button";
import { Roster } from "../../shared/components/Roster";
import { PassCard } from "../../shared/components/PassCard";
import { QRPairing } from "../../shared/components/QRPairing";
import { useRoster } from "../../shared/hooks/useRoster";
import { useHostSession } from "../../shared/controller/useHostSession";
import { useSeats, seatsMode } from "../../shared/controller/useSeats";
import { VIEW, MSG, ACTION, view as viewMsg } from "../../shared/controller/protocol";
import { playSound } from "../../shared/audio/sounds";
import { PlayingCard } from "../../shared/cards/PlayingCard";
import { PhoneTongits } from "./PhoneTongits";
import {
  createGame,
  currentSeat,
  handFor,
  topDiscard,
  handValue,
  publicView,
  drawStock,
  drawDiscard,
  layMeld,
  addToMeld,
  discard
} from "./engine";
import styles from "./tongits.module.css";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 4;

function justDrawnFor(game, seatId) {
  const ev = game.lastEvent;
  return ev && ev.kind === "draw" && ev.seatId === seatId ? ev.cardId : null;
}

const WIN_HEADLINE = {
  tongits: (name) => `${name} calls TONG-ITS!`,
  discard: (name) => `${name} wins!`,
  showdown: (name) => `${name} wins the showdown!`
};

const WIN_EXPLAIN = {
  tongits: "Melded the entire hand in one turn — no discard needed. The big win.",
  discard: "Melded down to nothing and discarded the last card.",
  showdown: "The draw pile ran dry — lowest card value left in hand takes the round."
};

export default function App() {
  const [phase, setPhase] = useState("setup"); // setup | pass | play | results
  const [game, setGame] = useState(null);
  // Local (pass-and-play) mode only: whether the current seat's hand is
  // currently revealed on the shared screen.
  const [handRevealed, setHandRevealed] = useState(false);

  const roster = useRoster({ min: MIN_PLAYERS, max: MAX_PLAYERS, initialCount: 3 });
  const rosterNames = useMemo(() => roster.getNames(), [roster.getNames]);

  const session = useHostSession([]);
  const { onMessage, sendTo, players: sessionPlayers } = session;

  const seats = useSeats({ sessionPlayers, rosterNames });
  const mode = seatsMode(seats);
  // Frozen at kickoff so a phone dropping mid-round can't reshuffle the
  // seats out from under an in-progress hand.
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

  const namedMelds = useMemo(() => {
    if (!game) return [];
    return game.melds.map((m) => ({ ...m, ownerName: seatById[m.ownerSeatId]?.name || "?" }));
  }, [game, seatById]);

  // ---------- Phone input ----------
  const stateRef = useRef();
  stateRef.current = { game, phase };

  useEffect(() => {
    return onMessage((msg) => {
      if (msg.type !== MSG.ACTION) return;
      const { game, phase } = stateRef.current;
      if (!game || phase !== "play") return;
      const seatId = msg.playerId;
      const payload = msg.payload || {};

      let next = game;
      if (msg.kind === ACTION.DRAW_STOCK) {
        next = drawStock(game, seatId);
        if (next !== game) playSound("timerEndSoft");
      } else if (msg.kind === ACTION.DRAW_DISCARD) {
        next = drawDiscard(game, seatId);
        if (next !== game) playSound("timerEndSoft");
      } else if (msg.kind === ACTION.LAY_MELD) {
        next = layMeld(game, seatId, payload.cardIds);
        if (next !== game) playSound("correct");
      } else if (msg.kind === ACTION.ADD_TO_MELD) {
        next = addToMeld(game, seatId, payload.meldId, payload.cardId);
        if (next !== game) playSound("correct");
      } else if (msg.kind === ACTION.DISCARD) {
        next = discard(game, seatId, payload.cardId);
      }
      if (next !== game) setGame(next);
    });
  }, [onMessage]);

  // Push each phone its own view.
  useEffect(() => {
    if (mode !== "phone" || !game || phase !== "play") return;
    activeSeats.forEach((seat) => {
      if (!seat.playerId) return;
      if (game.winner) {
        sendTo(seat.playerId, viewMsg({ view: VIEW.WAIT, title: "Round over", subtitle: "Check the main screen." }));
        return;
      }
      const isMyTurn = seat.seatId === currentSeat(game);
      sendTo(
        seat.playerId,
        viewMsg({
          view: VIEW.TONGITS,
          title: isMyTurn
            ? game.turnStage === "draw"
              ? "Your turn — draw a card"
              : "Your turn — meld or discard"
            : `${seatById[currentSeat(game)]?.name || "Someone"}'s turn`,
          subtitle: isMyTurn ? undefined : "Watch the table — you'll be up soon.",
          myTurn: isMyTurn,
          turnStage: game.turnStage,
          hand: handFor(game, seat.seatId),
          melds: namedMelds,
          discardTop: topDiscard(game),
          stockCount: game.stock.length,
          justDrawnId: isMyTurn ? game.drawnCardId : null,
          justDrawnFromDiscard: isMyTurn && game.drawnFrom === "discard"
        })
      );
    });
  }, [game, phase, mode, activeSeats, seatById, namedMelds, sendTo]);

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
  // Reuses PhoneTongits as-is: it only ever needs a `view` descriptor and a
  // `send(action(kind, payload))` callback, so the same private-hand UI that
  // runs on a paired phone runs here behind a PassCard reveal instead.
  function commitLocal(next) {
    if (!game || next === game) return;
    setGame(next);
    if (next.winner || currentSeat(next) !== turnSeatId) setHandRevealed(false);
  }

  function localSend(msg) {
    if (!game || !turnSeatId) return;
    const payload = msg.payload || {};
    if (msg.kind === ACTION.DRAW_STOCK) {
      const next = drawStock(game, turnSeatId);
      if (next !== game) playSound("timerEndSoft");
      commitLocal(next);
    } else if (msg.kind === ACTION.DRAW_DISCARD) {
      const next = drawDiscard(game, turnSeatId);
      if (next !== game) playSound("timerEndSoft");
      commitLocal(next);
    } else if (msg.kind === ACTION.LAY_MELD) {
      const next = layMeld(game, turnSeatId, payload.cardIds);
      if (next !== game) playSound("correct");
      commitLocal(next);
    } else if (msg.kind === ACTION.ADD_TO_MELD) {
      const next = addToMeld(game, turnSeatId, payload.meldId, payload.cardId);
      if (next !== game) playSound("correct");
      commitLocal(next);
    } else if (msg.kind === ACTION.DISCARD) {
      commitLocal(discard(game, turnSeatId, payload.cardId));
    }
  }

  const localView =
    game && turnSeatId
      ? {
          myTurn: true,
          turnStage: game.turnStage,
          hand: handFor(game, turnSeatId),
          melds: namedMelds,
          discardTop: topDiscard(game),
          stockCount: game.stock.length,
          justDrawnId: game.drawnCardId,
          justDrawnFromDiscard: game.drawnFrom === "discard"
        }
      : null;

  // ---------- Lifecycle ----------
  useEffect(() => {
    if (game?.winner && phase === "play") {
      playSound("complete");
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

  return (
    <GameShell title="TONG-ITS" titleIcon={Club}>
      <Screen active={phase === "setup"}>
        <ScreenTitle>Tong-Its</ScreenTitle>
        <ScreenSub>
          The classic Filipino card game. Build sets and runs, piggyback onto melds already on the
          table, and empty your hand first — ideally without ever discarding.
        </ScreenSub>

        <HowToPlay
          steps={[
            <>Add 2–4 players, then tap <strong>Deal</strong>. Pair phones to keep every hand private, or skip it and pass the device.</>,
            "Each round, draw one card — from the stock pile or the top of the discard.",
            <>Lay down <strong>sets</strong> (3–4 of a rank, one of each suit) or <strong>runs</strong> (3+ in a row, same suit) from your hand. You can also add a matching card onto <em>any</em> meld already on the table, yours or anyone else's — that's called a <strong>sapaw</strong>.</>,
            "End your turn by discarding one card — unless melding used your whole hand, in which case you go out with nothing to discard.",
            <>Meld your <strong>entire</strong> hand in one turn with no discard left over and you call <strong>Tong-Its!</strong> — an instant win. Meld down to one card and discard it for a normal win.</>,
            "If the draw pile runs out before anyone goes out, the round ends immediately — whoever is holding the least card value wins instead."
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
                    </div>
                  );
                })}
              </div>

              <div className={styles.pileRow}>
                <div className={styles.pileSlot}>
                  <span className={styles.pileLabel}>Stock</span>
                  <PlayingCard card={{ suit: "S", rank: 1 }} faceDown size="md" />
                  <span className={styles.pileCount}>{pub.stockCount} left</span>
                </div>
                <div className={styles.pileSlot}>
                  <span className={styles.pileLabel}>Discard</span>
                  {pub.discardTop ? (
                    <PlayingCard key={pub.discardTop.id} card={pub.discardTop} size="lg" />
                  ) : (
                    <div className={styles.emptySlot}>empty</div>
                  )}
                </div>
              </div>

              {namedMelds.length > 0 && (
                <div className={styles.meldBoard}>
                  {namedMelds.map((m) => (
                    <div key={m.id} className={styles.meldGroup}>
                      <span className={styles.meldOwner}>{m.ownerName}</span>
                      <span className={styles.meldCards}>
                        {m.cards.map((c) => (
                          <PlayingCard key={c.id} card={c} size="sm" />
                        ))}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <p className={styles.turnBanner}>{turnSeat?.name || "—"}'s turn</p>
            </div>

            {mode === "phone" && (
              <p className={styles.phoneNote}>
                Everyone plays from their own phone. {turnSeat?.name || "Someone"} is up.
              </p>
            )}

            {mode === "local" && !handRevealed && !game.winner && (
              <PassCard
                icon={<Spade size={48} strokeWidth={2} />}
                name={turnSeat?.name || ""}
                hint={<>Nobody else look — your hand is about to show.</>}
                buttonLabel="Show my hand"
                onReveal={() => setHandRevealed(true)}
              />
            )}

            {mode === "local" && handRevealed && !game.winner && localView && (
              <div className={styles.localHand}>
                <PhoneTongits view={localView} send={localSend} />
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
        <BigIcon>{game?.winType === "tongits" ? <PartyPopper size={56} /> : <Flag size={56} />}</BigIcon>
        <ScreenTitle>
          <span className={styles.winBurst}>
            {game?.winType ? WIN_HEADLINE[game.winType](winnerName) : `${winnerName} wins!`}
          </span>
        </ScreenTitle>
        <ScreenSub>{game?.winType ? WIN_EXPLAIN[game.winType] : ""}</ScreenSub>
        {game && (
          <ul className={styles.finalList}>
            {activeSeats.map((s) => {
              const hand = handFor(game, s.seatId);
              return (
                <li key={s.seatId} className={styles.finalRow}>
                  <span>
                    {s.name}
                    {s.seatId === game.winner && <Crown size={16} aria-label="winner" style={{ marginLeft: 6, verticalAlign: "-0.15em" }} />}
                  </span>
                  <span className={styles.finalCount}>
                    {hand.length} card{hand.length === 1 ? "" : "s"} · {handValue(hand)} pts
                  </span>
                </li>
              );
            })}
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
