# DR Property Website

Marketing site for one development, built from `BRIEF.md` and the client sketch `DR Web Prop.jpg.jpeg`.
It has one scrolling homepage and one page per unit type. Astro builds it as a static site.

```
npm install
npm run media      # build web media from assets/ (needs ffmpeg on PATH); skips folders that exist
npm run dev        # http://localhost:4321
npm run build      # static output in dist/
npm run preview
```

`npm run track` re-runs the landmark tracker that places the placeholder hotspots
(see *Hotspots* below). Only needed if the area render sequence changes.

## Pages

| URL | What |
| --- | --- |
| `/` | Hero + Kawasan (one pinned scroll scene) → Lokasi (static map) → Cluster (scroll scene) → Fasilitas carousel → Tipe grid → Unit update siteplan |
| `/tipe/<slug>/` | One 360° sequence (left, pinned) that animates between the type's parts (facade, each floor) as you scroll or pick a part. Prop info, denah, Gallery and VR in a fixed right column. Back goes to `/#unit-update`. |

### Scroll scenes: Hero + Kawasan, and Cluster

Kawasan and Cluster are pinned, full-screen scenes whose image sequence follows page scroll, modelled on
malinowskiego.com (`src/components/ScrollScene.astro`, `src/scripts/scroll-scene.js`). Each scrubs one full
orbit over its scroll length (`--range`: 400vh on desktop, 300vh on phones), with hotspot markers pinned to
landmarks, a list of the same hotspots, and a degree meter.

**Opening a hotspot zooms you into that location.** A camera moves over the aerial frame, and every move is one
continuous zoom on a single easing curve (`move` in `src/scripts/scroll-scene.js`):
1. Open: the camera zooms in on the hotspot while that location's own view (`view` in `src/data/area.js`) fades in
   over the aerial and grows with it. Its title and text replace the section panel.
2. Previous/next or another list item: the camera zooms out from the current location to the whole area, then
   straight back in to the next one, with no stop in between. The current view shrinks and fades as the camera
   pulls out, and the next grows and fades in as it closes in. Views stay at 100–112% of the screen, so their
   edges never show. Views are decoded before a move starts, so nothing stalls mid-way. A hotspot outside the
   current frame gets a zoom toward its side of the frame.
3. Back, Esc, or scrolling on (more than 120px) zooms back out to the orbit.

The side-panel flyout is no longer used here.

The Kawasan scene also carries the hero, so the two read as one section:

1. At the top, the hero banner sits over a slow looping video of the aerial orbit (`media/hero/teaser.mp4`:
   one orbit in 40 s, using interpolated in-between frames).
2. On the first scroll, the canvas takes over at the exact frame the video is showing, so there is no cut.
   The hero text fades out as the Kawasan panel and markers fade in.
3. Scrolling back to the top hands the orbit back to the video at the frame the scrub stopped on.

Each scene reads a frame folder under `media/scroll/<name>/`: 120 frames in two sizes (1280px, or 800px on
phones) plus `manifest.json`, which has per-frame hotspot positions keyed by landmark (`track`). Frames load
coarse-to-fine, so scrubbing works immediately and sharpens as the rest arrive. Scenes that point at the same
folder share one download. Markers hide wherever they would cover the text.

**The cluster currently reuses the Kawasan frames** (with a "Sekuens contoh" badge). When the cluster renders
arrive, build them with `buildScrollScene('cluster', …)` in `scripts/build-media.mjs`, then point
`cluster.scene.base` in `src/data/area.js` at `/media/scroll/cluster/`. Set each cluster hotspot's `track` to a
landmark in the new manifest.

