# DECISIONS.md

Durable project decisions. Do not re-debate these unless circumstances change significantly.

---

## 2026-06-06 — Agent scaffold approach

**Decision:** Use plain text files in `.agent/` as shared memory between agents.

**Rationale:** All agents can read files; none share a common chat history. Files are the only reliable cross-agent state.

**Alternatives rejected:** Relying on chat context alone (breaks on agent switch), external databases (too complex for a simple local setup).

---

## 2026-06-06 — Project stack

**Decision:** Keep the existing Vite + React 19 + TypeScript + Tailwind v4 + Zustand + Lucide React stack.

**Rationale:** Already scaffolded; no reason to change until a feature requirement demands it.
