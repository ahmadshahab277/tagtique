import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RotateCw, Sparkles, Smartphone, Laptop, Car, Tag } from 'lucide-react';

/**
 * Creates a rounded rectangular 2D shape for extrusion.
 */
function createRoundedRectShape(width, height, radius) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);
  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
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
  ctx.lineWidth = 12;
  ctx.strokeRect(16, 16, 480, 480);

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
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(name || 'TAGTIQUE', 256, 460);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates soft studio radial shadow under the 3D model
 */
function createShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.35)');
  gradient.addColorStop(0.4, 'rgba(0, 0, 0, 0.18)');
  gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.05)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * REFINED IPHONE 16 PRO MODEL
 * Natural Titanium Frame, Frosted Glass Back, Triple Triangle Camera System, Dynamic Island
 */
function buildIPhoneModel(stickerTexture, aspect = 1) {
  const group = new THREE.Group();
  group.name = 'iphone-pro';

  const w = 2.85;
  const h = 5.9;
  const d = 0.26;
  const cornerR = 0.44;

  // 1. Titanium Frame & Chassis
  const titaniumMat = new THREE.MeshStandardMaterial({
    color: 0xD8D9DE,
    metalness: 0.88,
    roughness: 0.22
  });

  const bodyShape = createRoundedRectShape(w, h, cornerR);
  const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
    depth: d,
    bevelEnabled: true,
    bevelSegments: 5,
    steps: 1,
    bevelSize: 0.05,
    bevelThickness: 0.05
  });
  bodyGeo.center();
  const bodyMesh = new THREE.Mesh(bodyGeo, titaniumMat);
  group.add(bodyMesh);

  // 2. Frosted Glass Back (Face at -Z)
  const backShape = createRoundedRectShape(w - 0.06, h - 0.06, cornerR - 0.03);
  const backGeo = new THREE.ShapeGeometry(backShape);
  const backMat = new THREE.MeshPhysicalMaterial({
    color: 0xF2F3F7,
    roughness: 0.28,
    metalness: 0.08,
    clearcoat: 0.8,
    clearcoatRoughness: 0.15
  });
  const backMesh = new THREE.Mesh(backGeo, backMat);
  backMesh.rotation.y = Math.PI;
  backMesh.position.z = -(d / 2 + 0.055);
  group.add(backMesh);

  // Subtle Apple logo in center
  const logoMat = new THREE.MeshStandardMaterial({
    color: 0xC4C6CC,
    metalness: 0.9,
    roughness: 0.1
  });
  const logoGeo = new THREE.CircleGeometry(0.18, 24);
  const logoMesh = new THREE.Mesh(logoGeo, logoMat);
  logoMesh.rotation.y = Math.PI;
  logoMesh.position.set(0, 0.45, -(d / 2 + 0.056));
  group.add(logoMesh);

  // 3. Iconic Pro Triple Camera Island (Top-Left of back)
  const camBaseShape = createRoundedRectShape(1.35, 1.35, 0.32);
  const camBaseGeo = new THREE.ExtrudeGeometry(camBaseShape, {
    depth: 0.08,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.03,
    bevelThickness: 0.03
  });
  camBaseGeo.center();
  const camBaseMat = new THREE.MeshPhysicalMaterial({
    color: 0xE8E9EF,
    roughness: 0.2,
    metalness: 0.15,
    clearcoat: 1.0
  });
  const camBaseMesh = new THREE.Mesh(camBaseGeo, camBaseMat);
  camBaseMesh.position.set(0.6, h / 2 - 0.95, -(d / 2 + 0.09));
  group.add(camBaseMesh);

  // Three Sapphire Lenses in Triangle Layout
  const lensRimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.09, 32);
  const lensRimMat = new THREE.MeshStandardMaterial({ color: 0xB8BAC2, metalness: 0.92, roughness: 0.15 });
  const lensGlassMat = new THREE.MeshPhysicalMaterial({ color: 0x11131A, roughness: 0.05, metalness: 0.9, clearcoat: 1.0 });

  const addCameraLens = (lx, ly) => {
    const rim = new THREE.Mesh(lensRimGeo, lensRimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(lx, ly, -(d / 2 + 0.17));
    group.add(rim);

    const glass = new THREE.Mesh(new THREE.CircleGeometry(0.17, 24), lensGlassMat);
    glass.rotation.y = Math.PI;
    glass.position.set(lx, ly, -(d / 2 + 0.216));
    group.add(glass);
  };
  addCameraLens(0.4, h / 2 - 0.72);  // Top
  addCameraLens(0.4, h / 2 - 1.20);  // Bottom
  addCameraLens(0.85, h / 2 - 0.96); // Right-middle

  // LiDAR & Flash
  const flashGeo = new THREE.CircleGeometry(0.08, 16);
  const flashMat = new THREE.MeshStandardMaterial({ color: 0xFEF08A, roughness: 0.3 });
  const flash = new THREE.Mesh(flashGeo, flashMat);
  flash.rotation.y = Math.PI;
  flash.position.set(0.85, h / 2 - 0.68, -(d / 2 + 0.135));
  group.add(flash);

  const lidarGeo = new THREE.CircleGeometry(0.06, 16);
  const lidarMat = new THREE.MeshBasicMaterial({ color: 0x1E2028 });
  const lidar = new THREE.Mesh(lidarGeo, lidarMat);
  lidar.rotation.y = Math.PI;
  lidar.position.set(0.85, h / 2 - 1.24, -(d / 2 + 0.135));
  group.add(lidar);

  // 4. Front Screen & Dynamic Island (Face at +Z)
  const screenShape = createRoundedRectShape(w - 0.14, h - 0.14, cornerR - 0.06);
  const screenGeo = new THREE.ShapeGeometry(screenShape);
  const screenMat = new THREE.MeshBasicMaterial({ color: 0x08090C });
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.z = d / 2 + 0.055;
  group.add(screenMesh);

  // Dynamic Island
  const pillShape = createRoundedRectShape(0.48, 0.14, 0.07);
  const pillGeo = new THREE.ShapeGeometry(pillShape);
  const pillMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const pillMesh = new THREE.Mesh(pillGeo, pillMat);
  pillMesh.position.set(0, h / 2 - 0.34, d / 2 + 0.057);
  group.add(pillMesh);

  // 5. STICKER ON IPHONE: Authentic die-cut aspect ratio, NO grey box
  // Scale sticker to fit naturally on the lower 2/3 of phone back
  let stickerH = 2.1;
  let stickerW = stickerH * aspect;
  if (stickerW > w * 0.8) {
    stickerW = w * 0.8;
    stickerH = stickerW / aspect;
  }

  const stickerGeo = new THREE.PlaneGeometry(stickerW, stickerH);
  const stickerMat = new THREE.MeshStandardMaterial({
    map: stickerTexture,
    transparent: true,
    alphaTest: 0.01,
    roughness: 0.12,
    metalness: 0.02,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2
  });
  const stickerMesh = new THREE.Mesh(stickerGeo, stickerMat);
  stickerMesh.rotation.y = Math.PI; // Face outwards on back
  stickerMesh.position.set(0, -0.65, -(d / 2 + 0.06));
  group.add(stickerMesh);

  // Initial presentation angle: shows the sticker on the back and titanium edge
  group.rotation.set(0.08, Math.PI - 0.22, 0);

  return group;
}

