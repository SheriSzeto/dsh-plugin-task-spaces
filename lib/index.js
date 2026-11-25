/**
 * Task-spaces plugin, node half.
 *
 * The browser half is the only UI, but the data must not live in browser site
 * storage: clearing "cookies and site data" would wipe every space, task,
 * comment and attachment. So the host owns persistence:
 *
 *   <DSH home>/task-spaces/data.json        spaces + tasks + comments (atomic write)
 *   <DSH home>/task-spaces/files/<id>       attachment bytes (raw files, not base64)
 *   <DSH home>/task-spaces/files/<id>.json  attachment metadata sidecar
 *
 * and exposes it to the browser over same-origin HTTP routes below
 * `/api/task-spaces`. The web server binds loopback by default; every handler
 * additionally refuses non-loopback sockets and cross-site browser calls.
 */
import { randomUUID } from 'node:crypto'
import { createReadStream, existsSync, mkdirSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

/** HTTP prefix owned by this plugin. */
export const API_PREFIX = '/api/task-spaces'

/** Upper bound for the whole spaces/tasks snapshot (comments included). */
const MAX_STATE_BYTES = 8 * 1024 * 1024

/** Upper bound for one uploaded attachment. */
const MAX_FILE_BYTES = 20 * 1024 * 1024

/** Host services required before routes can be registered. */
export const inject = ['webServer']

/** Directory holding this plugin's host-side data. */
function dataDir() {
  const home = process.env.DSH_HOME ?? join(homedir(), '.dsh')
  return join(home, 'task-spaces')
}

/** Directory holding attachment bytes. */
function filesDir() {
  return join(dataDir(), 'files')
}

/** Path of the state snapshot. */
function statePath() {
  return join(dataDir(), 'data.json')
}

/** Ensure both directories exist. */
function ensureDirs() {
  mkdirSync(filesDir(), { recursive: true })
}

/** Read the persisted state, or an empty snapshot on first run. */
function readState() {
  const empty = { version: 1, spaces: [], tasks: [], updatedAt: 0 }
  try {
    const raw = readFileSync(statePath(), 'utf8')
    const parsed = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return empty
    return {
      version: 1,
      spaces: Array.isArray(parsed.spaces) ? parsed.spaces : [],
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : 0,
    }
  } catch {
    return empty
  }
}

/** Write the state atomically (tmp file + rename) so a crash never truncates it. */
function writeState(input) {
  const spaces = Array.isArray(input.spaces) ? input.spaces : []
  const tasks = Array.isArray(input.tasks) ? input.tasks : []
  ensureDirs()
  const payload = JSON.stringify({ version: 1, spaces, tasks, updatedAt: Date.now() })
  const target = statePath()
  const tmp = `${target}.${process.pid}.tmp`
  writeFileSync(tmp, payload, 'utf8')
  renameSync(tmp, target)
  return { spaces: spaces.length, tasks: tasks.length, bytes: Buffer.byteLength(payload) }
}

/** Read one request body fully, refusing bodies over `limit`. */
function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let total = 0
    req.on('data', (chunk) => {
      total += chunk.length
      if (total > limit) {
        reject(new Error('payload-too-large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

/** JSON response helper. */
function sendJson(res, status, value) {
  const body = JSON.stringify(value)
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(body)
}

/** Whether the socket peer is the local machine. */
function isLoopbackPeer(req) {
  const address = req.socket.remoteAddress ?? ''
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1'
}

/** Refuse cross-site browser calls even when they reach a loopback socket. */
function isSameOrigin(req) {
  if (req.headers['sec-fetch-site'] === 'cross-site') return false
  const origin = req.headers.origin
  if (origin === undefined) return true
  const host = req.headers.host
  if (typeof host !== 'string') return false
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

/** Accept only the file id shape this route generates. */
function isFileId(value) {
  return typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(value)
}

/** Attachment metadata sidecar path. */
function metaPath(id) {
  return join(filesDir(), `${id}.json`)
}

/** Attachment bytes path. */
function blobPath(id) {
  return join(filesDir(), id)
}

/** Read one attachment's metadata. */
function readMeta(id) {
  try {
    const parsed = JSON.parse(readFileSync(metaPath(id), 'utf8'))
    if (typeof parsed !== 'object' || parsed === null) return undefined
    return {
      id,
      name: typeof parsed.name === 'string' ? parsed.name : id,
      size: typeof parsed.size === 'number' ? parsed.size : 0,
      type: typeof parsed.type === 'string' ? parsed.type : 'application/octet-stream',
    }
  } catch {
    return undefined
  }
}

/** Delete attachment bytes + sidecar, ignoring missing files. */
function deleteFile(id) {
  for (const path of [blobPath(id), metaPath(id)]) {
    try {
      unlinkSync(path)
    } catch {
      /* already gone */
    }
  }
}

/** Route dispatcher for everything under API_PREFIX. */
async function handle(rootCtx, req, res) {
  if (!isLoopbackPeer(req) || !isSameOrigin(req)) {
    sendJson(res, 403, { error: 'forbidden' })
    return
  }
  const url = new URL(req.url ?? '/', 'http://localhost')
  const suffix = url.pathname.slice(API_PREFIX.length)

  if (req.method === 'GET' && suffix === '/state') {
    sendJson(res, 200, readState())
    return
  }
  if (req.method === 'PUT' && suffix === '/state') {
    let body
    try {
      body = await readBody(req, MAX_STATE_BYTES)
    } catch {
      sendJson(res, 413, { error: 'state-too-large' })
      return
    }
    let parsed
    try {
      parsed = JSON.parse(body.toString('utf8'))
    } catch {
      sendJson(res, 400, { error: 'invalid-json' })
      return
    }
    if (typeof parsed !== 'object' || parsed === null || !Array.isArray(parsed.spaces) || !Array.isArray(parsed.tasks)) {
      sendJson(res, 400, { error: 'invalid-state' })
      return
    }
    const written = writeState(parsed)
    rootCtx.logger?.debug?.('task-spaces: state saved', written)
    sendJson(res, 200, { ok: true, ...written })
    return
  }
  if (req.method === 'POST' && suffix === '/files') {
    let body
    try {
      body = await readBody(req, MAX_FILE_BYTES)
    } catch {
      sendJson(res, 413, { error: 'file-too-large', limit: MAX_FILE_BYTES })
      return
    }
    const rawName = req.headers['x-file-name']
    let name = 'attachment'
    if (typeof rawName === 'string' && rawName.length > 0) {
      try {
        name = decodeURIComponent(rawName).slice(0, 200)
      } catch {
        name = 'attachment'
      }
    }
    const type = typeof req.headers['content-type'] === 'string' ? req.headers['content-type'] : 'application/octet-stream'
    const id = randomUUID()
    ensureDirs()
    writeFileSync(blobPath(id), body)
    const meta = { id, name, size: body.length, type }
    writeFileSync(metaPath(id), JSON.stringify(meta), 'utf8')
    sendJson(res, 200, meta)
    return
  }
  if (suffix.startsWith('/files/')) {
    const id = suffix.slice('/files/'.length)
    if (!isFileId(id)) {
      sendJson(res, 400, { error: 'invalid-file-id' })
      return
    }
    if (req.method === 'GET') {
      const meta = readMeta(id)
      if (meta === undefined || !existsSync(blobPath(id))) {
        sendJson(res, 404, { error: 'not-found' })
        return
      }
      res.writeHead(200, {
        'content-type': meta.type,
        'content-length': String(statSync(blobPath(id)).size),
        'content-disposition': `inline; filename*=UTF-8''${encodeURIComponent(meta.name)}`,
        'cache-control': 'private, max-age=31536000, immutable',
      })
      createReadStream(blobPath(id)).pipe(res)
      return
    }
    if (req.method === 'DELETE') {
      deleteFile(id)
      sendJson(res, 200, { ok: true })
      return
    }
  }
  sendJson(res, 404, { error: 'not-found' })
}

/**
 * Register the task-spaces HTTP routes.
 * @param ctx - plugin context with `webServer` injected.
 */
export function apply(ctx) {
  ctx.effect(() => {
    const dispose = ctx.webServer.register({
      kind: 'prefix',
      path: API_PREFIX,
      handler: (req, res) =>
        handle(ctx, req, res).catch((error) => {
          ctx.logger?.warn?.('task-spaces: route failed', error)
          try {
            sendJson(res, 500, { error: 'internal' })
          } catch {
            /* response already started */
          }
        }),
    })
    return () => dispose()
  }, 'task-spaces: host persistence routes')
}
