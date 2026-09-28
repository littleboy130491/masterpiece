// Unit types. The homepage grid shows at most 6 (3 per row, 2 rows); each type
// gets its own page at /tipe/<slug>/.
//
// Each type page shows ONE image sequence (a WebRotate package). Its `parts`
// (facade, then each floor) are keyframes in that sequence: choosing a part,
// by scrolling or from the panel, animates the sequence to that frame and shows
// the part's text and denah.
//
// Only Tipe 1 has real renders so far (the "Ruko Hook 01" facade orbit).
// Everything flagged `placeholder` is stand-in data or media: specs, part
// keyframes and copy, denah, and the images of Tipe 2–6 reuse Tipe 1 material.

export const MAX_TYPES = 6;

const facadeTipe1 = {
  package: '/media/tipe-1/facade/',
  poster: '/media/tipe-1/facade/images/facade_000.jpg',
  width: 760,
  height: 570,
  firstImage: 0,
};

const denahPlaceholder = [
  { label: 'Lantai 1', image: '/media/placeholder/denah-lt1.svg' },
  { label: 'Lantai 2', image: '/media/placeholder/denah-lt2.svg' },
  { label: 'Atap', image: '/media/placeholder/denah-atap.svg' },
];

const galleryTipe1 = [
  '/media/stills/ruko-front.jpg',
  '/media/stills/ruko-34.jpg',
  '/media/stills/ruko-side.jpg',
  '/media/stills/ruko-back.jpg',
  '/media/stills/ruko-back-34.jpg',
  '/media/stills/ruko-side-2.jpg',
  '/media/stills/ruko-front-34.jpg',
];

// Parts of the sequence, in order: facade, then each floor. `frame` is the
// keyframe index in the sequence (0-based); `denah` names the matching plan.
// PLACEHOLDER: the sequence is only the facade orbit, so parts sit at evenly
// spaced angles. The client's sequence should move between parts itself (roof
// lifting off, floors separating, ...) with one keyframe per part.
const floorText = [
  'Area usaha menghadap jalan, dengan dapur, kamar mandi, gudang, dan tangga ke lantai atas.',
  'Ruang hunian: kamar tidur, ruang keluarga, dan kamar mandi, dengan bukaan ke arah jalan.',
  'Lantai tambahan untuk ruang kerja atau kamar tidur, dengan akses ke atap.',
];

const partsFor = (floors, frames = 120) => [
  {
    id: 'fasad',
    name: 'Fasad',
    kind: 'Tampak luar',
    frame: 0,
    text: 'Fasad dengan rangka kayu dan teras terbuka ke jalan cluster. Geser gambar untuk melihat setiap sisi.',
  },
  ...Array.from({ length: floors }, (_, i) => ({
    id: `lantai-${i + 1}`,
    name: `Lantai ${i + 1}`,
    kind: 'Aksonometri',
    frame: Math.round(((i + 1) * frames) / (floors + 1)),
    text: floorText[i] ?? floorText.at(-1),
    denah: `Lantai ${i + 1}`,
  })),
];

// PLACEHOLDER: 3DVista tour. Replace with the published tour URL.
const vrPlaceholder = { url: '/vr/placeholder/', placeholder: true };

function type({ n, label, image, lt, lb, bedrooms, bathrooms, floors = 2, realFacade = false }) {
  return {
    slug: `tipe-${n}`,
    name: `Tipe ${n}`,
    label,
    image,
    lt,
    lb,
    bedrooms,
    bathrooms,
    placeholder: true, // specs not yet supplied by the client
    intro:
      'Ruko dua lantai dengan area usaha di lantai dasar dan ruang hunian di atasnya. Teras depan terbuka ke jalan cluster.',
    info: [
      ['Luas tanah', `${lt} m²`],
      ['Luas bangunan', `${lb} m²`],
      ['Jumlah lantai', `${floors}`],
      ['Kamar tidur', `${bedrooms}`],
      ['Kamar mandi', `${bathrooms}`],
    ],
    sequence: { ...facadeTipe1, placeholder: !realFacade },
    parts: partsFor(floors),
    denah: denahPlaceholder,
    gallery: galleryTipe1,
    vr: vrPlaceholder,
  };
}

export const types = [
  type({ n: 1, label: 'Ruko Hook', image: '/media/stills/ruko-front-34.jpg', lt: 120, lb: 180, bedrooms: 2, bathrooms: 2, realFacade: true }),
  type({ n: 2, image: '/media/stills/ruko-34.jpg', lt: 90, lb: 150, bedrooms: 2, bathrooms: 2 }),
  type({ n: 3, image: '/media/stills/ruko-side-2.jpg', lt: 100, lb: 165, bedrooms: 3, bathrooms: 2 }),
  type({ n: 4, image: '/media/stills/ruko-front.jpg', lt: 110, lb: 170, bedrooms: 3, bathrooms: 3 }),
  type({ n: 5, image: '/media/stills/ruko-back-34.jpg', lt: 126, lb: 190, bedrooms: 3, bathrooms: 3 }),
  type({ n: 6, image: '/media/stills/ruko-side.jpg', lt: 140, lb: 240, bedrooms: 4, bathrooms: 3, floors: 3 }),
].slice(0, MAX_TYPES);

