import { shuffle as defaultShuffle } from "../../shared/utils/random";

// Pure Tong-Its rules engine — no React, no network, no DOM. Same shape as
// uno/engine.js: the host owns one state object, every action returns a new
// one, and an invalid action returns the *same* state object by reference so
// callers can detect a no-op with `next === state`.
//
// Tong-Its is a Filipino rummy: build sets (3-4 of a rank, one per suit) and
// runs (3+ consecutive cards, one suit) from your hand, lay them face-up on
// the table, and empty your hand first. Two ways to win a round:
//   - "Tongits!" — you meld your entire hand with nothing left to discard.
//     This is the big one: an instant win with a bonus.
//   - A normal go-out — you meld everything but one card, then discard it.
// If the stock runs dry before either happens, the round ends on the spot
// and whoever is holding the least card value in their hand wins instead.

export const SUITS = ["S", "H", "D", "C"];
export const SUIT_LABEL = { S: "♠", H: "♥", D: "♦", C: "♣" };
// Ace is always low (rank 1) — Tong-Its runs never wrap K-A-2.
export const RANK_LABEL = { 1: "A", 11: "J", 12: "Q", 13: "K" };

export function rankLabel(rank) {
  return RANK_LABEL[rank] || String(rank);
}

// Face cards are worth 10 for scoring purposes, same as gin rummy.
export function cardValue(card) {
  return card.rank >= 10 ? 10 : card.rank;
}

export function createDeck() {
  const deck = [];
  SUITS.forEach((suit) => {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({ id: `${suit}${rank}`, suit, rank });
    }
  });
  return deck;
}

// A non-dealer's starting hand size, by player count — the dealer always
// gets one extra (see createGame). Kept modest at 4 players purely so the
// stock still has a healthy reserve left to draw from all round.
const HAND_SIZE_BY_COUNT = { 2: 12, 3: 12, 4: 10 };

export function isSet(cards) {
  if (cards.length < 3 || cards.length > 4) return false;
  const rank = cards[0].rank;
  const suits = new Set();
  for (const c of cards) {
    if (c.rank !== rank) return false;
    if (suits.has(c.suit)) return false;
    suits.add(c.suit);
  }
  return true;
}

export function isRun(cards) {
  if (cards.length < 3) return false;
  const suit = cards[0].suit;
  const ranks = cards.map((c) => c.rank).sort((a, b) => a - b);
  for (const c of cards) {
    if (c.suit !== suit) return false;
  }
  for (let i = 1; i < ranks.length; i++) {
    if (ranks[i] !== ranks[i - 1] + 1) return false;
  }
  return true;
}

export function meldType(cards) {
  if (isSet(cards)) return "set";
  if (isRun(cards)) return "run";
  return null;
}

function orderMeldCards(type, cards) {
  if (type === "run") return cards.slice().sort((a, b) => a.rank - b.rank);
  return cards.slice().sort((a, b) => SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit));
}

// Whether `card` can be added to an already-laid meld — a set takes a 4th
// card of the same rank in the one missing suit; a run only extends at
// either open end, same suit. This "piggybacking" onto a laid meld (any
// player's) is the classic Tong-Its move known as "sapaw".
export function canExtendMeld(meld, card) {
  if (!meld || !card) return false;
  if (meld.type === "set") {
    if (meld.cards.length >= 4) return false;
    if (card.rank !== meld.cards[0].rank) return false;
    return !meld.cards.some((c) => c.suit === card.suit);
  }
  if (meld.type === "run") {
    if (card.suit !== meld.cards[0].suit) return false;
    const ranks = meld.cards.map((c) => c.rank);
    const min = Math.min(...ranks);
    const max = Math.max(...ranks);
    return card.rank === min - 1 || card.rank === max + 1;
  }
  return false;
}

export function handValue(hand) {
  return hand.reduce((sum, c) => sum + cardValue(c), 0);
}

export function currentSeat(state) {
  return state.seatOrder[state.turnIndex];
}

