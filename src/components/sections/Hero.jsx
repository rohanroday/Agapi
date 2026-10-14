import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, clamp, smoothstep, rng, usePortrait, usePlayMode, splashDone } from '../../lib/motion.jsx';
import { SHOP } from '../../data/links.js';

/* Two modes, one choreography:
   - desktop: a 192-frame sequence drawn on a canvas, scrubbed by scroll (smoother than seeking a <video>)
   - phones and tablets: the clip loops on its own, slowed a touch; captions ride the first pass,
     so nobody has to scroll through a long hero on a small screen */
const FRAMES = { dir: '/assets/frames/d/', count: 192 };
const frameUrl = (i) => `${FRAMES.dir}${String(i + 1).padStart(3, '0')}.webp`;
const CLIP = {
  portrait: { src: '/assets/video/hero-m.mp4', poster: '/assets/img/hero-poster-m.jpg', end: '/assets/img/hero-ending-m.jpg' },
  landscape: { src: '/assets/video/hero-l.mp4', poster: '/assets/img/hero-poster-l.jpg', end: '/assets/img/hero-ending.jpg' },
};
/* tells the splash how far the hero has loaded (0..1); kept on window in case the splash listens late */
function reportProgress(f) {
  window.__agapiHero = Math.max(window.__agapiHero || 0, f);
  dispatchEvent(new CustomEvent('agapi:hero-progress', { detail: f }));
}

const PLAYBACK_RATE = 0.8; // 7.5s loop plays in ~9.4s, about two seconds per caption

/* Band map for the Flow clip (8s): fall 0-5s, water at ~5.3s, splash ~6.6s, frozen crown at 8s */
const BANDS = [
  { a: 0, b: 0.2, side: 'left', fx: 'fx-blur' },
  { a: 0.25, b: 0.45, side: 'left', fx: 'fx-drift' },
  { a: 0.5, b: 0.68, side: 'right', fx: 'fx-punch' },
  { a: 0.74, b: 1, side: 'settle', fx: 'fx-rise' },
];

/* Splits a line into word spans with seeded stagger thresholds; screen readers get the plain sentence */
function Split({ as: Tag = 'p', className, text }) {
  const words = text.split(/\s+/);
  const rand = rng(20190 + text.length);
  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <span key={i}>
            <span className="w" style={{ '--th': ((i / words.length) * 0.5 + rand() * 0.05).toFixed(3) }}>{w}</span>
            {i < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </span>
    </Tag>
  );
}

/* Load order: first frame, then coarse-to-fine strides, so scrubbing works long before everything lands */
function loadOrder(n) {
  const order = [0], seen = new Set(order);
  for (const stride of [32, 16, 8, 4, 2, 1]) {
    for (let i = 0; i < n; i += stride) if (!seen.has(i)) { seen.add(i); order.push(i); }
  }
  if (!seen.has(n - 1)) order.push(n - 1);
  return order;
}

/* Caption engine shared by both modes: p (0..1) in, delta-gated DOM writes out */
function makeCaptions(stage, bandEls, st) {
  const bands = BANDS.map((B, i) => ({ ...B, el: bandEls[i], first: i === 0, last: i === BANDS.length - 1, op: -1, k: -1, live: null }));
  let lastScrolled = null;
  return function updateCaptions(p) {
    for (const B of bands) {
      const f = Math.min(0.02, (B.b - B.a) / 3);
      let op = (B.first ? 1 : smoothstep(p, B.a, B.a + f)) * (B.last ? 1 : 1 - smoothstep(p, B.b - f, B.b));
      op = Math.round(op * 1000) / 1000;
      let k = clamp((p - B.a) / Math.min(0.075, (B.b - B.a) * 0.35), 0, 1);
      if (B.first) k = Math.max(k, st.loadK);
      if (op !== B.op) { B.op = op; B.el.style.opacity = op; }
      if (Math.abs(k - B.k) > 0.008 || (k === 1 && B.k !== 1) || (k === 0 && B.k !== 0)) { B.k = k; B.el.style.setProperty('--k', k.toFixed(3)); }
      const live = op > 0.5;
      if (live !== B.live) { B.live = live; B.el.classList.toggle('live', live); }
    }
    const sc = p > 0.015;
    if (sc !== lastScrolled) { lastScrolled = sc; stage.classList.toggle('scrolled', sc); }
  };
}

