# HANDOFF.md

## Last agent: Claude Code (web/remote)
## Date: 2026-06-21

---

## What changed
- **Project pivoted** from a React web clicker to a **Godot 4 third-person 3D stealth game**: "Braelynn: Shadow of the Shopkeep" (feudal Japan, civilian by day / ninja by night). Full design written to `.agent/GAME_DESIGN.md`.
- Created a Higgsfield **Element** for the Braelynn character (id `2c3e50de-c1b9-4444-a655-b407ffec5bc2`).
- Locked the asset pipeline: Higgsfield image → `generate_3d` → Mixamo auto-rig → free animations (Mixamo/Quaternius) → Godot retarget.
- Recorded a real environment blocker (egress blocks Higgsfield upload + CDN). See DECISIONS.md.
- Added `.braelynn-refs/` to `.gitignore` (personal reference photos kept out of git).

## What was verified
- Higgsfield account works (Plus, ~536 credits left), Element created successfully, test images generated (nano_banana) — likeness not yet user-confirmed.
- Free Godot animation pipeline confirmed current via web search (Mixamo, Quaternius v2.0 Jan 2026, Godot retargeting).
- HEIC conversion works in-container (pillow-heif).

## What remains
- Generate the **A-pose civilian Braelynn** image (default skin) → feed `generate_3d`.
- Resolve the egress blocker for pulling assets into the repo (user download vs allowlist).
- Scaffold the Godot 4 project (not started — repo is still the old Vite scaffold).

## Files touched
- `.agent/GAME_DESIGN.md` (new), `.agent/ACTIVE_TASK.md`, `.agent/DECISIONS.md`, `.agent/HANDOFF.md`, `.gitignore`

## Next recommended step
When the user is ready, generate a clean A-pose / front-facing / full-body / neutral-background image of Braelynn in period-accurate commoner clothes + glasses (use the Element). Confirm likeness, then run `generate_3d`.
