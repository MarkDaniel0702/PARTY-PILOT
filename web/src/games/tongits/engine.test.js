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
  discard,
  skipTurn,
  callDraw,
  respondDraw,
  canCallDraw,
  actorSeat,
  hasSecret,
  isBurned,
  PAY
} from "./engine";

const noShuffle = (arr) => arr.slice();
const c = (suit, rank, id = `${suit}${rank}`) => ({ id, suit, rank });
// A laid set owned by `owner` (default 3s) — enough to make a seat "exposed".
const m = (id, owner, cards) => ({
  id,
  ownerSeatId: owner,
  type: "set",
  cards: cards || [c("S", 3, id + "s"), c("H", 3, id + "h"), c("D", 3, id + "d")]
});
const runMeld = (owner) => ({ id: "m0", ownerSeatId: owner, type: "run", cards: [c("H", 4), c("H", 5), c("H", 6)] });

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
    drawnFrom: null,
    lastStockDrawer: null,
    drawBlocked: { a: false, b: false, c: false },
    drawCall: null,
    winner: null,
    winType: null,
    result: null,
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

describe("dealing", () => {
  it("3 players: 12 each, dealer 13, stock 15, dealer opens by discarding", () => {
    const state = createGame(["a", "b", "c"], { shuffleFn: noShuffle });
    expect(state.hands.a).toHaveLength(13);
    expect(state.hands.b).toHaveLength(12);
    expect(state.hands.c).toHaveLength(12);
    expect(state.stock).toHaveLength(15);
    expect(state.discard).toHaveLength(0);
    expect(state.turnStage).toBe("act");
    expect(currentSeat(state)).toBe("a");
  });

  it("2 players get 12 / 13 as well", () => {
    const state = createGame(["a", "b"], { shuffleFn: noShuffle });
    expect(state.hands.a).toHaveLength(13);
    expect(state.hands.b).toHaveLength(12);
  });

  it("lets any seat deal and play first", () => {
    const state = createGame(["a", "b", "c"], { shuffleFn: noShuffle, dealer: 1 });
    expect(currentSeat(state)).toBe("b");
    expect(state.hands.b).toHaveLength(13);
    expect(state.hands.c).toHaveLength(12);
  });

  it("wraps an out-of-range dealer index around the table", () => {
    expect(currentSeat(createGame(["a", "b", "c"], { shuffleFn: noShuffle, dealer: 4 }))).toBe("b");
    expect(currentSeat(createGame(["a", "b"], { shuffleFn: noShuffle, dealer: -1 }))).toBe("b");
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
    expect(isRun([c("H", 1), c("H", 2), c("H", 3)])).toBe(true); // Ace low
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
    const state = stateWith({ turnStage: "draw" });
    const next = drawStock(state, "a");
    expect(next).not.toBe(state);
    expect(next.hands.a).toHaveLength(1);
    expect(next.turnStage).toBe("act");
    expect(next.stock).toHaveLength(state.stock.length - 1);
    expect(next.lastStockDrawer).toBe("a");
  });

  it("refuses to draw out of turn or in the wrong stage", () => {
    const state = stateWith({ turnStage: "draw" });
    expect(drawStock(state, "b")).toBe(state); // not b's turn
    const acting = stateWith({ turnStage: "act" });
    expect(drawStock(acting, "a")).toBe(acting); // already drew
  });

  it("takes the top discard only by laying a meld that uses it", () => {
    const state = stateWith({
      turnStage: "draw",
      discard: [c("H", 9)],
      hands: { a: [c("S", 9), c("D", 9), c("C", 2)], b: [], c: [] }
    });
    expect(drawDiscard(state, "a")).toBe(state); // no meld offered
    expect(drawDiscard(state, "a", { cardIds: ["S9"] })).toBe(state); // needs 2+ hand cards
    expect(drawDiscard(state, "a", { cardIds: ["S9", "C2"] })).toBe(state); // not a meld
    const next = drawDiscard(state, "a", { cardIds: ["S9", "D9"] });
    expect(next.melds).toHaveLength(1);
    expect(next.melds[0].cards.map((x) => x.id).sort()).toEqual(["D9", "H9", "S9"]);
    expect(next.hands.a.map((x) => x.id)).toEqual(["C2"]);
    expect(next.discard).toHaveLength(0);
    expect(next.turnStage).toBe("act");
  });

  it("can take the discard as a run, or sapaw it onto a table meld", () => {
    const run = stateWith({
      turnStage: "draw",
      discard: [c("H", 6)],
      hands: { a: [c("H", 4), c("H", 5), c("C", 2)], b: [], c: [] }
    });
    expect(drawDiscard(run, "a", { cardIds: ["H4", "H5"] }).melds[0].type).toBe("run");

    const meld = m("m0", "b", [c("S", 6), c("D", 6), c("C", 6)]);
    const sap = stateWith({ turnStage: "draw", discard: [c("H", 6)], hands: { a: [c("C", 2)], b: [], c: [] }, melds: [meld] });
    const next = drawDiscard(sap, "a", { meldId: "m0" });
    expect(next.melds[0].cards).toHaveLength(4);
    expect(next.drawBlocked.b).toBe(true);
    expect(drawDiscard(sap, "a", { meldId: "nope" })).toBe(sap);
  });

  it("no-ops drawing an empty discard pile", () => {
    const state = stateWith({ turnStage: "draw", discard: [] });
    expect(drawDiscard(state, "a", { cardIds: ["x", "y"] })).toBe(state);
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
    const state = stateWith({ hands: { a: [c("H", 7), c("S", 2)], b: [], c: [] }, melds: [runMeld("b")] });
    const next = addToMeld(state, "a", "m0", "H7");
    expect(next.melds[0].cards.map((card) => card.id)).toEqual(["H4", "H5", "H6", "H7"]);
    expect(next.hands.a.map((card) => card.id)).toEqual(["S2"]);
  });

  it("wins Tongits if sapaw empties the hand", () => {
    const state = stateWith({ hands: { a: [c("H", 7)], b: [], c: [] }, melds: [runMeld("b")] });
    const next = addToMeld(state, "a", "m0", "H7");
    expect(next.winner).toBe("a");
    expect(next.winType).toBe("tongits");
  });

  it("no-ops an illegal addition", () => {
    const state = stateWith({ hands: { a: [c("D", 7)], b: [], c: [] }, melds: [runMeld("b")] });
    expect(addToMeld(state, "a", "m0", "D7")).toBe(state);
  });

  it("sapaw on an opponent's meld blocks that owner from calling Draw", () => {
    const state = stateWith({ hands: { a: [c("H", 7), c("S", 2)], b: [], c: [] }, melds: [runMeld("b")] });
    expect(addToMeld(state, "a", "m0", "H7").drawBlocked.b).toBe(true);
  });

  it("sapaw on your own meld blocks you next turn; drawing clears the lock", () => {
    const state = stateWith({ hands: { a: [c("H", 7), c("S", 2)], b: [], c: [] }, melds: [runMeld("a")] });
    expect(addToMeld(state, "a", "m0", "H7").drawBlocked.a).toBe(true);
    const turn = stateWith({ turnStage: "draw", melds: [runMeld("a")], drawBlocked: { a: true, b: false, c: false } });
    expect(canCallDraw(turn, "a")).toBe(false);
    expect(drawStock(turn, "a").drawBlocked.a).toBe(false);
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

  it("discarding the last card is Tong-Its too", () => {
    const state = stateWith({ hands: { a: [c("S", 2)], b: [], c: [] } });
    const next = discard(state, "a", "S2");
    expect(next.winner).toBe("a");
    expect(next.winType).toBe("tongits");
  });
});

describe("Draw (call / fold / challenge)", () => {
  const drawState = (hands, melds, extra = {}) => stateWith({ turnStage: "draw", hands, melds, ...extra });
  const allExposed = [m("m0", "a"), m("m1", "b"), m("m2", "c")];

  it("needs an exposed meld of your own", () => {
    const none = drawState({ a: [c("S", 2)], b: [], c: [] }, []);
    expect(callDraw(none, "a")).toBe(none);
    const onlyOthers = drawState({ a: [c("S", 2)], b: [], c: [] }, [m("m0", "b")]);
    expect(callDraw(onlyOthers, "a")).toBe(onlyOthers);
  });

  it("can only be called at the start of your own turn, instead of drawing", () => {
    const acting = stateWith({ turnStage: "act", melds: [m("m0", "a")] });
    expect(callDraw(acting, "a")).toBe(acting);
    const wrongSeat = drawState({ a: [], b: [], c: [] }, [m("m0", "b")]);
    expect(callDraw(wrongSeat, "b")).toBe(wrongSeat);
  });

  it("auto-folds burned opponents: the caller wins at once", () => {
    const state = drawState({ a: [c("S", 9)], b: [c("D", 1)], c: [c("D", 2)] }, [m("m0", "a")]);
    const next = callDraw(state, "a");
    expect(next.winner).toBe("a");
    expect(next.winType).toBe("draw");
    // burned folders pay fold 20% + burned 20% = 4 chips each
    expect(next.result.payments).toEqual({ a: 8, b: -4, c: -4 });
  });

  it("asks exposed opponents in turn order; lowest value wins", () => {
    const state = drawState({ a: [c("S", 9)], b: [c("D", 3)], c: [c("D", 2)] }, allExposed);
    let next = callDraw(state, "a");
    expect(next.turnStage).toBe("respond");
    expect(actorSeat(next)).toBe("b");
    expect(respondDraw(next, "c", true)).toBe(next); // wrong responder
    next = respondDraw(next, "b", true);
    expect(actorSeat(next)).toBe("c");
    next = respondDraw(next, "c", false);
    expect(next.winner).toBe("b"); // b (3) beats the caller (9)
    expect(next.result.payments.a).toBe(-PAY.drawFight);
    expect(next.result.payments.c).toBe(-PAY.drawFold);
  });

  it("everyone folding makes the caller win", () => {
    const state = drawState({ a: [c("S", 9)], b: [c("D", 3)], c: [c("D", 2)] }, allExposed);
    let next = callDraw(state, "a");
    next = respondDraw(next, "b", false);
    next = respondDraw(next, "c", false);
    expect(next.winner).toBe("a");
    expect(next.result.payments).toEqual({ a: 2 * PAY.drawFold, b: -PAY.drawFold, c: -PAY.drawFold });
  });

  it("a challenger who loses pays the fight rate", () => {
    const state = drawState({ a: [c("S", 2)], b: [c("D", 8)], c: [c("D", 9)] }, allExposed);
    let next = callDraw(state, "a");
    next = respondDraw(next, "b", true);
    next = respondDraw(next, "c", false);
    expect(next.winner).toBe("a");
    expect(next.result.payments.b).toBe(-PAY.drawFight);
    expect(next.result.payments.c).toBe(-PAY.drawFold);
  });

  it("a tie goes to the challenger, never the caller", () => {
    const state = drawState({ a: [c("S", 5)], b: [c("D", 5)], c: [c("D", 9)] }, allExposed);
    let next = callDraw(state, "a");
    next = respondDraw(next, "b", true);
    next = respondDraw(next, "c", false);
    expect(next.winner).toBe("b");
  });

  it("tied challengers: the one seated first after the caller wins", () => {
    const state = drawState({ a: [c("S", 9)], b: [c("D", 5)], c: [c("H", 5)] }, allExposed);
    let next = callDraw(state, "a");
    next = respondDraw(next, "b", true);
    next = respondDraw(next, "c", true);
    expect(next.winner).toBe("b");
  });

  it("a concealed Secret (four of a kind) lets a meld-less opponent challenge", () => {
    const secret = [c("S", 7), c("H", 7), c("D", 7), c("C", 7)];
    expect(hasSecret(secret)).toBe(true);
    const state = drawState({ a: [c("S", 9)], b: secret, c: [c("D", 2)] }, [m("m0", "a")]);
    expect(isBurned(state, "b")).toBe(false);
    const next = callDraw(state, "a");
    expect(next.turnStage).toBe("respond");
    expect(actorSeat(next)).toBe("b"); // c has nothing exposed: auto-folded
  });

  it("skipTurn folds a pending Draw for an absent responder", () => {
    const state = drawState({ a: [c("S", 9)], b: [c("D", 3)], c: [c("D", 2)] }, allExposed);
    const next = skipTurn(callDraw(state, "a"), "b");
    expect(actorSeat(next)).toBe("c");
  });
});

describe("stock-out showdown", () => {
  const ended = (hands, melds, drawer) =>
    discard(
      stateWith({
        stock: [],
        lastStockDrawer: drawer,
        melds,
        hands: { ...hands, a: [...hands.a, c("C", 12, "throw")] }
      }),
      "a",
      "throw"
    );
  const allExposed = [m("m0", "a"), m("m1", "b"), m("m2", "c")];

  it("ends the round when the stock runs dry; lowest hand wins", () => {
    const next = ended({ a: [c("S", 2)], b: [c("D", 10)], c: [c("C", 1), c("C", 2)] }, allExposed);
    expect(next.winner).toBe("a");
    expect(next.winType).toBe("showdown");
  });

  it("burned players lose even with the lowest hand", () => {
    const next = ended({ a: [c("S", 9)], b: [c("D", 1)], c: [c("H", 8)] }, [m("m0", "a"), m("m1", "c")]);
    expect(next.winner).toBe("c"); // b has the lowest hand but is burned
    expect(next.result.payments.b).toBe(-(PAY.stockOut + PAY.burned));
  });

  it("ties go to whoever drew the last stock card", () => {
    const next = ended({ a: [c("S", 5)], b: [c("D", 5)], c: [c("H", 9)] }, allExposed, "b");
    expect(next.winner).toBe("b");
  });

  it("otherwise to the next tied seat after the last drawer", () => {
    const next = ended({ a: [c("S", 5)], b: [c("D", 5)], c: [c("H", 9)] }, allExposed, "c");
    expect(next.winner).toBe("a"); // c isn't tied; the next tied seat after c is a
  });
});

describe("payouts", () => {
  it("Tong-Its: 40% per loser, +20% if burned, +20% per Ace/King in the winner's cards", () => {
    const state = stateWith({
      hands: { a: [c("S", 1), c("H", 1), c("D", 1)], b: [c("D", 4)], c: [c("D", 5)] },
      melds: [m("m1", "b")] // c is burned
    });
    const next = layMeld(state, "a", ["S1", "H1", "D1"]);
    expect(next.winType).toBe("tongits");
    expect(next.result.payments.b).toBe(-(PAY.tongits + 3 * PAY.bonus));
    expect(next.result.payments.c).toBe(-(PAY.tongits + PAY.burned + 3 * PAY.bonus));
    expect(next.result.payments.a).toBe(-(next.result.payments.b + next.result.payments.c));
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

describe("skipTurn", () => {
  it("does nothing out of turn", () => {
    const state = stateWith({ hands: { a: [c("S", 1)], b: [c("H", 2)], c: [c("D", 3)] } });
    expect(skipTurn(state, "b")).toBe(state);
  });

  it("draws from the stock, discards the highest-value card and passes the turn", () => {
    const state = stateWith({
      turnStage: "draw",
      stock: [c("C", 1, "s1"), c("C", 2, "s2")],
      hands: { a: [c("S", 3, "low"), c("H", 13, "king")], b: [c("H", 2, "b1")], c: [c("D", 3, "c1")] }
    });
    const next = skipTurn(state, "a");
    expect(next.discard.map((x) => x.id)).toEqual(["king"]);
    expect(next.hands.a).toHaveLength(2);
    expect(currentSeat(next)).toBe("b");
    expect(next.turnStage).toBe("draw");
  });

  it("leaves the state alone when the stock is empty", () => {
    const state = stateWith({ turnStage: "draw", stock: [], hands: { a: [c("S", 3)], b: [], c: [] } });
    expect(skipTurn(state, "a")).toBe(state);
  });
});

describe("random full-round soak", () => {
  // Plays many whole rounds with a dumb bot: every round must end, never
  // stall, and always account for exactly 52 distinct cards.
  function rng(seed) {
    let t = seed;
    return () => {
      t = (t * 1664525 + 1013904223) % 4294967296;
      return t / 4294967296;
    };
  }
  function cardsIn(s) {
    return [...s.stock, ...s.discard, ...Object.values(s.hands).flat(), ...s.melds.flatMap((x) => x.cards)];
  }
  function step(s, rand) {
    const id = actorSeat(s);
    if (s.turnStage === "respond") return respondDraw(s, id, rand() < 0.5);
    const hand = s.hands[id];
    if (s.turnStage === "draw") {
      if (canCallDraw(s, id) && rand() < 0.3) return callDraw(s, id);
      const top = topDiscard(s);
      if (top) {
        for (const mm of s.melds) {
          const next = drawDiscard(s, id, { meldId: mm.id });
          if (next !== s) return next;
        }
        for (let i = 0; i < hand.length; i++)
          for (let j = i + 1; j < hand.length; j++) {
            const next = drawDiscard(s, id, { cardIds: [hand[i].id, hand[j].id] });
            if (next !== s) return next;
          }
      }
      return drawStock(s, id);
    }
    for (const card of hand)
      for (const mm of s.melds) {
        const next = addToMeld(s, id, mm.id, card.id);
        if (next !== s) return next;
      }
    for (let i = 0; i < hand.length; i++)
      for (let j = i + 1; j < hand.length; j++)
        for (let k = j + 1; k < hand.length; k++) {
          const next = layMeld(s, id, [hand[i].id, hand[j].id, hand[k].id]);
          if (next !== s) return next;
        }
    return discard(s, id, hand[Math.floor(rand() * hand.length)].id);
  }

  it("always finishes with 52 distinct cards and zero-sum payments", () => {
    const seen = {};
    for (let seed = 1; seed <= 150; seed++) {
      const rand = rng(seed);
      const shuffle = (arr) => {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(rand() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      };
      const ids = seed % 3 === 0 ? ["a", "b"] : ["a", "b", "c"];
      let s = createGame(ids, { shuffleFn: shuffle });
      let steps = 0;
      while (!s.winner && steps++ < 500) {
        const next = step(s, rand);
        expect(next).not.toBe(s); // the bot only ever makes legal moves
        s = next;
        expect(new Set(cardsIn(s).map((x) => x.id)).size).toBe(52);
      }
      expect(s.winner).not.toBe(null);
      expect(Object.values(s.result.payments).reduce((x, y) => x + y, 0)).toBe(0);
      seen[s.winType] = (seen[s.winType] || 0) + 1;
    }
    expect(Object.keys(seen).length).toBeGreaterThanOrEqual(2);
  });
});
