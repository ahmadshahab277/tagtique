import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, Maximize2, Sparkles, Smartphone, Laptop, Car, Tag } from 'lucide-react';

/**
 * Creates a rounded rectangular shape for phone/laptop extrusion.
 */
function createRoundedRectShape(width, height, radius) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

/**
 * Procedural fallback canvas for QR sticker when image is loading
 */
function createFallbackTexture(name, swatch = '#F59E0B') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0F1016';
  ctx.fillRect(0, 0, 512, 512);

  // Border ring
  ctx.strokeStyle = swatch;
  ctx.lineWidth = 14;
  ctx.strokeRect(20, 20, 472, 472);

  // QR Pattern
  ctx.fillStyle = '#FFFFFF';
  const size = 16;
  const offset = 80;
  for (let r = 0; r < 20; r++) {
    for (let c = 0; c < 20; c++) {
      if ((r + c) % 2 === 0 || (r < 6 && c < 6) || (r > 13 && c < 6) || (r < 6 && c > 13)) {
        ctx.fillRect(offset + c * size, offset + r * size, size - 2, size - 2);
      }
    }
  }

  // Label
  ctx.fillStyle = swatch;
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(name || 'TAGTIQUE', 256, 450);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Builds 3D Smartphone Model with 2" x 2" sticker on the back
 */
function buildMobileModel(stickerTexture, swatch) {
  const group = new THREE.Group();
  group.name = 'mobile-model';

  const phoneW = 2.8;
  const phoneH = 5.8;
  const phoneD = 0.22;
  const cornerR = 0.36;

  // 1. Phone Body Chassis (Dark Titanium Obsidian)
  const bodyShape = createRoundedRectShape(phoneW, phoneH, cornerR);
  const extrudeSettings = {
    depth: phoneD,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.04,
    bevelThickness: 0.04
  };
  const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
  bodyGeo.center();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x14151D,
    metalness: 0.85,
    roughness: 0.22
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  group.add(bodyMesh);

  // 2. Front Screen Glass (Face at +Z)
  const screenShape = createRoundedRectShape(phoneW - 0.16, phoneH - 0.16, cornerR - 0.06);
  const screenGeo = new THREE.ShapeGeometry(screenShape);
  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x050608,
    roughness: 0.1,
    metalness: 0.5
  });
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.z = phoneD / 2 + 0.045;
  group.add(screenMesh);

  // Speaker / Dynamic Notch
  const notchGeo = new THREE.CapsuleGeometry(0.06, 0.45, 4, 8);
  notchGeo.rotateZ(Math.PI / 2);
  const notchMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const notchMesh = new THREE.Mesh(notchGeo, notchMat);
  notchMesh.position.set(0, phoneH / 2 - 0.32, phoneD / 2 + 0.047);
  group.add(notchMesh);

  // 3. Back Frosted Glass Panel (Face at -Z)
  const backShape = createRoundedRectShape(phoneW - 0.08, phoneH - 0.08, cornerR - 0.03);
  const backGeo = new THREE.ShapeGeometry(backShape);
  const backMat = new THREE.MeshPhysicalMaterial({
    color: 0x181924,
    roughness: 0.25,
    metalness: 0.2,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1
  });
  const backMesh = new THREE.Mesh(backGeo, backMat);
  backMesh.rotation.y = Math.PI; // Face outwards towards -Z
  backMesh.position.z = -(phoneD / 2 + 0.045);
  group.add(backMesh);

  // 4. Camera Bump Plateau (Top Left of back)
  const camBumpShape = createRoundedRectShape(0.95, 1.05, 0.2);
  const camBumpGeo = new THREE.ExtrudeGeometry(camBumpShape, {
    depth: 0.07,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.02,
    bevelThickness: 0.02
  });
  camBumpGeo.center();
  const camBumpMat = new THREE.MeshStandardMaterial({
    color: 0x1F212E,
    metalness: 0.9,
    roughness: 0.2
  });
  const camBumpMesh = new THREE.Mesh(camBumpGeo, camBumpMat);
  camBumpMesh.position.set(0.65, phoneH / 2 - 0.9, -(phoneD / 2 + 0.08));
  group.add(camBumpMesh);

  // Camera Lenses
  const lensGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.06, 24);
  const lensRimMat = new THREE.MeshStandardMaterial({ color: 0x4B5563, metalness: 0.9, roughness: 0.1 });
  const lensGlassMat = new THREE.MeshBasicMaterial({ color: 0x05070B });

  const addLens = (lx, ly) => {
    const rim = new THREE.Mesh(lensGeo, lensRimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(lx, ly, -(phoneD / 2 + 0.14));
    group.add(rim);

    const inner = new THREE.Mesh(new THREE.CircleGeometry(0.13, 20), lensGlassMat);
    inner.rotation.y = Math.PI;
    inner.position.set(lx, ly, -(phoneD / 2 + 0.171));
    group.add(inner);
  };
  addLens(0.65, phoneH / 2 - 0.65);
  addLens(0.65, phoneH / 2 - 1.15);

  // 5. STICKER ON MOBILE: 2" x 2" scale
  // Relative to a 2.8 unit phone, a 2" sticker is approx 1.8 units wide
  const stickerSize = 1.82;
  const stickerGeo = new THREE.PlaneGeometry(stickerSize, stickerSize);
  const stickerMat = new THREE.MeshStandardMaterial({
    map: stickerTexture,
    transparent: true,
    roughness: 0.15,
    metalness: 0.05,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2
  });
  const stickerMesh = new THREE.Mesh(stickerGeo, stickerMat);
  stickerMesh.rotation.y = Math.PI; // Face backwards
  // Position lower half of back so camera is clear
  stickerMesh.position.set(0, -0.42, -(phoneD / 2 + 0.05));
  group.add(stickerMesh);

  // Subtle gloss sheen rim around the sticker
  const stickerRimGeo = new THREE.PlaneGeometry(stickerSize + 0.06, stickerSize + 0.06);
  const stickerRimMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(swatch || '#F59E0B'),
    transparent: true,
    opacity: 0.22
  });
  const stickerRim = new THREE.Mesh(stickerRimGeo, stickerRimMat);
  stickerRim.rotation.y = Math.PI;
  stickerRim.position.set(0, -0.42, -(phoneD / 2 + 0.048));
  group.add(stickerRim);

  // Default display orientation: Facing the back with slight tilt
  group.rotation.set(0.12, Math.PI - 0.25, 0);

  return group;
}

