import { describe, it, expect } from "vitest";
import { toHostEvent } from "./useHostSession";
import { action, MSG, ACTION } from "./protocol";

describe("toHostEvent", () => {
  it("labels a phone's message with its type and who really sent it", () => {
    const ev = toHostEvent(action(ACTION.FIRE, { row: 1, col: 2 }), "seat-1");
    expect(ev.type).toBe(MSG.ACTION);
    expect(ev.playerId).toBe("seat-1");
    expect(ev.kind).toBe(ACTION.FIRE);
    expect(ev.payload).toEqual({ row: 1, col: 2 });
  });

  it("never lets a phone overwrite who it is", () => {
    const forged = { ...action(ACTION.PLAY_CARD, { cardId: "c1" }), playerId: "someone-else" };
    expect(toHostEvent(forged, "seat-1").playerId).toBe("seat-1");
  });

  it("never lets a phone overwrite what kind of message it is", () => {
    const forged = { ...action(ACTION.PLAY_CARD, { cardId: "c1" }), type: MSG.BUZZ };
    expect(toHostEvent(forged, "seat-1").type).toBe(MSG.ACTION);
  });
});
