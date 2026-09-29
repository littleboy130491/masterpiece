// Unit types (CMS: Unit types, picked and ordered on Homepage → Tipe). The homepage
// grid shows at most 6 (3 per row, 2 rows); each picked type gets its own page at
// /tipe/<slug>/.
//
// Each type page shows ONE image sequence (a WebRotate package). Its `parts`
// (facade, then each floor) are keyframes in that sequence: choosing a part,
// by scrolling or from the panel, animates the sequence to that frame and shows
// the part's text and denah.

import content from './content.json';

export const MAX_TYPES = 6;

const { homepage, labels } = content;
const { specs } = labels;

export const typesSection = { title: homepage.tipe.title, intro: homepage.tipe.intro };

const area = (n) => `${n} ${specs.areaUnit}`;

function type(t) {
  return {
    slug: t.slug,
    name: t.name,
    label: t.label,
    image: t.cardImage.src,
    imageAlt: t.cardImage.alt,
    lt: t.landArea,
    lb: t.buildingArea,
    bedrooms: t.bedrooms,
    bathrooms: t.bathrooms,
    floors: t.floors,
    placeholder: t.placeholder,
    intro: t.intro,
    // Spec rows come from the numbers; `infoRows` adds anything else.
    info: [
      [specs.rowLandArea, area(t.landArea)],
      [specs.rowBuildingArea, area(t.buildingArea)],
      [specs.rowFloors, `${t.floors}`],
      [specs.rowBedrooms, `${t.bedrooms}`],
      [specs.rowBathrooms, `${t.bathrooms}`],
      ...(t.infoRows ?? []).map((r) => [r.label, r.value]),
    ],
    sequence: {
      package: t.sequence.path,
      poster: t.sequence.poster,
      width: t.sequence.width,
      height: t.sequence.height,
      firstImage: t.sequence.firstImage ?? 0,
      placeholder: t.sequence.placeholder,
    },
    parts: t.parts.map((p) => ({ id: p.key, name: p.name, frame: p.frame, text: p.text, denah: p.floorPlan })),
    denah: (t.floorPlans ?? []).map((d) => ({ label: d.label, image: d.image.src, alt: d.image.alt })),
    gallery: (t.gallery ?? []).map((g) => ({ src: g.src, alt: g.alt })),
    vr: { url: t.vr?.url, mode: t.vr?.mode || 'embedded' },
    seo: t.seo ?? {},
  };
}

export const types = homepage.tipe.items.map(type).slice(0, MAX_TYPES);