export function handFor(state, seatId) {
  return state.hands[seatId] || [];
}

export function topDiscard(state) {
  return state.discard.length ? state.discard[state.discard.length - 1] : null;
}

export function createGame(seatIds, { shuffleFn = defaultShuffle } = {}) {
  const baseHand = HAND_SIZE_BY_COUNT[seatIds.length] || 12;
  const pile = shuffleFn(createDeck());
  const hands = {};
  seatIds.forEach((id, i) => {
    // Seat 0 deals and plays first, so they get the traditional extra card
    // instead of a separate opening draw.
    const size = i === 0 ? baseHand + 1 : baseHand;
    hands[id] = pile.splice(pile.length - size, size);
  });

  return {
    stock: pile,
    discard: [],
    hands,
    melds: [],
    meldSeq: 0,
    seatOrder: seatIds.slice(),
    turnIndex: 0,
    // The dealer already holds their extra card, so round one skips
    // straight to melding/discarding — every seat after that must draw first.
    turnStage: "act",
    drawnCardId: null,
    drawnFrom: null, // "stock" | "discard" — where drawnCardId came from
    winner: null,
    winType: null, // "tongits" | "discard" | "showdown"
    lastEvent: null,
    shuffleFn
  };
}

function withEvent(state, event) {
  return { ...event, seq: (state.lastEvent ? state.lastEvent.seq : 0) + 1 };
}

function resolveShowdown(state) {
  const standings = state.seatOrder
    .map((id) => ({ seatId: id, value: handValue(state.hands[id]), count: state.hands[id].length }))
    .sort((a, b) => a.value - b.value || a.count - b.count);
  const winnerSeatId = standings[0].seatId;
  return {
    ...state,
    winner: winnerSeatId,
    winType: "showdown",
    lastEvent: withEvent(state, { kind: "win", seatId: winnerSeatId, winType: "showdown" })
  };
}

function advanceTurn(state, event) {
  const n = state.seatOrder.length;
  const next = {
    ...state,
    turnIndex: (state.turnIndex + 1) % n,
    turnStage: "draw",
    drawnCardId: null,
    lastEvent: event
  };
  // Nothing left to draw for the next seat — the round ends right here
  // rather than letting play stall out. Lowest hand value wins.
  return next.stock.length === 0 ? resolveShowdown(next) : next;
}

export function drawStock(state, seatId) {
  if (state.winner) return state;
  if (currentSeat(state) !== seatId || state.turnStage !== "draw") return state;
  if (state.stock.length === 0) return state;
  const card = state.stock[state.stock.length - 1];
  return {
    ...state,
    stock: state.stock.slice(0, -1),
    hands: { ...state.hands, [seatId]: [...state.hands[seatId], card] },
    turnStage: "act",
    drawnCardId: card.id,
    drawnFrom: "stock",
    lastEvent: withEvent(state, { kind: "draw", seatId, source: "stock", cardId: card.id })
  };
}

export function drawDiscard(state, seatId) {
  if (state.winner) return state;
  if (currentSeat(state) !== seatId || state.turnStage !== "draw") return state;
  if (state.discard.length === 0) return state;
  const card = state.discard[state.discard.length - 1];
  return {
    ...state,
    discard: state.discard.slice(0, -1),
    hands: { ...state.hands, [seatId]: [...state.hands[seatId], card] },
    turnStage: "act",
    drawnCardId: card.id,
    drawnFrom: "discard",
    lastEvent: withEvent(state, { kind: "draw", seatId, source: "discard", cardId: card.id })
  };
}

