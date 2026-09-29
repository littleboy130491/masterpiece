// Kawasan and Cluster scroll scenes, and the static area map (CMS: Homepage →
// Kawasan / Lokasi / Cluster).
//
// A scene's `base` is a motion package folder built by scripts/build-media.mjs
// (buildScrollScene): frames in two sizes plus manifest.json. Each hotspot names a
// `track`, a landmark whose per-frame position is in that manifest, and a default
// angle `frame` (0-based frame of the scene). Opening a hotspot fast-forwards the
// orbit to that angle while zooming in on it, showing `title` + `text`. `short` is
// the marker label on the image.

import content from './content.json';

const { homepage } = content;

function scene(s) {
  return {
    title: s.title,
    intro: s.intro,
    backLabel: s.backLabel,
    scene: { base: s.scene.path, startFrame: s.scene.startFrame ?? 0, placeholder: s.scene.placeholder },
    hotspots: Object.fromEntries(
      (s.hotspots ?? []).map((h) => [
        h.key,
        { track: h.landmark, frame: h.defaultFrame, title: h.title, short: h.shortLabel || h.title, text: h.text },
      ]),
    ),
  };
}

export const area = scene(homepage.kawasan);
export const cluster = scene(homepage.cluster);

const { lokasi } = homepage;
export const areaMap = {
  title: lokasi.title,
  intro: lokasi.intro,
  image: lokasi.map.src,
  width: lokasi.map.width || 1600,
  height: lokasi.map.height || 900,
  alt: lokasi.map.alt,
  placeholder: lokasi.placeholder,
};
