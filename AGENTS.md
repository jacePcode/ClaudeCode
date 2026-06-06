# AGENTS.md — Shared Rules for All Agents

This file applies to every AI agent that works in this project (Claude, ChatGPT/Codex, Gemini, etc.).

## Ground rules

1. **Treat project files as the source of truth**, not chat history.
2. **Read before writing.** Check `ACTIVE_TASK.md` and `HANDOFF.md` before touching code.
3. **Keep changes small.** Prefer focused commits over sweeping rewrites.
4. **Do not overwrite another agent's work** without noting why in `HANDOFF.md`.
5. **Write down what matters.** Capture discoveries, pivots, and blockers — not every command.
6. **Update handoff files before stopping.** The next agent depends on them.

## Memory files

| File | Purpose |
|------|---------|
| `.agent/ACTIVE_TASK.md` | Current goal — what we are building right now |
| `.agent/HANDOFF.md` | Baton from the last agent: state, files touched, next step |
| `.agent/DECISIONS.md` | Durable decisions — do not re-debate these |
| `.agent/LOG.md` | Tiny milestone history |
| `.agent/HANDOFF_TEMPLATE.md` | Template for writing handoff updates |

## What to write down

**Write it down if** the next agent would waste 10+ minutes rediscovering it:
- A surprising discovery in the codebase
- A pivot in the implementation plan
- A rejected approach that might be tried again
- A blocker and what has already been checked
- An assumption that shaped the current solution
- What was verified before stopping

**Do not write down:**
- Every command that ran
- Raw logs (unless short and critical)
- Long reasoning transcripts
- Dead ends that no longer matter

## Project-specific conventions

- Source code lives in `src/`
- Components go in `src/components/`
- State (Zustand stores) goes in `src/store/`
- Stack: React 19, TypeScript, Vite, Tailwind v4, Zustand, Lucide React
