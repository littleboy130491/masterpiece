// Loads the site's current content into an empty CMS: every text, number,
// image and video that used to live in src/data/ and the components.
//
//   npm run seed            (refuses if content already exists)
//   npm run seed -- --fresh (deletes all content first; users are kept)
//
// Media files are uploaded from the site's public/media/ folder, so run
// `npm run media` in the site first.

import fs from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'
import config from '@payload-config'
import units from './units.json'

const payload = await getPayload({ config })
const context = { skipRebuild: true }
const publicDir = path.resolve(process.cwd(), process.env.SITE_PUBLIC_DIR || '../public')
const fresh = process.argv.includes('--fresh')

const collections = ['units', 'unit-types', 'facilities', 'packages', 'media'] as const

if (fresh) {
  for (const collection of collections) {
    await payload.delete({ collection, where: { id: { exists: true } }, context })
  }
} else {
  const { totalDocs } = await payload.count({ collection: 'unit-types' })
  if (totalDocs) {
    payload.logger.error('The CMS already has content. Run with --fresh to replace it.')
    process.exit(1)
  }
}

// ---- media

const uploaded = new Map<string, number>()
async function media(sitePath: string, alt: string): Promise<number> {
  const hit = uploaded.get(sitePath)
  if (hit) return hit
  const filePath = path.join(publicDir, sitePath)
  if (!fs.existsSync(filePath)) throw new Error(`Missing ${filePath}. Run "npm run media" in the site first.`)
  const doc = await payload.create({ collection: 'media', data: { alt }, filePath, context })
  uploaded.set(sitePath, doc.id)
  return doc.id
}

const still = (name: string, alt: string) => media(`/media/stills/${name}`, alt)
const ruko = {
  front: () => still('ruko-front.jpg', 'Ruko, tampak depan'),
  front34: () => still('ruko-front-34.jpg', 'Ruko, tampak depan tiga perempat'),
  r34: () => still('ruko-34.jpg', 'Ruko, tampak tiga perempat'),
  side: () => still('ruko-side.jpg', 'Ruko, tampak samping'),
  side2: () => still('ruko-side-2.jpg', 'Ruko, tampak samping lain'),
  back: () => still('ruko-back.jpg', 'Ruko, tampak belakang'),
  back34: () => still('ruko-back-34.jpg', 'Ruko, tampak belakang tiga perempat'),
}

// ---- motion packages (frame counts and landmarks are read from the folders)

const pkg = async (data: Record<string, unknown>) => (await payload.create({ collection: 'packages', data: data as any, context })).id

const kawasanScene = await pkg({ name: 'Kawasan orbit', kind: 'scene', path: '/media/scroll/kawasan/', frames: 120 })
const clusterScene = await pkg({
  name: 'Cluster (sample: reuses the Kawasan orbit)',
  kind: 'scene',
  path: '/media/scroll/kawasan/',
  frames: 120,
  placeholder: true,
})
const facadeTipe1 = await pkg({
  name: 'Tipe 1 facade orbit',
  kind: 'turntable',
  path: '/media/tipe-1/facade/',
  frames: 120,
  width: 760,
  height: 570,
  poster: '/media/tipe-1/facade/images/facade_000.jpg',
})
const facadeSample = await pkg({
  name: 'Sample sequence (Tipe 1 facade orbit)',
  kind: 'turntable',
  path: '/media/tipe-1/facade/',
  frames: 120,
  width: 760,
  height: 570,
  poster: '/media/tipe-1/facade/images/facade_000.jpg',
  placeholder: true,
})

// ---- facilities

const facilityData = [
  ['Danau & promenade', 'fac-lake.jpg'],
  ['Lapangan olahraga & kolam renang', 'fac-sport.jpg'],
  ['Pusat komersial', 'fac-commercial.jpg'],
  ['Boulevard utama', 'fac-boulevard.jpg'],
  ['Deret ruko tepi air', 'fac-plaza.jpg'],
  ['Ruang hijau', 'fac-green.jpg'],
]
const facilities: number[] = []
for (const [title, file] of facilityData) {
  const image = await still(file, title)
  const doc = await payload.create({ collection: 'facilities', data: { title, image, placeholder: true }, context })
  facilities.push(doc.id)
}

// ---- unit types

