// Words chosen to be drawable rather than merely nameable: concrete nouns and
// simple actions, nothing abstract. Mixed easy/harder within each category so
// a round is never uniformly trivial.

export const DRAWGUESS_CATEGORIES = {
  "Everyday Objects": [
    "umbrella", "toothbrush", "ladder", "kettle", "backpack", "scissors", "candle",
    "wristwatch", "envelope", "shopping cart", "hairbrush", "stapler", "lightbulb",
    "sunglasses", "key", "mirror", "bucket", "paperclip", "wallet", "alarm clock"
  ],
  Animals: [
    "elephant", "penguin", "octopus", "giraffe", "snail", "flamingo", "hedgehog",
    "crocodile", "butterfly", "kangaroo", "owl", "jellyfish", "camel", "squirrel",
    "shark", "peacock", "tortoise", "bat", "seahorse", "raccoon"
  ],
  "Food & Drink": [
    "pizza", "banana", "cupcake", "sushi", "popcorn", "pineapple", "hot dog",
    "ice cream", "watermelon", "spaghetti", "pancakes", "taco", "doughnut",
    "coconut", "milkshake", "pretzel", "corn on the cob", "fried egg", "lollipop", "burger"
  ],
  "Places & Buildings": [
    "lighthouse", "castle", "windmill", "igloo", "bridge", "pyramid", "treehouse",
    "skyscraper", "tent", "church", "barn", "volcano", "island", "waterfall",
    "train station", "swimming pool", "playground", "cave", "farm", "beach"
  ],
  "Actions & Sports": [
    "surfing", "juggling", "sleeping", "sneezing", "fishing", "skateboarding",
    "climbing", "dancing", "boxing", "diving", "cycling", "yawning", "painting",
    "running", "bowling", "skiing", "swimming", "jumping", "cooking", "reading"
  ],
  "Movies & Fantasy": [
    "dragon", "wizard", "robot", "pirate ship", "spaceship", "unicorn", "ghost",
    "superhero", "mermaid", "time machine", "vampire", "alien", "knight",
    "treasure chest", "magic wand", "haunted house", "dinosaur", "genie", "crown", "sword"
  ]
};

export const DRAWGUESS_CATEGORY_ICONS = {
  "Everyday Objects": "🧦",
  Animals: "🐙",
  "Food & Drink": "🍕",
  "Places & Buildings": "🏰",
  "Actions & Sports": "🏄",
  "Movies & Fantasy": "🐉"
};

// A group's own words, entered at setup, appear under this name.
export const CUSTOM_CATEGORY = "Your Words";
export const MIN_CUSTOM_WORDS = 5;

// Accepts commas or newlines, trims, drops blanks and duplicates.
export function parseCustomWords(text) {
  const seen = new Set();
  return String(text || "")
    .split(/[\n,]+/)
    .map((w) => w.trim().replace(/\s+/g, " "))
    .filter((w) => {
      if (w.length < 2 || w.length > 40) return false;
      const key = w.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
