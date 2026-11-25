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

/** Work categories offered on step one. */
const WORK_CATEGORIES = [
  { id: 'software_development', name: '软件研发', emoji: '🛠️', desc: '需求、缺陷、迭代与发布' },
  { id: 'project_management', name: '项目管理', emoji: '🗂️', desc: '规划、管理并执行项目' },
  { id: 'product_management', name: '产品管理', emoji: '🧭', desc: '需求梳理与产品路线图' },
  { id: 'marketing', name: '市场营销', emoji: '📣', desc: '营销活动、内容与素材' },
  { id: 'design', name: '设计', emoji: '🎨', desc: '界面设计与创意产出' },
  { id: 'operations', name: '运营', emoji: '📈', desc: '日常运营与增长动作' },
  { id: 'it_support', name: 'IT 支持', emoji: '🖥️', desc: '工单、故障与内部支持' },
  { id: 'human_resources', name: '人力资源', emoji: '👥', desc: '招聘、入转调离' },
  { id: 'customer_service', name: '客户服务', emoji: '🎧', desc: '客户请求与问题跟进' },
  { id: 'legal', name: '法务', emoji: '⚖️', desc: '合同、合规与风险' },
  { id: 'finance', name: '财务', emoji: '🧾', desc: '预算、报销与结算' },
  { id: 'sales', name: '销售', emoji: '🤝', desc: '线索、商机与成交' },
  { id: 'data_science', name: '数据科学', emoji: '📊', desc: '数据探索与模型实验' },
  { id: 'other', name: '其他', emoji: '✨', desc: '以上都不是' },
]

/** Suggested identifier prefix per category. */
const CATEGORY_IDENTIFIER = {
  software_development: 'ENG',
  project_management: 'PM',
  product_management: 'PROD',
  marketing: 'MKT',
  design: 'DSGN',
  operations: 'OPS',
  it_support: 'IT',
  human_resources: 'HR',
  customer_service: 'CS',
  legal: 'LEGAL',
  finance: 'FIN',
  sales: 'SLS',
  data_science: 'DATA',
  other: 'GEN',
}

/** Issue-type templates offered on the task-types step. */
const TASK_TYPE_POOL = [
  { id: 'requirement', name: '需求', desc: '跟踪产品需求与规格。' },
  { id: 'bug', name: '缺陷', desc: '识别并跟踪需要解决的软件缺陷。' },
  { id: 'story', name: '故事', desc: '从用户视角描述的需求。' },
  { id: 'user_story', name: '用户故事', desc: '从最终用户视角描述的功能。' },
  { id: 'feature', name: '功能', desc: '需要构建的新能力或增强。' },
  { id: 'request', name: '请求', desc: '需要分流处理的外部请求。' },
]

/**
 * Default task types per work category: `fixed` is always present, `checked`
 * mirrors the product's onboarding defaults for each category.
 */
function taskTypeDefaults(category) {
  if (category === 'software_development' || category === 'project_management') {
    return { options: ['requirement', 'bug', 'story', 'user_story'], checked: ['requirement', 'bug'] }
  }
  if (category === 'product_management') {
    return { options: ['requirement', 'bug', 'feature', 'user_story'], checked: ['requirement', 'bug'] }
  }
  if (category === 'marketing') {
    return { options: ['requirement', 'feature', 'request'], checked: ['request'] }
  }
  return { options: ['request'], checked: [] }
}

/** Feature modules offered on step two. */
const MODULE_DEFS = [
  {
    id: 'tasks',
    name: '任务',
    icon: 'check-circle',
    desc: '任务用于承载需求、缺陷、技术债和日常工作。你可以指派给成员或 Agent，并在这里跟踪状态、评论和执行结果。',
    locked: true,
  },
  {
    id: 'views',
    name: '视图',
    icon: 'grid',
    desc: '视图用于保存常用的任务筛选和展示方式。按处理人、状态、专项等条件创建视图后，可以快速回到同一套工作视角。',
  },
  {
    id: 'sprints',
    name: '迭代',
    icon: 'workflow',
    desc: '用短而时间盒化的窗口帮助团队保持专注。',
  },
  {
    id: 'projects',
    name: '专项（史诗）',
    icon: 'layers',
    desc: '专项是一场有明确起始和终止时间的攻坚战（通常 1-3 个月结束），对应敏捷开发里的「史诗/Epic」。',
  },
  {
    id: 'triage',
    name: '分拣台',
    icon: 'search',
    desc: '分拣台用于集中处理由外部应用集成和访客创建的任务。你可以在这里审核、设置优先级，再决定接受或拒绝任务。',
  },
]