const floorPlans = [
  { label: 'Lantai 1', image: await media('/media/placeholder/denah-lt1.svg', 'Denah lantai 1') },
  { label: 'Lantai 2', image: await media('/media/placeholder/denah-lt2.svg', 'Denah lantai 2') },
  { label: 'Atap', image: await media('/media/placeholder/denah-atap.svg', 'Denah atap') },
]
const gallery = [
  await ruko.front(),
  await ruko.r34(),
  await ruko.side(),
  await ruko.back(),
  await ruko.back34(),
  await ruko.side2(),
  await ruko.front34(),
]

const floorText = [
  'Area usaha menghadap jalan, dengan dapur, kamar mandi, gudang, dan tangga ke lantai atas.',
  'Ruang hunian: kamar tidur, ruang keluarga, dan kamar mandi, dengan bukaan ke arah jalan.',
  'Lantai tambahan untuk ruang kerja atau kamar tidur, dengan akses ke atap.',
]

// Sample keyframes: the only sequence is the facade orbit, so parts sit at evenly spaced angles.
const partsFor = (floors: number, frames = 120) => [
  {
    key: 'fasad',
    name: 'Fasad',
    frame: 0,
    text: 'Fasad dengan rangka kayu dan teras terbuka ke jalan cluster. Geser gambar untuk melihat setiap sisi.',
  },
  ...Array.from({ length: floors }, (_, i) => {
    const plan = `Lantai ${i + 1}`
    return {
      key: `lantai-${i + 1}`,
      name: plan,
      frame: Math.round(((i + 1) * frames) / (floors + 1)),
      text: floorText[i] ?? floorText[floorText.length - 1],
      floorPlan: floorPlans.some((f) => f.label === plan) ? plan : undefined,
    }
  }),
]

const typeData = [
  { n: 1, label: 'Ruko Hook', image: ruko.front34, lt: 120, lb: 180, bedrooms: 2, bathrooms: 2, real: true },
  { n: 2, image: ruko.r34, lt: 90, lb: 150, bedrooms: 2, bathrooms: 2 },
  { n: 3, image: ruko.side2, lt: 100, lb: 165, bedrooms: 3, bathrooms: 2 },
  { n: 4, image: ruko.front, lt: 110, lb: 170, bedrooms: 3, bathrooms: 3 },
  { n: 5, image: ruko.back34, lt: 126, lb: 190, bedrooms: 3, bathrooms: 3 },
  { n: 6, image: ruko.side, lt: 140, lb: 240, bedrooms: 4, bathrooms: 3, floors: 3 },
]
const types: number[] = []
for (const t of typeData) {
  const floors = t.floors ?? 2
  const doc = await payload.create({
    collection: 'unit-types',
    context,
    data: {
      slug: `tipe-${t.n}`,
      name: `Tipe ${t.n}`,
      label: t.label,
      placeholder: true,
      cardImage: await t.image(),
      landArea: t.lt,
      buildingArea: t.lb,
      floors,
      bedrooms: t.bedrooms,
      bathrooms: t.bathrooms,
      intro:
        'Ruko dua lantai dengan area usaha di lantai dasar dan ruang hunian di atasnya. Teras depan terbuka ke jalan cluster.',
      sequence: t.real ? facadeTipe1 : facadeSample,
      parts: partsFor(floors),
      floorPlans,
      gallery,
      vr: { url: '/vr/placeholder/', mode: 'embedded' },
    },
  })
  types.push(doc.id)
}

// ---- units

for (const u of units as { id: string; x: number; y: number; status: 'sold' | 'reserved' | 'available' }[]) {
  await payload.create({ collection: 'units', data: { unitId: u.id, x: u.x, y: u.y, status: u.status }, context })
}

// ---- globals

await payload.updateGlobal({
  slug: 'site-settings',
  context,
  data: {
    name: 'DR',
    fullName: 'DR Residence',
    language: 'id',
    seo: { description: 'Kawasan ruko dan hunian. Jelajahi kawasan, cluster, fasilitas, dan tipe unit dalam 360°.' },
    nav: [
      { label: 'Kawasan', section: 'kawasan' },
      { label: 'Lokasi', section: 'peta' },
      { label: 'Cluster', section: 'cluster' },
      { label: 'Fasilitas', section: 'fasilitas' },
      { label: 'Tipe', section: 'tipe' },
      { label: 'Unit', section: 'unit-update' },
    ],
    statusLabels: { available: 'Tersedia', reserved: 'Dipesan', sold: 'Terjual' },
    footer: { copyright: '© {year} {fullName}' },
    theme: { accent: '#34425e', available: '#1f9a57', reserved: '#f0b400', sold: '#e0442e' },
    dev: { showPlaceholderBadges: false },
  },
})

