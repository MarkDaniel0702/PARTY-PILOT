# 🎮 B-Rotation

<p>
  <img alt="Games" src="https://img.shields.io/badge/games-15-7c5cff">
  <img alt="React" src="https://img.shields.io/badge/React-19-61dafb">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-multi--page-646cff">
  <img alt="Sign-up" src="https://img.shields.io/badge/sign--up-not%20required-2fd67f">
  <img alt="Host" src="https://img.shields.io/badge/host-optional-ff9f4a">
  <img alt="Themes" src="https://img.shields.io/badge/light%20%2F%20dark-supported-1e1f30">
  <img alt="Sound" src="https://img.shields.io/badge/sound%20effects-yes-ffcb3c">
  <img alt="Deploy" src="https://img.shields.io/badge/deploy-GitHub%20Pages-222">
</p>

<p>
  <img alt="Spy Word themes" src="https://img.shields.io/badge/Spy%20Word%20themes-57-e8324f">
  <img alt="Quiz Night themes" src="https://img.shields.io/badge/Quiz%20Night%20themes-27-ffcb3c">
  <img alt="Quiz Night questions" src="https://img.shields.io/badge/Quiz%20Night%20questions-1725-ffcb3c">
  <img alt="Guess the Song genres" src="https://img.shields.io/badge/song%20genres-14-ff3d9a">
</p>

**B-Rotation** is a colourful, browser-based party-game platform. **15 games**, one shared screen, **no dedicated host required** — gather a group around a phone, tablet, or laptop and pick from social deduction, trivia, voting games, and classic party favourites. The app runs turns, timers, randomisation, hidden information, scoring, and results on its own.

> [!TIP]
> **▶️ Play now:** <https://markdaniel0702.github.io/PARTY-PILOT/> — free, no sign-up, works on any device.

> [!NOTE]
> Never played before? Every game's setup screen has a collapsible **"How does this work?"** box with the full rules — nobody has to read this file to play.

---

## 📑 Table of Contents

