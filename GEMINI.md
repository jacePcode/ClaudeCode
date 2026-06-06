# GEMINI.md

This is Gemini's entry point into the shared multi-agent workspace.

## Before doing any work

1. Read `AGENTS.md` — shared rules for all agents.
2. Read `.agent/ACTIVE_TASK.md` — current goal.
3. Read `.agent/HANDOFF.md` — where the last agent left off.
4. Skim `.agent/DECISIONS.md` only if you need background on prior choices.

## While working

Follow the rules in `AGENTS.md`.

## Before stopping or handing off

Update `.agent/HANDOFF.md`, `.agent/ACTIVE_TASK.md` (if goal changed), and `.agent/DECISIONS.md` (durable decisions only).

## Project stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Zustand for state
- Lucide React for icons
- `npm run dev` — dev server
- `npm run build` — production build
- `npm run lint` — linter
