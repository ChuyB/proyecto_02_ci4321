import { OrbitControls } from "three/examples/jsm/Addons.js";
import "./style.css";
import * as THREE from "three";

const init = () => {
  // Se crea la escena
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

  // Se crea el renderizador
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Se crea la cámara
  const camera = new THREE.PerspectiveCamera(
    90,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.set(100, 50, 0); // Posición inical de la cámara

  // Controles generales
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.maxPolarAngle = Math.PI / 2;
  controls.keyPanSpeed = 30;
  // WASD
  // controls.listenToKeyEvents(window);
  // controls.keys = {
  //   LEFT: "KeyA",
  //   UP: "KeyW",
  //   RIGHT: "KeyD",
  //   BOTTOM: "KeyS",
  // };

  // Se añade el suelo de la escena
  const groundGeometry = new THREE.PlaneGeometry(1600, 1600);
  const groundMaterial = new THREE.MeshPhongMaterial({
    color: 0x5c4327,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.updateMatrix();
  scene.add(ground);

  // Iluminación
  // Luz direccional
  const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  // Luz ambiental
  const light = new THREE.AmbientLight(0xffffff);
  scene.add(light);

  // Se añade un listener para el evento de resize
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Se inicia la animación
  const animate = () => {
    controls.update();
    renderer.render(scene, camera);
  };
  renderer.setAnimationLoop(animate);
};

init();
