import {
  Fingerprint, Eye, HelpCircle, Lock, Brain, Grid3x3,
  Tv, Music, Image,
  PartyPopper, ListChecks, GitFork, Users, Drama,
  Spade, Layers,
  Bot, Mic, Smartphone
} from 'lucide-react';

// Same content as the original static index.html — only the emoji glyphs
// became icon components. Card order/grouping/copy is unchanged.
export const GAME_GROUPS = [
  {
    label: 'Word & Deduction',
    icon: Fingerprint,
    games: [
      {
        href: 'spy.html',
        icon: Eye,
        title: 'Spy Word',
        desc: "Everyone gets the secret word. One player doesn't. Find the spy before they blend in.",
        accent: '#ff3d81',
        meta: [
          { icon: Users, label: '3–10 players' },
          { icon: Bot, label: 'Automated', variant: 'auto' }
        ]
      },
      {
        href: 'whoami.html',
        icon: HelpCircle,
        title: 'Who Am I?',
        desc: 'A secret identity is held up for the group to see — not you. Ask yes-or-no questions to guess who you are.',
        accent: '#ffb020',
        meta: [
          { icon: Users, label: '3–10 players' },
          { icon: Bot, label: 'Automated', variant: 'auto' },
          { icon: Mic, label: 'GM optional', variant: 'gm' }
        ]
      },
      {
        href: 'password.html',
        icon: Lock,
        title: 'Password',
        desc: 'Give one-word clues to help the group guess your secret word — fewer clues, more points.',
        accent: '#4d8cff',
        meta: [
          { icon: Users, label: '2–10 players' },
          { icon: Bot, label: 'Automated', variant: 'auto' },
          { icon: Mic, label: 'GM optional', variant: 'gm' }
        ]
      },
      {
        href: 'categories.html',
        icon: Brain,
        title: 'Categories',
        desc: 'A random category appears — name something that fits before the timer runs out.',
        accent: '#17d4b8',
        meta: [
          { icon: Users, label: '2–10 players' },
          { icon: Bot, label: 'Automated', variant: 'auto' }
        ]
      },
      {
        href: 'wordgrid.html',
        icon: Grid3x3,
        title: 'Word Grid',
        desc: 'The app secretly picks a word — guess it letter by letter before your tries run out, Wordle-style.',
        accent: '#39d98a',
        meta: [
          { icon: Users, label: '2–10 players' },
          { icon: Bot, label: 'Automated', variant: 'auto' }
        ]
      }
    ]
  },
  {
    label: 'Trivia & Knowledge',
    icon: Tv,
    games: [
      {
        href: 'quiz.html',
        icon: Tv,
        title: 'Quiz Night',
        desc: 'Pick a category, pick a point value, race for the buzzer glory and bragging rights.',
        accent: '#ffcb3c',
        meta: [
          { icon: Users, label: '1–6 teams' },
          { icon: Bot, label: 'Automated', variant: 'auto' },
          { icon: Mic, label: 'GM optional', variant: 'gm' }
        ]
      },
      {
        href: 'guessthesong.html',
        icon: Music,
        title: 'Guess the Song',
        desc: 'An emoji rebus, then clues, reveal a song bit by bit — shout it before your friends do.',
        accent: '#ff3d9a',
        meta: [
          { icon: Users, label: 'Any group' },
          { icon: Bot, label: 'Automated', variant: 'auto' }
        ]
      },
      {
        href: 'pictureguess.html',
        icon: Image,
        title: 'Picture Guess',
        desc: 'A blurry emoji picture sharpens into focus on its own — guess it as fast as you can.',
        accent: '#22c5ff',
        meta: [
          { icon: Users, label: 'Any group' },
          { icon: Bot, label: 'Automated', variant: 'auto' }
        ]
      }
    ]
  },
  {
    label: 'Party & Voting',
    icon: PartyPopper,
    games: [
      {
        href: 'twotruths.html',
        icon: ListChecks,
        title: 'Two Truths and a Lie',
        desc: 'Two true statements, one lie. Write your own or grab a ready-made prompt — can the group spot it?',
        accent: '#2fd67f',
        meta: [
          { icon: Users, label: '2–10 players' },
          { icon: Bot, label: 'Automated', variant: 'auto' }
        ]
      },
      {
        href: 'wouldurather.html',
        icon: GitFork,
        title: 'Would You Rather?',
        desc: 'Funny, difficult, or extreme dilemmas — everyone votes A or B, results reveal automatically.',
        accent: '#ff5c8a',
        meta: [
          { icon: Users, label: '2–10 players' },
          { icon: Bot, label: 'Automated', variant: 'auto' }
        ]
      },
      {
        href: 'mostlikely.html',
        icon: Users,
        title: 'Most Likely To',
        desc: '"Most likely to become famous?" — vote for someone in the group and see who gets called out.',
        accent: '#c65cff',
        meta: [
          { icon: Users, label: '3–10 players' },
          { icon: Bot, label: 'Automated', variant: 'auto' }
        ]
      },
      {
        href: 'charades.html',
        icon: Drama,
        title: 'Charades',
        desc: "Act out a secret word or phrase — no talking allowed. Beat the clock before it's the next player's turn.",
        accent: '#ff4fa3',
        meta: [
          { icon: Users, label: '3–10 players' },
          { icon: Bot, label: 'Automated', variant: 'auto' },
          { icon: Mic, label: 'GM optional', variant: 'gm' }
        ]
      }
    ]
  },
  {
    label: 'Card Games',
    icon: Spade,
    games: [
      {
        href: 'uno.html',
        icon: Layers,
        title: 'UNO',
        desc: 'Match the colour or the number and dump your hand first. Play from your own phone, or pass one device around.',
        accent: '#e0293b',
        meta: [
          { icon: Users, label: '2–8 players' },
          { icon: Smartphone, label: 'Phones optional', variant: 'auto' }
        ]
      }
    ]
  }
];
