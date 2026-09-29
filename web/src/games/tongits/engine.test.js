import { describe, it, expect } from "vitest";
import {
  createDeck,
  createGame,
  isSet,
  isRun,
  meldType,
  canExtendMeld,
  cardValue,
  handValue,
  currentSeat,
  handFor,
  topDiscard,
  publicView,
  drawStock,
  drawDiscard,
  layMeld,
  addToMeld,
  discard
} from "./engine";

const noShuffle = (arr) => arr.slice();
const c = (suit, rank, id = `${suit}${rank}`) => ({ id, suit, rank });

// Builds a state directly so each rule can be probed in isolation without
// fighting deck order — mirrors uno/engine.test.js's stateWith helper.
function stateWith(overrides = {}) {
  return {
    stock: Array.from({ length: 20 }, (_, i) => c("C", (i % 13) + 1, `stock-${i}`)),
    discard: [],
    hands: { a: [], b: [], c: [] },
    melds: [],
    meldSeq: 0,
    seatOrder: ["a", "b", "c"],
    turnIndex: 0,
    turnStage: "act",
    drawnCardId: null,
    winner: null,
    winType: null,
    lastEvent: null,
    shuffleFn: noShuffle,
    ...overrides
  };
}

describe("deck", () => {
  it("has 52 unique cards, 13 per suit", () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);
    expect(new Set(deck.map((card) => card.id)).size).toBe(52);
    ["S", "H", "D", "C"].forEach((suit) => {
      expect(deck.filter((card) => card.suit === suit)).toHaveLength(13);
    });
  });
});

describe("createGame", () => {
  it("deals the dealer one extra card", () => {
    const state = createGame(["a", "b", "c"], { shuffleFn: noShuffle });
    expect(state.hands.a).toHaveLength(13);
    expect(state.hands.b).toHaveLength(12);
    expect(state.hands.c).toHaveLength(12);
    expect(state.stock).toHaveLength(52 - 13 - 12 - 12);
    expect(state.discard).toHaveLength(0);
    expect(state.turnStage).toBe("act");
    expect(currentSeat(state)).toBe("a");
  });

  it("scales hand size down for 4 players", () => {
    const state = createGame(["a", "b", "c", "d"], { shuffleFn: noShuffle });
    expect(state.hands.a).toHaveLength(11);
    expect(state.hands.b).toHaveLength(10);
    expect(state.hands.d).toHaveLength(10);
  });
});

describe("meld validation", () => {
  it("recognises a valid set (same rank, distinct suits)", () => {
    expect(isSet([c("S", 7), c("H", 7), c("D", 7)])).toBe(true);
    expect(isSet([c("S", 7), c("H", 7), c("S", 7, "S7b")])).toBe(false); // duplicate suit
    expect(isSet([c("S", 7), c("H", 7), c("D", 8)])).toBe(false); // rank mismatch
  });

  it("recognises a valid run (consecutive ranks, one suit)", () => {
    expect(isRun([c("H", 4), c("H", 5), c("H", 6)])).toBe(true);
    expect(isRun([c("H", 4), c("H", 6), c("H", 5)])).toBe(true); // order doesn't matter
    expect(isRun([c("H", 4), c("D", 5), c("H", 6)])).toBe(false); // mixed suit
    expect(isRun([c("H", 4), c("H", 5), c("H", 7)])).toBe(false); // gap
    expect(isRun([c("H", 12), c("H", 13), c("H", 1)])).toBe(false); // no K-A wrap
  });

  it("meldType reports set, run, or null", () => {
    expect(meldType([c("S", 9), c("H", 9), c("D", 9)])).toBe("set");
    expect(meldType([c("C", 2), c("C", 3), c("C", 4)])).toBe("run");
    expect(meldType([c("S", 9), c("H", 3), c("D", 5)])).toBe(null);
  });
});

