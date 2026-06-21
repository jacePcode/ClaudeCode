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

**SUPERSEDED 2026-06-21** — project pivoted to a Godot 3D game (see below).

---

## 2026-06-21 — Project pivot: Godot 3D stealth game

**Decision:** The project is now **"Braelynn: Shadow of the Shopkeep"**, a third-person 3D stealth game in **Godot 4**. Feudal Japan; Braelynn is a civilian by day, ninja by night. Full design in `.agent/GAME_DESIGN.md`.

**Path not taken:** React web clicker (and an Unreal port idea). Web→game-engine isn't a port; it's a fresh build. The Vite/React scaffold in this repo is set aside, not deleted.

**Character look:** Period-accurate feudal commoner clothing + keep his modern glasses (hybrid). Preserve real physique (heavyset, skin tone, black hair, goatee).

---

## 2026-06-21 — Animations: use free packs, NOT AI-generated

**Decision:** Rig + animate via the free Mixamo pipeline (auto-rig + animation library) plus Quaternius Universal Animation Library; retarget in Godot 4 (SkeletonProfileHumanoid + BoneMap).

**Rationale:** User reported AI-generated animations are unreliable. Free, retargetable humanoid packs are mature and game-ready. Mixamo's auto-rig also solves the "image-to-3D mesh is unrigged" gap.

---

## 2026-06-21 — Higgsfield Braelynn character model

**Decision:** Built a Higgsfield **Element** (not a trained Soul) for Braelynn.
- **Element id:** `2c3e50de-c1b9-4444-a655-b407ffec5bc2` — embed as `<<<2c3e50de-c1b9-4444-a655-b407ffec5bc2>>>` in generate_image/generate_video prompts.
- Built from 3 uploaded photos. Account: Plus plan.
- **Constraint:** Elements work with nano_banana / Seedream / GPT Image / Cinema Studio — NOT with Soul V2/Cinema models. (Train a Soul later if tighter fidelity is needed; needs 5-20 photos.)

---

## 2026-06-21 — Environment network egress blocks Higgsfield hosts (BLOCKER)

**Decision/Finding:** This remote environment's egress allowlist blocks `upload.higgsfield.ai` and the Higgsfield image CDN (`*.cloudfront.net`). Bypassing the Bash sandbox does NOT help — it's enforced at the environment level.

**Consequences:**
- Cannot upload to Higgsfield from the container → user uploads via the Higgsfield **widget** (`media_upload_widget`).
- Cannot download generated images/3D models into the repo → user must download them manually, OR allowlist those hosts in the environment's network egress settings.

**Workaround used:** Convert/inspect files locally (pillow-heif installed for HEIC), send files to user via SendUserFile, have user upload through the widget.