/**
 * Builds 3D Laptop Model with 2" x 2" sticker on the aluminum lid
 */
function buildLaptopModel(stickerTexture, swatch) {
  const group = new THREE.Group();
  group.name = 'laptop-model';

  const lapW = 6.4;
  const lapD = 4.3;
  const lapH = 0.18;

  const aluMat = new THREE.MeshStandardMaterial({
    color: 0x1E202B,
    metalness: 0.85,
    roughness: 0.25
  });

  const darkAluMat = new THREE.MeshStandardMaterial({
    color: 0x111319,
    metalness: 0.8,
    roughness: 0.35
  });

  // 1. Base Unibody Chassis
  const baseShape = createRoundedRectShape(lapW, lapD, 0.22);
  const baseGeo = new THREE.ExtrudeGeometry(baseShape, {
    depth: lapH,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.03,
    bevelThickness: 0.03
  });
  baseGeo.center();
  const baseMesh = new THREE.Mesh(baseGeo, aluMat);
  baseMesh.rotation.x = Math.PI / 2; // Flat on horizontal plane
  baseMesh.position.set(0, -1.2, 0);
  group.add(baseMesh);

  // Keyboard Recess on Base
  const kbRecessGeo = new THREE.PlaneGeometry(5.2, 2.0);
  const kbRecessMesh = new THREE.Mesh(kbRecessGeo, darkAluMat);
  kbRecessMesh.rotation.x = -Math.PI / 2;
  kbRecessMesh.position.set(0, -1.2 + lapH / 2 + 0.035, -0.6);
  group.add(kbRecessMesh);

  // Trackpad on Base
  const trackpadGeo = new THREE.PlaneGeometry(2.1, 1.3);
  const trackpadMesh = new THREE.Mesh(trackpadGeo, aluMat);
  trackpadMesh.rotation.x = -Math.PI / 2;
  trackpadMesh.position.set(0, -1.2 + lapH / 2 + 0.035, 1.1);
  group.add(trackpadMesh);

  // 2. Display Lid (Hinged at back of base: z = -lapD/2 = -2.15, y = -1.2 + lapH)
  const lidGroup = new THREE.Group();
  lidGroup.position.set(0, -1.2 + lapH / 2, -lapD / 2 + 0.1);

  // Lid angle: open tilted back ~112 degrees (Math.PI * 0.62)
  const lidAngle = Math.PI * 0.62;
  lidGroup.rotation.x = lidAngle;

  const lidThickness = 0.1;
  const lidShape = createRoundedRectShape(lapW, lapD, 0.22);
  const lidGeo = new THREE.ExtrudeGeometry(lidShape, {
    depth: lidThickness,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.02,
    bevelThickness: 0.02
  });
  lidGeo.center();
  const lidMesh = new THREE.Mesh(lidGeo, aluMat);
  lidGroup.add(lidMesh);

  // Front display inside lid (Screen facing user when open)
  const screenGeo = new THREE.PlaneGeometry(lapW - 0.4, lapD - 0.4);
  const screenMat = new THREE.MeshBasicMaterial({ color: 0x05060A });
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.z = lidThickness / 2 + 0.025;
  lidGroup.add(screenMesh);

  // 3. STICKER ON LAPTOP LID: 2" x 2" scale
  // Relative to a 6.4 unit laptop lid, a 2" sticker is approx 1.35 units
  const stickerSize = 1.38;
  const stickerGeo = new THREE.PlaneGeometry(stickerSize, stickerSize);
  const stickerMat = new THREE.MeshStandardMaterial({
    map: stickerTexture,
    transparent: true,
    roughness: 0.15,
    metalness: 0.05,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2
  });
  const stickerMesh = new THREE.Mesh(stickerGeo, stickerMat);
  stickerMesh.rotation.y = Math.PI; // Face the outer back lid
  // Positioned slightly right or center of lid back
  stickerMesh.position.set(1.1, 0.3, -(lidThickness / 2 + 0.03));
  lidGroup.add(stickerMesh);

  // Subtle glow backing on lid
  const rimGeo = new THREE.PlaneGeometry(stickerSize + 0.05, stickerSize + 0.05);
  const rimMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(swatch || '#F59E0B'),
    transparent: true,
    opacity: 0.2
  });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.rotation.y = Math.PI;
  rim.position.set(1.1, 0.3, -(lidThickness / 2 + 0.028));
  lidGroup.add(rim);

  group.add(lidGroup);

  // Default display orientation: viewing the lid back at an angle
  group.rotation.set(0.18, Math.PI - 0.45, 0);

  return group;
}

