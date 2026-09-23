import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const VARIANTS = {
  cream: {
    plate: 0xfff0d6,
    roughness: 0.42,
    metalness: 0.02,
    accent: 0xf5b21f,
    rim: 0x2a1a0e,
    name: 'Cream acrylic'
  },
  espresso: {
    plate: 0x3a2318,
    roughness: 0.38,
    metalness: 0.05,
    accent: 0xf5b21f,
    rim: 0x14090a,
    name: 'Espresso'
  },
  amber: {
    plate: 0xf5b21f,
    roughness: 0.26,
    metalness: 0.32,
    accent: 0x3a2318,
    rim: 0x2a1a0e,
    name: 'Amber'
  },
  glow: {
    plate: 0xffffff,
    roughness: 0.34,
    metalness: 0.06,
    accent: 0x9ff3d0,
    rim: 0x2a1a0e,
    gradient: true,
    name: 'Nightlight'
  }
};

function createGlowCanvas() {
  const cv = document.createElement('canvas');
  cv.width = 256;
  cv.height = 512;
  const ctx = cv.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 40, cv.height);
  g.addColorStop(0, '#8BF7C8');
  g.addColorStop(0.34, '#49E2D2');
  g.addColorStop(0.66, '#6FC8F5');
  g.addColorStop(1, '#B394F2');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, cv.width, cv.height);
  return cv;
}

function createQrCanvas(seed = 20260920) {
  const n = 21;
  const cv = document.createElement('canvas');
  const q = 2;
  const total = n + q * 2;
  const px = 24;
  cv.width = cv.height = total * px;
  const ctx = cv.getContext('2d');

  ctx.fillStyle = '#fffdf8';
  ctx.fillRect(0, 0, cv.width, cv.height);

  let currentSeed = seed;
  const rnd = () => {
    currentSeed = (currentSeed * 1103515245 + 12345) % 2147483648;
    return currentSeed / 2147483648;
  };

  ctx.fillStyle = '#231409';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const finder =
        (r < 7 && c < 7) || (r < 7 && c > n - 8) || (r > n - 8 && c < 7);
      let on;
      if (finder) {
        const rr = r < 7 ? r : n - 1 - r;
        const cc = c < 7 ? c : n - 1 - c;
        on = Math.max(Math.abs(rr - 3), Math.abs(cc - 3)) !== 2;
      } else if (r === 6 || c === 6) {
        on = (r + c) % 2 === 0;
      } else {
        on = rnd() > 0.48;
      }
      if (on) {
        ctx.fillRect((c + q) * px, (r + q) * px, px, px);
      }
    }
  }
  return cv;
}

function createBackCanvas(engravedText = '') {
  const cv = document.createElement('canvas');
  cv.width = 512;
  cv.height = 728;
  const ctx = cv.getContext('2d');

  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.translate(cv.width / 2, cv.height / 2);

  // Logo wordmark
  ctx.fillStyle = 'rgba(46, 27, 16, 0.42)';
  ctx.textAlign = 'center';
  ctx.font = '800 58px "Baloo 2", sans-serif';
  ctx.fillText('tagtique', 0, -30);

  ctx.font = '600 22px "Space Mono", monospace';
  ctx.letterSpacing = '5px';
  ctx.fillText('SCAN TO CONNECT', 0, 16);

  if (engravedText && engravedText.trim().length > 0) {
    ctx.font = '700 28px "Baloo 2", sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillStyle = '#8A5A2B';
    ctx.fillText(`“${engravedText.trim()}”`, 0, 90);
    ctx.font = '500 16px "Space Mono", monospace';
    ctx.fillStyle = 'rgba(46, 27, 16, 0.35)';
    ctx.fillText('CUSTOM LASER ETCHED', 0, 126);
  }

  return cv;
}

