/**
 * Shared constants, icons, workspace data model and persistence.
 *
 * The whole feature is client-side: spaces are created and stored in the
 * browser's localStorage, exactly like a prototype surface of the real
 * product. Copy and defaults follow the product's five-step create-space flow.
 */

/** localStorage key holding the created spaces. */
const STORAGE_KEY = 'dsh.task-spaces.v1'

/** Stylesheet identity used for idempotent <style> injection. */
const CSS_TAG_ID = 'dsh-plugin-task-spaces/task-spaces.css'

/** Create element helper. */
const h = React.createElement

/** Join truthy class names. */
function cx(...parts) {
  return parts.filter((part) => typeof part === 'string' && part.length > 0).join(' ')
}

/* ------------------------------------------------------------------ icons */

/** 16px stroke icons used across the page and the wizard. */
const ICON_PATHS = {
  plus: ['M8 3.5v9M3.5 8h9'],
  close: ['M4 4l8 8M12 4l-8 8'],
  check: ['M3.5 8.5l3 3 6-7'],
  'check-circle': ['M8 14A6 6 0 108 2a6 6 0 000 12Z', 'M5.2 8.2l2 2 3.6-4.2'],
  'chevron-left': ['M10 3.5L5.5 8 10 12.5'],
  'chevron-right': ['M6 3.5L10.5 8 6 12.5'],
  'chevron-down': ['M3.5 6L8 10.5 12.5 6'],
  globe: [
    'M8 14A6 6 0 108 2a6 6 0 000 12Z',
    'M2 8h12',
    'M8 2c1.8 1.9 2.7 3.9 2.7 6S9.8 12.1 8 14C6.2 12.1 5.3 10.1 5.3 8S6.2 3.9 8 2Z',
  ],
  lock: ['M4.5 7V5.4a3.5 3.5 0 017 0V7', 'M3.2 7h9.6v6.5H3.2z'],
  trash: ['M3 4.5h10', 'M6.5 4.5V3h3v1.5', 'M4.5 4.5l.7 8.5h5.6l.7-8.5'],
  copy: ['M5.5 5.5V3h7.5v7.5h-2.5', 'M3 5.5h7.5V13H3z'],
  grid: ['M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z'],
  more: ['M4 8h.01M8 8h.01M12 8h.01'],
  sparkle: ['M8 2l1.6 4.4L14 8l-4.4 1.6L8 14l-1.6-4.4L2 8l4.4-1.6z'],
  star: ['M8 2.5l1.7 3.7 3.8.4-2.9 2.6.9 3.8L8 11.1l-3.5 1.9.9-3.8L2.5 6.6l3.8-.4z'],
  users: [
    'M6 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5Z',
    'M2 13.5c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5',
    'M10.6 3.3a2.5 2.5 0 010 4.5',
    'M12 10.3c1.2.4 2 1.5 2 3.2',
  ],
  layers: ['M8 2.5l5.5 3L8 8.5l-5.5-3z', 'M2.5 8L8 11l5.5-3', 'M2.5 11L8 14l5.5-3'],
  workflow: ['M4 3.5h3v3H4zM9 9.5h3v3H9z', 'M7 5h2.5v4.5H9'],
  hash: ['M6 2.5L4.5 13.5M11 2.5L9.5 13.5', 'M3 6h10M2.5 10h10'],
  search: ['M7.2 12.5a5.3 5.3 0 100-10.6 5.3 5.3 0 000 10.6Z', 'M11 11l3 3'],
  'arrow-right': ['M3 8h9M8.5 3.5L13 8l-4.5 4.5'],
  info: ['M8 14A6 6 0 108 2a6 6 0 000 12Z', 'M8 7.2v3.6M8 5.2h.01'],
  folder: ['M2.5 4.5h4l1 1.5h6v6.5h-11z'],
  checklist: ['M2.5 4h2v2h-2zM6.5 4.6H13', 'M2.5 9h2v2h-2zM6.5 9.6H13'],
  'arrow-left': ['M13 8H4M8.5 3.5L4 8l4.5 4.5'],
  paperclip: ['M12.8 7.3l-5 5a2.8 2.8 0 01-4-4l5.4-5.4a1.9 1.9 0 012.7 2.7l-5.4 5.4a1 1 0 01-1.4-1.4l5-5'],
  comment: ['M13.5 2.5h-11v8.5h3v2.5l3-2.5h5z'],
  user: ['M8 8.2a2.9 2.9 0 100-5.8 2.9 2.9 0 000 5.8Z', 'M2.8 13.8c0-2.3 2.3-4 5.2-4s5.2 1.7 5.2 4'],
  rocket: ['M6 10l-2 3 3-1.2', 'M10 10l2 3-3-1.2', 'M8 2.5c2.8 1.3 4 3.7 4 6.4L8 12 4 8.9C4 6.2 5.2 3.8 8 2.5Z', 'M6.4 6.6a2 2 0 112.8 2.8'],
  sun: ['M8 11a3 3 0 100-6 3 3 0 000 6Z', 'M8 1.5v1.4M8 13.1v1.4M1.5 8h1.4M13.1 8h1.4M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1'],
}

