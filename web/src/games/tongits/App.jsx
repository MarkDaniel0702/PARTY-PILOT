import { useEffect, useMemo, useRef, useState } from "react";
import { Club, Flag, ArrowRight, PartyPopper, Crown, Spade, Coins } from "lucide-react";
import { GameShell } from "../../shared/components/GameShell";
import { Screen, ScreenTitle, ScreenSub, BigIcon, SetupBlock } from "../../shared/components/Screen";
import { HowToPlay } from "../../shared/components/HowToPlay";
import { Button, ButtonRow } from "../../shared/components/Button";
import { Roster } from "../../shared/components/Roster";
import { PassCard } from "../../shared/components/PassCard";
import { QRPairing } from "../../shared/components/QRPairing";
import { OfflineBanner } from "../../shared/components/OfflineBanner";
import { useRoster } from "../../shared/hooks/useRoster";
import { useHostSession } from "../../shared/controller/useHostSession";
import { useSeats, seatsMode, offlineSeats } from "../../shared/controller/useSeats";
import { VIEW, MSG, ACTION, view as viewMsg } from "../../shared/controller/protocol";
import { playSound } from "../../shared/audio/sounds";
import { PlayingCard } from "../../shared/cards/PlayingCard";
import { PhoneTongits } from "./PhoneTongits";
import {
  createGame,
  currentSeat,
  actorSeat,
  canCallDraw,
  callDraw,
  respondDraw,
  handFor,
  topDiscard,
  handValue,
  publicView,
  drawStock,
  drawDiscard,
  layMeld,
  addToMeld,
  discard,
  skipTurn
} from "./engine";
import styles from "./tongits.module.css";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 3;

// The TONGITS view descriptor for one seat. Carries only that seat's own hand.
function seatView(game, seatId, seatById, namedMelds) {
  const stage = game.turnStage;
  const actorId = actorSeat(game);
  const isActor = seatId === actorId;
  const responding = stage === "respond" && isActor;
  const myTurn = stage !== "respond" && isActor;
  const turnName = seatById[currentSeat(game)]?.name || "Someone";
  let title;
  let subtitle;
  if (responding) title = "Draw called!";
  else if (stage === "respond") {
    title = `${seatById[actorId]?.name || "Someone"} is deciding…`;
    subtitle = `${turnName} called Draw — fold or challenge.`;
  } else if (myTurn) title = stage === "draw" ? "Your turn — draw a card" : "Your turn — meld or discard";
  else {
    title = `${turnName}'s turn`;
    subtitle = "Watch the table — you'll be up soon.";
  }
  return {
    view: VIEW.TONGITS,
    title,
    subtitle,
    myTurn,
    responding,
    callerName: game.drawCall ? seatById[game.drawCall.callerId]?.name : null,
    canCallDraw: myTurn && canCallDraw(game, seatId),
    turnStage: stage,
    hand: handFor(game, seatId),
    melds: namedMelds,
    discardTop: topDiscard(game),
    stockCount: game.stock.length,
    justDrawnId: myTurn ? game.drawnCardId : null
  };
}

// One entry point for both phone and pass-and-play input: maps an action to
// the engine call and plays the matching sound. Returns the same state object
// when the action was illegal.
function applyAction(game, seatId, kind, payload) {
  let next = game;
  if (kind === ACTION.DRAW_STOCK) {
    next = drawStock(game, seatId);
    if (next !== game) playSound("timerEndSoft");
  } else if (kind === ACTION.DRAW_DISCARD) {
    next = drawDiscard(game, seatId, { cardIds: payload.cardIds, meldId: payload.meldId });
    if (next !== game) playSound("correct");
  } else if (kind === ACTION.LAY_MELD) {
    next = layMeld(game, seatId, payload.cardIds);
    if (next !== game) playSound("correct");
  } else if (kind === ACTION.ADD_TO_MELD) {
    next = addToMeld(game, seatId, payload.meldId, payload.cardId);
    if (next !== game) playSound("correct");
  } else if (kind === ACTION.DISCARD) {
    next = discard(game, seatId, payload.cardId);
  } else if (kind === ACTION.CALL_DRAW) {
    next = callDraw(game, seatId);
    if (next !== game) playSound("timerEndSoft");
  } else if (kind === ACTION.RESPOND_DRAW) {
    next = respondDraw(game, seatId, !!payload.challenge);
  }
  return next;
}

