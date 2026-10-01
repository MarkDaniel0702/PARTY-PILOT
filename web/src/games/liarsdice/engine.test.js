import { describe, it, expect } from "vitest";
import {
  createGame,
  aliveSeats,
  currentSeat,
  diceFor,
  totalDice,
  countMatching,
  isValidBid,
  minQuantity,
  placeBid,
  callLiar,
  nextRound,
  removeSeat,
  publicView,
  standings,
  rollDice,
  describeBid
} from "./engine";

// A tiny deterministic rng so a "random" roll is repeatable.
function seeded(seed = 1) {
  let a = seed;
  return () => {
    a = (a * 1664525 + 1013904223) % 4294967296;
    return a / 4294967296;
  };
}

// Builds a game and pins every seat's dice, so a rule can be probed without
// depending on what happened to be rolled.
function setup(diceBySeat, extra = {}) {
  const seats = Object.keys(diceBySeat);
  const g = createGame(seats, { rng: seeded(7), ...extra });
  return { ...g, dice: Object.fromEntries(seats.map((id) => [id, diceBySeat[id].slice()])) };
}

describe("rollDice", () => {
  it("rolls the requested number of dice, each 1-6", () => {
    const dice = rollDice(50, seeded(3));
    expect(dice).toHaveLength(50);
    expect(dice.every((d) => Number.isInteger(d) && d >= 1 && d <= 6)).toBe(true);
  });
  it("is repeatable for the same rng", () => {
    expect(rollDice(10, seeded(9))).toEqual(rollDice(10, seeded(9)));
  });
});

describe("createGame", () => {
  it("gives every seat the starting number of dice", () => {
    const g = createGame(["a", "b", "c"], { diceEach: 4, rng: seeded(1) });
    ["a", "b", "c"].forEach((id) => expect(diceFor(g, id)).toHaveLength(4));
    expect(totalDice(g)).toBe(12);
    expect(g.phase).toBe("bidding");
    expect(g.round).toBe(1);
  });
  it("lets any seat open, wrapping an out-of-range index", () => {
    expect(currentSeat(createGame(["a", "b", "c"], { startIndex: 1 }))).toBe("b");
    expect(currentSeat(createGame(["a", "b", "c"], { startIndex: 4 }))).toBe("b");
  });
});

describe("countMatching", () => {
  it("counts exact faces", () => {
    expect(countMatching([3, 3, 4, 5], 3, false)).toBe(2);
  });
  it("counts ones as wild for any other face", () => {
    expect(countMatching([3, 1, 1, 5], 3, true)).toBe(3);
    expect(countMatching([3, 1, 1, 5], 3, false)).toBe(1);
  });
  it("never counts wilds towards a bid on ones", () => {
    expect(countMatching([1, 1, 2, 3], 1, true)).toBe(2);
  });
});

describe("isValidBid / minQuantity", () => {
  const g = setup({ a: [1, 2, 3], b: [4, 5, 6] });

  it("accepts any sane opening bid", () => {
    expect(isValidBid(g, 1, 1)).toBe(true);
    expect(isValidBid(g, 6, 6)).toBe(true);
  });
  it("rejects nonsense", () => {
    expect(isValidBid(g, 0, 3)).toBe(false);
    expect(isValidBid(g, 2, 7)).toBe(false);
    expect(isValidBid(g, 2, 0)).toBe(false);
    expect(isValidBid(g, 1.5, 2)).toBe(false);
    expect(isValidBid(g, "2", 2)).toBe(false);
  });
  it("rejects a quantity larger than the dice on the table", () => {
    expect(isValidBid(g, 7, 2)).toBe(false);
  });
  it("only allows raises: more dice, or the same number of a higher face", () => {
    const afterBid = placeBid(g, "a", 3, 4);
    expect(isValidBid(afterBid, 3, 4)).toBe(false); // same
    expect(isValidBid(afterBid, 3, 3)).toBe(false); // lower face
    expect(isValidBid(afterBid, 3, 5)).toBe(true); // same count, higher face
    expect(isValidBid(afterBid, 4, 2)).toBe(true); // more dice, any face
    expect(isValidBid(afterBid, 2, 6)).toBe(false); // fewer dice, even with a higher face
  });
  it("reports the lowest legal quantity for each face", () => {
    const afterBid = placeBid(g, "a", 3, 4);
    expect(minQuantity(afterBid, 5)).toBe(3);
    expect(minQuantity(afterBid, 4)).toBe(4);
    expect(minQuantity(afterBid, 2)).toBe(4);
    expect(minQuantity(g, 2)).toBe(1);
  });
});