/**
 * Render one stroke icon.
 * @param props.name - ICON_PATHS key.
 * @param props.size - square edge in pixels (default 16).
 * @param props.strokeWidth - stroke width (default 1.3).
 */
function Icon({ name, size = 16, strokeWidth = 1.3, className }) {
  const paths = ICON_PATHS[name] ?? ICON_PATHS.info
  return h(
    'svg',
    {
      viewBox: '0 0 16 16',
      width: size,
      height: size,
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      'aria-hidden': 'true',
      className,
    },
    paths.map((d, index) => h('path', { key: index, d })),
  )
}

/* ------------------------------------------------------------- icon/color */

/** Background palette offered next to the space glyph. */
const COLOR_SWATCHES = [
  { id: 'gray', name: '灰色', hex: '#8b8f98' },
  { id: 'slate', name: '石板灰', hex: '#6a7a8c' },
  { id: 'blue', name: '蓝色', hex: '#4f7df0' },
  { id: 'brown', name: '棕色', hex: '#96705a' },
  { id: 'indigo', name: '靛蓝', hex: '#6c5ce7' },
  { id: 'cyan', name: '青色', hex: '#2aa8b8' },
  { id: 'green', name: '绿色', hex: '#3f9e6b' },
  { id: 'magenta', name: '洋红', hex: '#c256a8' },
  { id: 'yellow', name: '黄色', hex: '#c9a227' },
  { id: 'orange', name: '橙色', hex: '#e08a3c' },
  { id: 'rose', name: '玫瑰色', hex: '#d65b78' },
  { id: 'teal', name: '蓝绿色', hex: '#2f9e94' },
]

/** Glyph choices for the space icon. */
const EMOJI_CHOICES = [
  '🛠️', '🧭', '🚀', '🎨', '📣', '📈', '🧪', '🗂️',
  '📦', '🧱', '🔭', '🧠', '⚙️', '🌱', '🎯', '📚',
  '🧩', '🛰️', '💡', '🔒', '📝', '🎬', '🏗️', '🤖',
]

/* ----------------------------------------------------------- work catalog */

/** Work directions offered on step one (personal, not an org chart). */
const WORK_CATEGORIES = [
  { id: 'software_development', name: '软件研发', emoji: '🛠️', desc: '写代码、修缺陷、做工具' },
  { id: 'content', name: '内容创作', emoji: '✍️', desc: '写作、视频、文章与素材' },
  { id: 'research', name: '研究学习', emoji: '🔭', desc: '调研、读书、实验与笔记' },
  { id: 'design', name: '产品设计', emoji: '🎨', desc: '产品想法、原型与体验打磨' },
  { id: 'operations', name: '运营', emoji: '📈', desc: '账号、增长与日常运营动作' },
  { id: 'personal', name: '个人事务', emoji: '✨', desc: '生活、财务、计划与其他' },
]

/** Suggested identifier prefix per work direction. */
const CATEGORY_IDENTIFIER = {
  software_development: 'CODE',
  content: 'WRITE',
  research: 'NOTE',
  design: 'DSGN',
  operations: 'OPS',
  personal: 'ME',
}