/**
 * REFINED APPLE MACBOOK PRO MODEL
 * Silver/Space Grey Aluminum Unibody, Open Display Lid, Liquid Retina Screen, Magic Keyboard, Force Touch Trackpad
 */
function buildMacBookModel(stickerTexture, aspect = 1) {
  const group = new THREE.Group();
  group.name = 'macbook-pro';

  const lapW = 6.2;
  const lapD = 4.2;
  const lapH = 0.18;

  const aluMat = new THREE.MeshStandardMaterial({
    color: 0xDCDDE2,
    metalness: 0.82,
    roughness: 0.25
  });

  const darkKeyMat = new THREE.MeshStandardMaterial({
    color: 0x181920,
    metalness: 0.3,
    roughness: 0.6
  });

  // 1. Base Unibody Chassis
  const baseShape = createRoundedRectShape(lapW, lapD, 0.22);
  const baseGeo = new THREE.ExtrudeGeometry(baseShape, {
    depth: lapH,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.03,
    bevelThickness: 0.03
  });
  baseGeo.center();
  const baseMesh = new THREE.Mesh(baseGeo, aluMat);
  baseMesh.rotation.x = Math.PI / 2;
  baseMesh.position.set(0, -1.1, 0);
  group.add(baseMesh);

  // Keyboard Well Recess
  const kbWellGeo = new THREE.PlaneGeometry(5.0, 1.95);
  const kbWellMat = new THREE.MeshStandardMaterial({ color: 0x22232B, roughness: 0.5 });
  const kbWell = new THREE.Mesh(kbWellGeo, kbWellMat);
  kbWell.rotation.x = -Math.PI / 2;
  kbWell.position.set(0, -1.1 + lapH / 2 + 0.035, -0.55);
  group.add(kbWell);

  // Keyboard Key Rows
  for (let r = 0; r < 5; r++) {
    const keyRowGeo = new THREE.PlaneGeometry(4.8, 0.28);
    const keyRow = new THREE.Mesh(keyRowGeo, darkKeyMat);
    keyRow.rotation.x = -Math.PI / 2;
    keyRow.position.set(0, -1.1 + lapH / 2 + 0.04, -1.25 + r * 0.35);
    group.add(keyRow);
  }

  // Force Touch Trackpad
  const tpShape = createRoundedRectShape(2.2, 1.4, 0.08);
  const tpGeo = new THREE.ShapeGeometry(tpShape);
  const tpMat = new THREE.MeshStandardMaterial({ color: 0xD0D2D8, roughness: 0.3, metalness: 0.7 });
  const trackpad = new THREE.Mesh(tpGeo, tpMat);
  trackpad.rotation.x = -Math.PI / 2;
  trackpad.position.set(0, -1.1 + lapH / 2 + 0.035, 1.05);
  group.add(trackpad);

  // Front Thumb Lip Indent
  const lipGeo = new THREE.BoxGeometry(0.9, 0.06, 0.08);
  const lipMat = new THREE.MeshBasicMaterial({ color: 0x8E919A });
  const lip = new THREE.Mesh(lipGeo, lipMat);
  lip.position.set(0, -1.1 + lapH / 2, lapD / 2);
  group.add(lip);

  // 2. Display Lid (Hinged at back)
  const lidGroup = new THREE.Group();
  lidGroup.position.set(0, -1.1 + lapH / 2, -lapD / 2 + 0.1);
  lidGroup.rotation.x = Math.PI * 0.62; // ~112° Open Angle

  const lidThickness = 0.1;
  const lidShape = createRoundedRectShape(lapW, lapD, 0.22);
  const lidGeo = new THREE.ExtrudeGeometry(lidShape, {
    depth: lidThickness,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.02,
    bevelThickness: 0.02
  });
  lidGeo.center();
  const lidMesh = new THREE.Mesh(lidGeo, aluMat);
  lidGroup.add(lidMesh);

  // Inner Screen Face (Facing inside)
  const screenGeo = new THREE.PlaneGeometry(lapW - 0.3, lapD - 0.3);
  const screenMat = new THREE.MeshBasicMaterial({ color: 0x05060A });
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.z = lidThickness / 2 + 0.022;
  lidGroup.add(screenMesh);

  // Camera Notch at top of screen
  const notchGeo = new THREE.BoxGeometry(0.35, 0.1, 0.02);
  const notchMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const notch = new THREE.Mesh(notchGeo, notchMat);
  notch.position.set(0, (lapD - 0.3) / 2 - 0.06, lidThickness / 2 + 0.023);
  lidGroup.add(notch);

  // Apple Logo Outline on Outer Lid
  const lidLogoMat = new THREE.MeshStandardMaterial({ color: 0xB5B7BF, metalness: 0.95, roughness: 0.1 });
  const lidLogo = new THREE.Mesh(new THREE.CircleGeometry(0.3, 24), lidLogoMat);
  lidLogo.rotation.y = Math.PI;
  lidLogo.position.set(0, 0.2, -(lidThickness / 2 + 0.022));
  lidGroup.add(lidLogo);

  // 3. STICKER ON MACBOOK LID: Proportional and authentic aspect ratio
  // Size sticker tastefully on the aluminum lid
  let stickerH = 1.6;
  let stickerW = stickerH * aspect;
  if (stickerW > lapW * 0.35) {
    stickerW = lapW * 0.35;
    stickerH = stickerW / aspect;
  }

  const stickerGeo = new THREE.PlaneGeometry(stickerW, stickerH);
  const stickerMat = new THREE.MeshStandardMaterial({
    map: stickerTexture,
    transparent: true,
    alphaTest: 0.01,
    roughness: 0.12,
    metalness: 0.02,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2
  });
  const stickerMesh = new THREE.Mesh(stickerGeo, stickerMat);
  stickerMesh.rotation.y = Math.PI; // Face the outer back lid
  // Positioned tastefully on the lower-right of the lid
  stickerMesh.position.set(1.4, -0.3, -(lidThickness / 2 + 0.025));
  lidGroup.add(stickerMesh);

  group.add(lidGroup);

  // Default display orientation: viewing the lid from back 3/4 angle
  group.rotation.set(0.14, Math.PI - 0.42, 0);

  return group;
}

