import type { Field, GlobalAfterReadHook, GlobalConfig } from 'payload'
import { anyone, editors } from '../access'
import { globalRebuildHooks } from '../hooks/rebuild'

// Every small piece of interface text: buttons, spec abbreviations, badges and
// the labels screen readers hear. Section titles and intros live on the Homepage;
// this is the rest. Words in {braces} are filled in by the site.

const t = (name: string, defaultValue: string, description?: string): Field => ({
  name,
  type: 'text',
  required: true,
  defaultValue,
  admin: { description, width: '50%' },
})

const group = (name: string, label: string, description: string, fields: Field[]): Field => ({
  name,
  label,
  type: 'group',
  admin: { description },
  fields: [{ type: 'row', fields }],
})

// Fill any empty label with its default, so text added to this file later shows
// up on the site before anyone has re-saved Interface text.
const withDefaults: GlobalAfterReadHook = ({ doc }) => {
  for (const g of Labels.fields) {
    if (g.type !== 'group' || !('name' in g)) continue
    const values = (doc[g.name] ??= {})
    for (const row of g.fields) {
      for (const f of row.type === 'row' ? row.fields : [row]) {
        if ('name' in f && 'defaultValue' in f && (values[f.name] == null || values[f.name] === '')) values[f.name] = f.defaultValue
      }
    }
  }
  return doc
}

export const Labels: GlobalConfig = {
  slug: 'labels',
  label: 'Interface text',
  admin: { group: 'Site', description: 'Buttons, small labels and screen-reader text used across the site.' },
  access: { read: anyone, update: editors },
  hooks: { ...globalRebuildHooks, afterRead: [withDefaults] },
  fields: [
    group('header', 'Header', 'Top bar.', [
      t('homeLink', '{fullName} — beranda', 'Screen-reader name of the logo link.'),
      t('navLabel', 'Bagian halaman', 'Screen-reader name of the section links.'),
      t('backToUnits', 'Kembali ke Unit Update', 'Back link on type pages.'),
    ]),
    group('scene', 'Kawasan & Cluster scenes', 'Buttons inside the scroll scenes.', [
      t('prevLocation', 'Lokasi sebelumnya', 'Screen reader.'),
      t('nextLocation', 'Lokasi berikutnya', 'Screen reader.'),
    ]),
    group('facilities', 'Fasilitas carousel', '', [
      t('listLabel', 'Galeri fasilitas', 'Screen reader.'),
      t('prev', 'Fasilitas sebelumnya', 'Screen reader.'),
      t('next', 'Fasilitas berikutnya', 'Screen reader.'),
    ]),
    group('specs', 'Specs', 'Used on type cards, type pages and the phone bar.', [
      t('areaUnit', 'm²'),
      t('cardLandArea', 'LT', 'Type card.'),
      t('cardBuildingArea', 'LB', 'Type card.'),
      t('cardBedrooms', 'K. tidur', 'Type card.'),
      t('cardBathrooms', 'K. mandi', 'Type card.'),
      t('factLandArea', 'LT', 'Type page, top facts.'),
      t('factBuildingArea', 'LB', 'Type page, top facts.'),
      t('factBedrooms', 'KT', 'Type page, top facts.'),
      t('factBathrooms', 'KM', 'Type page, top facts.'),
      t('rowLandArea', 'Luas tanah', 'Type page, info rows.'),
      t('rowBuildingArea', 'Luas bangunan', 'Type page, info rows.'),
      t('rowFloors', 'Jumlah lantai', 'Type page, info rows.'),
      t('rowBedrooms', 'Kamar tidur', 'Type page, info rows.'),
      t('rowBathrooms', 'Kamar mandi', 'Type page, info rows.'),
    ]),
    group('typePage', 'Type page', '', [
      t('galleryButton', 'Gallery'),
      t('vrButton', 'VR'),
      t('galleryTitle', '{name} — Galeri', 'Title bar of the gallery lightbox.'),
      t('floorPlanTitle', '{name} — Denah', 'Title bar of the floor plan lightbox.'),
      t('vrTitle', '{name} — Tur VR', 'Title bar of the VR overlay.'),
      t('floorPlanCaption', 'Denah {label}', 'Under the floor plan beside the viewer.'),
      t('openFloorPlan', 'Buka denah {label}', 'Screen reader.'),
      t('floorPlansLabel', 'Denah', 'Screen reader.'),
      t('partsLabel', 'Bagian', 'Screen reader: the part list.'),
      t('infoLabel', 'Informasi {name}', 'Screen reader: the info panel.'),
      t('dockLabel', '{name} ringkas', 'Screen reader: the bottom bar on phones.'),
      t('viewerLabel', '{name}, fasad dan lantai', 'Screen reader: the 360° viewer.'),
      {
        name: 'defaultDescription',
        type: 'textarea',
        required: true,
        defaultValue: '{name}: fasad dan setiap lantai dalam 360°, denah, galeri, dan tur VR.',
        admin: { description: 'Meta description of a type page without its own SEO description.' },
      },
    ]),
    group('turntable', '360° viewer', '', [
      t('roleDescription', 'penampil 360°', 'Screen reader: what kind of control the viewer is.'),
      t('rotateLeft', 'Putar ke kiri', 'Screen reader.'),
      t('rotateRight', 'Putar ke kanan', 'Screen reader.'),
      t('viewerHint', '{label}, tampilan 360°. Gunakan panah kiri dan kanan untuk memutar.', 'Screen reader.'),
      {
        name: 'licenseNotice',
        type: 'textarea',
        required: true,
        defaultValue:
          'Tampilan 360° ini aktif setelah lisensi WebRotate 360 PRO dipasang. Versi gratis hanya memuat satu viewer per halaman.',
        admin: { description: 'Shown only if a page has more than one viewer without a WebRotate license.' },
      },
    ]),
    group('units', 'Unit update', '', [t('siteplanLabel', 'Status unit', 'Screen reader: the list of dots.')]),
    group('overlay', 'Overlays', 'Lightbox, video and VR overlay.', [
      t('close', 'Tutup', 'Screen reader.'),
      t('prev', 'Sebelumnya', 'Screen reader.'),
      t('next', 'Berikutnya', 'Screen reader.'),
      t('openInNewTab', 'Buka di tab baru'),
    ]),
    group('badges', 'Placeholder badges', 'Shown on placeholder content while badges are on (Site settings → Developer).', [
      t('sequence', 'Sekuens contoh'),
      t('map', 'Peta contoh'),
      t('image', 'Gambar contoh'),
      t('data', 'Data contoh'),
      t('siteplan', 'Siteplan contoh'),
    ]),
    group('notFound', 'Page not found (404)', '', [
      t('title', 'Halaman tidak ditemukan'),
      t('text', 'Alamat ini tidak ada atau sudah dipindahkan.'),
      t('button', 'Kembali ke beranda'),
    ]),
  ],
}
