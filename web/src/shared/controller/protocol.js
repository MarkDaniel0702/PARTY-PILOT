// The message contract between a game's main screen (host) and a paired
// phone (controller), sent over a PeerJS WebRTC data channel. Bumping
// PROTOCOL_VERSION forces a phone on a stale cached bundle to show a
// "refresh this page" error instead of silently misbehaving after a deploy.
export const PROTOCOL_VERSION = 1;

export const MAX_PLAYERS = 8;

// phone -> host
export const MSG = {
  JOIN: "join",
  BUZZ: "buzz",
  PONG: "pong"
};

// host -> phone
export const HOST_MSG = {
  WELCOME: "welcome",
  VIEW: "view",
  BUZZ_RESULT: "buzzResult",
  PING: "ping",
  ERROR: "error"
};

// view descriptors the host can push to a phone — the phone only ever
// renders one of these, it never runs game logic itself.
export const VIEW = {
  LOBBY: "lobby",
  IDLE: "idle",
  BUZZ: "buzz",
  LOCKED: "locked"
};

export function join(name, teamId, playerId) {
  return { v: PROTOCOL_VERSION, t: MSG.JOIN, name, teamId, playerId };
}

export function buzz(nonce) {
  return { v: PROTOCOL_VERSION, t: MSG.BUZZ, nonce };
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

export function ping() {
  return { v: PROTOCOL_VERSION, t: HOST_MSG.PING };
}

export function errorMsg(reason) {
  return { v: PROTOCOL_VERSION, t: HOST_MSG.ERROR, reason };
}
