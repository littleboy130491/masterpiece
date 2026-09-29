// Site-wide settings and copy.
//
// Open decisions from BRIEF.md are called out inline. Everything marked
// PLACEHOLDER is stand-in content until the client supplies the real thing.

export const site = {
  // PLACEHOLDER: taken from the sketch file name ("DR Web Prop") until the
  // client confirms the official project name.
  name: 'DR',
  fullName: 'DR Residence',
  lang: 'id', // Decision 3: UI language. Copy is Indonesian for now.
  description: 'Kawasan ruko dan hunian. Jelajahi kawasan, cluster, fasilitas, dan tipe unit dalam 360°.',

  // Small "contoh" badges on stand-in media and data. Off: the site is presented as live.
  showPlaceholderBadges: false,

  hero: {
    // Decision 1 resolved: short video. The hero flows straight into the
    // Kawasan scroll scrub, which continues the same aerial orbit.
    eyebrow: 'Kawasan ruko & hunian',
    title: 'Satu alamat untuk usaha dan rumah.',
    // PLACEHOLDER media: the aerial render sequence encoded as video.
    teaser: '/media/hero/teaser.mp4',
    full: '/media/hero/full.mp4',
    cover: '/media/hero/cover.jpg',
  },
};

export const nav = [
  { href: '#kawasan', label: 'Kawasan' },
  { href: '#peta', label: 'Lokasi' },
  { href: '#cluster', label: 'Cluster' },
  { href: '#fasilitas', label: 'Fasilitas' },
  { href: '#tipe', label: 'Tipe' },
  { href: '#unit-update', label: 'Unit' },
];

export const statusLabels = {
  sold: 'Terjual',
  reserved: 'Dipesan',
  available: 'Tersedia',
};

// Prefix a root-relative path with the deploy base (for hosting under a subpath).
export const url = (path) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`;
