import { useCallback, useEffect, useRef, useState } from "react";
import { Button, ButtonRow } from "./Button";
import { GameTimer } from "./GameTimer";
import { useGameTimer } from "../hooks/useGameTimer";
import { usePersistedUsedIndices } from "../hooks/usePersistedUsedIndices";
import {
  TIEBREAKER_CHALLENGES,
  TIEBREAKER_TRIVIA,
  TIEBREAKER_ESTIMATES,
  TIEBREAKER_CATEGORIES,
  TIEBREAKER_PHYSICAL
} from "../tiebreakerData";
import ingameStyles from "./ingame.module.css";
import styles from "./TieBreakerScreen.module.css";

// NOTE on identity: entrant objects passed in as `tied` are never cloned or
// mutated anywhere in this file (the original mutated them with a
// `__tbId` field to track identity across renders — unsafe with React
// state, and flagged as a hazard during migration). We keep the exact same
// object references throughout a session so the caller can match the
// resolved winner back against its own `ranked` array with `===`, same as
// the original relied on.

function closestEntrants(tied, guesses, real) {
  const diffs = tied.map((e, i) => Math.abs(guesses[i] - real));
  const validDiffs = diffs.filter((d) => !Number.isNaN(d));
  if (validDiffs.length === 0) return tied.slice(); // nobody entered a guess — try again
  const bestDiff = Math.min(...validDiffs);
  return tied.filter((e, i) => diffs[i] === bestDiff);
}

function WinnerButtons({ entrants, onPick }) {
  return (
    <div className={styles.buttons}>
      {entrants.map((e, i) => (
        <button key={i} type="button" className={ingameStyles.awardBtn} onClick={() => onPick(e)}>
          {e.name}
        </button>
      ))}
    </div>
  );
}

