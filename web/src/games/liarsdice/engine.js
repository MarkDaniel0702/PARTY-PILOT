// Pure Liar's Dice rules engine — no React, no network, no DOM. Same shape as
// the other engines: the host owns one state object, every action returns a
// new one, and an invalid action returns the *same* object by reference so a
// caller can detect a no-op with `next === state`.
//
// The game: everyone rolls their dice in secret. Players take turns raising a
// bid about ALL the dice on the table ("at least four 3s") or calling the
// previous bidder a liar. A challenge reveals everything: if the bid was true
// the challenger loses a die, otherwise the bidder does. Last player with dice
// wins. Ones are wild (they count towards any face) unless the bid is on ones.

export const FACES = [1, 2, 3, 4, 5, 6];
export const MIN_DICE_EACH = 3;
export const MAX_DICE_EACH = 6;
export const DEFAULT_DICE_EACH = 5;

export function rollDice(count, rng = Math.random) {
  return Array.from({ length: count }, () => 1 + Math.floor(rng() * 6));
}

export function createGame(
  seatIds,
  { diceEach = DEFAULT_DICE_EACH, wilds = true, rng = Math.random, startIndex = 0 } = {}
) {
  const dice = {};
  seatIds.forEach((id) => {
    dice[id] = rollDice(diceEach, rng);
  });
  return {
    seatOrder: seatIds.slice(),
    dice,
    turnIndex: ((startIndex % seatIds.length) + seatIds.length) % seatIds.length,
    bid: null, // { seatId, quantity, face }
    history: [], // this round's bids, oldest first
    phase: "bidding", // bidding | reveal | over
    reveal: null,
    round: 1,
    winner: null,
    wilds,
    rng,
    outOrder: [], // seats in the order they ran out of dice
    outRounds: {} // seat -> the round they went out in
  };
}

export function aliveSeats(state) {
  return state.seatOrder.filter((id) => state.dice[id].length > 0);
}

export function currentSeat(state) {
  return state.seatOrder[state.turnIndex];
}

export function diceFor(state, seatId) {
  return state.dice[seatId] || [];
}

export function totalDice(state) {
  return state.seatOrder.reduce((n, id) => n + state.dice[id].length, 0);
}

// How many dice show `face`, counting wilds. A bid on ones is only ever
// satisfied by actual ones — wilds can't help there.
export function countMatching(dice, face, wilds) {
  let n = 0;
  for (const d of dice) {
    if (d === face || (wilds && face !== 1 && d === 1)) n++;
  }
  return n;
}

export function allDice(state) {
  return state.seatOrder.flatMap((id) => state.dice[id]);
}

// Bids only ever go up: a higher quantity of anything, or the same quantity of
// a higher face. Nobody can bid more dice than are on the table. Taking the
// standing bid and the dice count directly (rather than a whole game state)
// lets a phone, which only knows those two things, run the same check.
export function bidAllowed(current, total, quantity, face) {
  if (!Number.isInteger(quantity) || !Number.isInteger(face)) return false;
  if (face < 1 || face > 6 || quantity < 1) return false;
  if (quantity > total) return false;
  if (!current) return true;
  return quantity > current.quantity || (quantity === current.quantity && face > current.face);
}

// The lowest quantity that is still a legal raise on `face` — for building the
// bid picker so it never offers a bid the engine would refuse.
export function minQuantityFor(current, face) {
  if (!current) return 1;
  return face > current.face ? current.quantity : current.quantity + 1;
}

export function isValidBid(state, quantity, face) {
  return bidAllowed(state.bid, totalDice(state), quantity, face);
}

export function minQuantity(state, face) {
  return minQuantityFor(state.bid, face);
}

function nextAliveIndex(state, fromIndex) {
  const n = state.seatOrder.length;
  for (let step = 1; step <= n; step++) {
    const idx = (fromIndex + step) % n;
    if (state.dice[state.seatOrder[idx]].length > 0) return idx;
  }
  return fromIndex;
}

export function placeBid(state, seatId, quantity, face) {
  if (state.phase !== "bidding" || currentSeat(state) !== seatId) return state;
  if (!isValidBid(state, quantity, face)) return state;
  const bid = { seatId, quantity, face };
  return {
    ...state,
    bid,
    history: [...state.history, bid],
    turnIndex: nextAliveIndex(state, state.turnIndex)
  };
}

