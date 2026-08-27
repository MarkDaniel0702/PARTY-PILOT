import { useEffect, useRef, useState } from "react";
import { Music } from "lucide-react";
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
import { resolveStanding } from "../../shared/utils/resolveStanding";
import { GUESSTHESONG_CATEGORIES, GUESSTHESONG_CATEGORY_ICONS } from "./data";
import { getArtistThemes, ARTIST_THEME_PREFIX, MIN_ARTIST_SONGS } from "./artistThemes";
import ingameStyles from "../../shared/components/ingame.module.css";
import styles from "./guessthesong.module.css";

const MAX_TEAMS = 6;

const CATEGORY_ITEMS = Object.keys(GUESSTHESONG_CATEGORIES).map((name) => ({
  key: name,
  name,
  icon: GUESSTHESONG_CATEGORY_ICONS[name] || "🎵"
}));

// Optional artist-specific themes, generated from the library: one per
// artist with MIN_ARTIST_SONGS+ distinct songs. Empty if nobody qualifies.
const ARTIST_THEMES = getArtistThemes();
const ARTIST_ITEMS = ARTIST_THEMES.map((t) => ({
  key: t.name,
  name: t.artist,
  icon: "🎤",
  meta: `${t.count} songs`
}));

const GENRE_COUNT = CATEGORY_ITEMS.length;
const TOTAL_SONGS = Object.values(GUESSTHESONG_CATEGORIES).reduce((n, list) => n + list.length, 0);

function poolForTheme(name) {
  if (GUESSTHESONG_CATEGORIES[name]) return GUESSTHESONG_CATEGORIES[name];
  const artistTheme = ARTIST_THEMES.find((t) => t.name === name);
  return artistTheme ? artistTheme.songs : [];
}

const isArtistThemeName = (name) => typeof name === "string" && name.startsWith(ARTIST_THEME_PREFIX);

function finalizeWinner(winner) {
  return winner && winner.score > 0 ? winner : null;
}

// ---------- Optional YouTube clip player ----------
// Loads the official YouTube IFrame Player API on first use. Module-level
// (not per-component) since only one instance of this game ever runs on a
// page, exactly matching the original's single global script-tag load.
let ytApiPromise = null;
function loadYouTubeAPI() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prevReady === "function") prevReady();
      resolve(window.YT);
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.onerror = () => { ytApiPromise = null; };
    document.head.appendChild(tag);
  });
  return ytApiPromise;
}

