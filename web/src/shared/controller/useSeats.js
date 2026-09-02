import { useMemo } from "react";

// Normalises the two ways a card game can have players into one shape, so
// the game engine never needs to know which is in use:
//
//   { seatId, name, source: 'phone' | 'local', playerId, connected }
//
// The engine emits per-seat private state; a thin adapter in the game either
// sends it to that seat's phone (`sendTo(playerId, ...)`) or renders it
// inline behind a PassCard. One engine, two adapters.
//
// Mode is all-or-nothing rather than mixed: if any phone is paired the game
// is played on phones, otherwise it's pass-and-play. Mixing the two would
// mean some players' hands are private and others' require passing the
// device around, which is more confusing than it is useful.
export function useSeats({ sessionPlayers = [], rosterNames = [] }) {
  return useMemo(() => {
    const phones = sessionPlayers.filter((p) => p.connected);
    if (phones.length > 0) {
      return phones.map((p) => ({
        seatId: p.playerId,
        name: p.name,
        source: "phone",
        playerId: p.playerId,
        connected: true
      }));
    }
    return rosterNames.map((name, i) => ({
      seatId: `local-${i}`,
      name,
      source: "local",
      playerId: null,
      connected: true
    }));
  }, [sessionPlayers, rosterNames]);
}

export function seatsMode(seats) {
  return seats.length && seats[0].source === "phone" ? "phone" : "local";
}