describe("canExtendMeld (sapaw)", () => {
  it("lets a set take its 4th suit, not a 5th", () => {
    const meld = { type: "set", cards: [c("S", 5), c("H", 5), c("D", 5)] };
    expect(canExtendMeld(meld, c("C", 5))).toBe(true);
    expect(canExtendMeld(meld, c("S", 5, "S5b"))).toBe(false); // suit already used
    const full = { type: "set", cards: [c("S", 5), c("H", 5), c("D", 5), c("C", 5)] };
    expect(canExtendMeld(full, c("S", 5, "dup"))).toBe(false); // already 4
  });

  it("lets a run extend at either open end, same suit only", () => {
    const meld = { type: "run", cards: [c("H", 4), c("H", 5), c("H", 6)] };
    expect(canExtendMeld(meld, c("H", 3))).toBe(true);
    expect(canExtendMeld(meld, c("H", 7))).toBe(true);
    expect(canExtendMeld(meld, c("H", 8))).toBe(false); // not adjacent
    expect(canExtendMeld(meld, c("D", 3))).toBe(false); // wrong suit
  });
});

describe("scoring", () => {
  it("values face cards at 10 and ace at 1", () => {
    expect(cardValue(c("S", 1))).toBe(1);
    expect(cardValue(c("S", 7))).toBe(7);
    expect(cardValue(c("S", 13))).toBe(10);
  });

  it("sums a hand's value", () => {
    expect(handValue([c("S", 1), c("H", 10), c("D", 13)])).toBe(21);
  });
});

describe("draw phase", () => {
  it("draws from stock and flips to act", () => {
    const state = stateWith({ turnStage: "draw", hands: { a: [], b: [], c: [] } });
    const next = drawStock(state, "a");
    expect(next).not.toBe(state);
    expect(next.hands.a).toHaveLength(1);
    expect(next.turnStage).toBe("act");
    expect(next.stock).toHaveLength(state.stock.length - 1);
  });

  it("refuses to draw out of turn or in the wrong stage", () => {
    const state = stateWith({ turnStage: "draw" });
    expect(drawStock(state, "b")).toBe(state); // not b's turn
    const acting = stateWith({ turnStage: "act" });
    expect(drawStock(acting, "a")).toBe(acting); // already drew
  });

  it("draws the top discard", () => {
    const state = stateWith({ turnStage: "draw", discard: [c("H", 9)] });
    const next = drawDiscard(state, "a");
    expect(next.hands.a.map((card) => card.id)).toEqual(["H9"]);
    expect(next.discard).toHaveLength(0);
  });

  it("won't let the card just taken from the discard go straight back", () => {
    const state = stateWith({ turnStage: "draw", discard: [c("H", 9)], hands: { a: [c("S", 2)], b: [], c: [] } });
    const drew = drawDiscard(state, "a");
    expect(discard(drew, "a", "H9")).toBe(drew);
    expect(discard(drew, "a", "S2")).not.toBe(drew);
  });

  it("no-ops drawing an empty discard pile", () => {
    const state = stateWith({ turnStage: "draw", discard: [] });
    expect(drawDiscard(state, "a")).toBe(state);
  });
});

describe("layMeld", () => {
  it("lays a valid set and removes it from hand", () => {
    const hand = [c("S", 5), c("H", 5), c("D", 5), c("C", 9)];
    const state = stateWith({ hands: { a: hand, b: [], c: [] } });
    const next = layMeld(state, "a", ["S5", "H5", "D5"]);
    expect(next).not.toBe(state);
    expect(next.hands.a.map((card) => card.id)).toEqual(["C9"]);
    expect(next.melds).toHaveLength(1);
    expect(next.melds[0].type).toBe("set");
    expect(next.winner).toBe(null);
  });

  it("rejects an invalid combination", () => {
    const hand = [c("S", 5), c("H", 6), c("D", 9)];
    const state = stateWith({ hands: { a: hand, b: [], c: [] } });
    expect(layMeld(state, "a", ["S5", "H6", "D9"])).toBe(state);
  });

  it("declares Tongits when the meld empties the hand", () => {
    const hand = [c("S", 5), c("H", 5), c("D", 5)];
    const state = stateWith({ hands: { a: hand, b: [], c: [] } });
    const next = layMeld(state, "a", ["S5", "H5", "D5"]);
    expect(next.winner).toBe("a");
    expect(next.winType).toBe("tongits");
  });
});