/** Sprint planning modes shown when the 迭代 module is on. */
const SPRINT_MODES = [
  {
    id: 'automatic',
    name: '自动周期模式（Linear 模式）',
    desc: '系统按周期创建未来迭代，按计划开始和完成迭代，并自动顺延未完成工作。',
  },
  {
    id: 'manual',
    name: '手动模式（Jira 模式）',
    desc: '由你手动创建、开始和完成迭代，不进行自动排期维护。',
  },
]

/* ---------------------------------------------------------- workflow data */

/** Status category colours shared by presets and the editor. */
const STATUS_COLORS = {
  backlog: '#8b8f98',
  unstarted: '#5b8def',
  started: '#e0a03c',
  completed: '#3fa56e',
  canceled: '#b6bbc4',
}

/** Workflow presets offered on step four. */
const WORKFLOW_PRESETS = [
  {
    id: 'starter',
    name: '入门',
    subtitle: '标准组织工作流',
    statuses: [
      { name: '待办', color: 'backlog' },
      { name: '进行中', color: 'started' },
      { name: '已完成', color: 'completed' },
    ],
    labels: ['bug', 'docs', 'urgent'],
  },
  {
    id: 'marketing',
    name: '市场营销',
    subtitle: '高效推进营销活动',
    statuses: [
      { name: '想法', color: 'backlog' },
      { name: '制作中', color: 'started' },
      { name: '审核中', color: 'unstarted' },
      { name: '已发布', color: 'completed' },
    ],
    labels: ['内容', '素材', '活动'],
  },
  {
    id: 'pm',
    name: '项目管理',
    subtitle: '规划、管理并执行',
    statuses: [
      { name: '待规划', color: 'backlog' },
      { name: '进行中', color: 'started' },
      { name: '待验收', color: 'unstarted' },
      { name: '已完成', color: 'completed' },
    ],
    labels: ['里程碑', '风险', '阻塞'],
  },
  {
    id: 'product',
    name: '产品 + 工程',
    subtitle: '简化产品生命周期',
    statuses: [
      { name: 'Backlog', color: 'backlog' },
      { name: '待办', color: 'unstarted' },
      { name: '进行中', color: 'started' },
      { name: '评审中', color: 'started' },
      { name: '已完成', color: 'completed' },
    ],
    labels: ['bug', 'frontend', 'urgent'],
  },
]

/** Wizard step metadata (rail labels + content headings). */
const WIZARD_STEPS = [
  {
    id: 'category',
    rail: '工作类型',
    title: '该空间主要做什么类型的工作？',
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
    id: 'access',
    rail: '权限与确认',
    title: '空间访问权限与设置',
    desc: '选择谁可以看到此空间，并可选择复制另一个空间的设置。',
  },
]

/** Fresh wizard draft. */
function createDraft() {
  const preset = WORKFLOW_PRESETS.find((item) => item.id === 'product') ?? WORKFLOW_PRESETS[0]
  return {
    step: 0,
    workCategory: 'software_development',
    taskTypes: taskTypeDefaults('software_development').checked,
    modules: { tasks: true, views: true, sprints: false, projects: false, triage: false },
    sprintMode: 'automatic',
    name: '',
    identifier: '',
    identifierTouched: false,
    icon: { emoji: '🛠️', color: 'blue' },
    method: 'template',
    preset: preset.id,
    copyFrom: null,
    statuses: preset.statuses.map((status) => ({ name: status.name, color: status.color })),
    labels: [...preset.labels],
    access: 'public',
    customerRequests: false,
    multiAssignee: false,
  }
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
    return Array.isArray(parsed) ? parsed.filter((space) => space && typeof space.name === 'string') : []
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
