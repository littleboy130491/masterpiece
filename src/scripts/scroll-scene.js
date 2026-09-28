// Scroll scenes: a pinned canvas whose image sequence follows page scroll.
//
// Hero scene (has a <video>): the video and the frames are the same orbit. While
// the page sits at the top the video loops; on the first scroll the canvas takes
// over at the frame the video is showing, so there is no cut. Back at the top the
// video resumes from the frame the scrub stopped on.
//
// Plain scene: starts at data-start and scrubs one full orbit over its range.
//
// Hotspots: opening one (marker or list) fast-forwards the orbit to the
// hotspot's default angle while zooming in on it, with its info in place of the
// panel. Back, Esc, or scrolling on turns and zooms back out to the orbit.
//
// Scenes that share a frame folder share one download (see frameSet).

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const size = Math.min(window.innerWidth, 1600) * Math.min(devicePixelRatio || 1, 2) > 1100 ? 'lg' : 'sm';
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const ramp = (v, a, b) => clamp((v - a) / (b - a), 0, 1);

// ---- frame sets, loaded coarse-to-fine so any scroll position has something close
const sets = new Map();

function frameSet(base) {
  if (sets.has(base)) return sets.get(base);
  const listeners = new Set();
  const set = {
    listeners,
    ready: fetch(`${base}manifest.json`)
      .then((r) => r.json())
      .then((m) => {
        const N = m.count;
        set.m = m;
        set.frames = new Array(N).fill(null);
        const order = [];
        for (let stride = 16; stride >= 1; stride /= 2) {
          for (let i = 0; i < N; i += stride) if (!order.includes(i)) order.push(i);
        }
        let next = 0;
        const loadOne = () => {
          if (next >= order.length) return;
          const i = order[next++];
          const img = new Image();
          img.decoding = 'async';
          img.onload = () => {
            set.frames[i] = img;
            listeners.forEach((fn) => fn());
            loadOne();
          };
          img.onerror = loadOne;
          img.src = base + m.pattern.replace('{size}', size).replace('{n}', String(i).padStart(3, '0'));
        };
        for (let k = 0; k < 6; k++) loadOne();
        // Sharp versions of the frames the camera rests on when zoomed in (optional).
        set.detail = new Map();
        set.loadDetail = () => {
          if (set.detailRequested || !m.detail) return;
          set.detailRequested = true;
          for (const f of m.detail.frames) {
            const img = new Image();
            img.decoding = 'async';
            img.onload = () => {
              set.detail.set(f, img);
              listeners.forEach((fn) => fn());
            };
            img.src = base + m.detail.pattern.replace('{n}', String(f).padStart(3, '0'));
          }
        };
        return set;
      }),
    nearest(i) {
      const { frames } = set;
      const N = frames.length;
      for (let d = 0; d < N; d++) {
        const a = frames[(i + d) % N];
        if (a) return a;
        const b = frames[(i - d + N) % N];
        if (b) return b;
      }
      return null;
    },
  };
  sets.set(base, set);
  return set;
}

