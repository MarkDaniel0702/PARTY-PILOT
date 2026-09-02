import { describe, it, expect } from "vitest";
import {
  COLOURS,
  KIND,
  createUnoDeck,
  createGame,
  canPlay,
  getPlayable,
  playCard,
  chooseColour,
  drawCard,
  passTurn,
  currentSeat,
  topCard,
  publicView
} from "./engine";

// Deterministic "shuffle" so every test deals a known deck.
const noShuffle = (arr) => arr.slice();

const card = (colour, kind, value = null, id = `${colour}-${kind}-${value}`) => ({
  id,
  colour,
  kind,
  value
});

// A card that matches nothing on the default red-5 discard, used to pad a
// hand so playing the card under test doesn't accidentally win the game and
// short-circuit the turn advance being asserted.
const spare = (id = "spare") => card("blue", KIND.NUMBER, 2, id);

// Builds a state directly rather than dealing, so each rule can be probed in
// isolation without fighting the deck order. The draw pile is deliberately
// roomy enough for a Wild Draw Four without triggering a reshuffle.
function stateWith(overrides = {}) {
  return {
    drawPile: Array.from({ length: 10 }, (_, i) => card("green", KIND.NUMBER, (i % 9) + 1, `draw-${i}`)),
    discardPile: [card("red", KIND.NUMBER, 5, "top")],
    hands: { a: [], b: [], c: [] },
    seatOrder: ["a", "b", "c"],
    turnIndex: 0,
    direction: 1,
    activeColour: "red",
    pendingWild: null,
    drawnCardId: null,
    winner: null,
    shuffleFn: noShuffle,
    ...overrides
  };
}

describe("deck", () => {
  it("has the standard 108 cards in the right proportions", () => {
    const deck = createUnoDeck();
    expect(deck).toHaveLength(108);
    expect(deck.filter((c) => c.kind === KIND.WILD)).toHaveLength(4);
    expect(deck.filter((c) => c.kind === KIND.WILD4)).toHaveLength(4);
    COLOURS.forEach((colour) => {
      const inColour = deck.filter((c) => c.colour === colour);
      expect(inColour).toHaveLength(25);
      expect(inColour.filter((c) => c.kind === KIND.NUMBER && c.value === 0)).toHaveLength(1);
      expect(inColour.filter((c) => c.kind === KIND.NUMBER && c.value === 7)).toHaveLength(2);
      expect(inColour.filter((c) => c.kind === KIND.SKIP)).toHaveLength(2);
    });
  });

  it("gives every card a unique id", () => {
    const ids = new Set(createUnoDeck().map((c) => c.id));
    expect(ids.size).toBe(108);
  });
});

describe("createGame", () => {
  it("deals 7 cards each and starts on a plain number card", () => {
    const state = createGame(["a", "b", "c"], { shuffleFn: noShuffle });
    expect(state.hands.a).toHaveLength(7);
    expect(state.hands.b).toHaveLength(7);
    expect(state.hands.c).toHaveLength(7);
    expect(topCard(state).kind).toBe(KIND.NUMBER);
    expect(state.activeColour).toBe(topCard(state).colour);
    // 108 - 21 dealt - 1 discard
    expect(state.drawPile).toHaveLength(86);
  });
});

describe("canPlay", () => {
  const state = stateWith(); // top = red 5, activeColour red

  it("matches on colour", () => {
    expect(canPlay(card("red", KIND.NUMBER, 2), state)).toBe(true);
  });
  it("matches on number value across colours", () => {
    expect(canPlay(card("blue", KIND.NUMBER, 5), state)).toBe(true);
  });
  it("rejects a mismatch on both colour and value", () => {
    expect(canPlay(card("blue", KIND.NUMBER, 2), state)).toBe(false);
  });
  it("always allows wilds", () => {
    expect(canPlay(card("wild", KIND.WILD), state)).toBe(true);
    expect(canPlay(card("wild", KIND.WILD4), state)).toBe(true);
  });
  it("matches action cards by symbol across colours", () => {
    const onSkip = stateWith({
      discardPile: [card("red", KIND.SKIP, null, "top-skip")],
      activeColour: "red"
    });
    expect(canPlay(card("green", KIND.SKIP), onSkip)).toBe(true);
    expect(canPlay(card("green", KIND.REVERSE), onSkip)).toBe(false);
  });
});

