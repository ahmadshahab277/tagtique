import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const VARIANTS = {
  amber: {
    plate: 0xC4953E,
    roughness: 0.26,
    metalness: 0.03,
    bgCss: '#C4953E',
    textColor: '#FFF7E6',
    subTextColor: 'rgba(255, 247, 230, 0.90)',
    borderColor: '#1B0F06',
    qrColor: '#1B0F06',
    name: 'Amber Gold'
  },
  cream: {
    plate: 0xFDF4E6,
    roughness: 0.28,
    metalness: 0.02,
    bgCss: '#FDF4E6',
    textColor: '#2E1B10',
    subTextColor: '#8A5A2B',
    borderColor: '#2E1B10',
    qrColor: '#2E1B10',
    name: 'Cream Sticker'
  },
  espresso: {
    plate: 0x2A180E,
    roughness: 0.24,
    metalness: 0.05,
    bgCss: '#2A180E',
    textColor: '#FDF7EC',
    subTextColor: '#EADFCB',
    borderColor: '#F5B21F',
    qrColor: '#FFFDF8',
    name: 'Espresso'
  },
  glow: {
    plate: 0xffffff,
    roughness: 0.22,
    metalness: 0.06,
    gradient: true,
    textColor: '#1B0F06',
    subTextColor: '#2E1B10',
    borderColor: '#1B0F06',
    qrColor: '#1B0F06',
    name: 'Nightlight'
  }
};

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Procedural high-resolution sticker texture fallback for color variants
function createStickerCanvas(variant = 'amber', seed = 20260920) {
  const cv = document.createElement('canvas');
  cv.width = 1086;
  cv.height = 1263;
  const ctx = cv.getContext('2d');

  const v = VARIANTS[variant] || VARIANTS.amber;

  if (v.gradient) {
    const g = ctx.createLinearGradient(0, 0, cv.width, cv.height);
    g.addColorStop(0, '#8BF7C8');
    g.addColorStop(0.34, '#49E2D2');
    g.addColorStop(0.66, '#6FC8F5');
    g.addColorStop(1, '#B394F2');
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = v.bgCss;
  }
  ctx.fillRect(0, 0, cv.width, cv.height);

  // Top script: "Trusted. Safer. Higher Stakes."
  ctx.textAlign = 'center';
  ctx.fillStyle = v.textColor;
  ctx.font = '700 52px "Caveat", "Baloo 2", cursive, sans-serif';
  ctx.fillText('Trusted. Safer. Higher Stakes.', cv.width / 2, 95);

  // Subtitle: "Scan to Connect."
  ctx.font = '600 28px "Manrope", sans-serif';
  ctx.fillStyle = v.subTextColor;
  ctx.fillText('Scan to Connect.', cv.width / 2, 155);

  // Rounded outer frame around QR code matching Image 1
  const marginX = 52;
  const qrTop = 218;
  const qrSize = cv.width - marginX * 2;
  const qrBorderRadius = 24;

  ctx.strokeStyle = v.borderColor;
  ctx.lineWidth = 14;
  roundRect(ctx, marginX, qrTop, qrSize, qrSize, qrBorderRadius);
  ctx.stroke();

  // Draw QR code
  const padding = 44;
  const qrInnerX = marginX + padding;
  const qrInnerY = qrTop + padding;
  const qrInnerSize = qrSize - padding * 2;

  const n = 29;
  const px = qrInnerSize / n;

  let currentSeed = seed;
  const rnd = () => {
    currentSeed = (currentSeed * 1103515245 + 12345) % 2147483648;
    return currentSeed / 2147483648;
  };

  ctx.fillStyle = v.qrColor;

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const isTopLeft = r < 7 && c < 7;
      const isTopRight = r < 7 && c > n - 8;
      const isBottomLeft = r > n - 8 && c < 7;
      const isCenter = Math.abs(r - 14) <= 2 && Math.abs(c - 14) <= 2;

      let on = false;

      if (isTopLeft || isTopRight || isBottomLeft) {
        const rr = isTopLeft || isTopRight ? r : n - 1 - r;
        const cc = isTopLeft || isBottomLeft ? c : n - 1 - c;
        on = Math.max(Math.abs(rr - 3), Math.abs(cc - 3)) !== 2;
      } else if (isCenter) {
        on = false;
      } else if (r === 6 || c === 6) {
        on = (r + c) % 2 === 0;
      } else {
        on = rnd() > 0.46;
      }

      if (on) {
        ctx.fillRect(
          Math.round(qrInnerX + c * px),
          Math.round(qrInnerY + r * px),
          Math.ceil(px),
          Math.ceil(px)
        );
      }
    }
  }

  // Smile mark in center of QR
  ctx.strokeStyle = v.qrColor;
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const centerX = qrInnerX + qrInnerSize / 2;
  const centerY = qrInnerY + qrInnerSize / 2;
  ctx.arc(centerX, centerY - 4, 22, 0.2 * Math.PI, 0.8 * Math.PI, false);
  ctx.stroke();

  return cv;
}

