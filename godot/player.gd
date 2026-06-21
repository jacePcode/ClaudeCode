extends CharacterBody3D
## Third-person placeholder controller for Braelynn.
## Builds its own visual/collision/camera nodes in code so no .tscn is needed.
## Movement: WASD relative to camera, Space to jump, mouse to look, Esc frees cursor.

const SPEED := 6.0
const JUMP_VELOCITY := 8.0
const GRAVITY := 22.0
const MOUSE_SENS := 0.0025
const PITCH_MIN := -1.2
const PITCH_MAX := 0.4

var _spring: SpringArm3D
var _mesh: MeshInstance3D
var _material: StandardMaterial3D
var look_locked := false  # world.gd sets true during cutscenes (pass-out, etc.)

func _ready() -> void:
	# Collision capsule
	var col := CollisionShape3D.new()
	var shape := CapsuleShape3D.new()
	shape.radius = 0.5
	shape.height = 2.0
	col.shape = shape
	col.position = Vector3(0, 1.0, 0)
	add_child(col)

	# Visible placeholder body
	_mesh = MeshInstance3D.new()
	var cap := CapsuleMesh.new()
	cap.radius = 0.5
	cap.height = 2.0
	_mesh.mesh = cap
	_mesh.position = Vector3(0, 1.0, 0)
	_material = StandardMaterial3D.new()
	_material.albedo_color = Color(0.85, 0.75, 0.55)  # daytime civilian tone
	_mesh.material_override = _material
	add_child(_mesh)

	# Third-person camera on a spring arm (auto-pulls in on walls)
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

func _physics_process(delta: float) -> void:
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

	# Move relative to where the player is facing
	var dir := (transform.basis * Vector3(input_dir.x, 0, input_dir.z)).normalized()
	velocity.x = dir.x * SPEED
	velocity.z = dir.z * SPEED
	move_and_slide()

## Called by world.gd when the night/ninja phase begins.
func set_ninja(on: bool) -> void:
	if on:
		_material.albedo_color = Color(0.08, 0.08, 0.12)  # dark ninja gi
	else:
		_material.albedo_color = Color(0.85, 0.75, 0.55)
