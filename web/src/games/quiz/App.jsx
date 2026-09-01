import { Fragment, useEffect, useRef, useState } from "react";
import {
  Tv,
  Target,
  Check,
  X,
  Ticket,
  Zap,
  TimerOff,
  Siren,
  SkipForward,
  Star,
  Sparkles,
  Flag,
  Swords,
  Plus,
  Minus,
  ArrowRight,
  Bot,
  Mic,
  HandCoins,
  Dices,
  Clover,
} from "lucide-react";
import { GameShell } from "../../shared/components/GameShell";
import { Screen, ScreenTitle, ScreenSub, BigIcon, SetupBlock } from "../../shared/components/Screen";
import { HowToPlay } from "../../shared/components/HowToPlay";
import { Button, ButtonRow, ToggleCheck } from "../../shared/components/Button";
import { GroupedPicker } from "../../shared/components/GroupedPicker";
import { TeamSetup } from "../../shared/components/TeamSetup";
import { Stepper } from "../../shared/components/Stepper";
import { TimerSetup } from "../../shared/components/TimerSetup";
import { GameTimer } from "../../shared/components/GameTimer";
import { AnswerBlock } from "../../shared/components/RevealCard";
import { ResultsList } from "../../shared/components/ResultsList";
import { TieBreakerScreen } from "../../shared/components/TieBreakerScreen";
import { useTimerSetup } from "../../shared/hooks/useTimerSetup";
import { useGameTimer } from "../../shared/hooks/useGameTimer";
import { usePersistedUsedIndices } from "../../shared/hooks/usePersistedUsedIndices";
import { shuffle, groupKeys } from "../../shared/utils/random";
import { resolveStanding } from "../../shared/utils/resolveStanding";
import { playSound } from "../../shared/audio/sounds";
import { useHostSession } from "../../shared/controller/useHostSession";
import { indexOfTeamId } from "../../shared/controller/teamRef";
import { VIEW, view, buzzResult } from "../../shared/controller/protocol";
import { QRPairing } from "../../shared/components/QRPairing";
import rosterStyles from "../../shared/components/roster.module.css";
import ingameStyles from "../../shared/components/ingame.module.css";
import { QUIZ_THEMES, QUIZ_THEME_GROUPS, QUIZ_BONUS_EVENTS } from "./data";
import styles from "./quiz.module.css";

const TEAM_COLORS = ["#ffcb3c", "#31e0c9", "#ff6b81", "#9b8bff", "#7dd956", "#ff9f4a"];
const MAX_TEAMS = 6;
const POINT_VALUES = [100, 200, 300, 400, 500];
const ANSWER_TIMER_RECOMMENDED = 30;
const MIN_BONUS = 1;
const MAX_BONUS = 4;
const STEAL_SECONDS = 10;

const THEME_ITEMS_BY_GROUP = Object.fromEntries(
  Object.entries(groupKeys(Object.keys(QUIZ_THEMES), QUIZ_THEME_GROUPS)).map(([groupName, names]) => [
    groupName,
    names.map((name) => ({
      key: name,
      name,
      icon: QUIZ_THEMES[name].icon,
      meta: QUIZ_THEMES[name].categories.map((c) => c.name).join(" · ")
    }))
  ])
);

// One inline icon style for all of Quiz Night — same lucide set, size, and
// stroke weight everywhere, tuned to sit on a line of bold UI text. Icons
// are decorative here (the adjacent label carries the meaning), so they're
// aria-hidden; icon-only controls get their own aria-label at the call site.
function Ico({ icon: Glyph, size = 15 }) {
  return (
    <Glyph
      size={size}
      strokeWidth={2.5}
      aria-hidden="true"
      style={{ verticalAlign: "-0.15em", flexShrink: 0 }}
    />
  );
}

const MODE_ITEMS = [
  {
    key: "automated",
    name: "Automated",
    icon: <Bot size={20} strokeWidth={2} aria-hidden="true" />,
    meta: "Turn order runs automatically, with a customizable answer timer (30s recommended) — everyone just plays."
  },
  {
    key: "gamemaster",
    name: "Game Master",
    icon: <Mic size={20} strokeWidth={2} aria-hidden="true" />,
    meta: "One person controls the pace manually — timer off by default, reveal answers whenever ready."
  }
];

// Outcome banner shown once a question resolves. `stolen` has no text here —
// it's built with the stealing team's name at the call site.
const OUTCOME_META = {
  correct: { icon: Check, text: "Correct!" },
  freepass: { icon: Ticket, text: "Free Pass!" },
  incorrect: { icon: X, text: "Incorrect." },
  timeout: { icon: TimerOff, text: "Time's up — no steal." },
  stolen: { icon: Zap, text: null }
};
const OUTCOME_CLASSES = {
  correct: styles.qOutcomeCorrect,
  freepass: styles.qOutcomeCorrect,
  incorrect: styles.qOutcomeIncorrect,
  timeout: styles.qOutcomeTimeout,
  stolen: styles.qOutcomeStolen
};

