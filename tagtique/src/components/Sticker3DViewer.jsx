import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { RotateCw, ZoomIn, Eye, Smartphone, Laptop, Car, Tag, RefreshCw } from 'lucide-react';

// In-memory cache for loaded and cloned OBJ models so switching is instantaneous
const MODEL_CACHE = new Map();

/**
 * Camera and Focus Configuration for Overview vs Close-up modes
 * In Close-up mode, the camera aligns directly along the sticker's normal at close range,
 * fixing the viewpoint firmly on the sticker artwork.
 */
const VIEW_CONFIG = {
  mobile: {
    overview: {
      camPos: new THREE.Vector3(0, 0, 7.8),
      target: new THREE.Vector3(0, 0, 0),
      defRot: { x: 0.08, y: -0.22 }
    },
    closeup: {
      camPos: new THREE.Vector3(-0.445, -0.467, 1.986),
      target: new THREE.Vector3(-0.009, -0.623, 0.040),
      defRot: { x: 0.08, y: -0.22 }
    }
  },
  laptop: {
    overview: {
      camPos: new THREE.Vector3(0, 0, 8.2),
      target: new THREE.Vector3(0, 0, 0),
      defRot: { x: 0.22, y: -0.38 }
    },
    closeup: {
      camPos: new THREE.Vector3(-1.189, -0.946, 2.665),
      target: new THREE.Vector3(-0.288, -0.138, 1.618),
      defRot: { x: 0.22, y: -0.38 }
    }
  },
  vehicle: {
    overview: {
      camPos: new THREE.Vector3(0, 0, 8.8),
      target: new THREE.Vector3(0, 0, 0),
      defRot: { x: 0.18, y: -Math.PI * 0.38 }
    },
    closeup: {
      // Perpendicular to car windshield at 0.32 units distance: sticker fills ~70% of screen width
      camPos: new THREE.Vector3(-0.168, 0.628, 1.078),
      target: new THREE.Vector3(-0.171, 0.345, 0.930),
      defRot: { x: 0.18, y: -Math.PI * 0.38 }
    }
  },
  sticker: {
    overview: {
      camPos: new THREE.Vector3(0, 0, 6.8),
      target: new THREE.Vector3(0, 0, 0),
      defRot: { x: 0, y: 0 }
    },
    closeup: {
      camPos: new THREE.Vector3(0, 0, 3.2),
      target: new THREE.Vector3(0, 0, 0),
      defRot: { x: 0, y: 0 }
    }
  }
};

/**
 * Creates soft studio radial shadow under the 3D model
 */
function createShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
  gradient.addColorStop(0.35, 'rgba(0, 0, 0, 0.35)');
  gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.10)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Procedural fallback canvas for QR sticker when image is loading
 */
function createFallbackTexture(name, swatch = '#F59E0B') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = swatch;
  ctx.lineWidth = 14;
  ctx.strokeRect(20, 20, 472, 472);

  ctx.fillStyle = '#111827';
  const size = 18;
  const offset = 70;
  for (let r = 0; r < 20; r++) {
    for (let c = 0; c < 20; c++) {
      if ((r + c) % 2 === 0 || (r < 6 && c < 6) || (r > 13 && c < 6) || (r < 6 && c > 13)) {
        ctx.fillRect(offset + c * size, offset + r * size, size - 2, size - 2);
      }
    }
  }

  ctx.fillStyle = swatch;
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(name || 'TAGTIQUE', 256, 455);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Upgrades an OBJ material to physically realistic Three.js shader
 */
