import type { CollectionConfig } from 'payload'
import { anyone, editors } from '../access'
import { placeholderField } from '../fields'
import { rebuildHooks } from '../hooks/rebuild'

// Carousel slides. Which ones show, and in what order, is set on the Homepage
// (Fasilitas tab), so a facility can be prepared here without appearing yet.
export const Facilities: CollectionConfig = {
  slug: 'facilities',
  labels: { singular: 'Facility', plural: 'Facilities' },
  admin: { group: 'Content', useAsTitle: 'title', defaultColumns: ['title', 'image'] },
  access: { read: anyone, create: editors, update: editors, delete: editors },
  hooks: rebuildHooks,
  fields: [
    { name: 'title', type: 'text', required: true, maxLength: 40, admin: { description: 'Caption under the image.' } },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      filterOptions: { mimeType: { contains: 'image' } },
      admin: { description: 'Shown at 16:10. At least 1200 px wide.' },
    },
    placeholderField,
  ],
}
