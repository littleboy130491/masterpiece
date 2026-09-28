# DR Property Website — Brief

Source: client sketch `DR Web Prop.jpg.jpeg`. Project name is taken from that file until the client confirms the official name.

This is a marketing site for one residential development. A visitor lands on a single scrolling homepage, moves from the hero down through the area, the cluster, facilities, unit types, and availability, then opens a dedicated page for any unit type.

For reference: https://malinowskiego.com/

## Goal

Let a buyer understand the development in this order:

1. See the place (hero film or parallax cover).
2. Spin the wider area, then the cluster, in 360°.
3. Place the project on a static area map.
4. Browse facilities.
5. Compare unit types.
6. Check which units are sold, reserved, or available.
7. Open one type and study its facade and each floor in 360°, with plans, gallery, and VR.

## Homepage

One long page. Sections stack in this order.

### 1. Hero — pick one treatment

The client offers two hero options. Both include **Play Full Video**.

| Option            | What shows                           | Action                                      |
| ----------------- | ------------------------------------ | ------------------------------------------- |
| A. Short video    | A short hero film                    | **Play Full Video** plays the full film     |
| B. Parallax cover | A cover image with a parallax effect | **Play Full Video** is a link on that cover |

Confirm which option ships. The sketch treats them as alternatives, not as two heroes on the same page.

### 2. Area turntable — Kawasan

- 360° image sequence of the wider development area.
- Built with [WebRotate 360](https://www.webrotate360.com/).
- Hotspot annotations on the sequence.
- Clicking a hotspot opens info plus an image.
- Drag or scroll left/right on the viewer to rotate the sequence. Vertical scroll continues down the page.

### 3. Area map

- A single 2D image showing where the project sits inside the larger area.
- No interaction. No zoom, no pins that click, no map provider.

### 4. Cluster turntable

- Same pattern as the area turntable: 360° image sequence, annotations, click opens info plus an image.
- Also WebRotate 360.
- Left/right gesture rotates; vertical scroll moves the page.

### 5. Facilities

- Image carousel.
- Maximum 10 slides.

### 6. Unit types

- Grid of type cards.
- 3 cards per row.
- At most 2 rows (6 types).
- Each card is an image with text underneath:
  - **LT** — land area (luas tanah)
  - **LB** — building area (luas bangunan)
  - Bedroom count
  - Bathroom count
- Clicking a card opens that type’s page.

### 7. Unit update

- A siteplan image.
- Colored dots mark unit status:
  - Red — Sold
  - Yellow — Reserved
  - Green — Available
- The back action from a type page returns the visitor to this section.

The sketch draws the dots on the image. It does not say a dot opens a unit. Treat the siteplan as a status display until the client says otherwise.

## Unit type page

One page per type (the sketch uses **Tipe 1** as the pattern). Reaching it is by clicking that type on the homepage.

Two columns.

**Left column, revealed by scrolling down:**

1. On arrival: 360° turntable of the **facade**.
2. Next: 360° axonometric of **floor 1**.
3. Then: 360° axonometric of **floor 2**.
4. Further floors follow the same way, one after another.

**Right column, fixed while the left column scrolls:**

- **Prop info** — property facts for this type.
- **Denah** — floor-plan thumbnails (the sketch shows three).
- **Gallery** and **VR** links. These stay available while scrolling.

**Turntables on this page**

- WebRotate 360 image sequences.
- Left/right scroll or drag rotates the frames.
- The sketch does not put hotspots on the facade or floor turntables. Hotspots are specified only for the area and cluster turntables on the homepage.

**VR**

- [3DVista](https://www.3dvista.com/).
- Opened from the VR link on the type page.

**Back**

- Returns to the Unit update section on the homepage.

## Interaction rules

- Page scroll is vertical.
- A turntable rotates on horizontal drag or horizontal scroll over the viewer itself.
- Area and cluster hotspots open a panel with text and an image.
- Type cards navigate to `/` a type page (one URL per type).
- Gallery and VR stay reachable for the whole type page.
- Property info stays visible for the whole type page.
- Back from a type page lands on Unit update.

## Tools the client already chose

| Use                  | Tool                               |
| -------------------- | ---------------------------------- |
| Every 360° turntable | WebRotate 360 (`webrotate360.com`) |
| VR tours             | 3DVista (`3dvista.com`)            |

Do not replace these with a custom 360 viewer or another VR host unless the client changes the decision.

## Content the client supplies

**Homepage**

- Hero teaser film and full film, or the parallax cover art, plus the full film.
- Area 360 sequence, hotspot positions, and the info + image for each hotspot.
- Static area-map image.
- Cluster 360 sequence, hotspot positions, and the info + image for each hotspot.
- Up to 10 facility images.
- Up to 6 type cards: image, LT, LB, bedrooms, bathrooms.
- Siteplan image and a dot position + status (sold / reserved / available) per unit.

**Each type page**

- Facade 360 sequence.
- One axonometric 360 sequence per floor, in floor order.
- Property info copy.
- Floor-plan images (denah).
- Gallery images.
- 3DVista VR tour link or published tour.

## Out of scope (not on the sketch)

- Accounts, login, inquiry forms, mortgage calculators, or a CMS is not specified.
- Search, filters, and comparison of types are not specified.
- Clicking a siteplan dot to open a unit is not specified.
- Map zoom or an interactive map is explicitly excluded.
- Mobile layout is not drawn. The desktop order above is the spec; small screens still need the same sections, a usable 360 viewer, and a readable type page.

## Decisions still needed

1. Hero for v1: short video, or parallax cover? Both keep Play Full Video.
2. Where Play Full Video opens: overlay on the page, or a separate view.
3. Official project name, language of the UI (the notes are Indonesian), and whether copy is Indonesian only.
4. How many clusters, types, and floors exist, if that differs from the maximums drawn (1 cluster turntable, 6 type cards, floors continuing past 2).
5. Whether denah thumbnails jump to the matching floor turntable.
6. Whether Gallery is a lightbox, a strip, or its own view.
7. Whether VR opens embedded or on 3DVista.
8. Who updates sold / reserved / available, and whether that is a new siteplan image or a list of dots the site renders.
9. Domain, hosting, and who produces the WebRotate and 3DVista packages.

## Build order

1. Homepage frame in the section order above, with real layout and placeholder media.
2. WebRotate on area, cluster, and (later) type views, including left/right rotate vs vertical page scroll.
3. Hotspot popover (info + image) on area and cluster only.
4. Type grid and type page with the sticky right column.
5. Facade, then one axonometric turntable per floor.
6. Gallery and 3DVista links.
7. Siteplan with status dots, and back-navigation from the type page to that section.
8. Hero, once the video-vs-parallax choice is made.
