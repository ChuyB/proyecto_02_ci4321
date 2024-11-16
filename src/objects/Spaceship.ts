import * as THREE from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import Primitive from "./primitives/Primitive";
import Scene from "../utils/Scene";

export class Spaceship extends Primitive {
  private camera: THREE.PerspectiveCamera;
  private speed: number;
  private tiltSpeed: number;
  private panSpeed: number;
  private rollSpeed: number;
  private acceleration: number;
  private tiltAcceleration: number;
  private panAcceleration: number;
  private rollAcceleration: number;
  private mousePressed: boolean;
  private maxSpeed: number;
  private speedLevel: 0 | 1 | 2 | 3 | -1 | -2 | -3;
  private shouldStop: boolean;

  constructor(scene: Scene) {
    super();
    this.camera = scene.camera;
    this.speed = 0;
    this.acceleration = 0;
    this.tiltAcceleration = 0;
    this.panAcceleration = 0;
    this.tiltAcceleration = 0;
    this.panAcceleration = 0;
    this.rollAcceleration = 0;
    this.tiltSpeed = 0;
    this.panSpeed = 0;
    this.rollSpeed = 0;
    this.mousePressed = false;
    this.maxSpeed = 0;
    this.speedLevel = 0;
    this.shouldStop = false;

    const modelDir = "src/assets/models/ship/";

    const mtlLoader = new MTLLoader();
    const objLoader = new OBJLoader();
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setPath(modelDir);

    mtlLoader.setPath(modelDir);
    mtlLoader.load("ship.mtl", (materials) => {
      materials.preload();
      objLoader.setMaterials(materials);
      objLoader.setPath(modelDir);
      objLoader.load("ship.obj", (object) => {
        object.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const material = mesh.material as THREE.MeshPhongMaterial;

            material.normalMap = textureLoader.load("normal.jpg");
            material.map = textureLoader.load("diffuse.jpg");
            material.specularMap = textureLoader.load("light.jpg");
            material.needsUpdate = true;
          }
        });
        object.position.set(0, 0, 0);
        const scale = 0.01;
        object.scale.set(scale, scale, scale);
        this.figure = object;
        scene.objects.push(this);
        scene.add(this.figure);

        // Controles
        this.setControls();
      });
    });
  }

  update(deltaTime: number) {
    if (this.figure === undefined) return;

    // Actualiza la rotación
    this.updateRotation(deltaTime);

    // Actualiza la posición
    this.updatePosition(deltaTime);

    // Actualiza sólo si ningún click se ha producido
    if (!this.mousePressed) {
      // Actualiza la posición de la cámara para que siga a la nave
      const offset = new THREE.Vector3(0, 7, -30);
      const cameraPosition = this.figure.position
        .clone()
        .add(offset.applyQuaternion(this.figure.quaternion));
      this.camera.position.lerp(cameraPosition, 0.1);
      this.camera.lookAt(this.figure.position);
    }
  }

  private updateRotation(deltaTime: number) {
    if (this.figure === undefined) return;

    const maxTiltSpeed = 1.5;
    const maxPanSpeed = 1.5;
    const maxRollSpeed = 3;

    // Actualiza la velocidad de inclinación
    const newTiltSpeed = this.tiltSpeed + this.tiltAcceleration * deltaTime;
    if (newTiltSpeed >= -maxTiltSpeed && newTiltSpeed <= maxTiltSpeed) {
      this.tiltSpeed = newTiltSpeed;
    }

    // Actualiza la velocidad de rotación
    const newPanSpeed = this.panSpeed + this.panAcceleration * deltaTime;
    if (newPanSpeed >= -maxPanSpeed && newPanSpeed <= maxPanSpeed) {
      this.panSpeed = newPanSpeed;
    }

    // Actualiza la velocidad del roll
    const newRollSpeed = this.rollSpeed + this.rollAcceleration * deltaTime;
    if (newRollSpeed >= -maxRollSpeed && newRollSpeed <= maxRollSpeed) {
      this.rollSpeed = newRollSpeed;
    }

    // Cuaterniones para las rotaciones
    const tiltQuaterinon = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      this.tiltSpeed * deltaTime,
    );
    const panQuaternion = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      this.panSpeed * deltaTime,
    );
    const rollQuaternion = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      this.rollSpeed * deltaTime,
    );

    const sumOfQuaternions = new THREE.Quaternion().copy(
      this.figure.quaternion,
    );
    sumOfQuaternions
      .multiply(tiltQuaterinon)
      .multiply(panQuaternion)
      .multiply(rollQuaternion);

    this.figure.quaternion.copy(sumOfQuaternions);
  }

  updatePosition(deltaTime: number) {
    if (this.figure === undefined) return;

    // Actualiza la velocidad
    // Si la nave debe detenerse, disminuye la velocidad hasta detenerla
    if (this.shouldStop && this.speed !== 0) {
      const decelerationRate = 0.5;
      const deceleration =
        (this.speed > 0 ? -decelerationRate : decelerationRate) * deltaTime;
      const newSpeed = this.speed + deceleration;
      // La nave ya se detuvo
      if (
        (this.speed > 0 && newSpeed <= 0) ||
        (this.speed < 0 && newSpeed >= 0)
      ) {
        this.speed = 0;
        this.shouldStop = false;
      } else {
        this.speed = newSpeed;
      }
    } else {
      const newSpeed = this.speed + this.acceleration * deltaTime;
      if (newSpeed >= -this.maxSpeed && newSpeed <= this.maxSpeed)
        this.speed = newSpeed;
    }

    // Actualiza la posición de la nave
    const forward = new THREE.Vector3();
    this.figure.getWorldDirection(forward);
    forward.normalize().multiplyScalar(this.speed);
    this.figure.position.add(forward);
  }

  private setControls() {
    const acc = 30;
    window.addEventListener("keydown", (event) => {
      if (!this.figure) return;

      switch (event.key) {
        case "w":
          this.tiltAcceleration = acc;
          break;
        case "s":
          this.tiltAcceleration = -acc;
          break;
        case "a":
          this.panAcceleration = acc;
          break;
        case "d":
          this.panAcceleration = -acc;
          break;
        case "e":
          this.rollAcceleration = acc;
          break;
        case "q":
          this.rollAcceleration = -acc;
          break;
        case "r":
          if (this.speedLevel < 3) {
            this.speedLevel++;
            this.setValsFromSpeedLevel();
          }
          break;
        case "f":
          if (this.speedLevel > -3) {
            this.speedLevel--;
            this.setValsFromSpeedLevel();
          }
          break;
        case " ":
          if (this.speedLevel === 0) {
            this.shouldStop = true;
          }
          break;
        default:
          break;
      }
    });

    window.addEventListener("mousedown", () => {
      this.mousePressed = true;
    });

    window.addEventListener("mouseup", () => {
      this.mousePressed = false;
    });

    window.addEventListener("keyup", (event) => {
      if (!this.figure) return;

      switch (event.key) {
        case "s":
        case "w":
          this.tiltAcceleration = 0;
          this.tiltSpeed = 0;
          break;
        case "d":
        case "a":
          this.panAcceleration = 0;
          this.panSpeed = 0;
          break;
        case "e":
        case "q":
          this.rollAcceleration = 0;
          this.rollSpeed = 0;
          break;
        default:
          break;
      }
    });
  }

  private setValsFromSpeedLevel() {
    let acceleration;
    let maxSpeed;
    switch (this.speedLevel) {
      case 1:
        acceleration = 0.1;
        maxSpeed = 0.2;
        break;
      case 2:
        acceleration = 0.3;
        maxSpeed = 1;
        break;
      case 3:
        acceleration = 0.5;
        maxSpeed = 5;
        break;
      case -1:
        acceleration = -0.1;
        maxSpeed = 0.2;
        break;
      case -2:
        acceleration = -0.3;
        maxSpeed = 1;
        break;
      case -3:
        acceleration = -0.5;
        maxSpeed = 5;
        break;
      case 0:
      default:
        acceleration = 0;
        maxSpeed = 0;
        break;
    }

    this.acceleration = acceleration;
    this.maxSpeed = maxSpeed;
  }
}