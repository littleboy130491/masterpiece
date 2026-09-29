import fs from 'node:fs/promises'
import path from 'node:path'
import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'
import { anyone, editors } from '../access'
import { placeholderField } from '../fields'
import { rebuildHooks } from '../hooks/rebuild'

// Motion packages: folders of frames that the 3D team or a developer delivers
// into the site's public/ folder (see README "Media pipeline"). Editors don't
// edit frames here; they register a package and pick it for a scene or a type.
//
// If the site's public/ folder is reachable (SITE_PUBLIC_DIR, default ../public),
// saving reads the frame count, size and landmarks from the package itself.

const publicDir = () => path.resolve(process.cwd(), process.env.SITE_PUBLIC_DIR || '../public')

const readFromDisk: CollectionBeforeValidateHook = async ({ data }) => {
  if (!data?.path || typeof data.path !== 'string') return data
  const dir = path.join(publicDir(), data.path)
  try {
    if (data.kind === 'scene') {
      const m = JSON.parse(await fs.readFile(path.join(dir, 'manifest.json'), 'utf8'))
      data.frames = m.count
      data.width = m.width
      data.height = m.height
      data.landmarks = Object.keys(m.hotspots || {})
    } else if (data.kind === 'turntable') {
      const xml = await fs.readFile(path.join(dir, 'config.xml'), 'utf8')
      const images = [...xml.matchAll(/<image\s+src="([^"]+)"/g)].map((x) => x[1])
      data.frames = images.length
      data.width = Number(xml.match(/highresWidth="(\d+)"/)?.[1]) || data.width
      data.height = Number(xml.match(/highresHeight="(\d+)"/)?.[1]) || data.height
      if (!data.poster && images[0]) data.poster = `${data.path}${images[0]}`
    }
  } catch {
    // Not on this machine (e.g. CMS hosted apart from the site): keep the typed values.
  }
  return data
}

export const Packages: CollectionConfig = {
  slug: 'packages',
  labels: { singular: 'Motion package', plural: 'Motion packages' },
  admin: {
    group: 'Media',
    useAsTitle: 'name',
    defaultColumns: ['name', 'kind', 'path', 'frames'],
    description:
      'Image sequences delivered as whole folders: scroll scenes (Kawasan, Cluster) and WebRotate 360 packages (type pages).',
  },
  access: { read: anyone, create: editors, update: editors, delete: editors },
  hooks: { ...rebuildHooks, beforeValidate: [readFromDisk] },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'kind',
      type: 'select',
      required: true,
      options: [
        { label: 'Scroll scene (frames + manifest.json)', value: 'scene' },
        { label: 'WebRotate 360 turntable (config.xml + images/)', value: 'turntable' },
      ],
    },
    {
      name: 'path',
      type: 'text',
      required: true,
      validate: (v: unknown) =>
        (typeof v === 'string' && /^\/[^\s]*\/$/.test(v)) || 'A site path starting and ending with "/", e.g. /media/scroll/kawasan/',
      admin: { description: 'Folder inside the site, e.g. /media/scroll/kawasan/ or /media/tipe-1/facade/' },
    },
    {
      type: 'row',
      fields: [
        { name: 'frames', type: 'number', required: true, min: 1, admin: { description: 'Read from the package when available.' } },
        { name: 'width', type: 'number', min: 1, admin: { description: 'Frame width in px.' } },
        { name: 'height', type: 'number', min: 1, admin: { description: 'Frame height in px.' } },
      ],
    },
    {
      name: 'landmarks',
      type: 'text',
      hasMany: true,
      admin: {
        condition: (d) => d?.kind === 'scene',
        description: 'Tracked landmarks in manifest.json. Each hotspot follows one of these.',
      },
    },
    {
      name: 'poster',
      type: 'text',
      admin: {
        condition: (d) => d?.kind === 'turntable',
        description: 'Image shown before the viewer starts, e.g. /media/tipe-1/facade/images/facade_000.jpg',
      },
    },
    {
      name: 'firstImage',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: { condition: (d) => d?.kind === 'turntable', description: 'Frame the viewer opens on.' },
    },
    {
      name: 'startFrame',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: { condition: (d) => d?.kind === 'scene', description: 'Frame the scroll scene starts on.' },
    },
    placeholderField,
  ],
}
