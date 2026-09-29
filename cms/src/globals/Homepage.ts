import type { GlobalConfig, Tab } from 'payload'
import { anyone, editors } from '../access'
import { frameInRange, heading, loadPackage, placeholderInline, slugField, uniqueKeys } from '../fields'
import { globalRebuildHooks } from '../hooks/rebuild'

const image = { mimeType: { contains: 'image' } }
const video = { mimeType: { contains: 'video' } }

// Kawasan and Cluster: a pinned scroll scene with hotspots. Frames and landmarks
// are checked against the scene package picked for that section.
const sceneTab = (name: 'kawasan' | 'cluster', label: string): Tab => ({
  label,
  name,
  fields: [
    ...heading({ titleMax: 30, introMax: 160, introRequired: true }),
    {
      name: 'scene',
      type: 'relationship',
      relationTo: 'packages',
      required: true,
      filterOptions: { kind: { equals: 'scene' } },
      admin: { description: 'The frame sequence scrubbed by scrolling.' },
    },
    {
      name: 'backLabel',
      type: 'text',
      required: true,
      admin: { description: 'Button that leaves an open hotspot, e.g. "Kembali ke kawasan".' },
    },
    {
      name: 'hotspots',
      type: 'array',
      maxRows: 6,
      validate: uniqueKeys('key'),
      admin: {
        initCollapsed: true,
        description: 'Markers on the scene. Opening one turns the orbit to its frame and zooms in.',
        components: { RowLabel: '/components/RowLabel#TitleRowLabel' },
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'title', type: 'text', required: true, maxLength: 40, admin: { description: 'List item and location title.' } },
            { name: 'shortLabel', type: 'text', maxLength: 16, admin: { description: 'Marker label on the image. Defaults to the title.' } },
            slugField('key', { admin: { description: 'Unique id, e.g. area-plaza.' } }),
          ],
        },
        { name: 'text', type: 'textarea', required: true, maxLength: 240, admin: { description: 'Shown while the location is open.' } },
        {
          type: 'row',
          fields: [
            {
              name: 'landmark',
              type: 'text',
              required: true,
              admin: { description: 'Tracked landmark the marker follows (listed on the scene package).' },
              validate: async (v: unknown, { data, req }: any) => {
                const pkg = await loadPackage(data?.[name]?.scene, req)
                const marks = pkg?.landmarks ?? []
                if (!v || !marks.length || marks.includes(v as string)) return true
                return `The scene package has no landmark "${v}". Use one of: ${marks.join(', ')}.`
              },
            },
            {
              name: 'defaultFrame',
              type: 'number',
              required: true,
              min: 0,
              admin: {
                description: 'Orbit angle (frame) shown when opened. A new frame also needs a sharp detail frame (README).',
              },
              validate: async (v: unknown, { data, req }: any) => frameInRange(v, await loadPackage(data?.[name]?.scene, req)),
            },
          ],
        },
      ],
    },
  ],
})

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  admin: { group: 'Site' },
  access: { read: anyone, update: editors },
  hooks: globalRebuildHooks,
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          name: 'hero',
          fields: [
            { name: 'eyebrow', type: 'text', maxLength: 40 },
            { name: 'title', type: 'text', required: true, maxLength: 60 },
            {
              name: 'loopVideo',
              type: 'upload',
              relationTo: 'media',
              required: true,
              filterOptions: video,
              admin: {
                description:
                  'Muted background loop. 1920×1080 H.264, ≤ 12 MB. Must be the same orbit as the Kawasan scene: the hero hands over to it on scroll.',
              },
            },
            {
              name: 'cover',
              type: 'upload',
              relationTo: 'media',
              required: true,
              filterOptions: image,
              admin: { description: 'Poster shown before the loop plays, 1920×1080.' },
            },
            {
              name: 'fullVideo',
              type: 'upload',
              relationTo: 'media',
              required: true,
              filterOptions: video,
              admin: { description: 'The film behind "Play Full Video", with controls. ≤ 60 MB.' },
            },
            {
              type: 'row',
              fields: [
                { name: 'playLabel', type: 'text', required: true, defaultValue: 'Play Full Video' },
                { name: 'scrollCue', type: 'text', defaultValue: 'Gulir', admin: { description: 'Small hint at the bottom.' } },
              ],
            },
          ],
        },
        sceneTab('kawasan', 'Kawasan'),
        {
          label: 'Lokasi',
          name: 'lokasi',
          fields: [
            ...heading({ introMax: 160 }),
            {
              name: 'map',
              type: 'upload',
              relationTo: 'media',
              required: true,
              filterOptions: image,
              admin: { description: 'Static area map, at least 1600 px wide. No interaction (brief).' },
            },
            placeholderInline,
          ],
        },
        sceneTab('cluster', 'Cluster'),
        {
          label: 'Fasilitas',
          name: 'fasilitas',
          fields: [
            ...heading({ introMax: 160 }),
            {
              name: 'items',
              label: 'Facilities (in order)',
              type: 'relationship',
              relationTo: 'facilities',
              hasMany: true,
              required: true,
              minRows: 1,
              maxRows: 10,
              admin: { isSortable: true, description: '1–10 slides. Drag to reorder.' },
            },
          ],
        },
        {
          label: 'Tipe',
          name: 'tipe',
          fields: [
            ...heading({ introMax: 200 }),
            {
              name: 'items',
              label: 'Unit types (in order)',
              type: 'relationship',
              relationTo: 'unit-types',
              hasMany: true,
              required: true,
              minRows: 1,
              maxRows: 6,
              admin: {
                isSortable: true,
                description: '1–6 types, 3 per row. Only types picked here get a page on the site.',
              },
            },
          ],
        },
        {
          label: 'Unit update',
          name: 'unitUpdate',
          fields: [
            ...heading({ introMax: 200 }),
            {
              name: 'siteplan',
              type: 'upload',
              relationTo: 'media',
              required: true,
              filterOptions: image,
              admin: {
                description:
                  'The plan the dots sit on, at least 1600 px wide. Dots are % of this image: after replacing it, re-check every unit’s position.',
              },
            },
            placeholderInline,
          ],
        },
      ],
    },
  ],
}