export default function Tag3D({
  variant = 'amber',
  className = '',
  autoSpin = true,
  interactive = true,
  cameraDistance = 3.3
}) {
  const containerRef = useRef(null);
  const stateRef = useRef({
    plateMat: null,
    frontMat: null,
    backMat: null,
    group: null,
    stickerTexture: null,
    targetY: 0,
    targetX: 0.05,
    curY: -0.2,
    curX: 0.08,
    vel: 0,
    dragging: false,
    lastX: 0,
    lastY: 0
  });

  // Variant texture & material updates
  useEffect(() => {
    const s = stateRef.current;
    if (!s.plateMat || !s.frontMat) return;

    const v = VARIANTS[variant] || VARIANTS.amber;
    s.plateMat.roughness = v.roughness;
    s.plateMat.metalness = v.metalness;
    s.plateMat.color.setHex(v.plate);

    // If amber and user's clean image texture is loaded, use it directly on front & back
    if (variant === 'amber' && s.stickerTexture) {
      s.frontMat.map = s.stickerTexture;
      s.backMat.map = s.stickerTexture;
    } else {
      const frontTex = new THREE.CanvasTexture(createStickerCanvas(variant));
      frontTex.colorSpace = THREE.SRGBColorSpace;
      frontTex.anisotropy = 4;
      s.frontMat.map = frontTex;
      s.backMat.map = frontTex;
    }

    s.frontMat.needsUpdate = true;
    s.backMat.needsUpdate = true;
    s.plateMat.needsUpdate = true;
  }, [variant]);

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth || 500;
    const h = container.clientHeight || 500;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, w / h, 0.1, 50);
    camera.position.set(0, 0, cameraDistance);

    // Studio Lighting for glossy sticker reflections
    scene.add(new THREE.HemisphereLight(0xfff6e8, 0x3a2318, 0.85));

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(2.4, 3.2, 3.8);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffeed6, 1.2);
    fillLight.position.set(-3.2, 0.8, 1.8);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfff5e4, 1.4);
    rimLight.position.set(-1.4, -1.8, -3.2);
    scene.add(rimLight);

    // Geometry: Realistic Rounded Square Vinyl Sticker matching Image 1
    const W = 1.10;
    const H = 1.28;
    const R = 0.08; // Exact gentle rounded corner curve from Image 1
    const D = 0.016; // Slim, realistic vinyl sticker thickness

    const shape = new THREE.Shape();
    const x0 = -W / 2;
    const y0 = -H / 2;
    const x1 = W / 2;
    const y1 = H / 2;

    shape.moveTo(x0 + R, y0);
    shape.lineTo(x1 - R, y0);
    shape.quadraticCurveTo(x1, y0, x1, y0 + R);
    shape.lineTo(x1, y1 - R);
    shape.quadraticCurveTo(x1, y1, x1 - R, y1);
    shape.lineTo(x0 + R, y1);
    shape.quadraticCurveTo(x0, y1, x0, y1 - R);
    shape.lineTo(x0, y0 + R);
    shape.quadraticCurveTo(x0, y0, x0 + R, y0);

    // Extruded body with soft rounded bevel
    const stickerGeo = new THREE.ExtrudeGeometry(shape, {
      depth: D,
      bevelEnabled: true,
      bevelThickness: 0.003,
      bevelSize: 0.003,
      bevelSegments: 3,
      curveSegments: 32
    });
    stickerGeo.center();

    const initVar = VARIANTS[variant] || VARIANTS.amber;

    // Body material (golden amber sticker rim)
    const plateMat = new THREE.MeshStandardMaterial({
      color: initVar.plate,
      roughness: initVar.roughness,
      metalness: initVar.metalness
    });
    const stickerMesh = new THREE.Mesh(stickerGeo, plateMat);

    const group = new THREE.Group();
    group.add(stickerMesh);

    // Initial procedural texture
    const initTex = new THREE.CanvasTexture(createStickerCanvas(variant));
    initTex.colorSpace = THREE.SRGBColorSpace;
    initTex.anisotropy = 4;

    // Front Material & Mesh using ShapeGeometry with EXACT same rounded corners
    // Total half-thickness of stickerGeo with bevel is D/2 + 0.003 = 0.011.
    // faceZ sits at 0.013 so it rests cleanly on the surface without being occluded by the body.
    const faceZ = D / 2 + 0.003 + 0.002;

    const frontMat = new THREE.MeshStandardMaterial({
      map: initTex,
      roughness: 0.22,
      metalness: 0.03,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2
    });
    const frontGeo = new THREE.ShapeGeometry(shape, 32);
    // Normalize UVs to [0, 1] so texture maps edge-to-edge cleanly on the rounded shape
    const frontPos = frontGeo.attributes.position;
    const frontUv = frontGeo.attributes.uv;
    for (let i = 0; i < frontPos.count; i++) {
      frontUv.setXY(i, (frontPos.getX(i) - x0) / W, (frontPos.getY(i) - y0) / H);
    }
    frontUv.needsUpdate = true;

    const frontMesh = new THREE.Mesh(frontGeo, frontMat);
    frontMesh.position.set(0, 0, faceZ);
    frontMesh.renderOrder = 2;
    group.add(frontMesh);

    // Back Material & Mesh using ShapeGeometry with EXACT same rounded corners
    const backMat = new THREE.MeshStandardMaterial({
      map: initTex,
      roughness: 0.22,
      metalness: 0.03,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2
    });
    const backGeo = new THREE.ShapeGeometry(shape, 32);
    // Standard normalized UVs so text is right-reading (NOT mirrored) from both front and rear
    const backPos = backGeo.attributes.position;
    const backUv = backGeo.attributes.uv;
    for (let i = 0; i < backPos.count; i++) {
      backUv.setXY(i, (backPos.getX(i) - x0) / W, (backPos.getY(i) - y0) / H);
    }
    backUv.needsUpdate = true;

    const backMesh = new THREE.Mesh(backGeo, backMat);
    backMesh.position.set(0, 0, -faceZ);
    backMesh.rotation.y = Math.PI;
    backMesh.renderOrder = 2;
    group.add(backMesh);

    // Load the user's high-res photo texture directly onto the sticker
    const texLoader = new THREE.TextureLoader();
    texLoader.load(
      '/assets/sticker-clean-transparent.png?v=clean3',
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 8;
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        stateRef.current.stickerTexture = texture;
        if (variant === 'amber') {
          frontMat.map = texture;
          backMat.map = texture;
          frontMat.needsUpdate = true;
          backMat.needsUpdate = true;
        }
      },
      undefined,
      (err) => console.log('Sticker photo load fallback:', err)
    );

    scene.add(group);

    // Save refs
    const s = stateRef.current;
    s.plateMat = plateMat;
    s.frontMat = frontMat;
    s.backMat = backMat;
    s.group = group;
    s.hoverTiltX = 0;
    s.hoverTiltY = 0;

    // Smooth & Calm Pointer Drag Handlers
    const onDown = (e) => {
      if (!interactive) return;
      s.dragging = true;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      container.style.cursor = 'grabbing';
      if (container.setPointerCapture) container.setPointerCapture(e.pointerId);
    };

    const onMove = (e) => {
      if (!interactive) return;
      if (s.dragging) {
        const dx = e.clientX - s.lastX;
        const dy = e.clientY - s.lastY;
        s.lastX = e.clientX;
        s.lastY = e.clientY;
        s.targetY += dx * 0.004; // Gentle, steady manual rotation
        s.targetX = Math.max(-0.40, Math.min(0.40, s.targetX - dy * 0.003));
      } else {
        const b = container.getBoundingClientRect();
        s.hoverTiltY = (((e.clientX - b.left) / b.width - 0.5) * 0.22);
        s.hoverTiltX = ((0.5 - (e.clientY - b.top) / b.height) * 0.16);
      }
    };

    const onLeave = () => {
      s.hoverTiltX = 0;
      s.hoverTiltY = 0;
    };

    const onUp = (e) => {
      if (!interactive) return;
      s.dragging = false;
      container.style.cursor = 'grab';
      if (container.releasePointerCapture) {
        try {
          container.releasePointerCapture(e.pointerId);
        } catch (_) {}
      }
    };

    container.style.cursor = interactive ? 'grab' : 'default';
    container.addEventListener('pointerdown', onDown);
    container.addEventListener('pointerleave', onLeave);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    // Animation Loop: Very slow, calm, gentle rotation
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Slow, steady rotation (calm luxury showcase speed)
      if (autoSpin && !s.dragging) {
        s.targetY += 0.08 * delta;
      }

      // Smooth spring damping
      s.curY += (s.targetY - s.curY) * 0.04;
      s.curX += (s.targetX - s.curX) * 0.04;

      if (s.group) {
        s.group.rotation.y = s.curY + s.hoverTiltY;
        s.group.rotation.x = s.curX + s.hoverTiltX;
        // Subtle floating hover
        s.group.position.y = Math.sin(clock.getElapsedTime() * 0.9) * 0.01;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth || 300;
      const nh = container.clientHeight || 300;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      container.removeEventListener('pointerdown', onDown);
      container.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      stickerGeo.dispose();
      frontGeo.dispose();
      backGeo.dispose();
      plateMat.dispose();
      frontMat.dispose();
      backMat.dispose();
      initTex.dispose();
    };
  }, [cameraDistance, interactive, autoSpin]);

  return <div ref={containerRef} className={`w-full h-full relative ${className}`} />;
}
