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
const bgMusic = new Audio('/policesiren2-SF.mp3');
bgMusic.loop = true;
const correctSound = new Audio('/good.mp3');
const wrongSound = new Audio('/bad.mp3');
 
if (sessionStorage.getItem('playMusic') === 'true') {
    sessionStorage.removeItem('playMusic');
    bgMusic.play();
    setTimeout(() => bgMusic.pause(), 5000); 
}

//Mettre le titre correct des films pour le quiz
const FILMS = {
    livre:  { correctTitle: "magnum",                         useApi: true },
    livre2: { correctTitle: "Tyler Rake",                     useApi: false, annee: "2020", genre: "Action",    description: "Un mercenaire est engagé pour sauver le fils d'un baron de la drogue.",                           poster: "/tylerrake.jpg" },
    livre3: { correctTitle: "Alerte cobra",                   useApi: false, annee: "1986", genre: "Policier",  description: "Rex, un berger allemand, aide la police de Vienne à résoudre des crimes.",                      poster: "/alertecobra.jpg" },
    livre4: { correctTitle: "SWAT",                           useApi: true },
    livre5: { correctTitle: "Sherlock",                       useApi: true },
    livre6: { correctTitle: "ROOKIE: Le flic de los Angeles", useApi: false, annee: "2018", genre: "Policier",  description: "Un ancien militaire de 40 ans devient le plus vieux rookie du LAPD.",                            poster: "/rookie.jpg" },
    livre7: { correctTitle: "casa de papel",                  useApi: false, annee: "2017", genre: "Thriller",  description: "Un génie du crime planifie le braquage parfait de la Monnaie royale d'Espagne.",                 poster: "/casadepapel.jpg" },
    livre8: { correctTitle: "lupin",                          useApi: true },
    livre9: { correctTitle: "badboy",                         useApi: true },
    livre10:{ correctTitle: "Columbo",                        useApi: false, annee: "1968", genre: "Policier",  description: "L'inspecteur Colombo résout des meurtres apparemment parfaits avec sa méthode unique.",           poster: "/colombo.jpg" },
    livre11:{ correctTitle: "blacklist",                      useApi: true },
    livre12:{ correctTitle: "hawai5.0",                       useApi: false, annee: "2010", genre: "Policier",  description: "Une unité d'élite de la police d'Hawaï résout les crimes les plus dangereux de l'île.",         poster: "/hawai.jpg" },
    livre13:{ correctTitle: "007",                            useApi: false, annee: "1962", genre: "Action",    description: "James Bond, agent secret britannique, affronte les plus grands criminels du monde.",             poster: "/007.jpg" }
};
//Fournir les positions Z originales pour chaque livre afin de les remettre en place après le quiz
const ORIGINAL_Z = {
    livre:  -0.1,
    livre2: -0.1,
    livre3: -0.1,
    livre4: -0.1,
    livre5: -0.1,
    livre6: -0.1,
    livre7: -0.1,
    livre8: -0.1,
    livre9: -0.1,
    livre10: -0.1,
    livre11: -0.1,
    livre12: -0.1,
    livre13: -0.1
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
let correctCount = 0;
const HALFWAY = 13;
const foundFilms = new Set();

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

    const filmData      = FILMS[currentFilmKey];
    const expectedTitle = filmData.correctTitle;
    const userLower     = userInput.toLowerCase().trim();
    const correctLower  = expectedTitle.toLowerCase().trim();
    const isCorrect     = userLower === correctLower;

    if (!isCorrect) {
        wrongSound.play();
        feedback.textContent = '❌ Mauvaise réponse... Essaie encore !';
        feedback.className = 'feedback-wrong';
        submitBtn.disabled = false;
        input.focus();
        input.select();
        return;
    }

    correctSound.play();
    feedback.textContent = `✅ Exact !`;
    feedback.className = 'feedback-correct';

    if (filmData.useApi) {
        try {
            const data = await getMovieInfo(userInput);
            if (data && data.Response !== "False") {
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
            }
        } catch (e) {
            console.warn('API indisponible');
        }
    } else {
        document.getElementById('movie-title-text').textContent = `${filmData.correctTitle} (${filmData.annee})`;
        document.getElementById('movie-year').textContent = filmData.genre;
        document.getElementById('movie-plot').textContent = filmData.description;
        const poster = document.getElementById('movie-poster');
        if (filmData.poster) {
            poster.src = filmData.poster;
            poster.style.display = 'block';
        } else {
            poster.style.display = 'none';
        }
    }

    movieInfo.classList.add('visible');
    setTimeout(hideQuiz, 5000);
    foundFilms.add(currentFilmKey);
    correctCount++;
    if (correctCount === TOTAL) {
        setTimeout(() => {
            window.location.href = 'halfway.html';
        }, 5100);
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

        gltfLoader.load("/modele/magnum blender.glb", (gltf) => {
            window.livre = gltf.scene;
            armoire.add(window.livre);
            window.livre.position.set(1.1, 0.15, -0.1);
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
            window.livre3.position.set(-0.3, 0.15, -0.1);
            window.livre3.scale.set(0.1, 0.1, 0.1);
        });

        gltfLoader.load("/modele/livre_swat.glb", (gltf) => {
            window.livre4 = gltf.scene;
            armoire.add(window.livre4);
            window.livre4.position.set(1.2, 1.65, -0.1);
            window.livre4.scale.set(0.1, 0.1, 0.1);
        });

        gltfLoader.load("/modele/livre_sherlock.glb", (gltf) => {
            window.livre5 = gltf.scene;
            armoire.add(window.livre5);
            window.livre5.position.set(0.3, 1.35, -0.1);
            window.livre5.scale.set(0.1, 0.1, 0.1);
        });

        gltfLoader.load("/modele/LCA.glb", (gltf) => {
            window.livre6 = gltf.scene;
            armoire.add(window.livre6);
            window.livre6.position.set(0.7, 1.35, -0.1);
            window.livre6.scale.set(0.1, 0.1, 0.1);
        });

        gltfLoader.load("/modele/livre_casadepapel.glb", (gltf) => {
            window.livre7 = gltf.scene;
            armoire.add(window.livre7);
            window.livre7.position.set(0.3, 1.03, -0.1);
            window.livre7.scale.set(0.1, 0.1, 0.1);
        });

        gltfLoader.load("/modele/lupin.glb", (gltf) => {
            window.livre8 = gltf.scene;
            armoire.add(window.livre8);
            window.livre8.position.set(0.3, 0.73, -0.1);
            window.livre8.scale.set(0.1, 0.1, 0.1);
        });

        gltfLoader.load("/modele/livre_badboy.glb", (gltf) => {
            window.livre9 = gltf.scene;
            armoire.add(window.livre9);
            window.livre9.position.set(0.3, 0.42, -0.1);
            window.livre9.scale.set(0.1, 0.1, 0.1);
        });


        gltfLoader.load("/modele/Colombo.glb", (gltf) => {
            window.livre10 = gltf.scene;
            armoire.add(window.livre10);
            window.livre10.position.set(0.1, 0.73, -0.1);
            window.livre10.scale.set(0.1, 0.1, 0.1);
        });

        gltfLoader.load("/modele/livre_blacklist.glb", (gltf) => {
            window.livre11 = gltf.scene;
            armoire.add(window.livre11);
            window.livre11.position.set(0.7, 0.73, -0.1);
            window.livre11.scale.set(0.1, 0.1, 0.1);
        });

        gltfLoader.load("/modele/hawaï5.0.glb", (gltf) => {
            window.livre12 = gltf.scene;
            armoire.add(window.livre12);
            window.livre12.position.set(1, 0.73, -0.1);
            window.livre12.scale.set(0.1, 0.1, 0.1);
        });

        gltfLoader.load("/modele/astonmartin.glb", (gltf) => {
            window.livre13 = gltf.scene;
            armoire.add(window.livre13);
            window.livre13.position.set(0.8, 1.03, -0.1);
            window.livre13.scale.set(0.1, 0.1, 0.1);
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

                    controls.minPolarAngle = Math.PI / 4;   
                    controls.maxPolarAngle = Math.PI / 2.5 ;
                    controls.enablePan = true;

                    controls.minAzimuthAngle = 0;
                    controls.maxAzimuthAngle =  Math.PI / 2;

                    controls.minDistance = 0.2;
                    controls.maxDistance = 5;

                    controls.enableDamping = true;
                    controls.dampingFactor = 0.05;
                   

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
     if (foundFilms.has(currentFilmKey)) {
        activeObject = null;
        currentFilmKey = null;
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
        x: targetPos.x ,
        y: targetPos.y + 0.3,
        z: targetPos.z + 1,
        duration: 1.5,
        ease: "power2.inOut"
    });

    gsap.to(controls.target, {
        x: targetPos.x,
        y: targetPos.y - 0.5,
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
    if (foundFilms.has(filmKey)) return;
   if (activeObject === livreObj) {
        hideQuiz();
        gsap.to(livreObj.position, {
            z: ORIGINAL_Z[filmKey],
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: () => {
                activeObject = null;
                currentFilmKey = null;
            }
        });
        return;
    }
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
    if (window.livre7 && raycaster.intersectObject(window.livre7, true).length > 0) { handleClick(window.livre7, 'livre7'); return; }
    if (window.livre8 && raycaster.intersectObject(window.livre8, true).length > 0) { handleClick(window.livre8, 'livre8'); return; }
    if (window.livre9 && raycaster.intersectObject(window.livre9, true).length > 0) { handleClick(window.livre9, 'livre9'); return; }
    if (window.livre10 && raycaster.intersectObject(window.livre10, true).length > 0) { handleClick(window.livre10, 'livre10'); return; }
    if (window.livre11 && raycaster.intersectObject(window.livre11, true).length > 0) { handleClick(window.livre11, 'livre11'); return; }
    if (window.livre12 && raycaster.intersectObject(window.livre12, true).length > 0) { handleClick(window.livre12, 'livre12'); return; }
    if (window.livre13 && raycaster.intersectObject(window.livre13, true).length > 0) { handleClick(window.livre13, 'livre13'); return; }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

