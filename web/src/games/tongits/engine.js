import { shuffle as defaultShuffle } from "../../shared/utils/random";

// Pure Tong-Its rules engine — no React, no network, no DOM. Same shape as
// uno/engine.js: the host owns one state object, every action returns a new
// one, and an invalid action returns the *same* state object by reference so
// callers can detect a no-op with `next === state`.
//
// Rules implemented (Filipino Tong-Its, per tongits.org / playtongits.com):
//   * 2-3 players, 52 cards. Everyone gets 12, the dealer 13 and opens by
//     discarding (no draw on the dealer's first turn).
//   * Your turn: draw from the stock, OR take the top discard — but only if
//     you immediately lay a meld that uses it (a new set/run with 2+ cards
//     from your hand, or "sapaw" onto a meld already on the table).
//   * Then you may lay melds and sapaw, and you finish by discarding one card.
//   * Sets are 3-4 of a rank (distinct suits); runs are 3+ in a row, one
//     suit, Ace low only (no K-A-2 wrap).
//   * TONGITS: your hand reaches zero cards (everything melded / sapaw'd, or
//     the last card discarded) — instant win.
//   * DRAW: instead of drawing you may call Draw if you have an exposed meld
//     and no one has sapaw'd your melds (nor you your own) since your last
//     turn. Opponents with an exposed meld (or a concealed "Secret" four of
//     a kind) choose Fold or Challenge; the rest are auto-folded. Lowest
//     hand value wins; a tie goes to the challenger.
//   * STOCK OUT: when the stock is empty at the end of a turn the round
//     ends. Burned players (no exposed meld, no Secret) lose; lowest hand
//     value among the rest wins, ties to whoever drew the last stock card,
//     else the next tied seat after them.
//   * Payouts follow playtongits.com's table (ante = 10 chips, 20% = 2).
//
// Not implemented: "Spread" (an all-melds opening hand), jackpot/two-hits.

export const SUITS = ["S", "H", "D", "C"];
export const SUIT_LABEL = { S: "♠", H: "♥", D: "♦", C: "♣" };
// Ace is always low (rank 1) — Tong-Its runs never wrap K-A-2.
export const RANK_LABEL = { 1: "A", 11: "J", 12: "Q", 13: "K" };

export const ANTE = 10; // chips; every payout below is a share of this
const PCT = ANTE / 100;
export const PAY = {
  tongits: 40 * PCT, // winner by Tong-Its, from each loser
  stockOut: 40 * PCT, // winner by lowest points when the stock runs out
  drawFold: 20 * PCT, // loser who folded to a Draw
  drawFight: 50 * PCT, // loser who challenged (or the caller who was beaten)
  burned: 20 * PCT, // extra a burned loser pays on top
  bonus: 20 * PCT // per Ace/King, Secret, Escalera in the winner's cards
};

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

const HAND_SIZE = 12; // the dealer gets one extra

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

// The seat that must act right now: the next responder while a Draw is
// pending, otherwise whoever's turn it is.
export function actorSeat(state) {
  if (state.turnStage === "respond" && state.drawCall) {
    return state.drawCall.queue[state.drawCall.responses.length] ?? null;
  }
  return currentSeat(state);
}

// A seat has an exposed meld if it laid one itself — sapaw'ing onto someone
// else's meld doesn't count.
export function hasExposedMeld(state, seatId) {
  return state.melds.some((m) => m.ownerSeatId === seatId);
}

// "Secret": four of a kind still concealed in the hand.
export function hasSecret(hand) {
  const counts = {};
  for (const c of hand) counts[c.rank] = (counts[c.rank] || 0) + 1;
  return Object.values(counts).some((n) => n === 4);
}

// Burned ("sunog"): nothing exposed and no Secret to fall back on.
export function isBurned(state, seatId) {
  return !hasExposedMeld(state, seatId) && !hasSecret(state.hands[seatId]);
}

export function canCallDraw(state, seatId) {
  return (
    !state.winner &&
    currentSeat(state) === seatId &&
    state.turnStage === "draw" &&
    hasExposedMeld(state, seatId) &&
    !state.drawBlocked[seatId]
  );
}

