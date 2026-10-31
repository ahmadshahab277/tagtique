import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { RotateCw, Sparkles, Smartphone, Laptop, Car, Tag, RefreshCw } from 'lucide-react';

// In-memory cache for loaded and cloned OBJ models so switching is instantaneous
const MODEL_CACHE = new Map();

/**
 * Creates soft studio radial shadow under the 3D model
 */
function createShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.32)');
  gradient.addColorStop(0.35, 'rgba(0, 0, 0, 0.16)');
  gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.04)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Procedural fallback canvas for QR sticker when image is loading
 */
function createFallbackTexture(name) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = '#F59E0B';
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

  ctx.fillStyle = '#F59E0B';
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
    return new THREE.MeshStandardMaterial({
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
      color: 0xDCDDE2, // Apple Silver / Space Grey
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

            // Normalize and center model at origin (0, 0, 0)
            const box = new THREE.Box3().setFromObject(object);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);

            object.position.x -= center.x;
            object.position.y -= center.y;
            object.position.z -= center.z;

            const scale = config.targetScale / maxDim;
            object.scale.setScalar(scale);

            // Wrap in an outer group for clean rotation control
            const outerGroup = new THREE.Group();
            outerGroup.add(object);

            // Set default orientation so the sticker is immediately facing the user
            if (target === 'mobile') {
              outerGroup.rotation.set(0.06, -0.22, 0);
            } else if (target === 'laptop') {
              outerGroup.rotation.set(0.16, -0.42, 0);
            } else if (target === 'vehicle') {
              // Car length is along X; rotate so the rear window with the sticker is prominent
              outerGroup.rotation.set(0.12, Math.PI * 0.72, 0);
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
 */
function buildStickerOnlyModel(stickerTexture, aspect = 1) {
  const group = new THREE.Group();
  group.name = 'sticker-only';

  let stickerH = 3.6;
  let stickerW = stickerH * aspect;
  if (stickerW > 4.2) {
    stickerW = 4.2;
    stickerH = stickerW / aspect;
  }

  // Front High-Gloss Vinyl Face
  const frontGeo = new THREE.PlaneGeometry(stickerW, stickerH);
  const frontMat = new THREE.MeshStandardMaterial({
    map: stickerTexture,
    transparent: true,
    alphaTest: 0.01,
    roughness: 0.12,
    metalness: 0.05
  });
  const frontMesh = new THREE.Mesh(frontGeo, frontMat);
  frontMesh.position.z = 0.02;
  group.add(frontMesh);

  // Backing Adhesive Paper Face
  const backGeo = new THREE.PlaneGeometry(stickerW, stickerH);
  const backMat = new THREE.MeshStandardMaterial({
    color: 0xFAFAFA,
    roughness: 0.8,
    metalness: 0.0
  });
  const backMesh = new THREE.Mesh(backGeo, backMat);
  backMesh.rotation.y = Math.PI;
  backMesh.position.z = -0.02;
  group.add(backMesh);

  group.rotation.set(0.06, -0.15, 0);
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
  const animFrameRef = useRef(null);
  const textureRef = useRef(null);
  const aspectRef = useRef(1);

  const [isDragging, setIsDragging] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);

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
    mobile: { label: 'iPhone Pro', surface: 'Titanium & Glass Back' },
    laptop: { label: 'MacBook Pro', surface: 'Aluminum Unibody Lid' },
    vehicle: { label: 'Sports Sedan', surface: 'Rear Windshield Glass' },
    sticker: { label: 'Sticker Only', surface: 'High-Gloss Die-Cut Vinyl' }
  };

  const currentInfo = SIZES[selectedTarget] || SIZES.mobile;

  // 1. Initial Scene Setup (PURE WHITE STUDIO)
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 450;
    const height = container.clientHeight || 450;

    // Scene with PURE WHITE background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFFFFF);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.2);
    cameraRef.current = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0xFFFFFF, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Studio 3-Point Lighting
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xFFFFFF, 1.5);
    keyLight.position.set(6, 8, 7);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xF1F5F9, 1.0);
    fillLight.position.set(-6, 4, 6);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xFFFFFF, 0.9);
    rimLight.position.set(0, 7, -6);
    scene.add(rimLight);

    // Soft Studio Ground Shadow Plane
    const shadowTex = createShadowTexture();
    const shadowGeo = new THREE.PlaneGeometry(8.5, 8.5);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -2.1;
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
          textureRef.current = createFallbackTexture(product?.name);
          aspectRef.current = 1;
          setLoaded(true);
        }
      );
    } else {
      textureRef.current = createFallbackTexture(product?.name);
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

  // 2. Load and Switch Model when Target Changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !loaded) return;

    let isCancelled = false;

    // Remove existing model
    if (activeModelRef.current) {
      scene.remove(activeModelRef.current);
      activeModelRef.current = null;
    }

    const tex = textureRef.current || createFallbackTexture(product?.name);
    const aspect = aspectRef.current || 1;

    if (selectedTarget === 'sticker') {
      const stickerModel = buildStickerOnlyModel(tex, aspect);
      scene.add(stickerModel);
      activeModelRef.current = stickerModel;
      if (cameraRef.current) cameraRef.current.position.set(0, 0, 6.8);
      if (shadowMeshRef.current) shadowMeshRef.current.position.y = -2.1;

      dragRef.current.rotX = stickerModel.rotation.x;
      dragRef.current.rotY = stickerModel.rotation.y;
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
          if (cameraRef.current) cameraRef.current.position.set(0, 0, 8.5);
          if (shadowMeshRef.current) shadowMeshRef.current.position.y = -1.3;
        } else if (selectedTarget === 'vehicle') {
          if (cameraRef.current) cameraRef.current.position.set(0, 0, 9.2);
          if (shadowMeshRef.current) shadowMeshRef.current.position.y = -1.1;
        } else {
          // iPhone
          if (cameraRef.current) cameraRef.current.position.set(0, 0, 7.8);
          if (shadowMeshRef.current) shadowMeshRef.current.position.y = -2.1;
        }

        dragRef.current.rotX = model.rotation.x;
        dragRef.current.rotY = model.rotation.y;
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
  }, [selectedTarget, loaded, product?.name]);

  // 3. Smooth Momentum Drag & Idle Auto-Rotation
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
          dragRef.current.rotY += dragRef.current.velY;
          dragRef.current.rotX += dragRef.current.velX;

          dragRef.current.velX *= 0.92;
          dragRef.current.velY *= 0.92;

          if (autoRotate && Math.abs(dragRef.current.velY) < 0.001) {
            dragRef.current.rotY += 0.005;
          }
        }

        dragRef.current.rotX = Math.max(-0.95, Math.min(0.95, dragRef.current.rotX));
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

  // 4. Pointer Drag Handlers
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

  const handleResetView = useCallback(() => {
    if (!activeModelRef.current) return;
    let defX = 0.06;
    let defY = -0.22;

    if (selectedTarget === 'laptop') {
      defX = 0.16;
      defY = -0.42;
    } else if (selectedTarget === 'vehicle') {
      defX = 0.12;
      defY = Math.PI * 0.72;
    } else if (selectedTarget === 'sticker') {
      defX = 0.06;
      defY = -0.15;
    }

    dragRef.current.rotX = defX;
    dragRef.current.rotY = defY;
    dragRef.current.velX = 0;
    dragRef.current.velY = 0;
  }, [selectedTarget]);

  return (
    <div className="w-full flex flex-col items-center">
      {/* 3D Stage Card - PURE WHITE STUDIO BACKGROUND */}
      <div
        className="w-full max-w-[500px] aspect-[4/5] rounded-[36px] bg-white border border-black/10 p-4 sm:p-6 flex flex-col items-center justify-between relative shadow-[0_20px_50px_rgba(0,0,0,0.12)] overflow-hidden group select-none"
        style={{ touchAction: 'none' }}
      >
        {/* Top Floating Controls Bar */}
        <div className="w-full flex items-center justify-between relative z-20 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-black/80 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>3D Interactive Studio</span>
            </span>

            <span className="px-2.5 py-1 rounded-full bg-black/5 text-black font-mono font-bold text-xs border border-black/10">
              {currentInfo.label}
            </span>
          </div>

          {/* Reset Camera View Button */}
          <button
            type="button"
            onClick={handleResetView}
            className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 border border-black/15 text-gray-700 hover:text-black flex items-center justify-center transition-all pointer-events-auto cursor-pointer shadow-md active:scale-95"
            title="Reset viewing angle"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Loading Indicator Overlay */}
        {modelLoading && (
          <div className="absolute inset-0 z-30 bg-white/70 backdrop-blur-sm flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-xs font-mono font-bold shadow-lg">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
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
          className={`w-full h-full flex-1 flex items-center justify-center relative cursor-grab active:cursor-grabbing ${
            isDragging ? 'cursor-grabbing' : ''
          }`}
        />

        {/* Bottom Stage Overlay Bar */}
        <div className="w-full flex items-center justify-between pt-3 border-t border-black/10 relative z-20 text-xs text-gray-600">
          <div className="flex items-center gap-1.5 font-medium text-[11px] text-gray-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Drag in any direction to rotate 360°</span>
          </div>

          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className="text-[11px] font-mono text-gray-500 hover:text-black transition-colors cursor-pointer"
          >
            {autoRotate ? 'Auto-spin: ON' : 'Auto-spin: OFF'}
          </button>
        </div>
      </div>

      {/* Target Placement Selector Grid */}
      <div className="w-full max-w-[500px] grid grid-cols-4 gap-2 mt-4">
        {[
          { id: 'mobile', label: 'iPhone', desc: 'Phone Back', icon: Smartphone },
          { id: 'laptop', label: 'MacBook', desc: 'Laptop Lid', icon: Laptop },
          { id: 'vehicle', label: 'Car', desc: 'Rear Window', icon: Car },
          { id: 'sticker', label: 'Sticker', desc: 'Die-Cut View', icon: Tag }
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
                {item.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