describe("turn flow", () => {
  it("advances to the next seat on a plain number card", () => {
    const s = stateWith({ hands: { a: [card("red", KIND.NUMBER, 3, "x"), spare()], b: [], c: [] } });
    const next = playCard(s, "a", "x");
    expect(currentSeat(next)).toBe("b");
    expect(next.activeColour).toBe("red");
  });

  it("skips the next seat on a Skip", () => {
    const s = stateWith({ hands: { a: [card("red", KIND.SKIP, null, "x"), spare()], b: [], c: [] } });
    expect(currentSeat(playCard(s, "a", "x"))).toBe("c");
  });

  it("reverses direction with 3+ players", () => {
    const s = stateWith({ hands: { a: [card("red", KIND.REVERSE, null, "x"), spare()], b: [], c: [] } });
    const next = playCard(s, "a", "x");
    expect(next.direction).toBe(-1);
    expect(currentSeat(next)).toBe("c");
  });

  it("treats Reverse as a Skip in a two-player game", () => {
    const s = stateWith({
      seatOrder: ["a", "b"],
      hands: { a: [card("red", KIND.REVERSE, null, "x"), spare()], b: [] }
    });
    const next = playCard(s, "a", "x");
    expect(next.direction).toBe(1);
    // back to the same player: reverse acted as a skip
    expect(currentSeat(next)).toBe("a");
  });

  it("makes the next seat draw two and lose their turn on a Draw Two", () => {
    const s = stateWith({ hands: { a: [card("red", KIND.DRAW2, null, "x"), spare()], b: [], c: [] } });
    const next = playCard(s, "a", "x");
    expect(next.hands.b).toHaveLength(2);
    expect(currentSeat(next)).toBe("c");
  });

  it("rejects a play from a seat that isn't on turn", () => {
    const s = stateWith({ hands: { a: [], b: [card("red", KIND.NUMBER, 3, "x")], c: [] } });
    expect(playCard(s, "b", "x")).toBe(s);
  });

  it("rejects an illegal card", () => {
    const s = stateWith({ hands: { a: [card("blue", KIND.NUMBER, 2, "x")], b: [], c: [] } });
    expect(playCard(s, "a", "x")).toBe(s);
  });
});

describe("wilds", () => {
  it("freezes the turn until a colour is chosen", () => {
    const s = stateWith({ hands: { a: [card("wild", KIND.WILD, null, "w"), card("red", KIND.NUMBER, 1, "k")], b: [], c: [] } });
    const played = playCard(s, "a", "w");
    expect(played.pendingWild).toMatchObject({ seatId: "a" });
    expect(currentSeat(played)).toBe("a");
    expect(getPlayable(played, "a")).toEqual([]);

    const chosen = chooseColour(played, "a", "green");
    expect(chosen.activeColour).toBe("green");
    expect(chosen.pendingWild).toBeNull();
    expect(currentSeat(chosen)).toBe("b");
  });

  it("rejects a colour choice from the wrong seat or an unknown colour", () => {
    const s = stateWith({ hands: { a: [card("wild", KIND.WILD, null, "w"), card("red", KIND.NUMBER, 1, "k")], b: [], c: [] } });
    const played = playCard(s, "a", "w");
    expect(chooseColour(played, "b", "green")).toBe(played);
    expect(chooseColour(played, "a", "purple")).toBe(played);
  });

  it("makes the next seat draw four and lose their turn on a Wild Draw Four", () => {
    const s = stateWith({ hands: { a: [card("wild", KIND.WILD4, null, "w"), card("red", KIND.NUMBER, 1, "k")], b: [], c: [] } });
    const chosen = chooseColour(playCard(s, "a", "w"), "a", "blue");
    expect(chosen.hands.b).toHaveLength(4);
    expect(chosen.activeColour).toBe("blue");
    expect(currentSeat(chosen)).toBe("c");
  });

  it("wins immediately on a wild played as the last card, with no colour to choose", () => {
    const s = stateWith({ hands: { a: [card("wild", KIND.WILD, null, "w")], b: [], c: [] } });
    const next = playCard(s, "a", "w");
    expect(next.winner).toBe("a");
    expect(next.pendingWild).toBeNull();
  });
});

describe("drawing", () => {
  it("keeps the turn when the drawn card is playable", () => {
    const s = stateWith({
      drawPile: [card("red", KIND.NUMBER, 9, "d1")], // matches red
      hands: { a: [], b: [], c: [] }
    });
    const next = drawCard(s, "a");
    expect(next.hands.a).toHaveLength(1);
    expect(next.drawnCardId).toBe("d1");
    expect(currentSeat(next)).toBe("a");
    // only the freshly drawn card may be played
    expect(getPlayable(next, "a")).toEqual(["d1"]);
  });

  it("passes the turn when the drawn card is unplayable", () => {
    const s = stateWith({
      drawPile: [card("blue", KIND.NUMBER, 2, "d1")], // no match on red 5
      hands: { a: [], b: [], c: [] }
    });
    const next = drawCard(s, "a");
    expect(next.hands.a).toHaveLength(1);
    expect(next.drawnCardId).toBeNull();
    expect(currentSeat(next)).toBe("b");
  });

  it("allows passing after drawing a playable card", () => {
    const s = stateWith({ drawPile: [card("red", KIND.NUMBER, 9, "d1")], hands: { a: [], b: [], c: [] } });
    const drawn = drawCard(s, "a");
    const passed = passTurn(drawn, "a");
    expect(currentSeat(passed)).toBe("b");
    expect(passed.drawnCardId).toBeNull();
  });

  it("refuses a second draw in the same turn", () => {
    const s = stateWith({ drawPile: [card("red", KIND.NUMBER, 9, "d1")], hands: { a: [], b: [], c: [] } });
    const drawn = drawCard(s, "a");
    expect(drawCard(drawn, "a")).toBe(drawn);
  });

  it("refuses a pass when nothing was drawn", () => {
    const s = stateWith();
    expect(passTurn(s, "a")).toBe(s);
  });

  it("reshuffles the discard pile back in when the draw pile is exhausted", () => {
    const s = stateWith({
      drawPile: [],
      discardPile: [
        card("green", KIND.NUMBER, 1, "old-1"),
        card("green", KIND.NUMBER, 2, "old-2"),
        card("red", KIND.NUMBER, 5, "top")
      ],
      hands: { a: [], b: [], c: [] }
    });
    const next = drawCard(s, "a");
    expect(next.hands.a).toHaveLength(1);
    // the top card stays on the discard pile; the rest became the draw pile
    expect(next.discardPile.map((c) => c.id)).toEqual(["top"]);
    expect(next.drawPile.length + next.hands.a.length).toBe(2);
  });
});

