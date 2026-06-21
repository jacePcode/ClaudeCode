extends Node3D
## Greybox prototype world for "Braelynn: Shadow of the Shopkeep".
## DAY: walk around, enter the casino, spin the slot, drink at the bar.
##      Drink until you pass out -> NIGHT begins and you wake as a ninja.
## NIGHT: placeholder (one dummy target). Real stealth/combat comes later.
##
## Everything is built in code with placeholder boxes/capsules so the project
## runs with zero imported art. Swap in the real Braelynn model later.

enum Phase { DAY, NIGHT }

var phase: int = Phase.DAY
var coins: int = 0
var drunk: float = 0.0          # 0..100, hit 100 to pass out
const DRINK_PER_SIP := 22.0
const INTERACT_RANGE := 3.5

var player: CharacterBody3D
var sun: DirectionalLight3D
var env: Environment
var enemy: Node3D

# Interactable world positions
var slot_pos := Vector3(-4, 1, -19)
var bar_pos := Vector3(5, 1, -15)
var _active_interactable := ""   # "slot" | "bar" | ""

# UI
var ui_prompt: Label
var ui_status: Label
var ui_slot: Label
var ui_drunk: ProgressBar
var fade: ColorRect

const SLOT_SYMBOLS := ["🍒", "💎", "🔔", "7", "🥷", "🍶"]

func _ready() -> void:
	_build_environment()
	_build_world_geometry()
	_build_casino()
	_spawn_player()
	_build_ui()
	_apply_day()

# ---------------------------------------------------------------- environment
func _build_environment() -> void:
	sun = DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-50, -40, 0)
	sun.shadow_enabled = true
	add_child(sun)

	var we := WorldEnvironment.new()
	env = Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	we.environment = env
	add_child(we)

# ---------------------------------------------------------------- geometry
func _mat(color: Color, emit := false) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.albedo_color = color
	if emit:
		m.emission_enabled = true
		m.emission = color
		m.emission_energy_multiplier = 3.0
	return m

func _box(pos: Vector3, size: Vector3, color: Color, collide := true, emit := false) -> CSGBox3D:
	var b := CSGBox3D.new()
	b.size = size
	b.position = pos
	b.use_collision = collide
	b.material = _mat(color, emit)
	add_child(b)
	return b

func _build_world_geometry() -> void:
	# Ground
	_box(Vector3(0, -0.5, -8), Vector3(120, 1, 120), Color(0.30, 0.45, 0.25))
	# A few feudal-village buildings to explore around (placeholder blocks)
	_box(Vector3(-22, 2, 4), Vector3(8, 4, 8), Color(0.55, 0.40, 0.30))
	_box(Vector3(20, 3, 6), Vector3(7, 6, 7), Color(0.50, 0.38, 0.28))
	_box(Vector3(-18, 2.5, -28), Vector3(9, 5, 9), Color(0.52, 0.39, 0.29))
	_box(Vector3(24, 2, -24), Vector3(8, 4, 8), Color(0.54, 0.41, 0.31))
	# Torii-ish marker near spawn (two posts + lintel)
	_box(Vector3(-2.5, 2.5, 14), Vector3(0.5, 5, 0.5), Color(0.7, 0.15, 0.12))
	_box(Vector3(2.5, 2.5, 14), Vector3(0.5, 5, 0.5), Color(0.7, 0.15, 0.12))
	_box(Vector3(0, 5.2, 14), Vector3(6.5, 0.6, 0.6), Color(0.7, 0.15, 0.12))

func _build_casino() -> void:
	var wall := Color(0.20, 0.20, 0.26)
	# Carpet floor pad
	_box(Vector3(0, 0.05, -15), Vector3(16, 0.1, 16), Color(0.35, 0.05, 0.08))
	# Walls (room centered at z=-15, gap doorway on the +z side at z=-7)
	_box(Vector3(0, 2.5, -23), Vector3(16, 5, 0.5), wall)          # back
	_box(Vector3(-8, 2.5, -15), Vector3(0.5, 5, 16), wall)         # left
	_box(Vector3(8, 2.5, -15), Vector3(0.5, 5, 16), wall)          # right
	_box(Vector3(-5, 2.5, -7), Vector3(6, 5, 0.5), wall)           # front-left
	_box(Vector3(5, 2.5, -7), Vector3(6, 5, 0.5), wall)            # front-right (gap x:-2..2)
	_box(Vector3(0, 5.25, -15), Vector3(16, 0.5, 16), wall)        # roof
	# Glowing CASINO sign over the door
	_box(Vector3(0, 5.6, -7), Vector3(5, 1, 0.3), Color(1.0, 0.1, 0.6), false, true)
	# Interior light
	var lamp := OmniLight3D.new()
	lamp.position = Vector3(0, 4.2, -15)
	lamp.light_energy = 4.0
	lamp.omni_range = 22.0
	lamp.light_color = Color(1.0, 0.85, 0.6)
	add_child(lamp)
	# Slot machine (interactable)
	_box(slot_pos, Vector3(1.2, 2, 0.8), Color(0.9, 0.1, 0.9), true, true)
	# Bar (interactable)
	_box(bar_pos, Vector3(4, 1.2, 1.5), Color(0.45, 0.28, 0.15))

func _spawn_player() -> void:
	player = CharacterBody3D.new()
	player.set_script(load("res://player.gd"))
	player.position = Vector3(0, 0, 10)
	add_child(player)