describe("addToMeld (sapaw)", () => {
  it("adds a card from hand onto an existing meld", () => {
    const meld = { id: "m0", ownerSeatId: "b", type: "run", cards: [c("H", 4), c("H", 5), c("H", 6)] };
    const state = stateWith({
      hands: { a: [c("H", 7), c("S", 2)], b: [], c: [] },
      melds: [meld]
    });
    const next = addToMeld(state, "a", "m0", "H7");
    expect(next.melds[0].cards.map((card) => card.id)).toEqual(["H4", "H5", "H6", "H7"]);
    expect(next.hands.a.map((card) => card.id)).toEqual(["S2"]);
  });

  it("wins Tongits if sapaw empties the hand", () => {
    const meld = { id: "m0", ownerSeatId: "b", type: "run", cards: [c("H", 4), c("H", 5), c("H", 6)] };
    const state = stateWith({ hands: { a: [c("H", 7)], b: [], c: [] }, melds: [meld] });
    const next = addToMeld(state, "a", "m0", "H7");
    expect(next.winner).toBe("a");
    expect(next.winType).toBe("tongits");
  });

  it("no-ops an illegal addition", () => {
    const meld = { id: "m0", ownerSeatId: "b", type: "run", cards: [c("H", 4), c("H", 5), c("H", 6)] };
    const state = stateWith({ hands: { a: [c("D", 7)], b: [], c: [] }, melds: [meld] });
    expect(addToMeld(state, "a", "m0", "D7")).toBe(state);
  });
});

describe("discard", () => {
  it("discards and advances the turn", () => {
    const state = stateWith({ hands: { a: [c("S", 2), c("H", 3)], b: [], c: [] } });
    const next = discard(state, "a", "S2");
    expect(next.hands.a.map((card) => card.id)).toEqual(["H3"]);
    expect(next.discard.map((card) => card.id)).toEqual(["S2"]);
    expect(currentSeat(next)).toBe("b");
    expect(next.turnStage).toBe("draw");
  });

  it("wins normally (not Tongits) by discarding the last card", () => {
    const state = stateWith({ hands: { a: [c("S", 2)], b: [], c: [] } });
    const next = discard(state, "a", "S2");
    expect(next.winner).toBe("a");
    expect(next.winType).toBe("discard");
  });

  it("ends the round in a showdown when the stock runs dry", () => {
    const state = stateWith({
      stock: [],
      hands: { a: [c("S", 2), c("H", 9)], b: [c("D", 10)], c: [c("C", 1), c("C", 2)] }
    });
    const next = discard(state, "a", "H9");
    // a now holds just S2 (value 2) — lower than b's 10 and c's 1+2=3.
    expect(next.winner).toBe("a");
    expect(next.winType).toBe("showdown");
  });
});

describe("view helpers", () => {
  it("publicView exposes no hands", () => {
    const state = createGame(["a", "b", "c"], { shuffleFn: noShuffle });
    const view = publicView(state);
    expect(view.hands).toBeUndefined();
    expect(view.counts).toHaveLength(3);
    expect(view.currentSeatId).toBe("a");
  });

  it("handFor and topDiscard read through cleanly", () => {
    const state = stateWith({ hands: { a: [c("S", 1)], b: [], c: [] }, discard: [c("H", 2)] });
    expect(handFor(state, "a").map((card) => card.id)).toEqual(["S1"]);
    expect(topDiscard(state).id).toBe("H2");
  });
});