/**
 * Builds 3D Vehicle / Car Model with 4" x 4" sticker on the rear window
 */
function buildVehicleModel(stickerTexture, swatch) {
  const group = new THREE.Group();
  group.name = 'vehicle-model';

  const carMat = new THREE.MeshPhysicalMaterial({
    color: 0x12141C,
    metalness: 0.9,
    roughness: 0.18,
    clearcoat: 0.9,
    clearcoatRoughness: 0.08
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0A0B10,
    metalness: 0.3,
    roughness: 0.08,
    transmission: 0.3,
    transparent: true,
    opacity: 0.88
  });

  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111115, roughness: 0.8 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x6B7280, metalness: 0.9, roughness: 0.1 });
  const redLightMat = new THREE.MeshBasicMaterial({ color: 0xEF4444 });
  const amberLightMat = new THREE.MeshBasicMaterial({ color: 0xF59E0B });

  // 1. Lower Body Chassis
  const lowerGeo = new THREE.BoxGeometry(3.2, 0.85, 6.2);
  const lowerMesh = new THREE.Mesh(lowerGeo, carMat);
  lowerMesh.position.y = -0.3;
  group.add(lowerMesh);

  // 2. Cabin / Roof with aerodynamic slope
  const cabinGeo = new THREE.BoxGeometry(2.7, 0.8, 3.2);
  const cabinMesh = new THREE.Mesh(cabinGeo, carMat);
  cabinMesh.position.set(0, 0.45, -0.2);
  group.add(cabinMesh);

  // Front Windshield (Angled forward)
  const fWindGeo = new THREE.PlaneGeometry(2.5, 0.95);
  const fWindMesh = new THREE.Mesh(fWindGeo, glassMat);
  fWindMesh.rotation.x = -Math.PI / 3.4;
  fWindMesh.position.set(0, 0.42, 1.55);
  group.add(fWindMesh);

  // Rear Windshield (Angled backward where QR tag is placed)
  const rWindGeo = new THREE.PlaneGeometry(2.5, 0.95);
  const rWindMesh = new THREE.Mesh(rWindGeo, glassMat);
  rWindMesh.rotation.x = Math.PI / 3.4;
  rWindMesh.position.set(0, 0.42, -1.95);
  group.add(rWindMesh);

  // Side Windows
  const sideWindGeo = new THREE.PlaneGeometry(2.9, 0.65);
  const leftWind = new THREE.Mesh(sideWindGeo, glassMat);
  leftWind.rotation.y = -Math.PI / 2;
  leftWind.position.set(-1.36, 0.45, -0.2);
  group.add(leftWind);

  const rightWind = new THREE.Mesh(sideWindGeo, glassMat);
  rightWind.rotation.y = Math.PI / 2;
  rightWind.position.set(1.36, 0.45, -0.2);
  group.add(rightWind);

  // 4 Wheels
  const tireGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.35, 24);
  const hubGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.36, 16);

  const addWheel = (wx, wy, wz) => {
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(wx, wy, wz);

    const tire = new THREE.Mesh(tireGeo, wheelMat);
    tire.rotation.z = Math.PI / 2;
    wheelGroup.add(tire);

    const hub = new THREE.Mesh(hubGeo, rimMat);
    hub.rotation.z = Math.PI / 2;
    wheelGroup.add(hub);

    group.add(wheelGroup);
  };
  addWheel(-1.6, -0.65, 1.8);
  addWheel(1.6, -0.65, 1.8);
  addWheel(-1.6, -0.65, -1.8);
  addWheel(1.6, -0.65, -1.8);

  // Rear LED Taillight Bar
  const tailBarGeo = new THREE.BoxGeometry(2.8, 0.12, 0.08);
  const tailBar = new THREE.Mesh(tailBarGeo, redLightMat);
  tailBar.position.set(0, -0.05, -3.11);
  group.add(tailBar);

  // Front Headlights
  const headGeo = new THREE.BoxGeometry(0.6, 0.15, 0.08);
  const leftHead = new THREE.Mesh(headGeo, amberLightMat);
  leftHead.position.set(-1.0, -0.08, 3.11);
  group.add(leftHead);

  const rightHead = new THREE.Mesh(headGeo, amberLightMat);
  rightHead.position.set(1.0, -0.08, 3.11);
  group.add(rightHead);

  // 3. STICKER ON VEHICLE REAR WINDOW: 4" x 4" scale
  // Compared to the 1.38 unit laptop sticker, 4" on a vehicle is visibly larger: ~2.15 units
  const stickerSize = 2.15;
  const stickerGeo = new THREE.PlaneGeometry(stickerSize, stickerSize);
  const stickerMat = new THREE.MeshStandardMaterial({
    map: stickerTexture,
    transparent: true,
    roughness: 0.15,
    metalness: 0.05,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2
  });
  const stickerMesh = new THREE.Mesh(stickerGeo, stickerMat);
  stickerMesh.rotation.y = Math.PI; // Face towards the back
  stickerMesh.rotation.x = -Math.PI / 3.4; // Align with rear windshield slope
  stickerMesh.position.set(0, 0.44, -1.97);
  group.add(stickerMesh);

  // Subtle safety accent border
  const borderGeo = new THREE.PlaneGeometry(stickerSize + 0.08, stickerSize + 0.08);
  const borderMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(swatch || '#F59E0B'),
    transparent: true,
    opacity: 0.28
  });
  const borderMesh = new THREE.Mesh(borderGeo, borderMat);
  borderMesh.rotation.y = Math.PI;
  borderMesh.rotation.x = -Math.PI / 3.4;
  borderMesh.position.set(0, 0.44, -1.968);
  group.add(borderMesh);

  // Default display orientation: 3/4 rear perspective showing sticker on the window
  group.rotation.set(0.15, Math.PI - 0.4, 0);

  return group;
}

