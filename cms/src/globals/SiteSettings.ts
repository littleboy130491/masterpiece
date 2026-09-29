import type { GlobalConfig } from 'payload'
import { adminsField, anyone, editors } from '../access'
import { hexColor } from '../fields'
import { globalRebuildHooks } from '../hooks/rebuild'

export const SECTIONS = [
  { label: 'Kawasan', value: 'kawasan' },
  { label: 'Lokasi (map)', value: 'peta' },
  { label: 'Cluster', value: 'cluster' },
  { label: 'Fasilitas', value: 'fasilitas' },
  { label: 'Tipe', value: 'tipe' },
  { label: 'Unit update', value: 'unit-update' },
]

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: { group: 'Site' },
  access: { read: anyone, update: editors },
  hooks: globalRebuildHooks,
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'name', type: 'text', required: true, maxLength: 12, admin: { description: 'Short wordmark in the header, e.g. "DR".' } },
                { name: 'fullName', type: 'text', required: true, admin: { description: 'Official name; page titles and footer.' } },
              ],
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              filterOptions: { mimeType: { contains: 'image' } },
              admin: { description: 'Optional. SVG preferred. Replaces the text wordmark in the header.' },
            },
            {
              name: 'logoOnDark',
              type: 'upload',
              relationTo: 'media',
              filterOptions: { mimeType: { contains: 'image' } },
              admin: {
                condition: (d) => Boolean(d?.logo),
                description: 'Light version for the header over the hero video. If empty, the logo above is shown in white.',
              },
            },
            {
              name: 'favicon',
              type: 'upload',
              relationTo: 'media',
              filterOptions: { mimeType: { contains: 'image' } },
              admin: { description: 'Optional square icon (SVG or 512 px PNG). If empty, one is drawn from the name.' },
            },
            {
              name: 'language',
              type: 'select',
              required: true,
              defaultValue: 'id',
              options: [
                { label: 'Bahasa Indonesia', value: 'id' },
                { label: 'English', value: 'en' },
              ],
              admin: { description: 'Language of the page (for browsers and screen readers). It does not translate the text.' },
            },
          ],
        },
        {
          label: 'SEO & sharing',
          fields: [
            {
              name: 'seo',
              type: 'group',
              fields: [
                { name: 'description', type: 'textarea', required: true, maxLength: 160, admin: { description: 'Default meta description.' } },
                {
                  name: 'shareImage',
                  type: 'upload',
                  relationTo: 'media',
                  filterOptions: { mimeType: { contains: 'image' } },
                  admin: { description: 'Link preview image, 1200 × 630.' },
                },
              ],
            },
          ],
        },
        {
          label: 'Navigation',
          fields: [
            {
              name: 'nav',
              label: 'Header links',
              type: 'array',
              required: true,
              minRows: 1,
              admin: { components: { RowLabel: '/components/RowLabel#LabelRowLabel' } },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', type: 'text', required: true, maxLength: 16 },
                    { name: 'section', type: 'select', required: true, options: SECTIONS },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Unit status',
          fields: [
            {
              name: 'statusLabels',
              type: 'group',
              admin: { description: 'Legend and tooltip text for siteplan dots.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'available', type: 'text', required: true },
                    { name: 'reserved', type: 'text', required: true },
                    { name: 'sold', type: 'text', required: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Footer',
          fields: [
            {
              name: 'footer',
              type: 'group',
              fields: [
                {
                  name: 'copyright',
                  type: 'text',
                  defaultValue: '© {year} {fullName}',
                  admin: { description: '{year} and {fullName} are filled in.' },
                },
              ],
            },
          ],
        },
        {
          label: 'Colours',
          fields: [
            {
              name: 'theme',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    hexColor('accent', 'Accent', '#34425e'),
                    hexColor('available', 'Available dot', '#1f9a57'),
                    hexColor('reserved', 'Reserved dot', '#f0b400'),
                    hexColor('sold', 'Sold dot', '#e0442e'),
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Developer',
          fields: [
            {
              name: 'dev',
              type: 'group',
              access: { update: adminsField },
              fields: [
                {
                  name: 'showPlaceholderBadges',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: { description: 'Show "contoh" badges on anything marked as placeholder.' },
                },
                { name: 'analyticsId', type: 'text', admin: { description: 'GA4 measurement ID (G-…). Empty: no analytics.' } },
              ],
            },
          ],
        },
      ],
    },
  ],
}
