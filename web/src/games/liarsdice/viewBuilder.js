import { VIEW } from "../../shared/controller/protocol";
import { currentSeat, totalDice } from "./engine";

// Builds the DICE descriptor for one seat. The same object drives a paired
// phone (sent over the wire) and the pass-the-device screen (rendered in
// place), so there is exactly one place that decides what a player may see.
//
// Privacy lives here: `dice` is only ever THIS seat's own dice, and the other
// seats' hands appear solely inside `reveal`, which exists only after a
// challenge has made every die on the table public.
export function buildDiceView(state, seatId, nameOf, readySeats = []) {
  const mine = state.dice[seatId] || [];
  const turnSeat = state.phase === "bidding" ? currentSeat(state) : null;
  const r = state.reveal;

  return {
    view: VIEW.DICE,
    phase: state.phase, // bidding | reveal | over
    round: state.round,
    myTurn: turnSeat === seatId,
    turnName: turnSeat ? nameOf(turnSeat) : null,
    dice: mine,
    out: mine.length === 0,
    bid: state.bid
      ? {
          name: nameOf(state.bid.seatId),
          quantity: state.bid.quantity,
          face: state.bid.face,
          mine: state.bid.seatId === seatId
        }
      : null,
    totalDice: totalDice(state),
    wilds: state.wilds,
    history: state.history.slice(-6).map((b) => ({ name: nameOf(b.seatId), quantity: b.quantity, face: b.face })),
    counts: state.seatOrder.map((id) => ({ name: nameOf(id), dice: state.dice[id].length, you: id === seatId })),
    reveal: r
      ? {
          challenger: nameOf(r.challengerId),
          bidder: nameOf(r.bidderId),
          bid: r.bid,
          matching: r.matching,
          bidWasGood: r.bidWasGood,
          loser: nameOf(r.loserId),
          loserIsMe: r.loserId === seatId,
          eliminated: r.eliminated,
          hands: state.seatOrder
            .filter((id) => r.dice[id].length > 0)
            .map((id) => ({ name: nameOf(id), dice: r.dice[id], mine: id === seatId }))
        }
      : null,
    winner: state.winner ? nameOf(state.winner) : null,
    youWon: state.winner === seatId,
    ready: readySeats.includes(seatId)
  };
}
