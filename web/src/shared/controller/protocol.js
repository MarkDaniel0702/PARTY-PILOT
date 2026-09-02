// The message contract between a game's main screen (host) and a paired
// phone (controller), sent over a PeerJS WebRTC data channel. Bumping
// PROTOCOL_VERSION forces a phone on a stale cached bundle to show a
// "refresh this page" error instead of silently misbehaving after a deploy.
// v2 added the card-game views (HAND / CHOICE / WAIT) and the generic ACTION
// message. A phone still running a cached v1 bundle is rejected with
// "version-mismatch" and told to refresh, rather than silently misbehaving.
export const PROTOCOL_VERSION = 2;

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
  TETRIS: "tetris"
};

// Action kinds carried by MSG.ACTION.
export const ACTION = {
  PLAY_CARD: "playCard",
  DRAW_CARD: "drawCard",
  CHOOSE_COLOUR: "chooseColour",
  // Drawing. Points are batched by the sender rather than sent per pointer
  // event — see shared/draw/useStrokeBatcher.js.
  STROKE_START: "strokeStart",
  STROKE_POINTS: "strokePoints",
  STROKE_END: "strokeEnd",
  UNDO: "undo",
  CLEAR: "clear",
  GUESS: "guess",
  // Artillery. AIM streams the live angle/power so the shared screen shows
  // the arc building; FIRE commits the shot.
  AIM: "aim",
  FIRE: "fire",
  MOVE: "move",
  SELECT_WEAPON: "selectWeapon",
  // Tetris, phone -> host.
  TETRIS_STATE: "tetrisState",
  TETRIS_GARBAGE: "tetrisGarbage",
  TETRIS_OVER: "tetrisOver"
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