- [Project Overview](#-project-overview)
- [✨ Features](#-features)
- [🎮 Available Games](#-available-games)
  - [🕵️ Spy Word](#️-spy-word)
  - [❓ Quiz Night](#-quiz-night)
  - [🎵 Guess the Song](#-guess-the-song)
  - [🖼️ Picture Guess](#️-picture-guess)
  - [🃏 UNO](#-uno)
  - [🎨 Draw & Guess](#-draw--guess)
  - [⚔️ Dogs vs Cats](#️-dogs-vs-cats)
  - [🎲 Other Implemented Games](#-other-implemented-games)
- [🤖 Automated Game System](#-automated-game-system)
- [⏱️ Timers](#️-timers)
- [🔊 Sound Effects](#-sound-effects)
- [🌗 Light / Dark Mode](#-light--dark-mode)
- [🏆 Scoring and Tie-Breakers](#-scoring-and-tie-breakers)
- [📚 Themes and Content](#-themes-and-content)
- [🛠️ Installation](#️-installation)
- [▶️ Running the Project](#️-running-the-project)
- [📁 Project Structure](#-project-structure)
- [➕ Adding New Games and Content](#-adding-new-games-and-content)
- [🚀 Deployment](#-deployment)
- [🐛 Troubleshooting](#-troubleshooting)
- [📄 Project Notes](#-project-notes)

---

## 🧭 Project Overview

The whole site — the homepage plus all 15 games — is a **single React 19 + Vite multi-page app** living in `web/`. Each game is its own HTML entry (`spy.html`, `quiz.html`, …) that mounts an independent React root, and every game is built from one shared component/hook library in `web/src/shared/`. There is no backend, no database, and no account system.

| | |
|---|---|
| **Platform** | Static site — HTML/CSS/JS only after building |
| **Framework** | React 19, bundled by Vite as a multi-page app |
| **Icons** | [`lucide-react`](https://lucide.dev) (tree-shaken line icons) |
| **Styling** | CSS Modules + a shared design-token contract, per-game colour palettes |
| **Persistence** | `localStorage` only (theme, sound settings, Quiz Night question history) |
| **Hosting** | GitHub Pages via GitHub Actions |
| **Network use** | Google Fonts (first load), Wikipedia photo lookups (Picture Guess), YouTube IFrame API (Guess the Song clips), and — only if you opt into pairing a phone — a one-time handshake with PeerJS's public broker to connect a controller. Everything degrades gracefully offline |

---

## ✨ Features

| | |
|---|---|
| 🙅 **No host required** | Every game runs itself — turn order, timers, hidden info, and results all happen automatically. |
| 🎙️ **Game Master optional** | Some games also offer a manual mode where one person controls pacing. |
| 🎲 **15 games, 5 categories** | Word & Deduction, Trivia & Knowledge, Party & Voting, Card Games, and Arcade. |
| ⏱️ **Universal customizable timers** | One shared timer system — a recommended duration you can override with a preset or a custom value (5–600 s), Pause / Resume / Reset controls, and a switch to turn it off entirely. |
| 🔀 **Randomised content** | Words, questions, prompts, songs, and pictures are drawn at random each round; Quiz Night additionally remembers which questions a slot has shown and avoids repeats. |
| ⭐ **Bonus events** | Quiz Night boards can include 1–4 surprise bonus tiles with random point swings. |
| 🏆 **Automatic scoring & results** | Boards, votes, and scoreboards resolve themselves the moment a round finishes. |
| ⚔️ **Automatic tie-breaker** | A tied top score triggers a random tie-breaker challenge for just the tied entrants, looping until one winner remains — or accept a shared win. |
| 🔊 **Sound effects** | Timer start / warning / buzzer cues plus event sounds (correct, incorrect, steal, bonus, completion), with a global mute and volume control. |
| 🌗 **Light / dark mode** | A site-wide theme toggle that follows your system preference by default and remembers your choice. |
| 📱 **Fully responsive** | Works on a laptop, tablet, or phone passed around a table. |
| 🎮 **Optional phone controllers** | Quiz Night, Guess the Song, and Picture Guess can pair players' phones over WebRTC (scan a QR code) so they can buzz in directly — entirely optional, and every game still plays exactly the same without it. |
| 🔒 **Private by design** | No accounts, no server, no database. Pairing a phone briefly touches PeerJS's public broker to connect the two devices — no other game data ever leaves your browser. |

---

## 🎮 Available Games

| Game | Group | Players | Automated | GM option | Final scores |
|---|---|---|:---:|:---:|:---:|
| 🕵️ [Spy Word](#️-spy-word) | Word & Deduction | 3–10 | ✅ | — | — |
| 🤔 [Who Am I?](#-other-implemented-games) | Word & Deduction | 3–10 | ✅ | ✅ | — |
| 🔐 [Password](#-other-implemented-games) | Word & Deduction | 2–10 | ✅ | ✅ | ✅ |
| 🧠 [Categories](#-other-implemented-games) | Word & Deduction | 2–10 | ✅ | — | — |
| 🟩 [Word Grid](#-other-implemented-games) | Word & Deduction | 2–10 | ✅ | — | ✅ |
| ❓ [Quiz Night](#-quiz-night) | Trivia & Knowledge | 1–6 teams | ✅ | ✅ | ✅ |
| 🎵 [Guess the Song](#-guess-the-song) | Trivia & Knowledge | Any group | ✅ | — | ✅ |
| 🖼️ [Picture Guess](#️-picture-guess) | Trivia & Knowledge | Any group | ✅ | — | ✅ |
| 2️⃣ [Two Truths and a Lie](#-other-implemented-games) | Party & Voting | 2–10 | ✅ | — | ✅ |
| 🤷 [Would You Rather?](#-other-implemented-games) | Party & Voting | 2–10 | ✅ | — | — |
| 👥 [Most Likely To](#-other-implemented-games) | Party & Voting | 3–10 | ✅ | — | — |
| 🎭 [Charades](#-other-implemented-games) | Party & Voting | 3–10 | ✅ | ✅ | ✅ |
| 🃏 [UNO](#-uno) | Card Games | 2–8 | ✅ | — | — |
| 🎨 [Draw & Guess](#-draw--guess) | Card Games | 3–8 | ✅ | — | ✅ |
| ⚔️ [Dogs vs Cats](#️-dogs-vs-cats) | Arcade | 2 teams | ✅ | — | ✅ |

---

### ⚔️ Dogs vs Cats

Turn-based artillery. Two teams alternate turns; on yours you walk a little, pick a weapon, set angle and power, and fire. Shots blow real craters in the ground, and anyone left standing on nothing takes the fall. Last team with a survivor wins.

- **6 battlefields** — Rolling Hills, Scattered Isles, Cat Caves, Canyon Standoff, Sky Platforms, and Crater Field.
- **Nothing is a picture.** Every battlefield is *generated from a seed* at match start, so the same map is never the same twice — and the game ships no image files at all.
- **Destructible terrain:** the ground is a bitmap the explosions cut holes into, so the battlefield genuinely erodes as the match goes on.
- **Wind** is re-rolled every turn and pushes shots sideways — the Fish Lobber far more than the others.
- **3 weapons:** Bone Bazooka (accurate, hard-hitting), Fish Lobber (wide blast, very wind-sensitive), Paw Whack (close range, knocks the target flying).
- **Optional phone controllers** — the team on turn gets an aiming gamepad on their phone; everyone else is told to watch, so two people can't aim the same shot.
- 1–4 characters per team, and a 45-second turn clock.

> [!NOTE]
> Original dog and cat characters, generated terrain, and hand-written physics — inspired by the turn-based artillery genre rather than copied from any particular game.

---

### 🎨 Draw & Guess

One player gets a secret word and draws it; everyone else races to guess. The app deals the words, runs the clock, scores by speed, and rotates the turn.

Like UNO, it plays two ways:

- **📱 With phones** — the drawer sketches on their **own phone** and the strokes appear live on the shared screen, so they can sit down instead of hunching over it. Everyone else types guesses into a live feed, and the app matches and scores them automatically.
- **🔄 Without phones** — pass the device to each drawer (the word is revealed privately first), they draw straight on the shared screen, and the group shouts guesses while someone taps who got it.

- **6 categories** — Everyday Objects, Animals, Food & Drink, Places & Buildings, Actions & Sports, and Movies & Fantasy — plus **your own word list**, typed in at setup.
- **Drawing tools:** a six-colour palette, three brush widths, undo, and clear.
- **Speed scoring:** a guesser earns 50–100 points depending on how much time is left; the drawer earns 25 per player who gets it, capped at 100 — so a clear drawing pays.
- **Letter hints** start filling in the blanks once the clock passes 60%, capped at a third of the word.
- Set **1–3 rounds** so everyone draws once per round.

> [!NOTE]
> Guesses are matched loosely — case, spacing, punctuation, and accents are all ignored, and a one-letter typo is quietly reported to that player alone as "so close!". It's never broadcast, because telling the room you're one letter away gives the answer away.

---

### 🃏 UNO

The classic colour-and-number card game, dealt and refereed by the app. Match the discard pile's **colour**, **number**, or **symbol** — wilds go on anything — and win by emptying your hand first.

This is the first game built on the **phone controller** layer, and it plays two ways:

- **📱 With phones** — pair a phone per player and each hand stays genuinely private. The host sends every hand down that player's own WebRTC channel, so nobody else's device ever receives your cards.
- **🔄 Without phones** — pair nothing and it falls back to the same **pass-the-device** flow Spy Word uses: "Pass the device to [Name]", reveal your hand, play, hide, pass on.

The shared screen always shows the public state — discard pile, active colour, play direction, whose turn it is, and everyone's remaining card count (with an **UNO!** flag at one card).

- Full 108-card deck: four colours of 0–9, Skip, Reverse, and Draw Two, plus 4 Wild and 4 Wild Draw Four.
- **Reverse** flips direction — and acts as a **Skip** in a two-player game.
- No legal card? Draw one — you may play it immediately if it's legal, otherwise your turn passes.
- The draw pile automatically reshuffles from the discard pile when it runs out.

> [!NOTE]
> Two deliberate simplifications: there's **no "UNO!" call-out penalty** (the screen just announces when someone is down to one card), and **+2/+4 stacking is off**, matching official rules rather than the common house rule.

---

### 🕵️ Spy Word

A social-deduction word game. Almost every player secretly gets the same **main word**. One randomly chosen player — the Spy — gets a different but related **spy word**. Everyone describes their word out loud without saying it, and the group tries to catch the Spy before the Spy works out the real word.

- Pick one of **57 specific themes** (e.g. *Naruto Characters*, not just *Anime*), set the player count, optionally name players.
- The app randomly picks a word pair and randomly assigns exactly one Spy.
- Each player gets a private **"Pass the device to [Name]"** screen, reveals their word, then hides it before passing on.
- An optional discussion timer (60 s recommended, fully customizable) keeps the debate moving.
- Anyone taps **Reveal the Spy** when the group is ready to vote — the "host" role is just whoever's holding the device.

---

### ❓ Quiz Night

A Jeopardy-style trivia board with **27 themes** and a 100–500 point system. Pick a theme and a board appears with categories as columns and point values as rows.

#### Setup

- Choose a theme, add **1–6 teams**, and pick **🤖 Automated** or **🎙️ Game Master** mode.
- Optionally enable **⭐ Bonus Slots** (1–4 tiles, default 2) and set a per-question timer (30 s recommended).

#### Turn-taking

- A **turn banner** shows whose turn it is to pick a category and point value — the app tracks it, nobody referees.
- Tiles **lock the instant they're picked**, so nothing is answered twice by accident.
- The answer stays hidden until **Show Answer** — or, in Automated mode, until the question timer runs out.
- A **correct** answer keeps the turn; an **incorrect** one passes it to the next team in the fixed rotation.

#### Steal mechanic

- If the question timer runs out with no answer (or a team taps **No answer — open steal**), a **10-second steal window** opens for **every team except the one whose turn it was**.
- The group taps **"[Team] got it!"** for the first team to answer correctly (they take the points) or **"[Team] missed"** for each team that fails. If everyone misses or the steal timer expires, the question is a **time-out** with no points awarded.
- **Turn order is unaffected by a steal.** The next turn always goes to the team *after the one whose turn it originally was*, regardless of who stole the points.

#### Randomized question pools

- Every category/point-value slot reserves a **pool of 3 interchangeable questions** at the same difficulty on the same subject.
- A tile's question is chosen at random from its pool the moment it's revealed.
- The app **remembers which questions a slot has already shown** in this browser (across reloads and separate game nights) and won't repeat one until the whole pool has been used, then reshuffles — skipping an immediate repeat of the last question.
- This is tracked per slot, independently.

#### ⭐ Bonus Slots

Tapping a bonus tile skips the question and triggers a random event for the picking team:

| Event | What happens |
|---|---|
| ⭐ **Bonus Points** | A random 50–300 points, awarded immediately. |
| ✌️ **Double Points** | The team's next correct answer is worth double (shown as a chip until used). |
| 🥷 **Steal** | Take 150 points from a rival team (capped at what they have). |
| 🎲 **Risk It** | Wager 100/200/300 points on a coin flip — win doubles it, lose forfeits it. |
| 🎟️ **Free Pass** | Bank a one-time pass that can claim credit for a question nobody answers. |
| 🍀 **Lucky Draw** | A small random swing from −50 to +100. |

Bonus tiles are re-rolled every time you **Start Quiz** or **Reset Game**. **Steal** and **Risk It** never appear in a 1-team game.

#### Score tracking & results

- Each team taps its own **+ / −** button on the scoreboard to adjust points; awards from questions and bonuses are applied automatically.
- When every tile is answered, a **🏁 results screen** appears on its own with final standings — running through the [tie-breaker](#-scoring-and-tie-breakers) first if the top score is tied.

---

### 🎵 Guess the Song

Pick a **genre**, then work through its songs. Each song reveals **three progressively specific clues** — an emoji rebus, then a description, then an artist/era hint — and, when available, an **embedded YouTube music clip**.

- **14 genres:** OPM, K-Pop, Pop, Rock, Disney, Anime Songs, 2000s Music, Global Hits, Hip-Hop, R&B & Alternative, Emo & Pop Punk, Indie & Bedroom Pop, Pop Rock, and *Karaoke Classics: Tito & Tita Edition*.
- **YouTube-embedded clips:** most songs carry a `youtubeId` plus an optional `clipStart` / `clipDuration`. During the clue phase the app plays a **bounded, audio-only** snippet (no title or thumbnail shown); once the answer is revealed, the full video is unlocked. Songs without a clip simply play on clues alone.
- **Randomised, no-repeat order:** songs from the chosen genre are dealt at random and won't repeat until the genre is exhausted.
- **Point values:** each song is worth **100–500 points** depending on how obscure it is.
- **Optional team scoring:** add teams to award points per song, or skip scoring and just play for fun.
- **Genre filtering:** you only ever play the genre you selected — pick another with **New Theme**.
- **End-of-theme scoring:** once every song in the genre has been played, a **"Theme Complete!"** screen shows the genre, songs completed, the maximum possible score, and the final standings (again via the tie-breaker if needed). **End Session** ends early with a summary instead.
- Timer: a new clue reveals every 12 s by default (customizable); **Reveal Next Clue** and **Reveal Answer** always work manually too.

---

### 🖼️ Picture Guess

Each round shows a **real photo** that starts heavily blurred and sharpens into focus. Shout the answer before it clears.

- **Randomised 20-question challenge:** picking a category deals a shuffled queue of **20 questions** from it (fewer if the category has fewer than 20), shown as *"Picture 3 of 20"*. **Play Again** re-shuffles a fresh queue.
- **Embedded real images:** each question stores a **`wikiTitle`** (an exact Wikipedia article title). At play time the app fetches that article's current lead photo from Wikipedia's free, CORS-enabled REST API and shows it in a responsive, fixed-aspect frame — no API key, backend, or hard-coded image URLs.
- **Image handling:**
  - A **loading spinner** shows while a photo is fetched, so the frame never flashes blank.
  - **`object-fit: cover`** fills the frame on any screen without stretching.
  - **Graceful fallback:** if a photo can't be fetched (offline, or a `wikiTitle` with no lead image), the round falls back to that question's **decorative emoji**, blurred and sharpened exactly the same way — nothing breaks.
  - Fetched photos are **cached in memory per session**, so replaying one never re-fetches it.
- **Progressive blur/sharpen:** four steps (`20 → 12 → 6 → 0` px) advancing on a timer (4 s per step, customizable) or a manual **🔍 Sharpen** tap.
- **8 categories:** Places, Food, Animals, Movies, Anime, Celebrities, Philippine Locations, Logos.
- **Optional team scoring**, award a point on **💡 Reveal Answer**, then **Next Picture**. **End Session** stops early with a summary.

---

### 🎲 Other Implemented Games

<details open>
<summary><strong>🤔 Who Am I?</strong> — 3–10 players · GM optional</summary>

Each player is secretly assigned a character (a celebrity, fictional character, superhero, anime character, Filipino celebrity, or historical figure) — held up for the **group** to see, not the player. Ask yes-or-no questions out loud to guess who you are.

- 6 categories. A "look away" screen stops the player peeking before their identity is shown to everyone else.
- **🤖 Automated:** a timer per player (120 s recommended). Turn it off for untimed rounds.
- Tap **Got It!** when guessed, or **Reveal & Skip** — the turn passes automatically either way.
</details>

<details>
<summary><strong>🔐 Password</strong> — 2–10 players · GM optional · scored</summary>

One player privately sees a secret word and gives one-word clues out loud; the rest shout guesses.

- 6 categories: Everyday Objects, Animals, Food, Movies & TV, Famous Places, School & Work.
- Set a clue limit (3–8) at setup — fewer clues used means more points when guessed.
- **🤖 Automated:** a timer per clue (15 s recommended), auto-advancing when it runs out. Turn it off for self-paced clue-giving.
- The clue-giver rotates automatically; running scores show at the end.
</details>

<details>
<summary><strong>🧠 Categories</strong> — 2–10 players</summary>

A random category appears and players take turns naming something that fits before the timer runs out.

- 16 built-in categories — Food, Animals, Countries, Movies, Anime, Philippine Culture, Professions, Sports, Colours, Superheroes, School Subjects, Brands, Cartoon Characters, Musical Instruments, Things You Find in a Kitchen, Fruits.
- A timer runs per turn (10 s recommended, can be switched off); the group self-referees with **Nailed It!** / **Stuck or Repeated**.
- **🎯 Elimination Mode** (default) knocks a stuck player out — last one standing wins. Turn it off for a casual round.
- **🔄 New Category** anytime, or **🏁 End Round** whenever the group's had enough.
</details>

<details>
<summary><strong>🟩 Word Grid</strong> — 2–10 players · scored</summary>

A Wordle-style pass-and-play round. The app secretly deals the word — nobody types one in.

- 6 categories: Animals, Food & Drink, Movies & Shows, Sports & Games, Nature & Places, Everyday Life.
- Each turn the app privately picks a word for whoever's holding the device, and the board resizes to fit it (no fixed 5-letter limit).
- Type a full-length guess and tap **Guess** — tiles flip to 🟩 right letter/right spot, 🟨 right letter/wrong spot, or ⬛ not in the word, with correct handling of repeated letters.
- Set a guess limit (4–8) — fewer guesses used means more points.
- **🤖 Automated:** a timer per guess (45 s recommended). Running out just skips that guess. Turn it off for a self-paced round.
- **🏳️ Give Up** ends your turn and reveals the word. Turn order rotates automatically; running scores show at the end.
</details>

<details>
<summary><strong>2️⃣ Two Truths and a Lie</strong> — 2–10 players · scored</summary>

Each turn, one player shares three statements — two true, one false — and the rest vote on the lie.

- **✍️ Write your own** (with a private lie-marker only you fill in), or **🎲 grab a ready-made prompt** from a bank of **15 fact-checked** "which is false" sets.
- Every other player votes in turn. The app reveals the lie, tallies who guessed right, and awards points (correct guessers +1; the storyteller +1 per person fooled).
- The storyteller role rotates every round.
- **Optional timer** (60 s recommended, **off by default**) covers discussion and voting.
</details>

<details>
<summary><strong>🤷 Would You Rather?</strong> — 2–10 players</summary>

Vote on funny, difficult, or extreme dilemmas.

- 6 categories: Funny, Difficult, Food, School, Random, Extreme.
- Each player votes A or B in turn; a results bar chart appears automatically once everyone's in.
- **Skip** any prompt that isn't for your group.
- **Optional timer** (30 s recommended, **off by default**) — a player who doesn't vote in time is skipped.
</details>

<details>
<summary><strong>👥 Most Likely To</strong> — 3–10 players</summary>

*"Most likely to become famous?"* — vote for someone in your own group.

- 6 categories: Friends, School, Funny, Random, Future, Work.
- Each player votes for a name from the roster in turn; results reveal automatically, ranked with medals for the top picks.
- **Optional timer** (30 s recommended, **off by default**) — a non-voter is skipped.
</details>

<details>
<summary><strong>🎭 Charades</strong> — 3–10 players · GM optional · scored</summary>

A player privately sees a word or phrase and acts it out — no talking — while the group shouts guesses.

- 7 categories: Movies, Animals, Actions, Professions, Food, Anime, Filipino Culture.
- **🤖 Automated:** a timer per round (60 s recommended). Turn it off for untimed acting.
- Tap **Correct!** the moment it's guessed (+1 for the actor) or **Skip** if time's tight — the turn rotates automatically either way.
</details>

---

## 🤖 Automated Game System

Every game is designed for **one shared device or screen** passed around a group. Turn order, hidden information, randomisation, and scoring are all tracked by the app itself, so control rotates naturally between players instead of resting on one permanent host.

Games that use a timer can run fully automatically **or** hand pacing to a person — chosen once at setup:

| Mode | What happens |
|---|---|
| 🤖 **Automated** *(default)* | Timers run on their own, and turns/reveals advance automatically when time's up. |
| 🎙️ **Game Master** | The timer defaults to **off** — one person controls pacing, revealing answers or advancing turns whenever the group is ready. |

> [!NOTE]
> Switching modes never changes *who* can tap what — every button stays available to every player. Game Master mode just turns the timer off by default. Quiz Night shows this as a two-button picker; every other timed game expresses the same idea through its **Timer** switch.

---

## ⏱️ Timers

One universal timer component is shared by every game. Each setup screen shows a **Timer** block with:

- The **recommended duration**, shown up front.
- **Preset chips** *and* a **custom** numeric input — pick a preset or type any duration from **5 to 600 seconds**.
- A **switch** to turn the timer off entirely.

During play it appears as a countdown badge with **Pause**, **Resume**, and **Reset** controls. It shifts to an amber "almost out" warning partway through, then red with a pulse in the final stretch (both stages scale with whatever duration you chose). When time runs out, the game advances on its own — next player, next clue, reveal the answer, open a steal, etc.

| Game | Timer unit | Recommended | On by default |
|---|---|:---:|:---:|
| 🕵️ Spy Word | discussion | 60 s | ✅ |
| ❓ Quiz Night | per question | 30 s | ✅ |
| 🤔 Who Am I? | per player | 120 s | ✅ |
| 🔐 Password | per clue | 15 s | ✅ |
| 🧠 Categories | per turn | 10 s | ✅ |
| 🟩 Word Grid | per guess | 45 s | ✅ |
| 🎭 Charades | per round | 60 s | ✅ |
| 🎵 Guess the Song | per clue reveal | 12 s | ✅ |
| 🖼️ Picture Guess | per sharpen step | 4 s | ✅ |
| 2️⃣ Two Truths and a Lie | discussion & voting | 60 s | ❌ *(opt-in)* |
| 🤷 Would You Rather? | per question | 30 s | ❌ *(opt-in)* |
| 👥 Most Likely To | voting | 30 s | ❌ *(opt-in)* |

The three voting games ship with the timer **off** since they've always self-paced — flip the switch at setup if your group wants the pressure.

---

## 🔊 Sound Effects

Sound is generated in the browser with the Web Audio API (a small synth engine in `web/src/shared/audio/sounds.js`) — there are **no audio files to download**.

| Cue | When it plays |
|---|---|
| **Timer start** | A short chirp when a countdown begins. |
| **Warning** | A distinct beep when the timer reaches **5 seconds left**. |
| **Buzzer** | A clear buzzer the moment the timer hits **zero**. *(Games where the timer just advances a clue — Guess the Song, Picture Guess — use a soft tone instead of the full buzzer and skip the warning beep.)* |
| **Correct / Incorrect / Steal / Bonus** | Quiz Night event feedback. |
| **Completion** | A short fanfare on a game's final results screen. |

- A **global mute toggle** and a **volume slider** live in the settings menu (bottom-right gear on every page). Both are saved to `localStorage` and restored on your next visit.
- Audio respects browser **autoplay rules** — the audio engine only starts after your **first tap or key press** on the page, so sounds never play before you've interacted.
- Volume sits at a reasonable level by default; the warning beep fires once per countdown and never repeats.

---

## 🌗 Light / Dark Mode

A site-wide theme toggle in the settings menu (the gear at the bottom-right of every page and the homepage).

- **Default:** follows your operating-system preference (`prefers-color-scheme`); if none is detected, it falls back to **light**.
- **Persistence:** your explicit choice is saved to `localStorage` (`br-theme`) and restored automatically on your next visit.
- **How it works:** a `data-theme="light" | "dark"` attribute on `<html>` retints the whole page through CSS design tokens; each game defines its own light-mode palette so its identity is preserved in both themes. A tiny inline script in every page applies the saved theme **before first paint**, so there's no flash.
- Switching themes does a brief, smooth cross-fade and respects `prefers-reduced-motion`.

---

## 🏆 Scoring and Tie-Breakers

Games that keep a score — **Quiz Night, Charades, Password, Word Grid, Two Truths and a Lie, Guess the Song, Picture Guess** — resolve their scoreboard automatically when the round ends, and check for a tie **before** showing results.

- **No tie?** The single leader goes straight to the results screen.
- **Tied for first?** Only the tied entrants move on to a **⚔️ Tie-Breaker** screen — everyone else's placement is already locked in.
- A challenge is drawn at random from six types and never immediately repeats:

| Challenge | How it resolves |
|---|---|
| ⚡ **Sudden Death Trivia** | A hard question is read aloud; reveal the answer, then tap who got it first. |
| 🎯 **Closest Guess** | A numeric estimation question with a known answer — each tied entrant guesses, closest wins. |
| ⏱️ **Fastest Answer** | A question plus a short countdown — tap whoever answered first. |
| 🔢 **Guess the Number** | A secret 1–100 number — each tied entrant guesses, closest wins. Self-resolving. |
| 🗂️ **Category Showdown** | A category is shown — entrants take turns naming something that fits; the group taps ✅/❌ each turn, last one standing wins. |
| 🎪 **Random Challenge** | A quick physical challenge (rock-paper-scissors, staring contest, thumb war) — tap the winner. |

- Still tied after a round? The field narrows to whoever's still tied and a **new** challenge starts automatically, looping until exactly one winner remains.
- **🤝 Accept a Shared Win** exits immediately with the tie left standing; the results screen notes it was accepted rather than broken.
- A tie-breaker **never touches game scores** — it only decides who gets the win highlighted.

---

## 📚 Themes and Content

Every game's content lives in its own `web/src/games/<game>/data.js` as plain `export const` objects — no build step, no CMS.

| Game | Content file | Shape |
|---|---|---|
| Spy Word | `spy/data.js` | `SPY_THEMES` — **57 themes** across 7 groups, each a list of `{ main, spy }` word pairs |
| Quiz Night | `quiz/data.js` | `QUIZ_THEMES` — **27 themes** across 4 groups; each category has point keys `100`–`500`, each a **pool of question objects**. `QUIZ_BONUS_EVENTS` lists the bonus-tile events. **1725 questions** total |
| Guess the Song | `guessthesong/data.js` | `GUESSTHESONG_CATEGORIES` — **14 genres**, each song `{ clues: [rebus, description, hint], answer, pointValue, youtubeId?, clipStart?, clipDuration? }` |
| Picture Guess | `pictureguess/data.js` | `PICTUREGUESS_CATEGORIES` — **8 categories**, each entry `{ emoji, answer, wikiTitle }` |
| Who Am I? / Password / Categories / Word Grid / Two Truths / Would You Rather? / Most Likely To / Charades | `<game>/data.js` | Simple flat category → item-list structures |
| Tie-breaker | `web/src/shared/tiebreakerData.js` | `TIEBREAKER_CHALLENGES` + the trivia/estimate/category/physical content banks |

**Spy Word groups:** Classics · Pop Culture · Music · Sports · Academic · Philippines · General Knowledge.
**Quiz Night groups:** Pop Culture · Music · Academic & Local · General Knowledge. Boards with more than 5 categories scroll sideways with an on-screen hint.

---

## 🛠️ Installation

You need **[Node.js](https://nodejs.org/)** (v20 recommended) and npm. The entire site is the app in `web/`.

```bash
git clone https://github.com/MarkDaniel0702/PARTY-PILOT.git
cd PARTY-PILOT/web
npm install
```

---

## ▶️ Running the Project

### Development server (hot reload)

```bash
cd web
npm run dev
```

Open the URL Vite prints (defaults to <http://localhost:5173>). The homepage is at `/`; each game is at its own page — `/spy.html`, `/quiz.html`, `/guessthesong.html`, and so on. Editing any game's `App.jsx` updates the browser instantly.

### Production preview

```bash
cd web
npm run build      # writes static output to web/dist/
npm run preview     # serves web/dist/ locally, exactly as deployed
```

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server with hot module reload |
| `npm run build` | Builds every page into `web/dist/` |
| `npm run preview` | Serves the built `web/dist/` locally |
| `npm run test` | Runs the [Vitest](https://vitest.dev) unit tests for the pure game engines (currently UNO's rules) |

> [!NOTE]
> No accounts or backend are required. An internet connection is only needed for Google Fonts (first load), Picture Guess's Wikipedia photo lookups, and Guess the Song's YouTube clips — all of which degrade gracefully if unavailable.

---

## 📁 Project Structure

```text
PARTY-PILOT/
├── web/                              The entire site — one Vite multi-page app
│   ├── index.html                    Homepage entry
│   ├── spy.html  quiz.html  whoami.html  password.html
│   ├── categories.html  wordgrid.html  guessthesong.html
│   ├── pictureguess.html  twotruths.html  wouldurather.html
│   ├── mostlikely.html  charades.html
│   │                                 One HTML entry per game; each mounts its own React root
│   ├── vite.config.js                Auto-discovers every top-level *.html as a build entry
│   ├── package.json
│   └── src/
│       ├── App.jsx  gameData.js  main.jsx  style.css
│       │                             Homepage: header, game groups, card grid
│       ├── shared/                   The library every game is built from
│       │   ├── theme.css             Base design tokens + light-mode overrides
│       │   ├── tiebreakerData.js     Tie-breaker challenge content
│       │   ├── audio/                sounds.js (Web Audio synth engine), useSound.js
│       │   ├── theme/                themeStore.js, useTheme.js  (light/dark)
│       │   ├── components/           Screen, GameShell, SettingsMenu, Button, Roster,
│       │   │                         TeamSetup, TimerSetup, GameTimer, PassCard, RevealCard,
│       │   │                         GroupedPicker, Voting, ResultsList, TieBreakerScreen,
│       │   │                         Scoreboard, StatementCard, CompletionChime (+ .module.css)
│       │   ├── hooks/                useCountdown, useGameTimer, useRoster, useTeams,
│       │   │                         useTimerSetup, useUsedIndices, usePersistedUsedIndices
│       │   └── utils/                random.js, resolveStanding.js
│       └── games/
│           └── <game>/               One self-contained folder per game
│               ├── App.jsx           The game's screens and logic
│               ├── main.jsx          React entry point for that page
│               ├── data.js           That game's themes / questions / content
│               ├── palette.css       That game's colour-token overrides (light + dark)
│               └── <game>.module.css Styling bespoke to that one game (optional)
├── .github/workflows/deploy.yml      Builds web/ and deploys web/dist/ to GitHub Pages
└── README.md
```

> `web/dist/` and `web/node_modules/` are **not** committed — they're generated by `npm install` / `npm run build`.

### What `web/src/shared/` gives you

| Piece | What it does |
|---|---|
| `theme.css` + per-game `palette.css` | The design-token contract each game overrides — including its `:root[data-theme="light"]` palette |
| `audio/sounds.js` + `useSound` | The synth sound engine and its React binding (mute, volume, `playSound`) |
| `theme/themeStore.js` + `useTheme` | The `data-theme` store — system preference, `localStorage`, live toggle |
| `hooks/useCountdown` + `useGameTimer` | The low-level countdown and the in-game warn/urgent/expire staging + timer sounds built on it |
| `components/TimerSetup` + `GameTimer` | The pre-game timer widget and the in-game countdown HUD |
| `components/SettingsMenu` | The floating gear with the theme toggle and sound controls, rendered on every page |
| `components/GroupedPicker` | The grouped card picker for themes / categories / prompt sets |
| `hooks/useRoster` + `components/Roster` | A named-player list with a +/- stepper |
| `hooks/useTeams` + `components/TeamSetup` | An optional add/remove/rename team scoreboard |
| `hooks/usePersistedUsedIndices` | The `localStorage`-backed "don't repeat until exhausted" picker behind Quiz Night's question pools |
| `components/TieBreakerScreen` + `utils/resolveStanding` | The universal tie-breaker — detects a top-score tie, plays it out, reports the result |

---

## ➕ Adding New Games and Content

### A new game

Every game is its own `web/src/games/<game>/` folder plus one `web/<game>.html` — a new game never requires touching an existing one.

1. **Copy** the folder of the closest existing game (e.g. `charades/` for a turn-based reveal game, `wouldurather/` for a voting game) to `web/src/games/<your-game>/`, and copy its `web/<game>.html` to `web/<your-game>.html`.
2. **Recolour** it: `palette.css` only needs the shared colour tokens (`--ink`, `--panel`, `--paper`, `--accent`, …) redeclared with your palette, plus an optional `<game>.module.css` for bespoke touches. Your `App.jsx` reaches for `web/src/shared/` components/hooks rather than rebuilding them.
3. **Add content** to your folder's `data.js` as plain `export const` objects/arrays.
4. **Add a homepage card** to `web/src/gameData.js`'s `GAME_GROUPS` array (copy an entry, pick a [`lucide-react`](https://lucide.dev) icon, give it a unique `accent` colour). Vite auto-discovers your new `<game>.html` — no config to edit.

> [!IMPORTANT]
> Keep every game host-optional: let the app manage turns/timers/randomisation, and only add a Game Master toggle if a timer would otherwise force pacing on the group.

### New content for an existing game

<details>
<summary><strong>🕵️ A new Spy Word theme</strong></summary>

In `web/src/games/spy/data.js`, add to `SPY_THEMES`:

```js
"Your Theme Name": [
  { main: "Word A", spy: "Word B" },
  { main: "Word C", spy: "Word D" }
  // one pair is picked at random each round — aim for 5–6+
],
```

Then add an icon in `SPY_THEME_ICONS` and, optionally, list it in `SPY_THEME_GROUPS`. **Good pairs are specific** — closely related but distinct enough that an alert group can eventually spot the Spy.

</details>

<details>
<summary><strong>❓ New Quiz Night questions</strong></summary>

In `web/src/games/quiz/data.js`, every theme needs an `icon` and `categories`, and every category needs all five point levels — each a **pool (array)** of questions:

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
        200: [ /* 3 slightly harder, same shape */ ],
        300: [ /* 3 moderate */ ],
        400: [ /* 3 difficult */ ],
        500: [ /* 3 very difficult */ ]
      }
    }
  ]
}
```

Add the theme name to `QUIZ_THEME_GROUPS`.

> [!IMPORTANT]
> Every category must have exactly the five keys `100`–`500`, each an **array** of `{ q, a }` objects, or that tile won't render. Three per pool is the convention.

</details>

<details>
<summary><strong>🎵 New songs (with a YouTube clip)</strong></summary>

In `web/src/games/guessthesong/data.js`, add to any genre in `GUESSTHESONG_CATEGORIES`:

```js
{
  clues: ["🎯🎶❓", "A one-sentence description, no title.", "Artist: Someone (Year)"],
  answer: "Song Title — Artist",
  pointValue: 200,               // 100 = instantly recognisable, 500 = deep cut
  youtubeId: "dQw4w9WgXcQ",       // optional — the video ID from the YouTube URL
  clipStart: 35,                  // optional — where the audio snippet begins (seconds)
  clipDuration: 20                // optional — how long the snippet plays (seconds)
}
```

Leave out `youtubeId` and the song plays on clues alone. Add an icon for a brand-new genre in `GUESSTHESONG_CATEGORY_ICONS`.

</details>

<details>
<summary><strong>🖼️ New Picture Guess questions</strong></summary>

In `web/src/games/pictureguess/data.js`, add to any category:

```js
{ emoji: "🎯", answer: "Your Answer", wikiTitle: "Exact Wikipedia Article Title" }
```

- `wikiTitle` must match a real article that has an infobox / lead photo — check `https://en.wikipedia.org/wiki/<Your_Title>` first.
- `emoji` is the category-card icon **and** the offline/failure fallback.
- Add an icon for a new category in `PICTUREGUESS_CATEGORY_ICONS`.

If a `wikiTitle` doesn't resolve, that question simply falls back to its `emoji` at play time instead of erroring.

</details>

<details>
<summary><strong>🎲 Content for any other game</strong></summary>

The other games use simple flat `data.js` files — a category name mapped to an array of items. Open the matching `web/src/games/<game>/data.js` and copy an existing entry.

</details>

---

## 🚀 Deployment

**Live site:** <https://markdaniel0702.github.io/PARTY-PILOT/>

The site is deployed on **GitHub Pages** via **GitHub Actions** — free, HTTPS by default, no backend to provision. The workflow at `.github/workflows/deploy.yml` builds `web/` and publishes `web/dist/` on every push to `main`.

| Setting | Value |
|---|---|
| Source | **GitHub Actions** (Settings → Pages) |
| Workflow | `.github/workflows/deploy.yml` |
| Trigger | Push to `main`, or **Actions → Deploy to GitHub Pages → Run workflow** |
| Build | `npm ci && npm run build` inside `web/` |
| Publish dir | `web/dist/` |
| Env vars | None |

**What the workflow does:** installs `web/`'s dependencies, runs the Vite build (outputting the homepage + all 15 games to `web/dist/`), marks it non-Jekyll, then uploads and deploys `web/dist/` with `actions/deploy-pages`.

**Redeploying:**

```bash
git add .
git commit -m "Your change"
git push origin main
```

The live site updates a minute or two after the workflow finishes — progress is under the repo's **Actions** tab.

> [!NOTE]
> One-time setup: **Settings → Pages → Source** must be set to **GitHub Actions** (not "Deploy from a branch").

---

## 🐛 Troubleshooting

<details>
<summary><strong>A theme/category grid looks empty, or the page is blank</strong></summary>

Open the browser dev console (F12) and look for a red error — almost always a typo in a game's `data.js` (a missing comma or bracket stops the whole file loading; `npm run dev` / `npm run build` fail loudly with the same error). Compare against the existing entries.
</details>

<details>
<summary><strong>A new Quiz Night category doesn't show all its tiles</strong></summary>

Every category needs all five point keys (`100`, `200`, `300`, `400`, `500`), each an **array** of `{ q, a }` objects. A missing key means that tile won't render.
</details>

<details>
<summary><strong>A Picture Guess round only shows the emoji, never a photo</strong></summary>

Either the group is offline (the Wikipedia fetch needs internet) or that question's `wikiTitle` doesn't match a real article with a lead image. The round still blurs/sharpens/scores exactly the same — the emoji fallback is by design.
</details>

<details>
<summary><strong>A Guess the Song clip won't play</strong></summary>

The clip needs the YouTube IFrame API, which some networks block. The three text clues still work on their own, and revealing the answer still unlocks the video link when it's reachable.
</details>

<details>
<summary><strong>There's no sound</strong></summary>

Browsers block audio until you interact with the page — the first tap or key press unlocks it, so the very first cue of a session may be silent. Also check the volume slider and mute toggle in the settings menu (bottom-right gear).
</details>

<details>
<summary><strong>My theme choice isn't remembered</strong></summary>

The choice is stored in `localStorage`. Private/incognito windows and browsers set to clear site data on close won't keep it between sessions.
</details>

<details>
<summary><strong>My phone won't connect to a QR pairing session</strong></summary>

A few things to check, in order: the phone needs to be on the same Wi-Fi as the main screen (mobile data won't reach a device sitting on a home network); some corporate or public Wi-Fi networks block the peer-to-peer connection outright; and the pairing card's **Retry** button gets a fresh code if the first one failed to register. If phones still won't connect, every game plays exactly the same without them — tap **Play without phones** and use the on-screen buttons instead.
</details>

<details>
<summary><strong>A timer keeps interrupting the group</strong></summary>

Every setup screen has the same **Timer** block — flip its switch off and no countdown runs. On Quiz Night, choosing **🎙️ Game Master** does the same in one tap.
</details>

<details>
<summary><strong>The game jumped to an "It's a Tie!" screen</strong></summary>

That's the universal tie-breaker — it only appears when two or more entrants finish with the same top score, and only the tied entrants play it. Tap **🤝 Accept a Shared Win** anytime to skip it.
</details>

<details>
<summary><strong>The live site didn't update after a push, or shows a 404</strong></summary>

Check the repo's **Actions** tab — if "Deploy to GitHub Pages" failed, the old build stays live. The most common cause is **Settings → Pages → Source** still set to "Deploy from a branch" instead of **GitHub Actions**.
</details>

---

## 📄 Project Notes

B-Rotation is a personal, non-commercial party-game project. There is no formal open-source licence file in the repository.

- **Trivia, prompts, and word lists** in `web/src/games/*/data.js` are hand-authored for the game.
- **Picture Guess photos** are fetched at runtime from **Wikipedia / Wikimedia Commons** and displayed the way Wikipedia displays them (public-domain or CC BY-SA media; brand logos on their own articles).
- **Guess the Song clips** are standard **YouTube embeds** — playback happens on YouTube's player, and nothing is downloaded or re-hosted.
- Fonts are loaded from **Google Fonts**; icons are from **[lucide-react](https://lucide.dev)** (ISC licensed).

If you fork or reuse this project, keep those third-party sources in mind.
