# Braelynn: Shadow of the Shopkeep — Godot prototype

Greybox prototype. All geometry is placeholder boxes/capsules built in code, so it
runs with **no imported art**. The real Braelynn model gets swapped in later.

## Run it
1. Install **Godot 4.x** (4.3+ recommended) — https://godotengine.org/download
2. Open Godot → **Import** → select `godot/project.godot`
3. Press **F5** (Play).

## Controls
- **WASD** — move
- **Space** — jump
- **Mouse** — look (third-person)
- **E** — interact (slot machine / bar)
- **Esc** — free / recapture mouse cursor

## What's in this build (DAY phase)
- Walkable third-person character (placeholder capsule).
- A small feudal village: a few buildings, a torii gate near spawn.
- A **modern casino** building you walk into (glowing sign over the door).
- **Slot machine** (magenta box) — press E to spin; matches pay coins.
- **Bar** (brown box) — press E to drink; fills the **Drunk** meter.
- Drink to 100% → **pass out** → screen fades → you wake at **NIGHT in ninja garb**.

## NIGHT phase
- Currently a stub: dark lighting, ninja-colored player, one red dummy "enemy."
- Combat + real antagonists are the next milestone (see `.agent/GAME_DESIGN.md`).

## Files
- `project.godot` — config (main scene = `Main.tscn`)
- `Main.tscn` — trivial root that loads `world.gd`
- `world.gd` — builds the world, casino, UI, day/night + pass-out transition
- `player.gd` — third-person controller (builds its own camera/mesh in code)

## Notes
- Authored without a Godot binary in the build environment, so it has **not been
  run in-engine yet** — if anything errors on first launch, the fix is almost
  certainly a small API tweak. Report the error and it'll be quick.
