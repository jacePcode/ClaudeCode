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
- **F** — attack (night phase melee sweep)
- **Esc** — free / recapture mouse cursor

## Day phase
- Walk around a small feudal village (buildings, torii gate near spawn).
- Enter the **modern casino** through the glowing pink CASINO sign.
- **Slot machine** (magenta box) — press E to spin; matches pay coins.
- **Bar** (brown box) — press E to drink; fills the **Drunk** meter.
- Five drinks → **pass out** → screen fades → you wake at **NIGHT as a ninja**.

## Night phase
- Three **samurai lawmen** patrol the village.
- Each has a sight cone (70°, 13-unit range). Getting spotted triggers a chase.
- **! DETECTED !** flashes red on screen while any samurai is hunting you.
- Press **F** to melee-attack any samurai within ~2.8 units (30 damage; 0.7 s cooldown).
- Samurai deal 15 damage per swing (1.6 s cooldown). HP bar appears on screen.
- Kill all three → dawn cutscene → back to civilian day phase with win message.
- HP drops to 0 → you fall → respawn at day (defeat message).

## Files
- `project.godot` — Godot 4 config (main scene = `Main.tscn`)
- `Main.tscn` — trivial root that loads `world.gd`
- `world.gd` — world geometry, casino, UI, day/night state machine, combat glue
- `player.gd` — third-person controller; health, attack signal
- `samurai.gd` — samurai lawman: patrol, sight, chase, melee attack, death

## Notes
- Authored without a Godot binary in the build environment — **not yet run in-engine**.
  If anything errors on first launch it's almost certainly a small API tweak; report
  the error and it'll be a quick fix.