// `dealer` is the seat index that deals and plays first; the winner of a
// round deals the next one (the app passes their index along).
export function createGame(seatIds, { shuffleFn = defaultShuffle, dealer = 0 } = {}) {
  const dealerIndex = ((dealer % seatIds.length) + seatIds.length) % seatIds.length;
  const pile = shuffleFn(createDeck());
  const hands = {};
  seatIds.forEach((id, i) => {
    const size = i === dealerIndex ? HAND_SIZE + 1 : HAND_SIZE;
    hands[id] = pile.splice(pile.length - size, size);
  });
  const drawBlocked = {};
  seatIds.forEach((id) => {
    drawBlocked[id] = false;
  });

  return {
    stock: pile,
    discard: [],
    hands,
    melds: [],
    meldSeq: 0,
    seatOrder: seatIds.slice(),
    turnIndex: dealerIndex,
    // The dealer already holds their extra card, so round one skips
    // straight to melding/discarding — every seat after that must draw first.
    turnStage: "act", // "draw" | "act" | "respond"
    drawnCardId: null,
    drawnFrom: null, // "stock" | "discard"
    lastStockDrawer: null,
    drawBlocked, // seat -> true while Draw may not be called
    drawCall: null, // { callerId, queue, responses: [{seatId, challenge}], autoFolded }
    winner: null,
    winType: null, // "tongits" | "draw" | "showdown"
    result: null, // settlement, set when the round ends
    lastEvent: null,
    shuffleFn
  };
}

function withEvent(state, event) {
  return { ...event, seq: (state.lastEvent ? state.lastEvent.seq : 0) + 1 };
}

// ---------- Payouts ----------

function winnerBonuses(state, winnerId) {
  const own = state.melds.filter((m) => m.ownerSeatId === winnerId);
  const cards = [...own.flatMap((m) => m.cards), ...state.hands[winnerId]];
  const aceKing = cards.filter((c) => c.rank === 1 || c.rank === 13).length;
  const secret = own.some((m) => m.type === "set" && m.cards.length === 4) || hasSecret(state.hands[winnerId]);
  const escalera = own.some((m) => m.type === "run" && m.cards.length >= 5);
  return { aceKing, secret, escalera };
}

// Builds the chip settlement. `base(seatId)` is what each loser owes before
// the burned surcharge and the winner's bonuses.
function settle(state, winnerId, base) {
  const bonuses = winnerBonuses(state, winnerId);
  const bonusChips = (bonuses.aceKing + (bonuses.secret ? 1 : 0) + (bonuses.escalera ? 1 : 0)) * PAY.bonus;
  const payments = {};
  const lines = [];
  let total = 0;
  state.seatOrder.forEach((id) => {
    payments[id] = 0;
  });
  state.seatOrder.forEach((id) => {
    if (id === winnerId) return;
    const burned = isBurned(state, id);
    const amount = base(id) + (burned ? PAY.burned : 0) + bonusChips;
    payments[id] = -amount;
    total += amount;
    lines.push({ seatId: id, amount, burned });
  });
  payments[winnerId] = total;
  return { winnerId, payments, lines, bonuses, bonusChips };
}

function finish(state, winnerId, winType, base, extra = {}) {
  const result = { ...settle(state, winnerId, base), ...extra };
  return {
    ...state,
    winner: winnerId,
    winType,
    turnStage: "done",
    drawCall: null,
    result,
    lastEvent: withEvent(state, { kind: "win", seatId: winnerId, winType })
  };
}

function winTongits(state, seatId) {
  return finish(state, seatId, "tongits", () => PAY.tongits);
}

// Stock ran out: burned players lose outright, then lowest hand value wins;
// ties go to whoever drew the last stock card, else the next tied seat after
// them in turn order.
function resolveShowdown(state) {
  const eligible = state.seatOrder.filter((id) => !isBurned(state, id));
  const pool = eligible.length ? eligible : state.seatOrder;
  const best = Math.min(...pool.map((id) => handValue(state.hands[id])));
  const tied = pool.filter((id) => handValue(state.hands[id]) === best);
  let winnerId = tied[0];
  if (tied.length > 1) {
    const n = state.seatOrder.length;
    const from = Math.max(0, state.seatOrder.indexOf(state.lastStockDrawer));
    for (let step = 0; step < n; step++) {
      const id = state.seatOrder[(from + step) % n];
      if (tied.includes(id)) {
        winnerId = id;
        break;
      }
    }
  }
  return finish(state, winnerId, "showdown", () => PAY.stockOut);
}