describe("placeBid", () => {
  it("records the bid and passes the turn", () => {
    const g = setup({ a: [1, 2], b: [3, 4], c: [5, 6] });
    const next = placeBid(g, "a", 2, 3);
    expect(next.bid).toEqual({ seatId: "a", quantity: 2, face: 3 });
    expect(next.history).toHaveLength(1);
    expect(currentSeat(next)).toBe("b");
  });
  it("ignores a bid from the wrong seat or an invalid bid", () => {
    const g = setup({ a: [1, 2], b: [3, 4] });
    expect(placeBid(g, "b", 1, 1)).toBe(g);
    expect(placeBid(g, "a", 99, 1)).toBe(g);
  });
  it("skips seats with no dice left", () => {
    const g = setup({ a: [1], b: [], c: [2] });
    expect(currentSeat(placeBid(g, "a", 1, 2))).toBe("c");
  });
  it("does not mutate the previous state", () => {
    const g = setup({ a: [1, 2], b: [3, 4] });
    placeBid(g, "a", 1, 2);
    expect(g.bid).toBe(null);
    expect(g.history).toHaveLength(0);
  });
});

describe("callLiar", () => {
  it("is refused with no bid on the table", () => {
    const g = setup({ a: [1, 2], b: [3, 4] });
    expect(callLiar(g, "a")).toBe(g);
  });

  it("makes the challenger lose a die when the bid was good", () => {
    // 3 + 3 + a wild 1 = three 3s on the table; a bid of three 3s holds.
    const g = placeBid(setup({ a: [3, 3, 5], b: [1, 6, 2] }), "a", 3, 3);
    const r = callLiar(g, "b");
    expect(r.phase).toBe("reveal");
    expect(r.reveal.bidWasGood).toBe(true);
    expect(r.reveal.loserId).toBe("b");
    expect(diceFor(r, "b")).toHaveLength(2);
    expect(diceFor(r, "a")).toHaveLength(3);
  });

  it("makes the bidder lose a die when the bid was a bluff", () => {
    const g = placeBid(setup({ a: [2, 2, 5], b: [4, 6, 2] }), "a", 5, 2);
    const r = callLiar(g, "b");
    expect(r.reveal.bidWasGood).toBe(false);
    expect(r.reveal.loserId).toBe("a");
    expect(diceFor(r, "a")).toHaveLength(2);
    expect(r.reveal.matching).toBe(3);
  });

  it("keeps the dice as they were for the reveal screen", () => {
    const g = placeBid(setup({ a: [2, 2, 5], b: [4, 6, 2] }), "a", 5, 2);
    const r = callLiar(g, "b");
    expect(r.reveal.dice.a).toEqual([2, 2, 5]);
  });

  it("counts wilds only when the rule is on", () => {
    const dice = { a: [1, 1, 4], b: [4, 6, 2] };
    const withWilds = callLiar(placeBid(setup(dice, { wilds: true }), "a", 4, 4), "b");
    expect(withWilds.reveal.matching).toBe(4);
    expect(withWilds.reveal.bidWasGood).toBe(true);
    const without = callLiar(placeBid(setup(dice, { wilds: false }), "a", 4, 4), "b");
    expect(without.reveal.matching).toBe(2);
    expect(without.reveal.bidWasGood).toBe(false);
  });

  it("judges a bid on ones by real ones only", () => {
    const g = placeBid(setup({ a: [1, 2, 3], b: [4, 5, 6] }), "a", 2, 1);
    expect(callLiar(g, "b").reveal.bidWasGood).toBe(false);
  });

  it("eliminates a seat that loses its last die", () => {
    // b holds one die and wrongly calls a true bid: b is out.
    const g = placeBid(setup({ a: [3, 3, 3], b: [4] }), "a", 3, 3);
    const out = callLiar(g, "b");
    expect(out.reveal.eliminated).toBe(true);
    expect(out.outOrder).toEqual(["b"]);
    expect(diceFor(out, "b")).toEqual([]);
  });

  it("does not eliminate a seat that still has dice", () => {
    const g = placeBid(setup({ a: [2, 5], b: [4, 4] }), "a", 3, 3);
    const r = callLiar(g, "b"); // bluff: a loses one of two dice
    expect(r.reveal.loserId).toBe("a");
    expect(r.reveal.eliminated).toBe(false);
    expect(r.outOrder).toEqual([]);
  });

  it("cannot be called by the bidder on their own bid", () => {
    const g = setup({ a: [1], b: [2] });
    const bid = { ...g, bid: { seatId: "a", quantity: 1, face: 1 } };
    expect(callLiar(bid, "a")).toBe(bid);
  });

  it("is refused outside the bidding phase", () => {
    const g = placeBid(setup({ a: [3, 3, 5], b: [1, 6, 2] }), "a", 3, 3);
    const r = callLiar(g, "b");
    expect(callLiar(r, "a")).toBe(r);
    expect(placeBid(r, "a", 9, 9)).toBe(r);
  });
});

