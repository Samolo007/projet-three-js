import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import { getMovieInfo } from './API.js';


const canvas = document.querySelector('.webgl1');
const scene = new THREE.Scene();

const bgColor = 0x1a1a1a;
scene.background = new THREE.Color(bgColor);
scene.fog = new THREE.Fog(bgColor, 10, 1500);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(200, 200, 200);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, renderer.domElement);
controls.enabled = false;

scene.add(new THREE.AmbientLight(0xffffff, 1.5));
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(100, 100, 100);
scene.add(directionalLight);

const gltfLoader = new GLTFLoader();

//Mettre le titre correct des films pour le quiz
const FILMS = {
<<<<<<< HEAD
    livre:  { correctTitle: "Magnum" },
    livre2: { correctTitle: "Tyler Rake" },
    livre3: { correctTitle: " Alerte cobra" },
    livre4: { correctTitle: "SWAT" },
    livre5: { correctTitle: "Sherlock" },
    livre6: { correctTitle: "ROOKIE: Le flic de los Angeles" }
=======
    livre:  { correctTitle: "MAGNUM" },
    livre2: { correctTitle: "TYLER RAKE" },
    livre3: { correctTitle: "ALERTE COBRA" },
    livre3: { correctTitle: "ALERTE COBRA" },
    livre4: { correctTitle: "SWAT" },
    livre5: { correctTitle: "SHERLOCK" }
>>>>>>> 6000c3748a821467be8707700006062a40f8d6f2
};
//Fournir les positions Z originales pour chaque livre afin de les remettre en place après le quiz
const ORIGINAL_Z = {
    livre:  -0.1,
    livre2: -0.1,
    livre3: -0.1,
    livre4: -0.1,
    livre5: -0.1,
    livre6: -0.1
};

// ============================================================
// === QUIZ LOGIC
// ============================================================

const overlay   = document.getElementById('quiz-overlay');
const panel     = document.getElementById('quiz-panel');
const input     = document.getElementById('quiz-input');
const submitBtn = document.getElementById('quiz-submit');
const feedback  = document.getElementById('quiz-feedback');
const movieInfo = document.getElementById('movie-info');

let currentFilmKey = null;
let activeObject   = null;

function showQuiz(filmKey) {
    currentFilmKey = filmKey;
    overlay.style.display = 'flex';
    panel.style.animation = 'none';
    panel.offsetHeight;
    panel.style.animation = '';
    input.value = '';
    feedback.textContent = '';
    feedback.className = '';
    movieInfo.classList.remove('visible');
    submitBtn.disabled = false;
    input.focus();
}

function hideQuiz() {
    overlay.style.display = 'none';
    currentFilmKey = null;
}

async function handleSubmit() {
    const userInput = input.value.trim();
    if (!userInput || !currentFilmKey) return;

    submitBtn.disabled = true;
    feedback.textContent = '⏳ Recherche en cours...';
    feedback.className = 'feedback-loading';

    const expectedTitle = FILMS[currentFilmKey].correctTitle;

    try {
        const data = await getMovieInfo(userInput);

        const apiTitle     = data?.Title?.toLowerCase().trim() ?? '';
        const correctLower = expectedTitle.toLowerCase().trim();
        const userLower    = userInput.toLowerCase().trim();
        const isCorrect    = apiTitle === correctLower || userLower === correctLower;

        if (data && data.Response !== "False" && isCorrect) {
            feedback.textContent = `✅ Exact ! C'est bien "${data.Title}" !`;
            feedback.className = 'feedback-correct';

            document.getElementById('movie-title-text').textContent = `${data.Title} (${data.Year})`;
            document.getElementById('movie-year').textContent = `⭐ ${data.imdbRating} / 10  •  ${data.Genre}`;
            document.getElementById('movie-plot').textContent = data.Plot;

            const poster = document.getElementById('movie-poster');
            if (data.Poster && data.Poster !== 'N/A') {
                poster.src = data.Poster;
                poster.style.display = 'block';
            } else {
                poster.style.display = 'none';
            }
            movieInfo.classList.add('visible');
            setTimeout(hideQuiz, 5000);

        } else {
            feedback.textContent = '❌ Mauvaise réponse... Essaie encore !';
            feedback.className = 'feedback-wrong';
            submitBtn.disabled = false;
            input.focus();
            input.select();
        }

    } catch (e) {
        feedback.textContent = '⚠️ Erreur réseau, réessaie.';
        feedback.className = 'feedback-wrong';
        submitBtn.disabled = false;
    }
}

document.getElementById('quiz-close').addEventListener('click', hideQuiz);
submitBtn.addEventListener('click', handleSubmit);
input.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSubmit(); });