function advanceTurn(state, event) {
  const n = state.seatOrder.length;
  const next = {
    ...state,
    turnIndex: (state.turnIndex + 1) % n,
    turnStage: "draw",
    drawnCardId: null,
    drawnFrom: null,
    lastEvent: event
  };
  // Nothing left to draw for the next seat — the round ends right here.
  return next.stock.length === 0 ? resolveShowdown(next) : next;
}

// ---------- Drawing ----------

function takeTurn(state, seatId, patch) {
  return {
    ...state,
    ...patch,
    drawBlocked: { ...state.drawBlocked, [seatId]: false }
  };
}

export function drawStock(state, seatId) {
  if (state.winner) return state;
  if (currentSeat(state) !== seatId || state.turnStage !== "draw") return state;
  if (state.stock.length === 0) return state;
  const card = state.stock[state.stock.length - 1];
  return takeTurn(state, seatId, {
    stock: state.stock.slice(0, -1),
    hands: { ...state.hands, [seatId]: [...state.hands[seatId], card] },
    turnStage: "act",
    drawnCardId: card.id,
    drawnFrom: "stock",
    lastStockDrawer: seatId,
    lastEvent: withEvent(state, { kind: "draw", seatId, source: "stock", cardId: card.id })
  });
}

// Take the top discard — only legal if it completes a meld you lay at once.
// Pass `cardIds` (2+ cards from your hand forming a set/run with the discard),
// or `meldId` to sapaw it straight onto a meld already on the table.
export function drawDiscard(state, seatId, { cardIds = [], meldId = null } = {}) {
  if (state.winner) return state;
  if (currentSeat(state) !== seatId || state.turnStage !== "draw") return state;
  const top = topDiscard(state);
  if (!top) return state;
  const hand = state.hands[seatId];

  let melds = state.melds;
  let meldSeq = state.meldSeq;
  let nextHand = hand;
  let blocked = state.drawBlocked;
  let event;

  if (meldId) {
    const idx = state.melds.findIndex((m) => m.id === meldId);
    if (idx === -1 || !canExtendMeld(state.melds[idx], top)) return state;
    const meld = state.melds[idx];
    melds = state.melds.slice();
    melds[idx] = { ...meld, cards: orderMeldCards(meld.type, [...meld.cards, top]) };
    blocked = { ...blocked, [meld.ownerSeatId]: true };
    event = { kind: "sapaw", seatId, meldId, cardId: top.id, fromDiscard: true };
  } else {
    if (cardIds.length < 2) return state;
    const cards = cardIds.map((id) => hand.find((c) => c.id === id)).filter(Boolean);
    if (cards.length !== cardIds.length || new Set(cardIds).size !== cardIds.length) return state;
    const type = meldType([...cards, top]);
    if (!type) return state;
    const idSet = new Set(cardIds);
    nextHand = hand.filter((c) => !idSet.has(c.id));
    const meld = { id: `m${meldSeq}`, ownerSeatId: seatId, type, cards: orderMeldCards(type, [...cards, top]) };
    melds = [...state.melds, meld];
    meldSeq += 1;
    event = { kind: "meld", seatId, meldId: meld.id, meldType: type, cardIds: [...cardIds, top.id], fromDiscard: true };
  }

  return {
    ...state,
    discard: state.discard.slice(0, -1),
    hands: { ...state.hands, [seatId]: nextHand },
    melds,
    meldSeq,
    drawBlocked: { ...blocked, [seatId]: false },
    turnStage: "act",
    drawnCardId: top.id,
    drawnFrom: "discard",
    lastEvent: withEvent(state, event)
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
  if (cards.length !== cardIds.length || new Set(cardIds).size !== cardIds.length) return state;

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
  return nextHand.length === 0 ? winTongits(next, seatId) : next;
}

// Adds one card from the hand onto an already-laid meld (any seat's) —
// "sapaw". A no-op if the meld can't take that card right now. Sapaw'ing a
// meld (yours or an opponent's) locks its owner out of calling Draw until
// their next turn's draw.
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
    drawBlocked: { ...state.drawBlocked, [meld.ownerSeatId]: true },
    lastEvent: withEvent(state, { kind: "sapaw", seatId, meldId, cardId })
  };
  return nextHand.length === 0 ? winTongits(next, seatId) : next;
}