/**
 * Builds Standalone Floating 3D Die-Cut Sticker
 */
function buildStickerOnlyModel(stickerTexture, swatch) {
  const group = new THREE.Group();
  group.name = 'sticker-only-model';

  const stickerSize = 3.6;

  // Front Vinyl Face
  const frontGeo = new THREE.PlaneGeometry(stickerSize, stickerSize);
  const frontMat = new THREE.MeshStandardMaterial({
    map: stickerTexture,
    transparent: true,
    roughness: 0.12,
    metalness: 0.06
  });
  const frontMesh = new THREE.Mesh(frontGeo, frontMat);
  frontMesh.position.z = 0.02;
  group.add(frontMesh);

  // Backing Paper Layer
  const backGeo = new THREE.PlaneGeometry(stickerSize, stickerSize);
  const backMat = new THREE.MeshStandardMaterial({
    color: 0xF3F4F6,
    roughness: 0.7,
    metalness: 0.0
  });
  const backMesh = new THREE.Mesh(backGeo, backMat);
  backMesh.rotation.y = Math.PI;
  backMesh.position.z = -0.02;
  group.add(backMesh);

  // Die-Cut Vinyl Outer Border Plate
  const plateGeo = new THREE.BoxGeometry(stickerSize + 0.08, stickerSize + 0.08, 0.035);
  const plateMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(swatch || '#F59E0B'),
    roughness: 0.3,
    metalness: 0.2
  });
  const plateMesh = new THREE.Mesh(plateGeo, plateMat);
  group.add(plateMesh);

  // Subtle floating orientation
  group.rotation.set(0.08, -0.2, 0);

  return group;
}

