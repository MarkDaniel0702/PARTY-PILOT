// Weapon definitions — plain data, so adding to the arsenal later never means
// touching the engine. Slice 1 ships three that play differently rather than
// a long list that all feel the same.
//
// `uses: null` means unlimited.

export const WEAPONS = [
  {
    id: "bazooka",
    name: "Bone Bazooka",
    emoji: "🦴",
    kind: "projectile",
    damage: 45,
    radius: 26,
    windFactor: 1,
    uses: null,
    blurb: "Straight and true. Wind pushes it."
  },
  {
    id: "lobber",
    name: "Fish Lobber",
    emoji: "🐟",
    kind: "projectile",
    damage: 34,
    radius: 40,
    // Lighter, so the wind throws it around far more — trickier, but the
    // blast is much wider.
    windFactor: 2.6,
    uses: null,
    blurb: "Wide blast, but the wind really grabs it."
  },
  {
    id: "whack",
    name: "Paw Whack",
    emoji: "🐾",
    kind: "melee",
    damage: 38,
    radius: 26,
    range: 26,
    knockback: 7,
    uses: null,
    blurb: "Close range only — and it sends them flying."
  }
];

export function weaponById(id) {
  return WEAPONS.find((w) => w.id === id) || WEAPONS[0];
}
