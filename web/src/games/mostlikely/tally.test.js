import { describe, expect, it } from "vitest";
import { rankVotes } from "./tally";

describe("rankVotes", () => {
  it("crowns a single top vote-getter", () => {
    const { ranked, winner, tiedNames } = rankVotes(["A", "B", "C"], [1, 3, 0]);
    expect(ranked.map((e) => e.name)).toEqual(["B", "A", "C"]);
    expect(winner.name).toBe("B");
    expect(tiedNames).toEqual(["B"]);
  });

  it("does not crown anyone on a tie", () => {
    const { winner, tiedNames } = rankVotes(["A", "B", "C"], [2, 2, 0]);
    expect(winner).toBeNull();
    expect(tiedNames).toEqual(["A", "B"]);
  });

  it("handles zero votes (everyone timed out)", () => {
    const { winner, tiedNames } = rankVotes(["A", "B"], [0, 0]);
    expect(winner).toBeNull();
    expect(tiedNames).toEqual([]);
  });
});
