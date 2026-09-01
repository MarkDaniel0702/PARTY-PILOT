import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { GameShell } from "../../shared/components/GameShell";
import { Screen, ScreenTitle, ScreenSub, BigIcon, SetupBlock } from "../../shared/components/Screen";
import { HowToPlay } from "../../shared/components/HowToPlay";
import { Button, ButtonRow } from "../../shared/components/Button";
import { GroupedPicker } from "../../shared/components/GroupedPicker";
import { TeamSetup, TeamScoreboard } from "../../shared/components/TeamSetup";
import { TimerSetup } from "../../shared/components/TimerSetup";
import { GameTimer } from "../../shared/components/GameTimer";
import { CategoryBanner, AnswerBlock, AwardRow } from "../../shared/components/RevealCard";
import { ResultsList } from "../../shared/components/ResultsList";
import { TieBreakerScreen } from "../../shared/components/TieBreakerScreen";
import { useTeams } from "../../shared/hooks/useTeams";
import { useTimerSetup } from "../../shared/hooks/useTimerSetup";
import { useGameTimer } from "../../shared/hooks/useGameTimer";
import { shuffle } from "../../shared/utils/random";
import { resolveStanding } from "../../shared/utils/resolveStanding";
import { useHostSession } from "../../shared/controller/useHostSession";
import { indexOfTeamId } from "../../shared/controller/teamRef";
import { VIEW, view, buzzResult } from "../../shared/controller/protocol";
import { QRPairing } from "../../shared/components/QRPairing";
import ingameStyles from "../../shared/components/ingame.module.css";
import { PICTUREGUESS_CATEGORIES, PICTUREGUESS_CATEGORY_ICONS } from "./data";
import styles from "./pictureguess.module.css";

const BLUR_STEPS = [20, 12, 6, 0];
const AWARD_POINTS = 10;
const MAX_TEAMS = 6;
const CHALLENGE_SIZE = 20;

const CATEGORY_ITEMS = Object.keys(PICTUREGUESS_CATEGORIES).map((name) => ({
  key: name,
  name,
  icon: PICTUREGUESS_CATEGORY_ICONS[name] || "🖼️"
}));

function finalizeWinner(winner) {
  return winner && winner.score > 0 ? winner : null;
}

function buildChallengeQueue(poolLength) {
  const allIndices = Array.from({ length: poolLength }, (_, i) => i);
  return shuffle(allIndices).slice(0, CHALLENGE_SIZE);
}