function TriviaChallenge({ tied, withTimer, contentBank, onDone }) {
  const [item] = useState(() => contentBank.pickUnused("trivia", TIEBREAKER_TRIVIA).item);
  const [revealed, setRevealed] = useState(false);
  const timer = useGameTimer({ onExpire: () => {} });
  const started = useRef(false);

  useEffect(() => {
    if (withTimer && !started.current) {
      started.current = true;
      timer.start(10);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withTimer]);

  return (
    <div>
      <p className={styles.question}>{item.q}</p>
      {withTimer && <GameTimer timer={timer} showControls={false} />}
      {!revealed ? (
        <Button variant="secondary" onClick={() => setRevealed(true)}>
          Show Answer
        </Button>
      ) : (
        <>
          <p className={styles.result}>
            Answer: <strong>{item.a}</strong>
          </p>
          <WinnerButtons entrants={tied} onPick={(e) => onDone({ winner: e })} />
        </>
      )}
    </div>
  );
}

function EstimateChallenge({ tied, guessNumber, contentBank, onDone }) {
  const [{ real, qText }] = useState(() => {
    if (guessNumber) {
      return { real: 1 + Math.floor(Math.random() * 100), qText: "Everyone tied, enter your guess (1–100):" };
    }
    const { item } = contentBank.pickUnused("estimate", TIEBREAKER_ESTIMATES);
    return { real: item.a, qText: item.q };
  });
  const [guesses, setGuesses] = useState(() => tied.map(() => ""));
  const [phase, setPhase] = useState("guessing"); // 'guessing' | 'revealed'
  const [winners, setWinners] = useState([]);

  const reveal = useCallback(() => {
    const numeric = guesses.map((v) => (v.trim() === "" ? NaN : Number(v)));
    const won = closestEntrants(tied, numeric, real);
    setWinners(won);
    setPhase("revealed");
    setTimeout(() => {
      if (won.length === 1) onDone({ winner: won[0] });
      else onDone({ stillTied: won });
    }, 1600);
  }, [guesses, tied, real, onDone]);

  if (phase === "revealed") {
    return (
      <p className={styles.result}>
        The answer was <strong>{real}</strong>.{" "}
        {winners.length === 1 ? (
          <>
            <strong>{winners[0].name}</strong> was closest!
          </>
        ) : (
          <>Still tied: {winners.map((w) => w.name).join(", ")}.</>
        )}
      </p>
    );
  }

  return (
    <div>
      <p className={styles.question}>{qText}</p>
      <div className={styles.guessRows}>
        {tied.map((e, i) => (
          <div className={styles.guessRow} key={i}>
            <span>{e.name}</span>
            <input
              type="number"
              className={styles.guessInput}
              value={guesses[i]}
              onChange={(ev) =>
                setGuesses((prev) => {
                  const next = prev.slice();
                  next[i] = ev.target.value;
                  return next;
                })
              }
            />
          </div>
        ))}
      </div>
      <Button onClick={reveal}>Reveal &amp; Score</Button>
    </div>
  );
}

function ShowdownChallenge({ tied, contentBank, onDone }) {
  const [category] = useState(() => contentBank.pickUnused("category", TIEBREAKER_CATEGORIES).item);
  const [alive, setAlive] = useState(tied);
  const [pos, setPos] = useState(0);

  const namedOne = () => setPos((p) => (p + 1) % alive.length);
  const stuck = () => {
    const next = alive.filter((_, i) => i !== pos);
    if (next.length === 1) {
      onDone({ winner: next[0] });
      return;
    }
    setAlive(next);
    setPos((p) => p % next.length);
  };

  return (
    <div>
      <p className={styles.question}>
        Category: <strong>{category}</strong>
      </p>
      <p className={styles.result}>{alive[pos].name}'s turn</p>
      <div className={styles.buttons}>
        <button type="button" className={ingameStyles.awardBtn} onClick={namedOne}>
          ✅ Named one
        </button>
        <button type="button" className={ingameStyles.awardBtn} onClick={stuck}>
          ❌ Stuck / Repeated
        </button>
      </div>
    </div>
  );
}

function PhysicalChallenge({ tied, contentBank, onDone }) {
  const [item] = useState(() => contentBank.pickUnused("physical", TIEBREAKER_PHYSICAL).item);
  return (
    <div>
      <p className={styles.question}>{item}</p>
      <WinnerButtons entrants={tied} onPick={(e) => onDone({ winner: e })} />
    </div>
  );
}

function ChallengeBody({ challenge, tied, contentBank, onDone }) {
  switch (challenge.type) {
    case "trivia":
      return <TriviaChallenge tied={tied} withTimer={false} contentBank={contentBank} onDone={onDone} />;
    case "fastest":
      return <TriviaChallenge tied={tied} withTimer contentBank={contentBank} onDone={onDone} />;
    case "estimate":
      return <EstimateChallenge tied={tied} guessNumber={false} contentBank={contentBank} onDone={onDone} />;
    case "guess-number":
      return <EstimateChallenge tied={tied} guessNumber contentBank={contentBank} onDone={onDone} />;
    case "showdown":
      return <ShowdownChallenge tied={tied} contentBank={contentBank} onDone={onDone} />;
    case "physical":
      return <PhysicalChallenge tied={tied} contentBank={contentBank} onDone={onDone} />;
    default:
      return null;
  }
}

// The full tie-breaker flow: pick a random challenge type, let the group
// play it or accept a shared win, and recurse into a fresh round (new
// challenge, same still-tied group) if a round ends without a single
// winner. Mirrors resolveSession()'s tiebreak path exactly.
//
// Usage: when a game's session ends, compute `{ ranked, tied }` with
// utils/resolveStanding.js. If tied.length > 1, render this component; its
// onResolved(winner, shared, tiebreak) gives you everything needed to build
// the same { ranked, winner, shared, tiebreak } shape the original passed
// to onResolved — just merge in the `ranked` you already have.
export function TieBreakerScreen({ tied, onResolved }) {
  const challengeBank = usePersistedUsedIndices("tiebreak-challenges");
  const contentBank = usePersistedUsedIndices("tiebreak-content");
  const sessionKeyRef = useRef(`s${Date.now()}-${Math.floor(Math.random() * 1e6)}`);

  const [roundTied, setRoundTied] = useState(tied);
  const [rounds, setRounds] = useState(0);
  const [challenge, setChallenge] = useState(
    () => challengeBank.pickUnused(sessionKeyRef.current, TIEBREAKER_CHALLENGES).item
  );
  const [playing, setPlaying] = useState(false);

  const handleDone = useCallback(
    (result) => {
      if (result.winner) {
        onResolved(result.winner, false, { type: challenge.type, rounds: rounds + 1 });
      } else {
        setRoundTied(result.stillTied);
        setRounds((r) => r + 1);
        setChallenge(challengeBank.pickUnused(sessionKeyRef.current, TIEBREAKER_CHALLENGES).item);
        setPlaying(false);
      }
    },
    [challenge, rounds, onResolved, challengeBank]
  );

  const handleShare = () => {
    onResolved(null, true, { type: challenge.type, rounds: rounds + 1 });
  };

  return (
    <div className={styles.panel}>
      <span className={styles.icon} aria-hidden="true">
        {challenge.icon}
      </span>
      <h2 className={styles.title}>{challenge.name}</h2>
      <p className={styles.tied}>
        Tied:{" "}
        {roundTied.map((t, i) => (
          <span key={i}>
            <strong>{t.name}</strong>
            {i < roundTied.length - 1 ? ", " : ""}
          </span>
        ))}
      </p>
      <p className={styles.instructions}>{challenge.instructions}</p>
      {!playing ? (
        <ButtonRow>
          <Button onClick={() => setPlaying(true)}>⚔️ Play Tie-Breaker</Button>
          <Button variant="secondary" onClick={handleShare}>
            🤝 Accept a Shared Win
          </Button>
        </ButtonRow>
      ) : (
        <div className={styles.body}>
          <ChallengeBody challenge={challenge} tied={roundTied} contentBank={contentBank} onDone={handleDone} />
        </div>
      )}
    </div>
  );
}
