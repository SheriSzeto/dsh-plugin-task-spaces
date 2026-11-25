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

/** Path of the execution run ledger (separate from space state, host-authored). */
const RUNS_FILE = 'runs.json'

/** Interval of the run reconciler. */
const RUN_POLL_MS = 4000

/** Longest agent output kept per run (characters). */
const MAX_RUN_OUTPUT = 20000

/** How many historical events one run inspection may page through. */
const MAX_INSPECTION_PAGES = 40

/** Legacy task-type ids → labels (the host composes the execution prompt). */
const TASK_TYPE_LABELS = {
  task: '任务',
  requirement: '需求',
  bug: '缺陷',
  research: '研究',
  content: '内容',
  story: '需求',
  user_story: '需求',
  feature: '需求',
  request: '内容',
}

/** Path of the run ledger. */
function runsPath() {
  return join(dataDir(), RUNS_FILE)
}

/** Read the run ledger (empty on first run or when damaged). */
function readRuns() {
  try {
    const parsed = JSON.parse(readFileSync(runsPath(), 'utf8'))
    return { version: 1, runs: Array.isArray(parsed.runs) ? parsed.runs : [] }
  } catch {
    return { version: 1, runs: [] }
  }
}

/** Write the run ledger atomically. */
function writeRuns(ledger) {
  ensureDirs()
  const target = runsPath()
  const tmp = `${target}.${process.pid}.tmp`
  writeFileSync(tmp, JSON.stringify({ version: 1, runs: ledger.runs }), 'utf8')
  renameSync(tmp, target)
}

/**
 * Wire layout of the typert gateway descriptor tables: `agentPresets/list` takes
 * no arguments, `session/list` names its request `_request`, every other
 * method used here names it `request`.
 */
function wireArgs(namespace, method, request) {
  if (namespace === 'agentPresets' && method === 'list') return {}
  if (namespace === 'session' && method === 'list') return { _request: request }
  return { request }
}

/** Invoke one gateway method. */
function gatewayInvoke(ctx, namespace, method, request, signal) {
  return ctx.typertGateway.invoke({
    namespace,
    method,
    args: wireArgs(namespace, method, request),
    ...(signal === undefined ? {} : { signal }),
  })
}

/** Open one gateway stream. */
function gatewayStream(ctx, namespace, method, request, signal) {
  return ctx.typertGateway.stream({
    namespace,
    method,
    args: { request },
    ...(signal === undefined ? {} : { signal }),
  })
}

/** Address of one session for the gateway history calls. */
function sessionAddress(sessionId) {
  return { kind: 'session', sessionId }
}

/** Compose the prompt an agent receives for one task. */
function composePrompt(space, task) {
  const type = TASK_TYPE_LABELS[task.type] ?? task.type ?? '任务'
  const lines = [`任务：${task.title}`]
  if (typeof task.description === 'string' && task.description.trim() !== '') lines.push('', task.description.trim())
  lines.push('', `（来自任务空间「${space.name}」，任务类型：${type}${space.identifier === undefined ? '' : `，空间标识：${space.identifier}`}）`)
  if (Array.isArray(task.labels) && task.labels.length > 0) lines.push(`标签：${task.labels.join('、')}`)
  lines.push('', '完成后用一段话总结：做了什么、结论、需要我注意的点。')
  return lines.join('\n')
}

/** Extract the plain text of one assistant message event. */
function assistantText(message) {
  if (message === undefined || message === null || !Array.isArray(message.content)) return ''
  return message.content
    .filter((part) => part !== null && typeof part === 'object' && part.type === 'text' && typeof part.text === 'string')
    .map((part) => part.text)
    .join('\n')
    .trim()
}

