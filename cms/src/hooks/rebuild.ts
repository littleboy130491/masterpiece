import { spawn } from 'node:child_process'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

// The site is static: after content changes, rebuild it. Saves are debounced so
// a burst of edits (or a CSV import of units) triggers one build.
//
//   SITE_REBUILD_URL      POST here (a CI/deploy webhook), and/or
//   SITE_REBUILD_COMMAND  run this shell command from the cms/ folder,
//                         e.g. "npm --prefix .. run build:strict"
//   SITE_REBUILD_DELAY    debounce in ms (default 8000)
//
// With neither set, nothing happens (local editing; run the site build yourself).

let timer: NodeJS.Timeout | undefined
let running = false
let again = false

function run(logger: { info: (m: string) => void; error: (m: string) => void }) {
  const hookUrl = process.env.SITE_REBUILD_URL
  const command = process.env.SITE_REBUILD_COMMAND

  if (hookUrl) {
    fetch(hookUrl, { method: 'POST' })
      .then((r) => logger.info(`Site rebuild webhook: ${r.status}`))
      .catch((e) => logger.error(`Site rebuild webhook failed: ${e}`))
  }

  if (command) {
    if (running) {
      again = true
      return
    }
    running = true
    logger.info(`Site rebuild: ${command}`)
    const child = spawn(command, { shell: true, stdio: 'inherit' })
    child.on('exit', (code) => {
      running = false
      if (code) logger.error(`Site rebuild exited with ${code}`)
      else logger.info('Site rebuild done')
      if (again) {
        again = false
        run(logger)
      }
    })
  }
}

export function scheduleRebuild(logger: Parameters<typeof run>[0]) {
  if (!process.env.SITE_REBUILD_URL && !process.env.SITE_REBUILD_COMMAND) return
  clearTimeout(timer)
  timer = setTimeout(() => run(logger), Number(process.env.SITE_REBUILD_DELAY) || 8000)
}

export const rebuildAfterChange: CollectionAfterChangeHook = ({ req, context }) => {
  if (!context.skipRebuild) scheduleRebuild(req.payload.logger)
}
export const rebuildAfterDelete: CollectionAfterDeleteHook = ({ req, context }) => {
  if (!context.skipRebuild) scheduleRebuild(req.payload.logger)
}
export const rebuildAfterGlobalChange: GlobalAfterChangeHook = ({ req, context }) => {
  if (!context.skipRebuild) scheduleRebuild(req.payload.logger)
}

export const rebuildHooks = { afterChange: [rebuildAfterChange], afterDelete: [rebuildAfterDelete] }
export const globalRebuildHooks = { afterChange: [rebuildAfterGlobalChange] }
