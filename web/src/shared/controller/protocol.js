// The message contract between a game's main screen (host) and a paired
// phone (controller), sent over a PeerJS WebRTC data channel. Bumping
// PROTOCOL_VERSION forces a phone on a stale cached bundle to show a
// "refresh this page" error instead of silently misbehaving after a deploy.
// v2 added the card-game views (HAND / CHOICE / WAIT) and the generic ACTION
// message. v3 added the Tong-Its view and its draw/meld/discard actions. v4
// added the Snake, Connect Four and Liar's Dice views and their actions. A
// phone still running a cached older bundle is rejected with
// "version-mismatch" and told to refresh, rather than silently misbehaving.
export const PROTOCOL_VERSION = 4;

export const MAX_PLAYERS = 8;

// phone -> host
export const MSG = {
  JOIN: "join",
  BUZZ: "buzz",
  // Generic card-game input. BUZZ is kept as its own type so the three
  // already-shipped buzz games need no changes.
  ACTION: "action",
  PONG: "pong"
};

// host -> phone
export const HOST_MSG = {
  WELCOME: "welcome",
  VIEW: "view",
  BUZZ_RESULT: "buzzResult",
  PING: "ping",
  // A one-off message to a phone that isn't a view change — used to deliver
  // garbage lines and end-of-match signals without redrawing its screen.
  EVENT: "event",
  ERROR: "error"
};

// view descriptors the host can push to a phone — the phone only ever
// renders one of these, it never runs game logic itself.
export const VIEW = {
  LOBBY: "lobby",
  IDLE: "idle",
  BUZZ: "buzz",
  LOCKED: "locked",
  // Card games. HAND is the only view carrying private state — the host sends
  // it to exactly one player, so nobody else's channel ever receives it.
  HAND: "hand",
  CHOICE: "choice",
  WAIT: "wait",
  // Drawing games. DRAW carries the secret word and goes to the drawer alone;
  // GUESS carries only the masked word, so the answer never reaches a guesser.
  DRAW: "draw",
  GUESS: "guess",
  // Artillery: the aiming gamepad, sent only to the team whose turn it is.
  AIM: "aim",
  // Tetris is the one game the phone simulates itself — this view hands it
  // the seed and mode, then the phone runs its own board and streams
  // snapshots back for the TV.
  TETRIS: "tetris",
  // Battleship. PLACEMENT carries the player's own in-progress fleet only —
  // never the opponent's. BATTLE carries the player's own board (their ships
  // + shots received) and their redacted view of the opponent's board (hits/
  // misses/sunk wrecks only) — the opponent's unsunk ship positions never
  // enter this message.
  PLACEMENT: "placement",
  BATTLE: "battle",
  // Tong-Its. Carries this seat's own hand, the shared table melds (every
  // seat's, face-up — that part is public by definition), the discard top,
  // and whose turn/stage it is. Never another seat's hand.
  TONGITS: "tongits",
  // Snake Battle: a steering pad. The host runs the whole simulation; the
  // phone only reports which way its snake should turn.
  SNAKE: "snake",
  // Connect Four: the column picker plus a miniature of the board.
  CONNECT4: "connect4",
  // Liar's Dice. Carries this seat's own dice (and only theirs), the current
  // bid, and the bidding controls on their turn. Opponents' dice only ever
  // appear in the reveal after a challenge, which is public by definition.
  DICE: "dice"
};

// Action kinds carried by MSG.ACTION.
export const ACTION = {
  PLAY_CARD: "playCard",
  DRAW_CARD: "drawCard",
  CHOOSE_COLOUR: "chooseColour",
  // UNO: decline to play the card you just drew (it was legal, but you'd
  // rather keep it) and end the turn.
  PASS_TURN: "passTurn",
  // Drawing. Points are batched by the sender rather than sent per pointer
  // event — see shared/draw/useStrokeBatcher.js.
  STROKE_START: "strokeStart",
  STROKE_POINTS: "strokePoints",
  STROKE_END: "strokeEnd",
  UNDO: "undo",
  CLEAR: "clear",
  GUESS: "guess",
  // Artillery. AIM streams the live angle/power so the shared screen shows
  // the arc building; FIRE commits the shot. Battleship also reuses FIRE
  // (payload: { row, col }) to commit an attack on a target cell.
  AIM: "aim",
  FIRE: "fire",
  MOVE: "move",
  SELECT_WEAPON: "selectWeapon",
  // Tetris, phone -> host.
  TETRIS_STATE: "tetrisState",
  TETRIS_GARBAGE: "tetrisGarbage",
  TETRIS_OVER: "tetrisOver",
  // Battleship, phone -> host, placement phase only.
  PLACE_SHIP: "placeShip",
  REMOVE_SHIP: "removeShip",
  RANDOM_FLEET: "randomFleet",
  CONFIRM_FLEET: "confirmFleet",
  // Tong-Its, phone -> host.
  DRAW_STOCK: "drawStock",
  DRAW_DISCARD: "drawDiscard",
  LAY_MELD: "layMeld",
  ADD_TO_MELD: "addToMeld",
  DISCARD: "discard",
  // Snake Battle, phone -> host: payload { dir: "up" | "down" | "left" | "right" }.
  TURN: "turn",
  // Connect Four, phone -> host: payload { col }.
  DROP_DISC: "dropDisc",
  // Liar's Dice, phone -> host. BID payload { quantity, face }; READY means
  // "I've seen the reveal, deal the next round".
  BID: "bid",
  CALL_LIAR: "callLiar",
  READY: "ready"
};

export function join(name, teamId, playerId) {
  return { v: PROTOCOL_VERSION, t: MSG.JOIN, name, teamId, playerId };
}

export function buzz(nonce) {
  return { v: PROTOCOL_VERSION, t: MSG.BUZZ, nonce };
}

export function action(kind, payload) {
  return { v: PROTOCOL_VERSION, t: MSG.ACTION, kind, payload };
}

export function pong() {
  return { v: PROTOCOL_VERSION, t: MSG.PONG };
}

export function welcome(playerId, teamId, teams) {
  return { v: PROTOCOL_VERSION, t: HOST_MSG.WELCOME, playerId, teamId, teams };
}

export function view(descriptor) {
  return { v: PROTOCOL_VERSION, t: HOST_MSG.VIEW, ...descriptor };
}

export function buzzResult(won) {
  return { v: PROTOCOL_VERSION, t: HOST_MSG.BUZZ_RESULT, won };
}

export function event(kind, payload) {
  return { v: PROTOCOL_VERSION, t: HOST_MSG.EVENT, kind, payload };
}

export function ping() {
  return { v: PROTOCOL_VERSION, t: HOST_MSG.PING };
}

export function errorMsg(reason) {
  return { v: PROTOCOL_VERSION, t: HOST_MSG.ERROR, reason };
}