/** Old category ids from the team-era model, remapped onto the personal ones. */
const CATEGORY_MIGRATION = {
  software_development: 'software_development',
  project_management: 'design',
  product_management: 'design',
  marketing: 'content',
  design: 'design',
  operations: 'operations',
  it_support: 'personal',
  human_resources: 'personal',
  customer_service: 'personal',
  legal: 'personal',
  finance: 'personal',
  sales: 'personal',
  data_science: 'research',
  other: 'personal',
}

/** Issue-type templates offered on the task-types step (personal scale). */
const TASK_TYPE_POOL = [
  { id: 'requirement', name: '需求', desc: '要做到的一件具体的事。' },
  { id: 'bug', name: '缺陷', desc: '已有的东西坏了或不对。' },
  { id: 'research', name: '研究', desc: '需要先搞清楚的未知问题。' },
  { id: 'content', name: '内容', desc: '要写、要拍、要整理输出的东西。' },
]

/** Legacy task-type ids from the agile model, remapped onto the personal pool. */
const TASK_TYPE_MIGRATION = {
  requirement: 'requirement',
  bug: 'bug',
  story: 'requirement',
  user_story: 'requirement',
  feature: 'requirement',
  request: 'content',
  research: 'research',
  content: 'content',
}

/**
 * Default task types per work direction: `options` are offered, `checked` are
 * pre-selected. The fixed `任务` type is always available.
 */
function taskTypeDefaults(category) {
  if (category === 'software_development') {
    return { options: ['requirement', 'bug', 'research'], checked: ['requirement', 'bug'] }
  }
  if (category === 'content') {
    return { options: ['content', 'research'], checked: ['content'] }
  }
  if (category === 'research') {
    return { options: ['research', 'content'], checked: ['research'] }
  }
  if (category === 'design') {
    return { options: ['requirement', 'research'], checked: ['requirement'] }
  }
  return { options: ['requirement', 'content'], checked: [] }
}

/** Feature modules offered on step two (personal workspace, no team modules). */
const MODULE_DEFS = [
  {
    id: 'tasks',
    name: '任务',
    icon: 'check-circle',
    desc: '任务承载你要推进的事，可以指定执行者（我或 Agent），并跟踪状态、进展和附件。',
    locked: true,
  },
  {
    id: 'views',
    name: '视图',
    icon: 'grid',
    desc: '视图用于保存常用的任务筛选和展示方式。按状态、优先级、标签等条件创建视图后，可以快速回到同一套工作视角。',
  },
]

/** Legacy module ids from the team-era model; dropped when old spaces load. */
const LEGACY_MODULE_IDS = ['sprints', 'projects', 'triage']

/* ---------------------------------------------------------- workflow data */

/** Status category colours shared by presets and the editor. */
const STATUS_COLORS = {
  backlog: '#8b8f98',
  unstarted: '#5b8def',
  started: '#e0a03c',
  completed: '#3fa56e',
  canceled: '#b6bbc4',
}

/** Workflow presets offered on step four (personal rhythms, not team processes). */
const WORKFLOW_PRESETS = [
  {
    id: 'starter',
    name: '轻量待办',
    subtitle: '想法 → 进行中 → 完成',
    statuses: [
      { name: '想法', color: 'backlog' },
      { name: '进行中', color: 'started' },
      { name: '已完成', color: 'completed' },
    ],
    labels: ['灵感', '待读', '重要'],
  },
  {
    id: 'deep',
    name: '深度工作',
    subtitle: '研究、产出、审阅的节奏',
    statuses: [
      { name: '待开始', color: 'backlog' },
      { name: '研究中', color: 'started' },
      { name: '产出中', color: 'started' },
      { name: '待审阅', color: 'unstarted' },
      { name: '已完成', color: 'completed' },
    ],
    labels: ['研究', '写作', '审阅'],
  },
  {
    id: 'ai',
    name: 'AI 自动化',
    subtitle: '交给 Agent 执行与验收',
    statuses: [
      { name: '待指派', color: 'backlog' },
      { name: '执行中', color: 'started' },
      { name: '待验收', color: 'unstarted' },
      { name: '已完成', color: 'completed' },
    ],
    labels: ['Agent', '自动化', '验收'],
  },
]