These scenes are a canvas image sequence, not WebRotate. The user asked for scroll-scrubbing like the reference,
and WebRotate can neither drive a full-bleed, cover-fit view (it won't upscale past the frame width) nor follow
page scroll. As a result the homepage has no WebRotate viewer.

## Where content lives

| File | Controls |
| --- | --- |
| `src/data/site.js` | Project name, hero copy and media, nav, status labels, placeholder badges on/off |
| `src/data/area.js` | Kawasan and Cluster scroll scenes + hotspot info, area map |
| `src/data/facilities.js` | Carousel slides (capped at 10) |
| `src/data/types.js` | Types (capped at 6): specs, prop info, the type's sequence and its parts (keyframe + text + denah), denah, gallery, VR URL |
| `src/data/units.json` | Siteplan dots: `{ id, x, y, status }`, with `x`/`y` in % of the siteplan image and `status` one of `sold` / `reserved` / `available` |

### Type page: one sequence, animated between parts

Each type page has a single 360° sequence (`t.sequence`) in the left column, pinned while the page scrolls
through the type's `parts`: Fasad, then Lantai 1, Lantai 2, and so on. Each part is a keyframe in the sequence.
The part changes when its screen of scroll is reached, when it's picked in the panel's part list, or when one of
the bars beside the part title is clicked. The sequence then animates frame by frame to that keyframe (the
`tt:goto` event in `src/scripts/turntable.js`), and the part's title, text and denah swap in below it.
Dragging still rotates freely. Direct links such as `/tipe/tipe-1/#lantai-2` open on that part.

PLACEHOLDER: the only sequence so far is the Ruko Hook facade orbit, so the parts are just evenly spaced angles
of it. The sequence to ask for should move between the parts itself (the roof lifting off, floors separating, a
cut-away per floor), with one keyframe per part. Set each part's `frame` to its keyframe in `src/data/types.js`.

## 360° turntables (WebRotate 360)

Used for the sequence on each type page. Each turntable is a WebRotate package folder in `public/media/<name>/` containing `config.xml` and `images/`,
the same layout SpotEditor publishes. The site uses the official runtime (`@webrotate360/imagerotator`),
wrapped by `src/components/Turntable.astro` and `src/scripts/turntable.js`:

- Drag or swipe left/right rotates. Vertical swipes over a viewer still scroll the page on phones.
- Horizontal wheel or trackpad rotates. Vertical wheel scrolls the page. WebRotate's own wheel handling is off (`mouseWheelDrag="false"`).
- ←/→ on a focused viewer rotates, as do the step buttons.
- Viewers boot lazily as they approach the viewport.

**Hotspots.** The component also supports WebRotate hotspots, though no turntable uses them right now. In `config.xml`,
give each hotspot `<spotinfo clickAction="11" clickData="drHotspot" … />`. WebRotate then calls
`window.drHotspot`, which opens the info panel for the entry passed as `hotspots` with the same id.

**Swapping in client packages.** Drop the SpotEditor output into `public/media/<name>/`, set
`mouseWheelDrag="false"` in its `<control>`, point the entry in `src/data/*.js` at it (with `width`/`height`
set to the frame size), and delete the matching builder in `scripts/build-media.mjs` so it isn't regenerated.

### License: needed before launch

WebRotate's free runtime only loads the **first viewer created on a page**. Every later viewer on that page
never starts. The site now stays within that: the homepage has no WebRotate viewer, and each type page has
exactly one. A **PRO or Enterprise license** is only needed to remove the "powered by" link, or if a page ever
gets a second viewer.

Put the license file at `public/wr360/license.lic`; it is empty now, which means free tier. Without it, any
viewer after the first on a page shows its first frame with a notice explaining why.
The free tier also shows a "powered by WebRotate 360" link, and the EULA requires keeping it.

## VR (3DVista)

Each type's `vr.url` opens in the overlay as an iframe, with an "open in new tab" link.
`/vr/placeholder/` stands in until a published 3DVista tour URL is supplied.

## Media pipeline

`scripts/build-media.mjs` turns the raw renders in `assets/` into web media:

| Source | Output |
| --- | --- |
| `assets/images_bev_kawasan` (600 frames, 1280×720) | `media/scroll/kawasan/`: every 5th frame (120 frames; 13 MB at 1280px, 5.7 MB at 800px) plus manifest, also used by the Cluster scene for now. Hero teaser loop (40 s, 10.4 MB, motion-interpolated; this step takes several minutes). Full film (20 s). Hero cover. Facility stills. |
| `assets/images_ruko` (Ruko Hook 01, 601 frames) | Tipe 1 facade turntable (every 5th frame, cropped to 760×570). Type card and gallery stills. |
| drawn | Placeholder area map, siteplan and denah (SVG) |

`scripts/track-hotspots.mjs` follows four landmarks (plaza, commercial building, office towers, lakeside
pavilion) through all 600 area frames with block matching. That keeps the placeholder hotspots pinned to real
buildings as the view rotates. Output goes to `scripts/data/kawasan-tracks.json`.

## Placeholders still in the build

Everything below shows a striped "contoh" badge on the page while `site.showPlaceholderBadges` is on.

- **Project name:** "DR" / "DR Residence", taken from the sketch file name.
- **Hero film:** the aerial render orbit, not a produced film.
- **Cluster sequence:** reuses the Kawasan frames.
- **Location views** (the background a hotspot flies to): close, upscaled crops of the aerial renders
  (`media/locations/`, built by `buildLocations`). Replace them with a proper view per location, ideally 1920px+
  16:9 eye-level or close renders, then set `viewsPlaceholder: false`.
- **Type sequences and parts:** every type uses the Tipe 1 facade orbit; the part keyframes are evenly spaced angles and the part text is sample copy.
- **Tipe 2–6:** images and turntables reuse Tipe 1 material. All type specs (LT, LB, bedrooms, bathrooms) are sample numbers.
- **Area map, siteplan, denah:** drawn stand-ins.
- **Unit statuses:** random seed data.
- **Facilities:** crops of the renders. Titles describe what the crop shows.
- **Hotspot copy:** placeholder text.
- **VR tour:** placeholder page.

## Open decisions (from the brief) and what the build does meanwhile

1. **Hero:** resolved as the short video, flowing into the Kawasan scroll scene (see above).
2. **Play Full Video:** opens in a full-screen overlay on the page.
3. **Name and language:** Indonesian UI. All copy lives in `src/data/`.
4. **Counts:** data-driven. 6 types, one with 3 floors to show floors continuing past 2.
5. **Denah thumbnails:** open the plans in the lightbox. The part list above them (and the bars in the viewer) move the sequence to each part, and the current part's denah shows under the viewer.
6. **Gallery:** lightbox overlay.
7. **VR:** embedded in the overlay, plus a new-tab link.
8. **Unit status:** a dot list the site renders (`units.json`) on top of a siteplan image.
9. **Hosting:** static output, deployable anywhere. Set `site`/`base` in `astro.config.mjs` once the domain is known. Also needs the WebRotate license (above).
