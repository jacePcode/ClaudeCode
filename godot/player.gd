extends CharacterBody3D
## Third-person placeholder controller for Braelynn.
## Builds its own visual/collision/camera nodes in code so no .tscn is needed.
## Movement: WASD relative to camera, Space to jump, mouse to look, Esc frees cursor.
## Night phase: F to attack (melee sweep), take_damage() called by samurai.

const SPEED        := 6.0
const JUMP_VELOCITY := 8.0
const GRAVITY      := 22.0
const MOUSE_SENS   := 0.0025
const PITCH_MIN    := -1.2
const PITCH_MAX    := 0.4
const ATTACK_RANGE := 2.8
const ATTACK_DMG   := 30
const ATTACK_CD    := 0.7

var max_hp := 100
var hp     := 100

var _spring:   SpringArm3D
var _mesh:     MeshInstance3D
var _material: StandardMaterial3D

var look_locked    := false
var _attack_timer  := 0.0
var _hit_flash     := 0.0

# world.gd connects this to check nearby samurai
signal attack_triggered(attacker_pos: Vector3, range: float, damage: int)
signal died

func _ready() -> void:
	# Collision capsule
	var col   := CollisionShape3D.new()
	var shape := CapsuleShape3D.new()
	shape.radius = 0.5
	shape.height = 2.0
	col.shape    = shape
	col.position = Vector3(0, 1.0, 0)
	add_child(col)

	# Visible placeholder body
	_mesh = MeshInstance3D.new()
	var cap  := CapsuleMesh.new()
	cap.radius = 0.5
	cap.height = 2.0
	_mesh.mesh = cap
	_mesh.position = Vector3(0, 1.0, 0)
	_material = StandardMaterial3D.new()
	_material.albedo_color = Color(0.85, 0.75, 0.55)
	_mesh.material_override = _material
	add_child(_mesh)

	# Third-person camera on spring arm
	_spring = SpringArm3D.new()
	_spring.position = Vector3(0, 1.6, 0)
	_spring.spring_length = 5.0
	add_child(_spring)
	var cam := Camera3D.new()
	cam.position = Vector3(0, 0, 0)
	_spring.add_child(cam)
	cam.current = true

	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED

func _input(event: InputEvent) -> void:
	if event is InputEventMouseMotion and not look_locked and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		rotate_y(-event.relative.x * MOUSE_SENS)
		_spring.rotation.x = clamp(_spring.rotation.x - event.relative.y * MOUSE_SENS, PITCH_MIN, PITCH_MAX)
	elif event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
		Input.mouse_mode = Input.MOUSE_MODE_VISIBLE if Input.mouse_mode == Input.MOUSE_MODE_CAPTURED else Input.MOUSE_MODE_CAPTURED
	elif event is InputEventKey and event.pressed and not event.echo and event.keycode == KEY_F:
		if not look_locked and _attack_timer <= 0:
			_attack_timer = ATTACK_CD
			attack_triggered.emit(global_position, ATTACK_RANGE, ATTACK_DMG)
			_flash_attack()

func _physics_process(delta: float) -> void:
	_attack_timer = maxf(0.0, _attack_timer - delta)

	if _hit_flash > 0:
		_hit_flash -= delta
		if _hit_flash <= 0:
			_restore_color()

	if not is_on_floor():
		velocity.y -= GRAVITY * delta

	var input_dir := Vector3.ZERO
	if not look_locked:
		if Input.is_physical_key_pressed(KEY_W): input_dir.z -= 1.0
		if Input.is_physical_key_pressed(KEY_S): input_dir.z += 1.0
		if Input.is_physical_key_pressed(KEY_A): input_dir.x -= 1.0
		if Input.is_physical_key_pressed(KEY_D): input_dir.x += 1.0
		if Input.is_physical_key_pressed(KEY_SPACE) and is_on_floor():
			velocity.y = JUMP_VELOCITY

	var dir := (transform.basis * Vector3(input_dir.x, 0, input_dir.z)).normalized()
	velocity.x = dir.x * SPEED
	velocity.z = dir.z * SPEED
	move_and_slide()

## Called by world.gd when the night/ninja phase begins or ends.
func set_ninja(on: bool) -> void:
	if on:
		_material.albedo_color = Color(0.08, 0.08, 0.12)
	else:
		_material.albedo_color = Color(0.85, 0.75, 0.55)
	hp = max_hp

## Called by samurai when they hit Braelynn.
func take_damage(amount: int) -> void:
	if hp <= 0:
		return
	hp -= amount
	_hit_flash = 0.25
	_material.albedo_color = Color(0.9, 0.15, 0.1)
	if hp <= 0:
		hp = 0
		died.emit()

func _flash_attack() -> void:
	# Brief white flash to signal the swing
	_material.albedo_color = Color(0.9, 0.9, 1.0)
	get_tree().create_timer(0.1).timeout.connect(_restore_color)

func _restore_color() -> void:
	if hp <= 0:
		return
	# Keep ninja/civilian color depending on current skin
	var is_ninja := _material.albedo_color.b > _material.albedo_color.r or \
		_material.albedo_color == Color(0.08, 0.08, 0.12)
	_material.albedo_color = Color(0.08, 0.08, 0.12) if is_ninja else Color(0.85, 0.75, 0.55)
