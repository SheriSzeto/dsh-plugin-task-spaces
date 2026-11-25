/**
 * Client for the plugin's host half.
 *
 * Spaces, tasks, comments and attachment metadata are persisted by the node
 * half under the DSH home directory (not browser site storage), so clearing
 * site data or switching browsers keeps the data. Attachment bytes are real
 * files on disk, streamed back through these same routes.
 *
 * All requests are same-origin and carry the browser's DSH session cookie; the
 * host refuses non-loopback sockets and cross-site calls.
 */

/** HTTP prefix matching the host half's route. */
const HOST_API_PREFIX = '/api/task-spaces'

/** Attachment limits when the host owns the bytes (files, not base64). */
const HOST_ATTACHMENT_MAX_BYTES = 20 * 1024 * 1024
const HOST_ATTACHMENT_MAX_COUNT = 10

/** Timeout for one host call. */
const HOST_TIMEOUT_MS = 15000

/** fetch with a timeout and no cache. */
async function hostRequest(path, init) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), HOST_TIMEOUT_MS)
  try {
    return await fetch(`${HOST_API_PREFIX}${path}`, { cache: 'no-store', ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Read the persisted snapshot.
 * @returns the snapshot, or null when the host half is unavailable.
 */
async function hostLoadState() {
  try {
    const response = await hostRequest('/state')
    if (!response.ok) return null
    const parsed = await response.json()
    if (typeof parsed !== 'object' || parsed === null) return null
    return {
      spaces: Array.isArray(parsed.spaces) ? parsed.spaces : [],
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
    }
  } catch {
    return null
  }
}

/**
 * Replace the persisted snapshot.
 * @returns true on success.
 */
async function hostSaveState(spaces, tasks) {
  try {
    const response = await hostRequest('/state', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ version: 1, spaces, tasks }),
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Upload one attachment file; the host stores the bytes and returns metadata.
 * @param file - browser File.
 * @returns { id, name, size, type } or throws.
 */
async function hostUploadFile(file) {
  const response = await hostRequest('/files', {
    method: 'POST',
    headers: {
      'content-type': file.type === '' ? 'application/octet-stream' : file.type,
      'x-file-name': encodeURIComponent(file.name),
    },
    body: file,
  })
  if (!response.ok) {
    if (response.status === 413) throw new Error('文件太大，Host 侧单个附件上限为 20 MB。')
    throw new Error(`上传失败（HTTP ${response.status}）`)
  }
  const meta = await response.json()
  if (typeof meta !== 'object' || meta === null || typeof meta.id !== 'string') throw new Error('上传响应无效。')
  return { id: meta.id, name: meta.name, size: meta.size, type: meta.type }
}

/** Delete one attachment's bytes on the host (best effort). */
async function hostDeleteFile(id) {
  try {
    await hostRequest(`/files/${encodeURIComponent(id)}`, { method: 'DELETE' })
  } catch {
    /* an orphan file is harmless */
  }
}

/** URL that streams one host-stored attachment. */
function hostFileUrl(id) {
  return `${HOST_API_PREFIX}/files/${encodeURIComponent(id)}`
}