function createRefinedMaterial(matName, stickerTexture) {
  // 1. STICKER MATERIAL: High-gloss vinyl with authentic PNG transparency
  if (matName === 'sticker_vinyl' || matName === 'sticker') {
    const mat = new THREE.MeshStandardMaterial({
      map: stickerTexture,
      transparent: true,
      alphaTest: 0.01,
      roughness: 0.12,
      metalness: 0.02,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2
    });
    mat.name = 'sticker_vinyl';
    return mat;
  }

  // 2. PHONE MATERIALS
  if (matName === 'titanium_frame') {
    return new THREE.MeshStandardMaterial({
      color: 0xD6D8DF, // Natural Titanium
      metalness: 0.92,
      roughness: 0.22
    });
  }
  if (matName === 'back_glass_frosted') {
    return new THREE.MeshPhysicalMaterial({
      color: 0xF2F3F7, // Frosted Matte Glass
      metalness: 0.08,
      roughness: 0.26,
      clearcoat: 0.85,
      clearcoatRoughness: 0.12
    });
  }
  if (matName === 'display_glass') {
    return new THREE.MeshPhysicalMaterial({
      color: 0x06070B,
      metalness: 0.9,
      roughness: 0.04,
      clearcoat: 1.0
    });
  }
  if (matName === 'camera_plateau') {
    return new THREE.MeshPhysicalMaterial({
      color: 0xE8E9EF,
      metalness: 0.2,
      roughness: 0.18,
      clearcoat: 1.0
    });
  }
  if (matName === 'lens_ring') {
    return new THREE.MeshStandardMaterial({
      color: 0xB8BAC3,
      metalness: 0.95,
      roughness: 0.12
    });
  }
  if (matName === 'lens_glass') {
    return new THREE.MeshPhysicalMaterial({
      color: 0x040508,
      metalness: 0.95,
      roughness: 0.02,
      clearcoat: 1.0
    });
  }
  if (matName === 'flash') {
    return new THREE.MeshStandardMaterial({
      color: 0xFEF08A,
      roughness: 0.3,
      emissive: 0xFEF08A,
      emissiveIntensity: 0.4
    });
  }

  // 3. LAPTOP MATERIALS (MacBook Pro Aluminum Unibody)
  if (matName === 'aluminum') {
    return new THREE.MeshStandardMaterial({
      color: 0xDCDDE2, // Apple Silver
      metalness: 0.84,
      roughness: 0.24
    });
  }
  if (matName === 'keyboard_well') {
    return new THREE.MeshStandardMaterial({
      color: 0x22232B,
      roughness: 0.55,
      metalness: 0.3
    });
  }
  if (matName === 'keycaps') {
    return new THREE.MeshStandardMaterial({
      color: 0x181920,
      roughness: 0.5,
      metalness: 0.2
    });
  }
  if (matName === 'trackpad') {
    return new THREE.MeshStandardMaterial({
      color: 0xD0D2D8,
      roughness: 0.3,
      metalness: 0.75
    });
  }
  if (matName === 'display_panel') {
    return new THREE.MeshBasicMaterial({
      color: 0x06070B
    });
  }
  if (matName === 'hinge') {
    return new THREE.MeshStandardMaterial({
      color: 0x1E2028,
      metalness: 0.9,
      roughness: 0.2
    });
  }

  // 4. CAR MATERIALS (Automotive Showroom Finish)
  if (matName === 'paint_pearl_white') {
    return new THREE.MeshPhysicalMaterial({
      color: 0xFAFAFD, // Pearl White Automotive Paint
      metalness: 0.3,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04
    });
  }
  if (matName === 'tinted_glass') {
    return new THREE.MeshPhysicalMaterial({
      color: 0x161C26,
      metalness: 0.4,
      roughness: 0.06,
      transmission: 0.35,
      transparent: true,
      opacity: 0.88
    });
  }
  if (matName === 'trim_gloss_black') {
    return new THREE.MeshPhysicalMaterial({
      color: 0x111216,
      metalness: 0.6,
      roughness: 0.08,
      clearcoat: 1.0
    });
  }
  if (matName === 'trim_matte_black') {
    return new THREE.MeshStandardMaterial({
      color: 0x1C1D22,
      roughness: 0.65,
      metalness: 0.2
    });
  }
  if (matName === 'headlight') {
    return new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      emissive: 0xFFFFFF,
      emissiveIntensity: 0.7,
      roughness: 0.1
    });
  }
  if (matName === 'taillight') {
    return new THREE.MeshStandardMaterial({
      color: 0xEF4444,
      emissive: 0xEF4444,
      emissiveIntensity: 0.6,
      roughness: 0.2
    });
  }
  if (matName === 'tire_rubber') {
    return new THREE.MeshStandardMaterial({
      color: 0x16171B,
      roughness: 0.85,
      metalness: 0.1
    });
  }
  if (matName === 'alloy') {
    return new THREE.MeshStandardMaterial({
      color: 0xE2E4EC,
      metalness: 0.95,
      roughness: 0.12
    });
  }

  return new THREE.MeshStandardMaterial({ color: 0xCCCCCC, roughness: 0.3 });
}

