# Drag Queen Bingo

A glitzy, browser-based bingo caller for drag queen bingo night. Draws numbers on a classic B-I-N-G-O board, plays background music and a chime for each call, fires confetti, and uses Claude to generate a campy one-liner for every number called.

## Getting Started

Set your Anthropic API key in `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Then run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start a game.

## How it works

- Click **Start Game** to shuffle a fresh pool of 1–75 and draw the first number; **Next Number** draws from what's left until all 75 have been called.
- Each call highlights the number on the board, plays a chime, fires confetti from the ball, and requests a sassy one-liner from Claude (`app/api/call-number/route.ts`) based on the letter/number.
- The sidebar tracks call count, remaining numbers, and recent call history, and has a mute toggle for the background music.
- **Reset Board** clears the game state back to the start screen.

## Tech stack

- Next.js 16 (App Router) + React 19 + TypeScript
- MUI for UI components/theming (dark mode only), Emotion for keyframe animations
- `canvas-confetti` for the confetti burst
- Anthropic SDK (`claude-haiku-4-5`) for generated commentary