// ---- one scene
async function init(root) {
  const stage = root.querySelector('.scene__stage');
  const video = root.querySelector('.scene__video');
  const canvas = root.querySelector('.scene__canvas');
  const ctx = canvas.getContext('2d');
  const deg = root.querySelector('.scene__deg');
  const markers = [...root.querySelectorAll('.spot')];
  const spots = JSON.parse(root.dataset.spots);
  const hasHero = Boolean(video);

  const keys = Object.keys(spots);
  const place = {
    panel: root.querySelector('.scene__loc'),
    title: root.querySelector('.scene__loc-title'),
    text: root.querySelector('.scene__loc-text'),
  };

  root.addEventListener('click', (e) => {
    const spot = e.target.closest('[data-spot], [data-spot-open]');
    if (spot) return openPlace(spot.dataset.spot || spot.dataset.spotOpen);
    if (e.target.closest('.scene__back')) return closePlace();
    const step = e.target.closest('[data-loc-step]');
    if (step) stepPlace(Number(step.dataset.locStep));
  });

  // Media time of the video frame actually on screen (currentTime runs slightly ahead).
  let shownTime = null;
  if (hasHero) {
    video.src = video.dataset.src;
    if (!reduced) video.play().catch(() => {});
    if ('requestVideoFrameCallback' in video) {
      const onFrame = (_now, meta) => {
        shownTime = meta.mediaTime;
        video.requestVideoFrameCallback(onFrame);
      };
      video.requestVideoFrameCallback(onFrame);
    }
  }

  const set = await frameSet(root.dataset.base).ready;
  const { m } = set;
  const N = m.count;

  // Hero video time <-> scene frame. Video frame k = render frame k*video.step;
  // scene frame f = render frame f*step.
  const perSecond = hasHero ? (m.video.fps * m.video.step) / m.step : 0;
  const videoToFrame = (t) => Math.round(Math.floor(t * m.video.fps + 0.01) * (m.video.step / m.step)) % N;
  const frameToVideo = (f) => (((f % N) + N) % N) / perSecond;

  // ---- state
  let mode = hasHero ? 'video' : 'scrub';
  let offset = Number(root.dataset.start) || 0; // frame at the start of the scroll range
  let current = offset; // smoothed frame position (float, unwrapped)
  let drawn = -1;
  let shownIndex = 0; // frame index currently on the canvas
  let override = null; // frame (float) set by a hotspot move instead of the scroll
  let ticking = false;

  // ---- layout
  let W = 0, H = 0, dpr = 1, scale = 1, ox = 0, oy = 0;
  let avoid = []; // text/meter boxes markers must not cover (layout boxes, transforms ignored)
  const measureAvoid = () => {
    const area = root.querySelector('.scene__area');
    const meter = root.querySelector('.scene__meter');
    avoid = [...area.children].map((el) => ({
      x: area.offsetLeft + el.offsetLeft,
      y: area.offsetTop + el.offsetTop,
      w: el.offsetWidth,
      h: el.offsetHeight,
    }));
    avoid.push({ x: meter.offsetLeft, y: meter.offsetTop, w: meter.offsetWidth, h: meter.offsetHeight });
  };
  const covered = (x, y) => avoid.some((r) => x > r.x - 28 && x < r.x + r.w + 28 && y > r.y - 28 && y < r.y + r.h + 28);
  const resize = () => {
    W = stage.clientWidth;
    H = stage.clientHeight;
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    // cover-fit the frame (hotspot coordinates are in m.width x m.height space)
    scale = Math.max(W / m.width, H / m.height);
    ox = (W - m.width * scale) / 2;
    oy = (H - m.height * scale) / 2;
    measureAvoid();
    drawn = -1;
    if (placeKey) applyCam(spotCam(placeKey));
    requestTick();
  };

  const progress = () => {
    const range = root.offsetHeight - stage.clientHeight;
    return range > 0 ? clamp(-root.getBoundingClientRect().top / range, 0, 1) : 0;
  };
  const onScreen = () => {
    const r = root.getBoundingClientRect();
    return r.bottom > -50 && r.top < window.innerHeight + 50;
  };

  // Put frame f (float, unwrapped) on the canvas; returns its index.
  function showFrame(f) {
    const index = ((Math.round(f) % N) + N) % N;
    shownIndex = index;
    if (index !== drawn && draw(index)) {
      drawn = index;
      root.classList.add('is-scrub');
    }
    const d = Math.round((index / N) * 360);
    deg.textContent = `${d}°`;
    root.style.setProperty('--deg', `${d}deg`);
    return index;
  }

  // Draw a frame through the camera. The zoom happens here, from the source image,
  // so zoomed views keep the source's resolution (a CSS zoom would enlarge the
  // screen-sized canvas instead). While zoomed, a detail frame is used if there is one.
  function draw(index) {
    const img = (cam && set.detail?.get(index)) || set.frames[index] || set.nearest(index);
    if (!img) return false;
    const k = cam ? W / cam[2] : 1;
    const tx = cam ? W / 2 - cam[0] * k : 0;
    const ty = cam ? H / 2 - cam[1] * k : 0;
    ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * tx, dpr * ty);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, ox, oy, m.width * scale, m.height * scale);
    return true;
  }

  function placeMarkers(index, visible) {
    for (const el of markers) {
      const p = visible && m.hotspots[spots[el.dataset.spot].track]?.[index];
      const x = p && ox + p[0] * scale;
      const y = p && oy + p[1] * scale;
      const show = p && x > 24 && y > 80 && x < W - 24 && y < H - 24 && !covered(x, y);
      el.hidden = !show;
      if (!show) continue;
      // Near the right edge the label goes on the left of the dot. When flipped the
      // dot sits at the element's right edge, so shift left by the element's width.
      const flip = x + Number((el.dataset.w ||= el.offsetWidth)) > W - 16;
      el.classList.toggle('spot--flip', flip);
      const left = flip ? x - el.offsetWidth : x;
      el.style.transform = `translate3d(${left.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    }
  }

  // ---- go to a location
  // Each hotspot has a default angle (`frame` in the scene). Opening it
  // fast-forwards the orbit to that angle, the real camera path turning, while a
  // camera over the canvas moves in and zooms onto the hotspot, following it
  // frame by frame as it moves across the turning view. Moving to another
  // hotspot turns the orbit to its angle while the camera pulls back a little and
  // follows across; closing turns back to the scroll position while zooming out.
  // The camera is [cx, cy, w]: the point at the screen centre and the visible
  // width, in stage pixels ([W/2, H/2, W] = the plain orbit).
  const ZOOM = 2.2; // how close the camera gets on a location
  let placeKey = null; // open hotspot, or null while orbiting
  let placeY = 0; // scroll position when it opened
  let cam = null; // null = untouched orbit
  let run = 0; // id of the running move; starting a new one cancels it
  let flyTimer = 0;

  const flying = () => {
    root.classList.add('is-flying');
    clearTimeout(flyTimer);
    flyTimer = setTimeout(() => root.classList.remove('is-flying'), 3000);
  };

  const wrap = (i) => ((i % N) + N) % N;
  const shortest = (a, b) => {
    const d = wrap(b - a);
    return d > N / 2 ? d - N : d;
  };
  const overview = () => [W / 2, H / 2, W];
  const clampCam = ([x, y, w]) => {
    const h = (w * H) / W;
    return [clamp(x, w / 2, W - w / 2), clamp(y, h / 2, H - h / 2), w];
  };
  // A hotspot's position on the stage at a given frame (null if not in it).
  const posAt = (key, index) => {
    const p = m.hotspots[spots[key].track]?.[index];
    return p ? [ox + p[0] * scale, oy + p[1] * scale] : null;
  };
  const spotCam = (key) => {
    const p = posAt(key, shownIndex) || [W / 2, H / 2];
    return clampCam([p[0], p[1], W / ZOOM]);
  };

  // Set the camera and redraw the frame on screen through it.
  const applyCam = (c) => {
    cam = c;
    if (draw(shownIndex)) drawn = shownIndex;
  };

  const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const lerp = (a, b, t) => a + (b - a) * t;
  // Run fn(0..1) over ms; resolves false if another move took over.
  const tween = (id, ms, fn) =>
    new Promise((resolve) => {
      const t0 = performance.now();
      const frame = (now) => {
        if (id !== run) return resolve(false);
        const k = reduced ? 1 : Math.min(1, (now - t0) / ms);
        fn(k);
        k < 1 ? requestAnimationFrame(frame) : resolve(true);
      };
      requestAnimationFrame(frame);
    });

  // One move: turn the orbit from where it is to `toFrame` while the camera goes
  // from wherever it is (following `fromKey` if leaving a hotspot) to `toKey`
  // (or back to the plain orbit when there is none).
  function travel(id, { fromKey = null, toKey = null, toFrame }) {
    const c0 = cam || overview();
    const l0 = Math.log(W / c0[2]);
    const l1 = toKey ? Math.log(ZOOM) : 0;
    const f0 = override ?? current;
    const d = shortest(f0, toFrame);
    const ms = clamp(1300 + Math.abs(d) * 16, 1300, 2600);
    let lastA = null;
    let lastB = null;
    const done = tween(id, ms, (t) => {
      const e = ease(t);
      override = f0 + d * e; // the scroll no longer decides the angle until closed
      const index = ((Math.round(override) % N) + N) % N;
      const a = fromKey ? (lastA = posAt(fromKey, index) || lastA) : null;
      const b = toKey ? (lastB = posAt(toKey, index) || lastB) : null;
      const start = a || [c0[0], c0[1]];
      const end = b || [W / 2, H / 2];
      // Going in: travel leads, zoom follows. Between hotspots: zoom dips half way.
      const pan = toKey && !fromKey ? ease(clamp(t / 0.8, 0, 1)) : e;
      let ls;
      if (fromKey && toKey) ls = lerp(l0, l1, e) - 0.55 * Math.log(ZOOM) * Math.sin(Math.PI * t);
      else if (toKey) ls = lerp(l0, l1, ease(clamp((t - 0.15) / 0.85, 0, 1)));
      else ls = lerp(l0, l1, e);
      cam = clampCam([lerp(start[0], end[0], pan), lerp(start[1], end[1], pan), W / Math.exp(Math.max(0, ls))]);
      drawn = -1; // camera moved: redraw even if the frame is the same
      showFrame(override);
    });
    return { done, ms };
  }

  const fillPanel = (key) => {
    const c = spots[key];
    place.title.textContent = c.title;
    place.text.textContent = c.text;
  };
  const showPanel = (key) => {
    fillPanel(key);
    place.panel.hidden = false;
    place.title.focus({ preventScroll: true });
  };

  async function openPlace(key) {
    if (mode !== 'scrub' || !spots[key] || key === placeKey) return;
    set.loadDetail?.();
    const id = ++run;
    const from = placeKey;
    placeKey = key;
    placeY = window.scrollY;
    place.panel.hidden = true;
    flying();
    root.classList.add('is-place');
    const toFrame = spots[key].frame ?? shownIndex;
    const { done, ms } = travel(id, { fromKey: from, toKey: key, toFrame });
    const panelAt = setTimeout(() => id === run && showPanel(key), ms * 0.75);
    if (!(await done)) clearTimeout(panelAt);
  }

  async function closePlace() {
    if (!placeKey) return;
    const id = ++run;
    const key = placeKey;
    placeKey = null;
    place.panel.hidden = true;
    flying();
    if (root.contains(document.activeElement) || document.activeElement === document.body) {
      root.querySelector(`[data-spot-open="${key}"]`)?.focus({ preventScroll: true });
    }
    // Turn back to the angle the scroll position calls for.
    const { done } = travel(id, { fromKey: key, toFrame: Math.round(current) });
    setTimeout(() => id === run && root.classList.remove('is-place'), 500);
    if (!(await done)) return;
    override = null;
    root.classList.remove('is-place');
    applyCam(null);
  }

  const stepPlace = (d) => {
    const at = placeKey ?? keys[0];
    openPlace(keys[(keys.indexOf(at) + d + keys.length) % keys.length]);
  };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && placeKey && !document.querySelector('dialog[open]')) closePlace();
  });

  function tick() {
    ticking = false;
    if (placeKey && Math.abs(window.scrollY - placeY) > 120) closePlace(); // scrolling on returns to the orbit
    if (!onScreen()) return;
    const p = progress();

    // Phases. Hero scene: hero out over the first 7%, panel in from 6% to 14%.
    const heroIn = hasHero ? 1 - ramp(p, 0, 0.07) : 0;
    const areaIn = hasHero ? ramp(p, 0.06, 0.14) : 1;
    root.style.setProperty('--p-hero', heroIn.toFixed(3));
    root.style.setProperty('--p-area', areaIn.toFixed(3));
    root.style.setProperty('--v-hero', heroIn > 0 ? 'visible' : 'hidden');
    root.style.setProperty('--v-area', areaIn > 0 ? 'visible' : 'hidden');
    root.style.setProperty('--progress', p.toFixed(4));

    if (hasHero && p <= 0 && mode === 'scrub' && Math.abs(current - offset) < 0.5) {
      // Back at the top and settled: hand the orbit back to the video at the same frame.
      mode = 'video';
      shownTime = null;
      video.currentTime = frameToVideo(Math.round(current));
      if (!reduced) video.play().catch(() => {});
      root.classList.remove('is-scrub');
      placeMarkers(0, false);
      return;
    }

    if (hasHero && p > 0 && mode === 'video') {
      offset = videoToFrame(shownTime ?? video.currentTime);
      current = offset;
      drawn = -1;
      mode = 'scrub';
      video.pause();
    }

    if (mode !== 'scrub') return;

    const target = offset + p * N; // one full orbit over the scroll range
    current = reduced ? target : current + (target - current) * 0.16;
    if (Math.abs(target - current) < 0.02) current = target;

    const index = showFrame(override ?? current);
    placeMarkers(index, areaIn > 0.3);

    if (current !== target) requestTick();
  }

  function requestTick() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(tick);
  }

  // Redraw as sharper frames arrive.
  set.listeners.add(() => {
    if (mode === 'scrub') {
      drawn = -1;
      requestTick();
    }
  });
  // Detail frames are only needed once someone heads for a hotspot.
  root.addEventListener('pointerover', (e) => e.target.closest('[data-spot], [data-spot-open]') && set.loadDetail?.(), { passive: true });
  root.addEventListener('focusin', (e) => e.target.closest('[data-spot-open]') && set.loadDetail?.());
  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', resize);
  resize();

  // Pause the hero loop when the scene is off screen.
  if (hasHero) {
    new IntersectionObserver(([e]) => {
      if (mode !== 'video' || reduced) return;
      e.isIntersecting ? video.play().catch(() => {}) : video.pause();
    }).observe(root);
  }
}

// Hero scenes start right away; others when they come within a screen or so.
const scenes = [...document.querySelectorAll('[data-scene]')];
const lazy = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      lazy.unobserve(e.target);
      init(e.target);
    }
  },
  { rootMargin: '150% 0px' },
);
for (const s of scenes) (s.querySelector('.scene__video') ? init(s) : lazy.observe(s));
