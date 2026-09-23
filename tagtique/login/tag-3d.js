// <tag-3d variant="cream|espresso|amber"> — draggable 3D QR tag for the hero.
const THREE_URL = 'https://unpkg.com/three@0.184.0/build/three.module.js';

const VARIANTS = {
  cream:    { plate: 0xfff0d6, roughness: 0.42, metalness: 0.02, accent: 0xf5b21f, rim: 0x2a1a0e },
  espresso: { plate: 0x3a2318, roughness: 0.38, metalness: 0.05, accent: 0xf5b21f, rim: 0x14090a },
  amber:    { plate: 0xf5b21f, roughness: 0.3,  metalness: 0.35, accent: 0x3a2318, rim: 0x2a1a0e },
  glow:     { plate: 0xffffff, roughness: 0.34, metalness: 0.06, accent: 0x9ff3d0, rim: 0x2a1a0e, gradient: true }
};

function glowCanvas() {
  const cv = document.createElement('canvas');
  cv.width = 256; cv.height = 512;
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

function qrCanvas() {
  const n = 21, cv = document.createElement('canvas'), q = 2, total = n + q * 2, px = 24;
  cv.width = cv.height = total * px;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#fffdf8';
  ctx.fillRect(0, 0, cv.width, cv.height);
  let seed = 20260920;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  ctx.fillStyle = '#231409';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const finder = (r < 7 && c < 7) || (r < 7 && c > n - 8) || (r > n - 8 && c < 7);
      let on;
      if (finder) {
        const rr = r < 7 ? r : n - 1 - r, cc = c < 7 ? c : n - 1 - c;
        on = Math.max(Math.abs(rr - 3), Math.abs(cc - 3)) !== 2;
      } else if (r === 6 || c === 6) {
        on = (r + c) % 2 === 0;
      } else {
        on = rnd() > 0.48;
      }
      if (on) ctx.fillRect((c + q) * px, (r + q) * px, px, px);
    }
  }
  return cv;
}

function backCanvas() {
  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = 728;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.translate(cv.width / 2, cv.height / 2);
  ctx.fillStyle = 'rgba(46,27,16,0.34)';
  ctx.textAlign = 'center';
  ctx.font = '700 62px Verdana, sans-serif';
  ctx.fillText('tagtique', 0, 0);
  ctx.font = '400 26px monospace';
  ctx.letterSpacing = '6px';
  ctx.fillText('SCAN  TO  CONNECT', 0, 52);
  return cv;
}

class Tag3D extends HTMLElement {
  static get observedAttributes() { return ['variant']; }

  connectedCallback() {
    if (this._booted) return;
    this._booted = true;
    this.style.display = 'block';
    this.style.width = '100%';
    this.style.height = '100%';
    this.style.cursor = 'grab';
    this.style.touchAction = 'none';
    this._boot();
  }

  attributeChangedCallback(name, _old, val) {
    if (name === 'variant' && this._applyVariant) this._applyVariant(val);
  }

  async _boot() {
    const THREE = await import(THREE_URL);
    if (!this.isConnected) return;

    const w = this.clientWidth || 600, h = this.clientHeight || 560;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.domElement.style.display = 'block';
    this.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, w / h, 0.1, 50);
    camera.position.set(0, 0.04, 3.7);

