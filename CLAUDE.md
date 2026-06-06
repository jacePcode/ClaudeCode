# CLAUDE.md

This is Claude's entry point into the shared multi-agent workspace.

## Before doing any work

1. Read `AGENTS.md` — shared rules for all agents.
2. Read `.agent/ACTIVE_TASK.md` — current goal.
3. Read `.agent/HANDOFF.md` — where the last agent left off.
4. Skim `.agent/DECISIONS.md` only if you need background on prior choices.

Then report:
- What the current goal is
- What the last handoff says
- Which files or directories you plan to inspect first

## While working

- Keep changes small and easy to understand.
- Do not overwrite user or another agent's work without asking.
- Write down discoveries, pivots, rejected approaches, blockers, and assumptions only when another agent would waste time rediscovering them.
- Do not write down every command or raw transcript.

## Before stopping or handing off

1. Update `.agent/HANDOFF.md` (what changed, what was verified, what remains, files touched, next recommended step).
2. Update `.agent/ACTIVE_TASK.md` if the goal changed.
3. Add to `.agent/DECISIONS.md` only for durable project decisions.

## Project stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Zustand for state
- Lucide React for icons
- Source lives in `src/`
- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
