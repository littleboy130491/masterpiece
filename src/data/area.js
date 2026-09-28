// Kawasan and Cluster scroll scenes, and the static area map.
//
// A scene's `base` is a folder built by scripts/build-media.mjs (buildScrollScene):
// frames in two sizes plus manifest.json. Each hotspot names a `track`, a landmark
// whose per-frame position is in that manifest. Opening a hotspot flies the scene
// to its `view` (full-screen background, 16:9, ideally 1920px or wider) and shows
// `title` + `text` there. `short` is the marker label on the image.
//
// PLACEHOLDER views: close crops of the aerial renders (scripts/build-media.mjs,
// buildLocations). Replace with a view per location from the client, then set
// `viewsPlaceholder: false` on the scene.

export const area = {
  title: 'Kawasan',
  intro: 'Gulir untuk mengelilingi kawasan. Klik penanda untuk menuju setiap titik.',
  // Continues from the hero video (same orbit), see src/components/ScrollScene.astro.
  scene: { base: '/media/scroll/kawasan/', viewsPlaceholder: true },
  // PLACEHOLDER copy. Positions are tracked from the renders (scripts/track-hotspots.mjs).
  hotspots: {
    'area-plaza': {
      track: 'plaza',
      title: 'Plaza & boulevard ruko',
      short: 'Plaza',
      text: 'Poros tengah kawasan yang membelah empat blok ruko. Plaza terbuka di ujungnya menghadap danau.',
      view: '/media/locations/plaza.jpg',
    },
    'area-commercial': {
      track: 'commercial',
      title: 'Pusat komersial',
      short: 'Komersial',
      text: 'Bangunan komersial utama kawasan, dikelilingi area parkir dan jalur pejalan kaki.',
      view: '/media/locations/commercial.jpg',
    },
    'area-offices': {
      track: 'offices',
      title: 'Perkantoran',
      short: 'Kantor',
      text: 'Gedung perkantoran di sisi jalan utama, dekat akses masuk kawasan.',
      view: '/media/locations/offices.jpg',
    },
    'area-lakeside': {
      track: 'lakeside',
      title: 'Tepi danau',
      short: 'Danau',
      text: 'Promenade di sepanjang danau, terhubung langsung dengan deretan ruko sisi selatan.',
      view: '/media/locations/lakeside.jpg',
    },
  },
};

export const areaMap = {
  title: 'Lokasi',
  intro: 'Posisi proyek di dalam kawasan yang lebih besar.',
  // PLACEHOLDER: drawn stand-in. Replace with the client's 2D map image.
  image: '/media/placeholder/area-map.svg',
  width: 1600,
  height: 900,
  alt: 'Peta kawasan dengan lokasi proyek ditandai',
  placeholder: true,
};

export const cluster = {
  title: 'Cluster',
  intro: 'Lebih dekat ke cluster ruko. Gulir untuk mengelilingi blok, klik penanda untuk menuju setiap titik.',
  // PLACEHOLDER: reuses the kawasan frames. When the cluster renders arrive, build
  // them with buildScrollScene('cluster', …) and point this at '/media/scroll/cluster/'
  // (and the hotspot tracks below at the cluster manifest's landmarks).
  scene: { base: '/media/scroll/kawasan/', placeholder: true, viewsPlaceholder: true },
  hotspots: {
    'cluster-plaza': {
      track: 'plaza',
      title: 'Plaza cluster',
      short: 'Plaza',
      text: 'Ruang terbuka di tengah cluster, titik temu antara blok utara dan selatan.',
      view: '/media/locations/plaza.jpg',
    },
    'cluster-lakeside': {
      track: 'lakeside',
      title: 'Ruko hook tepi danau',
      short: 'Ruko hook',
      text: 'Unit sudut di ujung blok dengan dua muka bangunan dan pemandangan danau.',
      view: '/media/locations/lakeside.jpg',
    },
    'cluster-commercial': {
      track: 'commercial',
      title: 'Akses ke pusat komersial',
      short: 'Akses komersial',
      text: 'Cluster terhubung langsung ke pusat komersial melalui boulevard utama.',
      view: '/media/locations/commercial.jpg',
    },
  },
};
