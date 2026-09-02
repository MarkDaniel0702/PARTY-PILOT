import { shuffle as defaultShuffle } from "../../shared/utils/random";

// Pure UNO rules engine — no React, no network, no DOM. The host owns one
// state object and every action returns a new one, so the whole rule set is
// unit-testable (see engine.test.js). An invalid action returns the *same*
// state object by reference, so callers can detect a no-op with `next === state`.

export const COLOURS = ["red", "yellow", "green", "blue"];

export const KIND = {
  NUMBER: "number",
  SKIP: "skip",
  REVERSE: "reverse",
  DRAW2: "draw2",
  WILD: "wild",
  WILD4: "wild4"
};

// 4 colours x (one 0, two each 1-9, two each skip/reverse/draw2) = 100,
// plus 4 Wild and 4 Wild Draw Four = 108.
export function createUnoDeck() {
  const deck = [];
  let n = 0;
  const push = (card) => deck.push({ ...card, id: `c${n++}` });

  COLOURS.forEach((colour) => {
    push({ colour, kind: KIND.NUMBER, value: 0 });
    for (let v = 1; v <= 9; v++) {
      push({ colour, kind: KIND.NUMBER, value: v });
      push({ colour, kind: KIND.NUMBER, value: v });
    }
    [KIND.SKIP, KIND.REVERSE, KIND.DRAW2].forEach((kind) => {
      push({ colour, kind, value: null });
      push({ colour, kind, value: null });
    });
  });
  for (let i = 0; i < 4; i++) push({ colour: "wild", kind: KIND.WILD, value: null });
  for (let i = 0; i < 4; i++) push({ colour: "wild", kind: KIND.WILD4, value: null });

  return deck;
}

export function topCard(state) {
  return state.discardPile[state.discardPile.length - 1];
}

export function currentSeat(state) {
  return state.seatOrder[state.turnIndex];
}

export function createGame(seatIds, { handSize = 7, shuffleFn = defaultShuffle } = {}) {
  let pile = shuffleFn(createUnoDeck());
  const hands = {};
  seatIds.forEach((id) => {
    hands[id] = [];
  });
  for (let i = 0; i < handSize; i++) {
    seatIds.forEach((id) => hands[id].push(pile.pop()));
  }

  // Starting discard is always a plain number card. Official rules have
  // fiddly special cases when the first flip is an action or wild card;
  // re-flipping past them sidesteps all of it with no gameplay cost.
  let start = null;
  const passedOver = [];
  while (pile.length) {
    const card = pile.pop();
    if (card.kind === KIND.NUMBER) {
      start = card;
      break;
    }
    passedOver.push(card);
  }
  pile = shuffleFn(pile.concat(passedOver));

  return {
    drawPile: pile,
    discardPile: [start],
    hands,
    seatOrder: seatIds.slice(),
    turnIndex: 0,
    direction: 1,
    activeColour: start.colour,
    // A wild has been played and its colour not yet chosen; the turn is
    // frozen on that seat until chooseColour resolves it.
    pendingWild: null,
    // The card just drawn this turn — the only card that seat may still
    // play, per official rules. Cleared when the turn ends.
    drawnCardId: null,
    winner: null,
    // What just happened, for the UI to react to (chip pulses, direction
    // flips). `seq` increments on every event so the same event twice in a
    // row is still a distinct change React can key an animation on.
    lastEvent: null,
    shuffleFn
  };
}

function withEvent(state, event) {
  return { ...event, seq: (state.lastEvent ? state.lastEvent.seq : 0) + 1 };
}

export function canPlay(card, state) {
  if (state.winner || !card) return false;
  if (card.colour === "wild") return true;
  if (card.colour === state.activeColour) return true;
  const top = topCard(state);
  if (card.kind === KIND.NUMBER && top.kind === KIND.NUMBER && card.value === top.value) return true;
  if (card.kind !== KIND.NUMBER && card.kind === top.kind) return true;
  return false;
}

// Card ids this seat may legally play right now. Empty unless it's their
// turn, no wild is awaiting a colour, and the game is still running.
export function getPlayable(state, seatId) {
  if (state.winner || state.pendingWild) return [];
  if (currentSeat(state) !== seatId) return [];
  const hand = state.hands[seatId] || [];
  if (state.drawnCardId) {
    const drawn = hand.find((c) => c.id === state.drawnCardId);
    return canPlay(drawn, state) ? [drawn.id] : [];
  }
  return hand.filter((c) => canPlay(c, state)).map((c) => c.id);
}

export function handFor(state, seatId) {
  return state.hands[seatId] || [];
}

// Everything safe to show on the shared screen or send to every phone.
// Deliberately excludes every hand — only counts.
export function publicView(state) {
  return {
    topCard: topCard(state),
    activeColour: state.activeColour,
    direction: state.direction,
    currentSeatId: currentSeat(state),
    drawPileCount: state.drawPile.length,
    pendingWildSeatId: state.pendingWild ? state.pendingWild.seatId : null,
    winner: state.winner,
    counts: state.seatOrder.map((id) => ({ seatId: id, count: state.hands[id].length }))
  };
}

