import { useEffect, useRef } from 'react';
import { BufferAttribute, BufferGeometry, CanvasTexture, Color, DoubleSide, DynamicDrawUsage, InstancedMesh, MathUtils, MeshBasicMaterial, Object3D, PerspectiveCamera, PlaneGeometry, Points, PointsMaterial, SRGBColorSpace, Scene, WebGLRenderer } from 'three';

const THREE = { BufferAttribute, BufferGeometry, CanvasTexture, Color, DoubleSide, DynamicDrawUsage, InstancedMesh, MathUtils, MeshBasicMaterial, Object3D, PerspectiveCamera, PlaneGeometry, Points, PointsMaterial, SRGBColorSpace, Scene, WebGLRenderer };

/* Guras petals and pollen drifting through the page in 3D.
   They flutter on their own, lift when you scroll, and lean toward the pointer on desktop. */

function petalTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  // a soft teardrop petal, drawn white so instance colours tint it
  g.translate(64, 64);
  const grad = g.createRadialGradient(-10, -14, 4, 0, 0, 60);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.7, 'rgba(225,225,225,1)');
  grad.addColorStop(1, 'rgba(190,190,190,1)');
  g.fillStyle = grad;
  g.beginPath();
  g.moveTo(0, -58);
  g.bezierCurveTo(46, -40, 44, 30, 0, 58);
  g.bezierCurveTo(-44, 30, -46, -40, 0, -58);
  g.fill();
  // a faint centre vein
  g.strokeStyle = 'rgba(150,150,150,.45)';
  g.lineWidth = 2;
  g.beginPath(); g.moveTo(0, -46); g.quadraticCurveTo(4, 0, 0, 50); g.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function dotTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(255,255,255,.8)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

const PALETTE = ['#A8232D', '#B8323A', '#93264A', '#C24A4F', '#A8232D', '#7E9893', '#E2A52C'];