/**
 * Loads and processes an OBJ model from public/models/
 */
async function loadTargetModel(target, stickerTexture) {
  const cacheKey = target;
  if (MODEL_CACHE.has(cacheKey)) {
    const cached = MODEL_CACHE.get(cacheKey).clone(true);
    // Re-apply current stickerTexture to the sticker mesh
    cached.traverse((child) => {
      if (child.isMesh && (child.name === 'sticker' || (child.material && child.material.name === 'sticker_vinyl'))) {
        child.material = createRefinedMaterial('sticker_vinyl', stickerTexture);
      }
    });
    return cached;
  }

  const modelMap = {
    mobile: { obj: '/models/sticker-phone.obj', mtl: '/models/sticker-phone.mtl', targetScale: 4.8 },
    laptop: { obj: '/models/sticker-laptop.obj', mtl: '/models/sticker-laptop.mtl', targetScale: 4.8 },
    vehicle: { obj: '/models/sticker-car.obj', mtl: '/models/sticker-car.mtl', targetScale: 5.2 }
  };

  const config = modelMap[target];
  if (!config) return null;

  return new Promise((resolve, reject) => {
    const mtlLoader = new MTLLoader();
    mtlLoader.load(
      config.mtl,
      (materials) => {
        materials.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load(
          config.obj,
          (object) => {
            // Apply refined physically based shaders
            object.traverse((child) => {
              if (child.isMesh) {
                const matName = (child.material && child.material.name) || child.name;
                child.material = createRefinedMaterial(matName, stickerTexture);
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });

            // Scale first, then compute bounding box and dead-center at (0, 0, 0)
            const rawBox = new THREE.Box3().setFromObject(object);
            const rawSize = rawBox.getSize(new THREE.Vector3());
            const maxDim = Math.max(rawSize.x, rawSize.y, rawSize.z) || 1;
            const scale = config.targetScale / maxDim;

            object.scale.setScalar(scale);
            object.updateMatrixWorld(true);

            // Center exactly at origin (0, 0, 0)
            const scaledBox = new THREE.Box3().setFromObject(object);
            const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
            object.position.set(-scaledCenter.x, -scaledCenter.y, -scaledCenter.z);
            object.updateMatrixWorld(true);

            // Wrap in an outer group for clean turntable rotation control
            const outerGroup = new THREE.Group();
            outerGroup.rotation.order = 'YXZ';
            outerGroup.add(object);

            // Set default orientation so the sticker is immediately facing the user
            if (target === 'mobile') {
              outerGroup.rotation.set(0.08, -0.22, 0);
            } else if (target === 'laptop') {
              outerGroup.rotation.set(0.22, -0.38, 0);
            } else if (target === 'vehicle') {
              outerGroup.rotation.set(0.18, -Math.PI * 0.38, 0);
            }

            // Cache base model
            MODEL_CACHE.set(cacheKey, outerGroup);
            resolve(outerGroup.clone(true));
          },
          undefined,
          (err) => reject(err)
        );
      },
      undefined,
      (err) => reject(err)
    );
  });
}

/**
 * Builds standalone original 3D floating sticker preserving authentic aspect ratio
 * Shows ONLY the die-cut vinyl sticker with zero square/rectangular card backing
 */
function buildStickerOnlyModel(stickerTexture, aspect = 1) {
  const group = new THREE.Group();
  group.name = 'sticker-only';
  group.rotation.order = 'YXZ';

  let stickerH = 3.8;
  let stickerW = stickerH * aspect;
  if (stickerW > 4.2) {
    stickerW = 4.2;
    stickerH = stickerW / aspect;
  }

  // Front High-Gloss Die-Cut Vinyl Face ONLY
  const frontGeo = new THREE.PlaneGeometry(stickerW, stickerH);
  const frontMat = new THREE.MeshStandardMaterial({
    map: stickerTexture,
    transparent: true,
    alphaTest: 0.01,
    roughness: 0.15,
    metalness: 0.05,
    side: THREE.DoubleSide
  });
  const frontMesh = new THREE.Mesh(frontGeo, frontMat);
  group.add(frontMesh);

  // Directly faces camera
  group.rotation.set(0, 0, 0);
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
  const shadowMeshRef = useRef(null);
  const accentLightRef = useRef(null);
  const animFrameRef = useRef(null);
  const textureRef = useRef(null);
  const aspectRef = useRef(1);

  // View mode: 'overview' shows whole product (360° rotatable); 'closeup' fixes focus firmly on the sticker
  const [viewMode, setViewMode] = useState('overview');
  const [isDragging, setIsDragging] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);

  const swatchColor = product?.swatch || product?.accent || '#F59E0B';

  // Smooth camera position & lookAt target references
  const currentLookAtRef = useRef(new THREE.Vector3(0, 0, 0));
  const targetLookAtRef = useRef(new THREE.Vector3(0, 0, 0));
  const targetCamPosRef = useRef(new THREE.Vector3(0, 0, 8.2));

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

  const SIZES = {
    mobile: { label: 'iPhone Pro', surface: 'Titanium & Glass' },
    laptop: { label: 'MacBook Pro', surface: 'Aluminum Unibody' },
    vehicle: { label: 'Sports Sedan', surface: 'Front Windshield' },
    sticker: { label: 'Sticker Only', surface: 'Die-Cut Vinyl' }
  };

  const currentInfo = SIZES[selectedTarget] || SIZES.mobile;

  // 1. Initial Scene Setup (Transparent WebGL on Dynamic Harmonized Studio Card)
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 450;
    const height = container.clientHeight || 450;

    // Scene with transparent background so CSS studio glow shines through
    const scene = new THREE.Scene();
    scene.background = null;
    sceneRef.current = scene;

    // Initial camera position & target from VIEW_CONFIG
    const cfg = VIEW_CONFIG[selectedTarget] || VIEW_CONFIG.mobile;
    const initialMode = cfg[viewMode] || cfg.overview;
    targetCamPosRef.current.copy(initialMode.camPos);
    targetLookAtRef.current.copy(initialMode.target);
    currentLookAtRef.current.copy(initialMode.target);

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.05, 100);
    camera.position.copy(initialMode.camPos);
    camera.lookAt(initialMode.target);
    cameraRef.current = camera;

    // WebGL Renderer with alpha: true
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Studio 3-Point Lighting
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.3);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xFFFFFF, 1.8);
    keyLight.position.set(6, 8, 7);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xF8FAFC, 1.2);
    fillLight.position.set(-6, 4, 6);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xFFFFFF, 1.1);
    rimLight.position.set(0, 8, -6);
    scene.add(rimLight);

    // Dynamic Swatch Accent Point Light
    const accentLight = new THREE.PointLight(new THREE.Color(swatchColor), 2.0, 15);
    accentLight.position.set(0, 3, 5);
    scene.add(accentLight);
    accentLightRef.current = accentLight;

    // Soft Studio Ground Shadow Plane
    const shadowTex = createShadowTexture();
    const shadowGeo = new THREE.PlaneGeometry(8.5, 8.5);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.55,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -2.42;
    scene.add(shadowMesh);
    shadowMeshRef.current = shadowMesh;

    // Load Texture with exact aspect ratio calculation
    const loader = new THREE.TextureLoader();
    const imgSrc = product?.image || product?.src;

    if (imgSrc) {
      loader.load(
        imgSrc,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.generateMipmaps = true;

          const img = tex.image;
          aspectRef.current = img ? img.width / img.height : 1;
          textureRef.current = tex;
          setLoaded(true);
        },
        undefined,
        () => {
          textureRef.current = createFallbackTexture(product?.name, swatchColor);
          aspectRef.current = 1;
          setLoaded(true);
        }
      );
    } else {
      textureRef.current = createFallbackTexture(product?.name, swatchColor);
      aspectRef.current = 1;
      setLoaded(true);
    }

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
  }, [product?.image, product?.src, product?.name]);

  // Update accent light when swatch changes
  useEffect(() => {
    if (accentLightRef.current) {
      accentLightRef.current.color.set(swatchColor);
    }
  }, [swatchColor]);

  // 2. Load and Switch Model when Target or ViewMode Changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !loaded) return;

    let isCancelled = false;

    // Remove existing model
    if (activeModelRef.current) {
      scene.remove(activeModelRef.current);
      activeModelRef.current = null;
    }

    const tex = textureRef.current || createFallbackTexture(product?.name, swatchColor);
    const aspect = aspectRef.current || 1;
    const cfg = VIEW_CONFIG[selectedTarget] || VIEW_CONFIG.mobile;
    const targetMode = cfg[viewMode] || cfg.overview;

    targetCamPosRef.current.copy(targetMode.camPos);
    targetLookAtRef.current.copy(targetMode.target);

    if (selectedTarget === 'sticker') {
      const stickerModel = buildStickerOnlyModel(tex, aspect);
      scene.add(stickerModel);
      activeModelRef.current = stickerModel;

      if (shadowMeshRef.current) {
        shadowMeshRef.current.position.y = -2.2;
        shadowMeshRef.current.scale.set(0.75, 0.75, 1);
      }

      dragRef.current.rotX = targetMode.defRot.x;
      dragRef.current.rotY = targetMode.defRot.y;
      dragRef.current.velX = 0;
      dragRef.current.velY = 0;
      setModelLoading(false);
      return;
    }

    // Load OBJ Model from user's product models
    setModelLoading(true);
    loadTargetModel(selectedTarget, tex)
      .then((model) => {
        if (isCancelled || !model) return;

        scene.add(model);
        activeModelRef.current = model;

        if (selectedTarget === 'laptop') {
          if (shadowMeshRef.current) {
            shadowMeshRef.current.position.y = -1.43;
            shadowMeshRef.current.scale.set(1.1, 1.1, 1);
          }
        } else if (selectedTarget === 'vehicle') {
          if (shadowMeshRef.current) {
            shadowMeshRef.current.position.y = -0.89;
            shadowMeshRef.current.scale.set(1.35, 0.95, 1);
          }
        } else {
          // iPhone Pro
          if (shadowMeshRef.current) {
            shadowMeshRef.current.position.y = -2.42;
            shadowMeshRef.current.scale.set(0.65, 0.65, 1);
          }
        }

        dragRef.current.rotX = targetMode.defRot.x;
        dragRef.current.rotY = targetMode.defRot.y;
        dragRef.current.velX = 0;
        dragRef.current.velY = 0;
        setModelLoading(false);
      })
      .catch((err) => {
        console.warn('OBJ model load fallback:', err);
        setModelLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedTarget, loaded, product?.name, swatchColor]);

  // 3. Smooth Camera Glide & Interactive Rotation Animation Loop (NO AUTO-SPIN)
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
        if (!dragRef.current.isDown && viewMode === 'overview') {
          dragRef.current.rotY += dragRef.current.velY;
          dragRef.current.rotX += dragRef.current.velX;

          dragRef.current.velX *= 0.92;
          dragRef.current.velY *= 0.92;
        }

        // Clamp pitch according to model type in overview mode
        let minPitch = -0.55;
        let maxPitch = 0.65;
        if (selectedTarget === 'vehicle') {
          minPitch = -0.15;
          maxPitch = 0.55;
        } else if (selectedTarget === 'laptop') {
          minPitch = -0.25;
          maxPitch = 0.65;
        } else if (selectedTarget === 'sticker') {
          minPitch = -0.45;
          maxPitch = 0.45;
        }

        dragRef.current.rotX = Math.max(minPitch, Math.min(maxPitch, dragRef.current.rotX));
        model.rotation.y = dragRef.current.rotY;
        model.rotation.x = dragRef.current.rotX;
      }

      // Smooth camera interpolation
      camera.position.lerp(targetCamPosRef.current, 0.08);
      currentLookAtRef.current.lerp(targetLookAtRef.current, 0.08);
      camera.lookAt(currentLookAtRef.current);

      renderer.render(scene, camera);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [selectedTarget, viewMode]);

  // 4. Pointer Drag Handlers (Active ONLY in Overview; in Close-up, focus is firmly locked on sticker)
  const handlePointerDown = (e) => {
    if (viewMode === 'closeup') return; // Fixed focus on sticker in closeup mode
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
    if (viewMode === 'closeup' || !dragRef.current.isDown) return;
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

  // Switch between Overview and Close-up with smooth camera glide
  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    const cfg = VIEW_CONFIG[selectedTarget] || VIEW_CONFIG.mobile;
    const targetMode = cfg[mode] || cfg.overview;

    targetCamPosRef.current.copy(targetMode.camPos);
    targetLookAtRef.current.copy(targetMode.target);

    // Immediately fix and lock model orientation squarely onto the sticker
    dragRef.current.rotX = targetMode.defRot.x;
    dragRef.current.rotY = targetMode.defRot.y;
    dragRef.current.velX = 0;
    dragRef.current.velY = 0;
    dragRef.current.isDown = false;
    setIsDragging(false);
  };

  // Reset Camera View Button Handler
  const handleResetView = useCallback(() => {
    if (!activeModelRef.current) return;
    const cfg = VIEW_CONFIG[selectedTarget] || VIEW_CONFIG.mobile;
    const currentMode = cfg[viewMode] || cfg.overview;

    dragRef.current.rotX = currentMode.defRot.x;
    dragRef.current.rotY = currentMode.defRot.y;
    dragRef.current.velX = 0;
    dragRef.current.velY = 0;
    dragRef.current.isDown = false;
    setIsDragging(false);

    targetCamPosRef.current.copy(currentMode.camPos);
    targetLookAtRef.current.copy(currentMode.target);
  }, [selectedTarget, viewMode]);

  return (
    <div className="w-full flex flex-col items-center">
      {/* 3D Stage Card - DYNAMICALLY HARMONIZED WITH STICKER SWATCH */}
      <div
        className="w-full max-w-[500px] aspect-[4/5] rounded-[36px] border p-4 sm:p-6 flex flex-col items-center justify-between relative overflow-hidden group select-none transition-all duration-700"
        style={{
          touchAction: 'none',
          background: `radial-gradient(circle at 50% 45%, ${swatchColor}38 0%, ${swatchColor}18 35%, #13141D 70%, #0D0E15 100%)`,
          borderColor: `${swatchColor}35`,
          boxShadow: `0 25px 60px -15px ${swatchColor}25, 0 0 40px ${swatchColor}10, inset 0 1px 1px rgba(255, 255, 255, 0.12)`
        }}
      >
        {/* Top Floating Controls Bar */}
        <div className="w-full flex items-center justify-between relative z-20 pointer-events-none">
          {/* Closeup / Overview Mode Selector Pill */}
          <div className="flex items-center p-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 shadow-xl pointer-events-auto gap-1">
            <button
              type="button"
              onClick={() => handleSetViewMode('overview')}
              style={
                viewMode === 'overview'
                  ? {
                      backgroundColor: swatchColor,
                      color: '#000000',
                      boxShadow: `0 2px 12px ${swatchColor}60`
                    }
                  : {}
              }
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'overview'
                  ? 'font-extrabold'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetViewMode('closeup')}
              style={
                viewMode === 'closeup'
                  ? {
                      backgroundColor: swatchColor,
                      color: '#000000',
                      boxShadow: `0 2px 12px ${swatchColor}60`
                    }
                  : {}
              }
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'closeup'
                  ? 'font-extrabold'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Close-up</span>
            </button>
          </div>

          {/* Reset Camera View Button */}
          <button
            type="button"
            onClick={handleResetView}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/15 text-white/80 hover:text-white flex items-center justify-center transition-all pointer-events-auto cursor-pointer shadow-lg active:scale-95"
            title="Reset viewing angle"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Loading Indicator Overlay */}
        {modelLoading && (
          <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/90 border border-white/20 text-white text-xs font-mono font-bold shadow-2xl">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ color: swatchColor }} />
              <span>Loading 3D Model...</span>
            </div>
          </div>
        )}

        {/* WebGL Canvas Viewport */}
        <div
          ref={mountRef}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          className={`w-full h-full flex-1 flex items-center justify-center relative ${
            viewMode === 'closeup'
              ? 'cursor-default'
              : isDragging
              ? 'cursor-grabbing'
              : 'cursor-grab active:cursor-grabbing'
          }`}
        />

        {/* Bottom Stage Overlay Bar */}
        <div className="w-full flex items-center justify-between pt-3 border-t border-white/10 relative z-20 text-xs text-white/60">
          <div className="flex items-center gap-1.5 font-medium text-[11px] text-white/80">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {viewMode === 'closeup'
                ? 'Close-up View • Fixed on Sticker'
                : '360° Overview • Drag to rotate'}
            </span>
          </div>

          <span className="text-[11px] font-mono text-white/40">
            {currentInfo.surface}
          </span>
        </div>
      </div>

      {/* Target Placement Selector Grid */}
      <div className="w-full max-w-[500px] grid grid-cols-4 gap-2 mt-4">
        {[
          { id: 'mobile', label: 'iPhone', desc: 'Phone Back', icon: Smartphone },
          { id: 'laptop', label: 'MacBook', desc: 'Laptop Lid', icon: Laptop },
          { id: 'vehicle', label: 'Car', desc: 'Windshield', icon: Car },
          { id: 'sticker', label: 'Sticker', desc: 'Die-Cut View', icon: Tag }
        ].map((item) => {
          const Icon = item.icon;
          const isSelected = selectedTarget === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTarget && onSelectTarget(item.id)}
              style={
                isSelected
                  ? {
                      backgroundColor: swatchColor,
                      borderColor: swatchColor,
                      boxShadow: `0 4px 20px ${swatchColor}50`
                    }
                  : {}
              }
              className={`p-2.5 rounded-2xl border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                isSelected
                  ? 'text-black font-bold'
                  : 'bg-[#12131A] hover:bg-[#181A24] text-white/70 hover:text-white border-white/10'
              }`}
            >
              <Icon
                className="w-4 h-4"
                style={isSelected ? { color: '#000000' } : { color: swatchColor }}
              />
              <span className="text-xs font-extrabold leading-none">{item.label}</span>
              <span
                className={`text-[10px] font-mono leading-none ${
                  isSelected ? 'text-black/80' : 'text-white/40'
                }`}
              >
                {item.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
