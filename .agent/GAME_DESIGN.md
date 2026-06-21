# GAME_DESIGN.md — Braelynn: Shadow of the Shopkeep (working title)

Canonical design reference. Update when the design genuinely changes.

## Logline
A heavyset, bespectacled commoner in feudal Japan lives a double life: an unremarkable villager by day, a katana-wielding ninja by night. Silly premise, grounded world; the comedy comes from the gap between the two lives.

## Engine & genre
- **Engine:** Godot 4 (3D)
- **Genre:** Third-person stealth-action
- NOTE: This replaces the earlier React/Vite web-app direction. The Vite scaffold in this repo is set aside (not deleted) — the game is a separate Godot project.

## Character — Braelynn
- **Identity:** Recognizably the real Braelynn dropped into ~1600s Japan.
- **Clothing:** Period-accurate commoner garb (plain kimono / samue work clothes). HYBRID — keep his modern **glasses** (thin metal frames) as the one anachronistic signature.
- **Physique (must preserve):** heavyset build, his skin tone, short black hair, full goatee/beard.
- **Two skins:** (1) Default = civilian commoner. (2) Ninja = night outfit (ref: user's flying-katana-kick photo, saved for later).

## Core loop
- **Day (civilian):** mundane village tasks, maintain cover, earn small coin. Low-key, comedic.
- **Night (ninja):** stealth missions — sneak, climb, sabotage, takedowns, loot. Primary point source.
- **Between runs:** spend points on minor upgrade paths.

## Upgrade paths (minor, points-based)
- Blade (damage / silent kills)
- Smoke bombs (escape / stun)
- Climbing claws (reach new routes)
- Silent steps (smaller noise radius)
- Disguise / cover (slower village suspicion buildup)

## Asset pipeline (rigging IS solved — do NOT hand-author animations)
1. Higgsfield: generate a clean **A-pose / T-pose, front-facing, full-body, neutral-background** image of Braelynn (use the Braelynn Element, see DECISIONS.md).
2. `generate_3d` → GLB mesh (static, unrigged).
3. Mesh cleanup in Blender if needed.
4. **Mixamo auto-rig** (free) — adds a game-ready humanoid skeleton.
5. **Animations (free):** Mixamo library + Quaternius Universal Animation Library (120+, commercial-OK, retargetable).
6. Godot 4 import + retarget via `SkeletonProfileHumanoid` + reusable `BoneMap` (helper: MixaBridge).

### Free animation/resource links
- Mixamo: https://www.mixamo.com (auto-rig + animations)
- Quaternius Universal Animation Library: https://quaternius.itch.io/universal-animation-library
- Godot4 Mixamo libraries: https://github.com/jwelchgames/Godot4-MixamoLibraries
- Godot4 Open Animation Libraries: https://github.com/catprisbrey/Godot4-OpenAnimationLibraries
- MixaBridge (auto bone-map): https://mixabridge.uzair.ct.ws/

## MVP scope (proposed build order)
1. Godot 4 project skeleton + third-person camera + character controller (placeholder capsule).
2. Drop in rigged Braelynn with locomotion (idle/walk/run/crouch-walk).
3. One small village greybox level.
4. Day/night state + simple objective.
5. Basic stealth (enemy sight cones, patrol, hide, takedown).
6. Points + one or two upgrades.
7. Swap placeholder → final Braelynn model + ninja skin.

## Open questions
- Mission structure: hand-crafted levels vs procedural?
- How punishing is detection (instant fail vs alert meter)?
- Art style target (stylized/low-poly vs semi-realistic)?
