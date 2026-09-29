import type { CollectionConfig } from 'payload'
import { anyone, editors, loggedInField, sales } from '../access'
import { rebuildHooks } from '../hooks/rebuild'

// One dot per unit on the siteplan (Homepage → Unit update). Changes often, so
// it's a plain table with CSV import/export (upsert by Unit ID) for bulk status updates.
export const Units: CollectionConfig = {
  slug: 'units',
  admin: {
    group: 'Content',
    useAsTitle: 'unitId',
    defaultColumns: ['unitId', 'status', 'block', 'type', 'x', 'y'],
    listSearchableFields: ['unitId', 'block'],
    pagination: { defaultLimit: 100 },
    description: 'Status dots on the siteplan. Positions are % of the siteplan image, so re-check them if the siteplan changes.',
  },
  defaultSort: 'unitId',
  access: { read: anyone, create: editors, update: sales, delete: editors },
  hooks: {
    ...rebuildHooks,
    beforeChange: [
      ({ data }) => {
        // Block defaults to the part of the ID before the dash ("A-01" → "A").
        if (!data.block && typeof data.unitId === 'string') data.block = data.unitId.split('-')[0]
        return data
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'unitId', label: 'Unit ID', type: 'text', required: true, unique: true, index: true, admin: { description: 'e.g. A-01' } },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'available',
          index: true,
          options: [
            { label: 'Available (green)', value: 'available' },
            { label: 'Reserved (yellow)', value: 'reserved' },
            { label: 'Sold (red)', value: 'sold' },
          ],
        },
        { name: 'block', type: 'text', index: true, admin: { description: 'Filled from the Unit ID if empty.' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'x', type: 'number', required: true, min: 0, max: 100, admin: { step: 0.01, description: '% of siteplan width' } },
        { name: 'y', type: 'number', required: true, min: 0, max: 100, admin: { step: 0.01, description: '% of siteplan height' } },
      ],
    },
    { name: 'type', type: 'relationship', relationTo: 'unit-types', admin: { description: 'Not shown on the site yet.' } },
    {
      name: 'note',
      type: 'textarea',
      access: { read: loggedInField },
      admin: { description: 'Internal only; never published.' },
    },
  ],
}
