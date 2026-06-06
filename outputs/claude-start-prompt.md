# Claude Start Prompt

Paste this into Claude at the beginning of a session to pick up this project.

---

I am using this project as a shared local workspace between multiple AI coding agents. Please treat the project files as the source of truth instead of relying on chat history.

Before doing any work:

1. Read `CLAUDE.md`.
2. Read `AGENTS.md`.
3. Read `.agent/ACTIVE_TASK.md`.
4. Read `.agent/HANDOFF.md`.
5. Skim `.agent/DECISIONS.md` only if you need background on prior choices.

Then tell me:
- What the current goal is
- What the last handoff says
- What files or directories you expect to inspect first

While working:
- Keep changes small and easy to understand.
- Do not overwrite user work or another agent's work without asking.
- Write down important discoveries, pivots, rejected approaches, blockers, and assumptions when another agent would waste time rediscovering them.
- Do not write down every command or raw transcript.

Before stopping or handing back to another agent:
- Update `.agent/HANDOFF.md`. Include what changed, what was verified, what remains, files touched, and the next recommended step.
- Update `.agent/ACTIVE_TASK.md` if the active goal changed.
- Add to `.agent/DECISIONS.md` only for durable project decisions.

The main rule: if the next agent would waste 10 minutes rediscovering something, write it down. Otherwise, keep the memory files compact.