/** Wizard step metadata (rail labels + content headings). */
const WIZARD_STEPS = [
  {
    id: 'category',
    rail: '工作方向',
    title: '这个空间主要做什么？',
    desc: '这有助于我们为你的空间推荐合适的任务类型。',
  },
  {
    id: 'modules',
    rail: '任务与模块',
    title: '设置你的空间',
    desc: '它们是你空间的基础构成。',
  },
  {
    id: 'details',
    rail: '基本信息',
    title: '填写空间信息',
    desc: '为空间设置名称与标识。',
  },
  {
    id: 'workflow',
    rail: '工作流',
    title: '定义你的工作流',
    desc: '先选择预设，再微调状态和标签。',
  },
  {
    id: 'confirm',
    rail: '确认',
    title: '确认空间设置',
    desc: '检查一下，创建后可以随时回到空间里调整。',
  },
]

/** Fresh wizard draft. */
function createDraft() {
  const preset = WORKFLOW_PRESETS[0]
  return {
    step: 0,
    workCategory: 'software_development',
    taskTypes: taskTypeDefaults('software_development').checked,
    modules: { tasks: true, views: true },
    name: '',
    identifier: '',
    identifierTouched: false,
    icon: { emoji: '🛠️', color: 'blue' },
    method: 'template',
    preset: preset.id,
    copyFrom: null,
    statuses: preset.statuses.map((status) => ({ name: status.name, color: status.color })),
    labels: [...preset.labels],
  }
}

/** Normalize one space onto the personal model (drops team-era settings). */
function normalizeSpace(space) {
  if (space === null || typeof space !== 'object') return space
  const next = { ...space }
  delete next.access
  delete next.multiAssignee
  delete next.customerRequests
  delete next.sprintMode
  delete next.members
  const category = CATEGORY_MIGRATION[next.workCategory]
  if (category !== undefined) next.workCategory = category
  const modules = next.modules !== null && typeof next.modules === 'object' ? next.modules : {}
  next.modules = { tasks: true, views: modules.views === true }
  if (Array.isArray(next.taskTypes)) {
    const migrated = new Set()
    for (const id of next.taskTypes) {
      const mapped = TASK_TYPE_MIGRATION[id]
      if (mapped !== undefined) migrated.add(mapped)
    }
    next.taskTypes = [...migrated]
  }
  if (Array.isArray(next.labels)) next.labels = next.labels.filter((label) => typeof label === 'string')
  return next
}

/** Normalize a persisted space list (idempotent). */
function normalizeSpaces(spaces) {
  return Array.isArray(spaces) ? spaces.map(normalizeSpace) : []
}

/* ----------------------------------------------------------------- tasks */

/** localStorage key holding tasks (separate from spaces so a space edit never rewrites them). */
const TASKS_KEY = 'dsh.task-spaces.tasks.v1'

/** Priority scale used by the task editor and list rows. */
const TASK_PRIORITIES = [
  { id: 'none', name: '无', color: null },
  { id: 'low', name: '低', color: '#5b8def' },
  { id: 'medium', name: '中', color: '#e0a03c' },
  { id: 'high', name: '高', color: '#e0783c' },
  { id: 'urgent', name: '紧急', color: '#d65252' },
]

/** Look up a priority definition (falls back to 无). */
function priorityOf(id) {
  return TASK_PRIORITIES.find((entry) => entry.id === id) ?? TASK_PRIORITIES[0]
}

/** Read persisted tasks, tolerating absent or damaged storage and older records. */
function loadTasks() {
  try {
    const raw = window.localStorage.getItem(TASKS_KEY)
    if (raw === null) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((task) => task && typeof task.title === 'string')
      .map((task) => ({
        ...task,
        labels: Array.isArray(task.labels) ? task.labels : [],
        // Fields added after the first task release: default them so old tasks stay usable.
        assignees: Array.isArray(task.assignees) ? task.assignees : [],
        attachments: Array.isArray(task.attachments) ? task.attachments : [],
        comments: Array.isArray(task.comments) ? task.comments : [],
      }))
  } catch {
    return []
  }
}

