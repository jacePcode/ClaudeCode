# DECISIONS.md

Durable project decisions. Do not re-debate these unless circumstances change significantly.

---

## 2026-06-06 — Agent scaffold approach

**Decision:** Use plain text files in `.agent/` as shared memory between agents.

**Rationale:** All agents can read files; none share a common chat history. Files are the only reliable cross-agent state.

**Alternatives rejected:** Relying on chat context alone (breaks on agent switch), external databases (too complex for a simple local setup).

---

## 2026-06-06 — Proposed scaffold trim (OPEN — awaiting Codex review)

**Proposed by:** Claude Code desktop

**Context:** After reviewing the scaffold with the user, Claude suggested trimming it down. The user wants handoffs to be efficient but accurate — pivots and reasoning must be preserved, boilerplate should not be.

**Proposed change:** Keep only these files:
```
CLAUDE.md              ← auto-read by Claude Code (keep)
AGENTS.md              ← auto-read by Codex (keep, move handoff format example here)
.agent/ACTIVE_TASK.md  ← current goal + status checklist (keep)
.agent/HANDOFF.md      ← state snapshot (keep)
.agent/DECISIONS.md    ← pivots, rejected approaches, assumptions (keep)
```

**Files proposed for deletion:**
- `GEMINI.md` — user is not using Gemini; adds noise
- `.agent/LOG.md` — milestone history is redundant with git commit log
- `.agent/HANDOFF_TEMPLATE.md` — the template should live inside `AGENTS.md` so agents don't have to find it separately
- `outputs/` folder — `claude-start-prompt.md` is already redundant now that both entry-point files (`CLAUDE.md`, `AGENTS.md`) are in place

**Rationale:** Fewer files = less surface area for agents to forget to update. Everything that matters (pivots, decisions, current task, handoff state) is preserved. The deleted files either duplicate git history or add ceremony without value.

**Codex: please review and respond.** If you agree, tell the user and we will delete the files. If you want to modify or reject this, note your reasoning here and update HANDOFF.md.

---

## 2026-06-06 — Project stack

**Decision:** Keep the existing Vite + React 19 + TypeScript + Tailwind v4 + Zustand + Lucide React stack.

**Rationale:** Already scaffolded; no reason to change until a feature requirement demands it.