await payload.updateGlobal({
  slug: 'homepage',
  context,
  data: {
    hero: {
      eyebrow: 'Kawasan ruko & hunian',
      title: 'Satu alamat untuk usaha dan rumah.',
      loopVideo: await media('/media/hero/teaser.mp4', 'Orbit udara kawasan'),
      cover: await media('/media/hero/cover.jpg', 'Pemandangan udara kawasan'),
      fullVideo: await media('/media/hero/full.mp4', 'Film kawasan'),
      playLabel: 'Play Full Video',
      scrollCue: 'Gulir',
    },
    kawasan: {
      title: 'Kawasan',
      intro: 'Gulir untuk mengelilingi kawasan. Klik penanda untuk menuju setiap titik.',
      scene: kawasanScene,
      backLabel: 'Kembali ke kawasan',
      hotspots: [
        {
          key: 'area-plaza',
          landmark: 'plaza',
          defaultFrame: 30,
          title: 'Plaza & boulevard ruko',
          shortLabel: 'Plaza',
          text: 'Poros tengah kawasan yang membelah empat blok ruko. Plaza terbuka di ujungnya menghadap danau.',
        },
        {
          key: 'area-commercial',
          landmark: 'commercial',
          defaultFrame: 111,
          title: 'Pusat komersial',
          shortLabel: 'Komersial',
          text: 'Bangunan komersial utama kawasan, dikelilingi area parkir dan jalur pejalan kaki.',
        },
        {
          key: 'area-offices',
          landmark: 'offices',
          defaultFrame: 3,
          title: 'Perkantoran',
          shortLabel: 'Kantor',
          text: 'Gedung perkantoran di sisi jalan utama, dekat akses masuk kawasan.',
        },
        {
          key: 'area-lakeside',
          landmark: 'lakeside',
          defaultFrame: 81,
          title: 'Tepi danau',
          shortLabel: 'Danau',
          text: 'Promenade di sepanjang danau, terhubung langsung dengan deretan ruko sisi selatan.',
        },
      ],
    },
    lokasi: {
      title: 'Lokasi',
      intro: 'Posisi proyek di dalam kawasan yang lebih besar.',
      map: await media('/media/placeholder/area-map.svg', 'Peta kawasan dengan lokasi proyek ditandai'),
      placeholder: true,
    },
    cluster: {
      title: 'Cluster',
      intro: 'Lebih dekat ke cluster ruko. Gulir untuk mengelilingi blok, klik penanda untuk menuju setiap titik.',
      scene: clusterScene,
      backLabel: 'Kembali ke cluster',
      hotspots: [
        {
          key: 'cluster-plaza',
          landmark: 'plaza',
          defaultFrame: 30,
          title: 'Plaza cluster',
          shortLabel: 'Plaza',
          text: 'Ruang terbuka di tengah cluster, titik temu antara blok utara dan selatan.',
        },
        {
          key: 'cluster-lakeside',
          landmark: 'lakeside',
          defaultFrame: 81,
          title: 'Ruko hook tepi danau',
          shortLabel: 'Ruko hook',
          text: 'Unit sudut di ujung blok dengan dua muka bangunan dan pemandangan danau.',
        },
        {
          key: 'cluster-commercial',
          landmark: 'commercial',
          defaultFrame: 111,
          title: 'Akses ke pusat komersial',
          shortLabel: 'Akses komersial',
          text: 'Cluster terhubung langsung ke pusat komersial melalui boulevard utama.',
        },
      ],
    },
    fasilitas: {
      title: 'Ruang bersama',
      intro: 'Fasilitas yang melengkapi kawasan, dari tepi danau hingga pusat komersial.',
      items: facilities,
    },
    tipe: {
      title: 'Pilih tipe',
      intro:
        'Bandingkan luas tanah, luas bangunan, dan jumlah kamar. Buka satu tipe untuk menjelajahi fasad dan setiap lantainya.',
      items: types,
    },
    unitUpdate: {
      title: 'Status unit',
      intro: 'Status terbaru setiap unit di siteplan.',
      siteplan: await media('/media/placeholder/siteplan.svg', 'Siteplan cluster'),
      placeholder: true,
    },
  },
})

// Interface text: saving once stores the defaults, so they show in the API.
await payload.updateGlobal({ slug: 'labels', data: {}, context })

payload.logger.info(
  `Seeded ${uploaded.size} media files, 4 packages, ${facilities.length} facilities, ${types.length} unit types, ${units.length} units and 3 globals.`,
)
process.exit(0)
