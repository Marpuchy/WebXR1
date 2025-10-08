import * as THREE from 'https://unpkg.com/three@0.152.0/build/three.module.js';
// Luz simple
const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
scene.add(light);


// Reticle para indicar lugar de colocación
reticle = new THREE.Mesh(
new THREE.RingGeometry(0.06, 0.09, 32).rotateX(-Math.PI/2),
new THREE.MeshBasicMaterial({color:0x00ff88})
);
reticle.matrixAutoUpdate = false;
reticle.visible = false;
scene.add(reticle);


// Controller para input táctil
controller = renderer.xr.getController(0);
controller.addEventListener('select', onSelect);
scene.add(controller);


// Botones UI
document.getElementById('btn-place').addEventListener('click', ()=>{
placing = !placing;
document.getElementById('btn-place').textContent = placing ? 'Colocando: ON' : 'Colocar';
});
document.getElementById('btn-toggle-shape').addEventListener('click', ()=>{
currentShape = currentShape === 'cube' ? 'sphere' : 'cube';
document.getElementById('btn-toggle-shape').textContent = 'Forma: ' + (currentShape==='cube' ? 'Cubo' : 'Esfera');
});
document.getElementById('btn-clear').addEventListener('click', ()=>{
// quitar todos los objetos excepto reticle
const toRemove = [];
scene.traverse((c)=>{ if(c.userData && c.userData.placeable) toRemove.push(c); });
toRemove.forEach(o=>o.parent.remove(o));
});


// Botón AR (crea sesión AR)
document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] }));


window.addEventListener('resize', onWindowResize);


renderer.setAnimationLoop(render);
}


function onWindowResize(){
camera.aspect = window.innerWidth/window.innerHeight;
camera.updateProjectionMatrix();
renderer.setSize(window.innerWidth, window.innerHeight);
}


async function setupHitTest(session){
const viewerSpace = await session.requestReferenceSpace('viewer');
hitTestSource = await session.requestHitTestSource({space: viewerSpace});
localReferenceSpace = await session.requestReferenceSpace('local');


session.addEventListener('end', ()=>{
hitTestSource = null;
localReferenceSpace = null;
});
}


function onSelect(){
if(!reticle.visible) return;


let mesh;
if(currentShape === 'cube'){
const g = new THREE.BoxGeometry(0.12,0.12,0.12);
const m = new THREE.MeshStandardMaterial({color:Math.random()*0xffffff});
mesh = new THREE.Mesh(g,m);
} else {
const g = new THREE.SphereGeometry(0.07, 32, 32);
const m = new THREE.MeshStandardMaterial({color:Math.random()*0xffffff});
mesh = new THREE.Mesh(g,m);
}
mesh.position.setFromMatrixPosition(reticle.matrix);
mesh.quaternion.setFromRotationMatrix(reticle.matrix);
mesh.userData.placeable = true;
scene.add(mesh);
}


function render(timestamp, frame){
if(frame){
const session = renderer.xr.getSession();
if(!hitTestSource){
setupHitTest(session);
}


const referenceSpace = localReferenceSpace;
const hitTestResults = frame.getHitTestResults(hitTestSource);
if(hitTestResults.length > 0){
const hit = hitTestResults[0];
const pose = hit.getPose(referenceSpace);
reticle.visible = true;
reticle.matrix.fromArray(pose.transform.matrix);
} else {
reticle.visible = false;
}
}


renderer.render(scene, camera);
}