export default function App() {
  const [phase, setPhase] = useState("setup");
  const [category, setCategory] = useState(null);
  // Which picker the setup screen is showing: the genre list, or the
  // dedicated artist-challenge list.
  const [pickerView, setPickerView] = useState("genres"); // 'genres' | 'artists'

  const teams = useTeams({ maxTeams: MAX_TEAMS });
  const timerSetup = useTimerSetup({ recommended: 12, defaultEnabled: true });
  const teamsInitialized = useRef(false);

  useEffect(() => {
    if (teamsInitialized.current) return;
    teamsInitialized.current = true;
    teams.addTeam("Team 1");
    teams.addTeam("Team 2");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [pool, setPool] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [clueLevel, setClueLevel] = useState(1);
  const [revealed, setRevealed] = useState(false);
  const [songsPlayed, setSongsPlayed] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const usedIndicesRef = useRef(new Set());
  const revealedRef = useRef(false);

  useEffect(() => {
    revealedRef.current = revealed;
  }, [revealed]);

  const [pendingTied, setPendingTied] = useState([]);
  const [pendingRanked, setPendingRanked] = useState([]);
  const [tiebreakTarget, setTiebreakTarget] = useState("summary"); // 'summary' | 'themeComplete'
  const [result, setResult] = useState(null);

  const gameTimer = useGameTimer({
    // Each expiry just advances to the next clue rather than ending a turn,
    // so use the gentle tone and skip the 5s warning beep.
    timerSound: "soft",
    onExpire: () => {
      if (currentSong && clueLevel < currentSong.clues.length) advanceClue();
      else revealAnswer();
    }
  });

  // ---------- Clip player state ----------
  const ytPlayerRef = useRef(null);
  const clipWatchdogRef = useRef(null);
  const clipLoadTokenRef = useRef(0);
  const clipFrameMountRef = useRef(null);

  const [clipVisible, setClipVisible] = useState(false);
  const [clipDataState, setClipDataState] = useState("compact"); // 'compact' | 'revealed'
  const [clipMode, setClipMode] = useState("loading"); // 'loading' | 'ready' | 'error'
  const [clipPlaying, setClipPlaying] = useState(false);
  const [clipProgressVisible, setClipProgressVisible] = useState(false);
  const [clipProgressPct, setClipProgressPct] = useState(0);

  function stopClipWatchdog() {
    if (clipWatchdogRef.current) {
      clearInterval(clipWatchdogRef.current);
      clipWatchdogRef.current = null;
    }
  }

  function destroyClipPlayer() {
    clipLoadTokenRef.current++;
    stopClipWatchdog();
    if (ytPlayerRef.current) {
      try {
        ytPlayerRef.current.destroy();
      } catch (e) {
        /* already gone */
      }
      ytPlayerRef.current = null;
    }
    if (clipFrameMountRef.current) clipFrameMountRef.current.innerHTML = "";
    setClipVisible(false);
    setClipDataState("compact");
    setClipMode("loading");
    setClipPlaying(false);
    setClipProgressVisible(false);
    setClipProgressPct(0);
  }

  function startClipWatchdog(song) {
    stopClipWatchdog();
    if (!song.clipDuration) return;
    const start = song.clipStart || 0;
    const end = start + song.clipDuration;
    clipWatchdogRef.current = setInterval(() => {
      const player = ytPlayerRef.current;
      if (!player || typeof player.getCurrentTime !== "function") return;
      const t = player.getCurrentTime();
      if (t >= end) {
        player.pauseVideo();
        player.seekTo(start, true);
        setClipProgressPct(0);
        stopClipWatchdog();
      } else {
        const frac = Math.max(0, Math.min(1, (t - start) / song.clipDuration));
        setClipProgressPct(frac * 100);
      }
    }, 250);
  }

  function setupClipPlayer(song) {
    destroyClipPlayer();
    if (!song.youtubeId) return;

    const token = clipLoadTokenRef.current;
    setClipVisible(true);
    setClipProgressVisible(!!song.clipDuration);

    loadYouTubeAPI().then((YT) => {
      if (token !== clipLoadTokenRef.current) return; // song moved on while the API was loading
      const mountEl = document.createElement("div");
      clipFrameMountRef.current.appendChild(mountEl);
      const start = song.clipStart || 0;
      ytPlayerRef.current = new YT.Player(mountEl, {
        videoId: song.youtubeId,
        playerVars: {
          start,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          fs: 0,
          playsinline: 1
        },
        events: {
          onReady: () => {
            if (token !== clipLoadTokenRef.current) return;
            setClipMode("ready");
            // Handles the rare case where the answer was revealed before this
            // (slow) API/player load finished — catch the frame up to match.
            if (revealedRef.current) setClipDataState("revealed");
          },
          onError: () => {
            if (token !== clipLoadTokenRef.current) return;
            setClipMode("error");
          },
          onStateChange: (e) => {
            if (token !== clipLoadTokenRef.current) return;
            if (e.data === YT.PlayerState.PLAYING) {
              setClipPlaying(true);
              startClipWatchdog(song);
            } else if (e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.ENDED) {
              setClipPlaying(false);
              if (e.data === YT.PlayerState.ENDED) stopClipWatchdog();
            }
          }
        }
      });
    });
  }

  function revealClipPlayer() {
    if (!currentSong || !currentSong.youtubeId || !ytPlayerRef.current) return;
    setClipDataState("revealed");
  }

  function handleClipPlay() {
    if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === "function") {
      ytPlayerRef.current.playVideo();
    }
  }
  function handleClipPause() {
    if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === "function") {
      ytPlayerRef.current.pauseVideo();
    }
  }
  function handleClipReplay() {
    if (!ytPlayerRef.current) return;
    const start = (currentSong && currentSong.clipStart) || 0;
    ytPlayerRef.current.seekTo(start, true);
    ytPlayerRef.current.playVideo();
  }

  // ---------- Clue timer — restarts on a new song or a new clue level ----------
  useEffect(() => {
    if (phase !== "play" || !currentSong) return;
    gameTimer.stop();
    if (timerSetup.enabled) gameTimer.start(timerSetup.seconds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clueLevel, currentSong, phase]);

  function pickUnusedSongIndex(poolArg) {
    const used = usedIndicesRef.current;
    const available = [];
    for (let i = 0; i < poolArg.length; i++) {
      if (!used.has(i)) available.push(i);
    }
    const idx = available[Math.floor(Math.random() * available.length)];
    used.add(idx);
    return poolArg[idx];
  }

  function pickSong(poolArg) {
    const item = pickUnusedSongIndex(poolArg);
    setCurrentSong(item);
    setClueLevel(1);
    setRevealed(false);
    setupClipPlayer(item);
  }

  function handleStart() {
    const poolArr = poolForTheme(category);
    if (!poolArr.length) return;
    usedIndicesRef.current = new Set();
    setPool(poolArr);
    setSongsPlayed(0);
    setMaxScore(poolArr.reduce((sum, song) => sum + song.pointValue, 0));
    setPhase("play");
    pickSong(poolArr);
  }

  function advanceClue() {
    setClueLevel((l) => (currentSong && l < currentSong.clues.length ? l + 1 : l));
  }

  function handleNextClue() {
    gameTimer.stop();
    advanceClue();
  }

  function revealAnswer() {
    gameTimer.stop();
    setSongsPlayed((p) => p + 1);
    setRevealed(true);
    revealClipPlayer();
  }

  function checkThemeComplete(poolArg) {
    return usedIndicesRef.current.size === poolArg.length;
  }

  function handleNextSong() {
    if (checkThemeComplete(pool)) {
      goToThemeComplete();
    } else {
      pickSong(pool);
    }
  }

  function goToSummary() {
    gameTimer.stop();
    destroyClipPlayer();
    const { ranked, tied, winner } = resolveStanding(teams.teams);
    if (tied.length <= 1) {
      setResult({ ranked, winner: finalizeWinner(winner), shared: false, tiebreak: null });
      setPhase("summary");
    } else {
      setPendingRanked(ranked);
      setPendingTied(tied);
      setTiebreakTarget("summary");
      setPhase("tiebreak");
    }
  }

  function goToThemeComplete() {
    gameTimer.stop();
    destroyClipPlayer();
    const { ranked, tied, winner } = resolveStanding(teams.teams);
    if (tied.length <= 1) {
      setResult({ ranked, winner: finalizeWinner(winner), shared: false, tiebreak: null });
      setPhase("themeComplete");
    } else {
      setPendingRanked(ranked);
      setPendingTied(tied);
      setTiebreakTarget("themeComplete");
      setPhase("tiebreak");
    }
  }

  function handleTiebreakResolved(winner, shared, tiebreak) {
    setResult({ ranked: pendingRanked, winner: finalizeWinner(winner), shared, tiebreak });
    setPhase(tiebreakTarget);
  }

  function handleRestartTheme() {
    usedIndicesRef.current = new Set();
    setSongsPlayed(0);
    teams.resetScores();
    setPhase("play");
    pickSong(pool);
  }

  function handleNewGame() {
    setCategory(null);
    setPickerView("genres");
    setPhase("setup");
  }

  const artistTheme = isArtistThemeName(category);
  const themeLabel = artistTheme ? category.slice(ARTIST_THEME_PREFIX.length) : category;

  const clipPlayerClass = `${styles.clipPlayer} ${clipDataState === "revealed" ? styles.clipPlayerRevealed : ""}`.trim();
  const showBadge = clipMode !== "error" && clipDataState !== "revealed";
  const showFallback = clipMode === "error";
  const showProgress = clipMode !== "error" && clipProgressVisible;

  return (
    <GameShell title="GUESS THE SONG" titleIcon={Music}>
      <Screen active={phase === "setup"}>
        <ScreenTitle>Guess the Song</ScreenTitle>
        <ScreenSub>
          Play the clip, or skip straight to the clues — no host needed either way. {TOTAL_SONGS} songs across{" "}
          {GENRE_COUNT} genres, spanning OPM to hip-hop to indie to K-pop to karaoke-night classics
          {ARTIST_ITEMS.length > 0 && <> — plus {ARTIST_ITEMS.length} artist-only challenges</>}.
        </ScreenSub>

        <HowToPlay
          steps={[
            <>Pick a theme and add teams (optional — skip scoring if you just want to play for fun), then tap <strong>Start</strong>.</>,
            "An emoji clue appears first. Shout the song the moment you know it!",
            "More clues reveal over time — getting easier as it goes.",
            <><strong>🎤 Artist Challenges</strong> focus on a single artist (any artist with {MIN_ARTIST_SONGS}+ songs in the library) — the artist name is already given, so the clues stop at the description.</>,
            <>Tap <strong>Reveal Answer</strong> anytime, award that song's points (100–500, harder songs are worth more) to whoever got it, and move on.</>,
            "Songs with a 🎧 clip available can be played right in the browser — audio only until the answer's revealed, then the full video unlocks."
          ]}
        />

        <SetupBlock label="1. Choose a theme" wide>
          {pickerView === "genres" ? (
            <>
              <GroupedPicker groups={{ "Genres": CATEGORY_ITEMS }} value={category} onChange={setCategory} />
              {ARTIST_ITEMS.length > 0 && (
                <div className={styles.artistLaunch}>
                  <Button variant="secondary" onClick={() => setPickerView("artists")}>
                    🎤 Artist Challenges ({ARTIST_ITEMS.length}) →
                  </Button>
                  <p className={styles.artistLaunchHint}>
                    Guess songs from just one artist — one theme per artist with {MIN_ARTIST_SONGS}+ songs in the library.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className={styles.artistPanel}>
              <div className={styles.artistPanelHead}>
                <span className={styles.artistPanelTitle}>🎤 Artist Challenges</span>
                <Button variant="secondary" onClick={() => setPickerView("genres")}>
                  ← Back to genres
                </Button>
              </div>
              <p className={styles.artistPanelHint}>
                One artist, {MIN_ARTIST_SONGS}+ songs. Only artists with enough songs in the library appear here — the list
                grows on its own as songs are added.
              </p>
              <GroupedPicker
                groups={{ "Pick an artist": ARTIST_ITEMS }}
                value={category}
                onChange={setCategory}
              />
            </div>
          )}
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

        <SetupBlock label="3. Timer">
          <TimerSetup
            unitLabel="per clue"
            recommended={12}
            presets={[8, 12, 15, 20]}
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
        <CategoryBanner>{artistTheme ? "🎤" : "🎵"} {themeLabel}</CategoryBanner>
        <span className={styles.pointBadge}>💰 {currentSong?.pointValue} PTS</span>
        {timerSetup.enabled && !revealed && <GameTimer timer={gameTimer} />}

        <div className={`${ingameStyles.revealCard} ${styles.songCard}`.trim()}>
          <span className={ingameStyles.revealLabel}>
            CLUE {clueLevel} OF {currentSong?.clues.length}
          </span>
          <div className={styles.clueList}>
            {currentSong &&
              Array.from({ length: clueLevel }, (_, i) => (
                <div key={i} className={`${styles.clueItem} ${i === 0 ? styles.clueEmoji : ""}`.trim()}>
                  {currentSong.clues[i]}
                </div>
              ))}
          </div>
        </div>

        {clipVisible && (
          <div className={clipPlayerClass}>
            <div className={styles.clipFrameWrap}>
              <div className={styles.clipYtMount} ref={clipFrameMountRef} />
            </div>
            <div className={styles.clipControlsBar}>
              {showBadge && <span className={styles.clipBadge}>🎧 Clip available</span>}
              {!showFallback && (
                <div className={styles.clipBtns}>
                  {clipMode === "loading" && (
                    <button type="button" className={styles.clipBtn} disabled>
                      ⏳ Loading…
                    </button>
                  )}
                  {clipMode === "ready" && !clipPlaying && (
                    <button type="button" className={styles.clipBtn} onClick={handleClipPlay}>
                      ▶️ Play
                    </button>
                  )}
                  {clipMode === "ready" && clipPlaying && (
                    <button type="button" className={styles.clipBtn} onClick={handleClipPause}>
                      ⏸️ Pause
                    </button>
                  )}
                  <button type="button" className={styles.clipBtn} disabled={clipMode !== "ready"} onClick={handleClipReplay}>
                    ↺ Replay
                  </button>
                </div>
              )}
              {showProgress && (
                <div className={styles.clipProgress}>
                  <div className={styles.clipProgressFill} style={{ width: `${clipProgressPct}%` }} />
                </div>
              )}
            </div>
            {showFallback && (
              <p className={styles.clipFallback}>🔇 This clip can't play here — no worries, keep going with the clues!</p>
            )}
          </div>
        )}

        {revealed && <AnswerBlock label="Answer" text={currentSong?.answer} />}

        {!revealed && (
          <>
            <Button disabled={!currentSong || clueLevel >= currentSong.clues.length} onClick={handleNextClue}>
              🔓 Reveal Next Clue
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
            <AwardRow teams={teams.teams} points={currentSong?.pointValue} onAward={(i, pts) => teams.award(i, pts)} />
            <Button onClick={handleNextSong}>Next Song →</Button>
          </>
        )}

        <div className={styles.endWrap}>
          <Button variant="secondary" onClick={goToSummary}>🏁 End Session</Button>
        </div>
      </Screen>

      <Screen active={phase === "summary"}>
        <BigIcon>🏁</BigIcon>
        <ScreenTitle>Session Complete!</ScreenTitle>
        <ScreenSub>You made it through {songsPlayed} song{songsPlayed === 1 ? "" : "s"}.</ScreenSub>
        {result && <ResultsList result={result} unit="pts" unitSingular="pt" showSwatch />}
        <ButtonRow>
          <Button onClick={handleRestartTheme}>Play Again</Button>
          <Button variant="secondary" onClick={handleNewGame}>New Game</Button>
        </ButtonRow>
      </Screen>

      <Screen active={phase === "tiebreak"}>
        <BigIcon>⚔️</BigIcon>
        <ScreenTitle>It's a Tie!</ScreenTitle>
        <TieBreakerScreen tied={pendingTied} onResolved={handleTiebreakResolved} />
      </Screen>

      <Screen active={phase === "themeComplete"}>
        <BigIcon>🎉</BigIcon>
        <ScreenTitle>Theme Complete!</ScreenTitle>
        <ScreenSub>
          You've completed all {pool.length} song{pool.length === 1 ? "" : "s"} in this theme!
        </ScreenSub>
        <div className={styles.themeStats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>{artistTheme ? "Artist" : "Theme"}</span>
            <span className={styles.statValue}>{themeLabel}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Songs Completed</span>
            <span className={styles.statValue}>{songsPlayed} / {pool.length}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Maximum Possible</span>
            <span className={styles.statValue}>{maxScore} pts</span>
          </div>
        </div>
        {result && <ResultsList result={result} unit="pts" unitSingular="pt" showSwatch />}
        <ButtonRow>
          <Button onClick={handleRestartTheme}>Restart Theme</Button>
          <Button variant="secondary" onClick={handleNewGame}>New Theme</Button>
        </ButtonRow>
      </Screen>
    </GameShell>
  );
}
