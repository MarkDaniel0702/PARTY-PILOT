// Direct port of js/data-tiebreaker.js — content unchanged, just exported
// as ES module bindings instead of implicit globals.

export const TIEBREAKER_TRIVIA = [
  { q: "What is the capital of Australia?", a: "Canberra" },
  { q: "How many continents are there on Earth?", a: "Seven" },
  { q: "What is the chemical symbol for gold?", a: "Au" },
  { q: "Who wrote the play 'Romeo and Juliet'?", a: "William Shakespeare" },
  { q: "What is the largest planet in our solar system?", a: "Jupiter" },
  { q: "In what year did the Titanic sink?", a: "1912" },
  { q: "What is the smallest prime number?", a: "Two" },
  { q: "Which ocean is the largest in the world?", a: "The Pacific Ocean" },
  { q: "What is the national language of Brazil?", a: "Portuguese" },
  { q: "How many strings does a standard guitar have?", a: "Six" },
  { q: "What is the tallest animal in the world?", a: "The giraffe" },
  { q: "Which planet is known as the Red Planet?", a: "Mars" }
];

export const TIEBREAKER_ESTIMATES = [
  { q: "How many bones are in the adult human body?", a: 206 },
  { q: "What is the boiling point of water in Celsius, at sea level?", a: 100 },
  { q: "How many countries are in Africa?", a: 54 },
  { q: "What year did the first iPhone release?", a: 2007 },
  { q: "How many keys are on a standard piano?", a: 88 },
  { q: "What is the average human body temperature in Fahrenheit?", a: 98.6 },
  { q: "How many moons does Jupiter have, as officially confirmed in the mid-2020s?", a: 95 },
  { q: "How many minutes are in a full day?", a: 1440 },
  { q: "How tall is the Eiffel Tower in meters?", a: 330 },
  { q: "How many players are on the field for one soccer team, including the goalkeeper?", a: 11 },
  { q: "How many time zones does Russia span?", a: 11 },
  { q: "How many bones does a shark's skeleton have (it's made entirely of cartilage)?", a: 0 }
];

export const TIEBREAKER_CATEGORIES = [
  "Animals", "Movies", "Countries", "Foods", "Sports", "Colors",
  "Cartoon Characters", "School Subjects", "Superheroes", "Fruits",
  "Board Games", "Musical Instruments"
];

export const TIEBREAKER_PHYSICAL = [
  "Rock-Paper-Scissors — best of 3 wins.",
  "Staring Contest — first to blink or laugh loses.",
  "Thumb War — best of 3 pins wins.",
  "Arm Wrestle — first shoulder to the table loses.",
  "Air Guitar Solo — loudest cheer from the group wins.",
  "One-Leg Balance — last one standing wins."
];

export const TIEBREAKER_CHALLENGES = [
  { type: "trivia", icon: "⚡", name: "Sudden Death Trivia", instructions: "Read the question out loud. Whoever answers correctly first wins — tap their name." },
  { type: "estimate", icon: "🎯", name: "Closest Guess", instructions: "Read the question out loud. Everyone tied enters a number — closest to the real answer wins." },
  { type: "fastest", icon: "⏱️", name: "Fastest Answer", instructions: "Read the question out loud and start the timer. Whoever answers correctly first wins — tap their name." },
  { type: "guess-number", icon: "🔢", name: "Guess the Number", instructions: "The app picked a secret number from 1–100. Everyone tied enters a guess — closest wins." },
  { type: "showdown", icon: "🗂️", name: "Category Showdown", instructions: "Taking turns, each tied player names something in the category out loud. Stuck or repeated? They're out — last one standing wins." },
  { type: "physical", icon: "🎪", name: "Random Challenge", instructions: "Settle it the old-fashioned way." }
];