describe("nextRound", () => {
  it("re-rolls, clears the bid and opens with the player who lost a die", () => {
    const g = placeBid(setup({ a: [2, 2, 5], b: [4, 6, 2], c: [3, 3, 3] }), "a", 5, 2);
    const r = nextRound(callLiar(g, "b"));
    expect(r.phase).toBe("bidding");
    expect(r.round).toBe(2);
    expect(r.bid).toBe(null);
    expect(r.history).toEqual([]);
    expect(currentSeat(r)).toBe("a"); // the bluffer lost the die, so they open
    expect(diceFor(r, "a")).toHaveLength(2);
    expect(diceFor(r, "b")).toHaveLength(3);
  });

  it("opens with the next player along when the loser was eliminated", () => {
    const g = placeBid(setup({ a: [3, 3, 3], b: [4], c: [2, 2] }), "a", 3, 3);
    const r = nextRound(callLiar(g, "b")); // b loses their only die
    expect(diceFor(r, "b")).toEqual([]);
    expect(currentSeat(r)).toBe("c");
  });

  it("ends the game when one player is left", () => {
    const g = placeBid(setup({ a: [3, 3, 3], b: [4] }), "a", 3, 3);
    const r = nextRound(callLiar(g, "b"));
    expect(r.phase).toBe("over");
    expect(r.winner).toBe("a");
  });

  it("does nothing unless a reveal is showing", () => {
    const g = setup({ a: [1], b: [2] });
    expect(nextRound(g)).toBe(g);
  });
});

describe("removeSeat", () => {
  it("passes the turn on when the current player is removed", () => {
    const g = setup({ a: [1, 2], b: [3, 4], c: [5, 6] });
    const r = removeSeat(g, "a");
    expect(diceFor(r, "a")).toEqual([]);
    expect(currentSeat(r)).toBe("b");
    expect(r.phase).toBe("bidding");
  });

  it("leaves the turn alone when someone else is removed", () => {
    const g = setup({ a: [1, 2], b: [3, 4], c: [5, 6] });
    expect(currentSeat(removeSeat(g, "c"))).toBe("a");
  });

  it("crowns the last player standing", () => {
    const g = setup({ a: [1, 2], b: [3, 4] });
    const r = removeSeat(g, "b");
    expect(r.phase).toBe("over");
    expect(r.winner).toBe("a");
  });

  it("is a no-op for an unknown or already-out seat", () => {
    const g = setup({ a: [1, 2], b: [3, 4], c: [] });
    expect(removeSeat(g, "zzz")).toBe(g);
    expect(removeSeat(g, "c")).toBe(g);
  });

  it("can still resolve a round whose bidder was removed", () => {
    const g = placeBid(setup({ a: [2, 2], b: [4, 6], c: [3, 3] }), "a", 5, 2);
    const kicked = removeSeat(g, "a");
    const r = callLiar(kicked, "b");
    expect(r.phase).toBe("reveal");
    expect(r.reveal.eliminated).toBe(false);
    expect(aliveSeats(nextRound(r))).toEqual(["b", "c"]);
  });
});

describe("publicView", () => {
  it("never exposes any seat's dice while bidding", () => {
    const g = placeBid(setup({ a: [1, 2, 3], b: [4, 5, 6] }), "a", 2, 3);
    const view = publicView(g);
    expect(view.counts).toEqual([
      { seatId: "a", dice: 3 },
      { seatId: "b", dice: 3 }
    ]);
    expect(JSON.stringify(view)).not.toContain('"dice":[');
    expect(view.reveal).toBe(null);
  });

  it("includes the dice once a challenge has made them public", () => {
    const g = placeBid(setup({ a: [1, 2, 3], b: [4, 5, 6] }), "a", 2, 3);
    expect(publicView(callLiar(g, "b")).reveal.dice.a).toEqual([1, 2, 3]);
  });
});

describe("standings", () => {
  it("ranks the winner first, then eliminated players latest-first", () => {
    let g = createGame(["a", "b", "c"], { rng: seeded(1) });
    g = removeSeat(g, "b");
    g = removeSeat(g, "c");
    expect(standings(g)).toEqual(["a", "c", "b"]);
  });
});

describe("describeBid", () => {
  it("formats quantity x face", () => {
    expect(describeBid({ quantity: 4, face: 6 })).toBe("4 × 6");
  });
});
