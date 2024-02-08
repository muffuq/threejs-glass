import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {Text} from 'troika-three-text'
import gsap from "gsap";

// Canvas
let backCanvas;
const canvas = document.querySelector("canvas.webgl");

// Scene
// Background Color White
const scene = new THREE.Scene();

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

/**
 * Object
 */

backCanvas = document.createElement("canvas");
const backPlaneGeomatry = new THREE.PlaneGeometry(50, 50);
const material = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
});
const backPlanMesh = new THREE.Mesh(
  backPlaneGeomatry,
  material
);
backPlanMesh.position.y = -1;
scene.add(backPlanMesh);

// Text

const text = new Text()
text.text = 'İgoaimalathane'
text.fontWeight = 'bold'
text.fontSize = 2
text.anchorX = 'center'
text.anchorY = 'middle'
text.material = new THREE.MeshBasicMaterial({
  color: 0x000000, 
  side: THREE.FrontSide, 
  depthTest: true,
  transparent: false
})
text.position.z = 0.01

scene.add(text)
text.sync()


// Light

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
// scene.add(ambientLight)

const pointLight = new THREE.PointLight(0xf0efff, 80);
pointLight.position.x = 0;
pointLight.position.y = 1;
pointLight.position.z = 6;
scene.add(pointLight);

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
