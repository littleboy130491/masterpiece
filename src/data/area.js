// Kawasan and Cluster scroll scenes, and the static area map.
//
// A scene's `base` is a folder built by scripts/build-media.mjs (buildScrollScene):
// frames in two sizes plus manifest.json. Each hotspot names a `track`, a landmark
// whose per-frame position is in that manifest, and a default angle `frame`
// (0-based frame of the scene). Opening a hotspot fast-forwards the orbit to that
// angle while zooming in on it, showing `title` + `text`. `short` is the marker
// label on the image. The default frames were picked where each landmark sits
// well in view (plaza is centred in every frame; 30 is a three-quarter view).

export const area = {
  title: 'Kawasan',
  intro: 'Gulir untuk mengelilingi kawasan. Klik penanda untuk menuju setiap titik.',
  // Continues from the hero video (same orbit), see src/components/ScrollScene.astro.
  scene: { base: '/media/scroll/kawasan/' },
  // PLACEHOLDER copy. Positions are tracked from the renders (scripts/track-hotspots.mjs).
  hotspots: {
    'area-plaza': {
      track: 'plaza',
      frame: 30,
      title: 'Plaza & boulevard ruko',
      short: 'Plaza',
      text: 'Poros tengah kawasan yang membelah empat blok ruko. Plaza terbuka di ujungnya menghadap danau.',
    },
    'area-commercial': {
      track: 'commercial',
      frame: 111,
      title: 'Pusat komersial',
      short: 'Komersial',
      text: 'Bangunan komersial utama kawasan, dikelilingi area parkir dan jalur pejalan kaki.',
    },
    'area-offices': {
      track: 'offices',
      frame: 3,
      title: 'Perkantoran',
      short: 'Kantor',
      text: 'Gedung perkantoran di sisi jalan utama, dekat akses masuk kawasan.',
    },
    'area-lakeside': {
      track: 'lakeside',
      frame: 81,
      title: 'Tepi danau',
      short: 'Danau',
      text: 'Promenade di sepanjang danau, terhubung langsung dengan deretan ruko sisi selatan.',
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
  scene: { base: '/media/scroll/kawasan/', placeholder: true },
  hotspots: {
    'cluster-plaza': {
      track: 'plaza',
      frame: 30,
      title: 'Plaza cluster',
      short: 'Plaza',
      text: 'Ruang terbuka di tengah cluster, titik temu antara blok utara dan selatan.',
    },
    'cluster-lakeside': {
      track: 'lakeside',
      frame: 81,
      title: 'Ruko hook tepi danau',
      short: 'Ruko hook',
      text: 'Unit sudut di ujung blok dengan dua muka bangunan dan pemandangan danau.',
    },
    'cluster-commercial': {
      track: 'commercial',
      frame: 111,
      title: 'Akses ke pusat komersial',
      short: 'Akses komersial',
      text: 'Cluster terhubung langsung ke pusat komersial melalui boulevard utama.',
    },
  },
};