// Lays a brand-new set or run from the hand. `cardIds` must already form a
// valid meld — see isSet/isRun; an invalid combo is a no-op.
export function layMeld(state, seatId, cardIds) {
  if (state.winner) return state;
  if (currentSeat(state) !== seatId || state.turnStage !== "act") return state;
  if (!cardIds || cardIds.length < 3) return state;

  const hand = state.hands[seatId];
  const cards = cardIds.map((id) => hand.find((c) => c.id === id)).filter(Boolean);
  if (cards.length !== cardIds.length) return state;

  const type = meldType(cards);
  if (!type) return state;

  const idSet = new Set(cardIds);
  const nextHand = hand.filter((c) => !idSet.has(c.id));
  const meld = { id: `m${state.meldSeq}`, ownerSeatId: seatId, type, cards: orderMeldCards(type, cards) };
  const next = {
    ...state,
    hands: { ...state.hands, [seatId]: nextHand },
    melds: [...state.melds, meld],
    meldSeq: state.meldSeq + 1,
    lastEvent: withEvent(state, { kind: "meld", seatId, meldId: meld.id, meldType: type, cardIds })
  };

  if (nextHand.length === 0) {
    return { ...next, winner: seatId, winType: "tongits", lastEvent: withEvent(state, { kind: "win", seatId, winType: "tongits" }) };
  }
  return next;
}

// Adds one card from the hand onto an already-laid meld (any seat's) —
// "sapaw". A no-op if the meld can't take that card right now.
export function addToMeld(state, seatId, meldId, cardId) {
  if (state.winner) return state;
  if (currentSeat(state) !== seatId || state.turnStage !== "act") return state;

  const hand = state.hands[seatId];
  const card = hand.find((c) => c.id === cardId);
  if (!card) return state;

  const meldIndex = state.melds.findIndex((m) => m.id === meldId);
  if (meldIndex === -1) return state;
  const meld = state.melds[meldIndex];
  if (!canExtendMeld(meld, card)) return state;

  const nextHand = hand.filter((c) => c.id !== cardId);
  const melds = state.melds.slice();
  melds[meldIndex] = { ...meld, cards: orderMeldCards(meld.type, [...meld.cards, card]) };

  const next = {
    ...state,
    hands: { ...state.hands, [seatId]: nextHand },
    melds,
    lastEvent: withEvent(state, { kind: "sapaw", seatId, meldId, cardId })
  };

  if (nextHand.length === 0) {
    return { ...next, winner: seatId, winType: "tongits", lastEvent: withEvent(state, { kind: "win", seatId, winType: "tongits" }) };
  }
  return next;
}

// Discards to end the turn. Emptying the hand this way (melded everything
// but this last card) is a normal go-out win — the bigger "Tongits!" bonus
// only happens via layMeld/addToMeld above, when no discard was needed at all.
export function discard(state, seatId, cardId) {
  if (state.winner) return state;
  if (currentSeat(state) !== seatId || state.turnStage !== "act") return state;

  const hand = state.hands[seatId];
  const card = hand.find((c) => c.id === cardId);
  if (!card) return state;
  // Putting the card you just took from the discard straight back would let
  // a player skip their draw forever and stall the round (the stock never
  // shrinks), so it's rejected.
  if (state.drawnFrom === "discard" && state.drawnCardId === cardId) return state;

  const nextHand = hand.filter((c) => c.id !== cardId);
  const next = {
    ...state,
    hands: { ...state.hands, [seatId]: nextHand },
    discard: [...state.discard, card],
    drawnCardId: null
  };

  if (nextHand.length === 0) {
    return { ...next, winner: seatId, winType: "discard", lastEvent: withEvent(state, { kind: "win", seatId, winType: "discard" }) };
  }
  return advanceTurn(next, withEvent(state, { kind: "discard", seatId, cardId }));
}

// Everything safe to show on the shared screen or send to every phone —
// deliberately excludes every hand, only counts.
export function publicView(state) {
  return {
    stockCount: state.stock.length,
    discardTop: topDiscard(state),
    melds: state.melds,
    currentSeatId: currentSeat(state),
    turnStage: state.turnStage,
    winner: state.winner,
    winType: state.winType,
    counts: state.seatOrder.map((id) => ({ seatId: id, count: state.hands[id].length }))
  };
}
