import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Helper to create iris canvas textures based on mood
function createEyeTexture(mood, eyeColor, isSleeping) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, 256, 256);

  if (isSleeping) {
    // Closed happy sleeping eye: cute bold curve
    ctx.strokeStyle = "#3A3A55";
    ctx.lineWidth = 18;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(128, 110, 68, 0.2 * Math.PI, 0.8 * Math.PI, false);
    ctx.stroke();

    // Small cute eyelashes
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(76, 155); ctx.lineTo(60, 175);
    ctx.moveTo(180, 155); ctx.lineTo(196, 175);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }

  // Sclera (White base)
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(128, 128, 124, 0, Math.PI * 2);
  ctx.fill();

  // Thin outer border
  ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
  ctx.lineWidth = 6;
  ctx.stroke();

  const m = mood?.toLowerCase() || "happy";

  if (m.includes("ecstatic")) {
    // Star eyes!
    const bgGrad = ctx.createRadialGradient(128, 128, 10, 128, 128, 110);
    bgGrad.addColorStop(0, "#FFF9C4");
    bgGrad.addColorStop(1, "#FFE082");
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.arc(128, 128, 110, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#FFB300";
    ctx.font = "bold 130px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⭐", 128, 134);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }

  if (m.includes("loved")) {
    // Heart eyes!
    const bgGrad = ctx.createRadialGradient(128, 128, 10, 128, 128, 110);
    bgGrad.addColorStop(0, "#FCE4EC");
    bgGrad.addColorStop(1, "#F8BBD0");
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.arc(128, 128, 110, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#E91E63";
    ctx.font = "bold 125px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("💖", 128, 134);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }

  if (m.includes("sick")) {
    // Dizzy / X eyes
    ctx.strokeStyle = "#888899";
    ctx.lineWidth = 22;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(65, 65); ctx.lineTo(191, 191);
    ctx.moveTo(191, 65); ctx.lineTo(65, 191);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }

  // Big Shiny Anime Iris
  const grad = ctx.createRadialGradient(128, 110, 15, 128, 135, 95);
  grad.addColorStop(0, eyeColor || "#4A4A8A");
  grad.addColorStop(0.75, eyeColor || "#2A2A60");
  grad.addColorStop(1, "#151528");

  ctx.fillStyle = grad;
  ctx.beginPath();
  if (m.includes("sleepy")) {
    ctx.ellipse(128, 142, 85, 55, 0, 0, Math.PI * 2);
  } else {
    ctx.arc(128, 128, 90, 0, Math.PI * 2);
  }
  ctx.fill();

  // Dark pupil
  ctx.fillStyle = "#111122";
  ctx.beginPath();
  if (m.includes("sleepy")) {
    ctx.ellipse(128, 146, 45, 28, 0, 0, Math.PI * 2);
  } else if (m.includes("annoyed")) {
    ctx.ellipse(128, 128, 28, 65, 0, 0, Math.PI * 2);
  } else {
    ctx.arc(128, 128, 52, 0, Math.PI * 2);
  }
  ctx.fill();

  // Crisp anime specular reflections
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(95, 95, 28, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.beginPath();
  ctx.arc(160, 158, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  ctx.beginPath();
  ctx.arc(105, 158, 9, 0, Math.PI * 2);
  ctx.fill();

  // Droopy eyelid for sad/hungry
  if (m.includes("sad") || m.includes("hungry") || m.includes("dirty")) {
    ctx.fillStyle = "rgba(30, 20, 50, 0.25)";
    ctx.beginPath();
    ctx.arc(128, 60, 110, 0, Math.PI);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export default function Pet3D({
  petType,
  mood,
  growthStage,
  activeAction,
  onPoke,
  isSleeping,
  width = 270,
  height = 270,
}) {
  const mountRef = useRef(null);
  const stateRef = useRef({
    activeAction,
    isSleeping,
    mood,
    pokeBounce: 0,
    actionTimer: 0,
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    isDragging: false,
    dragStartX: 0,
    dragRotY: 0,
  });

  const [hasWebGL, setHasWebGL] = useState(true);

  // Keep stateRef up to date with props without re-initializing Three.js
  useEffect(() => {
    stateRef.current.activeAction = activeAction;
    stateRef.current.isSleeping = isSleeping;
    stateRef.current.mood = mood?.label || "happy";
  }, [activeAction, isSleeping, mood]);

  // Handle Poke trigger animation
  const handlePokeClick = (e) => {
    e.stopPropagation();
    stateRef.current.pokeBounce = 1.0;
    if (onPoke) onPoke();
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL support
    try {
      const testCanvas = document.createElement("canvas");
      if (!window.WebGLRenderingContext || !testCanvas.getContext("webgl")) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    // ── Three.js Scene Setup ──
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.25, 5.0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // ── Lighting Setup (Talking Tom studio 3D lighting) ──
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xd8d0f0, 1.3);
    scene.add(hemiLight);

    const mainLight = new THREE.DirectionalLight(0xfff8ee, 1.5);
    mainLight.position.set(3.5, 5.5, 4.5);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xb4d0ff, 0.9);
    fillLight.position.set(-3.5, 2.5, -2.5);
    scene.add(fillLight);

    const frontLight = new THREE.PointLight(0xffffff, 0.7, 10);
    frontLight.position.set(0, 1.0, 3.2);
    scene.add(frontLight);

    // ── Pet Materials ──
    const colors = petType.colors;
    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colors.body),
      roughness: 0.36,
      metalness: 0.04,
    });

    const bellyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colors.belly),
      roughness: 0.42,
      metalness: 0.02,
    });

    const innerMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colors.inner),
      roughness: 0.48,
      metalness: 0.02,
    });

    const darkMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colors.outline || "#222233"),
      roughness: 0.35,
      metalness: 0.05,
    });

    const cheekMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colors.cheek || "#FFB0C0"),
      roughness: 0.6,
      transparent: true,
      opacity: 0.6,
    });

    // ── Hierarchy Setup ──
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Base scale per growth stage
    const baseScale = (growthStage?.scale || 1) * 0.95;
    rootGroup.scale.set(baseScale, baseScale, baseScale);

    // Character Group
    const charGroup = new THREE.Group();
    rootGroup.add(charGroup);
    charGroup.position.y = -0.15;

    const proceduralGroup = new THREE.Group();
    charGroup.add(proceduralGroup);

    const gltfGroup = new THREE.Group();
    charGroup.add(gltfGroup);
    gltfGroup.visible = false;
    let isGLTFLoaded = false;

    // Load dog.glb if pet is dog
    if (petType.id === "dog") {
      const gltfLoader = new GLTFLoader();
      gltfLoader.register(parser => ({
        name: "KHR_materials_pbrSpecularGlossiness",
        getMaterialType: () => THREE.MeshStandardMaterial,
        extendMaterialParams: async (materialIndex, materialParams) => {
          const materialDef = parser.json.materials[materialIndex];
          if (!materialDef.extensions || !materialDef.extensions.KHR_materials_pbrSpecularGlossiness) return;
          const pbr = materialDef.extensions.KHR_materials_pbrSpecularGlossiness;
          if (pbr.diffuseTexture !== undefined) {
            materialParams.map = await parser.getDependency("texture", pbr.diffuseTexture.index);
          }
        }
      }));

      gltfLoader.load(
        "/dog.glb",
        (gltf) => {
          const model = gltf.scene;
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const targetScale = 3.5 / maxDim;

          model.scale.setScalar(targetScale);
          model.position.set(-center.x * targetScale, -box.min.y * targetScale - 1.02, -center.z * targetScale);
          model.rotation.y = -0.7;

          model.traverse(child => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                child.material.roughness = 0.5;
                child.material.metalness = 0.05;
                if (child.material.map) {
                  child.material.map.colorSpace = THREE.SRGBColorSpace;
                }
                child.material.needsUpdate = true;
              }
            }
          });

          gltfGroup.add(model);
          gltfGroup.visible = true;
          proceduralGroup.visible = false;
          isGLTFLoaded = true;
        },
        undefined,
        (err) => {
          console.warn("Could not load /dog.glb, using procedural model:", err);
        }
      );
    }

    // 1. Soft Contact Shadow Disk
    const shadowGeo = new THREE.PlaneGeometry(2.4, 1.6);
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext("2d");
    const sGrad = sCtx.createRadialGradient(64, 64, 5, 64, 64, 60);
    sGrad.addColorStop(0, "rgba(20, 10, 40, 0.45)");
    sGrad.addColorStop(0.5, "rgba(20, 10, 40, 0.18)");
    sGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.16;
    rootGroup.add(shadowMesh);

    // 2. Body Group
    const bodyGroup = new THREE.Group();
    proceduralGroup.add(bodyGroup);
    bodyGroup.position.y = -0.3;

    // Body main shape: plump rounded egg
    const bodyGeo = new THREE.SphereGeometry(0.88, 32, 28);
    bodyGeo.scale(1.0, 1.15, 0.95);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyGroup.add(bodyMesh);

    // Belly patch
    const bellyGeo = new THREE.SphereGeometry(0.64, 24, 20);
    bellyGeo.scale(0.88, 1.05, 0.45);
    const bellyMesh = new THREE.Mesh(bellyGeo, bellyMat);
    bellyMesh.position.set(0, -0.05, 0.62);
    bodyGroup.add(bellyMesh);

    // Little front paws/arms
    const pawGeo = new THREE.SphereGeometry(0.24, 20, 18);
    pawGeo.scale(0.8, 1.2, 0.8);

    const leftPaw = new THREE.Mesh(pawGeo, bodyMat);
    leftPaw.position.set(-0.62, -0.15, 0.48);
    leftPaw.rotation.set(0.3, 0.2, -0.4);
    bodyGroup.add(leftPaw);

    const rightPaw = new THREE.Mesh(pawGeo, bodyMat);
    rightPaw.position.set(0.62, -0.15, 0.48);
    rightPaw.rotation.set(0.3, -0.2, 0.4);
    bodyGroup.add(rightPaw);

    // Paw pads
    const padGeo = new THREE.SphereGeometry(0.08, 14, 14);
    padGeo.scale(1, 1, 0.3);
    const leftPad = new THREE.Mesh(padGeo, innerMat);
    leftPad.position.set(-0.62, -0.25, 0.62);
    bodyGroup.add(leftPad);

    const rightPad = new THREE.Mesh(padGeo, innerMat);
    rightPad.position.set(0.62, -0.25, 0.62);
    bodyGroup.add(rightPad);

    // Feet resting on ground
    const footGeo = new THREE.SphereGeometry(0.28, 20, 16);
    footGeo.scale(1.1, 0.6, 1.3);

    const leftFoot = new THREE.Mesh(footGeo, bodyMat);
    leftFoot.position.set(-0.44, -0.85, 0.35);
    bodyGroup.add(leftFoot);

    const rightFoot = new THREE.Mesh(footGeo, bodyMat);
    rightFoot.position.set(0.44, -0.85, 0.35);
    bodyGroup.add(rightFoot);

    // Foot pads
    const fPadGeo = new THREE.SphereGeometry(0.12, 14, 12);
    fPadGeo.scale(1, 0.3, 1);
    const lFPad = new THREE.Mesh(fPadGeo, innerMat);
    lFPad.position.set(-0.44, -0.73, 0.42);
    bodyGroup.add(lFPad);

    const rFPad = new THREE.Mesh(fPadGeo, innerMat);
    rFPad.position.set(0.44, -0.73, 0.42);
    bodyGroup.add(rFPad);

    // Tail
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, -0.3, -0.8);
    bodyGroup.add(tailGroup);

    if (petType.tailType === "curled" || petType.tailType === "wagging") {
      const tailCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.2, 0.3, -0.3),
        new THREE.Vector3(0.4, 0.7, -0.2),
        new THREE.Vector3(0.35, 0.95, 0.0),
      ]);
      const tailTube = new THREE.TubeGeometry(tailCurve, 20, 0.12, 10, false);
      const tailMesh = new THREE.Mesh(tailTube, bodyMat);
      tailGroup.add(tailMesh);
    } else if (petType.tailType === "bushy") {
      const tailGeo = new THREE.SphereGeometry(0.42, 20, 20);
      tailGeo.scale(0.8, 1.4, 0.8);
      const tailMesh = new THREE.Mesh(tailGeo, bodyMat);
      tailMesh.position.set(0.2, 0.4, -0.2);
      tailMesh.rotation.z = -0.3;
      tailGroup.add(tailMesh);
      // White tip
      const tipGeo = new THREE.SphereGeometry(0.22, 16, 16);
      const tipMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
      const tipMesh = new THREE.Mesh(tipGeo, tipMat);
      tipMesh.position.set(0.35, 0.85, -0.2);
      tailGroup.add(tipMesh);
    } else if (petType.tailType === "puff") {
      const puffGeo = new THREE.SphereGeometry(0.24, 18, 18);
      const puffMesh = new THREE.Mesh(puffGeo, bellyMat);
      puffMesh.position.set(0, 0.1, -0.15);
      tailGroup.add(puffMesh);
    }

    // 3. Head Group
    const headGroup = new THREE.Group();
    proceduralGroup.add(headGroup);
    headGroup.position.y = 0.68;

    // Head main geometry: round, cute chibi proportions
    const headGeo = new THREE.SphereGeometry(1.08, 36, 32);
    headGeo.scale(1.05, 0.98, 1.0);
    const headMesh = new THREE.Mesh(headGeo, bodyMat);
    headGroup.add(headMesh);

    // Cheeks (rosy blush)
    const cheekGeo = new THREE.SphereGeometry(0.25, 18, 18);
    cheekGeo.scale(1.2, 0.75, 0.4);

    const leftCheek = new THREE.Mesh(cheekGeo, cheekMat);
    leftCheek.position.set(-0.65, -0.22, 0.86);
    headGroup.add(leftCheek);

    const rightCheek = new THREE.Mesh(cheekGeo, cheekMat);
    rightCheek.position.set(0.65, -0.22, 0.86);
    headGroup.add(rightCheek);

    // Ears
    const earsGroup = new THREE.Group();
    headGroup.add(earsGroup);

    if (petType.earType === "pointed") {
      // Cat / Fox pointed ears
      const earGeo = new THREE.ConeGeometry(0.38, 0.75, 18);
      earGeo.scale(1, 1, 0.55);

      const lEar = new THREE.Mesh(earGeo, bodyMat);
      lEar.position.set(-0.62, 0.95, -0.05);
      lEar.rotation.set(-0.15, 0.2, 0.35);
      earsGroup.add(lEar);

      const rEar = new THREE.Mesh(earGeo, bodyMat);
      rEar.position.set(0.62, 0.95, -0.05);
      rEar.rotation.set(-0.15, -0.2, -0.35);
      earsGroup.add(rEar);

      // Inner ear pink pocket
      const inEarGeo = new THREE.ConeGeometry(0.26, 0.58, 16);
      inEarGeo.scale(1, 1, 0.4);
      const lInEar = new THREE.Mesh(inEarGeo, innerMat);
      lInEar.position.set(-0.6, 0.92, 0.08);
      lInEar.rotation.set(-0.15, 0.2, 0.35);
      earsGroup.add(lInEar);

      const rInEar = new THREE.Mesh(inEarGeo, innerMat);
      rInEar.position.set(0.6, 0.92, 0.08);
      rInEar.rotation.set(-0.15, -0.2, -0.35);
      earsGroup.add(rInEar);
    } else if (petType.earType === "floppy") {
      // Dog floppy ears
      const fEarGeo = new THREE.SphereGeometry(0.36, 20, 20);
      fEarGeo.scale(0.65, 1.45, 0.5);

      const lEar = new THREE.Mesh(fEarGeo, innerMat);
      lEar.position.set(-0.95, 0.2, 0.1);
      lEar.rotation.set(0.2, 0.1, 0.45);
      earsGroup.add(lEar);

      const rEar = new THREE.Mesh(fEarGeo, innerMat);
      rEar.position.set(0.95, 0.2, 0.1);
      rEar.rotation.set(0.2, -0.1, -0.45);
      earsGroup.add(rEar);
    } else if (petType.earType === "tall") {
      // Rabbit tall ears
      const tEarGeo = new THREE.CylinderGeometry(0.18, 0.14, 1.25, 20);
      tEarGeo.scale(0.9, 1, 0.5);

      const lEar = new THREE.Mesh(tEarGeo, bodyMat);
      lEar.position.set(-0.38, 1.45, -0.05);
      lEar.rotation.set(-0.1, 0, 0.12);
      earsGroup.add(lEar);

      const rEar = new THREE.Mesh(tEarGeo, bodyMat);
      rEar.position.set(0.38, 1.45, -0.05);
      rEar.rotation.set(-0.1, 0, -0.12);
      earsGroup.add(rEar);

      const inStripGeo = new THREE.CylinderGeometry(0.11, 0.08, 1.05, 16);
      inStripGeo.scale(0.8, 1, 0.3);
      const lInStrip = new THREE.Mesh(inStripGeo, innerMat);
      lInStrip.position.set(-0.38, 1.45, 0.05);
      lInStrip.rotation.set(-0.1, 0, 0.12);
      earsGroup.add(lInStrip);

      const rInStrip = new THREE.Mesh(inStripGeo, innerMat);
      rInStrip.position.set(0.38, 1.45, 0.05);
      rInStrip.rotation.set(-0.1, 0, -0.12);
      earsGroup.add(rInStrip);
    } else if (petType.earType === "round") {
      // Hamster / Panda round bear ears
      const rEarGeo = new THREE.SphereGeometry(0.36, 20, 20);
      rEarGeo.scale(1, 1, 0.4);

      const lEarMat = petType.id === "panda" ? darkMat : bodyMat;
      const lEar = new THREE.Mesh(rEarGeo, lEarMat);
      lEar.position.set(-0.75, 0.85, -0.05);
      earsGroup.add(lEar);

      const rEar = new THREE.Mesh(rEarGeo, lEarMat);
      rEar.position.set(0.75, 0.85, -0.05);
      earsGroup.add(rEar);

      const inEar = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), innerMat);
      inEar.position.set(-0.75, 0.85, 0.06);
      earsGroup.add(inEar);

      const rInEar = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), innerMat);
      rInEar.position.set(0.75, 0.85, 0.06);
      earsGroup.add(rInEar);
    }

    // Panda eye patches (positioned around the eyes)
    if (petType.id === "panda") {
      const patchGeo = new THREE.SphereGeometry(0.38, 22, 22);
      patchGeo.scale(1.15, 1.35, 0.25);
      const lPatch = new THREE.Mesh(patchGeo, darkMat);
      lPatch.position.set(-0.4, 0.04, 0.94);
      lPatch.rotation.set(0.05, -0.15, -0.15);
      headGroup.add(lPatch);

      const rPatch = new THREE.Mesh(patchGeo, darkMat);
      rPatch.position.set(0.4, 0.04, 0.94);
      rPatch.rotation.set(0.05, 0.15, 0.15);
      headGroup.add(rPatch);
    }

    // 4. Snout / Nose / Mouth
    const snoutGroup = new THREE.Group();
    headGroup.add(snoutGroup);

    if (petType.muzzleType === "beak" || petType.muzzleType === "beak-round") {
      // Orange beak
      const beakGeo = new THREE.ConeGeometry(0.18, 0.35, 18);
      beakGeo.scale(1, 0.7, 1);
      const beakMat = new THREE.MeshStandardMaterial({ color: 0xff8f00, roughness: 0.35 });
      const beak = new THREE.Mesh(beakGeo, beakMat);
      beak.rotation.x = Math.PI / 2;
      beak.position.set(0, -0.16, 1.12);
      snoutGroup.add(beak);
    } else {
      // Snout dome
      const snoutGeo = new THREE.SphereGeometry(0.26, 20, 18);
      snoutGeo.scale(1.15, 0.85, 0.7);
      const snoutMat = (petType.muzzleType === "large" || petType.muzzleType === "long") ? bellyMat : bodyMat;
      const snoutMesh = new THREE.Mesh(snoutGeo, snoutMat);
      snoutMesh.position.set(0, -0.18, 0.96);
      snoutGroup.add(snoutMesh);

      // Cute Nose
      const noseGeo = new THREE.SphereGeometry(0.11, 16, 14);
      noseGeo.scale(1.2, 0.85, 0.6);
      const noseMat = petType.muzzleType === "large" ? darkMat : innerMat;
      const noseMesh = new THREE.Mesh(noseGeo, noseMat);
      noseMesh.position.set(0, -0.12, 1.15);
      snoutGroup.add(noseMesh);

      // Cute 3D Smiling Mouth line
      const mouthCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.14, -0.26, 1.05),
        new THREE.Vector3(0, -0.32, 1.07),
        new THREE.Vector3(0.14, -0.26, 1.05),
      ]);
      const mouthGeo = new THREE.TubeGeometry(mouthCurve, 16, 0.02, 8, false);
      const mouthMat = new THREE.MeshStandardMaterial({ color: 0x444455, roughness: 0.3 });
      const mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
      snoutGroup.add(mouthMesh);

      // Cat Whiskers
      if (petType.hasWhiskers) {
        const whiskerMat = new THREE.MeshBasicMaterial({ color: 0x555577 });
        const whiskerGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.65, 8);
        whiskerGeo.rotateZ(Math.PI / 2);

        // Left whiskers
        for (let i = -1; i <= 1; i++) {
          const w = new THREE.Mesh(whiskerGeo, whiskerMat);
          w.position.set(-0.85, -0.18 + i * 0.1, 0.85);
          w.rotation.set(0.1, 0.3, i * 0.15);
          snoutGroup.add(w);
        }
        // Right whiskers
        for (let i = -1; i <= 1; i++) {
          const w = new THREE.Mesh(whiskerGeo, whiskerMat);
          w.position.set(0.85, -0.18 + i * 0.1, 0.85);
          w.rotation.set(0.1, -0.3, -i * 0.15);
          snoutGroup.add(w);
        }
      }
    }

    // 5. 3D Shiny Anime Eyes with zero-distortion Circular Disc planar mapping
    let eyeTexture = createEyeTexture(mood?.label, colors.eye, isSleeping);
    const eyeMat = new THREE.MeshBasicMaterial({
      map: eyeTexture,
      transparent: true,
      depthWrite: false,
    });

    const eyeGeo = new THREE.CircleGeometry(0.27, 32);

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.4, 0.04, 1.05);
    leftEye.rotation.set(-0.04, -0.15, 0);
    headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.4, 0.04, 1.05);
    rightEye.rotation.set(-0.04, 0.15, 0);
    headGroup.add(rightEye);

    // Dynamic Eye Texture Update Listener
    let lastMoodKey = mood?.label || "happy";
    let lastSleeping = isSleeping;

    // ── Mouse / Touch Tracking for Head Look-At ──
    const handlePointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((clientY - rect.top) / rect.height) * 2 - 1);
      stateRef.current.mouse.targetX = Math.max(-1, Math.min(1, x));
      stateRef.current.mouse.targetY = Math.max(-1, Math.min(1, y));

      if (stateRef.current.isDragging) {
        const deltaX = clientX - stateRef.current.dragStartX;
        stateRef.current.dragRotY += deltaX * 0.015;
        stateRef.current.dragStartX = clientX;
      }
    };

    const handlePointerDown = (e) => {
      stateRef.current.isDragging = true;
      stateRef.current.dragStartX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    };

    const handlePointerUp = () => {
      stateRef.current.isDragging = false;
    };

    const handlePointerLeave = () => {
      stateRef.current.mouse.targetX = 0;
      stateRef.current.mouse.targetY = 0;
      stateRef.current.isDragging = false;
    };

    const canvasEl = renderer.domElement;
    canvasEl.addEventListener("pointermove", handlePointerMove);
    canvasEl.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    canvasEl.addEventListener("pointerleave", handlePointerLeave);

    // ── Animation Loop ──
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      const { activeAction: act, isSleeping: sleep, mood: curMood } = stateRef.current;

      // Check if mood or sleep state changed and update eye texture
      const curMoodKey = curMood || "happy";
      if (curMoodKey !== lastMoodKey || sleep !== lastSleeping) {
        lastMoodKey = curMoodKey;
        lastSleeping = sleep;
        eyeTexture.dispose();
        eyeTexture = createEyeTexture(curMoodKey, colors.eye, sleep);
        eyeMat.map = eyeTexture;
        eyeMat.needsUpdate = true;
      }

      // Smooth cursor look-at easing (Talking Tom eye contact!)
      stateRef.current.mouse.x += (stateRef.current.mouse.targetX - stateRef.current.mouse.x) * 0.08;
      stateRef.current.mouse.y += (stateRef.current.mouse.targetY - stateRef.current.mouse.y) * 0.08;

      // Spring drag rotation back to center
      if (!stateRef.current.isDragging) {
        stateRef.current.dragRotY *= 0.92;
      }

      // Head look-at rotation
      const lookRotX = -stateRef.current.mouse.y * 0.28;
      const lookRotY = stateRef.current.mouse.x * 0.38 + stateRef.current.dragRotY;

      // ── Organic Idle Animation ──
      if (isGLTFLoaded) {
        gltfGroup.rotation.y = -0.7 + lookRotY;
        gltfGroup.rotation.x = lookRotX;
        if (sleep) {
          const breath = Math.sin(elapsed * 1.5) * 0.03;
          gltfGroup.scale.set(1 + breath, 1 + breath * 0.5, 1 + breath);
          charGroup.position.y = -0.22;
        } else {
          const breath = Math.sin(elapsed * 2.8) * 0.02;
          gltfGroup.scale.set(1 + breath, 1 + breath * 0.5, 1 + breath);
          charGroup.position.y = -0.15 + Math.sin(elapsed * 2.8) * 0.03;
        }
      } else {
        if (sleep) {
          // Slow peaceful breathing, curled forward
          const breath = Math.sin(elapsed * 1.5) * 0.04;
          bodyGroup.scale.set(1 + breath, 1 + breath * 0.5, 1 + breath);
          headGroup.position.y = 0.62 + breath * 0.3;
          headGroup.rotation.x = 0.18 + Math.sin(elapsed * 1.5) * 0.03;
          headGroup.rotation.y = 0;
          charGroup.position.y = -0.22;
        } else {
          // Active gentle breathing & micro idle
          const breath = Math.sin(elapsed * 2.8) * 0.025;
          bodyGroup.scale.set(1 + breath, 1 + breath * 0.6, 1 + breath);
          charGroup.position.y = -0.15 + Math.sin(elapsed * 2.8) * 0.03;

          // Head tracking
          headGroup.rotation.x = lookRotX;
          headGroup.rotation.y = lookRotY;
          headGroup.rotation.z = Math.sin(elapsed * 1.4) * 0.025;

          // Tail wag
          tailGroup.rotation.y = Math.sin(elapsed * 4.5) * 0.35;
          tailGroup.rotation.z = Math.cos(elapsed * 4.5) * 0.15;
        }
      }

      // ── Poke squash-and-stretch reaction ──
      if (stateRef.current.pokeBounce > 0) {
        const p = stateRef.current.pokeBounce;
        const wobble = Math.sin((1 - p) * Math.PI * 4) * p;
        charGroup.scale.set(1 + wobble * 0.22, 1 - wobble * 0.26, 1 + wobble * 0.22);
        charGroup.rotation.z = wobble * 0.15;
        stateRef.current.pokeBounce -= delta * 2.5;
        if (stateRef.current.pokeBounce < 0) {
          stateRef.current.pokeBounce = 0;
          charGroup.scale.set(1, 1, 1);
          charGroup.rotation.z = 0;
        }
      }

      // ── Action Reactions ──
      if (act === "play") {
        // 3D 360 Spin Jump!
        const t = (elapsed * 4.5) % (Math.PI * 2);
        charGroup.position.y = -0.15 + Math.abs(Math.sin(t)) * 0.55;
        charGroup.rotation.y = t * 2;
        leftPaw.rotation.z = -1.2 + Math.sin(elapsed * 10) * 0.4;
        rightPaw.rotation.z = 1.2 - Math.sin(elapsed * 10) * 0.4;
      } else if (act === "feed") {
        // Happy nodding & munching
        headGroup.rotation.x = lookRotX + Math.sin(elapsed * 8) * 0.18;
        headGroup.rotation.z = Math.sin(elapsed * 6) * 0.1;
      } else if (act === "clean") {
        // Pirouette spin
        charGroup.rotation.y += delta * 6;
      } else if (act === "annoyed") {
        // Head shake
        headGroup.rotation.y = lookRotY + Math.sin(elapsed * 18) * 0.35;
      } else {
        // Normal return
        if (act !== "play") charGroup.rotation.y *= 0.9;
        leftPaw.rotation.z = -0.4;
        rightPaw.rotation.z = 0.4;
      }

      // Update contact shadow scale
      const shadowScale = 1 - Math.max(0, charGroup.position.y + 0.15) * 0.5;
      shadowMesh.scale.set(shadowScale, shadowScale, shadowScale);
      shadowMat.opacity = Math.max(0.15, shadowScale * 0.45);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      canvasEl.removeEventListener("pointermove", handlePointerMove);
      canvasEl.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      canvasEl.removeEventListener("pointerleave", handlePointerLeave);
      renderer.dispose();
      eyeTexture.dispose();
      shadowTex.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [petType.id, growthStage?.name, width, height]);

  // Fallback if WebGL isn't supported
  if (!hasWebGL) return null;

  return (
    <div
      ref={mountRef}
      onClick={handlePokeClick}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "grab",
        userSelect: "none",
        touchAction: "none",
        position: "relative",
      }}
      title="Click to pet • Drag to spin in 3D!"
    />
  );
}
