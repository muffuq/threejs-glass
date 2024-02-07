import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gsap from "gsap";

// Canvas
let backCanvas;
const canvas = document.querySelector("canvas.webgl");

// Scene
// Background Color White
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Mouse Event

const mouse = { x: 0, y: 0 };



// Loaders

const gltfLoader = new GLTFLoader();

gltfLoader.load(
  "glass.glb",
  (gltf) => {
    console.log("success");
    console.log(gltf);
    const root = gltf.scene;
    root.children[0].material = new THREE.MeshPhysicalMaterial({
      metalness: 0.01,
      roughness: 0,
      transmission: 1,
      transparent: true,
      thickness: 2,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });
    root.children[1].visible = false;
    root.children[0].position.z = 1;
    root.children[0].position.y = 0;
    root.children[0].position.x = 0;
    root.children[0].rotation.x = 0;
    root.children[0].rotation.y = 0;
    root.children[0].rotation.z = 0;
    // Mouse Event
    window.addEventListener("mousemove", (event) => {
      mouse.x = -(event.clientX / sizes.width) * 2 + 1;
      mouse.y = -(event.clientY / sizes.height) * 2 + 1;

      gsap.to(root.rotation, {
        y: mouse.x * 0.3,
        x: mouse.y * 0.3,
        duration: 0.5,
      });
    } );
    scene.add(root);
  },
  (progress) => {
  },
  (error) => {
    console.log(error);
  }
);

// Light

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
// scene.add(ambientLight)

const pointLight = new THREE.PointLight(0xf0efff, 80);
pointLight.position.x = 0;
pointLight.position.y = 1;
pointLight.position.z = 6;
scene.add(pointLight);

// const rectAreaLight = new THREE.RectAreaLight(0xffff, 10, 10, Math.PI * 2, 1, 1)
// rectAreaLight.position.x = 0
// rectAreaLight.position.y = 2
// rectAreaLight.position.z = 3
// scene.add(rectAreaLight)

/**
 * Object
 */

backCanvas = document.createElement("canvas");
const backPlaneGeomatry = new THREE.PlaneGeometry(50, 50);
const backPlanMesh = new THREE.Mesh(
  backPlaneGeomatry,
  createBackgroundMaterial()
);
backPlanMesh.position.y = -1;
scene.add(backPlanMesh);

function createBackgroundMaterial() {
  const width = (backCanvas.width = 3000 * 1.5);
  const height = (backCanvas.height = 3000);
  const ctx = backCanvas.getContext("2d");

  ctx.rect(0, 0, width, height);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.fillStyle = "#000";
  ctx.font = "bold 180px 'Unbounded', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("İgoaimalathane", 0.5 * width, 0.5 * height, width);
  
  return new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(backCanvas),
  });
}

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);


camera.position.z = 10;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.antialias = true;
/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