export default function PetalField() {
  const mount = useRef(null);

  useEffect(() => {
    const host = mount.current;
    const small = innerWidth < 700;
    const PETALS = small ? 14 : 26;
    const POLLEN = small ? 70 : 160;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.25 : 1.5));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
    camera.position.z = 10;

    // visible half-extents at z = 0, refreshed on resize
    let HW = 5, HH = 3;
    function resize() {
      const w = innerWidth, h = innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      HH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      HW = HH * camera.aspect;
    }
    resize();

    const rand = (a, b) => a + Math.random() * (b - a);

    /* ---- petals: one instanced mesh, each with its own flutter ---- */
    const geo = new THREE.PlaneGeometry(1, 1.25);
    const mat = new THREE.MeshBasicMaterial({ map: petalTexture(), transparent: true, side: THREE.DoubleSide, depthWrite: false, opacity: 0.92 });
    const mesh = new THREE.InstancedMesh(geo, mat, PETALS);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(mesh);
    const base = [];
    const petals = Array.from({ length: PETALS }, (_, i) => {
      const color = new THREE.Color(PALETTE[i % PALETTE.length]);
      base.push(color);
      mesh.setColorAt(i, color);
      return {
        x: rand(-HW, HW), y: rand(-HH, HH) * 1.4, z: rand(-4, 3),
        s: rand(small ? 0.14 : 0.16, small ? 0.26 : 0.32),
        vy: rand(0.0018, 0.0045), sway: rand(0.4, 1.1), ph: rand(0, Math.PI * 2),
        rx: rand(0, 6.28), ry: rand(0, 6.28), rz: rand(0, 6.28),
        sx: rand(0.006, 0.018), sy: rand(0.004, 0.014), sz: rand(0.002, 0.008),
      };
    });
    const dummy = new THREE.Object3D();
    const shade = new THREE.Color();

    /* ---- pollen: a single points cloud ---- */
    const pGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(POLLEN * 3);
    const pollen = Array.from({ length: POLLEN }, (_, i) => {
      const p = { x: rand(-HW, HW) * 1.2, y: rand(-HH, HH) * 1.3, z: rand(-6, 4), vy: rand(0.0008, 0.0026), ph: rand(0, 6.28) };
      pos.set([p.x, p.y, p.z], i * 3);
      return p;
    });
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
    const pMat = new THREE.PointsMaterial({ map: dotTexture(), color: '#D9A23A', size: small ? 0.06 : 0.07, transparent: true, opacity: 0.75, depthWrite: false, sizeAttenuation: true });
    scene.add(new THREE.Points(pGeo, pMat));

    /* ---- inputs: scroll velocity (works for Lenis and native touch) and pointer ---- */
    let lastY = scrollY, vel = 0;
    const pointer = { x: 0, y: 0 }, look = { x: 0, y: 0 };
    const onPointer = (e) => { pointer.x = (e.clientX / innerWidth) * 2 - 1; pointer.y = (e.clientY / innerHeight) * 2 - 1; };
    if (matchMedia('(pointer: fine)').matches) addEventListener('pointermove', onPointer, { passive: true });
    addEventListener('resize', resize);

    let raf = null, last = performance.now(), t = 0;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(3, (now - last) / 16.667); // 1 = one 60fps frame
      last = now;
      t += dt;

      // scroll lift: scrolling down pushes petals up, eased so a flick feels like a breeze
      const dy = scrollY - lastY;
      lastY = scrollY;
      vel += (dy * 0.0016 - vel) * (1 - Math.pow(0.86, dt));
      vel = Math.max(-0.12, Math.min(0.12, vel));

      look.x += (pointer.x - look.x) * 0.04 * dt;
      look.y += (pointer.y - look.y) * 0.04 * dt;
      camera.position.x = look.x * 0.35;
      camera.position.y = -look.y * 0.22;
      camera.lookAt(0, 0, 0);

      for (let i = 0; i < PETALS; i++) {
        const p = petals[i];
        p.y += (-p.vy + vel) * dt;
        p.x += Math.sin(t * 0.012 * p.sway + p.ph) * 0.004 * dt;
        p.rx += p.sx * dt * (1 + Math.abs(vel) * 20);
        p.ry += p.sy * dt;
        p.rz += p.sz * dt;
        const lim = HH * 1.5 + 1;
        if (p.y < -lim) { p.y = lim; p.x = rand(-HW, HW); }
        else if (p.y > lim) { p.y = -lim; p.x = rand(-HW, HW); }
        dummy.position.set(p.x, p.y, p.z);
        dummy.rotation.set(p.rx, p.ry, p.rz);
        dummy.scale.setScalar(p.s);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        // fake light: petals turned edge-on read darker, face-on read brighter
        shade.copy(base[i]).multiplyScalar(0.72 + 0.38 * Math.abs(Math.cos(p.rx) * Math.cos(p.ry)));
        mesh.setColorAt(i, shade);
      }
      mesh.instanceMatrix.needsUpdate = true;
      mesh.instanceColor.needsUpdate = true;

      for (let i = 0; i < POLLEN; i++) {
        const p = pollen[i];
        p.y += (-p.vy + vel * 0.7) * dt;
        p.x += Math.sin(t * 0.01 + p.ph) * 0.0016 * dt;
        const lim = HH * 1.4 + 1;
        if (p.y < -lim) p.y = lim; else if (p.y > lim) p.y = -lim;
        pos[i * 3] = p.x; pos[i * 3 + 1] = p.y;
      }
      pGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    }
    const start = () => { if (raf === null) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    const stop = () => { if (raf !== null) { cancelAnimationFrame(raf); raf = null; } };
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);
    start();
    requestAnimationFrame(() => host.classList.add('on'));

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVis);
      removeEventListener('pointermove', onPointer);
      removeEventListener('resize', resize);
      geo.dispose(); mat.map.dispose(); mat.dispose(); pGeo.dispose(); pMat.map.dispose(); pMat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div className="petals" ref={mount} aria-hidden="true" />;
}