export default function Sticker3DViewer({
  product,
  selectedTarget = 'mobile', // 'mobile' | 'laptop' | 'vehicle' | 'sticker'
  onSelectTarget
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const activeModelRef = useRef(null);
  const animFrameRef = useRef(null);
  const textureRef = useRef(null);

  // Interaction State
  const [isDragging, setIsDragging] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [loaded, setLoaded] = useState(false);

  const dragRef = useRef({
    isDown: false,
    startX: 0,
    startY: 0,
    rotX: 0,
    rotY: 0,
    velX: 0,
    velY: 0,
    lastMoveTime: 0
  });

  // Size specifications metadata
  const SIZES = {
    mobile: { dim: '2" × 2"', metric: '50mm × 50mm', label: 'Compact Fit', surface: 'Smartphone Back Glass' },
    laptop: { dim: '2" × 2"', metric: '50mm × 50mm', label: 'Standard Fit', surface: 'Laptop / MacBook Lid' },
    vehicle: { dim: '4" × 4"', metric: '100mm × 100mm', label: 'Safety Max Fit', surface: 'Vehicle Rear Glass / Bumper' },
    sticker: { dim: 'Real-Scale', metric: 'Die-Cut Vinyl', label: 'Raw View', surface: 'UV High-Gloss Vinyl' }
  };

  const currentSize = SIZES[selectedTarget] || SIZES.mobile;

  // 1. Initial Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 450;
    const height = container.clientHeight || 450;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.8);
    cameraRef.current = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xFFFFFF, 1.8);
    dirLight1.position.set(5, 8, 6);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xF59E0B, 1.0);
    dirLight2.position.set(-6, -3, -5);
    scene.add(dirLight2);

    const fillLight = new THREE.PointLight(0x60A5FA, 0.8, 20);
    fillLight.position.set(0, -4, 4);
    scene.add(fillLight);

    // Load Texture
    const loader = new THREE.TextureLoader();
    const imgSrc = product?.image || product?.src;

    if (imgSrc) {
      loader.load(
        imgSrc,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          textureRef.current = tex;
          setLoaded(true);
        },
        undefined,
        () => {
          textureRef.current = createFallbackTexture(product?.name, product?.swatch);
          setLoaded(true);
        }
      );
    } else {
      textureRef.current = createFallbackTexture(product?.name, product?.swatch);
      setLoaded(true);
    }

    // Handle Window Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [product?.image, product?.src, product?.name, product?.swatch]);

  // 2. Rebuild Model when Target or Texture Changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !loaded) return;

    // Remove existing model
    if (activeModelRef.current) {
      scene.remove(activeModelRef.current);
      activeModelRef.current.traverse((child) => {
        if (child.isMesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material?.dispose();
          }
        }
      });
      activeModelRef.current = null;
    }

    const tex = textureRef.current || createFallbackTexture(product?.name, product?.swatch);
    let newModel = null;

    if (selectedTarget === 'laptop') {
      newModel = buildLaptopModel(tex, product?.swatch);
      if (cameraRef.current) cameraRef.current.position.set(0, 0, 8.8);
    } else if (selectedTarget === 'vehicle') {
      newModel = buildVehicleModel(tex, product?.swatch);
      if (cameraRef.current) cameraRef.current.position.set(0, 0, 9.2);
    } else if (selectedTarget === 'sticker') {
      newModel = buildStickerOnlyModel(tex, product?.swatch);
      if (cameraRef.current) cameraRef.current.position.set(0, 0, 6.8);
    } else {
      // Default: Mobile
      newModel = buildMobileModel(tex, product?.swatch);
      if (cameraRef.current) cameraRef.current.position.set(0, 0, 7.6);
    }

    scene.add(newModel);
    activeModelRef.current = newModel;

    // Sync drag rotation reference to newly spawned model's initial orientation
    dragRef.current.rotX = newModel.rotation.x;
    dragRef.current.rotY = newModel.rotation.y;
    dragRef.current.velX = 0;
    dragRef.current.velY = 0;
  }, [selectedTarget, loaded, product?.swatch, product?.name]);

  // 3. Render Loop with Smooth Momentum & Idle Auto-Rotate
  useEffect(() => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!renderer || !scene || !camera) return;

    let lastTime = performance.now();

    const animate = (time) => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const model = activeModelRef.current;
      if (model) {
        if (!dragRef.current.isDown) {
          // Apply velocity inertia
          dragRef.current.rotY += dragRef.current.velY;
          dragRef.current.rotX += dragRef.current.velX;

          // Friction damping
          dragRef.current.velX *= 0.92;
          dragRef.current.velY *= 0.92;

          // Idle gentle auto-rotate when not actively thrown
          if (autoRotate && Math.abs(dragRef.current.velY) < 0.001) {
            dragRef.current.rotY += 0.006;
          }
        }

        // Clamp pitch so object doesn't turn upside-down
        dragRef.current.rotX = Math.max(-1.1, Math.min(1.1, dragRef.current.rotX));

        model.rotation.y = dragRef.current.rotY;
        model.rotation.x = dragRef.current.rotX;
      }

      renderer.render(scene, camera);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [autoRotate]);

  // 4. Pointer Interaction Handlers (Mouse & Touch Moveable)
  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    dragRef.current.isDown = true;
    dragRef.current.startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    dragRef.current.startY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    dragRef.current.velX = 0;
    dragRef.current.velY = 0;
    dragRef.current.lastMoveTime = performance.now();
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.isDown) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

    const dx = clientX - dragRef.current.startX;
    const dy = clientY - dragRef.current.startY;

    const rotSensitivity = 0.007;
    dragRef.current.rotY += dx * rotSensitivity;
    dragRef.current.rotX += dy * rotSensitivity;

    const now = performance.now();
    const dt = Math.max(1, now - dragRef.current.lastMoveTime);
    dragRef.current.velY = (dx * rotSensitivity * 16) / dt;
    dragRef.current.velX = (dy * rotSensitivity * 16) / dt;

    dragRef.current.startX = clientX;
    dragRef.current.startY = clientY;
    dragRef.current.lastMoveTime = now;
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    dragRef.current.isDown = false;
  };

  // Reset to default angle
  const handleResetView = useCallback(() => {
    if (!activeModelRef.current) return;
    let defX = 0.12;
    let defY = Math.PI - 0.25;

    if (selectedTarget === 'laptop') {
      defX = 0.18;
      defY = Math.PI - 0.45;
    } else if (selectedTarget === 'vehicle') {
      defX = 0.15;
      defY = Math.PI - 0.4;
    } else if (selectedTarget === 'sticker') {
      defX = 0.08;
      defY = -0.2;
    }

    dragRef.current.rotX = defX;
    dragRef.current.rotY = defY;
    dragRef.current.velX = 0;
    dragRef.current.velY = 0;
  }, [selectedTarget]);

  return (
    <div className="w-full flex flex-col items-center">
      {/* 3D Stage Card */}
      <div
        className="w-full max-w-[500px] aspect-[4/5] rounded-[36px] bg-gradient-to-b from-[#181822] via-[#12131A] to-[#0A0B0E] border border-white/15 p-4 sm:p-6 flex flex-col items-center justify-between relative shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden group select-none"
        style={{ touchAction: 'none' }}
      >
        {/* Dynamic Background Glow */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none blur-3xl transition-all duration-700"
          style={{ backgroundColor: product?.swatch || '#F59E0B' }}
        />

        {/* Top Floating Badges */}
        <div className="w-full flex items-center justify-between relative z-20 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-400 text-xs font-mono font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>3D Real-Scale Preview</span>
            </span>

            <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-white/90 text-xs font-mono font-bold">
              {currentSize.dim}
            </span>
          </div>

          {/* Reset Camera Button */}
          <button
            type="button"
            onClick={handleResetView}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 border border-white/15 text-white/70 hover:text-white flex items-center justify-center transition-all pointer-events-auto cursor-pointer shadow-md active:scale-95"
            title="Reset viewing angle"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Canvas Mount Viewport (Movable 3D Model Area) */}
        <div
          ref={mountRef}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          className={`w-full h-full flex-1 flex items-center justify-center relative cursor-grab active:cursor-grabbing ${
            isDragging ? 'cursor-grabbing' : ''
          }`}
        />

        {/* Bottom Stage Info Overlay */}
        <div className="w-full flex items-center justify-between pt-3 border-t border-white/10 relative z-20 text-xs text-white/60">
          <div className="flex items-center gap-1.5 font-medium text-[11px] text-white/70">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Drag in any direction to rotate 360°</span>
          </div>

          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className="text-[11px] font-mono text-amber-400/90 hover:text-amber-300 transition-colors cursor-pointer"
          >
            {autoRotate ? 'Auto-spin: ON' : 'Auto-spin: PAUSED'}
          </button>
        </div>
      </div>

      {/* Target Surface Selector Bar under the 3D Stage */}
      <div className="w-full max-w-[500px] grid grid-cols-4 gap-2 mt-4">
        {[
          { id: 'mobile', label: 'Mobile', dim: '2" × 2"', icon: Smartphone },
          { id: 'laptop', label: 'Laptop', dim: '2" × 2"', icon: Laptop },
          { id: 'vehicle', label: 'Vehicle', dim: '4" × 4"', icon: Car },
          { id: 'sticker', label: 'Sticker', dim: 'Die-Cut', icon: Tag }
        ].map((item) => {
          const Icon = item.icon;
          const isSelected = selectedTarget === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTarget && onSelectTarget(item.id)}
              className={`p-2.5 rounded-2xl border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-400 text-black border-amber-400 shadow-[0_4px_20px_rgba(245,158,11,0.3)] font-bold'
                  : 'bg-[#12131A] hover:bg-[#181A24] text-white/70 hover:text-white border-white/10'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-black' : 'text-amber-400'}`} />
              <span className="text-xs font-extrabold leading-none">{item.label}</span>
              <span className={`text-[10px] font-mono leading-none ${isSelected ? 'text-black/80' : 'text-white/40'}`}>
                {item.dim}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
