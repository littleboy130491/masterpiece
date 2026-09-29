import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { importExportPlugin } from '@payloadcms/plugin-import-export'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Facilities } from './collections/Facilities'
import { Media } from './collections/Media'
import { Packages } from './collections/Packages'
import { Units } from './collections/Units'
import { UnitTypes } from './collections/UnitTypes'
import { Users } from './collections/Users'
import { Homepage } from './globals/Homepage'
import { Labels } from './globals/Labels'
import { SiteSettings } from './globals/SiteSettings'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: { titleSuffix: ' — DR CMS' },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [UnitTypes, Units, Facilities, Media, Packages, Users],
  globals: [Homepage, SiteSettings, Labels],
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL: process.env.CMS_URL || '',
  cors: process.env.SITE_URL ? [process.env.SITE_URL] : [],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Schema changes go through migrations (src/migrations): after editing fields,
  // run `npm run migrate:create <name>` and `npm run migrate`. `npm start` applies
  // pending migrations itself.
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || 'file:./cms.db',
    },
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
    prodMigrations: migrations,
  }),
  sharp,
  plugins: [
    // Units: bulk status updates as CSV. Import with "upsert" on Unit ID.
    importExportPlugin({
      collections: [
        { slug: 'units', import: { disableJobsQueue: true }, export: { disableJobsQueue: true } },
      ],
    }),
  ],
})