/**
 * REFINED MODERN SPORTS CAR / LUXURY VEHICLE MODEL
 * Streamlined aerodynamic silhouette, metallic pearl paint, tinted glass, alloy wheels with brake calipers, LED headlights and taillights
 */
function buildCarModel(stickerTexture, aspect = 1) {
  const group = new THREE.Group();
  group.name = 'luxury-car';

  // High-Gloss Automotive Paint (Platinum White Metallic with Clearcoat)
  const carPaintMat = new THREE.MeshPhysicalMaterial({
    color: 0x22242C, // Deep Metallic Sapphire Graphite
    metalness: 0.9,
    roughness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05
  });

  const carAccentMat = new THREE.MeshStandardMaterial({
    color: 0x111217,
    roughness: 0.4,
    metalness: 0.8
  });

  // Deep Tinted Glass
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x1E2430,
    metalness: 0.3,
    roughness: 0.08,
    transmission: 0.35,
    transparent: true,
    opacity: 0.85
  });

  // Wheels
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x1A1B20, roughness: 0.85 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xE2E4EC, metalness: 0.95, roughness: 0.12 });
  const brakeMat = new THREE.MeshStandardMaterial({ color: 0xDC2626, metalness: 0.8, roughness: 0.3 }); // Red calipers

  // 1. Lower Aerodynamic Body (Chassis)
  const chassisGeo = new THREE.BoxGeometry(3.3, 0.75, 6.8);
  const chassis = new THREE.Mesh(chassisGeo, carPaintMat);
  chassis.position.y = -0.15;
  group.add(chassis);

  // Front Hood Slope
  const hoodGeo = new THREE.BoxGeometry(3.1, 0.35, 2.2);
  const hood = new THREE.Mesh(hoodGeo, carPaintMat);
  hood.rotation.x = -0.1;
  hood.position.set(0, 0.22, 2.0);
  group.add(hood);

  // Rear Trunk / Ducktail Spoiler Lip
  const trunkGeo = new THREE.BoxGeometry(3.1, 0.25, 1.6);
  const trunk = new THREE.Mesh(trunkGeo, carPaintMat);
  trunk.position.set(0, 0.25, -2.5);
  group.add(trunk);

  const spoilerGeo = new THREE.BoxGeometry(3.1, 0.08, 0.25);
  const spoiler = new THREE.Mesh(spoilerGeo, carAccentMat);
  spoiler.position.set(0, 0.42, -3.2);
  group.add(spoiler);

  // 2. Cabin & Roof (Curved Coupe Profile)
  const cabinGeo = new THREE.BoxGeometry(2.7, 0.8, 3.2);
  const cabin = new THREE.Mesh(cabinGeo, carPaintMat);
  cabin.position.set(0, 0.65, -0.4);
  group.add(cabin);

  // Front Windshield (Sleek aerodynamic angle)
  const fWindGeo = new THREE.PlaneGeometry(2.5, 1.25);
  const fWind = new THREE.Mesh(fWindGeo, glassMat);
  fWind.rotation.x = -Math.PI / 3.2;
  fWind.position.set(0, 0.62, 1.45);
  group.add(fWind);

  // Rear Windshield (Where emergency QR sticker is displayed)
  const rWindGeo = new THREE.PlaneGeometry(2.5, 1.35);
  const rWind = new THREE.Mesh(rWindGeo, glassMat);
  rWind.rotation.x = Math.PI / 3.2;
  rWind.position.set(0, 0.62, -2.15);
  group.add(rWind);

  // Side Windows
  const sideWindGeo = new THREE.PlaneGeometry(2.8, 0.65);
  const leftSideWind = new THREE.Mesh(sideWindGeo, glassMat);
  leftSideWind.rotation.y = -Math.PI / 2;
  leftSideWind.position.set(-1.36, 0.65, -0.4);
  group.add(leftSideWind);

  const rightSideWind = new THREE.Mesh(sideWindGeo, glassMat);
  rightSideWind.rotation.y = Math.PI / 2;
  rightSideWind.position.set(1.36, 0.65, -0.4);
  group.add(rightSideWind);

  // 3. Four Alloy Wheels with Red Brake Calipers
  const tireGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.38, 32);
  const rimGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.4, 20);
  const caliperGeo = new THREE.BoxGeometry(0.12, 0.22, 0.18);

  const addCarWheel = (wx, wy, wz) => {
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(wx, wy, wz);

    const tire = new THREE.Mesh(tireGeo, tireMat);
    tire.rotation.z = Math.PI / 2;
    wheelGroup.add(tire);

    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.z = Math.PI / 2;
    wheelGroup.add(rim);

    const caliper = new THREE.Mesh(caliperGeo, brakeMat);
    caliper.position.set(0, 0.18, 0);
    wheelGroup.add(caliper);

    group.add(wheelGroup);
  };
  addCarWheel(-1.68, -0.45, 1.95);
  addCarWheel(1.68, -0.45, 1.95);
  addCarWheel(-1.68, -0.45, -2.05);
  addCarWheel(1.68, -0.45, -2.05);

  // 4. Lights: Front LED Headlights & Full-Width Rear Taillight Strip
  const tailBarGeo = new THREE.BoxGeometry(2.9, 0.12, 0.08);
  const tailBarMat = new THREE.MeshBasicMaterial({ color: 0xEF4444 });
  const tailBar = new THREE.Mesh(tailBarGeo, tailBarMat);
  tailBar.position.set(0, 0.18, -3.41);
  group.add(tailBar);

  const headGeo = new THREE.BoxGeometry(0.7, 0.15, 0.08);
  const headMat = new THREE.MeshBasicMaterial({ color: 0xFAFAFA });
  const leftHead = new THREE.Mesh(headGeo, headMat);
  leftHead.position.set(-1.05, 0.05, 3.41);
  group.add(leftHead);

  const rightHead = new THREE.Mesh(headGeo, headMat);
  rightHead.position.set(1.05, 0.05, 3.41);
  group.add(rightHead);

  // 5. STICKER ON CAR REAR WINDSHIELD: Authentic die-cut aspect ratio, NO grey box
  let stickerH = 1.35;
  let stickerW = stickerH * aspect;
  if (stickerW > 2.0) {
    stickerW = 2.0;
    stickerH = stickerW / aspect;
  }

  const stickerGeo = new THREE.PlaneGeometry(stickerW, stickerH);
  const stickerMat = new THREE.MeshStandardMaterial({
    map: stickerTexture,
    transparent: true,
    alphaTest: 0.01,
    roughness: 0.12,
    metalness: 0.02,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2
  });
  const stickerMesh = new THREE.Mesh(stickerGeo, stickerMat);
  stickerMesh.rotation.y = Math.PI; // Face towards back
  stickerMesh.rotation.x = -Math.PI / 3.2; // Match rear glass slope angle
  stickerMesh.position.set(0, 0.65, -2.18);
  group.add(stickerMesh);

  // Initial presentation angle: 3/4 rear perspective showing the car curves and the sticker
  group.rotation.set(0.12, Math.PI - 0.38, 0);

  return group;
}

