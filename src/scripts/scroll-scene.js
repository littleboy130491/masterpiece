// Scroll scenes: a pinned canvas whose image sequence follows page scroll.
//
// Hero scene (has a <video>): the video and the frames are the same orbit. While
// the page sits at the top the video loops; on the first scroll the canvas takes
// over at the frame the video is showing, so there is no cut. Back at the top the
// video resumes from the frame the scrub stopped on.
//
// Plain scene: starts at data-start and scrubs one full orbit over its range.
//
// Hotspots: opening one (marker or list) zooms the aerial view into the marker,
// fades to the location's own view and shows its info in place of the panel.
// Back, Esc, or scrolling on flies back out to the orbit.
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

// Smooth zoom-and-pan between two cameras [cx, cy, w] (van Wijk & Nuij, "Smooth
// and efficient zooming and panning", 2003; the same path d3.interpolateZoom
// uses): it pulls back while travelling, so long moves read as flying over the
// area rather than sliding across it. Returns t(0..1) -> camera, plus a
// suggested duration in ms.
function zoomPath([ux0, uy0, w0], [ux1, uy1, w1]) {
  const rho = Math.SQRT2;
  const dx = ux1 - ux0;
  const dy = uy1 - uy0;
  const d2 = dx * dx + dy * dy;
  let S, path;
  if (d2 < 1e-12) {
    S = Math.log(w1 / w0) / rho;
    path = (t) => [ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(rho * t * S)];
  } else {
    const d1 = Math.sqrt(d2);
    const b0 = (w1 * w1 - w0 * w0 + 4 * d2) / (2 * w0 * 2 * d1);
    const b1 = (w1 * w1 - w0 * w0 - 4 * d2) / (2 * w1 * 2 * d1);
    const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0);
    const r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
    S = (r1 - r0) / rho;
    path = (t) => {
      const sT = t * S;
      const coshr0 = Math.cosh(r0);
      const u = (w0 / (2 * d1)) * (coshr0 * Math.tanh(rho * sT + r0) - Math.sinh(r0));
      return [ux0 + u * dx, uy0 + u * dy, (w0 * coshr0) / Math.cosh(rho * sT + r0)];
    };
  }
  path.duration = Math.abs(S) * 1000;
  return path;
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
    imgs: [...root.querySelectorAll('.scene__place-img')],
    panel: root.querySelector('.scene__loc'),
    title: root.querySelector('.scene__loc-title'),
    text: root.querySelector('.scene__loc-text'),
    count: root.querySelector('[data-loc-count]'),
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

  function draw(index) {
    const img = set.frames[index] || set.nearest(index);
    if (!img) return false;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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

  // ---- fly to a location
  // A camera over the aerial canvas: [cx, cy, w] = the point at the centre of the
  // screen and the visible width, in stage pixels ([W/2, H/2, W] is the plain
  // orbit). Every move is ONE continuous zoom on one easing curve:
  //   open   orbit -> zoom in on the hotspot, its view fading in over the aerial
  //   step   zoom out from this location to the whole area, then in to the next
  //   close  zoom out from the location back to the orbit
  // Location views zoom in step with the camera (between 1 and 1 + VIEW_ZOOM, so
  // their edges never show), so the photo and the aerial move as one.
  const ZOOM = 2.6; // how close the camera gets on a location
  const VIEW_ZOOM = 0.12;
  let placeKey = null; // open hotspot, or null while orbiting
  let placeY = 0; // scroll position when it opened
  let cur = 0; // index of the view image showing the open location
  let cam = null; // null = untouched orbit
  let run = 0; // id of the running move; starting a new one cancels it
  let flyTimer = 0;

  const flying = () => {
    root.classList.add('is-flying');
    clearTimeout(flyTimer);
    flyTimer = setTimeout(() => root.classList.remove('is-flying'), 2600);
  };

  const overview = () => [W / 2, H / 2, W];
  const clampCam = ([x, y, w]) => {
    const h = (w * H) / W;
    return [clamp(x, w / 2, W - w / 2), clamp(y, h / 2, H - h / 2), w];
  };
  // Where a hotspot is on the frame now on screen (centre if not in this frame).
  const spotCam = (key) => {
    const p = m.hotspots[spots[key].track]?.[shownIndex];
    return clampCam(p ? [ox + p[0] * scale, oy + p[1] * scale, W / ZOOM] : [W / 2, H / 2, W / ZOOM]);
  };

  const applyCam = (c) => {
    cam = c;
    if (!c) {
      canvas.style.transform = '';
      return;
    }
    const k = W / c[2];
    canvas.style.transformOrigin = '0 0';
    canvas.style.transform = `translate(${(W / 2 - c[0] * k).toFixed(2)}px, ${(H / 2 - c[1] * k).toFixed(2)}px) scale(${k.toFixed(4)})`;
  };
  const setImg = (img, opacity, zoom) => {
    img.style.opacity = opacity.toFixed(3);
    img.style.transform = `scale(${zoom.toFixed(4)})`;
  };

  const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const smooth = (k) => k * k * (3 - 2 * k);
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

  // The move itself. Zoom runs in log scale so it feels even; a step between two
  // locations dips to the whole-area view half way (cosine, so the turn-around
  // is smooth rather than a stop). `out`/`into` are the view images leaving and
  // arriving; each grows as the camera closes in on it and shrinks as it pulls out.
  function move(id, to, { out = null, into = null, ms }) {
    const from = cam || overview();
    const l0 = Math.log(W / from[2]);
    const l1 = Math.log(W / to[2]);
    const via = out && into;
    return tween(id, ms, (t) => {
      const e = ease(t);
      const dip = via ? (1 + Math.cos(2 * Math.PI * t)) / 2 : 1;
      const ls = lerp(l0, l1, e) * dip;
      applyCam(clampCam([lerp(from[0], to[0], e), lerp(from[1], to[1], e), W / Math.exp(ls)]));
      if (out) setImg(out, 1 - smooth(clamp(t / 0.35, 0, 1)), 1 + VIEW_ZOOM * clamp(ls / l0, 0, 1));
      if (into) setImg(into, smooth(clamp((t - 0.62) / 0.38, 0, 1)), 1 + VIEW_ZOOM * clamp(ls / l1, 0, 1));
    });
  }

  // Load a location's view into an image; resolves once decoded (cached views are instant).
  const loadView = (img, key) => {
    if (img.dataset.key !== key) {
      img.dataset.key = key;
      img.src = spots[key].view;
    }
    return (img.decode ? img.decode() : Promise.resolve()).catch(() => {});
  };

  const fillPanel = (key) => {
    const c = spots[key];
    place.title.textContent = c.title;
    place.text.textContent = c.text;
    place.count.textContent = `${keys.indexOf(key) + 1}/${keys.length}`;
  };
  const showPanel = (key) => {
    fillPanel(key);
    place.panel.hidden = false;
    place.title.focus({ preventScroll: true });
  };

  async function openPlace(key) {
    if (mode !== 'scrub' || !spots[key] || key === placeKey) return;
    const id = ++run;
    const from = placeKey;
    placeKey = key;
    placeY = window.scrollY;
    place.panel.hidden = true;
    flying();
    root.classList.add('is-place');
    const out = from ? place.imgs[cur] : null;
    const into = place.imgs[from ? 1 - cur : cur];
    await loadView(into, key);
    if (id !== run) return;
    const to = spotCam(key);
    const ms = from ? 2200 : 1500;
    // Panel comes in as the view settles.
    const panelAt = setTimeout(() => id === run && showPanel(key), ms * 0.8);
    const done = await move(id, to, { out, into, ms });
    if (!done) return clearTimeout(panelAt);
    if (out) setImg(out, 0, 1);
    cur = place.imgs.indexOf(into);
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
    const out = place.imgs[cur];
    // Orbit UI fades back in while the camera pulls out.
    setTimeout(() => id === run && root.classList.remove('is-place'), 500);
    if (!(await move(id, overview(), { out, ms: 1300 }))) return;
    root.classList.remove('is-place');
    applyCam(null);
    place.imgs.forEach((img) => setImg(img, 0, 1));
  }

  const stepPlace = (d) => {
    const at = placeKey ?? keys[0];
    openPlace(keys[(keys.indexOf(at) + d + keys.length) % keys.length]);
  };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && placeKey && !document.querySelector('dialog[open]')) closePlace();
  });

  // Warm the cache for the location views.
  for (const v of new Set(Object.values(spots).map((c) => c.view))) {
    const img = new Image();
    img.src = v;
    img.decode?.().catch(() => {});
  }

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

    const index = ((Math.round(current) % N) + N) % N;
    shownIndex = index;
    if (index !== drawn && draw(index)) {
      drawn = index;
      root.classList.add('is-scrub');
    }
    placeMarkers(index, areaIn > 0.3);

    const d = Math.round((index / N) * 360);
    deg.textContent = `${d}°`;
    root.style.setProperty('--deg', `${d}deg`);

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
