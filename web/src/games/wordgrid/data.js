// Direct port of js/data-wordgrid.js — content unchanged.
// Word Grid secret-word bank, grouped by category. Letters only (no spaces
// or punctuation) so every word tiles cleanly onto the guess board.
export const WORDGRID_CATEGORIES = {
  "Animals": [
    "TIGER", "OTTER", "EAGLE", "PANDA", "SHARK",
    "RABBIT", "DOLPHIN", "CAMEL", "GECKO", "ZEBRA",
    "FALCON", "BEAVER"
  ],
  "Food & Drink": [
    "MANGO", "BACON", "PASTA", "BREAD", "GRAPE",
    "COFFEE", "BURGER", "COOKIE", "NOODLE", "PEPPER",
    "WAFFLE", "CANDY"
  ],
  "Movies & Shows": [
    "JOKER", "ALIEN", "MATRIX", "AVATAR", "TITANIC",
    "FROZEN", "SHREK", "ROCKY", "GREASE", "GLADIATOR",
    "MOANA", "COCO"
  ],
  "Sports & Games": [
    "CHESS", "TENNIS", "BOXING", "RUGBY", "DARTS",
    "HOCKEY", "SOCCER", "ARCHERY", "BOWLING", "CRICKET",
    "POKER", "GOLF"
  ],
  "Nature & Places": [
    "OCEAN", "DESERT", "GLACIER", "VOLCANO", "CANYON",
    "JUNGLE", "ISLAND", "FOREST", "TUNDRA", "VALLEY",
    "MEADOW", "REEF"
  ],
  "Everyday Life": [
    "PILLOW", "LADDER", "WALLET", "MIRROR", "CANDLE",
    "BLANKET", "UMBRELLA", "KEYBOARD", "BACKPACK", "CALENDAR",
    "SCISSORS", "PUZZLE"
  ]
};

export const WORDGRID_CATEGORY_ICONS = {
  "Animals": "🦁",
  "Food & Drink": "🍔",
  "Movies & Shows": "🎬",
  "Sports & Games": "🏀",
  "Nature & Places": "🏔️",
  "Everyday Life": "🧸"
};
