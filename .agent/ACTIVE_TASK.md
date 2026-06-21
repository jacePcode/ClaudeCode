# ACTIVE_TASK.md

## Current goal

**Build "Braelynn: Shadow of the Shopkeep" — a third-person 3D stealth game in Godot 4.**

Premise: Braelynn as a feudal-Japan commoner by day, ninja by night. Full design in `.agent/GAME_DESIGN.md`.

## Phase: DESIGN locked → asset pipeline next (not yet building game code)

The user wants the idea solid before building. Design is now locked. Next is producing the playable Braelynn 3D model via the Higgsfield → generate_3d → Mixamo → Godot pipeline.

## Status
- [x] Concept locked: third-person stealth, feudal Japan, civilian/ninja double life
- [x] Character look locked: period-accurate commoner + glasses, keep real physique
- [x] Higgsfield "Braelynn" Element created (id in DECISIONS.md)
- [x] Animation strategy locked: free packs (Mixamo + Quaternius), NOT AI-generated
- [ ] Generate A-pose Braelynn image (default civilian skin) for 3D conversion
- [ ] generate_3d → GLB → Mixamo auto-rig
- [ ] Godot 4 project scaffold + character controller

## Next step
When the user is ready, generate a clean **A-pose, front-facing, full-body, neutral-background** image of Braelynn in period-accurate commoner clothing + glasses (use the Braelynn Element). That image feeds `generate_3d`.

## Known blocker (environment)
This remote env's network egress blocks Higgsfield's upload host AND image CDN. Effects:
- I cannot upload files to Higgsfield from the container → user must upload via the Higgsfield widget.
- I cannot download generated images/models into the repo → user must download them, OR allowlist `upload.higgsfield.ai` + the `*.cloudfront.net` Higgsfield CDN hosts in the environment's egress settings.
