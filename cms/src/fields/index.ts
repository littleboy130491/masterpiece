import type { Field, PayloadRequest, TextField } from 'payload'
import { slugUpdate } from '../access'

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// URL-safe identifier. `unique` is for collection-level slugs; keys inside a
// list are checked for uniqueness by the list (see uniqueKeys).
type SlugExtra = Pick<TextField, 'admin' | 'access' | 'unique' | 'index'>

export const slugField = (name: string, extra: SlugExtra = {}): TextField =>
  ({
    name,
    type: 'text',
    required: true,
    validate: (v: unknown) => (typeof v === 'string' && SLUG.test(v)) || 'Use a-z, 0-9 and single dashes, e.g. "tipe-1".',
    ...extra,
  }) as TextField

export const lockedSlugField = (name: string, extra: SlugExtra = {}): TextField =>
  slugField(name, {
    unique: true,
    index: true,
    access: { update: slugUpdate },
    admin: { position: 'sidebar', description: 'Used in the page URL. Locked once saved (admins can still change it).' },
    ...extra,
  })

// Array validator: no two rows share the same `key`.
export const uniqueKeys = (key: string) => (rows: unknown) => {
  if (!Array.isArray(rows)) return true
  const seen = new Set<string>()
  for (const r of rows) {
    const k = r?.[key]
    if (!k) continue
    if (seen.has(k)) return `"${k}" is used twice. Each ${key} must be unique.`
    seen.add(k)
  }
  return true
}

// Section heading shown above most homepage sections.
export const heading = (opts: { titleMax?: number; introMax?: number; introRequired?: boolean } = {}): Field[] => [
  { name: 'title', type: 'text', required: true, maxLength: opts.titleMax ?? 40 },
  { name: 'intro', type: 'textarea', required: opts.introRequired ?? false, maxLength: opts.introMax ?? 200 },
]

export const hexColor = (name: string, label: string, defaultValue: string): Field => ({
  name,
  label,
  type: 'text',
  required: true,
  defaultValue,
  validate: (v: unknown) => (typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v)) || 'Use a hex colour like #34425e.',
  admin: { width: '25%' },
})

const PLACEHOLDER_HELP =
  'Stand-in content. Shows a "contoh" badge on the site while placeholder badges are on (Site settings → Developer).'

export const placeholderField: Field = {
  name: 'placeholder',
  type: 'checkbox',
  defaultValue: false,
  admin: { position: 'sidebar', description: PLACEHOLDER_HELP },
}

// Same, for use inside tabs and groups (the sidebar only takes top-level fields).
export const placeholderInline: Field = {
  name: 'placeholder',
  label: 'Placeholder',
  type: 'checkbox',
  defaultValue: false,
  admin: { description: PLACEHOLDER_HELP },
}

// Look up a package (by id or populated doc) to validate frame numbers and landmarks.
type Pkg = { frames?: number; landmarks?: string[] | null; kind?: string }
export async function loadPackage(ref: unknown, req: PayloadRequest): Promise<Pkg | null> {
  if (!ref) return null
  if (typeof ref === 'object') return ref as Pkg
  try {
    return (await req.payload.findByID({ collection: 'packages', id: ref as number, depth: 0, req })) as Pkg
  } catch {
    return null
  }
}

export const frameInRange = (frame: unknown, pkg: Pkg | null) => {
  if (typeof frame !== 'number') return true
  if (frame < 0 || !Number.isInteger(frame)) return 'Use a whole number from 0.'
  if (pkg?.frames && frame >= pkg.frames) return `This package has ${pkg.frames} frames: use 0–${pkg.frames - 1}.`
  return true
}
