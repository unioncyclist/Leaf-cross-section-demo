import * as THREE from "./vendor/three.module.js";
import { OrbitControls } from "./vendor/OrbitControls.js";

const canvasWrap = document.getElementById("canvas-wrap");
const infoName = document.getElementById("part-name");
const infoDesc = document.getElementById("part-desc");
const infoTag = document.getElementById("part-tag");
const autoRotateToggle = document.getElementById("auto-rotate");

function updateLegend() {
  const legendItems = document.querySelectorAll(".legend-item");
  legendItems.forEach((item) => {
    const color = item.getAttribute("data-color");
    item.style.setProperty("--legend-color", color);
  });
}

updateLegend();

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvasWrap.clientWidth, canvasWrap.clientHeight);
  canvasWrap.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog("#e9efe2", 6, 22);

  const camera = new THREE.PerspectiveCamera(50, canvasWrap.clientWidth / canvasWrap.clientHeight, 0.1, 50);
  camera.position.set(6, 4.5, 7.5);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 4;
  controls.maxDistance = 16;
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.PAN,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.ROTATE,
  };

  const ambient = new THREE.AmbientLight("#ffffff", 0.75);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight("#fff2d4", 0.9);
  keyLight.position.set(6, 8, 4);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight("#d2f0ff", 0.5);
  fillLight.position.set(-6, 4, 3);
  scene.add(fillLight);

  const leafGroup = new THREE.Group();
  scene.add(leafGroup);

  const materials = {
    cuticle: new THREE.MeshStandardMaterial({ color: "#66c26f", roughness: 0.35, metalness: 0.05 }),
    epidermisGreen: new THREE.MeshStandardMaterial({ color: "#66c26f", roughness: 0.5, metalness: 0.05 }),
    epidermisBeige: new THREE.MeshStandardMaterial({ color: "#cfc39a", roughness: 0.55, metalness: 0.02 }),
    mesophyll: new THREE.MeshStandardMaterial({ color: "#a9e9ad", roughness: 0.4, metalness: 0.04 }),
    leafVein: new THREE.MeshStandardMaterial({ color: "#6a8fcf", roughness: 0.35, metalness: 0.1 }),
    bundleRing: new THREE.MeshStandardMaterial({ color: "#8fb0e0", roughness: 0.4, metalness: 0.1 }),
    xylem: new THREE.MeshStandardMaterial({ color: "#e84b45", roughness: 0.35, metalness: 0.1 }),
    phloem: new THREE.MeshStandardMaterial({ color: "#2d5aa6", roughness: 0.35, metalness: 0.1 }),
    stoma: new THREE.MeshStandardMaterial({ color: "#5f7f6a", roughness: 0.35, metalness: 0.2 }),
  };

  const parts = [];

  function registerPart(mesh, name, desc, tag) {
    mesh.userData = { name, desc, tag };
    parts.push(mesh);
    leafGroup.add(mesh);
  }

  const leafWidth = 9.6;
  const leafDepth = 4.8;
  const cuticleThickness = 0.18;
  const upperOuterThickness = 0.08;
  const upperMidThickness = 0.22;
  const upperInnerThickness = 0.08;
  const upperEpiThickness = upperOuterThickness + upperMidThickness + upperInnerThickness;
  const palisadeHeight = 1.1;
  const spongeHeight = 1.05;
  const lowerOuterThickness = 0.1;
  const lowerMidThickness = 0.24;
  const lowerInnerThickness = 0.1;
  const lowerEpiThickness = lowerOuterThickness + lowerMidThickness + lowerInnerThickness;
  const topY = 1.8;

  function addSlab(width, height, depth, material, y) {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    slab.position.y = y;
    return slab;
  }

  function addSurfaceBumps({ rows, cols, radius, y, material, width, depth }) {
    const group = new THREE.Group();
    const xStart = -width / 2 + radius * 1.3;
    const zStart = -depth / 2 + radius * 1.3;
    const xStep = (width - radius * 2.6) / (cols - 1);
    const zStep = (depth - radius * 2.6) / (rows - 1);
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const bump = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 14), material);
        bump.scale.y = 0.7;
        bump.position.set(xStart + c * xStep, y, zStart + r * zStep);
        group.add(bump);
      }
    }
    return group;
  }

  const cuticleY = topY - cuticleThickness / 2;
  const cuticleSeed = 84;
  const cuticleRng = mulberry32(cuticleSeed);
  const cuticleBumps = new THREE.Group();
  const cuticleCount = 1000;
  const cuticleXRange = leafWidth / 2 - 0.35;
  const cuticleZRange = leafDepth / 2 - 0.35;
  for (let i = 0; i < cuticleCount; i += 1) {
    const radius = 0.15 + cuticleRng() * 0.1;
    const bump = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 14), materials.cuticle);
    const x = -cuticleXRange + cuticleRng() * cuticleXRange * 2;
    const z = -cuticleZRange + cuticleRng() * cuticleZRange * 2;
    const y = cuticleY - 0.06 + cuticleRng() * 0.06;
    bump.scale.y = 0.42;
    bump.position.set(x, y, z);
    cuticleBumps.add(bump);
  }
  leafGroup.add(cuticleBumps);

  const upperOuterY = cuticleY - cuticleThickness / 2 - upperOuterThickness / 2;
  const upperMidY = upperOuterY - upperOuterThickness / 2 - upperMidThickness / 2;
  const upperInnerY = upperMidY - upperMidThickness / 2 - upperInnerThickness / 2;
  const upperEpidermisGroup = new THREE.Group();
  upperEpidermisGroup.add(
    addSlab(leafWidth, upperOuterThickness, leafDepth, materials.epidermisGreen, upperOuterY)
  );
  upperEpidermisGroup.add(
    addSlab(leafWidth - 0.1, upperMidThickness, leafDepth - 0.1, materials.epidermisBeige, upperMidY)
  );
  upperEpidermisGroup.add(
    addSlab(leafWidth - 0.2, upperInnerThickness, leafDepth - 0.2, materials.epidermisGreen, upperInnerY)
  );
  registerPart(
    upperEpidermisGroup,
    "上表皮",
    "外层薄薄的表皮细胞和角质层起保护作用，表皮内层细胞排列紧密。",
    "Upper Epidermis"
  );

  const palisadeY = upperInnerY - upperInnerThickness / 2 - palisadeHeight / 2;
  const mesophyllGroup = new THREE.Group();
  const columnGeometry = new THREE.CapsuleGeometry(0.22, palisadeHeight * 0.78, 6, 16);
  const columnCount = 72;
  const columnXRange = leafWidth / 2 - 0.7;
  const columnZRange = leafDepth / 2 - 0.6;

  const mesophyllSeed = 42;
  function mulberry32(seed) {
    let t = seed;
    return () => {
      t += 0x6d2b79f5;
      let result = Math.imul(t ^ (t >>> 15), t | 1);
      result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
      return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rng = mulberry32(mesophyllSeed);

  function randomInRange(min, max) {
    return min + rng() * (max - min);
  }

  for (let i = 0; i < columnCount; i += 1) {
    const column = new THREE.Mesh(columnGeometry, materials.mesophyll);
    const x = randomInRange(-columnXRange, columnXRange);
    const z = randomInRange(-columnZRange, columnZRange);
    const y = palisadeY + randomInRange(-0.12, 0.12);
    column.position.set(x, y, z);
    mesophyllGroup.add(column);
  }

  const spongeY = palisadeY - palisadeHeight / 2 - spongeHeight / 2;
  const sphereCount = 56;
  const sphereXRange = leafWidth / 2 - 0.6;
  const sphereZRange = leafDepth / 2 - 0.6;
  for (let i = 0; i < sphereCount; i += 1) {
    const radius = randomInRange(0.3, 0.5);
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, 18, 16), materials.mesophyll);
    const x = randomInRange(-sphereXRange, sphereXRange);
    const z = randomInRange(-sphereZRange, sphereZRange);
    const y = spongeY + randomInRange(-0.26, 0.26);
    sphere.position.set(x, y, z);
    mesophyllGroup.add(sphere);
  }
  registerPart(
    mesophyllGroup,
    "叶肉",
    "由栅栏组织和海绵组织构成，含叶绿体，是光合作用与气体交换的重要组织。",
    "Mesophyll"
  );

  const lowerOuterY = spongeY - spongeHeight / 2 - lowerOuterThickness / 2;
  const lowerMidY = lowerOuterY - lowerOuterThickness / 2 - lowerMidThickness / 2;
  const lowerInnerY = lowerMidY - lowerMidThickness / 2 - lowerInnerThickness / 2;
  const lowerEpidermisGroup = new THREE.Group();
  lowerEpidermisGroup.add(
    addSlab(leafWidth, lowerOuterThickness, leafDepth, materials.epidermisGreen, lowerOuterY)
  );
  lowerEpidermisGroup.add(
    addSlab(leafWidth - 0.1, lowerMidThickness, leafDepth - 0.1, materials.epidermisBeige, lowerMidY)
  );
  lowerEpidermisGroup.add(
    addSlab(leafWidth - 0.2, lowerInnerThickness, leafDepth - 0.2, materials.epidermisGreen, lowerInnerY)
  );
  registerPart(
    lowerEpidermisGroup,
    "下表皮",
    "外层薄薄的表皮细胞与角质层保护叶片，内层细胞排列紧密，分布较多气孔。",
    "Lower Epidermis"
  );

  const leafVeinGroup = new THREE.Group();
  const veinLength = leafWidth + 0.2;
  const veinRadius = 1.0;
  const veinBody = new THREE.Mesh(new THREE.CylinderGeometry(veinRadius, veinRadius, veinLength, 32), materials.leafVein);
  veinBody.rotation.z = Math.PI / 2;
  leafVeinGroup.add(veinBody);

  const sideVeinRadius = 0.62;
  const sideVeinLength = leafDepth / 2;
  const sideVeinOffset = sideVeinLength / 2;
  const capRadius = sideVeinRadius * 0.88;
  const capOffset = 0.02;
  const mainCapRadius = veinRadius * 0.9;

  function addSideVeinCap(x, y, z, normalZ) {
    const capGroup = new THREE.Group();
    const upper = new THREE.Mesh(new THREE.CircleGeometry(capRadius, 26, 0, Math.PI), materials.xylem);
    const lower = new THREE.Mesh(new THREE.CircleGeometry(capRadius, 26, Math.PI, Math.PI), materials.phloem);
    capGroup.add(upper, lower);
    capGroup.position.set(x, y, z + normalZ * capOffset);
    if (normalZ < 0) {
      capGroup.rotation.y = Math.PI;
    }
    leafVeinGroup.add(capGroup);
  }

  function addMainVeinCap(x, y, z, normalX) {
    const capGroup = new THREE.Group();
    const upper = new THREE.Mesh(new THREE.CircleGeometry(mainCapRadius, 28, 0, Math.PI), materials.xylem);
    const lower = new THREE.Mesh(new THREE.CircleGeometry(mainCapRadius, 28, Math.PI, Math.PI), materials.phloem);
    capGroup.add(upper, lower);
    capGroup.rotation.y = Math.PI / 2;
    if (normalX < 0) {
      capGroup.rotation.y = -Math.PI / 2;
    }
    capGroup.position.set(x + normalX * capOffset, y, z);
    leafVeinGroup.add(capGroup);
  }

  const leftSideVein = new THREE.Mesh(
    new THREE.CylinderGeometry(sideVeinRadius, sideVeinRadius, sideVeinLength, 28),
    materials.leafVein
  );
  leftSideVein.rotation.x = Math.PI / 2;
  leftSideVein.position.set(-1.4, 0.06, -sideVeinOffset);
  leafVeinGroup.add(leftSideVein);

  const rightSideVein = new THREE.Mesh(
    new THREE.CylinderGeometry(sideVeinRadius, sideVeinRadius, sideVeinLength, 28),
    materials.leafVein
  );
  rightSideVein.rotation.x = Math.PI / 2;
  rightSideVein.position.set(1.4, 0.06, sideVeinOffset);
  leafVeinGroup.add(rightSideVein);

  const leftCenterZ = -sideVeinOffset;
  const rightCenterZ = sideVeinOffset;
  const leftNearZ = leftCenterZ + sideVeinLength / 2;
  const leftFarZ = leftCenterZ - sideVeinLength / 2;
  const rightNearZ = rightCenterZ - sideVeinLength / 2;
  const rightFarZ = rightCenterZ + sideVeinLength / 2;

  addMainVeinCap(-veinLength / 2, 0, 0, -1);
  addMainVeinCap(veinLength / 2, 0, 0, 1);
  addSideVeinCap(-1.4, 0.06, leftNearZ, 1);
  addSideVeinCap(-1.4, 0.06, leftFarZ, -1);
  addSideVeinCap(1.4, 0.06, rightNearZ, -1);
  addSideVeinCap(1.4, 0.06, rightFarZ, 1);

  leafVeinGroup.position.set(0, spongeY + 0.35, 0.1);
  registerPart(
    leafVeinGroup,
    "叶脉",
    "由维管束构成，含木质部和韧皮部，负责输导水分与有机物并支撑叶片。",
    "Leaf Vein"
  );

  const stomaGroup = new THREE.Group();
  const guardGeometry = new THREE.SphereGeometry(0.22, 18, 14);
  const poreGeometry = new THREE.SphereGeometry(0.14, 14, 12);
  const stomaDrop = 0.16;

  function addStoma(x, z) {
    const guard1 = new THREE.Mesh(guardGeometry, materials.stoma);
    const guard2 = new THREE.Mesh(guardGeometry, materials.stoma);
    guard1.scale.set(1.6, 0.7, 0.9);
    guard2.scale.set(1.6, 0.7, 0.9);
    guard1.position.set(x, lowerOuterY - lowerOuterThickness / 2 - 0.06 - stomaDrop, z - 0.22);
    guard2.position.set(x, lowerOuterY - lowerOuterThickness / 2 - 0.06 - stomaDrop, z + 0.22);
    stomaGroup.add(guard1, guard2);

    const pore = new THREE.Mesh(poreGeometry, materials.stoma);
    pore.scale.set(0.7, 0.5, 1.4);
    pore.position.set(x, lowerOuterY - lowerOuterThickness / 2 - 0.08 - stomaDrop, z);
    stomaGroup.add(pore);
  }

  addStoma(-3.1, -0.6);
  addStoma(0.4, 0.2);
  addStoma(2.8, 0.9);

  registerPart(
    stomaGroup,
    "气孔",
    "由一对保卫细胞围成的孔，调节气体交换与蒸腾作用。",
    "Stoma"
  );

  leafGroup.rotation.y = -0.35;
  leafGroup.position.y = 0.1;

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let current = null;

  function updateInfo(target) {
    if (!target) {
      infoName.textContent = "请选择一个结构";
      infoDesc.textContent = "点击 3D 模型中的结构可查看简要说明。";
      infoTag.textContent = "Leaf";
      return;
    }
    infoName.textContent = target.userData.name;
    infoDesc.textContent = target.userData.desc;
    infoTag.textContent = target.userData.tag;
  }

  function setEmissive(object, color) {
    object.traverse((child) => {
      if (child.material && child.material.emissive) {
        child.material.emissive = new THREE.Color(color);
      }
    });
  }

  function setHighlight(target) {
    parts.forEach((part) => setEmissive(part, 0x000000));
    if (!target) {
      return;
    }
    setEmissive(target, 0x2a2a2a);
  }

  function findPartTarget(object) {
    let node = object;
    while (node && !node.userData?.name && node.parent) {
      node = node.parent;
    }
    return node && node.userData?.name ? node : null;
  }

  function pickPart(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(parts, true);
    if (intersects.length === 0) {
      current = null;
      setHighlight(null);
      updateInfo(null);
      return;
    }

    const picked = findPartTarget(intersects[0].object);
    current = picked;
    setHighlight(picked);
    updateInfo(picked);
  }

  renderer.domElement.addEventListener("pointerdown", pickPart);
  renderer.domElement.addEventListener("contextmenu", (event) => event.preventDefault());

  function resize() {
    const { clientWidth, clientHeight } = canvasWrap;
    renderer.setSize(clientWidth, clientHeight);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
  }

  window.addEventListener("resize", resize);

  let autoRotate = autoRotateToggle ? autoRotateToggle.checked : true;
  if (autoRotateToggle) {
    autoRotateToggle.addEventListener("change", (event) => {
      autoRotate = event.target.checked;
    });
  }

  function animate() {
    requestAnimationFrame(animate);
    if (autoRotate) {
      leafGroup.rotation.y += 0.0015;
    }
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
