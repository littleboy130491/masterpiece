import type { CollectionConfig } from 'payload'
import { anyone, editors } from '../access'
import { frameInRange, loadPackage, lockedSlugField, placeholderField, slugField, uniqueKeys } from '../fields'
import { rebuildHooks } from '../hooks/rebuild'

const imageOnly = { mimeType: { contains: 'image' } }

// One entry per type; each gets a page at /tipe/{slug}/ once it's picked on the
// Homepage (Tipe tab), which also sets the order and the 6-type limit.
export const UnitTypes: CollectionConfig = {
  slug: 'unit-types',
  labels: { singular: 'Unit type', plural: 'Unit types' },
  admin: {
    group: 'Content',
    useAsTitle: 'name',
    defaultColumns: ['name', 'label', 'slug', 'landArea', 'buildingArea'],
    preview: (doc) => (process.env.SITE_URL ? `${process.env.SITE_URL}/tipe/${doc.slug}/` : null),
  },
  access: { read: anyone, create: editors, update: editors, delete: editors },
  hooks: rebuildHooks,
  fields: [
    lockedSlugField('slug'),
    placeholderField,
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Basics',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'name', type: 'text', required: true, admin: { description: 'e.g. "Tipe 1"' } },
                { name: 'label', type: 'text', admin: { description: 'Small accent line, e.g. "Ruko Hook"' } },
              ],
            },
            {
              name: 'cardImage',
              type: 'upload',
              relationTo: 'media',
              required: true,
              filterOptions: imageOnly,
              admin: { description: 'Homepage card. Shown at 6:5 on black with the building centred; at least 1000 px.' },
            },
            {
              type: 'row',
              fields: [
                { name: 'landArea', label: 'Land area (LT, m²)', type: 'number', required: true, min: 0 },
                { name: 'buildingArea', label: 'Building area (LB, m²)', type: 'number', required: true, min: 0 },
                { name: 'floors', type: 'number', required: true, min: 1, defaultValue: 2 },
                { name: 'bedrooms', type: 'number', required: true, min: 0 },
                { name: 'bathrooms', type: 'number', required: true, min: 0 },
              ],
            },
            {
              name: 'intro',
              type: 'textarea',
              required: true,
              maxLength: 300,
              admin: { description: 'Top of the info panel on the type page.' },
            },
            {
              name: 'infoRows',
              label: 'Extra info rows',
              type: 'array',
              admin: {
                description:
                  'Shown after the spec rows (land, building, floors, bedrooms, bathrooms), which come from the numbers above. E.g. "Daya listrik: 3.500 VA".',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', type: 'text', required: true },
                    { name: 'value', type: 'text', required: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: '360° sequence',
          description:
            'One WebRotate sequence. Scrolling the type page, or picking a part, animates the sequence to that part’s frame.',
          fields: [
            {
              name: 'sequence',
              type: 'relationship',
              relationTo: 'packages',
              required: true,
              filterOptions: { kind: { equals: 'turntable' } },
            },
            {
              name: 'parts',
              type: 'array',
              required: true,
              minRows: 1,
              validate: uniqueKeys('key'),
              admin: {
                description: 'In scroll order. The first is normally the facade, then each floor.',
                initCollapsed: true,
                components: { RowLabel: '/components/RowLabel#NameRowLabel' },
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'name', type: 'text', required: true, admin: { description: 'e.g. "Fasad", "Lantai 1"' } },
                    slugField('key', { admin: { description: 'In links, e.g. /tipe/tipe-1/#lantai-2' } }),
                    {
                      name: 'frame',
                      type: 'number',
                      required: true,
                      min: 0,
                      admin: { description: 'Keyframe in the sequence (0-based).' },
                      validate: async (v: unknown, { data, req }: any) => frameInRange(v, await loadPackage(data?.sequence, req)),
                    },
                  ],
                },
                { name: 'text', type: 'textarea', required: true, maxLength: 240 },
                {
                  name: 'floorPlan',
                  type: 'text',
                  admin: { description: 'Label of the floor plan (Floor plans tab) to show with this part, e.g. "Lantai 1".' },
                  validate: (v: unknown, { data }: any) => {
                    if (!v) return true
                    const labels = (data?.floorPlans ?? []).map((f: { label?: string }) => f.label)
                    return labels.includes(v) || `No floor plan labelled "${v}". Use one of: ${labels.join(', ') || '(none yet)'}.`
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Floor plans & gallery',
          fields: [
            {
              name: 'floorPlans',
              type: 'array',
              admin: {
                description: 'Denah thumbnails in the panel; they open in the lightbox.',
                components: { RowLabel: '/components/RowLabel#LabelRowLabel' },
              },
              fields: [
                { name: 'label', type: 'text', required: true, admin: { description: 'e.g. "Lantai 1", "Atap"' } },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                  filterOptions: imageOnly,
                  admin: { description: 'Portrait plan. SVG, or PNG/JPG at least 1200 px.' },
                },
              ],
            },
            {
              name: 'gallery',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              filterOptions: imageOnly,
              admin: { description: 'Lightbox gallery, in order. At least 1600 px on the long side. Empty hides the Gallery button.' },
            },
          ],
        },
        {
          label: 'VR',
          fields: [
            {
              name: 'vr',
              type: 'group',
              fields: [
                {
                  name: 'url',
                  type: 'text',
                  admin: { description: 'Published 3DVista tour (https://…) or a site path. Empty hides the VR button.' },
                },
                {
                  name: 'mode',
                  type: 'radio',
                  defaultValue: 'embedded',
                  options: [
                    { label: 'Open over the page', value: 'embedded' },
                    { label: 'Open in a new tab', value: 'newTab' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'seo',
              type: 'group',
              fields: [
                { name: 'title', type: 'text', admin: { description: 'Browser tab title. Defaults to the type name.' } },
                {
                  name: 'description',
                  type: 'textarea',
                  maxLength: 160,
                  admin: { description: 'Defaults to the sentence in Interface text → Type page → Default description.' },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
