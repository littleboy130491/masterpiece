// Geometry of the placeholder siteplan (public/media/placeholder/siteplan.svg),
// used by scripts/build-media.mjs to draw it. The seeded unit dots in the CMS
// (cms/src/seed/units.json) line up with it. Once the client's siteplan is
// uploaded in the CMS, this file can go.

const blockRow = (y, h, ids) => [
  { id: ids[0], x: 120, w: 300 },
  { id: ids[1], x: 440, w: 300 },
  { id: ids[2], x: 860, w: 300 },
  { id: ids[3], x: 1180, w: 300 },
].map((b) => ({ ...b, y, h, units: 8, labelY: y < 300 ? y - 14 : y + h + 30 }));

export const siteplanLayout = {
  width: 1600,
  height: 1000,
  road: { y1: 150, y2: 560, h: 70, x: 760, w: 80 },
  blocks: [...blockRow(236, 150, ['A', 'B', 'C', 'D']), ...blockRow(394, 150, ['E', 'F', 'G', 'H'])],
};
