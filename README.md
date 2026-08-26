# 🎮 B-Rotation Party Night

<p>
  <img alt="React + Vite" src="https://img.shields.io/badge/12%20games-React%20%2B%20Vite-61dafb">
  <img alt="No accounts" src="https://img.shields.io/badge/sign--up-not%20required-blue">
  <img alt="Host optional" src="https://img.shields.io/badge/host-optional-orange">
  <img alt="Games" src="https://img.shields.io/badge/games-12-purple">
  <img alt="Spy Word themes" src="https://img.shields.io/badge/spy%20word%20themes-57-e8324f">
  <img alt="Quiz Night themes" src="https://img.shields.io/badge/quiz%20night%20themes-27-ffcb3c">
  <img alt="Quiz Night questions" src="https://img.shields.io/badge/quiz%20night%20questions-1725-ffcb3c">
  <img alt="Customizable timers" src="https://img.shields.io/badge/timers-customizable-2fd67f">
</p>

A colorful, browser-based party game platform — **12 games**, one shared screen, **no dedicated host required**. Gather a group around a phone, tablet, or laptop and pick from social deduction, trivia, voting games, and classic party favorites. The app handles turns, customizable timers, randomization, hidden information, and results on its own.

> [!TIP]
> **▶️ Play now:** [markdaniel0702.github.io/PARTY-PILOT](https://markdaniel0702.github.io/PARTY-PILOT/) — free, no sign-up, works on any device. See [🌐 Deployment](#-deployment) below for hosting details.

> [!TIP]
> Never played a game here before? Every setup screen has a collapsible **"❓ How does this work?"** box with the full rules — nobody needs to read this README to play.

---

## ✨ Features

| | |
|---|---|
| 🙅 **No host required** | Every game runs itself — turn order, timers, hidden info, and results all happen automatically. |
| 🎙️ **Game Master optional** | Prefer a human running the show for the games where that helps? Several have a manual mode too. |
| 🎲 **12 games, 3 categories** | Word & Deduction, Trivia & Knowledge, and Party & Voting — something for every group. |
| 🎨 **Deep theme libraries** | 57 Spy Word themes, 17 Quiz Night themes, plus curated category sets for every other game. |
| ⏱️ **Universal customizable timers** | Every game shares one timer system — a recommended duration you can override with a preset or a custom value, Start/Pause/Resume/Reset controls, and a switch to turn it off entirely where a timer isn't required. |
| 🏁 **Automatic results** | Boards, votes, and scoreboards resolve themselves the moment a round finishes. |
| ⚔️ **Automatic tie-breaker** | A tied final score triggers a random tie-breaker challenge for just the tied entrants, looping until one winner remains — or accept a shared win instead. |
| 📱 **Fully responsive** | Works on a laptop, tablet, or phone passed around a table. |
| 🔒 **Private by design** | No accounts, no server. The only outbound calls are public, anonymous lookups — Google Fonts on first visit and Wikipedia photo lookups during Picture Guess — nothing personal ever leaves your browser. |

---

## 🎲 Available Games

| Game | Group | Players | Automated | GM Optional |
|---|---|---|:---:|:---:|
| 🕵️ [Spy Word](#-spy-word) | Word & Deduction | 3–10 | ✅ | — |
| 🤔 [Who Am I?](#-who-am-i) | Word & Deduction | 3–10 | ✅ | ✅ |
| 🔐 [Password](#-password) | Word & Deduction | 2–10 | ✅ | ✅ |
| 🧠 [Categories](#-categories) | Word & Deduction | 2–10 | ✅ | — |
| 🟩 [Word Grid](#-word-grid) | Word & Deduction | 2–10 | ✅ | — |
| ❓ [Quiz Night](#-quiz-night) | Trivia & Knowledge | 1–6 teams | ✅ | ✅ |
| 🎵 [Guess the Song](#-guess-the-song) | Trivia & Knowledge | Any group | ✅ | — |
| 🖼️ [Picture Guess](#️-picture-guess) | Trivia & Knowledge | Any group | ✅ | — |
| 2️⃣ [Two Truths and a Lie](#-two-truths-and-a-lie) | Party & Voting | 2–10 | ✅ | — |
| 🤷 [Would You Rather?](#-would-you-rather) | Party & Voting | 2–10 | ✅ | — |
| 👥 [Most Likely To](#-most-likely-to) | Party & Voting | 3–10 | ✅ | — |
| 🎭 [Charades](#-charades) | Party & Voting | 3–10 | ✅ | ✅ |

---

## 🕵️ Spy Word

A social deduction word game. Almost every player secretly receives the same **main word**. One randomly chosen player — the Spy — receives a different, related **spy word** instead. Everyone describes their word out loud without saying it, and the group tries to catch the Spy before the Spy figures out the real word.

- Pick one of **57 specific themes** (e.g. "Naruto Characters," not just "Anime"), set the player count, and optionally name your players.
- The app randomly picks a word pair and randomly assigns exactly one Spy.
- Each player gets a private "Pass the device to [Name]" screen, reveals their word, then hides it before passing on.
- An optional discussion timer (60s recommended, fully customizable) keeps the debate moving.
- Anyone taps **Reveal the Spy** when the group's ready to vote — no permanent host needed, since the "host" role is just whoever's holding the device.

---

## ❓ Quiz Night

A Jeopardy-style trivia board with **27 themes** and a 100–500 point system. Pick a theme, and a board appears with categories as columns and point values as rows.

- Pick a theme, add up to 6 teams, and choose **🤖 Automated** or **🎙️ Game Master** mode.
- A turn banner shows whose turn it is to pick — the app tracks it, nobody has to referee.
- Tiles lock the instant they're picked, so nothing gets answered twice by accident.
- The answer stays hidden until "Show Answer" — or the timer (30s recommended, customizable) runs out, in Automated mode.
- Any team taps their own **+points** button when they get it right.
- Once every tile is answered, a **🏁 results screen** appears automatically with final standings.
- Every category and point value draws from a **reserved pool of 3 questions**, not just one — see [❓ Randomized Question Pools](#-randomized-question-pools) below.
- Optionally, 1–4 tiles on the board are **⭐ Bonus Slots** instead of questions — see [⭐ Bonus Slots](#-bonus-slots) below.

---

## ⭐ Bonus Slots

Turn a plain trivia board into something a little more chaotic. At setup, switch on **Bonus Slots** and pick how many (1–4, default 2) — that many tiles on the board are swapped for a shimmering **⭐ BONUS** tile instead of a question, scattered randomly across categories and point values.

- Bonus tiles are chosen fresh every time you **Start Quiz** or **Reset Game** — the same board never has the same bonus tiles twice in a row.
- Tapping one skips the question entirely and triggers a random event for the picking team:

| Event | What happens |
|---|---|
| ⭐ **Bonus Points** | A random 50–300 points, awarded immediately. |
| ✌️ **Double Points** | The team's next correct answer is worth double — shown as a chip on their scoreboard until used. |
| 🥷 **Steal** | Take 150 points from a rival team (capped at what they actually have). |
| 🎲 **Risk It** | Wager 100, 200, or 300 points on a coin flip — win doubles it, lose forfeits the wager. |
| 🎟️ **Free Pass** | Banks a one-time pass — shown as a chip on the scoreboard — that can claim full credit for a question nobody answers correctly. |
| 🍀 **Lucky Draw** | A small random swing, from -50 to +100, decided by fate. |

Once triggered, a bonus tile locks and reads **⭐ USED**, just like an answered question tile — it still counts toward the board's completion. **Steal** and **Risk It** never appear in a 1-team game, since neither has anything meaningful to do solo. Turn Bonus Slots off at setup for a purely trivia-only board.

---

## ⚔️ Final Tie-Breaker

Every game with final scores — Quiz Night, Charades, Password, Word Grid, Two Truths and a Lie, Guess the Song, and Picture Guess — automatically checks for a tie the moment the game ends, before the results screen appears.

- **No tie? No interruption.** A single leader goes straight to the results screen, exactly as before.
- **Tied for first?** Only the tied entrants move on to a **⚔️ Tie-Breaker** screen — everyone else's final placement is already locked in.
- A challenge is drawn at random from six types and never immediately repeats:

| Challenge | How it resolves |
|---|---|
| ⚡ **Sudden Death Trivia** | A hard question is read aloud; reveal the answer, then tap who got it first. |
| 🎯 **Closest Guess** | A numeric estimation question with a known answer — each tied entrant enters a guess, closest wins. |
| ⏱️ **Fastest Answer** | A question plus a short countdown — tap whoever answered first. |
| 🔢 **Guess the Number** | A secret 1–100 number — each tied entrant guesses, closest wins. Fully self-resolving. |
| 🗂️ **Category Showdown** | A category is shown — entrants take turns naming something that fits; the group taps ✅/❌ each turn, and the last one standing wins. |
| 🎪 **Random Challenge** | A quick physical challenge (rock-paper-scissors, staring contest, thumb war) — tap the winner. |

- Still tied after a round? The field narrows to just the entrants still tied, and a **new** challenge starts automatically — it keeps looping until exactly one winner remains.
- Don't want to bother? **🤝 Accept a Shared Win** exits immediately with the tie left standing, and the results screen notes the tie was accepted rather than broken.
- A tie-breaker challenge never touches game scores — it only decides who gets the win highlighted in the final results.

---

## ❓ Randomized Question Pools

Every Quiz Night tile is backed by a small pool of interchangeable questions, not a single fixed one — so picking "Disney Channel · 100" a second time doesn't just replay the same question from last time.

- Each category/point-value slot reserves **3 questions** at the same difficulty and on the same subject, authored to be indistinguishable in style from one another.
- A tile's question is chosen **at random** from its slot's pool the moment it's revealed.
- The app **remembers which questions a slot has already shown**, in this browser, across reloads and separate game nights — so the same slot won't repeat a question until every question in its pool has been used at least once.
- Once a slot's pool is exhausted, it **reshuffles automatically** — and skips replaying the question that was *just* shown, so a fresh cycle never starts with an immediate repeat.
- This all happens per slot, independently — playing "Disney Channel · 100" repeatedly doesn't affect "Disney Channel · 200" or any other tile.

---

## 🤔 Who Am I?

Each player is secretly assigned a character — a celebrity, superhero, anime character, or historical figure — but here's the twist: it's held up for the **group** to see, not the player. Ask yes-or-no questions out loud to guess who you are.

- Categories: Celebrities, Fictional Characters, Superheroes, Anime Characters, Filipino Celebrities, Historical Figures.
- A "look away" screen makes sure the player doesn't peek before their identity is shown to everyone else.
- **🤖 Automated:** a timer per player (120s recommended, customizable). **🎙️ Turn it off** for untimed, casual rounds.
- Tap **Got It!** when guessed correctly, or **Reveal & Skip** to move on — the turn passes automatically either way.

---

## 🔐 Password

The classic clue-giving game. One player privately sees a secret word and gives one-word clues out loud; the rest of the group shouts guesses.

- Categories: Everyday Objects, Animals, Food, Movies & TV, Famous Places, School & Work.
- Set a configurable clue limit (3–8) at setup — fewer clues used means more points when guessed correctly.
- **🤖 Automated:** a timer per clue (15s recommended, customizable), auto-advancing when it runs out. **🎙️ Turn it off** for self-paced clue-giving.
- The clue-giver role rotates automatically every round, with running scores shown at the end.

---

## 🧠 Categories

Classic rapid-fire: a random category appears, and players take turns naming something that fits before the timer runs out.

- 16 built-in categories — Food, Animals, Countries, Movies, Anime, Philippine Culture, Professions, Sports, and more.
- A timer runs per turn (10s recommended, customizable, can be switched off); the group self-referees with **Nailed It!** / **Stuck or Repeated**.
- **🎯 Elimination Mode** (default) knocks a stuck player out — last one standing wins. Turn it off for a casual, no-pressure round.
- **🔄 New Category** anytime, or **🏁 End Round** whenever the group's had enough.

---

## 🟩 Word Grid

A Wordle-style word-guessing round, adapted from a standalone single-player prototype into a full pass-and-play party game. The app secretly deals the word — nobody has to type one in or know it ahead of time.

- Categories: Animals, Food & Drink, Movies & Shows, Sports & Games, Nature & Places, Everyday Life.
- Each turn, the app privately picks a word for whoever's holding the device, and the board resizes to fit it automatically (no fixed 5-letter limit).
- Type a full-length guess and tap **Guess** — tiles flip to reveal 🟩 right letter/right spot, 🟨 right letter/wrong spot, or ⬛ not in the word, including correct handling of repeated letters.
- Set a configurable guess limit (4–8) at setup — fewer guesses used means more points when you land the word.
- **🤖 Automated:** a timer per guess (45s recommended, customizable). Running out of time just skips that guess instead of ending the round, so nobody gets stuck. **Turn it off** for a self-paced round.
- **🏳️ Give Up** ends your turn early and reveals the word if the group would rather move on.
- Turn order rotates automatically, with running scores shown at the end.

---

## 🎵 Guess the Song

Since this is a static site with no audio hosting, songs are guessed through **progressive clues** instead of audio clips: an emoji rebus first, then a description, then an artist/era hint.

- Categories: OPM, K-Pop, Pop, Rock, Disney, Anime Songs, 2000s Music.
- **🤖 Automated:** a new clue reveals on a timer (12s recommended, customizable). Manual **Reveal Next Clue** and **Reveal Answer** buttons always work too.
- Optional team scoring — add teams to track points, or skip it and just play for fun.

---

## 🖼️ Picture Guess

Each round shows a real photo — not an emoji — that starts blurry and sharpens into focus over time. The photo is hidden behind a blur filter until someone shouts the answer or the group taps **Reveal Answer**.

### ✨ Features

- **Real embedded images**, one per question, fetched live and shown at full quality once sharpened — not an emoji standing in for the subject.
- **Progressive blur/sharpen**, exactly like before: four blur steps from heavily blurred to fully clear, advancing on a timer or a manual **🔍 Sharpen** tap.
- **Responsive image frame** — a fixed-aspect-ratio box (4:3 on desktop/tablet, 1:1 on narrow phones) with `object-fit: cover`, so every photo fills the frame without stretching or squashing on any screen size.
- **Loading state** — a spinner plays while a picture's photo is being fetched, so the frame never shows a blank flash.
- **Graceful fallback** — if a photo can't be fetched or fails to load, the round automatically falls back to that question's decorative emoji (still blurred/sharpened the same way) instead of breaking or freezing.
- Scoring, timers, randomization, and themes are unchanged from before — see below.

### 🎯 How to Play

1. Pick a category and add teams (optional — skip scoring to just play for fun), then tap **Start**.
2. A blurry real photo appears. Shout your guess the moment you know it!
3. **🤖 Automated:** the picture sharpens a step on a timer (4s recommended, customizable). Tap **🔍 Sharpen** anytime to speed it up manually.
4. Tap **💡 Reveal Answer** anytime — the answer stays completely hidden until then — award the point, and move to the next picture.

### 🗂️ Categories

Places, Food, Animals, Movies, Anime, Celebrities, Philippine Locations, Logos.

### 🖼️ Image Sources

This is a static site with no image hosting or CDN of its own, so instead of hardcoding hotlinked image URLs (which break the moment a file gets renamed or deleted), each question stores a **`wikiTitle`** — the exact Wikipedia article title for its subject — in `web/src/games/pictureguess/data.js`. At play time, `web/src/games/pictureguess/App.jsx` resolves that title to that article's current lead photo via Wikipedia's free, CORS-enabled REST API:

```
https://en.wikipedia.org/api/rest_v1/page/summary/<title>
```

No API key, backend, or build step is required — it's a plain `fetch()` from the browser. Images returned this way are Wikimedia Commons media, displayed the same way Wikipedia itself displays them (public domain or CC BY-SA licensed photos for most subjects; official logos on their respective company/brand articles). Results are cached in memory per session, so replaying a picture (e.g. **Play Again**) never re-fetches it.

**Data structure**, per question in `PICTUREGUESS_CATEGORIES`:

```js
{ emoji: "🗼", answer: "Eiffel Tower (Paris)", wikiTitle: "Eiffel Tower" }
```

| Field | Purpose |
|---|---|
| `emoji` | Decorative only — used as the category-card icon and as the **fallback** picture if a real photo can't be loaded. Never the primary clue anymore. |
| `answer` | The text revealed on **💡 Reveal Answer**. |
| `wikiTitle` | The Wikipedia article title used to look up a real photo at play time. Must match an actual article title exactly (check on wikipedia.org first if unsure). |

### ➕ Adding New Image Questions

Open `web/src/games/pictureguess/data.js` and add an entry to any category (or start a new one):

```js
"Your Category": [
  { emoji: "🎯", answer: "Your Answer", wikiTitle: "Exact Wikipedia Article Title" }
  // add as many as you like — one is picked at random each round
],
```

Then add an icon for it in `PICTUREGUESS_CATEGORY_ICONS`. Double-check the `wikiTitle` resolves to a real article with a lead photo (visit `https://en.wikipedia.org/wiki/<Your_Title>` and confirm it has an infobox image) — if it doesn't, that question just falls back to its `emoji` at play time instead of erroring out.

### ⚙️ Configuration

Same knobs as every other party game — see [🛠️ Customization](#️-customization): `MAX_TEAMS` and the timer's `recommended`/`presets`/`defaultEnabled` live near the top of `web/src/games/pictureguess/App.jsx`.

### 🐛 Troubleshooting

- **A picture never loads, just shows the emoji fallback** — either the group is offline (the Wikipedia fetch needs internet, same as loading the Google Fonts), or that question's `wikiTitle` doesn't match a real Wikipedia article. The round isn't broken either way — the emoji fallback still blurs/sharpens/scores exactly the same.
- **A picture looks cropped oddly** — the frame uses `object-fit: cover` to fill its box without stretching, which can crop the edges of a very wide or tall source photo. This only affects framing, never the subject's recognizability at full sharpness.

---

## 2️⃣ Two Truths and a Lie

Each turn, one player shares three statements — two true, one false — and the rest of the group votes on which one is the lie.

- **✍️ Write your own** statements (with a private lie-marker only you fill in), or **🎲 grab a ready-made prompt** from a bank of 15 fact-checked "which is false" trivia sets — no typing required.
- Every other player votes in turn on which statement they think is false.
- The app reveals the lie automatically, tallies who guessed right, and awards points (correct guessers +1, and the storyteller +1 per person they fooled).
- The storyteller role rotates every round.
- **Optional timer** (60s recommended, off by default) covers discussion and voting together — turn it on at setup if your group wants the pressure.

---

## 🤷 Would You Rather?

Vote on funny, difficult, or downright extreme dilemmas.

- Categories: Funny, Difficult, Food, School, Random, Extreme.
- Each player votes A or B in turn; once everyone's in, a results bar chart appears automatically.
- **Skip** any prompt that isn't for your group — fully automatic, no host needed at all.
- **Optional timer** (30s recommended, off by default) per question — a player who doesn't vote in time is skipped automatically.

---

## 👥 Most Likely To

"Most likely to become famous?" — vote for someone in your own group and see who gets called out.

- Categories: Friends, School, Funny, Random, Future, Work.
- Each player votes for a name from the roster in turn; results reveal automatically, ranked with medals for the top picks.
- Fully automatic — no host, no manual tallying.
- **Optional timer** (30s recommended, off by default) per vote — a player who doesn't vote in time is skipped automatically.

---

## 🎭 Charades

A player privately sees a word or phrase and acts it out — no talking — while the group shouts guesses.

- Categories: Movies, Animals, Actions, Professions, Food, Anime, Filipino Culture.
- **🤖 Automated:** a timer per round (60s recommended, customizable). **🎙️ Turn it off** for untimed acting.
- Tap **Correct!** the moment it's guessed (+1 point for the actor) or **Skip** if time's tight — either way, the turn rotates automatically.

---

## 🤖 Automated Game Master

Several games can run themselves, or hand control to a human — picked once at setup:

| Mode | What happens |
|---|---|
| 🤖 **Automated** *(default)* | Timers run on their own, and turns/reveals advance automatically when time's up. |
| 🎙️ **Game Master** | Timer defaults to off — one person controls pacing manually, revealing answers or advancing turns whenever the group's ready. |

> [!TIP]
> Switching modes doesn't change *who* can click what — every button stays available to every player either way. Game Master mode just turns the timer off by default so one person can control pacing; the timer switch on the setup screen always has the final say.

Quiz Night surfaces this as a two-button picker at setup. Every other timed game expresses the same idea through its own Timer switch — see below.

---

## ⏱️ Timer System

One universal timer component is shared by every game — including Spy Word and Quiz Night. Each game's setup screen shows a **Timer** block with:

- A recommended duration, shown up front so you know the default before you touch anything.
- Preset chips **and** a custom numeric input — pick a preset or type any duration in seconds.
- A switch to turn the timer off entirely, for games where the group would rather self-pace.

During play, the timer appears as a countdown badge with **Pause**, **Resume**, and **Reset** controls. It shifts to an amber "almost out" warning partway through, then red with a pulse in the final stretch — both stages scale with whatever duration you picked, not a fixed second count. When time runs out, the game automatically advances (next player, next clue, reveal the answer, etc.) exactly as it would if a Game Master called time.

| Game | Timer unit | Recommended | On by default |
|---|---|---|:---:|
| 🕵️ Spy Word | discussion | 60s | ✅ |
| ❓ Quiz Night | per question | 30s | ✅ |
| 🤔 Who Am I? | per player | 120s | ✅ |
| 🔐 Password | per clue | 15s | ✅ |
| 🧠 Categories | per turn | 10s | ✅ |
| 🟩 Word Grid | per guess | 45s | ✅ |
| 🎭 Charades | per round | 60s | ✅ |
| 🎵 Guess the Song | per clue reveal | 12s | ✅ |
| 🖼️ Picture Guess | per sharpen step | 4s | ✅ |
| 2️⃣ Two Truths and a Lie | discussion & voting | 60s | ❌ *(opt-in)* |
| 🤷 Would You Rather? | per question | 30s | ❌ *(opt-in)* |
| 👥 Most Likely To | voting | 30s | ❌ *(opt-in)* |

The three voting games ship with the timer off since they've always self-paced — flip the switch at setup if your group wants the pressure. Every other game ships with a sensible default on, and can be switched off the same way.

---

## 👥 Multiplayer

Every game is designed for **one shared device or screen**, passed around or viewed together — no accounts, no per-player devices required. Turn order, hidden information, and scoring are all tracked by the app itself, so control naturally rotates between players as each game calls for it, instead of resting on one permanent host.

---

## 🎨 Themes

### 🕵️ Spy Word — 57 themes across 7 groups

Spy Word themes are deliberately **specific**, not broad — "Naruto Characters" gives two closely related ninjas, which makes for a much better guessing game than a vague "Anime" theme would.

| Group | Themes |
|---|---|
| **Classics** | Profession, Food, Vegetables, Fruit, Animals |
| **Pop Culture** | SpongeBob Characters, Marvel Heroes/Villains, MCU Movies, Marvel Locations/Superpowers, Dragon Ball/Naruto/One Piece/Demon Slayer/Jujutsu Kaisen Characters, Anime Locations/Powers, Disney Movies, Pixar Characters, Netflix Shows, Sitcom Characters, Famous Movie Characters, Video Game Characters |
| **Music** | OPM Artists, K-Pop Groups, International Singers, Rock Bands, Song Titles, Musical Instruments |
| **Sports** | Basketball Players, NBA Teams, Football Players, Football Teams, Olympic Sports, Sports Equipment |
| **Academic** | College Courses, Computer Science/Engineering/Business/Medical/Education/Architecture Terms |
| **Philippines** | Famous Places, Provinces, Cities, Filipino Celebrities, Filipino Food, Historical Figures |
| **General Knowledge** | World Capitals, Planets of the Solar System, World Currencies, Ancient Civilizations, Tech Companies, International Dishes, Famous Scientists, E-Commerce Platforms |

### ❓ Quiz Night — 27 themes across 4 groups

| Group | Themes |
|---|---|
| **Pop Culture** | Cartoons, Marvel, Anime, Movies & TV, Video Games, Studio Ghibli, Sitcoms, It's Always Sunny in Philadelphia, Marvel Cinematic Universe, Harry Potter, Disney, Star Wars, Lord of the Rings |
| **Music** | Music |
| **Academic & Local** | College Programs, Philippine Trivia, E-Commerce, Filipino Culture |
| **General Knowledge** | World Geography, Science, World Trivia, History, Technology, Food, Famous People, Sports, Internet and Social Media |

Boards with more than 5 categories (like College Programs' 8) scroll sideways automatically, with an on-screen hint.

### 🎲 Everyone else

Each remaining game has its own curated category list — see that game's section above for the full list. They're simpler flat lists (no nested point structure), so adding to them is quick — see **➕ Adding New Games** below.

---

## ⚙️ Installation

The whole site — the homepage and all **12 games** — is a single React + Vite multi-page app in `web/`. It needs Node.js to build or run locally; see [🧱 Tech Stack](#-tech-stack) below.

```bash
git clone <this-repo-url>
cd web
npm install
```

## ▶️ How to Run

```bash
cd web
npm run dev
# then open the URL Vite prints (defaults to http://localhost:5173)
```

Vite's dev server serves every page — the homepage at `/` and each game at its own `<game>.html` (e.g. `/spy.html`, `/quiz.html`) — with hot module reload, so editing any game's `App.jsx` updates the browser instantly.

To preview the exact static output the live site serves:

```bash
cd web
npm run build      # writes web/dist/
npm run preview    # serves web/dist/ locally
```

No accounts or backend are required to play. An internet connection is needed for three things: loading the Google Fonts on first visit, fetching each Picture Guess photo from Wikipedia during that game, and loading the YouTube IFrame API for Guess the Song's optional clip player — everything else works fully offline, and both Picture Guess and Guess the Song degrade gracefully (an emoji fallback, or just the text clues) if either can't be reached.

---

## 🧱 Tech Stack

| Area | Stack |
|---|---|
| Homepage + all 12 games (`web/`) | [React](https://react.dev) 19 + [Vite](https://vite.dev) (multi-page app — one HTML entry per game, auto-discovered from `web/*.html`), [lucide-react](https://lucide.dev) for icons, CSS Modules for styling |
| Deployment | [GitHub Actions](https://github.com/features/actions) → [GitHub Pages](https://pages.github.com) — see [🌐 Deployment](#-deployment) |

The whole site is one Vite multi-page app: `web/vite.config.js` scans the directory for every top-level `*.html` file and wires each one up as its own Rollup entry automatically, so adding a new game's `<game>.html` is enough — no config edits needed. Each page mounts its own independent React root (`web/src/games/<game>/main.jsx`), matching the site's original "open any page directly" model — there's no client-side router, and no game's bundle depends on another's.

A shared component/hook library (`web/src/shared/`) is what keeps all 12 games consistent without duplicating code — a `theme.css` token contract every game's own `palette.css` overrides with different colors, plus components for screens, timers, rosters, team scoreboards, reveal cards, voting, results, and the tie-breaker. See [📁 Project Structure](#-project-structure) below for the full layout.

Why **lucide-react**: it's a single, consistent line-icon family (unlike aggregator libraries such as `react-icons`, which mix several visually inconsistent source sets), it's tree-shakeable (only the icons actually imported end up in each page's bundle), and it has no runtime CSS framework dependency to drag in alongside it.

---

## 🌐 Deployment

**Live site:** https://markdaniel0702.github.io/PARTY-PILOT/

The site is deployed on **GitHub Pages** — free, HTTPS by default, no account needed to play, no backend to provision. A GitHub Actions workflow (`.github/workflows/deploy.yml`) builds the whole `web/` app and publishes it on every push.

### Build settings

| Setting | Value |
|---|---|
| Source | **GitHub Actions** (not "Deploy from a branch") |
| Workflow | `.github/workflows/deploy.yml` |
| Trigger | Push to `main` (or manually via **Actions → Deploy to GitHub Pages → Run workflow**) |
| Build command | `npm ci && npm run build` inside `web/` (Vite) |
| Environment variables | None |

What the workflow actually does:
1. Installs `web/`'s dependencies and runs its Vite build, which outputs every page (homepage + 12 games) to `web/dist/`.
2. Uploads `web/dist/` as the Pages artifact and deploys it — same free `actions/deploy-pages` action GitHub itself recommends for React/Vite sites.

### Connecting the repository (one-time setup)

1. Push the repo to GitHub (already done for this project).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions** (this is the one manual step — it was previously set to "Deploy from a branch" and needs to be switched over).
4. Push to `main` (or run the workflow manually) — GitHub publishes the site at `https://<username>.github.io/<repo-name>/` within about a minute, and **Enforce HTTPS** is on by default.

### Redeploying after changes

Still no manual redeploy step — the workflow runs automatically on every push to `main`, same as before:

```bash
git add .
git commit -m "Your change"
git push origin main
```

The live site updates within roughly a minute or two of the push finishing. Progress is visible under the repo's **Actions** tab.

### Free-tier alternatives

If this project ever needs something GitHub Pages doesn't offer (custom edge functions, a real backend, etc.), it's still fundamentally a static site once built, so it can move to any of these free platforms — set the build command to `npm ci && npm run build --prefix web` and the output/publish directory to `web/dist`:

| Platform | Notes |
|---|---|
| Cloudflare Pages | Free, unlimited bandwidth, GitHub auto-deploy, `pages.dev` URL — requires signing up for a Cloudflare account and connecting GitHub via OAuth |
| Netlify | Free tier, GitHub auto-deploy, `netlify.app` URL — requires a Netlify account |
| Vercel | Free tier, GitHub auto-deploy, `vercel.app` URL — requires a Vercel account |

GitHub Pages was chosen over these because it needs no new third-party account at all — it publishes straight from the GitHub account that already hosts the code.

---

## 📁 Project Structure

```
Gamenight/
├── web/                        The entire site — one Vite multi-page app
│   ├── index.html              Homepage HTML entry
│   ├── spy.html, quiz.html, whoami.html, password.html,
│   │   categories.html, wordgrid.html, guessthesong.html,
│   │   pictureguess.html, twotruths.html, wouldurather.html,
│   │   mostlikely.html, charades.html
│   │                          One HTML entry per game — each mounts its own React root
│   ├── vite.config.js         Auto-discovers every top-level *.html and wires it as a build entry
│   ├── package.json
│   └── src/
│       ├── App.jsx, gameData.js, main.jsx, style.css
│       │                      Homepage: header, game groups, card grid, game list
│       ├── shared/            The component/hook library every game is built from
│       │   ├── theme.css      Base design-token contract (--ink, --panel, --paper, --accent, etc.)
│       │   ├── tiebreakerData.js
│       │   ├── components/    Screen, GameShell, Button, Roster, TeamSetup, TimerSetup, GameTimer,
│       │   │                  PassCard, RevealCard, GroupedPicker, Voting, ResultsList,
│       │   │                  TieBreakerScreen, Scoreboard, StatementCard, and their .module.css files
│       │   ├── hooks/         useCountdown, useGameTimer, useRoster, useTeams, useTimerSetup,
│       │   │                  useUsedIndices, usePersistedUsedIndices
│       │   └── utils/         random.js (pickRandom/shuffle/groupKeys), resolveStanding.js
│       └── games/
│           └── <game>/        One folder per game — never touches another game's folder
│               ├── App.jsx    The game's screens and logic (built from web/src/shared/)
│               ├── main.jsx   React entry point for that page
│               ├── data.js    That game's themes/categories/questions/content
│               ├── palette.css   That game's color-token overrides (redeclares theme.css's tokens)
│               └── <game>.module.css   Any styling bespoke to that one game
├── .github/workflows/deploy.yml   Builds web/, deploys web/dist/ to Pages
└── README.md                   You are here
```

> `web/dist/` isn't checked into the repo — it's build output. `npm run build` inside `web/` (or the deploy workflow) produces it fresh each time.

**`web/src/shared/`** is what keeps all 12 games consistent without duplicating code. The highlights:

| Piece | What it does |
|---|---|
| `theme.css` | The base `:root` design-token contract every game's own `palette.css` overrides with different colors — the same "shared stylesheet + per-game palette" split the site always used, formalized into CSS Modules |
| `utils/random.js` | `pickRandom(arr)`, `shuffle(arr)`, `groupKeys(allKeys, groupDefs)` — pure randomization and the grouped-picker "leftover bucket" logic |
| `hooks/useUsedIndices` / `usePersistedUsedIndices` | In-memory and `localStorage`-backed "don't repeat until exhausted" pickers — the latter powers Quiz Night's per-slot question pools and the tie-breaker's no-immediate-repeat challenge draw |
| `hooks/useCountdown` / `useGameTimer` | The low-level start/stop/pause/resume countdown, and the in-game warn/urgent staging built on top of it |
| `components/TimerSetup`, `components/GameTimer` | The universal pre-game timer widget (switch, presets, custom input) and in-game countdown HUD used by every timed game |
| `components/GroupedPicker` | The grouped card-picker UI (themes, categories, prompt sets), paired with `groupKeys()` for games with sub-groups |
| `hooks/useRoster`, `components/Roster` | A named-player list with a +/- stepper |
| `hooks/useTeams`, `components/TeamSetup` | An optional add/remove/rename team scoreboard, Quiz-Night-style |
| `components/Screen` | The show/hide screen-toggle pattern (with fade-in and scroll-to-top) used throughout the site |
| `components/TieBreakerScreen`, `utils/resolveStanding` | The universal tie-breaker — detects a tie among the top scorers, plays it out (or accepts a shared win), and reports back the settled result. See [⚔️ Final Tie-Breaker](#️-final-tie-breaker) |

---

## ➕ Adding New Games

The site is intentionally flat and repetitive on purpose — every game is its own `web/src/games/<game>/` folder (`App.jsx` + `main.jsx` + `data.js` + `palette.css`) plus one `web/<game>.html` entry, so a new game never requires touching an existing one.

1. Copy the folder of the game closest to what you're building (e.g. `charades/` for a turn-based reveal game, `wouldurather/` for a voting game) into a new `web/src/games/<game>/`, and copy its `web/<game>.html` to match.
2. Update `main.jsx`'s import of `./palette.css` stays as-is; edit `palette.css` itself — it only needs the same handful of color tokens (`--ink`, `--panel`, `--paper`, `--accent`, etc.) that `theme.css` defines, redeclared with your new palette — plus any bespoke visual touches in a `<game>.module.css`. Your `App.jsx` reaches for `web/src/shared/`'s components/hooks (`GameTimer`, `Roster`, `GroupedPicker`, `useGameTimer`, etc.) instead of rebuilding them.
3. Put your content in the new folder's `data.js`, exported as plain `export const` objects/arrays.
4. Add a card for it to `web/src/gameData.js`'s `GAME_GROUPS` array (copy an existing game entry, pick a [lucide-react](https://lucide.dev) icon, and give it a unique `accent` color) — the homepage picks it up on the next build, no JSX to touch. `web/vite.config.js` auto-discovers your new `<game>.html` — no build config to edit.

> [!IMPORTANT]
> Keep every game host-optional: let the app manage turns/timers/randomization, and only add a Game Master toggle if a timer would otherwise force pacing on the group.

<details>
<summary><strong>🕵️ Add a new Spy Word theme</strong></summary>

Open `web/src/games/spy/data.js` and add an entry to `SPY_THEMES`:

```js
"Your Theme Name": [
  { main: "Word A", spy: "Word B" },
  { main: "Word C", spy: "Word D" }
  // one pair is picked at random each round — aim for 5–6+
],
```

Then add an icon in `SPY_THEME_ICONS` and, optionally, a spot for it in `SPY_THEME_GROUPS` so it's organized on the setup screen (skipping this just puts it in an automatic "More Themes" group).

**Good pairs are specific:** "Naruto Characters" beats "Anime" — the words should be closely related but distinct enough that an alert group can eventually spot the Spy.

</details>

<details>
<summary><strong>❓ Add new Quiz Night questions</strong></summary>

Open `web/src/games/quiz/data.js`. Every theme needs an `icon` and a list of `categories`, and every category needs all five point levels — each holding a **pool** (array) of questions rather than a single one:

```js
"Your Theme": {
  icon: "🎯",
  categories: [
    {
      name: "Your Category",
      questions: {
        100: [
          { q: "An easy question?", a: "The answer" },
          { q: "Another easy question, same subject?", a: "The answer" },
          { q: "A third easy question, same subject?", a: "The answer" }
        ],
        200: [ /* 3 slightly harder questions, same shape */ ],
        300: [ /* 3 moderate questions */ ],
        400: [ /* 3 difficult questions */ ],
        500: [ /* 3 very difficult questions */ ]
      }
    }
  ]
}
```

Add it to `QUIZ_THEME_GROUPS` the same way as Spy Word. Themes with more than 5 categories automatically get a scrollable board — no extra work needed.

> [!IMPORTANT]
> Every category must have exactly the five point keys `100`–`500`, each an **array** of question objects, or that tile won't render. A pool can hold any number ≥ 1 — 3 is the site's convention, giving each slot enough variety to avoid repeats across a few plays — see [❓ Randomized Question Pools](#-randomized-question-pools).

</details>

<details>
<summary><strong>🎲 Add content to any other game</strong></summary>

The other ten games use much simpler, flat data files — no nested point structure. Open the matching `web/src/games/<game>/data.js` and follow the existing pattern for that file: a category name mapped to an array of items (character names for Who Am I?, word pairs or word lists, `wikiTitle` + answer pairs for Picture Guess — see [➕ Adding New Image Questions](#-adding-new-image-questions), etc.). Every one of them is a plain `export const` object literal, so copy an existing entry and change the words.

</details>

---

## 🛠️ Customization

| Want to change... | Edit... |
|---|---|
| Homepage colors & fonts | `:root { ... }` in `web/src/style.css` |
| Base design tokens shared by every game | `:root { ... }` in `web/src/shared/theme.css` |
| One game's accent color | `:root { ... }` in that game's own `web/src/games/<game>/palette.css` (redeclares `theme.css`'s color tokens with new values) |
| Min/max players | `MIN_PLAYERS` / `MAX_PLAYERS` near the top of that game's `web/src/games/<game>/App.jsx` |
| Max teams | `MAX_TEAMS` near the top of `web/src/games/quiz/App.jsx`, `guessthesong/App.jsx`, or `pictureguess/App.jsx` |
| A game's recommended timer / presets / default on-off | The `useTimerSetup({...})` call near the top of that game's `App.jsx` — `recommended` and `defaultEnabled` are plain arguments; presets are passed to the `<TimerSetup>` component just below it. Players themselves never need to touch this: every setup screen already lets them pick a custom duration or switch the timer off. |
| Quiz Night point tiers | `POINT_VALUES` in `web/src/games/quiz/App.jsx` — update every category's `questions` object to match |
| Quiz Night bonus events | `QUIZ_BONUS_EVENTS` in `web/src/games/quiz/data.js` — add a new object to the array and it's automatically in rotation; the max bonus slot count is `MAX_BONUS` in `App.jsx` |
| Tie-breaker challenges | `web/src/shared/tiebreakerData.js` — `TIEBREAKER_CHALLENGES` lists the six challenge types, backed by the `TIEBREAKER_TRIVIA` / `TIEBREAKER_ESTIMATES` / `TIEBREAKER_CATEGORIES` / `TIEBREAKER_PHYSICAL` content banks |

---

## 🐛 Troubleshooting

<details>
<summary><strong>A theme/category grid looks empty, or the page is blank</strong></summary>

Open your browser's dev console (F12) and check for a red error — almost always a typo in a game's `data.js` file (a missing comma or bracket stops the whole file from loading, and `npm run build`/`npm run dev` will also fail loudly with the same error). Compare against the existing entries for the exact format.
</details>

<details>
<summary><strong>A new Quiz Night theme doesn't show all its point tiles</strong></summary>

Every category needs all five point keys (`100`, `200`, `300`, `400`, `500`). If one's missing, that tile just won't render.
</details>

<details>
<summary><strong>Fonts look different than expected</strong></summary>

The site loads fonts from Google Fonts. Offline on first load, or on a strict network? The browser falls back to a system font — everything still works.
</details>

<details>
<summary><strong>A Quiz Night tile got clicked but nothing happened</strong></summary>

Tiles lock the instant they're clicked (even before the question shows) so they can't be picked twice by accident. There's no built-in undo — use <strong>Reset Game</strong> to start the board over if needed.
</details>

<details>
<summary><strong>A timer keeps interrupting the group</strong></summary>

Every game's setup screen has the same <strong>Timer</strong> block — flip its switch off and no countdown runs at all. On Quiz Night, picking <strong>🎙️ Game Master</strong> mode does the same thing in one tap.
</details>

<details>
<summary><strong>I want a longer or shorter timer than the default</strong></summary>

Open the <strong>Timer</strong> block on any setup screen — tap a preset chip, or type any custom duration (5–600 seconds) into the "Custom" field. The change only applies to that game session; the recommended default shown next to the switch never changes.
</details>

<details>
<summary><strong>The game jumped to a "It's a Tie!" screen I wasn't expecting</strong></summary>

That's the universal tie-breaker — it only appears when two or more entrants finish with the same top score, and only the tied entrants play it out. Tap <strong>🤝 Accept a Shared Win</strong> anytime to skip it and keep the tie standing.
</details>

<details>
<summary><strong>The site didn't update after I pushed a change, or the live site shows a 404</strong></summary>

Check the repo's <strong>Actions</strong> tab first — if the "Deploy to GitHub Pages" workflow failed, the old build stays live (the whole site, including every game, is one Vite build now, so a failed workflow means nothing updates). The most common cause is <strong>Settings → Pages → Source</strong> still being set to "Deploy from a branch" instead of <strong>GitHub Actions</strong> (a one-time setting change described in <a href="#-deployment">🌐 Deployment</a>).
</details>

---

## 🚀 Future Improvements

Ideas for anyone who wants to keep building on this project:

- 🌐 Online/remote multiplayer (everything today assumes one shared screen)
- 🔊 Sound effects and a buzzer for every timer
- 🧩 An in-app theme/question builder, so nobody needs to edit code to add content
- 🌗 A light/dark theme toggle
- 🎚️ Difficulty filters (e.g. "easy mode" using only 100–300 point Quiz Night questions)
- 📤 A shareable results screen at the end of any game
- 🎤 Real audio clips for Guess the Song, if a backend/CDN is ever added