/** Read the terminal turn and last assistant text for one run's session. */
async function inspectSession(ctx, run) {
  const stream = await gatewayStream(ctx, 'session', 'follow', { address: sessionAddress(run.sessionId), maxMessages: 1 })
  const iterator = stream[Symbol.asyncIterator]()
  let opening
  try {
    const next = await iterator.next()
    opening = next.done === true ? undefined : next.value
  } finally {
    if (typeof iterator.return === 'function') await iterator.return()
  }
  if (opening === undefined || opening.type !== 'snapshot' || typeof opening.cursor !== 'number' || !Array.isArray(opening.records)) {
    return undefined
  }
  const events = opening.records.map((record) => record.event)
  let beforeSeq
  let reachedBoundary = opening.hasMore !== true
  let pages = 0
  while (!reachedBoundary && pages < MAX_INSPECTION_PAGES) {
    pages += 1
    let history
    try {
      history = await gatewayInvoke(ctx, 'session', 'page', {
        address: sessionAddress(run.sessionId),
        throughSeq: opening.cursor,
        maxMessages: 100,
        ...(beforeSeq === undefined ? {} : { beforeSeq }),
      })
    } catch {
      break
    }
    const pageEvents = Array.isArray(history.records) ? history.records.map((record) => record.event) : []
    events.push(...pageEvents)
    const oldestTime = pageEvents.reduce((oldest, event) => (oldest === undefined ? event.time : Math.min(oldest, event.time)), undefined)
    if (history.hasMore !== true || (oldestTime !== undefined && oldestTime <= run.startedAt)) {
      reachedBoundary = true
      break
    }
    const oldestSeq = pageEvents.reduce((oldest, event) => (oldest === undefined ? event.seq : Math.min(oldest, event.seq)), undefined)
    if (oldestSeq === undefined || oldestSeq === beforeSeq) break
    beforeSeq = oldestSeq
  }
  const relevant = events.filter((event) => event !== null && typeof event === 'object' && event.time >= run.startedAt)
  const turnEnd = relevant
    .filter((event) => event.type === 'turn/end')
    .sort((left, right) => left.seq - right.seq)[0]
  const assistant = relevant
    .filter((event) => event.type === 'assistant/message')
    .sort((left, right) => left.seq - right.seq)
  const last = assistant[assistant.length - 1]
  const output = last === undefined ? '' : assistantText(last.data.message).slice(0, MAX_RUN_OUTPUT)
  if (turnEnd === undefined) return { settled: false, output }
  const reason = turnEnd.data.reason ?? {}
  const kind = reason.kind
  if (kind === 'completed' || kind === 'max-tokens') return { settled: true, outcome: 'succeeded', output, note: kind === 'max-tokens' ? '达到单轮 token 上限，已停止。' : '' }
  if (kind === 'aborted' || kind === 'interrupted') return { settled: true, outcome: 'cancelled', output, error: '执行被取消。' }
  const error = reason.error
  const message = error !== undefined && error !== null && typeof error.message === 'string' && error.message !== '' ? error.message : 'Agent 执行出错。'
  return { settled: true, outcome: 'failed', output, error: message.slice(0, 2000) }
}

/** Reconcile every running run against the session roster. */
async function pollRuns(ctx) {
  const ledger = readRuns()
  const running = ledger.runs.filter((run) => run.status === 'running')
  if (running.length === 0) return
  let list
  try {
    list = await gatewayInvoke(ctx, 'session', 'list', {})
  } catch (error) {
    ctx.logger?.warn?.('task-spaces: session roster unavailable while polling runs', error)
    return
  }
  const items = Array.isArray(list.items) ? list.items : []
  let changed = false
  for (const run of running) {
    const summary = items.find((item) => item.sessionId === run.sessionId)
    if (summary !== undefined && summary.running === true) continue
    if (summary === undefined) {
      run.status = 'cancelled'
      run.finishedAt = Date.now()
      run.error = '执行会话已不存在。'
      changed = true
      continue
    }
    let inspection
    try {
      inspection = await inspectSession(ctx, run)
    } catch (error) {
      ctx.logger?.warn?.('task-spaces: run inspection failed', error)
      continue
    }
    if (inspection === undefined || inspection.settled !== true) continue
    run.status = inspection.outcome
    run.finishedAt = Date.now()
    run.output = inspection.output ?? ''
    if (inspection.note !== undefined && inspection.note !== '') run.note = inspection.note
    if (inspection.error !== undefined) run.error = inspection.error
    changed = true
  }
  if (changed) writeRuns(ledger)
}

/** Launch one agent execution for a task. */
async function launchRun(ctx, taskId, options) {
  const state = readState()
  const task = state.tasks.find((entry) => entry.id === taskId)
  if (task === undefined) {
    const error = new Error('task-not-found')
    error.status = 404
    throw error
  }
  const space = state.spaces.find((entry) => entry.id === task.spaceId)
  if (space === undefined) {
    const error = new Error('space-not-found')
    error.status = 404
    throw error
  }
  const ledger = readRuns()
  const active = ledger.runs.find((run) => run.taskId === taskId && run.status === 'running')
  if (active !== undefined) {
    const error = new Error('run-already-active')
    error.status = 409
    throw error
  }
  const runId = randomUUID()
  const request = {}
  if (typeof options.agentPreset === 'string' && options.agentPreset !== '') request.agentPreset = options.agentPreset
  if (typeof options.workspaceId === 'string' && options.workspaceId !== '') request.workspaceId = options.workspaceId
  let created
  try {
    created = await gatewayInvoke(ctx, 'session', 'create', request)
  } catch (error) {
    const failure = new Error(`无法创建执行会话：${error instanceof Error ? error.message : String(error)}`)
    failure.status = 503
    throw failure
  }
  const sessionId = created.sessionId
  const run = {
    id: runId,
    taskId,
    spaceId: task.spaceId,
    sessionId,
    status: 'running',
    startedAt: Date.now(),
    agentPreset: request.agentPreset,
    workspaceId: request.workspaceId,
    output: '',
    prompt: composePrompt(space, task).slice(0, 4000),
  }
  try {
    await gatewayInvoke(ctx, 'session', 'rename', { sessionId, title: task.title })
    await gatewayInvoke(ctx, 'session', 'prompt', {
      sessionId,
      requestId: `task-spaces-${runId}`,
      mode: 'queue',
      content: [{ type: 'text', text: composePrompt(space, task) }],
    })
  } catch (error) {
    run.status = 'failed'
    run.finishedAt = Date.now()
    run.error = `启动执行失败：${error instanceof Error ? error.message : String(error)}`
  }
  ledger.runs = [run, ...ledger.runs].slice(0, 500)
  writeRuns(ledger)
  return run
}