# ---------------------------------------------------------------- UI
func _label(text: String, pos: Vector2, size := 20) -> Label:
	var l := Label.new()
	l.text = text
	l.position = pos
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", Color.WHITE)
	l.add_theme_color_override("font_outline_color", Color.BLACK)
	l.add_theme_constant_override("outline_size", 4)
	return l

func _build_ui() -> void:
	var layer := CanvasLayer.new()
	add_child(layer)

	ui_status = _label("DAY  |  Coins: 0", Vector2(20, 16), 22)
	layer.add_child(ui_status)

	layer.add_child(_label("WASD move • Space jump • Mouse look • E interact • Esc cursor",
		Vector2(20, 50), 14))

	ui_drunk = ProgressBar.new()
	ui_drunk.min_value = 0
	ui_drunk.max_value = 100
	ui_drunk.value = 0
	ui_drunk.position = Vector2(20, 90)
	ui_drunk.size = Vector2(260, 26)
	layer.add_child(ui_drunk)
	layer.add_child(_label("Drunk", Vector2(24, 92), 14))

	ui_slot = _label("", Vector2(20, 130), 26)
	layer.add_child(ui_slot)

	ui_prompt = _label("", Vector2(0, 0), 24)
	ui_prompt.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	ui_prompt.anchor_left = 0.0
	ui_prompt.anchor_right = 1.0
	ui_prompt.anchor_top = 0.7
	ui_prompt.offset_right = 0
	layer.add_child(ui_prompt)

	fade = ColorRect.new()
	fade.color = Color(0, 0, 0, 0)
	fade.anchor_right = 1.0
	fade.anchor_bottom = 1.0
	fade.offset_right = 0
	fade.offset_bottom = 0
	fade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	layer.add_child(fade)

# ---------------------------------------------------------------- loop
func _process(_delta: float) -> void:
	ui_drunk.value = drunk
	ui_status.text = "%s  |  Coins: %d" % ["DAY" if phase == Phase.DAY else "NIGHT", coins]

	_active_interactable = ""
	if phase == Phase.DAY and player and not player.look_locked:
		var p := player.global_position
		if p.distance_to(slot_pos) <= INTERACT_RANGE:
			_active_interactable = "slot"
			ui_prompt.text = "[E] Spin the slot"
		elif p.distance_to(bar_pos) <= INTERACT_RANGE:
			_active_interactable = "bar"
			ui_prompt.text = "[E] Have a drink"
		else:
			ui_prompt.text = ""
	else:
		ui_prompt.text = ""

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo and event.keycode == KEY_E:
		if _active_interactable == "slot":
			_spin_slot()
		elif _active_interactable == "bar":
			_drink()

func _spin_slot() -> void:
	var a: String = SLOT_SYMBOLS.pick_random()
	var b: String = SLOT_SYMBOLS.pick_random()
	var c: String = SLOT_SYMBOLS.pick_random()
	var win := 0
	if a == b and b == c:
		win = 100
	elif a == b or b == c or a == c:
		win = 20
	coins += win
	ui_slot.text = "[ %s | %s | %s ]  %s" % [a, b, c, ("JACKPOT! +100" if win == 100 else ("+%d" % win if win > 0 else "nothing"))]

func _drink() -> void:
	drunk = min(drunk + DRINK_PER_SIP, 100.0)
	ui_slot.text = "*hic*"
	if drunk >= 100.0:
		_pass_out()

# ---------------------------------------------------------------- day/night
func _apply_day() -> void:
	phase = Phase.DAY
	sun.light_energy = 1.0
	sun.light_color = Color(1.0, 0.97, 0.9)
	env.background_color = Color(0.45, 0.65, 0.95)
	env.ambient_light_color = Color(0.6, 0.7, 0.85)
	env.ambient_light_energy = 0.5

func _apply_night() -> void:
	phase = Phase.NIGHT
	sun.light_energy = 0.18
	sun.light_color = Color(0.55, 0.6, 0.9)
	env.background_color = Color(0.03, 0.04, 0.10)
	env.ambient_light_color = Color(0.1, 0.12, 0.25)
	env.ambient_light_energy = 0.25

func _pass_out() -> void:
	player.look_locked = true
	ui_prompt.text = ""
	ui_slot.text = ""
	var t := create_tween()
	t.tween_property(fade, "color:a", 1.0, 1.0)
	await t.finished
	ui_status.text = "You drank yourself unconscious..."
	await get_tree().create_timer(1.5).timeout

	# Wake up at night, as a ninja
	_apply_night()
	drunk = 0.0
	player.global_position = Vector3(0, 0, 2)
	player.rotation = Vector3.ZERO
	player.set_ninja(true)
	_spawn_night_enemy()

	ui_status.text = "NIGHT — you awaken in ninja garb. (combat coming soon)"
	var t2 := create_tween()
	t2.tween_property(fade, "color:a", 0.0, 1.0)
	await t2.finished
	player.look_locked = false

func _spawn_night_enemy() -> void:
	if enemy and is_instance_valid(enemy):
		return
	enemy = MeshInstance3D.new()
	var cap := CapsuleMesh.new()
	cap.radius = 0.5
	cap.height = 2.0
	enemy.mesh = cap
	enemy.material_override = _mat(Color(0.8, 0.1, 0.1))
	enemy.position = Vector3(0, 1.0, -6)
	add_child(enemy)
