// Unit update: siteplan image (CMS: Homepage → Unit update) and one status dot per
// unit (CMS: Units). Dot positions are percentages of the siteplan image.

import content from './content.json';

const { unitUpdate } = content.homepage;

export const unitsSection = { title: unitUpdate.title, intro: unitUpdate.intro };

export const siteplan = {
  image: unitUpdate.siteplan.src,
  alt: unitUpdate.siteplan.alt,
  width: unitUpdate.siteplan.width || 1600,
  height: unitUpdate.siteplan.height || 1000,
  placeholder: unitUpdate.placeholder,
};

export const units = content.units.map((u) => ({ id: u.unitId, x: u.x, y: u.y, status: u.status }));
