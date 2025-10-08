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

function onSelect() {
  const geometry = Math.random() > 0.5
    ? new THREE.BoxGeometry(0.1, 0.1, 0.1)
    : new THREE.SphereGeometry(0.07, 16, 16);

  const material = new THREE.MeshStandardMaterial({
    color: Math.random() * 0xffffff
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 0, -0.5).applyMatrix4(controller.matrixWorld);
  mesh.quaternion.setFromRotationMatrix(controller.matrixWorld);
  scene.add(mesh);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  renderer.setAnimationLoop(() => renderer.render(scene, camera));
}