// ============================================================
// === CHARGEMENT DES MODÈLES
// ============================================================
gltfLoader.load("/modele/Untitled2.glb", (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    const armoire = model.getObjectByName("Object_18");

    if (armoire) {
        const worldPos = new THREE.Vector3();
        armoire.getWorldPosition(worldPos);

        controls.target.set(worldPos.x, worldPos.y, worldPos.z);

        gltfLoader.load("/modele/ferrari blender.glb", (gltf) => {
            window.livre = gltf.scene;
            armoire.add(window.livre);
            window.livre.position.set(0, 0.15, -0.1);
            window.livre.scale.set(0.1, 0.1, 0.1);
        });

        gltfLoader.load("/modele/TylerRake.glb", (gltf) => {
            window.livre2 = gltf.scene;
            armoire.add(window.livre2);
            window.livre2.position.set(-0.3, 1.65, -0.1);
            window.livre2.scale.set(0.1, 0.1, 0.1);
        });

        gltfLoader.load("/modele/alertecobra.glb", (gltf) => {
            window.livre3 = gltf.scene;
            armoire.add(window.livre3);
            window.livre3.position.set(0.3, 0.15, -0.1);
            window.livre3.scale.set(0.1, 0.1, 0.1);
        });

        gltfLoader.load("/modele/livre_swat.glb", (gltf) => {
            window.livre4 = gltf.scene;
            armoire.add(window.livre4);
            window.livre4.position.set(0.3, 1.65, -0.1);
            window.livre4.scale.set(0.1, 0.1, 0.1);
        });

        gltfLoader.load("/modele/livre_sherlock.glb", (gltf) => {
            window.livre5 = gltf.scene;
            armoire.add(window.livre5);
            window.livre5.position.set(0.3, 1, -0.1);
            window.livre5.scale.set(0.1, 0.1, 0.1);
        });
        gltfLoader.load("/modele/LCA.glb", (gltf) => {
            window.livre6 = gltf.scene;
            armoire.add(window.livre6);
            window.livre6.position.set(0.7, 1.35, -0.1);
            window.livre6.scale.set(0.1, 0.1, 0.1);
        });

        controls.update();

        setTimeout(() => {
            gsap.to(camera.position, {
                duration: 3,
                x: worldPos.x,
                y: worldPos.y + 3,
                z: worldPos.z + 4,
                ease: "power3.inOut"
            });

            gsap.to(controls.target, {
                duration: 3,
                x: worldPos.x,
                y: worldPos.y,
                z: worldPos.z,
                ease: "power3.inOut",
                onUpdate: () => controls.update(),
                onComplete: () => {
                    controls.enabled = true;

                    // ── VERTICAL : de presque le plafond jusqu'au sol ──
                    controls.minPolarAngle = Math.PI / 3;   
                    controls.maxPolarAngle = Math.PI / 3; // ~112° → peut regarder en bas

                    // ── HORIZONTAL : 90° de chaque côté pour explorer la pièce ──
                    controls.minAzimuthAngle = -Math.PI / 2;
                    controls.maxAzimuthAngle =  Math.PI / 2;

                    // ── ZOOM : reste dans la pièce ──
                    controls.minDistance = 0.2;
                    controls.maxDistance = 5;

                    controls.enableDamping = true;
                    controls.dampingFactor = 0.08;
                }
            });
        }, 1000);
    }
});

// ============================================================
// === BOUCLE D'ANIMATION
// ============================================================
function animate() {
    requestAnimationFrame(animate);
    if (controls.enableDamping) controls.update();
    renderer.render(scene, camera);
}
animate();

// ============================================================
// === REMISE EN PLACE DE L'OBJET PRÉCÉDENT
// ============================================================
function resetPrevious(onDone) {
    if (!activeObject || !currentFilmKey) {
        onDone();
        return;
    }

    const key = currentFilmKey;
    const obj = activeObject;
    hideQuiz();

    gsap.to(obj.position, {
        z: ORIGINAL_Z[key],
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => { 
            activeObject = null;
            onDone();
        }
    });
}

// ============================================================
// === ZOOM VERS UN NOUVEL OBJET
// ============================================================
function zoomToObject(targetPos, livreObj, filmKey) {
    activeObject   = livreObj;
    currentFilmKey = filmKey;

    gsap.to(camera.position, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z + 1,
        duration: 1.5,
        ease: "power2.inOut"
    });

    gsap.to(controls.target, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 1.5,
        onUpdate: () => { camera.lookAt(targetPos); }
    });

    gsap.to(livreObj.position, {
        z: 0.5,
        duration: 1.2,
        ease: "back.out(1.7)",
        onComplete: () => showQuiz(filmKey)
    });
}

// ============================================================
// === GESTION DES CLICS
// ============================================================
function handleClick(livreObj, filmKey) {
    if (activeObject === livreObj) return;
    const targetPos = new THREE.Vector3();
    livreObj.getWorldPosition(targetPos);
    resetPrevious(() => zoomToObject(targetPos, livreObj, filmKey));
}

window.addEventListener('click', (event) => {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    if (window.livre  && raycaster.intersectObject(window.livre,  true).length > 0) { handleClick(window.livre,  'livre');  return; }
    if (window.livre2 && raycaster.intersectObject(window.livre2, true).length > 0) { handleClick(window.livre2, 'livre2'); return; }
    if (window.livre3 && raycaster.intersectObject(window.livre3, true).length > 0) { handleClick(window.livre3, 'livre3'); return; }
    if (window.livre4 && raycaster.intersectObject(window.livre4, true).length > 0) { handleClick(window.livre4, 'livre4'); return; }
    if (window.livre5 && raycaster.intersectObject(window.livre5, true).length > 0) { handleClick(window.livre5, 'livre5'); return; }
    if (window.livre6 && raycaster.intersectObject(window.livre6, true).length > 0) { handleClick(window.livre6, 'livre6'); return; }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});