/** Palette used for assignee avatars, picked deterministically from the name. */
const ASSIGNEE_COLORS = ['#4f7df0', '#2f9e94', '#c256a8', '#e08a3c', '#6c5ce7', '#3f9e6b', '#d65b78', '#96705a']

/** Avatar colour for a person/agent name. */
function assigneeColor(name) {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % 100000
  return ASSIGNEE_COLORS[hash % ASSIGNEE_COLORS.length]
}

/** One-or-two character badge for an assignee name. */
function assigneeInitials(name) {
  const trimmed = name.trim()
  if (trimmed.length === 0) return '?'
  const ascii = /^[a-zA-Z0-9]/.test(trimmed)
  return ascii ? trimmed.slice(0, 2).toUpperCase() : Array.from(trimmed).slice(0, 1).join('')
}

/** Human file size for attachment rows. */
function fileSizeText(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Whether an attachment should render as an image thumbnail. */
function isImageAttachment(type) {
  return typeof type === 'string' && type.startsWith('image/')
}

/** localStorage key remembering the last comment author used in this browser. */
const COMMENT_AUTHOR_KEY = 'dsh.task-spaces.comment-author.v1'

/** Read the remembered comment author ('' when never set). */
function loadCommentAuthor() {
  try {
    return window.localStorage.getItem(COMMENT_AUTHOR_KEY) ?? ''
  } catch {
    return ''
  }
}

/** Remember the comment author for the next comment. */
function saveCommentAuthor(name) {
  try {
    window.localStorage.setItem(COMMENT_AUTHOR_KEY, name)
  } catch {
    /* private mode: the default still works for this session */
  }
}

/** Attachment limits: localStorage has to hold the encoded bytes, so keep it small. */
const ATTACHMENT_MAX_BYTES = 1.5 * 1024 * 1024
const ATTACHMENT_MAX_COUNT = 5

/** Read one File into a data URL (the plugin has no host storage to upload to). */
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error('读取文件失败'))
    reader.readAsDataURL(file)
  })
}

/** Persist tasks; failures are non-fatal. */
function saveTasks(tasks) {
  try {
    window.localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
  } catch {
    /* private mode or quota: the in-memory list still works for this session */
  }
}

/** Stable id for a new task. */
function newTaskId() {
  try {
    return window.crypto.randomUUID()
  } catch {
    return `task-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
  }
}

/* ------------------------------------------------------------ persistence */

/** Read persisted spaces, tolerating absent or damaged storage. */
function loadSpaces() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === null) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? normalizeSpaces(parsed.filter((space) => space && typeof space.name === 'string')) : []
  } catch {
    return []
  }
}

/** Persist spaces; failures are non-fatal. */
function saveSpaces(spaces) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(spaces))
  } catch {
    /* private mode or quota: the in-memory list still works for this session */
  }
}

/** Stable id for a new space. */
function newSpaceId() {
  try {
    return window.crypto.randomUUID()
  } catch {
    return `space-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
  }
}

/** Whether an identifier is already used by another space. */
function identifierTaken(spaces, identifier, exceptId) {
  const wanted = identifier.trim().toUpperCase()
  return spaces.some((space) => space.id !== exceptId && space.identifier.toUpperCase() === wanted)
}

/** Uppercase alphanumeric identifier of 2-7 chars. */
const IDENTIFIER_PATTERN = /^[A-Z0-9]{2,7}$/

/** Suggested identifier from a Latin name, else the category prefix. */
function suggestIdentifier(name, category) {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, '')
  if (letters.length >= 2) return letters.slice(0, 3)
  return CATEGORY_IDENTIFIER[category] ?? 'GEN'
}

/** Human relative time for card footers. */
function relativeTime(timestamp) {
  const diff = Date.now() - timestamp
  if (diff < 60 * 1000) return '刚刚'
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)} 小时前`
  return `${Math.floor(diff / 86400000)} 天前`
}
