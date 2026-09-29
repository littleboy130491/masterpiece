# DR CMS (Payload)

Content for the DR property site (the Astro site one folder up). Payload 3 on Next.js, with a SQLite database
(`cms.db`) and uploads in `media/`. The site stays static: it pulls content from here at build time
(`scripts/pull-content.mjs`), and a save here can trigger that build.

## Setup

```
npm install
cp .env.example .env      # set PAYLOAD_SECRET to a long random string
npm run migrate           # create the database
npm run seed              # load the site's current content (needs `npm run media` in the site first)
npm run dev               # http://localhost:3100/admin; the first visit asks for the admin account
```

`npm run seed -- --fresh` wipes all content (not users) and loads it again.

## Where each part of the site is edited

| On the site | In the admin |
| --- | --- |
| Header wordmark or logo, favicon, page language | Site settings → General |
| Default meta description, link-preview image | Site settings → SEO & sharing |
| Header section links (label, which section) | Site settings → Navigation |
| Sold / reserved / available labels | Site settings → Unit status |
| Footer line | Site settings → Footer (`{year}`, `{fullName}` are filled in) |
| Accent colour, status dot colours | Site settings → Colours |
| Placeholder badges, analytics ID | Site settings → Developer (admins only) |
| Hero: eyebrow, title, loop video, cover, full film, button and scroll hint | Homepage → Hero |
| Kawasan: title, intro, scene, back button, hotspots | Homepage → Kawasan |
| Lokasi: title, intro, map image | Homepage → Lokasi |
| Cluster: same as Kawasan | Homepage → Cluster |
| Fasilitas: title, intro, which facilities and their order (1–10) | Homepage → Fasilitas |
| One facility slide: caption, image | Facilities |
| Tipe: title, intro, which types and their order (1–6) | Homepage → Tipe |
| A type's card and page: name, label, card image, LT/LB/floors/bedrooms/bathrooms, intro, extra info rows | Unit types → Basics |
| A type's 360° sequence and its parts (facade, floors): name, link key, keyframe, text, floor plan | Unit types → 360° sequence |
| A type's floor plans and gallery | Unit types → Floor plans & gallery |
| A type's VR tour (URL, over the page or new tab) | Unit types → VR |
| A type's browser title and meta description | Unit types → SEO |
| Unit update: title, intro, siteplan image | Homepage → Unit update |
| The dots: unit ID, status, position on the siteplan | Units |
| Every button, spec abbreviation, badge, 404 text and screen-reader label | Interface text |
| Alt text of any image | Media (each file's Alt field) |

Anything left empty that the site needs is caught when saving, with a message saying what to fix: missing required
fields, too many facilities or types, a hotspot frame or part keyframe beyond the package's frame count, a landmark
the scene doesn't track, or a part pointing at a floor plan label that doesn't exist.

**Motion packages** (Media → Motion packages) are the image sequences: the Kawasan/Cluster scroll scenes and the
WebRotate folders for the type pages. Their frames are delivered into the site's `public/media/` (see the site
README, *Media pipeline*); here you register the folder and pick it for a scene or a type. When the site folder
is next to the CMS (`SITE_PUBLIC_DIR`, default `../public`), saving a package reads its frame count, size and
landmarks from the folder.

## Roles

Set on each user (Users). Admins add users.

| Role | Can |
| --- | --- |
| Admin | Everything, including users, slugs after they're set, and Site settings → Developer |
| Editor | All content |
| Sales | Only Units (status, position, notes) |

A unit's Note is internal: it's hidden from the public API and never reaches the site.

## Updating unit status in bulk

Units → the list menu (⋯) → **Export** a CSV, change the `status` column (`available`, `reserved`, `sold`), then
**Import** it with mode *Upsert* and match field `unitId`. Rows are matched by unit ID; new IDs are added.

## Publishing

The site is rebuilt after changes (debounced, so a burst of edits or a CSV import makes one build). Set either or
both in `.env`:

- `SITE_REBUILD_COMMAND`: a shell command run from this folder, e.g.
  `npm --prefix .. run build:strict && rsync -a --delete ../dist/ user@host:/var/www/site/`
- `SITE_REBUILD_URL`: a URL to POST to, e.g. a CI or hosting deploy hook that runs `npm run build:strict`
  in the site with `CMS_URL` pointing here.

With neither set, saving only updates the CMS; run `npm run build` in the site yourself.

## Changing fields (developers)

The database schema follows the config in `src/`. After adding or changing fields:

```
npm run migrate:create <name>   # writes src/migrations/<date>_<name>.ts; commit it
npm run migrate                 # apply it locally
npm run generate:types          # refresh src/payload-types.ts
npm run generate:importmap      # only if you added admin components
```

`npm start` applies pending migrations itself. New Interface text fields need no migration of content: empty
labels fall back to their default. When a field feeds the site, map it in `src/data/*.js` in the site.

## Deploying

The CMS needs a small Node host (Node 20+) with a persistent disk for `cms.db` and `media/`:

```
npm ci && npm run build
npm start          # port 3100; put it behind HTTPS and set CMS_URL, SITE_URL in .env
```

The site itself stays on static hosting (the `.htaccess` in the site's `public/` is for Apache/LiteSpeed).
Back up `cms.db` and `media/`: they are the content. For several editors or a managed database, swap the SQLite
adapter in `src/payload.config.ts` for `@payloadcms/db-postgres` and create a fresh initial migration.

Not built yet (see `docs/CMS-CONTENT-MODEL.md`): an English version (Payload localization), a portrait loop video
for phones, an image per hotspot, click-to-place pickers for siteplan dots and keyframes, and draft preview.