const WIN_HEADLINE = {
  tongits: (name) => `${name} calls TONG-ITS!`,
  draw: (name) => `${name} wins the Draw!`,
  showdown: (name) => `${name} wins the showdown!`
};

function winExplain(game, seatById) {
  if (game.winType === "tongits") return "Emptied their hand — every card melded, sapaw'd or discarded.";
  if (game.winType === "showdown") return "The stock ran out — burned players lose, then lowest hand value wins.";
  const r = game.result;
  const caller = seatById[r.callerId]?.name || "The caller";
  if (!r.challengers.length) return `${caller} called Draw and everyone folded.`;
  const vals = [r.callerId, ...r.challengers].map((id) => `${seatById[id]?.name} ${r.values[id]} pts`).join(" · ");
  return `${caller} called Draw and was challenged. Lowest hand wins, ties beat the caller: ${vals}.`;
}

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
  // Once cards are dealt, how the round is played is fixed by who was seated,
  // not by who happens to be connected right now — otherwise every phone
  // dropping at once would flip the table to pass-and-play and show each
  // hand on the shared screen.
  const playMode = activeSeats.length ? seatsMode(activeSeats) : mode;
  const offline = offlineSeats(activeSeats, sessionPlayers);
  // Which seat deals (and so moves first). Rotates on every rematch.
  const dealerRef = useRef(0);
  // Running chip balances for the whole sitting, carried across rounds.
  const [chips, setChips] = useState({});

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
  // Whoever must act right now — the next responder while a Draw is pending.
  const actorId = game && !game.winner ? actorSeat(game) : null;
  const actor = actorId ? seatById[actorId] : null;

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

      const next = applyAction(game, seatId, msg.kind, payload);
      if (next !== game) setGame(next);
    });
  }, [onMessage]);

  // Push each phone its own view.
  useEffect(() => {
    if (playMode !== "phone" || !game || phase !== "play") return;
    activeSeats.forEach((seat) => {
      if (!seat.playerId) return;
      if (game.winner) {
        sendTo(seat.playerId, viewMsg({ view: VIEW.WAIT, title: "Round over", subtitle: "Check the main screen." }));
        return;
      }
      sendTo(seat.playerId, viewMsg(seatView(game, seat.seatId, seatById, namedMelds)));
    });
    // Phones beyond the table's capacity just watch, rather than staring at a
    // stale "waiting for the host to deal" screen for the whole game.
    sessionPlayers.forEach((p) => {
      if (p.connected && !activeSeats.some((s) => s.playerId === p.playerId)) {
        sendTo(p.playerId, viewMsg({ view: VIEW.LOBBY, title: "Spectating", subtitle: "This table is full — watch the big screen." }));
      }
    });
  }, [game, phase, playMode, activeSeats, seatById, namedMelds, sessionPlayers, sendTo]);

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
  function localSend(msg) {
    if (!game || !actorId) return;
    const next = applyAction(game, actorId, msg.kind, msg.payload || {});
    if (next !== game) {
      setGame(next);
      // Hide the hand whenever the seat on the move changes.
      if (next.winner || actorSeat(next) !== actorId) setHandRevealed(false);
    }
  }

  const localView = game && actorId ? seatView(game, actorId, seatById, namedMelds) : null;

  // ---------- Lifecycle ----------
  useEffect(() => {
    if (game?.winner && phase === "play") {
      playSound("complete");
      setChips((prev) => {
        const next = { ...prev };
        Object.entries(game.result.payments).forEach(([id, amt]) => {
          next[id] = (next[id] || 0) + amt;
        });
        return next;
      });
      setPhase("results");
    }
  }, [game?.winner, game?.result, phase]);

  function handleStart() {
    const dealt = seats.slice(0, MAX_PLAYERS);
    dealerRef.current = 0;
    setChips({});
    setActiveSeats(dealt);
    setGame(createGame(dealt.map((s) => s.seatId), { dealer: dealerRef.current }));
    setHandRevealed(false);
    setPhase("play");
  }

  function handlePlayAgain() {
    // The winner of a round deals the next one.
    const winnerIdx = activeSeats.findIndex((s) => s.seatId === game.winner);
    dealerRef.current = winnerIdx >= 0 ? winnerIdx : dealerRef.current + 1;
    setGame(createGame(activeSeats.map((s) => s.seatId), { dealer: dealerRef.current }));
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
            <>Add 2–3 players, then tap <strong>Deal</strong>. Everyone gets 12 cards, the dealer 13. Pair phones to keep hands private, or pass the device.</>,
            "The dealer starts by discarding one card. After that, each turn begins with a draw.",
            <>Draw from the stock — or take the top discard, but <em>only</em> if you can lay a set or run with it right away (2+ cards from your hand), or add it onto a meld already on the table.</>,
            <>Lay <strong>sets</strong> (3–4 of a rank, different suits) or <strong>runs</strong> (3+ in a row, same suit, Ace low). Add cards onto <em>any</em> meld on the table — that's <strong>sapaw</strong>. Then discard one card.</>,
            <>Get rid of every card (melds, sapaw, or discarding your last) and you win with <strong>Tong-Its</strong>.</>,
            <>Have a meld out and a low hand? Instead of drawing, call <strong>Draw</strong>. Opponents <strong>Fold</strong> or <strong>Challenge</strong> — lowest hand value wins, and ties beat the caller. You can't call Draw if someone added to your melds (or you did) since your last turn.</>,
            <>If you never lay a meld you're <strong>burned</strong>: you auto-fold and lose when the stock runs out. When it does, lowest hand value wins.</>,
            "Chips carry across rounds. The winner deals next."
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
            description="Scan a QR code so every hand stays private on its owner's phone."
          />
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
                      <span className={styles.seatChips} title="Chip balance">
                        <Coins size={11} aria-hidden="true" /> {chips[seat.seatId] || 0}
                      </span>
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

              <p className={styles.turnBanner}>
                {game.turnStage === "respond"
                  ? `${turnSeat?.name || "—"} called Draw — ${actor?.name || "—"} must fold or challenge`
                  : `${turnSeat?.name || "—"}'s turn`}
              </p>
            </div>

            {playMode === "phone" && (
              <p className={styles.phoneNote}>
                Everyone plays from their own phone. {turnSeat?.name || "Someone"} is up.
              </p>
            )}

            {playMode === "phone" && !game.winner && (
              <OfflineBanner
                names={offline.map((s) => s.name)}
                waitingOn={offline.some((s) => s.seatId === actorId) ? actor?.name : null}
                onSkip={
                  offline.some((s) => s.seatId === actorId)
                    ? () => setGame((g) => skipTurn(g, actorSeat(g)))
                    : undefined
                }
              />
            )}

            {playMode === "local" && !handRevealed && !game.winner && (
              <PassCard
                icon={<Spade size={48} strokeWidth={2} />}
                name={actor?.name || ""}
                hint={<>Nobody else look — your hand is about to show.</>}
                buttonLabel="Show my hand"
                onReveal={() => setHandRevealed(true)}
              />
            )}

            {playMode === "local" && handRevealed && !game.winner && localView && (
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
        <ScreenSub>{game?.result ? winExplain(game, seatById) : ""}</ScreenSub>
        {game?.result && (
          <>
            <ul className={styles.finalList}>
              {activeSeats.map((s) => {
                const hand = handFor(game, s.seatId);
                const delta = game.result.payments[s.seatId] || 0;
                const line = game.result.lines.find((l) => l.seatId === s.seatId);
                return (
                  <li key={s.seatId} className={styles.finalRow}>
                    <span>
                      {s.name}
                      {s.seatId === game.winner && <Crown size={16} aria-label="winner" style={{ marginLeft: 6, verticalAlign: "-0.15em" }} />}
                      {line?.burned && <span className={styles.burnedTag}>burned</span>}
                    </span>
                    <span className={styles.finalCount}>
                      {hand.length} card{hand.length === 1 ? "" : "s"} · {handValue(hand)} pts ·{" "}
                      <strong className={delta >= 0 ? styles.gain : styles.loss}>
                        {delta >= 0 ? "+" : ""}
                        {delta}
                      </strong>{" "}
                      chips (total {chips[s.seatId] || 0})
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className={styles.payNote}>
              Winner collects from each loser: base
              {game.winType === "draw" ? " 2 (fold) / 5 (fought)" : " 4"}
              {" "}+ 2 if burned + 2 per Ace/King/Secret/Escalera in the winner's cards
              {game.result.bonusChips ? ` (+${game.result.bonusChips} this round)` : ""}. Ante = 10 chips.
            </p>
          </>
        )}
        <ButtonRow>
          <Button onClick={handlePlayAgain}>Play Again</Button>
          <Button variant="secondary" onClick={handleNewGame}>New Game</Button>
        </ButtonRow>
      </Screen>
    </GameShell>
  );
}
