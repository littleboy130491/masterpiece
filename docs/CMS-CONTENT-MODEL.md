# CMS content model

The fields an editor needs to run the DR website, independent of which CMS we choose. Each model lists its fields with a
generic type, whether it's required, validation, and where that content lives in the code today, so moving to a CMS
is a mapping exercise rather than a redesign.

The site stays static (Astro). The CMS stores content; a publish triggers a rebuild (webhook → build → deploy).

To see where each field appears on the page, see the annotated screenshots in [`CMS-FIELD-MAP.md`](CMS-FIELD-MAP.md).

## Contents

1. [Principles](#1-principles)
2. [Overview](#2-overview)
3. [Field types used below](#3-field-types-used-below)
4. [Site settings (singleton)](#4-site-settings-singleton)
5. [Homepage (singleton)](#5-homepage-singleton)
6. [Hotspot (embedded)](#6-hotspot-embedded)
7. [Facility (collection)](#7-facility-collection)
8. [Unit type (collection)](#8-unit-type-collection)
9. [Unit (collection)](#9-unit-collection)
10. [Media packages](#10-media-packages)
11. [Validation rules, all in one place](#11-validation-rules-all-in-one-place)
12. [Mapping to the current code](#12-mapping-to-the-current-code)
13. [What the chosen CMS must support](#13-what-the-chosen-cms-must-support)
14. [Open questions](#14-open-questions)

---

## 1. Principles

- **Editors change words, pictures, numbers and statuses. Developers or the 3D team deliver motion packages.**
  Image sequences, 360° packages and video clip sets are uploaded as whole packages. They are never edited frame
  by frame in the CMS.
- **Anything an editor might want to change lives in the CMS.** That includes section titles and intros that are
  hard-coded in components today (see §12).
- **Positions are stored as numbers the editor can see and correct**, such as siteplan dot positions in % and default
  frames for hotspots. A CMS that supports a custom field can later add a click-to-place picker; the stored data
  doesn't change.
- **Limits from the brief are enforced as validation**: at most 10 facilities and 6 unit types on the homepage.
- **Language:** Indonesian only for now. Every text field is marked *translatable* so English can be added later
  without restructuring.

## 2. Overview

```
Site settings (singleton)      name, logo, SEO, navigation labels, status labels
Homepage (singleton)
 ├─ Hero                       copy + video/cover
 ├─ Kawasan section            copy + scene package + Hotspots[]
 ├─ Lokasi section             copy + map image
 ├─ Cluster section            copy + scene package + Hotspots[]
 ├─ Fasilitas section          copy + → Facility[] (ordered, max 10)
 ├─ Tipe section               copy + → Unit type[] (ordered, max 6)
 └─ Unit update section        copy + siteplan image (dots come from Unit[])

Facility (collection)          title, image
Unit type (collection)         specs, gallery, denah, VR, 360° sequence + parts[]
Unit (collection)              siteplan dot: id, position, status, (type)

Media packages                 scene frames, WebRotate package, clip set (future)
```

`→` = reference (relation) to a collection entry. `[]` = ordered list.

## 3. Field types used below

| Type | Meaning |
|---|---|
| `text` | Single line. |
| `textarea` | Multi-line plain text, no formatting. |
| `number` | Integer or decimal; unit and range given in the notes. |
| `select` | One value from a fixed list. |
| `boolean` | On/off. |
| `slug` | URL-safe identifier (`a-z 0-9 -`), unique in its collection, **not editable after publish** (it's in URLs). |
| `url` | Absolute URL or site path. |
| `image` | Uploaded image + **`alt` text (required, translatable)**. JPG/WebP/PNG/SVG. Min size in notes. Focal point if the CMS supports it. |
| `video` | Uploaded MP4 (H.264). Size limits in notes. |
| `package` | A folder or zip delivered as a unit (frames, manifest, config). See §10. |
| `list<…>` | Ordered, repeatable group of the given fields. |
| `ref<…>` / `refs<…>` | Reference to one / an ordered list of entries in a collection. |

*Translatable* (**T**) marks text that would be duplicated per language if English is added.

## 4. Site settings (singleton)

| Field | Type | Req. | Validation / notes | Today in code |
|---|---|---|---|---|
| `name` | text **T** | ✓ | Short wordmark shown as the logo text, ≤ 12 chars. | `site.name` (`src/data/site.js`) |
| `fullName` | text **T** | ✓ | Official project name; used in titles and footer. | `site.fullName` |
| `logo` | image | – | SVG preferred. If empty, `name` is set as text. | – (text logo) |
| `language` | select | ✓ | `id` (later `en`). Sets `<html lang>`. | `site.lang` |
| `seo.description` | textarea **T** | ✓ | ≤ 160 chars. Default meta description. | `site.description` |
| `seo.shareImage` | image | – | 1200×630, for link previews. | – |
| `nav[]` | list | ✓ | Header links, in order. | `nav` |
| ↳ `label` | text **T** | ✓ | ≤ 16 chars. | |
| ↳ `section` | select | ✓ | `kawasan · peta · cluster · fasilitas · tipe · unit-update` (section anchors). | |
| `statusLabels.sold` | text **T** | ✓ | e.g. "Terjual". | `statusLabels` |
| `statusLabels.reserved` | text **T** | ✓ | e.g. "Dipesan". | |
| `statusLabels.available` | text **T** | ✓ | e.g. "Tersedia". | |
| `footer.copyright` | text **T** | – | Defaults to "© {year} {fullName}". | `Footer.astro` |
| `analytics.id` | text | – | e.g. GA4 measurement ID. Not used yet. | – |

Developer-only, **not** in the CMS: `showPlaceholderBadges`, WebRotate license file, build settings.

## 5. Homepage (singleton)

### 5.1 Hero

| Field | Type | Req. | Validation / notes | Today in code |
|---|---|---|---|---|
| `hero.eyebrow` | text **T** | – | ≤ 40 chars. The only eyebrow on the site. | `site.hero.eyebrow` |
| `hero.title` | text **T** | ✓ | ≤ 60 chars; large display type. | `site.hero.title` |
| `hero.loopVideo` | video | ✓ | Background loop, muted. 1920×1080, H.264, ≤ 12 MB. Must be the same orbit as the Kawasan scene (the hero hands off to it). | `site.hero.teaser` |
| `hero.loopVideoMobile` | video | – | 1080×1920 portrait version for phones. | – |
| `hero.fullVideo` | video | ✓ | "Play Full Video" film, with controls. ≤ 60 MB (or an external streaming URL). | `site.hero.full` |
| `hero.cover` | image | ✓ | Poster shown before the video plays, 1920×1080. | `site.hero.cover` |
| `hero.playLabel` | text **T** | ✓ | Default "Play Full Video". | hard-coded in `ScrollScene.astro` |

> When the clip-based hero (reference-style) is built, `loopVideo`/`loopVideoMobile` move into a **Clip set** package
> (§10.3), and the hero keeps only its copy and cover.

### 5.2 Kawasan section (scroll scene)

| Field | Type | Req. | Validation / notes | Today in code |
|---|---|---|---|---|
| `kawasan.title` | text **T** | ✓ | ≤ 30 chars. | `area.title` (`src/data/area.js`) |
| `kawasan.intro` | textarea **T** | ✓ | ≤ 160 chars. | `area.intro` |
| `kawasan.scene` | package | ✓ | **Scene frames** package (§10.1). | `area.scene.base` |
| `kawasan.hotspots[]` | list<Hotspot> | – | 0–6 hotspots, see §6. | `area.hotspots` |
| `kawasan.backLabel` | text **T** | ✓ | Button to leave a location, e.g. "Kembali ke kawasan". | derived from title in `ScrollScene.astro` |

### 5.3 Lokasi section (static map)

| Field | Type | Req. | Validation / notes | Today in code |
|---|---|---|---|---|
| `lokasi.title` | text **T** | ✓ | | `areaMap.title` |
| `lokasi.intro` | textarea **T** | – | ≤ 160 chars. | `areaMap.intro` |
| `lokasi.map` | image | ✓ | ≥ 1600 px wide; SVG or JPG/WebP. No interaction (brief). | `areaMap.image`, `width`, `height`, `alt` |

### 5.4 Cluster section (scroll scene)

Same fields as Kawasan (§5.2): `cluster.title`, `cluster.intro`, `cluster.scene`, `cluster.hotspots[]`,
`cluster.backLabel`. Today in `cluster` (`src/data/area.js`). The scene currently points at the Kawasan package
until the cluster renders exist.

### 5.5 Fasilitas section

| Field | Type | Req. | Validation / notes | Today in code |
|---|---|---|---|---|
| `fasilitas.title` | text **T** | ✓ | | hard-coded in `Facilities.astro` ("Ruang bersama") |
| `fasilitas.intro` | textarea **T** | – | ≤ 160 chars. | hard-coded in `Facilities.astro` |
| `fasilitas.items` | refs<Facility> | ✓ | **1–10**, ordered. | `facilities` (`src/data/facilities.js`) |

### 5.6 Tipe section

| Field | Type | Req. | Validation / notes | Today in code |
|---|---|---|---|---|
| `tipe.title` | text **T** | ✓ | | hard-coded in `TypeGrid.astro` ("Pilih tipe") |
| `tipe.intro` | textarea **T** | – | ≤ 200 chars. | hard-coded in `TypeGrid.astro` |
| `tipe.items` | refs<Unit type> | ✓ | **1–6**, ordered; shown 3 per row. | `types` order (`src/data/types.js`) |

### 5.7 Unit update section

| Field | Type | Req. | Validation / notes | Today in code |
|---|---|---|---|---|
| `unitUpdate.title` | text **T** | ✓ | | hard-coded in `UnitUpdate.astro` ("Status unit") |
| `unitUpdate.intro` | textarea **T** | – | | hard-coded in `UnitUpdate.astro` |
| `unitUpdate.siteplan` | image | ✓ | The plan the dots sit on. ≥ 1600 px wide. **Replacing it means re-checking every Unit position** (they're % of this image). | `siteplan` object in `UnitUpdate.astro` |

The dots themselves come from the **Unit** collection (§9); the legend counts are calculated.

## 6. Hotspot (embedded)

A point on a scroll scene (Kawasan or Cluster). It lives inside its section, not as a shared collection, because its
position data belongs to that section's scene package.

| Field | Type | Req. | Validation / notes | Today in code |
|---|---|---|---|---|
| `key` | slug | ✓ | Unique within the section, e.g. `area-plaza`. | object key in `area.hotspots` |
| `title` | text **T** | ✓ | ≤ 40 chars. Shown in the list and as the location title. | `title` |
| `shortLabel` | text **T** | – | ≤ 16 chars. Marker label on the image; defaults to `title`. | `short` |
| `text` | textarea **T** | ✓ | ≤ 240 chars. Shown when the location is open. | `text` |
| `landmark` | select | ✓ | Which tracked landmark the marker follows. Options come from the scene package's manifest (`hotspots` keys), e.g. `plaza · commercial · offices · lakeside`. | `track` |
| `defaultFrame` | number | ✓ | 0 … (frames − 1). The orbit angle shown when the location is open. Needs a **preview** of that frame beside the field. Changing it means that frame also needs a detail frame (§10.1). | `frame` |
| `transitionClip` | package | – | *Future, clip-based version:* overview → location clip, its reverse, and a loop at the location (§10.3). | – |

## 7. Facility (collection)

| Field | Type | Req. | Validation / notes | Today in code |
|---|---|---|---|---|
| `title` | text **T** | ✓ | ≤ 40 chars; caption under the image. | `title` (`src/data/facilities.js`) |
| `image` | image | ✓ | 16:10 display; ≥ 1200 px wide. | `image` |

Order and the 10-item limit are set on the homepage reference (§5.5), so a facility can be kept as a draft without
being shown.

## 8. Unit type (collection)

One entry per type; each has its own page at `/tipe/{slug}/`.

### 8.1 Basics and specs

| Field | Type | Req. | Validation / notes | Today in code |
|---|---|---|---|---|
| `slug` | slug | ✓ | e.g. `tipe-1`. Locked after publish. | `slug` (`src/data/types.js`) |
| `name` | text **T** | ✓ | e.g. "Tipe 1". | `name` |
| `label` | text **T** | – | e.g. "Ruko Hook"; small accent line under the name. | `label` |
| `cardImage` | image | ✓ | Homepage card; 6:5, shown on black, building centred; ≥ 1000 px. | `image` |
| `landArea` | number | ✓ | LT, m², > 0, one decimal allowed. | `lt` |
| `buildingArea` | number | ✓ | LB, m², > 0. | `lb` |
| `bedrooms` | number | ✓ | Integer ≥ 0. | `bedrooms` |
| `bathrooms` | number | ✓ | Integer ≥ 0. | `bathrooms` |
| `floors` | number | ✓ | Integer ≥ 1. Should match the number of floor parts (§8.3). | `floors` arg → `info` |
| `intro` | textarea **T** | ✓ | ≤ 300 chars; top of the info panel. | `intro` |
| `infoRows[]` | list | – | Extra property facts shown as label/value rows. | `info` |
| ↳ `label` | text **T** | ✓ | e.g. "Luas tanah". | |
| ↳ `value` | text **T** | ✓ | e.g. "120 m²". | |

> `infoRows` currently repeats LT/LB/floors/bedrooms/bathrooms. In the CMS those five rows should be **generated
> from the spec fields**, and `infoRows` kept for anything extra (e.g. electricity, certificate, orientation), so
> the numbers are entered once.

### 8.2 360° sequence

| Field | Type | Req. | Validation / notes | Today in code |
|---|---|---|---|---|
| `sequence` | package | ✓ | **WebRotate package** (§10.2): the one image sequence the type page animates. | `sequence.package`, `poster`, `width`, `height`, `firstImage` |

### 8.3 Parts (facade, then each floor)

Keyframes in the sequence. Scrolling the type page or choosing a part animates the sequence to its frame.

| Field | Type | Req. | Validation / notes | Today in code |
|---|---|---|---|---|
| `parts[]` | list | ✓ | ≥ 1; the first is normally the facade. Order = scroll order. | `parts` |
| ↳ `key` | slug | ✓ | Unique within the type, used in links (`#lantai-2`). | `id` |
| ↳ `name` | text **T** | ✓ | e.g. "Fasad", "Lantai 1". | `name` |
| ↳ `frame` | number | ✓ | 0 … (sequence frames − 1). Needs a frame **preview**. | `frame` |
| ↳ `text` | textarea **T** | ✓ | ≤ 240 chars. | `text` |
| ↳ `floorPlan` | select | – | Which `floorPlans[]` entry to show with this part (by label). | `denah` |

### 8.4 Floor plans, gallery, VR

| Field | Type | Req. | Validation / notes | Today in code |
|---|---|---|---|---|
| `floorPlans[]` | list | – | Denah thumbnails in the panel; open in a lightbox. Up to ~4. | `denah` |
| ↳ `label` | text **T** | ✓ | e.g. "Lantai 1", "Atap". | `label` |
| ↳ `image` | image | ✓ | Portrait plan; SVG or ≥ 1200 px PNG/JPG. | `image` |
| `gallery[]` | list<image> | – | Lightbox gallery; ≥ 1600 px on the long side; alt text required. | `gallery` |
| `vr.url` | url | – | Published 3DVista tour. If empty, the VR button is hidden. | `vr.url` |
| `vr.mode` | select | – | `embedded` (overlay on the page, current) or `newTab`. | – |

### 8.5 SEO (optional)

| Field | Type | Notes |
|---|---|---|
| `seo.title` | text **T** | Defaults to "{name} — {fullName}". |
| `seo.description` | textarea **T** | Defaults to a sentence built from the specs. |

### Example entry

```json
{
  "slug": "tipe-1",
  "name": "Tipe 1",
  "label": "Ruko Hook",
  "cardImage": { "src": "…/ruko-front-34.jpg", "alt": "Tipe 1, Ruko Hook" },
  "landArea": 120, "buildingArea": 180, "bedrooms": 2, "bathrooms": 2, "floors": 2,
  "intro": "Ruko dua lantai dengan area usaha di lantai dasar …",
  "infoRows": [{ "label": "Daya listrik", "value": "3.500 VA" }],
  "sequence": { "package": "tipe-1/facade", "frames": 120, "width": 760, "height": 570 },
  "parts": [
    { "key": "fasad",    "name": "Fasad",    "frame": 0,  "text": "…" },
    { "key": "lantai-1", "name": "Lantai 1", "frame": 40, "text": "…", "floorPlan": "Lantai 1" },
    { "key": "lantai-2", "name": "Lantai 2", "frame": 80, "text": "…", "floorPlan": "Lantai 2" }
  ],
  "floorPlans": [
    { "label": "Lantai 1", "image": { "src": "…/denah-lt1.svg", "alt": "Denah lantai 1" } }
  ],
  "gallery": [{ "src": "…/ruko-front.jpg", "alt": "Tipe 1, tampak depan" }],
  "vr": { "url": "https://…/tipe-1/", "mode": "embedded" }
}
```

## 9. Unit (collection)

One entry per unit on the siteplan. This is the collection that changes most often (sales status), so it should be
quick to edit in bulk: a table view, filter by block/status, and CSV import/export.

| Field | Type | Req. | Validation / notes | Today in code |
|---|---|---|---|---|
| `unitId` | text | ✓ | Unique, e.g. `A-01`. Shown in the dot's tooltip. | `id` (`src/data/units.json`) |
| `block` | text | – | e.g. `A`; for filtering. Can be derived from `unitId`. | – |
| `x` | number | ✓ | 0–100, % of the siteplan image width, 2 decimals. | `x` |
| `y` | number | ✓ | 0–100, % of the siteplan image height. | `y` |
| `status` | select | ✓ | `available · reserved · sold`. Colours are fixed: green / yellow / red. | `status` |
| `type` | ref<Unit type> | – | Not shown yet (brief: dots don't open units); useful for reporting and later linking. | – |
| `note` | textarea | – | Internal only, never shown on the site. | – |

## 10. Media packages

Delivered by the 3D team or a developer, uploaded as a whole, and referenced from the models above. The CMS stores a
reference (a folder in object storage, or an uploaded zip that the build unpacks). Editors pick a package; they don't
edit its contents.

### 10.1 Scene frames (Kawasan, Cluster)

What the scroll scenes play today. Built by `scripts/build-media.mjs` from the raw renders.

| Part | Content |
|---|---|
| `manifest.json` | Frame count, source size, sizes available, per-frame landmark positions (`hotspots`), hero-video frame mapping, detail frame list. |
| `lg/`, `sm/` | Frames for desktop / phones (120 each today). |
| `detail/` | High-resolution versions of each hotspot's `defaultFrame` (sharp zoomed views). |

**Inputs the 3D team delivers:** the orbit render sequence, ideally 3840×2160 (at least 1920×1080 with every 5th frame
at 2560×1440), plus 5120×2880 stills at each hotspot's default frame. Landmark positions come from the tracking script
(`scripts/track-hotspots.mjs`) or are exported from the 3D scene.

### 10.2 WebRotate package (unit type sequences)

`config.xml` + `images/` as published by WebRotate SpotEditor (see README). Plus the `width`, `height` and frame
count, so the CMS can validate `parts[].frame`.

### 10.3 Clip set (future: reference-style hero and scenes)

For the malinowskiego.com-style build agreed as the target:

| Clip | Spec |
|---|---|
| `loop` | 4 s idle loop, first frame = last frame, still camera. |
| `in` | ~1 s camera move from the previous view to this one; last frame = first frame of `loop`. |
| `out` | The same move reversed. |
| Every clip | MP4 H.264, 24 fps, 1920×1080 **and** a 1080×1920 portrait version for phones; no audio. |

A clip set would replace `hero.loopVideo` and each scene's `scene` package, and add `transitionClip` per hotspot (§6).

## 11. Validation rules, all in one place

- Facilities on the homepage: **1–10**. Unit types on the homepage: **1–6**.
- Slugs (`Unit type.slug`, `part.key`, `hotspot.key`) are URL-safe, unique in scope, and locked once published.
- `Hotspot.defaultFrame` and `part.frame` must be within the package's frame count.
- `Hotspot.landmark` must exist in the scene package's manifest.
- `part.floorPlan` must match a `floorPlans[].label` on the same type.
- `Unit.x`, `Unit.y` in 0–100; `Unit.unitId` unique; `Unit.status` one of the three values.
- Every image needs alt text; minimum sizes as listed per field.
- `floors` should equal the number of parts minus the facade; the CMS shows a warning, not an error.
- Videos over their size limit are rejected at upload.

## 12. Mapping to the current code

| Today | Moves to |
|---|---|
| `src/data/site.js` → `site`, `nav`, `statusLabels` | Site settings (§4), Homepage hero (§5.1) |
| `src/data/area.js` → `area` | Homepage Kawasan (§5.2) + Hotspots (§6) |
| `src/data/area.js` → `areaMap` | Homepage Lokasi (§5.3) |
| `src/data/area.js` → `cluster` | Homepage Cluster (§5.4) + Hotspots (§6) |
| `src/data/facilities.js` | Facility collection (§7) + Homepage Fasilitas order (§5.5) |
| `src/data/types.js` | Unit type collection (§8) + Homepage Tipe order (§5.6) |
| `src/data/units.json` | Unit collection (§9) |
| Titles/intros hard-coded in `Facilities.astro`, `TypeGrid.astro`, `UnitUpdate.astro` | Homepage §5.5–5.7 |
| Siteplan image hard-coded in `UnitUpdate.astro` | Homepage `unitUpdate.siteplan` (§5.7) |
| "Play Full Video", "Kembali ke …" labels in `ScrollScene.astro` | Homepage §5.1, §5.2 |
| `public/media/…` generated by `npm run media` | Media packages (§10), still generated at build time |

Once a CMS is chosen, the `src/data/*` files become thin loaders that fetch the same shapes from it, so the
components hardly change.

## 13. What the chosen CMS must support

Required:

- **Singletons and collections**, with **ordered references** (homepage ordering of facilities and types).
- **Repeatable groups** (nav, hotspots, parts, floor plans, gallery, info rows).
- **Image fields with alt text**; video uploads of 10–60 MB, or links to external storage for large files.
- **Large package storage** for image sequences (hundreds of files), e.g. an S3/R2 bucket the build reads from, rather
  than the CMS media library.
- **Validation**: min/max items, number ranges, unique slugs.
- **Publish webhook** to trigger a static rebuild and deploy.
- **Table editing and CSV import** for Units, since sales status is updated often.

Nice to have:

- Draft preview of the static site.
- Custom field UI: pick a siteplan dot by clicking on the image, and pick a frame from a thumbnail strip.
- Localization (`id` → `id`/`en`).
- Roles: a sales role that can only change Unit status.

## 14. Open questions

- Who updates unit status, and how often? This decides whether Units need a separate role and CSV import (brief,
  decision 8).
- Does the project name or logo still change? It affects `Site settings`.
- English version: now, later, or never?
- Where will large media live (the same host as the site, or object storage/CDN)?
- Will the 3D team deliver clip sets (§10.3)? If so, the Kawasan/Cluster models switch from scene frames to clips.