describe("winning", () => {
  it("declares a winner when the last card is played and stops further play", () => {
    const s = stateWith({ hands: { a: [card("red", KIND.NUMBER, 3, "x")], b: [card("red", KIND.NUMBER, 4, "y")], c: [] } });
    const next = playCard(s, "a", "x");
    expect(next.winner).toBe("a");
    expect(getPlayable(next, "b")).toEqual([]);
    expect(playCard(next, "b", "y")).toBe(next);
  });
});

describe("lastEvent", () => {
  it("starts null and reports a plain play", () => {
    const s = stateWith({ hands: { a: [card("red", KIND.NUMBER, 3, "x"), spare()], b: [], c: [] } });
    expect(s.lastEvent).toBeUndefined();
    const next = playCard(s, "a", "x");
    expect(next.lastEvent).toMatchObject({ kind: "play", seatId: "a", cardId: "x" });
  });

  it("names the skipped seat", () => {
    const s = stateWith({ hands: { a: [card("red", KIND.SKIP, null, "x"), spare()], b: [], c: [] } });
    expect(playCard(s, "a", "x").lastEvent).toMatchObject({
      kind: "skip",
      seatId: "a",
      targetSeatId: "b"
    });
  });

  it("reports the new direction on a reverse", () => {
    const s = stateWith({ hands: { a: [card("red", KIND.REVERSE, null, "x"), spare()], b: [], c: [] } });
    expect(playCard(s, "a", "x").lastEvent).toMatchObject({ kind: "reverse", direction: -1 });
  });

  it("reports who was penalised and by how much", () => {
    const s = stateWith({ hands: { a: [card("red", KIND.DRAW2, null, "x"), spare()], b: [], c: [] } });
    expect(playCard(s, "a", "x").lastEvent).toMatchObject({
      kind: "penalty",
      targetSeatId: "b",
      count: 2
    });

    const w = stateWith({ hands: { a: [card("wild", KIND.WILD4, null, "w"), spare()], b: [], c: [] } });
    const chosen = chooseColour(playCard(w, "a", "w"), "a", "blue");
    expect(chosen.lastEvent).toMatchObject({ kind: "penalty", targetSeatId: "b", count: 4 });
  });

  it("reports a plain wild colour choice without a penalty", () => {
    const s = stateWith({ hands: { a: [card("wild", KIND.WILD, null, "w"), spare()], b: [], c: [] } });
    const chosen = chooseColour(playCard(s, "a", "w"), "a", "green");
    expect(chosen.lastEvent).toMatchObject({ kind: "colour", colour: "green" });
  });

  it("reports the win", () => {
    const s = stateWith({ hands: { a: [card("red", KIND.NUMBER, 3, "x")], b: [], c: [] } });
    expect(playCard(s, "a", "x").lastEvent).toMatchObject({ kind: "win", seatId: "a" });
  });

  it("increments seq so a repeated event still reads as a change", () => {
    const s = stateWith({
      hands: { a: [card("red", KIND.NUMBER, 3, "x"), spare()], b: [card("red", KIND.NUMBER, 4, "y"), spare("s2")], c: [] }
    });
    const one = playCard(s, "a", "x");
    const two = playCard(one, "b", "y");
    expect(one.lastEvent.kind).toBe("play");
    expect(two.lastEvent.kind).toBe("play");
    expect(two.lastEvent.seq).toBe(one.lastEvent.seq + 1);
  });

  it("is not touched by a rejected action", () => {
    const s = stateWith({ hands: { a: [card("blue", KIND.NUMBER, 2, "x")], b: [], c: [] } });
    expect(playCard(s, "a", "x")).toBe(s);
  });
});

describe("publicView", () => {
  it("exposes counts but never any hand contents", () => {
    const s = stateWith({
      hands: { a: [card("red", KIND.NUMBER, 3, "x")], b: [card("blue", KIND.NUMBER, 4, "y")], c: [] }
    });
    const view = publicView(s);
    expect(view.counts).toEqual([
      { seatId: "a", count: 1 },
      { seatId: "b", count: 1 },
      { seatId: "c", count: 0 }
    ]);
    expect(JSON.stringify(view)).not.toContain('"x"');
    expect(JSON.stringify(view)).not.toContain('"y"');
  });
});