export default function Tag3D({
  variant = 'cream',
  engravedText = '',
  className = '',
  autoSpin = true,
  interactive = true,
  cameraDistance = 3.65
}) {
  const containerRef = useRef(null);
  const stateRef = useRef({
    plateMat: null,
    accentMat: null,
    backMat: null,
    glowTex: null,
    group: null,
    targetY: 0,
    targetX: 0.06,
    curY: -1.15,
    curX: 0.34,
    vel: 0,
    dragging: false,
    lastX: 0,
    lastY: 0
  });

  // Material and text updates
  useEffect(() => {
    const s = stateRef.current;
    if (!s.plateMat || !s.accentMat) return;

    const v = VARIANTS[variant] || VARIANTS.cream;
    s.plateMat.roughness = v.roughness;
    s.plateMat.metalness = v.metalness;
    s.accentMat.color.setHex(v.accent);

    if (v.gradient) {
      if (!s.glowTex) {
        s.glowTex = new THREE.CanvasTexture(createGlowCanvas());
        s.glowTex.colorSpace = THREE.SRGBColorSpace;
      }
      s.plateMat.color.setHex(0xffffff);
      s.plateMat.map = s.glowTex;
      s.plateMat.emissiveMap = s.glowTex;
      s.plateMat.emissive.setHex(0xffffff);
      s.plateMat.emissiveIntensity = 0.42;
    } else {
      s.plateMat.color.setHex(v.plate);
      s.plateMat.map = null;
      s.plateMat.emissiveMap = null;
      s.plateMat.emissive.setHex(0x000000);
      s.plateMat.emissiveIntensity = 0;
    }
    s.plateMat.needsUpdate = true;
  }, [variant]);

  // Engraved text update
  useEffect(() => {
    const s = stateRef.current;
    if (!s.backMat) return;
    const newTex = new THREE.CanvasTexture(createBackCanvas(engravedText));
    newTex.colorSpace = THREE.SRGBColorSpace;
    s.backMat.map = newTex;
    s.backMat.needsUpdate = true;
  }, [engravedText]);

  // Main Three.js setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth || 500;
    const h = container.clientHeight || 500;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
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
    camera.position.set(0, 0.04, cameraDistance);

    // Lighting
    scene.add(new THREE.HemisphereLight(0xfff6e8, 0x3a2318, 0.75));
    const key = new THREE.DirectionalLight(0xffffff, 2.5);
    key.position.set(2.4, 3.2, 3.6);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xffe9c2, 0.9);
    fill.position.set(-3, 0.6, 1.4);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xfff7e8, 1.15);
    rim.position.set(-1.2, -1.4, -3);
    scene.add(rim);

    // Geometry: Rounded rectangle acrylic plate with punched hole
    const W = 0.94;
    const H = 1.32;
    const R = 0.2;
    const D = 0.075;
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

    const holeY = y1 - 0.17;
    const hole = new THREE.Path();
    hole.absarc(0, holeY, 0.075, 0, Math.PI * 2, true);
    shape.holes.push(hole);

    const plateGeo = new THREE.ExtrudeGeometry(shape, {
      depth: D,
      bevelEnabled: true,
      bevelThickness: 0.014,
      bevelSize: 0.014,
      bevelSegments: 4,
      curveSegments: 24
    });
    plateGeo.center();

    const plateMat = new THREE.MeshStandardMaterial({
      color: 0xfff0d6,
      roughness: 0.42,
      metalness: 0.02
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);

    const group = new THREE.Group();
    group.add(plate);

    const front = D / 2 + 0.014 + 0.005;

    // QR panel recessed background
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0xfffdf8,
      roughness: 0.55,
      metalness: 0
    });
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.66, 0.012), panelMat);
    panel.position.set(0, -0.09, front - 0.009);
    group.add(panel);

    // QR code canvas plane
    const qrTex = new THREE.CanvasTexture(createQrCanvas());
    qrTex.colorSpace = THREE.SRGBColorSpace;
    qrTex.anisotropy = 4;
    const qrMat = new THREE.MeshStandardMaterial({ map: qrTex, roughness: 0.6, metalness: 0 });
    const qr = new THREE.Mesh(new THREE.PlaneGeometry(0.615, 0.615), qrMat);
    qr.position.set(0, -0.09, front + 0.001);
    group.add(qr);

    // Amber accent bar below QR
    const accentMat = new THREE.MeshStandardMaterial({
      color: 0xf5b21f,
      roughness: 0.28,
      metalness: 0.5
    });
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.035, 0.014), accentMat);
    bar.position.set(0, -0.53, front - 0.007);
    group.add(bar);

    // Eyelet ring & inner sleeve
    const sleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.076, 0.076, D + 0.036, 40, 1, true),
      accentMat
    );
    sleeve.rotation.x = Math.PI / 2;
    sleeve.position.set(0, holeY, 0);
    group.add(sleeve);

    [front - 0.008, -front + 0.008].forEach((z) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.088, 0.015, 18, 44), accentMat);
      ring.position.set(0, holeY, z);
      group.add(ring);
    });

    // Steel key loop
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0xd9d4cc,
      roughness: 0.2,
      metalness: 0.95
    });
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.022, 18, 56), steelMat);
    loop.position.set(0, holeY + 0.14, 0);
    loop.rotation.y = Math.PI / 2.2;
    group.add(loop);

    // Back face wordmark & custom engraving
    const backTex = new THREE.CanvasTexture(createBackCanvas(engravedText));
    backTex.colorSpace = THREE.SRGBColorSpace;
    const backMat = new THREE.MeshStandardMaterial({
      map: backTex,
      transparent: true,
      roughness: 0.6
    });
    const back = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 1.02), backMat);
    back.position.set(0, -0.02, -front - 0.001);
    back.rotation.y = Math.PI;
    group.add(back);

    scene.add(group);

    // Save refs for reactive updates
    const s = stateRef.current;
    s.plateMat = plateMat;
    s.accentMat = accentMat;
    s.backMat = backMat;
    s.group = group;

    // Apply initial variant
    const initVar = VARIANTS[variant] || VARIANTS.cream;
    plateMat.roughness = initVar.roughness;
    plateMat.metalness = initVar.metalness;
    accentMat.color.setHex(initVar.accent);
    if (initVar.gradient) {
      s.glowTex = new THREE.CanvasTexture(createGlowCanvas());
      s.glowTex.colorSpace = THREE.SRGBColorSpace;
      plateMat.color.setHex(0xffffff);
      plateMat.map = s.glowTex;
      plateMat.emissiveMap = s.glowTex;
      plateMat.emissive.setHex(0xffffff);
      plateMat.emissiveIntensity = 0.42;
    } else {
      plateMat.color.setHex(initVar.plate);
    }
    plateMat.needsUpdate = true;

    // Interaction handlers
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
        s.targetY += dx * 0.009;
        s.targetX = Math.max(-0.7, Math.min(0.7, s.targetX - dy * 0.006));
        s.vel = dx * 0.0012;
      } else {
        const b = container.getBoundingClientRect();
        s.targetY += (((e.clientX - b.left) / b.width - 0.5) * 0.45 - s.targetY) * 0.04;
        s.targetX += ((0.5 - (e.clientY - b.top) / b.height) * 0.28 - s.targetX) * 0.04;
      }
    };

    const onUp = (e) => {
      s.dragging = false;
      container.style.cursor = interactive ? 'grab' : 'default';
      if (container.releasePointerCapture && e.pointerId) {
        try {
          container.releasePointerCapture(e.pointerId);
        } catch (_) {}
      }
    };

    container.addEventListener('pointerdown', onDown);
    container.addEventListener('pointermove', onMove);
    container.addEventListener('pointerup', onUp);
    container.addEventListener('pointercancel', onUp);

    // ResizeObserver
    const ro = new ResizeObserver(() => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      if (!nw || !nh) return;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    });
    ro.observe(container);

    // Render loop
    let animId;
    const t0 = performance.now();
    const animate = () => {
      const t = (performance.now() - t0) / 1000;
      if (!s.dragging) {
        s.vel *= 0.94;
        s.targetY += s.vel;
      }
      s.curY += (s.targetY - s.curY) * 0.09;
      s.curX += (s.targetX - s.curX) * 0.09;

      const idleY = autoSpin ? Math.sin(t * 0.45) * 0.15 : 0;
      group.rotation.y = s.curY + idleY;
      group.rotation.x = s.curX;
      group.rotation.z = Math.sin(t * 0.6) * 0.022;
      group.position.y = Math.sin(t * 0.8) * 0.018;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      container.removeEventListener('pointerdown', onDown);
      container.removeEventListener('pointermove', onMove);
      container.removeEventListener('pointerup', onUp);
      container.removeEventListener('pointercancel', onUp);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      plateGeo.dispose();
      plateMat.dispose();
      panelMat.dispose();
      qrMat.dispose();
      accentMat.dispose();
      steelMat.dispose();
      backMat.dispose();
    };
  }, [cameraDistance, autoSpin, interactive]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative select-none touch-none ${interactive ? 'cursor-grab' : ''} ${className}`}
    />
  );
}