export default function App() {
  const [phase, setPhase] = useState("setup");
  const [category, setCategory] = useState(null);

  const teams = useTeams({ maxTeams: MAX_TEAMS });
  const timerSetup = useTimerSetup({ recommended: 4, defaultEnabled: true });
  const teamsInitialized = useRef(false);

  useEffect(() => {
    if (teamsInitialized.current) return;
    teamsInitialized.current = true;
    teams.addTeam("Team 1");
    teams.addTeam("Team 2");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [pool, setPool] = useState([]);
  const [queue, setQueue] = useState([]);
  const [queuePos, setQueuePos] = useState(0);
  const [currentPic, setCurrentPic] = useState(null);
  const [revealLevel, setRevealLevel] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [picsPlayed, setPicsPlayed] = useState(0);

  // Wikipedia thumbnail lookup — race-guarded so a slow fetch for a picture
  // the player has already moved past can never clobber the picture that's
  // actually on screen now. `thumbCacheRef` persists for the whole session
  // (like the original's module-level Map) so revisiting a picture never
  // re-fetches; a failed/absent lookup is deliberately NOT cached, so a
  // transient network hiccup gets a fresh chance next time.
  const thumbCacheRef = useRef(new Map());
  const pictureLoadTokenRef = useRef(0);
  const [pictureState, setPictureState] = useState("loading"); // 'loading' | 'loaded' | 'fallback'
  const [pictureSrc, setPictureSrc] = useState(null);
  const [loadedToken, setLoadedToken] = useState(-1);

  const [pendingTied, setPendingTied] = useState([]);
  const [pendingRanked, setPendingRanked] = useState([]);
  const [result, setResult] = useState(null);

  // Each expiry just sharpens the image a step rather than ending a turn,
  // so use the gentle tone and skip the 5s warning beep.
  const gameTimer = useGameTimer({ timerSound: "soft", onExpire: () => sharpen() });

  // ---------- Phone controller: buzz-in ----------
  const session = useHostSession(teams.teams);
  const { onMessage, sendTo, players: sessionPlayers } = session;
  const [buzzedTeamId, setBuzzedTeamId] = useState(null);
  const [buzzedPlayerId, setBuzzedPlayerId] = useState(null);
  const [lockedTeamIds, setLockedTeamIds] = useState(() => new Set());
  const buzzLockRef = useRef(false);

  const buzzStateRef = useRef();
  buzzStateRef.current = {
    revealed,
    teams: teams.teams,
    lockedTeamIds,
    buzzedTeamId,
    sessionPlayers,
    stopTimer: gameTimer.stop
  };

  useEffect(() => {
    return onMessage((msg) => {
      if (msg.type !== "buzz") return;
      const { revealed, teams: teamsArr, lockedTeamIds, buzzedTeamId, sessionPlayers, stopTimer } =
        buzzStateRef.current;
      if (revealed || buzzedTeamId || buzzLockRef.current) return;
      const player = sessionPlayers.find((p) => p.playerId === msg.playerId);
      if (!player) return;
      const idx = indexOfTeamId(teamsArr, player.teamId);
      if (idx === -1) return;
      const team = teamsArr[idx];
      if (lockedTeamIds.has(team.id)) return;
      buzzLockRef.current = true;
      // Winning the buzz race isn't the same as answering correctly — the
      // real buzzResult (right / wrong) is sent from resolvePhoneBuzz once
      // the host actually judges the spoken answer.
      setBuzzedTeamId(team.id);
      setBuzzedPlayerId(msg.playerId);
      stopTimer();
    });
  }, [onMessage, sendTo]);

  // Skipped entirely during setup so a phone that joins early keeps showing
  // its natural lobby view instead of a premature "watch the main screen".
  useEffect(() => {
    if (sessionPlayers.length === 0 || phase === "setup") return;
    if (phase === "play" && !revealed && currentPic) {
      if (buzzedTeamId) {
        sessionPlayers.forEach((p) => {
          if (!p.connected) return;
          sendTo(
            p.playerId,
            p.playerId === buzzedPlayerId
              ? view({ view: VIEW.LOCKED, title: "You're up!", subtitle: "Shout it out." })
              : view({ view: VIEW.LOCKED, title: "Standby", subtitle: "Someone else buzzed in." })
          );
        });
      } else {
        sessionPlayers.forEach((p) => {
          if (!p.connected) return;
          const idx = indexOfTeamId(teams.teams, p.teamId);
          const eligible = idx !== -1 && !lockedTeamIds.has(teams.teams[idx].id);
          sendTo(
            p.playerId,
            view(
              eligible
                ? { view: VIEW.BUZZ, title: "Know it?", button: { label: "BUZZ" } }
                : { view: VIEW.LOCKED, title: "Locked out", subtitle: "Wait for the next picture." }
            )
          );
        });
      }
    } else {
      sessionPlayers.forEach((p) => {
        if (!p.connected) return;
        sendTo(
          p.playerId,
          view({
            view: VIEW.IDLE,
            title: "Picture Guess",
            subtitle: phase === "play" ? "Watch the main screen." : "Thanks for playing!"
          })
        );
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, revealed, currentPic, buzzedTeamId, buzzedPlayerId, lockedTeamIds, teams.teams, sessionPlayers, sendTo]);

  const buzzedTeam = buzzedTeamId ? teams.teams.find((t) => t.id === buzzedTeamId) : null;

  function resolvePhoneBuzz(won) {
    if (!buzzedTeam) return;
    if (buzzedPlayerId) sendTo(buzzedPlayerId, buzzResult(won));
    if (won) {
      teams.award(teams.teams.indexOf(buzzedTeam), AWARD_POINTS);
      revealAnswer();
    } else {
      setLockedTeamIds((prev) => new Set(prev).add(buzzedTeam.id));
    }
    setBuzzedTeamId(null);
    setBuzzedPlayerId(null);
    buzzLockRef.current = false;
    if (!won && timerSetup.enabled && revealLevel < BLUR_STEPS.length - 1) gameTimer.start(timerSetup.seconds);
  }

  function fetchWikiThumbnail(title) {
    const cache = thumbCacheRef.current;
    if (cache.has(title)) return Promise.resolve(cache.get(title));
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    return fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const src = (data && data.thumbnail && data.thumbnail.source) || null;
        cache.set(title, src);
        return src;
      })
      .catch(() => null);
  }

  // Fetch a fresh picture whenever the current one changes.
  useEffect(() => {
    if (!currentPic) return;
    const token = ++pictureLoadTokenRef.current;
    setPictureState("loading");
    setPictureSrc(null);
    fetchWikiThumbnail(currentPic.wikiTitle).then((src) => {
      if (token !== pictureLoadTokenRef.current) return; // a later picture already loaded
      if (!src) {
        setPictureState("fallback");
        return;
      }
      setPictureSrc(src);
      setLoadedToken(token);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPic]);

  // Per-step reveal timer — restarts whenever a new picture is dealt or the
  // player/timer sharpens a step, and stops once fully sharpened.
  useEffect(() => {
    if (phase !== "play" || !currentPic) return;
    gameTimer.stop();
    if (timerSetup.enabled && revealLevel < BLUR_STEPS.length - 1) {
      gameTimer.start(timerSetup.seconds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealLevel, currentPic, phase]);

  function dealPicture(poolArg, queueArg, pos) {
    setCurrentPic(poolArg[queueArg[pos]]);
    setRevealLevel(0);
    setRevealed(false);
    setBuzzedTeamId(null);
    setBuzzedPlayerId(null);
    setLockedTeamIds(new Set());
    buzzLockRef.current = false;
  }

  function handleStart() {
    const poolArr = PICTUREGUESS_CATEGORIES[category];
    const q = buildChallengeQueue(poolArr.length);
    setPool(poolArr);
    setQueue(q);
    setQueuePos(0);
    setPicsPlayed(0);
    setPhase("play");
    dealPicture(poolArr, q, 0);
  }

  function sharpen() {
    gameTimer.stop();
    setRevealLevel((r) => (r < BLUR_STEPS.length - 1 ? r + 1 : r));
  }

  function revealAnswer() {
    gameTimer.stop();
    setPicsPlayed((p) => p + 1);
    setRevealLevel(BLUR_STEPS.length - 1);
    setRevealed(true);
    setBuzzedTeamId(null);
    setBuzzedPlayerId(null);
    buzzLockRef.current = false;
  }

  function handleNextPicture() {
    const nextPos = queuePos + 1;
    if (nextPos >= queue.length) {
      goToSummary();
    } else {
      setQueuePos(nextPos);
      dealPicture(pool, queue, nextPos);
    }
  }

  function goToSummary() {
    gameTimer.stop();
    const { ranked, tied, winner } = resolveStanding(teams.teams);
    if (tied.length <= 1) {
      setResult({ ranked, winner: finalizeWinner(winner), shared: false, tiebreak: null });
      setPhase("summary");
    } else {
      setPendingRanked(ranked);
      setPendingTied(tied);
      setPhase("tiebreak");
    }
  }

  function handleTiebreakResolved(winner, shared, tiebreak) {
    setResult({ ranked: pendingRanked, winner: finalizeWinner(winner), shared, tiebreak });
    setPhase("summary");
  }

  function handlePlayAgain() {
    const q = buildChallengeQueue(pool.length);
    setQueue(q);
    setQueuePos(0);
    setPicsPlayed(0);
    teams.resetScores();
    setPhase("play");
    dealPicture(pool, q, 0);
  }

  function handleNewGame() {
    setCategory(null);
    setPhase("setup");
  }

  const blurCss = `blur(${BLUR_STEPS[revealLevel]}px)`;

  return (
    <GameShell title="PICTURE GUESS" titleIcon={ImageIcon}>
      <Screen active={phase === "setup"}>
        <ScreenTitle>Picture Guess</ScreenTitle>
        <ScreenSub>No host needed — a picture sharpens into focus on its own until someone shouts the answer.</ScreenSub>

        <HowToPlay
          steps={[
            <>Pick a category and add teams (optional — skip scoring if you just want to play for fun), then tap <strong>Start</strong>.</>,
            "A blurry real photo appears. Shout your guess the moment you know it!",
            <>The picture sharpens on its own over time — or tap <strong>Sharpen</strong> to speed it up.</>,
            <>Tap <strong>Reveal Answer</strong> anytime, award the point, and move to the next picture.</>
          ]}
        />

        <SetupBlock label="1. Choose a category" wide>
          <GroupedPicker groups={{ "Pick one": CATEGORY_ITEMS }} value={category} onChange={setCategory} />
        </SetupBlock>

        <SetupBlock label="2. Teams (optional scoring)">
          <TeamSetup
            teams={teams.teams}
            maxTeams={teams.maxTeams}
            onAdd={() => teams.addTeam()}
            onRemove={teams.removeTeam}
            onRename={teams.renameTeam}
          />
        </SetupBlock>

        {/* Directly after teams: the pairing panel assigns each phone to a
            team, so the team list has to exist above it to be meaningful. */}
        <SetupBlock label="3. Phone controllers">
          <QRPairing session={session} teams={teams.teams} />
        </SetupBlock>

        <SetupBlock label="4. Timer">
          <TimerSetup
            unitLabel="per step"
            recommended={4}
            presets={[3, 4, 6, 8]}
            enabled={timerSetup.enabled}
            onEnabledChange={timerSetup.setEnabled}
            seconds={timerSetup.seconds}
            onSecondsChange={timerSetup.setSeconds}
          />
        </SetupBlock>

        <Button disabled={!category} onClick={handleStart}>
          Start →
        </Button>
      </Screen>

      <Screen active={phase === "play"}>
        <TeamScoreboard teams={teams.teams} onAdjust={teams.award} />
        <CategoryBanner>🖼️ {category}</CategoryBanner>
        <p className={styles.picProgress}>
          Picture {queuePos + 1} of {queue.length}
        </p>
        {queue.length < CHALLENGE_SIZE && (
          <p className={styles.challengeNote}>
            This theme only has {queue.length} unique question{queue.length === 1 ? "" : "s"} so far — you'll play
            through all {queue.length}.
          </p>
        )}
        {timerSetup.enabled && revealLevel < BLUR_STEPS.length - 1 && <GameTimer timer={gameTimer} />}

        <div className={styles.pictureFrame}>
          {pictureState === "loading" && (
            <div className={styles.pictureLoading}>
              <span className={styles.pictureSpinner} aria-hidden="true" />
              <span>Loading picture…</span>
            </div>
          )}
          {pictureSrc && (
            <img
              className={styles.pictureImage}
              style={{ filter: blurCss, display: pictureState === "loaded" ? "block" : "none" }}
              src={pictureSrc}
              alt={`Guess the picture: ${category || ""}`.trim()}
              draggable="false"
              onLoad={() => {
                if (loadedToken !== pictureLoadTokenRef.current) return;
                setPictureState("loaded");
              }}
              onError={() => {
                if (loadedToken !== pictureLoadTokenRef.current) return;
                setPictureState("fallback");
              }}
            />
          )}
          {pictureState === "fallback" && (
            <div className={styles.pictureFallback}>
              <span className={styles.pictureFallbackEmoji} style={{ filter: blurCss }}>
                {currentPic?.emoji}
              </span>
              <span className={styles.pictureFallbackText}>Picture unavailable — guess from the vibes!</span>
            </div>
          )}
        </div>

        {revealed && <AnswerBlock label="Answer" text={currentPic?.answer} />}

        {!revealed && buzzedTeam && (
          <div className={styles.revealBtnWrap}>
            <p className={ingameStyles.turnBanner} style={{ color: buzzedTeam.color }}>
              🔔 {buzzedTeam.name} buzzed in!
            </p>
            <ButtonRow>
              <Button onClick={() => resolvePhoneBuzz(true)}>✅ Got it! (+{AWARD_POINTS})</Button>
              <Button variant="secondary" onClick={() => resolvePhoneBuzz(false)}>
                ❌ Missed
              </Button>
            </ButtonRow>
          </div>
        )}

        {!revealed && !buzzedTeam && (
          <>
            <Button disabled={revealLevel >= BLUR_STEPS.length - 1} onClick={sharpen}>
              🔍 Sharpen
            </Button>
            <div className={styles.revealBtnWrap}>
              <Button variant="secondary" onClick={revealAnswer}>
                💡 Reveal Answer
              </Button>
            </div>
          </>
        )}

        {revealed && (
          <>
            <AwardRow teams={teams.teams} points={AWARD_POINTS} onAward={(i, pts) => teams.award(i, pts)} />
            <Button onClick={handleNextPicture}>Next Picture →</Button>
          </>
        )}

        <div className={styles.endWrap}>
          <Button variant="secondary" onClick={goToSummary}>🏁 End Session</Button>
        </div>
      </Screen>

      <Screen active={phase === "summary"}>
        <BigIcon>🏁</BigIcon>
        <ScreenTitle>Session Complete!</ScreenTitle>
        <ScreenSub>You made it through {picsPlayed} picture{picsPlayed === 1 ? "" : "s"}.</ScreenSub>
        {result && <ResultsList result={result} unit="pts" unitSingular="pt" showSwatch />}
        <ButtonRow>
          <Button onClick={handlePlayAgain}>Play Again</Button>
          <Button variant="secondary" onClick={handleNewGame}>New Game</Button>
        </ButtonRow>
      </Screen>

      <Screen active={phase === "tiebreak"}>
        <BigIcon>⚔️</BigIcon>
        <ScreenTitle>It's a Tie!</ScreenTitle>
        <TieBreakerScreen tied={pendingTied} onResolved={handleTiebreakResolved} />
      </Screen>
    </GameShell>
  );
}