// Challenge the standing bid. Everything is revealed, one die is lost, and the
// round pauses on the result until someone calls nextRound().
export function callLiar(state, seatId) {
  if (state.phase !== "bidding" || currentSeat(state) !== seatId) return state;
  if (!state.bid || state.bid.seatId === seatId) return state;

  const matching = countMatching(allDice(state), state.bid.face, state.wilds);
  const bidWasGood = matching >= state.bid.quantity;
  const loserId = bidWasGood ? seatId : state.bid.seatId;

  // A bidder who was removed from the game has no die left to give up; the
  // round still resolves, it just costs nobody anything.
  const hadDice = state.dice[loserId].length > 0;
  const dice = { ...state.dice, [loserId]: state.dice[loserId].slice(1) };
  const eliminated = hadDice && dice[loserId].length === 0;
  return {
    ...state,
    dice,
    phase: "reveal",
    outOrder: eliminated ? [...state.outOrder, loserId] : state.outOrder,
    outRounds: eliminated ? { ...state.outRounds, [loserId]: state.round } : state.outRounds,
    reveal: {
      challengerId: seatId,
      bidderId: state.bid.seatId,
      bid: state.bid,
      matching,
      bidWasGood,
      loserId,
      eliminated,
      // Everyone's dice as they were when the challenge landed — the loser's
      // lost die is already gone from `dice`, but the table still needs to
      // see all of them.
      dice: state.dice
    }
  };
}

// After a reveal: either crown the last player standing or re-roll and start
// the next round, which opens with whoever just lost a die (or, if that
// emptied their hand, the next player along).
export function nextRound(state) {
  if (state.phase !== "reveal") return state;
  const alive = aliveSeats(state);
  if (alive.length <= 1) {
    return { ...state, phase: "over", winner: alive[0] ?? null };
  }
  const dice = {};
  state.seatOrder.forEach((id) => {
    dice[id] = state.dice[id].length ? rollDice(state.dice[id].length, state.rng) : [];
  });
  const loserIndex = state.seatOrder.indexOf(state.reveal.loserId);
  const startIndex = dice[state.reveal.loserId].length ? loserIndex : nextAliveIndex({ ...state, dice }, loserIndex);
  return {
    ...state,
    dice,
    turnIndex: startIndex,
    bid: null,
    history: [],
    phase: "bidding",
    reveal: null,
    round: state.round + 1
  };
}

// Takes a seat out of the game for good — a player who left and isn't coming
// back must not freeze everyone else. Their dice vanish; if it was their turn
// the turn moves on, and if only one player remains that player wins.
export function removeSeat(state, seatId) {
  if (state.phase === "over" || !state.seatOrder.includes(seatId)) return state;
  if (state.dice[seatId].length === 0) return state;

  const dice = { ...state.dice, [seatId]: [] };
  const next = {
    ...state,
    dice,
    outOrder: [...state.outOrder, seatId],
    outRounds: { ...state.outRounds, [seatId]: state.round }
  };
  const alive = aliveSeats(next);

  if (state.phase === "reveal") return next; // nextRound() resolves it
  if (alive.length <= 1) return { ...next, phase: "over", winner: alive[0] ?? null, reveal: null };
  if (currentSeat(state) === seatId) return { ...next, turnIndex: nextAliveIndex(next, state.turnIndex) };
  return next;
}

// Everything safe to show on the shared screen or send to every phone: how
// many dice each seat holds, never what they show. Revealed dice appear only
// once a challenge has made them public.
export function publicView(state) {
  return {
    round: state.round,
    phase: state.phase,
    currentSeatId: state.phase === "bidding" ? currentSeat(state) : null,
    bid: state.bid,
    history: state.history,
    counts: state.seatOrder.map((id) => ({ seatId: id, dice: state.dice[id].length })),
    totalDice: totalDice(state),
    wilds: state.wilds,
    winner: state.winner,
    reveal: state.reveal
  };
}

// Finishing order, best first: the winner, then everyone who went out, latest
// first. Anyone still holding dice when a game is abandoned ranks by dice left.
export function standings(state) {
  const out = state.outOrder.slice().reverse();
  const alive = aliveSeats(state)
    .filter((id) => id !== state.winner)
    .sort((a, b) => state.dice[b].length - state.dice[a].length);
  return [...(state.winner ? [state.winner] : []), ...alive, ...out];
}

export function describeBid(bid) {
  return `${bid.quantity} × ${bid.face}`;
}
