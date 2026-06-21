extends CharacterBody3D
## Samurai lawman antagonist for the night phase.
## Patrols between two waypoints; spots Braelynn by sight cone;
## chases, then attacks with a melee sword swing.

const PATROL_SPEED  := 2.5
const CHASE_SPEED   := 5.5
const GRAVITY       := 22.0
const SIGHT_RANGE   := 13.0
const SIGHT_ANGLE   := 70.0   # half-angle in degrees
const CHASE_RANGE   := 22.0   # gives up pursuit beyond this
const ATTACK_RANGE  := 2.3
const ATTACK_DAMAGE := 15
const ATTACK_CD     := 1.6
const MAX_HP        := 60

enum State { PATROL, ALERT, CHASE, ATTACK, DEAD }

var state: int = State.PATROL
var hp:    int = MAX_HP

var patrol_a: Vector3
var patrol_b: Vector3
var _patrol_target: Vector3

var player: CharacterBody3D

var _attack_timer := 0.0
var _alert_timer  := 0.0
var _mat_body: StandardMaterial3D

signal died

# ---------------------------------------------------------------- setup
func setup(a: Vector3, b: Vector3, p: CharacterBody3D) -> void:
	patrol_a = a
	patrol_b = b
	_patrol_target = b
	player = p

func _ready() -> void:
	# Collision
	var col := CollisionShape3D.new()
	var cs  := CapsuleShape3D.new()
	cs.radius = 0.4
	cs.height = 2.0
	col.shape = cs
	col.position = Vector3(0, 1.0, 0)
	add_child(col)

	# Body (dark brown samurai armor)
	var body := MeshInstance3D.new()
	var cap  := CapsuleMesh.new()
	cap.radius = 0.4
	cap.height = 2.0
	body.mesh = cap
	body.position = Vector3(0, 1.0, 0)
	_mat_body = StandardMaterial3D.new()
	_mat_body.albedo_color = Color(0.18, 0.10, 0.05)
	body.material_override = _mat_body
	add_child(body)

	# Helmet (flat box on top)
	var helmet := MeshInstance3D.new()
	var hbox   := BoxMesh.new()
	hbox.size  = Vector3(0.6, 0.2, 0.6)
	helmet.mesh = hbox
	helmet.position = Vector3(0, 2.15, 0)
	helmet.material_override = _solid(Color(0.12, 0.08, 0.04))
	add_child(helmet)

	# Sword (thin vertical box off right side)
	var sword := MeshInstance3D.new()
	var sbox  := BoxMesh.new()
	sbox.size = Vector3(0.07, 0.95, 0.05)
	sword.mesh = sbox
	sword.position = Vector3(0.55, 1.15, -0.05)
	sword.material_override = _solid(Color(0.78, 0.80, 0.86))
	add_child(sword)

func _solid(c: Color) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.albedo_color = c
	return m

# ---------------------------------------------------------------- loop
func _physics_process(delta: float) -> void:
	if state == State.DEAD:
		return

	if not is_on_floor():
		velocity.y -= GRAVITY * delta

	_attack_timer = maxf(0.0, _attack_timer - delta)

	match state:
		State.PATROL:
			_patrol()
			if _can_see_player():
				state = State.ALERT
				_alert_timer = 0.55
		State.ALERT:
			velocity.x = 0
			velocity.z = 0
			_face_player()
			_alert_timer -= delta
			if _alert_timer <= 0:
				state = State.CHASE
		State.CHASE:
			var d := global_position.distance_to(player.global_position)
			if d <= ATTACK_RANGE:
				state = State.ATTACK
			elif d > CHASE_RANGE:
				state = State.PATROL
			else:
				_move_toward(player.global_position, CHASE_SPEED)
		State.ATTACK:
			_face_player()
			velocity.x = 0
			velocity.z = 0
			var d := global_position.distance_to(player.global_position)
			if d > ATTACK_RANGE + 0.8:
				state = State.CHASE
			elif _attack_timer <= 0:
				_attack_timer = ATTACK_CD
				_swing()

	move_and_slide()

func _patrol() -> void:
	var flat := _patrol_target - global_position
	flat.y = 0
	if flat.length() < 1.2:
		_patrol_target = patrol_b if _patrol_target.distance_to(patrol_a) < 0.5 else patrol_a
		return
	var dir := flat.normalized()
	velocity.x = dir.x * PATROL_SPEED
	velocity.z = dir.z * PATROL_SPEED
	_face_dir(dir)

func _move_toward(target: Vector3, speed: float) -> void:
	var dir := (target - global_position)
	dir.y = 0
	if dir.length() > 0.01:
		dir = dir.normalized()
		velocity.x = dir.x * speed
		velocity.z = dir.z * speed
		_face_dir(dir)

func _face_dir(dir: Vector3) -> void:
	if dir.length() > 0.01:
		look_at(global_position + dir, Vector3.UP)

func _face_player() -> void:
	_face_dir((player.global_position - global_position) * Vector3(1, 0, 1))

func _can_see_player() -> bool:
	if not player or not is_instance_valid(player):
		return false
	var dist := global_position.distance_to(player.global_position)
	if dist > SIGHT_RANGE:
		return false
	var to_p   := (player.global_position - global_position).normalized()
	var fwd    := -global_transform.basis.z
	return rad_to_deg(fwd.angle_to(to_p)) <= SIGHT_ANGLE

func _swing() -> void:
	if player and is_instance_valid(player) and player.has_method("take_damage"):
		player.take_damage(ATTACK_DAMAGE)

# ---------------------------------------------------------------- damage
func take_damage(amount: int) -> void:
	if state == State.DEAD:
		return
	hp -= amount
	_flash(Color(0.95, 0.25, 0.05))
	if hp <= 0:
		_die()
	elif state == State.PATROL or state == State.ALERT:
		state = State.CHASE

func _flash(c: Color) -> void:
	_mat_body.albedo_color = c
	get_tree().create_timer(0.12).timeout.connect(_restore_color)

func _restore_color() -> void:
	if state != State.DEAD:
		_mat_body.albedo_color = Color(0.18, 0.10, 0.05)

func _die() -> void:
	state = State.DEAD
	velocity  = Vector3.ZERO
	_mat_body.albedo_color = Color(0.35, 0.1, 0.05)
	died.emit()
	get_tree().create_timer(2.5).timeout.connect(func(): queue_free())

# Returns true when this samurai is actively hunting the player
func is_alerted() -> bool:
	return state == State.CHASE or state == State.ATTACK or state == State.ALERT
