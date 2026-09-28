// Facilities carousel. The brief caps it at 10 slides; extra entries are dropped.
// PLACEHOLDER: images are crops of the aerial renders; titles describe what they show.

export const MAX_FACILITIES = 10;

export const facilities = [
  { title: 'Danau & promenade', image: '/media/stills/fac-lake.jpg' },
  { title: 'Lapangan olahraga & kolam renang', image: '/media/stills/fac-sport.jpg' },
  { title: 'Pusat komersial', image: '/media/stills/fac-commercial.jpg' },
  { title: 'Boulevard utama', image: '/media/stills/fac-boulevard.jpg' },
  { title: 'Deret ruko tepi air', image: '/media/stills/fac-plaza.jpg' },
  { title: 'Ruang hijau', image: '/media/stills/fac-green.jpg' },
].slice(0, MAX_FACILITIES);