function step(state, steps) {
  const n = state.seatOrder.length;
  return (((state.turnIndex + state.direction * steps) % n) + n) % n;
}

// Draws one card, reshuffling the discard pile (minus its top card) back in
// when the draw pile runs dry. Returns nulls if genuinely nothing is left.
function drawOne(drawPile, discardPile, shuffleFn) {
  let pile = drawPile;
  let discard = discardPile;
  if (pile.length === 0) {
    const keep = discard[discard.length - 1];
    const rest = discard.slice(0, -1);
    if (rest.length === 0) return { card: null, drawPile: pile, discardPile: discard };
    pile = shuffleFn(rest);
    discard = [keep];
  }
  return { card: pile[pile.length - 1], drawPile: pile.slice(0, -1), discardPile: discard };
}

function drawMany(state, seatId, count) {
  let { drawPile, discardPile } = state;
  const added = [];
  for (let i = 0; i < count; i++) {
    const res = drawOne(drawPile, discardPile, state.shuffleFn);
    if (!res.card) break;
    added.push(res.card);
    drawPile = res.drawPile;
    discardPile = res.discardPile;
  }
  return {
    drawPile,
    discardPile,
    hands: { ...state.hands, [seatId]: [...state.hands[seatId], ...added] }
  };
}

export function playCard(state, seatId, cardId) {
  if (!getPlayable(state, seatId).includes(cardId)) return state;

  const hand = state.hands[seatId];
  const card = hand.find((c) => c.id === cardId);
  const nextHand = hand.filter((c) => c.id !== cardId);

  let next = {
    ...state,
    hands: { ...state.hands, [seatId]: nextHand },
    discardPile: [...state.discardPile, card],
    drawnCardId: null
  };

  // A wild freezes the turn until a colour is chosen — unless it was the
  // winning card, in which case the colour no longer matters.
  if (card.colour === "wild") {
    if (nextHand.length === 0) {
      return { ...next, winner: seatId, pendingWild: null, lastEvent: withEvent(state, { kind: "win", seatId }) };
    }
    return {
      ...next,
      pendingWild: { seatId, cardId, kind: card.kind },
      lastEvent: withEvent(state, { kind: "wildPlayed", seatId, cardId })
    };
  }

  next.activeColour = card.colour;

  const twoPlayer = state.seatOrder.length === 2;
  let advance = 1;
  let event = { kind: "play", seatId, cardId };
  if (card.kind === KIND.SKIP) {
    advance = 2;
    event = { kind: "skip", seatId, targetSeatId: state.seatOrder[step(next, 1)] };
  } else if (card.kind === KIND.REVERSE) {
    // With two players a Reverse simply acts as a Skip.
    next.direction = twoPlayer ? state.direction : -state.direction;
    advance = twoPlayer ? 2 : 1;
    event = { kind: "reverse", seatId, direction: next.direction };
  } else if (card.kind === KIND.DRAW2) {
    const victim = state.seatOrder[step(next, 1)];
    next = { ...next, ...drawMany(next, victim, 2) };
    advance = 2;
    event = { kind: "penalty", seatId, targetSeatId: victim, count: 2 };
  }

  if (nextHand.length === 0) {
    return { ...next, winner: seatId, lastEvent: withEvent(state, { kind: "win", seatId }) };
  }
  return { ...next, turnIndex: step(next, advance), lastEvent: withEvent(state, event) };
}

export function chooseColour(state, seatId, colour) {
  if (!state.pendingWild || state.pendingWild.seatId !== seatId) return state;
  if (!COLOURS.includes(colour)) return state;

  let next = { ...state, activeColour: colour, pendingWild: null };
  let advance = 1;
  let event = { kind: "colour", seatId, colour };
  if (state.pendingWild.kind === KIND.WILD4) {
    const victim = state.seatOrder[step(next, 1)];
    next = { ...next, ...drawMany(next, victim, 4) };
    advance = 2;
    event = { kind: "penalty", seatId, targetSeatId: victim, count: 4, colour };
  }
  return { ...next, turnIndex: step(next, advance), lastEvent: withEvent(state, event) };
}

// Draw one card. If it happens to be playable the seat keeps the turn and
// may either play that card or pass; otherwise the turn passes immediately.
export function drawCard(state, seatId) {
  if (state.winner || state.pendingWild) return state;
  if (currentSeat(state) !== seatId || state.drawnCardId) return state;

  const drawn = drawMany(state, seatId, 1);
  const hand = drawn.hands[seatId];
  const card = hand[hand.length - 1];
  const next = { ...state, ...drawn };

  const event = withEvent(state, { kind: "draw", seatId, cardId: card ? card.id : null });
  if (card && canPlay(card, next)) return { ...next, drawnCardId: card.id, lastEvent: event };
  return { ...next, drawnCardId: null, turnIndex: step(next, 1), lastEvent: event };
}

export function passTurn(state, seatId) {
  if (state.winner || state.pendingWild) return state;
  if (currentSeat(state) !== seatId || !state.drawnCardId) return state;
  return {
    ...state,
    drawnCardId: null,
    turnIndex: step(state, 1),
    lastEvent: withEvent(state, { kind: "pass", seatId })
  };
}
