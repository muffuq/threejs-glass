import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Text } from 'troika-three-text'
import { MeshTransmissionMaterial, MeshDiscardMaterial } from "@pmndrs/vanilla";
import gsap from "gsap";

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Canvas
const canvas = document.querySelector("canvas.webgl");

let meshTransmissionMaterialUpdate = () => {};

const params = {
  transparentBG: true,
  bgColor: new THREE.Color()
};

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.antialias = false;

// Scene
// Background Color White
const scene = new THREE.Scene();

// Mouse Event

const mouse = { x: 0, y: 0 };



// Loaders

const gltfLoader = new GLTFLoader();

gltfLoader.load(
  "glass.glb",
  (gltf) => {
    const mtmParams = {
      customBackground: scene.background,
      backside: false,
      thickness: 2,
      backsideThickness: 0.5
    };
    const root = gltf.scene;
    const material = new MeshTransmissionMaterial({
      anisotropicBlur: 0.5,
    });
    const discardMaterial = new MeshDiscardMaterial();
    root.children[1].visible = false;
    root.children[0].position.set(0, 0, 1);
    root.children[0].rotation.set(0, 0, 0);

    root.traverse((child) => {
      if (child.isMesh) {
        console.log(child.name)
        child.material = material;
        child.castShadow = false;
        child.receiveShadow = false;
        child.material.color = new THREE.Color("#f2f2f2");
      }
    });
    material.reflectivity = 0.04;

    const fboBack = new THREE.WebGLRenderTarget(256, 256, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      colorSpace: renderer.outputColorSpace,
      type: THREE.HalfFloatType
    });
    const fboMain = new THREE.WebGLRenderTarget(256, 256, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      colorSpace: renderer.outputColorSpace,
      type: THREE.HalfFloatType
    });

    const mtm = material;
    mtm.buffer = fboMain.texture;
    let oldBg;
    let oldTone;
    let oldSide;
    const state = {
      gl: renderer,
      scene,
      camera
    };

    const clock = new THREE.Clock(true);

    meshTransmissionMaterialUpdate = () => {
      mtm.time = clock.getElapsedTime();
  
      for (const mesh of root.children) {
        const parent = mesh;
  
        if (mtm.buffer === fboMain.texture) {
          // Save defaults
          oldTone = state.gl.toneMapping;
          oldBg = state.scene.background;
          oldSide = parent.material.side;
  
          // Switch off tonemapping lest it double tone maps
          // Save the current background and set the HDR as the new BG
          // Use discardMaterial, the parent will be invisible, but it's shadows will still be cast
          state.gl.toneMapping = THREE.NoToneMapping;
          if (mtmParams.background) state.scene.background = mtmParams.background;
          parent.material = discardMaterial;
  
          // Render into the main buffer
          state.gl.setRenderTarget(fboMain);
          state.gl.render(state.scene, state.camera);
  
          parent.material = mtm;
          parent.material.thickness = mtmParams.thickness;
          parent.material.side = oldSide;
          parent.material.buffer = fboMain.texture;
  
          // Set old state back
          state.scene.background = oldBg;
          state.gl.setRenderTarget(null);
          parent.material = mtm;
          state.gl.toneMapping = oldTone;
        }
      }
    }

    // Mouse Event
    window.addEventListener("mousemove", (event) => {
      mouse.x = -(event.clientX / sizes.width) * 2 + 1;
      mouse.y = -(event.clientY / sizes.height) * 2 + 1;

      gsap.to(root.rotation, {
        y: mouse.x * 0.3,
        x: mouse.y * 0.3,
        duration: 0.5,
      });
    });
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

const backPlaneGeomatry = new THREE.PlaneGeometry(50, 50);
const material = new THREE.MeshBasicMaterial({
  color: new THREE.Color('#fffff'),
  side: THREE.DoubleSide,
  transparent: true,
});
const backPlanMesh = new THREE.Mesh(
  backPlaneGeomatry,
  material
);
backPlanMesh.position.y = -1;
scene.add(backPlanMesh);

// Text

const text = new Text()
const textMaterial = new THREE.MeshBasicMaterial({
  color: new THREE.Color('black'),
  transparent: true,
})
text.text = 'İgoaimalathane'
text.fontWeight = 'bold'
text.fontSize = 2
text.anchorX = 'center'
text.anchorY = 'middle'
text.position.z = 0.01
text.material = textMaterial
scene.add(text)


// Light

const ambientLight = new THREE.AmbientLight(0xffffff, 1);

const pointLight = new THREE.PointLight(0xf0efff, 80);
pointLight.position.x = 0;
pointLight.position.y = 1;
pointLight.position.z = 6;
scene.add(pointLight);

const spotLight = new THREE.SpotLight(0xffffff, 1000, 1000, Math.PI / 2, 0.5, 1);
spotLight.position.x = 0;
spotLight.position.y = 0;
spotLight.position.z = 10;
scene.add(spotLight);

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
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Update Material
  meshTransmissionMaterialUpdate();
  

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