// Bonus-event glyphs, keyed by the event's `type` (kept out of data.js so
// that file stays pure content).
const BONUS_ICONS = {
  points: Star,
  double: Sparkles,
  steal: HandCoins,
  risk: Dices,
  freepass: Ticket,
  lucky: Clover
};

function BonusGlyph({ type, size = 40 }) {
  const Glyph = BONUS_ICONS[type];
  return Glyph ? <Glyph size={size} strokeWidth={1.75} aria-hidden="true" /> : null;
}

function QuizScoreboard({ teams, onAdjust }) {
  return (
    <div className={rosterStyles.scoreboard}>
      {teams.map((team, i) => (
        <div className={rosterStyles.scoreChip} key={i}>
          <span className={rosterStyles.scoreSwatch} style={{ background: team.color }} />
          <span className={rosterStyles.scoreName}>{team.name}</span>
          {team.perks.double && (
            <span className={styles.perkBadge} role="img" aria-label="Double Points active" title="Double Points active">
              <Ico icon={Sparkles} size={13} />
            </span>
          )}
          {team.perks.freePass && (
            <span className={styles.perkBadge} role="img" aria-label="Free Pass banked" title="Free Pass banked">
              <Ico icon={Ticket} size={13} />
            </span>
          )}
          <span className={rosterStyles.scoreValue}>{team.score}</span>
          <span className={rosterStyles.scoreBtns}>
            <button type="button" className={rosterStyles.scoreBtn} aria-label={`Add 10 points to ${team.name}`} onClick={() => onAdjust(i, 10)}>
              <Plus size={11} strokeWidth={2.5} aria-hidden="true" />
            </button>
            <button type="button" className={rosterStyles.scoreBtn} aria-label={`Subtract 10 points from ${team.name}`} onClick={() => onAdjust(i, -10)}>
              <Minus size={11} strokeWidth={2.5} aria-hidden="true" />
            </button>
          </span>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [phase, setPhase] = useState("setup");
  const [theme, setTheme] = useState(null);
  const [mode, setMode] = useState("automated");

  const [teams, setTeams] = useState([]);
  const teamsInitialized = useRef(false);

  function addTeam(name) {
    setTeams((prev) => {
      if (prev.length >= MAX_TEAMS) return prev;
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: name || `Team ${prev.length + 1}`,
          score: 0,
          color: TEAM_COLORS[prev.length % TEAM_COLORS.length],
          perks: { double: false, freePass: false }
        }
      ];
    });
  }
  function removeTeam(i) {
    setTeams((prev) => (prev.length <= 1 ? prev : prev.filter((_, idx) => idx !== i)));
  }
  function renameTeam(i, name) {
    setTeams((prev) => prev.map((t, idx) => (idx === i ? { ...t, name: name.trim() || `Team ${idx + 1}` } : t)));
  }
  function adjustScore(i, delta) {
    setTeams((prev) => prev.map((t, idx) => (idx === i ? { ...t, score: t.score + delta } : t)));
  }
  function updateTeamScore(team, delta) {
    setTeams((prev) => prev.map((t) => (t === team ? { ...t, score: t.score + delta } : t)));
  }
  function setTeamPerk(team, key, value) {
    setTeams((prev) => prev.map((t) => (t === team ? { ...t, perks: { ...t.perks, [key]: value } } : t)));
  }

  useEffect(() => {
    if (teamsInitialized.current) return;
    teamsInitialized.current = true;
    addTeam("Team 1");
    addTeam("Team 2");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const timerSetup = useTimerSetup({ recommended: ANSWER_TIMER_RECOMMENDED, defaultEnabled: true });
  const [bonusEnabled, setBonusEnabled] = useState(true);
  const [bonusCount, setBonusCount] = useState(2);

  const [answered, setAnswered] = useState(() => new Set());
  const [turnIndex, setTurnIndex] = useState(0);
  const [bonusTiles, setBonusTiles] = useState(() => new Set());

  const questionBank = usePersistedUsedIndices("quiz-questions");

  // ---------- Overlay / question state ----------
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [isBonus, setIsBonus] = useState(false);
  const [currentCatIndex, setCurrentCatIndex] = useState(null);
  const [currentPoints, setCurrentPoints] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [activeTeamIndex, setActiveTeamIndex] = useState(0);
  const [questionPhase, setQuestionPhase] = useState("answering"); // 'answering' | 'steal' | 'resolved'
  const [timedOutIndex, setTimedOutIndex] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const [outcomeTeam, setOutcomeTeam] = useState(null);
  const [missedTeams, setMissedTeams] = useState(() => new Set());

  const [bonusEvent, setBonusEvent] = useState(null);
  const [bonusPickingTeam, setBonusPickingTeam] = useState(null);
  const [bonusMessage, setBonusMessage] = useState(null);
  const [bonusInteractiveType, setBonusInteractiveType] = useState(null); // 'steal' | 'risk' | null
  const [bonusResolved, setBonusResolved] = useState(false);

  const [pendingTied, setPendingTied] = useState([]);
  const [pendingRanked, setPendingRanked] = useState([]);
  const [result, setResult] = useState(null);

  const questionTimer = useGameTimer({ onExpire: () => beginSteal() });
  const stealTimer = useGameTimer({ onExpire: () => endStealWindow() });

  // ---------- Phone controller: buzz-to-steal ----------
  const session = useHostSession(teams);
  const { onMessage, sendTo, players: sessionPlayers } = session;
  const [buzzedTeam, setBuzzedTeam] = useState(null);
  const [buzzedPlayerId, setBuzzedPlayerId] = useState(null);
  const buzzLockRef = useRef(false);

  // onMessage's underlying subscription is stable regardless of how often
  // this component re-renders (see useHostSession.js), so the listener
  // itself is registered once and reads fresh state through this ref
  // instead of resubscribing on every state change.
  const buzzStateRef = useRef();
  buzzStateRef.current = { questionPhase, teams, timedOutIndex, activeTeamIndex, missedTeams, buzzedTeam, sessionPlayers };

  useEffect(() => {
    return onMessage((msg) => {
      if (msg.type !== "buzz") return;
      const { questionPhase, teams, timedOutIndex, activeTeamIndex, missedTeams, buzzedTeam, sessionPlayers } =
        buzzStateRef.current;
      if (questionPhase !== "steal" || buzzedTeam || buzzLockRef.current) return;
      const player = sessionPlayers.find((p) => p.playerId === msg.playerId);
      if (!player) return;
      const idx = indexOfTeamId(teams, player.teamId);
      if (idx === -1) return;
      const timedOut = timedOutIndex != null ? timedOutIndex : activeTeamIndex;
      if (idx === timedOut) return;
      const team = teams[idx];
      if (missedTeams.has(team)) return;
      buzzLockRef.current = true;
      // Winning the buzz race isn't the same as answering correctly — the
      // phone only learns "You're up!" here. The real buzzResult (right /
      // wrong) is sent from resolvePhoneSteal once the host actually judges
      // the spoken answer.
      setBuzzedTeam(team);
      setBuzzedPlayerId(msg.playerId);
    });
  }, [onMessage, sendTo]);

  // Keeps every connected phone's screen in sync with who's eligible to buzz.
  // Skipped entirely during setup so a phone that joins early keeps showing
  // its natural lobby view instead of a premature "watch the main screen" —
  // there's nothing to watch yet.
  useEffect(() => {
    if (sessionPlayers.length === 0 || phase === "setup") return;
    if (phase === "board" && questionPhase === "steal") {
      if (buzzedTeam) {
        sessionPlayers.forEach((p) => {
          if (!p.connected) return;
          sendTo(
            p.playerId,
            p.playerId === buzzedPlayerId
              ? view({ view: VIEW.LOCKED, title: "You're up!", subtitle: "Answer out loud." })
              : view({ view: VIEW.LOCKED, title: "Standby", subtitle: `${buzzedTeam.name} is answering.` })
          );
        });
      } else {
        const timedOut = timedOutIndex != null ? timedOutIndex : activeTeamIndex;
        sessionPlayers.forEach((p) => {
          if (!p.connected) return;
          const idx = indexOfTeamId(teams, p.teamId);
          const eligible = idx !== -1 && idx !== timedOut && !missedTeams.has(teams[idx]);
          sendTo(
            p.playerId,
            view(
              eligible
                ? { view: VIEW.BUZZ, title: "Steal it!", button: { label: "BUZZ" } }
                : { view: VIEW.LOCKED, title: "Not eligible", subtitle: "Watch the main screen." }
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
            title: "Quiz Night",
            subtitle: phase === "board" ? "Watch the main screen." : "Thanks for playing!"
          })
        );
      });
    }
  }, [phase, questionPhase, buzzedTeam, buzzedPlayerId, timedOutIndex, activeTeamIndex, missedTeams, teams, sessionPlayers, sendTo]);

  function resolvePhoneSteal(won) {
    if (!buzzedTeam) return;
    if (buzzedPlayerId) sendTo(buzzedPlayerId, buzzResult(won));
    if (won) resolveQuestion("stolen", buzzedTeam);
    else handleMiss(buzzedTeam);
    setBuzzedTeam(null);
    setBuzzedPlayerId(null);
    buzzLockRef.current = false;
  }

  function totalTileCount() {
    const themeObj = QUIZ_THEMES[theme];
    return themeObj.categories.length * POINT_VALUES.length;
  }

  function generateBonusTiles() {
    if (!bonusEnabled) {
      setBonusTiles(new Set());
      return;
    }
    const themeObj = QUIZ_THEMES[theme];
    const allKeys = [];
    themeObj.categories.forEach((cat, catIndex) => {
      POINT_VALUES.forEach((points) => allKeys.push(`${catIndex}-${points}`));
    });
    const count = Math.min(bonusCount, allKeys.length);
    setBonusTiles(new Set(shuffle(allKeys).slice(0, count)));
  }

  function handleStart() {
    setAnswered(new Set());
    setTurnIndex(0);
    generateBonusTiles();
    setPhase("board");
  }

  function startAnswerTimer() {
    questionTimer.stop();
    if (timerSetup.enabled) questionTimer.start(timerSetup.seconds);
  }

  function openQuestion(catIndex, points) {
    const key = `${catIndex}-${points}`;
    if (bonusTiles.has(key)) {
      openBonus(catIndex, points, key);
      return;
    }

    const themeObj = QUIZ_THEMES[theme];
    const category = themeObj.categories[catIndex];
    const pool = category.questions[points];
    const bankKey = `${theme}|${category.name}|${points}`;
    const question = questionBank.pickUnused(bankKey, pool).item;

    setAnswered((prev) => new Set(prev).add(key));
    setIsBonus(false);
    setCurrentCatIndex(catIndex);
    setCurrentPoints(points);
    setCurrentCategory(category);
    setCurrentQuestion(question);
    setActiveTeamIndex(turnIndex);
    setQuestionPhase("answering");
    setTimedOutIndex(null);
    setOutcome(null);
    setOutcomeTeam(null);
    setMissedTeams(new Set());
    setOverlayOpen(true);
    setBuzzedTeam(null);
    setBuzzedPlayerId(null);
    buzzLockRef.current = false;
    startAnswerTimer();
  }

  function beginSteal() {
    if (!overlayOpen || outcome || isBonus) return;
    questionTimer.stop();
    setQuestionPhase("steal");
    setTimedOutIndex(activeTeamIndex);
    const eligible = teams.filter((_, i) => i !== activeTeamIndex);
    if (eligible.length === 0) {
      resolveQuestion("timeout", null);
      return;
    }
    setMissedTeams(new Set());
    stealTimer.start(STEAL_SECONDS);
  }

  function endStealWindow() {
    if (!overlayOpen || outcome) return;
    resolveQuestion("timeout", null);
  }

  function handleMiss(team) {
    if (missedTeams.has(team)) return;
    const nextMissed = new Set(missedTeams).add(team);
    setMissedTeams(nextMissed);
    const timedOut = timedOutIndex != null ? timedOutIndex : activeTeamIndex;
    const eligible = teams.filter((_, i) => i !== timedOut);
    if (nextMissed.size >= eligible.length) {
      resolveQuestion("timeout", null);
    }
  }

  function resolveQuestion(outcomeType, team) {
    if (!overlayOpen || outcome) return;
    questionTimer.stop();
    stealTimer.stop();

    // Event feedback — timeout already got its buzzer from the steal timer.
    if (outcomeType === "correct" || outcomeType === "freepass") playSound("correct");
    else if (outcomeType === "stolen") playSound("steal");
    else if (outcomeType === "incorrect") playSound("incorrect");

    let nextIndex = turnIndex;
    if (outcomeType === "correct" || outcomeType === "freepass") {
      const pts = outcomeType !== "freepass" && team.perks.double ? currentPoints * 2 : currentPoints;
      setTeams((prev) =>
        prev.map((t) => {
          if (t !== team) return t;
          const next = { ...t, score: t.score + pts };
          if (outcomeType !== "freepass" && t.perks.double) next.perks = { ...t.perks, double: false };
          if (outcomeType === "freepass") next.perks = { ...next.perks, freePass: false };
          return next;
        })
      );
      nextIndex = activeTeamIndex;
    } else if (outcomeType === "stolen") {
      const pts = team.perks.double ? currentPoints * 2 : currentPoints;
      setTeams((prev) =>
        prev.map((t) =>
          t === team ? { ...t, score: t.score + pts, perks: t.perks.double ? { ...t.perks, double: false } : t.perks } : t
        )
      );
      const timedOut = timedOutIndex != null ? timedOutIndex : activeTeamIndex;
      nextIndex = (timedOut + 1) % teams.length;
    } else if (outcomeType === "incorrect") {
      nextIndex = (activeTeamIndex + 1) % teams.length;
    } else if (outcomeType === "timeout") {
      const timedOut = timedOutIndex != null ? timedOutIndex : activeTeamIndex;
      nextIndex = (timedOut + 1) % teams.length;
    }
    setTurnIndex(nextIndex);
    setOutcome(outcomeType);
    setOutcomeTeam(team);
    setQuestionPhase("resolved");
    setBuzzedTeam(null);
    setBuzzedPlayerId(null);
    buzzLockRef.current = false;
  }

  // ---------- Bonus events ----------
  function openBonus(catIndex, points, key) {
    const category = QUIZ_THEMES[theme].categories[catIndex];
    setAnswered((prev) => new Set(prev).add(key));
    setIsBonus(true);
    setCurrentCatIndex(catIndex);
    setCurrentPoints(points);
    setCurrentCategory(category);
    setBonusMessage(null);
    setBonusInteractiveType(null);
    setBonusResolved(false);
    setOverlayOpen(true);
    playSound("bonus");

    const pickingTeam = teams[turnIndex];
    setBonusPickingTeam(pickingTeam);
    const pool = teams.length >= 2 ? QUIZ_BONUS_EVENTS : QUIZ_BONUS_EVENTS.filter((e) => !e.requiresOpponent);
    const event = pool[Math.floor(Math.random() * pool.length)];
    setBonusEvent(event);
    resolveBonusEvent(event, pickingTeam);
  }

  function finishBonus() {
    setBonusResolved(true);
  }

  function resolveBonusEvent(event, pickingTeam) {
    if (event.type === "points") {
      const amt = 50 * (1 + Math.floor(Math.random() * 6)); // 50..300, step 50
      updateTeamScore(pickingTeam, amt);
      setBonusMessage(`+${amt} points for ${pickingTeam.name}!`);
      finishBonus();
    } else if (event.type === "double") {
      setTeamPerk(pickingTeam, "double", true);
      setBonusMessage(`${pickingTeam.name}'s next correct answer is worth double!`);
      finishBonus();
    } else if (event.type === "freepass") {
      setTeamPerk(pickingTeam, "freePass", true);
      setBonusMessage(`${pickingTeam.name} banked a Free Pass!`);
      finishBonus();
    } else if (event.type === "lucky") {
      const draws = [
        { amt: 100, text: "Lucky! +100 points." },
        { amt: 50, text: "A little luck. +50 points." },
        { amt: -50, text: "Unlucky! -50 points." },
        { amt: 0, text: "Nothing happens. Break even." }
      ];
      const draw = draws[Math.floor(Math.random() * draws.length)];
      updateTeamScore(pickingTeam, draw.amt);
      setBonusMessage(draw.text);
      finishBonus();
    } else if (event.type === "steal") {
      setBonusInteractiveType("steal");
    } else if (event.type === "risk") {
      setBonusInteractiveType("risk");
    }
  }

  function handleBonusSteal(targetTeam) {
    const pickingTeam = bonusPickingTeam;
    const stealAmt = Math.min(150, Math.max(0, targetTeam.score));
    setTeams((prev) =>
      prev.map((t) => {
        if (t === targetTeam) return { ...t, score: t.score - stealAmt };
        if (t === pickingTeam) return { ...t, score: t.score + stealAmt };
        return t;
      })
    );
    setBonusMessage(`${pickingTeam.name} stole ${stealAmt} points from ${targetTeam.name}!`);
    setBonusInteractiveType(null);
    finishBonus();
  }

  function handleBonusRisk(wager) {
    const pickingTeam = bonusPickingTeam;
    const win = Math.random() < 0.5;
    updateTeamScore(pickingTeam, win ? wager * 2 : -wager);
    setBonusMessage(
      win ? `🎉 Win! ${pickingTeam.name} gains ${wager * 2} points!` : `💥 Lost the risk. ${pickingTeam.name} loses ${wager} points.`
    );
    setBonusInteractiveType(null);
    finishBonus();
  }

  function closeOverlay() {
    questionTimer.stop();
    stealTimer.stop();
    setOverlayOpen(false);
  }

  function afterQuestionClosed() {
    if (answered.size >= totalTileCount()) {
      showResults();
    }
  }

  function handleBackBoard() {
    const wasBonus = isBonus;
    closeOverlay();
    if (wasBonus) setTurnIndex((t) => (teams.length > 1 ? (t + 1) % teams.length : t));
    afterQuestionClosed();
  }

  // ---------- Results ----------
  function showResults() {
    if (teams.length <= 1) {
      setResult({ ranked: teams.slice(), winner: null, shared: false, tiebreak: null });
      setPhase("results");
      return;
    }
    const { ranked, tied, winner } = resolveStanding(teams);
    if (tied.length <= 1) {
      setResult({ ranked, winner, shared: false, tiebreak: null });
      setPhase("results");
    } else {
      setPendingRanked(ranked);
      setPendingTied(tied);
      setPhase("tiebreak");
    }
  }

  function handleTiebreakResolved(winner, shared, tiebreak) {
    setResult({ ranked: pendingRanked, winner, shared, tiebreak });
    setPhase("results");
  }

  function resetBoard() {
    setAnswered(new Set());
    setTurnIndex(0);
    setTeams((prev) => prev.map((t) => ({ ...t, score: 0, perks: { double: false, freePass: false } })));
    generateBonusTiles();
    setPhase("board");
  }

  function goToNewQuiz() {
    setTheme(null);
    setTeams([]);
    setAnswered(new Set());
    setTurnIndex(0);
    setBonusTiles(new Set());
    addTeam("Team 1");
    addTeam("Team 2");
    setPhase("setup");
  }

  const themeObj = theme ? QUIZ_THEMES[theme] : null;
  const currentTurnTeam = teams[turnIndex];
  const activeTeam = teams[activeTeamIndex];
  const eligibleSteal = teams.filter((_, i) => i !== (timedOutIndex != null ? timedOutIndex : activeTeamIndex));
  const nextTeam = teams[turnIndex];

  return (
    <>
      <div className={styles.shimmer} />
      <GameShell title="QUIZ NIGHT" titleIcon={Tv}>
        <Screen active={phase === "setup"}>
          <ScreenTitle>Build the Board</ScreenTitle>
          <ScreenSub>
            Pick a theme and set up your teams to get started. No dedicated host needed — everyone plays from the
            same screen.
          </ScreenSub>

          <HowToPlay
            steps={[
              <>Pick a theme and add your teams below, then tap <strong>Start Quiz</strong>.</>,
              "Whoever's turn it is calls out a category and point value shown in the turn banner, and taps that tile.",
              <>Read the question out loud, then mark it <strong><Ico icon={Check} /> Correct</strong> or <strong><Ico icon={X} /> Incorrect</strong>. A correct answer keeps the turn — an incorrect one passes it to the next team.</>,
              <>If the timer runs out before anyone answers, a <strong>10-second steal</strong> opens for everyone else — first to answer right steals the points and the turn.</>,
              <>Watch for <strong><Ico icon={Star} /> BONUS</strong> tiles — they trigger a surprise event instead of a question.</>,
              "When the board is empty, the final results appear on their own."
            ]}
          />

          <SetupBlock label="1. Choose a theme" wide>
            <GroupedPicker groups={THEME_ITEMS_BY_GROUP} value={theme} onChange={setTheme} />
          </SetupBlock>

          <SetupBlock label="2. Add teams">
            <TeamSetup teams={teams} maxTeams={MAX_TEAMS} onAdd={() => addTeam()} onRemove={removeTeam} onRename={renameTeam} />
          </SetupBlock>

          <SetupBlock label="3. Play style">
            <GroupedPicker
              groups={{ "Pick one": MODE_ITEMS }}
              value={mode}
              onChange={(id) => {
                setMode(id);
                timerSetup.setEnabled(id === "automated");
              }}
            />
          </SetupBlock>

          <SetupBlock label="4. Timer">
            <TimerSetup
              unitLabel="per question"
              recommended={ANSWER_TIMER_RECOMMENDED}
              presets={[15, 20, 30, 45]}
              enabled={timerSetup.enabled}
              onEnabledChange={timerSetup.setEnabled}
              seconds={timerSetup.seconds}
              onSecondsChange={timerSetup.setSeconds}
            />
          </SetupBlock>

          <SetupBlock label="5. Bonus Slots">
            <div className={styles.bonusSetup}>
              <ToggleCheck
                label={<><Ico icon={Star} /> Add bonus slots to the board</>}
                checked={bonusEnabled}
                onChange={setBonusEnabled}
              />
              {bonusEnabled && (
                <div className={styles.bonusCountRow}>
                  <span>How many?</span>
                  <Stepper value={bonusCount} min={MIN_BONUS} max={MAX_BONUS} onChange={setBonusCount} />
                </div>
              )}
            </div>
          </SetupBlock>

          <SetupBlock label="6. Phone controllers">
            <QRPairing session={session} teams={teams} />
          </SetupBlock>

          <Button disabled={!theme || teams.length < 1} onClick={handleStart}>
            Start Quiz <Ico icon={ArrowRight} />
          </Button>
        </Screen>

        <Screen active={phase === "board"}>
          <QuizScoreboard teams={teams} onAdjust={adjustScore} />
          {currentTurnTeam && (
            <p className={ingameStyles.turnBanner}>
              <Ico icon={Target} size={16} />{" "}
              <span style={{ color: currentTurnTeam.color }}>{currentTurnTeam.name}</span>'s turn to pick a
              category!
            </p>
          )}
          {themeObj && themeObj.categories.length > 5 && (
            <p className={styles.scrollHint}>
              Scroll sideways to see all categories <Ico icon={ArrowRight} size={13} />
            </p>
          )}
          {themeObj && (
            <div className={styles.boardScroll}>
              <div className={styles.board} style={{ "--cols": themeObj.categories.length }}>
                {themeObj.categories.map((cat, i) => (
                  <div key={`h-${i}`} className={styles.catHeader}>{cat.name}</div>
                ))}
                {POINT_VALUES.flatMap((points) =>
                  themeObj.categories.map((cat, catIndex) => {
                    const key = `${catIndex}-${points}`;
                    const isBonusTile = bonusTiles.has(key);
                    const used = answered.has(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`${styles.tile} ${isBonusTile ? styles.tileBonus : ""} ${isBonusTile && used ? styles.tileUsed : ""}`.trim()}
                        disabled={used}
                        onClick={() => openQuestion(catIndex, points)}
                      >
                        {isBonusTile ? (
                          <>
                            <Star size={18} strokeWidth={2} aria-hidden="true" style={{ verticalAlign: "-0.15em" }} />
                            <span className={styles.tileSub}>{used ? "USED" : "BONUS"}</span>
                          </>
                        ) : (
                          points
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
          <div className={styles.boardActions}>
            <Button variant="secondary" onClick={resetBoard}>Reset Game</Button>
            <Button variant="secondary" onClick={goToNewQuiz}>New Quiz</Button>
          </div>
        </Screen>

        <Screen active={phase === "results"}>
          <BigIcon><Flag size={46} strokeWidth={1.75} aria-hidden="true" /></BigIcon>
          <ScreenTitle>Board Complete!</ScreenTitle>
          <ScreenSub>Here's how everyone finished.</ScreenSub>
          {result && <ResultsList result={result} unit="pts" unitSingular="pt" showSwatch />}
          <ButtonRow>
            <Button onClick={resetBoard}>Play Again</Button>
            <Button variant="secondary" onClick={goToNewQuiz}>New Quiz</Button>
          </ButtonRow>
        </Screen>

        <Screen active={phase === "tiebreak"}>
          <BigIcon><Swords size={46} strokeWidth={1.75} aria-hidden="true" /></BigIcon>
          <ScreenTitle>It's a Tie!</ScreenTitle>
          <TieBreakerScreen tied={pendingTied} onResolved={handleTiebreakResolved} />
        </Screen>
      </GameShell>

      {overlayOpen && (
        <div className={styles.overlay}>
          <div className={styles.questionCard}>
            {!isBonus && (
              <>
                <span className={styles.qMeta}>{currentCategory?.name} · {currentPoints} pts</span>
                {questionPhase !== "resolved" && activeTeam && (
                  <p className={styles.qTurn} style={{ color: activeTeam.color }}>
                    <Ico icon={Target} size={16} /> {activeTeam.name}'s turn
                  </p>
                )}
                {questionPhase === "answering" && timerSetup.enabled && <GameTimer timer={questionTimer} />}
                {questionPhase === "steal" && (
                  <div className={styles.stealZone}>
                    <p className={styles.stealHeading}>
                      <Ico icon={Siren} size={15} /> STEAL NOW
                    </p>
                    <GameTimer timer={stealTimer} showControls={false} />
                  </div>
                )}
                <p className={styles.qText}>{currentQuestion?.q}</p>
                {questionPhase === "resolved" && <AnswerBlock label="Answer" text={currentQuestion?.a} />}

                {questionPhase === "answering" && activeTeam && (
                  <div className={styles.awardRow}>
                    <button
                      type="button"
                      className={`${styles.awardBtn} ${styles.awardBtnCorrect}`.trim()}
                      onClick={() => resolveQuestion("correct", activeTeam)}
                    >
                      <Ico icon={Check} /> Correct (+{activeTeam.perks.double ? currentPoints * 2 : currentPoints}
                      {activeTeam.perks.double ? ", 2x!" : ""})
                    </button>
                    <button
                      type="button"
                      className={`${styles.awardBtn} ${styles.awardBtnIncorrect}`.trim()}
                      onClick={() => resolveQuestion("incorrect", activeTeam)}
                    >
                      <Ico icon={X} /> Incorrect
                    </button>
                    {activeTeam.perks.freePass && (
                      <button
                        type="button"
                        className={`${styles.awardBtn} ${styles.awardBtnPerk}`.trim()}
                        onClick={() => resolveQuestion("freepass", activeTeam)}
                      >
                        <Ico icon={Ticket} /> Free Pass: award {currentPoints} to {activeTeam.name}
                      </button>
                    )}
                    <button type="button" className={styles.awardBtn} onClick={beginSteal}>
                      <Ico icon={SkipForward} /> No answer — open steal
                    </button>
                  </div>
                )}

                {questionPhase === "steal" && buzzedTeam && (
                  <div className={styles.awardRow}>
                    <p className={styles.qTurn} style={{ color: buzzedTeam.color }}>
                      <Ico icon={Siren} size={15} /> {buzzedTeam.name} buzzed in!
                    </p>
                    <button
                      type="button"
                      className={`${styles.awardBtn} ${styles.awardBtnCorrect}`.trim()}
                      onClick={() => resolvePhoneSteal(true)}
                    >
                      <Ico icon={Check} /> {buzzedTeam.name} got it! (+
                      {buzzedTeam.perks.double ? currentPoints * 2 : currentPoints})
                    </button>
                    <button
                      type="button"
                      className={`${styles.awardBtn} ${styles.awardBtnIncorrect}`.trim()}
                      onClick={() => resolvePhoneSteal(false)}
                    >
                      <Ico icon={X} /> {buzzedTeam.name} missed
                    </button>
                  </div>
                )}

                {questionPhase === "steal" && !buzzedTeam && (
                  <div className={styles.awardRow}>
                    {eligibleSteal.map((team, i) => {
                      const pts = team.perks.double ? currentPoints * 2 : currentPoints;
                      const isMissed = missedTeams.has(team);
                      return (
                        <Fragment key={i}>
                          <button
                            type="button"
                            className={`${styles.awardBtn} ${styles.awardBtnCorrect} ${isMissed ? styles.awardBtnMissed : ""}`.trim()}
                            onClick={() => resolveQuestion("stolen", team)}
                          >
                            <span className={styles.sw} style={{ background: team.color }} />
                            <Ico icon={Check} /> {team.name} got it! (+{pts})
                          </button>
                          <button
                            type="button"
                            className={`${styles.awardBtn} ${styles.awardBtnIncorrect} ${isMissed ? styles.awardBtnMissed : ""}`.trim()}
                            onClick={() => handleMiss(team)}
                          >
                            <Ico icon={X} /> {team.name} missed
                          </button>
                        </Fragment>
                      );
                    })}
                  </div>
                )}

                {questionPhase === "resolved" && (
                  <>
                    <p className={`${styles.qOutcome} ${OUTCOME_CLASSES[outcome] || ""}`.trim()}>
                      {outcome && OUTCOME_META[outcome] && <Ico icon={OUTCOME_META[outcome].icon} size={17} />}{" "}
                      {outcome === "stolen"
                        ? `Stolen by ${outcomeTeam ? outcomeTeam.name : ""}!`
                        : OUTCOME_META[outcome]?.text}
                    </p>
                    {nextTeam && (
                      <p className={styles.qNext} style={{ color: nextTeam.color }}>
                        Next up: {nextTeam.name}
                      </p>
                    )}
                    <div className={styles.backBoardBtn}>
                      <Button variant="secondary" onClick={handleBackBoard}>Back to Board</Button>
                    </div>
                  </>
                )}
              </>
            )}

            {isBonus && (
              <>
                <span className={styles.qMeta}>{currentCategory?.name} · {currentPoints} pts · BONUS</span>
                <div className={styles.bonusBody}>
                  <span className={styles.bonusIcon}>
                    <BonusGlyph type={bonusEvent?.type} />
                  </span>
                  <h3 className={styles.bonusTitle}>{bonusEvent?.name}</h3>
                  <p className={styles.bonusDesc}>{bonusEvent?.desc}</p>
                  <div className={styles.bonusInteractive}>
                    {bonusMessage && <p className={styles.bonusResult}>{bonusMessage}</p>}
                    {bonusInteractiveType === "steal" &&
                      teams
                        .filter((t) => t !== bonusPickingTeam)
                        .map((t, i) => (
                          <button key={i} type="button" className={styles.awardBtn} onClick={() => handleBonusSteal(t)}>
                            <span className={styles.sw} style={{ background: t.color }} />
                            <Ico icon={HandCoins} /> Steal from {t.name}
                          </button>
                        ))}
                    {bonusInteractiveType === "risk" &&
                      [100, 200, 300].map((wager) => (
                        <button key={wager} type="button" className={styles.awardBtn} onClick={() => handleBonusRisk(wager)}>
                          <Ico icon={Dices} /> Risk {wager}
                        </button>
                      ))}
                  </div>
                </div>
                {bonusResolved && (
                  <div className={styles.backBoardBtn}>
                    <Button variant="secondary" onClick={handleBackBoard}>Back to Board</Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