export default function Hero({ scrub }) {
  const portrait = usePortrait();
  const play = usePlayMode();
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const ringRef = useRef(null);
  const bandRefs = useRef([]);

  useEffect(() => {
    if (!scrub || play) return;
    const hero = heroRef.current, stage = stageRef.current, canvas = canvasRef.current, ring = ringRef.current;
    const ctx2d = canvas.getContext('2d', { alpha: false });
    const set = FRAMES;
    const imgs = new Array(set.count);
    const ready = new Uint8Array(set.count);
    let alive = true, drawn = -1, loaded = 0, firstShown = false;
    const st = { p: 0, loadK: 0 };
    const updateCaptions = makeCaptions(stage, bandRefs.current, st);
    stage.classList.remove('frames-ready');

    /* ---- canvas sizing and cover-fit drawing ---- */
    let cw = 0, ch = 0;
    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw = canvas.width = Math.round(stage.clientWidth * dpr);
      ch = canvas.height = Math.round(stage.clientHeight * dpr);
      drawn = -1;
      render();
    }
    function nearestReady(i) {
      for (let d = 0; d < set.count; d++) {
        if (i - d >= 0 && ready[i - d]) return i - d;
        if (i + d < set.count && ready[i + d]) return i + d;
      }
      return -1;
    }
    function draw(i) {
      const j = nearestReady(i);
      if (j < 0 || j === drawn) return;
      const img = imgs[j];
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * s, h = img.naturalHeight * s;
      ctx2d.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      drawn = j;
    }

    function render() {
      draw(Math.round(st.p * (set.count - 1)));
      updateCaptions(st.p);
    }

    /* ---- progressive loading with an honest ring ---- */
    const order = loadOrder(set.count);
    let next = 0;
    function loadNext() {
      if (!alive || next >= order.length) return;
      const i = order[next++];
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        if (!alive) return;
        imgs[i] = img; ready[i] = 1; loaded++;
        reportProgress(Math.min(1, loaded / 24));
        ring.style.setProperty('--ld', Math.round(126 * (1 - loaded / set.count)));
        if (!firstShown) { firstShown = true; stage.classList.add('frames-ready'); }
        if (loaded === set.count) stage.classList.add('frames-done');
        drawn = -1; render();
        loadNext();
      };
      img.onerror = () => { if (!alive) return; loaded++; reportProgress(Math.min(1, loaded / 24)); loadNext(); };
      img.src = frameUrl(i);
    }
    for (let c = 0; c < 6; c++) loadNext(); // six parallel lanes

    /* ---- scroll: ScrollTrigger scrub gives the eased "lerp", Lenis smooths the wheel ---- */
    const gctx = gsap.context(() => {
      gsap.to(st, {
        p: 1, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
        onUpdate: render,
      });
    });

    let ramp;
    splashDone.then(() => {
      if (alive) ramp = gsap.to(st, { loadK: 1, duration: 1.4, delay: 0.1, ease: 'power3.out', onUpdate: render });
    });

    size();
    const ro = new ResizeObserver(size);
    ro.observe(stage);
    ScrollTrigger.refresh();

    return () => {
      alive = false;
      ramp?.kill();
      gctx.revert();
      ro.disconnect();
      stage.classList.remove('frames-ready', 'frames-done');
    };
  }, [scrub, play]);

  /* ---- play mode: phones and tablets ---- */
  useEffect(() => {
    if (!scrub || !play) return;
    const hero = heroRef.current, stage = stageRef.current, v = videoRef.current;
    const clip = portrait ? CLIP.portrait : CLIP.landscape;
    const st = { p: 0, loadK: 0 };
    const updateCaptions = makeCaptions(stage, bandRefs.current, st);
    let raf = null, visible = true, settled = false, lastT = 0, ready = false, alive = true;

    stage.style.setProperty('--end', `url('${clip.end}')`);
    v.poster = clip.poster;
    v.muted = true;
    v.loop = true; // the file itself dissolves its ending into its opening, so the loop has no seam
    v.defaultPlaybackRate = PLAYBACK_RATE;
    v.src = clip.src;

    // first pass: captions ride the clip's clock; once it wraps, the final message and CTA stay put
    const settle = () => {
      if (settled) return;
      settled = true;
      st.p = 1; updateCaptions(1);
      stage.classList.add('clip-settled');
    };
    const tick = () => {
      raf = null;
      if (settled) return;
      if (v.duration) {
        if (v.currentTime + 0.5 < lastT) { settle(); return; } // wrapped around
        lastT = v.currentTime;
        st.p = clamp(v.currentTime / v.duration, 0, 1);
        updateCaptions(st.p);
      }
      if (!v.paused) raf = requestAnimationFrame(tick);
    };
    const kick = () => { if (raf === null && !settled) raf = requestAnimationFrame(tick); };
    const start = () => {
      if (!visible || !ready) return; // the clip begins as the splash lifts
      v.playbackRate = PLAYBACK_RATE; // some browsers reset it on load
      const pr = v.play();
      // autoplay blocked (iOS Low Power Mode, data saver): rest on the splash with the call to action
      if (pr) pr.catch(() => { if (v.paused) { stage.classList.add('clip-blocked'); settle(); } });
    };
    const onPlaying = () => { stage.classList.remove('clip-blocked'); stage.classList.add('clip-on'); kick(); };
    v.addEventListener('playing', onPlaying);
    // splash progress: poster first, then enough video to start
    const posterImg = new Image();
    posterImg.onload = posterImg.onerror = () => reportProgress(0.6);
    posterImg.src = clip.poster;
    const onData = () => reportProgress(1);
    v.addEventListener('loadeddata', onData);
    const fallback = setTimeout(() => reportProgress(1), 2500); // iOS may not buffer before play()

    // pause while scrolled away, pick up again on return
    const io = new IntersectionObserver((e) => {
      visible = e[0].isIntersecting;
      if (visible) start(); else v.pause();
    }, { threshold: 0.25 });
    io.observe(hero);
    const onVis = () => { if (document.hidden) v.pause(); else start(); };
    document.addEventListener('visibilitychange', onVis);

    updateCaptions(0);
    let ramp;
    splashDone.then(() => {
      if (!alive) return;
      ready = true;
      ramp = gsap.to(st, { loadK: 1, duration: 1.2, delay: 0.1, ease: 'power3.out', onUpdate: () => updateCaptions(st.p) });
      start();
    });
    ScrollTrigger.refresh();

    return () => {
      alive = false;
      if (raf !== null) cancelAnimationFrame(raf);
      ramp?.kill();
      clearTimeout(fallback);
      v.removeEventListener('loadeddata', onData);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      v.removeEventListener('playing', onPlaying);
      v.pause();
      v.removeAttribute('src');
      v.load();
      stage.classList.remove('clip-on', 'clip-settled', 'clip-blocked');
    };
  }, [scrub, play, portrait]);

  const bandContent = [
    <>
      <p className="kicker chip">From the mountains of Sikkim</p>
      <Split as="h1" className="display" text="One drop of love." />
    </>,
    <Split className="h-lg" text="Picked by hand on the hills of Sikkim." />,
    <Split className="h-lg" text="Mugwort. Guras. Orange peel. Green tea." />,
    <>
      <Split as="h2" className="display" text="Agapi. Love, from the mountain." />
      <p className="sub">Handmade, vegan skincare from Sikkim.</p>
      <div className="row">
        <a className="btn btn-accent" href={`${SHOP}/collections/all`}>Shop the collection</a>
        <a className="btn btn-ghost" href="#origin">Our story</a>
      </div>
    </>,
  ];

  return (
    <section className={`hero${play ? ' play' : ''}`} id="top" aria-label="Agapi, one drop of love" ref={heroRef}>
      <div className="stage" ref={stageRef}>
        <div className="poster" />
        {play
          ? <video ref={videoRef} className="clip" muted playsInline preload="auto" aria-hidden="true" tabIndex={-1} />
          : <canvas ref={canvasRef} className="frames" aria-hidden="true" />}
        <div className="scrim" />
        {BANDS.map((B, i) => (
          <div key={i} className={`band ${B.side} ${B.fx}`} ref={(el) => (bandRefs.current[i] = el)}>
            {bandContent[i]}
          </div>
        ))}
        <svg className="ring" viewBox="0 0 48 48" aria-hidden="true" ref={ringRef}>
          <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
          <circle className="ring-fill" cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="126" style={{ strokeDashoffset: 'var(--ld,126)' }} />
        </svg>
        <div className="cue" aria-hidden="true"><span>Scroll</span><i /></div>
      </div>

      {/* static hero: reduced motion only */}
      <div className="static-hero">
        <div className="static-copy">
          <p className="kicker chip">From the mountains of Sikkim</p>
          <h1 className="display">One drop of love.</h1>
          <p className="sub">Handmade, vegan skincare from the mountains of Sikkim.</p>
          <div className="row">
            <a className="btn btn-accent" href={`${SHOP}/collections/all`}>Shop the collection</a>
            <a className="btn btn-ghost" href="#origin">Our story</a>
          </div>
        </div>
      </div>
    </section>
  );
}
