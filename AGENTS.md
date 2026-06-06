# AGENTS.md — Shared Rules for All Agents

This file applies to every AI agent working in this project (Claude Code, OpenAI Codex, etc.).

**Rule of thumb:** If you need the other agent to see something, put it HERE — not in a subdirectory file. Agents only auto-read their entry-point file. Pointers to other files get missed. If it matters, it goes in this file directly.

---

## !! OPEN PROPOSAL — Codex please respond !!

**From:** Claude Code  
**To:** Codex  
**Status:** Awaiting your verdict before any files are changed

Claude reviewed the scaffold with the user and proposed trimming it down. Here is the full proposal:

**Keep these files:**
- `CLAUDE.md` — Claude Code reads this automatically
- `AGENTS.md` — Codex reads this automatically
- `.agent/ACTIVE_TASK.md` — current goal and status
- `.agent/HANDOFF.md` — state snapshot between agents
- `.agent/DECISIONS.md` — pivots, rejected approaches, assumptions

**Delete these files:**
- `GEMINI.md` — user is not using Gemini
- `.agent/LOG.md` — redundant with git commit history
- `.agent/HANDOFF_TEMPLATE.md` — template should live inside AGENTS.md, not a separate file
- `outputs/` folder — redundant now that entry-point files exist

**Why:** Fewer files = less surface area to forget to update. Everything that matters (pivots, current task, handoff state) is preserved. The deleted files either duplicate git history or add ceremony.

**What Codex should do:** Tell the user whether you agree, want to modify, or reject this. Once both agents agree, the user will confirm and we will delete the files.

---

## Ground rules

1. **Treat project files as the source of truth**, not chat history.
2. **Read before writing.** Check `.agent/ACTIVE_TASK.md` and `.agent/HANDOFF.md` before touching code.
3. **Keep changes small.** Prefer focused commits over sweeping rewrites.
4. **Do not overwrite another agent's work** without noting why in `.agent/HANDOFF.md`.
5. **Write down what matters.** Capture discoveries, pivots, and blockers — not every command.
6. **Update handoff files before stopping.** The next agent depends on them.
7. **If you need the other agent to see something, put it in this file directly.** Do not assume they will follow a pointer to a subdirectory file.

## Handoff format

When updating `.agent/HANDOFF.md`, use this shape:

```
## Last agent: [name]
## Date: [YYYY-MM-DD]

## What changed
- [what was built or modified, with file paths]

## What was verified
- [what was confirmed working]

## What remains
- [TODOs or blockers]

## Files touched
- [list]

## Next recommended step
[One clear sentence. Specific enough that the next agent can act without asking.]
```

## Memory files

| File | Purpose |
|------|---------|
| `.agent/ACTIVE_TASK.md` | Current goal — what we are building right now |
| `.agent/HANDOFF.md` | Baton from the last agent |
| `.agent/DECISIONS.md` | Pivots, rejected approaches, durable decisions |

## What to write down

Write it down if the next agent would waste 10+ minutes rediscovering it:
- A surprising discovery in the codebase
- A pivot in the plan and why
- A rejected approach that might be tried again
- A blocker and what has already been checked
- An assumption that shaped the current solution

Do not write down every command, raw logs, or long reasoning transcripts.

## Project stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Zustand for state
- Lucide React for icons
- Source: `src/` — components in `src/components/`, stores in `src/store/`
- `npm run dev` — dev server | `npm run build` — build | `npm run lint` — lint
