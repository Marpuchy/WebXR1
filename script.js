import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164/build/three.module.js';
import { ARButton } from 'https://cdn.jsdelivr.net/npm/three@0.164/examples/jsm/webxr/ARButton.js';

let camera, scene, renderer, controller;

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    20
  );

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  document.body.appendChild(
    ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] })
  );

  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);

  controller = renderer.xr.getController(0);
  controller.addEventListener('select', onSelect);
  scene.add(controller);

  window.addEventListener('resize', onWindowResize);
}

// Función para crear la Pokéball
function createPokeball() {
  const pokeball = new THREE.Group();

  // Semiesfera roja (arriba)
  const redMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const redSphere = new THREE.SphereGeometry(0.07, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
  const redMesh = new THREE.Mesh(redSphere, redMaterial);
  redMesh.position.y = 0.035; // ajustar al centro
  pokeball.add(redMesh);

  // Semiesfera blanca (abajo)
  const whiteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const whiteSphere = new THREE.SphereGeometry(0.07, 32, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  const whiteMesh = new THREE.Mesh(whiteSphere, whiteMaterial);
  whiteMesh.position.y = -0.035; 
  pokeball.add(whiteMesh);

  // Línea negra central
  const blackMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const line = new THREE.CylinderGeometry(0.072, 0.072, 0.005, 32);
  const lineMesh = new THREE.Mesh(line, blackMaterial);
  lineMesh.rotation.x = Math.PI / 2;
  pokeball.add(lineMesh);

  // Botón central
  const buttonMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const button = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.01, 32), buttonMaterial);
  button.position.z = 0.072 / 2;
  pokeball.add(button);

  return pokeball;
}

function onSelect() {
  const pokeball = createPokeball();
  pokeball.position.set(0, 0, -0.5).applyMatrix4(controller.matrixWorld);
  pokeball.quaternion.setFromRotationMatrix(controller.matrixWorld);
  scene.add(pokeball);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  renderer.setAnimationLoop(() => renderer.render(scene, camera));
}