    scene.add(new THREE.HemisphereLight(0xfff4e2, 0x3a2318, 0.7));
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(2.4, 3.2, 3.6);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffe6bd, 0.85);
    fill.position.set(-3, 0.6, 1.4);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xfff7e8, 1.1);
    rim.position.set(-1.2, -1.4, -3);
    scene.add(rim);

    // --- tag plate: rounded rectangle with a punched hanging hole ---
    const W = 0.94, H = 1.32, R = 0.2, D = 0.075;
    const shape = new THREE.Shape();
    const x0 = -W / 2, y0 = -H / 2, x1 = W / 2, y1 = H / 2;
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
      depth: D, bevelEnabled: true, bevelThickness: 0.014, bevelSize: 0.014,
      bevelSegments: 4, curveSegments: 24
    });
    plateGeo.center();

    const plateMat = new THREE.MeshStandardMaterial({ name: 'shell', color: 0xfff0d6, roughness: 0.42, metalness: 0.02 });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.name = 'plate';

    const group = new THREE.Group();
    group.name = 'tag';
    group.add(plate);

    const front = D / 2 + 0.014 + 0.005;

    // engraved-looking recessed panel behind the QR
    const panelMat = new THREE.MeshStandardMaterial({ name: 'panel', color: 0xfffdf8, roughness: 0.55, metalness: 0 });
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.66, 0.012), panelMat);
    panel.position.set(0, -0.09, front - 0.009);
    panel.name = 'qrPanel';

    const qrTex = new THREE.CanvasTexture(qrCanvas());
    qrTex.colorSpace = THREE.SRGBColorSpace;
    qrTex.anisotropy = 4;
    const qr = new THREE.Mesh(
      new THREE.PlaneGeometry(0.615, 0.615),
      new THREE.MeshStandardMaterial({ name: 'qrInk', map: qrTex, roughness: 0.6, metalness: 0 })
    );
    qr.position.set(0, -0.09, front + 0.001);
    qr.name = 'qrCode';
    group.add(panel, qr);

    // amber accent bar under the QR panel
    const accentMat = new THREE.MeshStandardMaterial({ name: 'accent', color: 0xf5b21f, roughness: 0.28, metalness: 0.5 });
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.035, 0.014), accentMat);
    bar.position.set(0, -0.53, front - 0.007);
    bar.name = 'accentBar';
    group.add(bar);

    // eyelet ring + key loop
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.076, 0.076, D + 0.036, 40, 1, true), accentMat);
    sleeve.rotation.x = Math.PI / 2;
    sleeve.position.set(0, holeY, 0);
    sleeve.name = 'eyeletSleeve';
    group.add(sleeve);
    [front - 0.008, -front + 0.008].forEach((z, i) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.088, 0.015, 18, 44), accentMat);
      ring.position.set(0, holeY, z);
      ring.name = 'eyeletRing' + i;
      group.add(ring);
    });

    const steel = new THREE.MeshStandardMaterial({ name: 'steel', color: 0xd9d4cc, roughness: 0.22, metalness: 0.95 });
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.022, 18, 56), steel);
    loop.position.set(0, holeY + 0.14, 0);
    loop.rotation.y = Math.PI / 2.2;
    loop.name = 'keyLoop';
    group.add(loop);

    // back face wordmark
    const backTex = new THREE.CanvasTexture(backCanvas());
    backTex.colorSpace = THREE.SRGBColorSpace;
    const back = new THREE.Mesh(
      new THREE.PlaneGeometry(0.72, 1.02),
      new THREE.MeshStandardMaterial({ name: 'backMark', map: backTex, transparent: true, roughness: 0.6 })
    );
    back.position.set(0, -0.02, -front - 0.001);
    back.rotation.y = Math.PI;
    back.name = 'backMark';
    group.add(back);

    scene.add(group);

    let glowTex = null;
    this._applyVariant = (which) => {
      const v = VARIANTS[which] || VARIANTS.cream;
      plateMat.roughness = v.roughness;
      plateMat.metalness = v.metalness;
      accentMat.color.setHex(v.accent);
      if (v.gradient) {
        if (!glowTex) {
          glowTex = new THREE.CanvasTexture(glowCanvas());
          glowTex.colorSpace = THREE.SRGBColorSpace;
        }
        plateMat.color.setHex(0xffffff);
        plateMat.map = glowTex;
        plateMat.emissiveMap = glowTex;
        plateMat.emissive.setHex(0xffffff);
        plateMat.emissiveIntensity = 0.5;
      } else {
        plateMat.color.setHex(v.plate);
        plateMat.map = null;
        plateMat.emissiveMap = null;
        plateMat.emissive.setHex(0x000000);
        plateMat.emissiveIntensity = 0;
      }
      plateMat.needsUpdate = true;
    };
    this._applyVariant(this.getAttribute('variant'));

    // --- interaction ---
    let targetY = 0, targetX = 0.06, curY = -1.15, curX = 0.34;
    let dragging = false, lastX = 0, lastY = 0, vel = 0, since = 0;

    const down = (e) => {
      dragging = true; since = 0;
      lastX = e.clientX; lastY = e.clientY;
      this.style.cursor = 'grabbing';
      this.setPointerCapture && this.setPointerCapture(e.pointerId);
    };
    const move = (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      targetY += dx * 0.009;
      targetX = Math.max(-0.7, Math.min(0.7, targetX - dy * 0.006));
      vel = dx * 0.0012;
      this.dispatchEvent(new CustomEvent('tagdrag', { bubbles: true }));
    };
    const up = () => { dragging = false; this.style.cursor = 'grab'; };
    this.addEventListener('pointerdown', down);
    this.addEventListener('pointermove', move);
    this.addEventListener('pointerup', up);
    this.addEventListener('pointercancel', up);

    const hover = (e) => {
      if (dragging) return;
      const b = this.getBoundingClientRect();
      targetY += (((e.clientX - b.left) / b.width - 0.5) * 0.5 - targetY) * 0.04;
      targetX += ((0.5 - (e.clientY - b.top) / b.height) * 0.32 - targetX) * 0.04;
    };
    this.addEventListener('pointermove', hover);

    const ro = new ResizeObserver(() => {
      const nw = this.clientWidth, nh = this.clientHeight;
      if (!nw || !nh) return;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    });
    ro.observe(this);
    this._cleanup = () => { ro.disconnect(); renderer.dispose(); };

    const t0 = performance.now();
    renderer.setAnimationLoop(() => {
      const t = (performance.now() - t0) / 1000;
      since += 1;
      if (!dragging) {
        vel *= 0.94;
        targetY += vel;
      }
      curY += (targetY - curY) * 0.09;
      curX += (targetX - curX) * 0.09;
      group.rotation.y = curY + Math.sin(t * 0.45) * 0.17;
      group.rotation.x = curX;
      group.rotation.z = Math.sin(t * 0.6) * 0.025;
      group.position.y = Math.sin(t * 0.8) * 0.02;
      renderer.render(scene, camera);
    });
  }

  disconnectedCallback() { this._cleanup && this._cleanup(); }
}

customElements.define('tag-3d', Tag3D);