/** Cancel one running execution. */
async function cancelRun(ctx, runId) {
  const ledger = readRuns()
  const run = ledger.runs.find((entry) => entry.id === runId)
  if (run === undefined) {
    const error = new Error('run-not-found')
    error.status = 404
    throw error
  }
  if (run.status !== 'running') return run
  try {
    await gatewayInvoke(ctx, 'session', 'cancel', { sessionId: run.sessionId })
  } catch (error) {
    ctx.logger?.warn?.('task-spaces: cancel failed', error)
  }
  run.status = 'cancelled'
  run.finishedAt = Date.now()
  run.error = '已请求取消执行。'
  writeRuns(ledger)
  return run
}

/** Read the execution metadata the run dialog offers: presets and workspaces. */
async function readExecutionMeta(ctx) {
  const meta = { presets: [], workspaces: [], presetError: null }
  try {
    const roster = await gatewayInvoke(ctx, 'agentPresets', 'list', {})
    meta.presets = Array.isArray(roster.presets)
      ? roster.presets.map((preset) => ({
          id: preset.id,
          name: typeof preset.name === 'string' && preset.name !== '' ? preset.name : preset.id,
          description: typeof preset.description === 'string' ? preset.description : '',
          broken: typeof preset.broken === 'string' ? preset.broken : undefined,
        }))
      : []
  } catch (error) {
    meta.presetError = error instanceof Error ? error.message : String(error)
  }
  try {
    const list = typeof ctx.workspaceRegistry?.list === 'function' ? ctx.workspaceRegistry.list() : []
    meta.workspaces = list.map((workspace) => ({ id: workspace.id, title: workspace.title, path: workspace.path }))
  } catch {
    meta.workspaces = []
  }
  return meta
}

/** Upper bound for the whole spaces/tasks snapshot (comments included). */
const MAX_STATE_BYTES = 8 * 1024 * 1024

/** Upper bound for one uploaded attachment. */
const MAX_FILE_BYTES = 20 * 1024 * 1024

/** Host services required before routes can be registered. */
export const inject = ['webServer', 'typertGateway']

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
  if (req.method === 'GET' && suffix === '/meta') {
    sendJson(res, 200, await readExecutionMeta(rootCtx))
    return
  }
  if (req.method === 'GET' && suffix === '/runs') {
    sendJson(res, 200, readRuns())
    return
  }
  const runLaunch = /^\/tasks\/([^/]+)\/run$/.exec(suffix)
  if (req.method === 'POST' && runLaunch !== null) {
    let body = Buffer.alloc(0)
    try {
      body = await readBody(req, 64 * 1024)
    } catch {
      sendJson(res, 413, { error: 'request-too-large' })
      return
    }
    let options = {}
    try {
      options = body.length === 0 ? {} : JSON.parse(body.toString('utf8'))
    } catch {
      sendJson(res, 400, { error: 'invalid-json' })
      return
    }
    try {
      const run = await launchRun(rootCtx, decodeURIComponent(runLaunch[1]), options ?? {})
      sendJson(res, 200, run)
    } catch (error) {
      sendJson(res, error.status ?? 500, { error: error instanceof Error ? error.message : String(error) })
    }
    return
  }
  const runCancel = /^\/runs\/([^/]+)\/cancel$/.exec(suffix)
  if (req.method === 'POST' && runCancel !== null) {
    try {
      sendJson(res, 200, await cancelRun(rootCtx, decodeURIComponent(runCancel[1])))
    } catch (error) {
      sendJson(res, error.status ?? 500, { error: error instanceof Error ? error.message : String(error) })
    }
    return
  }
  sendJson(res, 404, { error: 'not-found' })
}

/**
 * Register the task-spaces HTTP routes.
 * @param ctx - plugin context with `webServer` injected.
 */
export function apply(ctx) {
  ctx.effect(() => {
    const timer = setInterval(() => {
      pollRuns(ctx).catch((error) => ctx.logger?.warn?.('task-spaces: run poll failed', error))
    }, RUN_POLL_MS)
    return () => clearInterval(timer)
  }, 'task-spaces: run reconciler')

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