// Discards to end the turn. Throwing away your last card is Tong-Its too.
export function discard(state, seatId, cardId) {
  if (state.winner) return state;
  if (currentSeat(state) !== seatId || state.turnStage !== "act") return state;

  const hand = state.hands[seatId];
  const card = hand.find((c) => c.id === cardId);
  if (!card) return state;

  const nextHand = hand.filter((c) => c.id !== cardId);
  const next = {
    ...state,
    hands: { ...state.hands, [seatId]: nextHand },
    discard: [...state.discard, card],
    drawnCardId: null
  };
  if (nextHand.length === 0) return winTongits(next, seatId);
  return advanceTurn(next, withEvent(state, { kind: "discard", seatId, cardId }));
}

// ---------- Draw ----------

// Call Draw instead of drawing. Opponents answer in turn order; anyone with
// nothing exposed and no Secret is folded automatically.
export function callDraw(state, seatId) {
  if (!canCallDraw(state, seatId)) return state;
  const n = state.seatOrder.length;
  const order = [];
  for (let step = 1; step < n; step++) order.push(state.seatOrder[(state.turnIndex + step) % n]);
  const queue = order.filter((id) => hasExposedMeld(state, id) || hasSecret(state.hands[id]));
  const next = {
    ...state,
    turnStage: "respond",
    drawCall: { callerId: seatId, queue, responses: [], order },
    lastEvent: withEvent(state, { kind: "draw-call", seatId })
  };
  return queue.length === 0 ? resolveDraw(next) : next;
}

export function respondDraw(state, seatId, challenge) {
  if (state.winner || state.turnStage !== "respond") return state;
  if (actorSeat(state) !== seatId) return state;
  const drawCall = {
    ...state.drawCall,
    responses: [...state.drawCall.responses, { seatId, challenge: !!challenge }]
  };
  const next = {
    ...state,
    drawCall,
    lastEvent: withEvent(state, { kind: challenge ? "challenge" : "fold", seatId })
  };
  return drawCall.responses.length >= drawCall.queue.length ? resolveDraw(next) : next;
}

function resolveDraw(state) {
  const { callerId, responses, order } = state.drawCall;
  const challengers = responses.filter((r) => r.challenge).map((r) => r.seatId);
  const values = {};
  [callerId, ...challengers].forEach((id) => {
    values[id] = handValue(state.hands[id]);
  });
  let winnerId = callerId;
  if (challengers.length) {
    const best = Math.min(...Object.values(values));
    const tied = [callerId, ...challengers].filter((id) => values[id] === best);
    // A tie never favours the caller; between tied challengers the one
    // seated first to the caller's right (next in turn order) wins.
    winnerId = order.find((id) => tied.includes(id)) ?? callerId;
  }
  const challengerSet = new Set(challengers);
  return finish(
    state,
    winnerId,
    "draw",
    (id) => (challengerSet.has(id) || id === callerId ? PAY.drawFight : PAY.drawFold),
    { callerId, challengers, values }
  );
}

// Everything safe to show on the shared screen or send to every phone —
// deliberately excludes every hand, only counts.
export function publicView(state) {
  return {
    stockCount: state.stock.length,
    discardTop: topDiscard(state),
    melds: state.melds,
    currentSeatId: currentSeat(state),
    actorSeatId: actorSeat(state),
    turnStage: state.turnStage,
    winner: state.winner,
    winType: state.winType,
    drawCall: state.drawCall,
    counts: state.seatOrder.map((id) => ({ seatId: id, count: state.hands[id].length }))
  };
}

// Plays on behalf of a seat that can't (a phone that dropped and isn't
// coming back) so one lost connection can't freeze the table. It never helps
// that seat: a pending Draw is folded, otherwise they draw from the stock and
// throw away their highest-value card.
export function skipTurn(state, seatId) {
  if (state.winner || actorSeat(state) !== seatId) return state;
  if (state.turnStage === "respond") return respondDraw(state, seatId, false);
  let next = state;
  if (next.turnStage === "draw") {
    next = drawStock(next, seatId);
    if (next === state) return state; // stock empty: the round is already over
  }
  if (next.turnStage !== "act") return next;
  const worst = next.hands[seatId].slice().sort((a, b) => cardValue(b) - cardValue(a))[0];
  return worst ? discard(next, seatId, worst.id) : next;
}
