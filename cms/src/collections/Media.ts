import type { CollectionConfig } from 'payload'
import { anyone, editors } from '../access'
import { rebuildHooks } from '../hooks/rebuild'

// Every image and video on the site. The site build downloads the files it uses
// into public/uploads/, so the CMS doesn't have to be public.
export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
    defaultColumns: ['filename', 'alt', 'mimeType', 'filesize'],
  },
  access: { read: anyone, create: editors, update: editors, delete: editors },
  hooks: rebuildHooks,
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/avif', 'video/mp4', 'video/webm'],
    focalPoint: false,
    crop: false,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: { description: 'Describes the image for screen readers and search. For videos, a short title.' },
    },
  ],
}
