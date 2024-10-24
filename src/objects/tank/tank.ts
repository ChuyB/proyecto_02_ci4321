import * as THREE from "three";
import Body from "./body";
import Turret from "./turret";
import Cannon from "./cannon";
import Wheel from "./wheel";
import Proyectile from "./../Proyectile"

/**
 * Class representing a tank.
 */
export default class Tank {
  private scene: THREE.Scene;
  public body: THREE.Mesh;
  public turret: THREE.Mesh;
  public cannon: THREE.Mesh;
  public wheels: THREE.Mesh[] = [];
  private projectiles: Proyectile[] = [];
  private lastShootTime: number = 0;
  private shootCooldown: number = 1000;
  public isLinearShoot: boolean = false;
  private direction: number;
  private turretDirection: number;
  private cannonElevation: number;
  private velocity: {
    x: number;
    y: number;
    z: number;
  };

  /**
   * Creates an instance of Tank.
   * @param {THREE.Scene} scene - The scene to which the tank will be added.
   */
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.velocity = { x: 0, y: 0, z: 0 };
    this.direction = 0;
    this.turretDirection = 0;
    this.cannonElevation = 0;
    this.body = new Body(scene).figure;
    this.turret = new Turret().figure;
    this.cannon = new Cannon().figure;
    this.createWheels();

    // Position the turret on top of the body
    this.turret.position.set(0, 8, 0);
    this.body.add(this.turret);

    // Position the cannon on the turret
    this.cannon.position.set(0, 5, 0);
    this.turret.add(this.cannon);

    // Add wheels to the body
    this.wheels.forEach((wheel) => this.body.add(wheel));

    // Set the controls for the tank
    this.setControls();

    // Add the complete tank to the scene
    scene.add(this.body);
  }

  /**
   * Creates the wheels of the tank and positions them.
   */
  private createWheels() {
    // Define the positions for the wheels
    const wheelPositions = [
      [0, 2, 16], // Front axle
      [0, 2, 0], // Middle axle
      [0, 2, -16], // Rear axle
    ];

    // Create and position each wheel
    wheelPositions.forEach((pos) => {
      const wheel = new Wheel().figure;
      wheel.position.set(pos[0], pos[1], pos[2]);
      this.wheels.push(wheel);
    });
  }

  /**
   * Update method
   */
  public update(time: THREE.Clock) {
    // Gets delta time
    const deltaTime = time.getDelta();
    const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.z ** 2);

    // Translate the tank in the direction it's facing
    this.body.position.x += this.velocity.x * deltaTime;
    this.body.position.y += this.velocity.y * deltaTime;
    this.body.position.z += this.velocity.z * deltaTime;

    // Rotate the tank
    this.body.rotation.y += this.direction * deltaTime;

    // Rotate the turret
    this.turret.rotation.y += this.turretDirection * deltaTime;

    // Elevate the cannon
    const newAngle = this.cannon.rotation.x + this.cannonElevation * deltaTime;
    if (newAngle >= -Math.PI / 6 && newAngle <= Math.PI / 24) {
      this.cannon.rotation.x += this.cannonElevation * deltaTime;
    }

    // Rotate wheels
    this.wheels.forEach((wheel) => {
      wheel.rotation.x += speed * deltaTime;
    });
  }

  private setControls() {
    // Velocidad y velocidad de rotación del tanque
    const tankSpeed = 50;
    const tankRotationSpeed = 2;
    const turretRotationSpeed = 2;
    const cannonElevationSpeed = 2;

    let vx = 0,
      vz = 0,
      dir = 0,
      turretDir = 0,
      cannonDir = 0;

=======
    // Eventos de teclado para controlar el tanque
    document.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "w":
          vx = Math.sin(this.body.rotation.y) * tankSpeed;
          vz = Math.cos(this.body.rotation.y) * tankSpeed;
          break;
        case "s":
          vx = Math.sin(this.body.rotation.y) * -tankSpeed;
          vz = Math.cos(this.body.rotation.y) * -tankSpeed;
          break;
        case "a":
          dir = tankRotationSpeed;
          break;
        case "d":
          dir = -tankRotationSpeed;
          break;
        case "q":
        case "ArrowLeft":
          turretDir = turretRotationSpeed;
          break;
        case "e":
        case "ArrowRight":
          turretDir = -turretRotationSpeed;
          break;
        case "f":
        case "ArrowDown":
          cannonDir = cannonElevationSpeed;
          break;
        case "r":
        case "ArrowUp":
          cannonDir = -cannonElevationSpeed;
          break;
        default:
          break;
      }
      this.velocity.x = vx;
      this.velocity.z = vz;
      this.direction = dir;
      this.turretDirection = turretDir;
      this.cannonElevation = cannonDir;
    });

    document.addEventListener("keyup", (event) => {
      switch (event.key) {
        case "s":
        case "w":
        case "a":
        case "d":
          vx = 0;
          vz = 0;
          dir = 0;
          break;
        case "q":
        case "e":
        case "ArrowLeft":
        case "ArrowRight":
          turretDir = 0;
          break;
        case "r":
        case "f":
        case "ArrowUp":
        case "ArrowDown":
          cannonDir = 0;
          break;
        default:
          break;
      }
      this.velocity.x = vx;
      this.velocity.z = vz;
      this.direction = dir;
      this.turretDirection = turretDir;
      this.cannonElevation = cannonDir;
    });
  }

  public shoot(initialVelocity: number = 30) {
    const currentTime = Date.now();
    if (currentTime - this.lastShootTime < this.shootCooldown) {
      return;
    }

    const projectile = new Proyectile(this.isLinearShoot);

    const cannonWorldPosition = new THREE.Vector3();
    this.cannon.getWorldPosition(cannonWorldPosition)

    const totalRotationY = this.direction + this.turret.rotation.y;

    projectile.shoot(
      cannonWorldPosition,
      totalRotationY,
      this.cannon.rotation.x,
      initialVelocity
    );

    this.projectiles.push(projectile);
    this.scene.add(projectile.figure)
    this.lastShootTime = currentTime;
  }

  public update(deltaTime: number) {
    this.projectiles = this.projectiles.filter(projectile => {
      const isActive = projectile.update(deltaTime);
      if(!isActive) {
        this.scene.remove(projectile.figure);
      }
      return isActive
    });
  }
}