/**
 * REFINED STANDALONE DIE-CUT STICKER VIEW
 * High-definition floating die-cut turntable with true transparent contours and vinyl depth
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
    vehicle: { label: 'Vehicle View', surface: 'Rear Windshield Glass' },
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

    // WebGL Renderer with High-Precision Tone Mapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0xFFFFFF, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Studio 3-Point Lighting for Pure White Environment
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
    const shadowGeo = new THREE.PlaneGeometry(7.5, 7.5);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.8;
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

  // 2. Rebuild Model when Target or Texture Changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !loaded) return;

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

    const tex = textureRef.current || createFallbackTexture(product?.name);
    const aspect = aspectRef.current || 1;
    let newModel = null;

    if (selectedTarget === 'laptop') {
      newModel = buildMacBookModel(tex, aspect);
      if (cameraRef.current) cameraRef.current.position.set(0, 0, 8.5);
      if (shadowMeshRef.current) shadowMeshRef.current.position.y = -1.25;
    } else if (selectedTarget === 'vehicle') {
      newModel = buildCarModel(tex, aspect);
      if (cameraRef.current) cameraRef.current.position.set(0, 0, 9.2);
      if (shadowMeshRef.current) shadowMeshRef.current.position.y = -1.0;
    } else if (selectedTarget === 'sticker') {
      newModel = buildStickerOnlyModel(tex, aspect);
      if (cameraRef.current) cameraRef.current.position.set(0, 0, 6.8);
      if (shadowMeshRef.current) shadowMeshRef.current.position.y = -2.1;
    } else {
      // Default: iPhone Pro
      newModel = buildIPhoneModel(tex, aspect);
      if (cameraRef.current) cameraRef.current.position.set(0, 0, 7.8);
      if (shadowMeshRef.current) shadowMeshRef.current.position.y = -2.1;
    }

    scene.add(newModel);
    activeModelRef.current = newModel;

    dragRef.current.rotX = newModel.rotation.x;
    dragRef.current.rotY = newModel.rotation.y;
    dragRef.current.velX = 0;
    dragRef.current.velY = 0;
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

        // Clamp elevation angle so model never flips upside down
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
    let defX = 0.08;
    let defY = Math.PI - 0.22;

    if (selectedTarget === 'laptop') {
      defX = 0.14;
      defY = Math.PI - 0.42;
    } else if (selectedTarget === 'vehicle') {
      defX = 0.12;
      defY = Math.PI - 0.38;
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
