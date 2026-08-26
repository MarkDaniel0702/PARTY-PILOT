// Direct port of js/data-twotruths.js — content unchanged.
// Ready-made "Two Truths and a Lie" prompt sets, for groups who'd rather not
// write their own. Each set has 3 statements; `lieIndex` marks which one is
// false (0-based). Every set is fact-checked: exactly one statement is false.
export const TTL_PROMPT_SETS = [
  { statements: ["Honey never spoils if stored properly.", "Bananas are botanically classified as berries.", "The Great Wall of China is visible from space with the naked eye."], lieIndex: 2 },
  { statements: ["Octopuses have three hearts.", "A group of flamingos is called a 'flamboyance'.", "Goldfish only have a memory span of three seconds."], lieIndex: 2 },
  { statements: ["The Eiffel Tower grows about 15 cm taller in summer heat.", "The Sahara Desert used to be a green, fertile region thousands of years ago.", "Mount Everest is the tallest mountain on Earth measured from base to peak."], lieIndex: 2 },
  { statements: ["Sharks existed before trees.", "A day on Venus is longer than a year on Venus.", "The human body has about 10 times more bacterial cells than human cells."], lieIndex: 2 },
  { statements: ["A shrimp's heart is located in its head.", "A crocodile cannot stick its tongue out.", "A group of owls is called a 'pack'."], lieIndex: 2 },
  { statements: ["Wombat poop is cube-shaped.", "A bolt of lightning is hotter than the surface of the sun.", "Bats are completely blind."], lieIndex: 2 },
  { statements: ["The unicorn is the national animal of Scotland.", "Napoleon Bonaparte was unusually short for his era, standing under 5 feet tall.", "The shortest war in recorded history lasted under 40 minutes."], lieIndex: 1 },
  { statements: ["Venus is the hottest planet in the solar system, hotter than Mercury.", "A 'jiffy' is an actual unit of time (about 1/100th of a second).", "Humans only use 10% of their brains."], lieIndex: 2 },
  { statements: ["Old glass windows are thicker at the bottom because glass slowly flows like a liquid over centuries.", "Stars you see twinkling in the sky are typically much larger than our sun.", "It would take over 30 years to count to one billion out loud, one number per second."], lieIndex: 0 },
  { statements: ["Cows have best friends and get stressed when separated from them.", "Chameleons change color mainly to camouflage with their surroundings.", "A snail can have up to 14,000 teeth."], lieIndex: 1 },
  { statements: ["A single cloud can weigh more than a million pounds.", "It is illegal to own just one guinea pig in Switzerland — they must be kept in pairs.", "The average person swallows eight spiders a year in their sleep."], lieIndex: 2 },
  { statements: ["Dropping a penny off the Empire State Building could kill a person on the street below.", "There are more possible iterations of a chess game than atoms in the known universe.", "A blue whale's heart is roughly the size of a small car."], lieIndex: 0 },
  { statements: ["Antarctica is technically the world's largest desert by area.", "The Amazon Rainforest produces most of the world's oxygen supply.", "There is a species of jellyfish considered biologically immortal."], lieIndex: 1 },
  { statements: ["Koalas have fingerprints so similar to humans that they can confuse crime scene investigators.", "A day on Mercury is longer than its year.", "Polar bears are white-furred with white skin underneath their fur."], lieIndex: 2 },
  { statements: ["The world's shortest commercial flight lasts under 2 minutes, between two Scottish islands.", "Mount Fuji is the tallest mountain in Japan and also the tallest mountain in all of Asia.", "A 'jiffy' is technically a real, defined unit of time."], lieIndex: 1 }
];
