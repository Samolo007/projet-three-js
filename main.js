import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';

const canvas = document.querySelector('.webgl1');
const scene = new THREE.Scene();

// --- CONFIGURATION DU FOND (Option 2) ---
// On choisit une couleur gris/bleu doux pour remplacer le noir
const bgColor = 0x1a1a1a; 
scene.background = new THREE.Color(bgColor);

// Ajout du brouillard : les objets s'effacent doucement à partir de 10 unités 
// et deviennent totalement invisibles (couleur du fond) à 1500 unités.
scene.fog = new THREE.Fog(bgColor, 10, 1500);

// === CAMÉRA ===
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(200, 200, 200); 

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, renderer.domElement);
controls.enabled = false; 

// Lumières
scene.add(new THREE.AmbientLight(0xffffff, 1.5));
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(100, 100, 100);
scene.add(directionalLight);

const gltfLoader = new GLTFLoader();

gltfLoader.load("modele/Untitled2.glb", (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    const armoire = model.getObjectByName("Object_18");

    if (armoire) {
        const worldPos = new THREE.Vector3();
        armoire.getWorldPosition(worldPos);

        controls.target.set(worldPos.x, worldPos.y, worldPos.z);
        controls.update();

        // === ANIMATION INTRO ===
        setTimeout(() => {
            // Zoomer vers l'armoire
            gsap.to(camera.position, {
                duration: 3,
                x: worldPos.x,
                y: worldPos.y + 3, 
                z: worldPos.z + 4, 
                ease: "power3.inOut"
            });

            // S'assurer que la caméra regarde toujours l'armoire
            gsap.to(controls.target, {
                duration: 3,
                x: worldPos.x,
                y: worldPos.y,
                z: worldPos.z,
                ease: "power3.inOut",
                onUpdate: () => controls.update(),
                onComplete: () => {
                    controls.enabled = true;

                    // Limites de rotation pour rester dans la pièce
                    controls.minPolarAngle = Math.PI / 3; 
                    controls.maxPolarAngle = Math.PI / 1.8; 

                    controls.minAzimuthAngle = -Math.PI / 6;
                    controls.maxAzimuthAngle = Math.PI / 6; 

                    // Limites de zoom et fluidité
                    controls.enableDamping = true;
                    controls.maxDistance = 5; 
                }
            });
        }, 1000);
    }
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});