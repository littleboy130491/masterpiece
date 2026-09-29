// Pulls all site content from the Payload CMS (cms/) into the static build:
//
//   src/data/content.json   every global and collection the site uses
//   public/uploads/         every image and video those reference
//
//   node scripts/pull-content.mjs            keep the last snapshot if the CMS is down
//   node scripts/pull-content.mjs --strict   fail if the CMS is down (use for deploys)
//
// CMS_URL defaults to http://localhost:3100 (cms/ `npm run dev`).

import { existsSync } from 'node:fs';
import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const CMS = (process.env.CMS_URL || 'http://localhost:3100').replace(/\/$/, '');
const STRICT = process.argv.includes('--strict');
const SNAPSHOT = 'src/data/content.json';
const UPLOADS = 'public/uploads';
const UPLOADS_URL = '/uploads/';

async function get(route) {
  const res = await fetch(`${CMS}/api/${route}`);
  if (!res.ok) throw new Error(`${route}: HTTP ${res.status}`);
  return res.json();
}

let content;
try {
  const [settings, labels, homepage, units] = await Promise.all([
    get('globals/site-settings?depth=1'),
    get('globals/labels?depth=0'),
    get('globals/homepage?depth=2'),
    get('units?depth=0&pagination=false&sort=unitId'),
  ]);
  content = { settings, labels, homepage, units: units.docs };
} catch (err) {
  const code = err.cause?.code ?? err.cause?.errors?.[0]?.code;
  const reason = code === 'ECONNREFUSED' ? `nothing is listening at ${CMS}` : err.message;
  if (STRICT || !existsSync(SNAPSHOT)) {
    console.error(`content: can't reach the CMS (${reason}).`);
    console.error('  Start it with `npm run cms` (or set CMS_URL), then try again.');
    process.exit(1);
  }
  console.warn(`content: can't reach the CMS (${reason}); building with the last snapshot in ${SNAPSHOT}.`);
  process.exit(0);
}

// Media: download each file once, and point the content at the local copy.
const files = new Map(); // filename -> { url, filesize }
const DROP = new Set(['id', 'createdAt', 'updatedAt', 'globalType', 'thumbnailURL', 'sizes', 'focalX', 'focalY', 'note']);

function clean(value) {
  if (Array.isArray(value)) return value.map(clean);
  if (!value || typeof value !== 'object') return value;
  if (value.filename && value.mimeType && value.url) {
    files.set(value.filename, { url: value.url, filesize: value.filesize });
    return {
      src: UPLOADS_URL + encodeURIComponent(value.filename),
      alt: value.alt ?? '',
      mimeType: value.mimeType,
      width: value.width ?? null,
      height: value.height ?? null,
    };
  }
  return Object.fromEntries(
    Object.entries(value)
      .filter(([k]) => !DROP.has(k))
      .map(([k, v]) => [k, clean(v)]),
  );
}

content = clean(content);

await mkdir(UPLOADS, { recursive: true });
let fetched = 0;
for (const [name, { url, filesize }] of files) {
  const file = path.join(UPLOADS, name);
  if (existsSync(file) && (await stat(file)).size === filesize) continue;
  const res = await fetch(new URL(url, CMS));
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  await writeFile(file, Buffer.from(await res.arrayBuffer()));
  fetched++;
}
// Remove uploads nothing points at any more.
let removed = 0;
for (const name of await readdir(UPLOADS)) {
  if (!files.has(name)) {
    await rm(path.join(UPLOADS, name));
    removed++;
  }
}

await writeFile(SNAPSHOT, JSON.stringify(content, null, 2) + '\n');
console.log(`content: pulled from ${CMS}; ${files.size} media files (${fetched} downloaded, ${removed} removed).`);
