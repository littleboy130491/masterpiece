// Facilities carousel (CMS: Homepage → Fasilitas picks and orders the Facilities).
// The brief caps it at 10 slides; the CMS enforces that, and extra entries are dropped here too.

import content from './content.json';

export const MAX_FACILITIES = 10;

const { fasilitas } = content.homepage;

export const facilitiesSection = { title: fasilitas.title, intro: fasilitas.intro };

export const facilities = fasilitas.items
  .map((f) => ({ title: f.title, image: f.image.src, alt: f.image.alt || f.title, placeholder: f.placeholder }))
  .slice(0, MAX_FACILITIES);
