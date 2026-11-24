/* Built by scripts/build.mjs — edit src/*.js instead. */
window.__ModuleLoader__.load({
	id: "dsh-plugin-task-spaces",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		const React = require("react");
		const primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		const { createPortal } = require("react-dom");

		// ---- src/00-preface.js ----
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

		// ---- src/05-styles.js ----
/**
 * Task-spaces stylesheet.
 *
 * Injected once at plugin materialization (tagged with data-plugin so the
 * client module system owns it). Everything is expressed with the DSH theme
 * tokens, so the surface follows light/dark and theme swaps without local
 * colour literals — except the space icon palette, which is content.
 */

const TASK_SPACES_CSS = `
[data-dsh-task-spaces] {
  --ts-radius-lg: 16px;
  --ts-radius-md: var(--dsw-radius-md, 10px);
  --ts-radius-sm: var(--dsw-radius-sm, 8px);
  --ts-hover: color-mix(in srgb, var(--dsw-alias-label-primary) 6%, transparent);
  --ts-hover-strong: color-mix(in srgb, var(--dsw-alias-label-primary) 10%, transparent);
  --ts-soft: color-mix(in srgb, var(--dsw-alias-label-primary) 4%, transparent);
  --ts-border: var(--dsw-alias-border-l1);
  --ts-border-strong: var(--dsw-alias-border-l2, var(--dsw-alias-border-l1));
  --ts-focus: var(--dsw-alias-brand-primary);
  --ts-accent: var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary));
  --ts-accent-soft: color-mix(in srgb, var(--ts-accent) 14%, transparent);
  --ts-accent-border: color-mix(in srgb, var(--ts-accent) 62%, transparent);
  height: 100%;
  min-height: 0;
  overflow: auto;
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-base);
  font-size: 14px;
  line-height: 1.55;
}

[data-dsh-task-spaces] * { box-sizing: border-box; }

/* ------------------------------------------------------------ page shell */

.ts-page { min-height: 100%; padding: 40px 48px 64px; }
.ts-page-inner { max-width: 1080px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }

.ts-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; }
.ts-title { margin: 0; font-size: 24px; line-height: 32px; font-weight: 650; letter-spacing: -0.01em; }
.ts-sub { margin: 8px 0 0; max-width: 640px; color: var(--dsw-alias-label-secondary); font-size: 13.5px; }

.ts-toolbar { display: flex; align-items: center; gap: 12px; }
.ts-count { color: var(--dsw-alias-label-secondary); font-size: 12.5px; }

.ts-seg {
  display: inline-flex; align-items: center; gap: 2px; padding: 3px;
  border-radius: 999px; background: var(--ts-soft);
  border: 0.5px solid var(--ts-border);
}
.ts-seg-item {
  appearance: none; border: 0; background: transparent; color: var(--dsw-alias-label-secondary);
  height: 28px; padding: 0 12px; border-radius: 999px; cursor: pointer;
  font-size: 12.5px; font-family: inherit; transition: background 120ms ease, color 120ms ease;
}
.ts-seg-item:hover { color: var(--dsw-alias-label-primary); }
.ts-seg-item[data-active="true"] {
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  box-shadow: 0 1px 2px color-mix(in srgb, #000 18%, transparent);
}

/* ----------------------------------------------------------------- cards */

.ts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }

.ts-card {
  position: relative; display: flex; flex-direction: column; gap: 14px; height: 100%;
  padding: 18px; border-radius: var(--ts-radius-lg);
  background: var(--dsw-alias-bg-layer-1);
  border: 0.5px solid var(--ts-border);
  transition: border-color 140ms ease, transform 140ms ease, box-shadow 140ms ease;
}
.ts-card:hover {
  border-color: var(--ts-border-strong);
  transform: translateY(-1px);
  box-shadow: 0 8px 24px color-mix(in srgb, #000 14%, transparent);
}
.ts-card[data-flash="true"] { animation: ts-card-flash 1.6s ease-out 1; }
@keyframes ts-card-flash {
  0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--dsw-alias-brand-primary) 55%, transparent); }
  45% { box-shadow: 0 0 0 4px color-mix(in srgb, var(--dsw-alias-brand-primary) 26%, transparent); }
  100% { box-shadow: 0 0 0 0 transparent; }
}

.ts-card-head { display: flex; align-items: flex-start; gap: 12px; }
.ts-card-main { min-width: 0; flex: 1; }
.ts-card-title {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  font-size: 15px; font-weight: 600; line-height: 22px;
}
.ts-card-sub { margin-top: 2px; color: var(--dsw-alias-label-secondary); font-size: 12.5px; }

.ts-icon-badge {
  flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center;
  width: 40px; height: 40px; border-radius: 12px; font-size: 20px; line-height: 1;
  color: #fff; box-shadow: inset 0 0 0 0.5px color-mix(in srgb, #fff 22%, transparent);
}
.ts-icon-badge[data-size="sm"] { width: 26px; height: 26px; border-radius: 8px; font-size: 14px; }
.ts-icon-badge[data-size="lg"] { width: 48px; height: 48px; border-radius: 14px; font-size: 24px; }

.ts-id-badge {
  display: inline-flex; align-items: center; gap: 4px; height: 20px; padding: 0 7px;
  border-radius: 6px; font-size: 11px; font-weight: 600; letter-spacing: 0.04em;
  color: var(--dsw-alias-label-secondary);
  background: var(--ts-soft); border: 0.5px solid var(--ts-border);
}

.ts-card-menu { position: relative; flex: 0 0 auto; }
.ts-icon-btn {
  appearance: none; display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; padding: 0; border: 0; border-radius: 8px;
  background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer;
  transition: background 120ms ease, color 120ms ease;
}
.ts-icon-btn:hover { background: var(--ts-hover); color: var(--dsw-alias-label-primary); }
.ts-icon-btn[data-danger="true"]:hover { color: var(--dsw-alias-state-error-primary); }

.ts-menu {
  position: absolute; right: 0; top: 32px; z-index: 20; min-width: 168px; padding: 4px;
  border-radius: 10px; background: var(--dsw-alias-bg-layer-1);
  border: 0.5px solid var(--ts-border-strong);
  box-shadow: 0 12px 30px color-mix(in srgb, #000 28%, transparent);
}
.ts-menu-item {
  appearance: none; display: flex; align-items: center; gap: 8px; width: 100%;
  height: 32px; padding: 0 10px; border: 0; border-radius: 7px; background: transparent;
  color: var(--dsw-alias-label-primary); font-size: 13px; font-family: inherit;
  cursor: pointer; text-align: left;
}
.ts-menu-item:hover { background: var(--ts-hover); }
.ts-menu-item[data-danger="true"] { color: var(--dsw-alias-state-error-primary); }

.ts-card-section { display: flex; flex-direction: column; gap: 7px; }
.ts-section-label {
  font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--dsw-alias-label-secondary); opacity: 0.85;
}
.ts-chip-row { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
.ts-chip {
  display: inline-flex; align-items: center; gap: 5px; height: 22px; padding: 0 8px;
  border-radius: 6px; font-size: 12px; color: var(--dsw-alias-label-secondary);
  background: var(--ts-soft); border: 0.5px solid var(--ts-border);
}
.ts-chip[data-tone="accent"] {
  color: var(--dsw-alias-label-primary);
  background: var(--ts-accent-soft);
  border-color: var(--ts-accent-border);
}
.ts-dot { width: 7px; height: 7px; border-radius: 50%; flex: 0 0 auto; }

.ts-card-foot {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding-top: 12px; border-top: 0.5px dashed var(--ts-border);
  color: var(--dsw-alias-label-secondary); font-size: 12px;
}
.ts-card-foot-left { display: inline-flex; align-items: center; gap: 6px; }

/* ------------------------------------------------------------- empty state */

.ts-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px;
  padding: 56px 24px; text-align: center; border-radius: var(--ts-radius-lg);
  border: 1px dashed var(--ts-border-strong); background: var(--ts-soft);
}
.ts-empty-badge {
  display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px;
  border-radius: 18px; color: var(--dsw-alias-brand-primary);
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, transparent);
}
.ts-empty-title { font-size: 16px; font-weight: 600; }
.ts-empty-desc { max-width: 460px; color: var(--dsw-alias-label-secondary); font-size: 13px; }

/* ------------------------------------------------------------- primitives */

.ts-btn {
  appearance: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  height: 34px; padding: 0 14px; border-radius: var(--ts-radius-sm);
  border: 0.5px solid transparent; background: transparent;
  color: var(--dsw-alias-label-primary); font-family: inherit; font-size: 13px; font-weight: 500;
  cursor: pointer; transition: background 120ms ease, border-color 120ms ease, opacity 120ms ease;
  white-space: nowrap;
}
.ts-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.ts-btn[data-kind="primary"] {
  background: var(--dsw-alias-button-primary-fill, var(--dsw-alias-brand-primary));
  color: var(--dsw-alias-label-primary-foreground, #fff);
}
.ts-btn[data-kind="primary"]:hover:not(:disabled) {
  background: var(--dsw-alias-button-primary-hover, var(--dsw-alias-brand-primary));
}
.ts-btn[data-kind="outline"] { border-color: var(--ts-border-strong); }
.ts-btn[data-kind="outline"]:hover:not(:disabled) { background: var(--ts-hover); }
.ts-btn[data-kind="ghost"] { color: var(--dsw-alias-label-secondary); }
.ts-btn[data-kind="ghost"]:hover:not(:disabled) { background: var(--ts-hover); color: var(--dsw-alias-label-primary); }
.ts-btn[data-kind="danger"] { color: var(--dsw-alias-state-error-primary); border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 40%, transparent); }
.ts-btn[data-kind="danger"]:hover:not(:disabled) { background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent); }

.ts-input {
  width: 100%; height: 36px; padding: 0 11px; border-radius: var(--ts-radius-sm);
  border: 0.5px solid var(--ts-border-strong); background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary); font-family: inherit; font-size: 13.5px;
  transition: border-color 120ms ease, box-shadow 120ms ease;
}
.ts-input::placeholder { color: var(--dsw-alias-label-secondary); opacity: 0.75; }
.ts-input:focus {
  outline: none; border-color: var(--ts-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ts-accent) 20%, transparent);
}
.ts-input[data-invalid="true"] { border-color: var(--dsw-alias-state-error-primary); }

.ts-field { display: flex; flex-direction: column; gap: 7px; }
.ts-field-label { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 13px; font-weight: 550; }
.ts-field-hint { color: var(--dsw-alias-label-secondary); font-size: 12px; }
.ts-field-error { color: var(--dsw-alias-state-error-primary); font-size: 12px; }
.ts-counter { color: var(--dsw-alias-label-secondary); font-size: 12px; font-variant-numeric: tabular-nums; }

.ts-switch {
  position: relative; flex: 0 0 auto; width: 36px; height: 20px; padding: 2px;
  border: 0; border-radius: 999px; background: var(--ts-border-strong); cursor: pointer;
  transition: background 140ms ease;
}
.ts-switch[aria-checked="true"] { background: var(--dsw-alias-brand-primary); }
.ts-switch:disabled { opacity: 0.5; cursor: default; }
.ts-switch-thumb {
  display: block; width: 16px; height: 16px; border-radius: 50%;
  background: var(--dsw-alias-label-primary-foreground, #fff);
  transition: transform 140ms ease;
}
.ts-switch[aria-checked="true"] .ts-switch-thumb { transform: translateX(16px); }

.ts-radio {
  appearance: none; flex: 0 0 auto; width: 16px; height: 16px; margin: 0;
  border-radius: 50%; border: 1.5px solid var(--ts-border-strong); background: transparent;
  cursor: pointer; position: relative;
}
.ts-radio:checked { border-color: var(--ts-accent); }
.ts-radio:checked::after {
  content: ""; position: absolute; inset: 2.5px; border-radius: 50%;
  background: var(--ts-accent);
}

/* --------------------------------------------------------- overlay + shell */

.ts-overlay { position: fixed; inset: 0; z-index: 1200; display: flex; align-items: center; justify-content: center; padding: 32px; }
.ts-mask {
  position: absolute; inset: 0;
  background: color-mix(in srgb, #000 52%, transparent);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  animation: ts-fade-in 160ms ease-out 1;
}
.ts-dialog {
  position: relative; display: flex; width: min(1060px, 94vw); height: min(740px, 90vh);
  border-radius: 20px; overflow: hidden;
  background: var(--dsw-alias-bg-layer-1);
  border: 0.5px solid var(--ts-border-strong);
  box-shadow: 0 32px 80px color-mix(in srgb, #000 42%, transparent);
  animation: ts-pop-in 180ms cubic-bezier(0.2, 0.9, 0.3, 1) 1;
}
@keyframes ts-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes ts-pop-in { from { opacity: 0; transform: translateY(10px) scale(0.985); } to { opacity: 1; transform: none; } }

.ts-rail {
  flex: 0 0 268px; display: flex; flex-direction: column;
  padding: 26px 20px 20px; gap: 22px;
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 3.5%, transparent);
  border-right: 0.5px solid var(--ts-border);
  overflow: auto;
}
.ts-rail-eyebrow { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dsw-alias-label-secondary); }
.ts-rail-title { margin: 4px 0 0; font-size: 19px; font-weight: 650; letter-spacing: -0.01em; }
.ts-rail-progress { margin-top: 6px; color: var(--dsw-alias-label-secondary); font-size: 12.5px; }
.ts-steps { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
.ts-step {
  appearance: none; display: flex; align-items: flex-start; gap: 10px; width: 100%;
  padding: 9px 10px; border: 0; border-radius: 10px; background: transparent;
  color: var(--dsw-alias-label-secondary); font-family: inherit; text-align: left;
  cursor: default; transition: background 120ms ease, color 120ms ease;
}
.ts-step[data-status="done"], .ts-step[data-status="current"] { cursor: pointer; color: var(--dsw-alias-label-primary); }
.ts-step:hover[data-status="done"], .ts-step:hover[data-status="current"] { background: var(--ts-hover); }
.ts-step[data-status="current"] { background: var(--ts-hover-strong); }
.ts-step-num {
  flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; margin-top: 1px; border-radius: 50%;
  border: 1px solid var(--ts-border-strong); font-size: 11.5px; font-weight: 600;
  color: var(--dsw-alias-label-secondary);
}
.ts-step[data-status="done"] .ts-step-num {
  border-color: transparent; color: var(--dsw-alias-bg-base);
  background: var(--dsw-alias-state-success-primary, #3fa56e);
}
.ts-step[data-status="current"] .ts-step-num {
  border-color: transparent; color: var(--dsw-alias-bg-base);
  background: var(--ts-accent);
}
.ts-step-text { min-width: 0; display: flex; flex-direction: column; }
.ts-step-label { display: block; font-size: 13px; font-weight: 550; line-height: 22px; }
.ts-step-caption { display: block; font-size: 11.5px; color: var(--dsw-alias-label-secondary); line-height: 1.45; }
.ts-rail-foot {
  margin-top: auto; display: flex; gap: 8px; padding: 12px;
  border-radius: 10px; border: 0.5px dashed var(--ts-border);
  color: var(--dsw-alias-label-secondary); font-size: 11.5px; line-height: 1.5;
}

.ts-content { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.ts-content-head { padding: 26px 32px 14px; }
.ts-content-title { margin: 0; font-size: 18px; font-weight: 650; letter-spacing: -0.01em; }
.ts-content-desc { margin: 5px 0 0; color: var(--dsw-alias-label-secondary); font-size: 13px; }
.ts-content-body { flex: 1; min-height: 0; overflow: auto; padding: 6px 32px 24px; }
.ts-footer {
  display: flex; align-items: center; gap: 8px; padding: 16px 32px;
  border-top: 0.5px solid var(--ts-border);
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 2%, transparent);
}
.ts-footer-spacer { flex: 1; }

/* ------------------------------------------------------------ step content */

.ts-stack { display: flex; flex-direction: column; gap: 20px; }
.ts-split { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }

.ts-cat-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.ts-cat {
  display: flex; align-items: flex-start; gap: 12px; padding: 13px 14px; text-align: left;
  border-radius: 12px; border: 0.5px solid var(--ts-border); background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary); font-family: inherit; font-size: 13px; cursor: pointer;
  transition: border-color 120ms ease, background 120ms ease, transform 120ms ease;
}
.ts-cat:hover { border-color: var(--ts-border-strong); background: var(--ts-soft); }
.ts-cat[aria-checked="true"] {
  border-color: var(--ts-accent-border);
  background: var(--ts-accent-soft);
}
.ts-cat-emoji { font-size: 20px; line-height: 1.2; }
.ts-cat-text { min-width: 0; flex: 1; }
.ts-cat-name { display: block; font-weight: 600; font-size: 13.5px; }
.ts-cat-desc { display: block; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 1.45; }
.ts-cat-check {
  flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; margin-top: 2px; border-radius: 50%;
  border: 1px solid var(--ts-border-strong); color: transparent;
}
.ts-cat[aria-checked="true"] .ts-cat-check {
  border-color: transparent; color: var(--dsw-alias-bg-base); background: var(--ts-accent);
}

.ts-block { display: flex; flex-direction: column; gap: 10px; }
.ts-block-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.ts-block-title { font-size: 13.5px; font-weight: 600; }
.ts-block-hint { color: var(--dsw-alias-label-secondary); font-size: 12px; }

.ts-checkcards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.ts-checkcard {
  display: flex; align-items: flex-start; gap: 10px; padding: 11px 12px; text-align: left;
  border-radius: 10px; border: 0.5px solid var(--ts-border); background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary); font-family: inherit; font-size: 13px; cursor: pointer;
  transition: border-color 120ms ease, background 120ms ease;
}
.ts-checkcard:hover { border-color: var(--ts-border-strong); background: var(--ts-soft); }
.ts-checkcard[aria-checked="true"] {
  border-color: var(--ts-accent-border);
  background: var(--ts-accent-soft);
}
.ts-checkcard[data-locked="true"] { cursor: default; }
.ts-box {
  flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center;
  width: 17px; height: 17px; margin-top: 1px; border-radius: 5px;
  border: 1px solid var(--ts-border-strong); color: transparent; background: transparent;
}
.ts-checkcard[aria-checked="true"] .ts-box {
  border-color: transparent; color: var(--dsw-alias-bg-base);
  background: var(--ts-accent);
}
.ts-checkcard[data-locked="true"] .ts-box { opacity: 0.7; }
.ts-checkcard-text { min-width: 0; }
.ts-checkcard-name { display: block; font-weight: 550; line-height: 20px; }
.ts-checkcard-desc { display: block; color: var(--dsw-alias-label-secondary); font-size: 11.5px; line-height: 1.4; }

.ts-module-list { display: flex; flex-direction: column; border: 0.5px solid var(--ts-border); border-radius: 12px; overflow: hidden; }
.ts-module { display: flex; gap: 12px; padding: 13px 14px; align-items: flex-start; background: var(--dsw-alias-bg-base); }
.ts-module + .ts-module { border-top: 0.5px solid var(--ts-border); }
.ts-module-icon {
  flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border-radius: 9px; color: var(--dsw-alias-label-secondary);
  background: var(--ts-soft); border: 0.5px solid var(--ts-border);
}
.ts-module-body { flex: 1; min-width: 0; }
.ts-module-name { display: flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 600; }
.ts-module-desc { margin-top: 2px; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 1.5; }

.ts-inline-note {
  display: flex; align-items: flex-start; gap: 8px; padding: 10px 12px;
  border-radius: 10px; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 1.5;
  background: var(--ts-soft); border: 0.5px dashed var(--ts-border);
}
.ts-inline-note svg { flex: 0 0 auto; margin-top: 2px; opacity: 0.8; }

.ts-sprint-modes { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 12px 14px; background: color-mix(in srgb, var(--dsw-alias-label-primary) 3%, transparent); }
.ts-radio-card {
  display: flex; align-items: flex-start; gap: 9px; padding: 10px 11px; text-align: left;
  border-radius: 10px; border: 0.5px solid var(--ts-border); background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary); font-family: inherit; font-size: 12.5px; cursor: pointer;
}
.ts-radio-card[aria-checked="true"] {
  border-color: var(--ts-accent-border);
  background: var(--ts-accent-soft);
}
.ts-radio-card-name { display: block; font-weight: 550; line-height: 1.4; }
.ts-radio-card-desc { display: block; margin-top: 2px; color: var(--dsw-alias-label-secondary); font-size: 11.5px; line-height: 1.45; }

/* -------------------------------------------------------------- icon edit */

.ts-icon-editor {
  display: flex; gap: 16px; padding: 16px;
  border-radius: 14px; border: 0.5px solid var(--ts-border);
  background: var(--dsw-alias-bg-base);
}
.ts-icon-preview {
  flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center;
  width: 64px; height: 64px; border-radius: 18px; font-size: 30px; line-height: 1; color: #fff;
  box-shadow: inset 0 0 0 0.5px color-mix(in srgb, #fff 22%, transparent);
}
.ts-icon-picker { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 10px; }
.ts-swatches { display: flex; flex-wrap: wrap; gap: 7px; }
.ts-swatch {
  appearance: none; width: 20px; height: 20px; padding: 0; border-radius: 50%;
  border: 2px solid transparent; cursor: pointer; position: relative;
  box-shadow: inset 0 0 0 0.5px color-mix(in srgb, #fff 28%, transparent);
}
.ts-swatch[aria-checked="true"] { border-color: var(--dsw-alias-bg-base); box-shadow: 0 0 0 2px currentColor; }
.ts-emoji-grid { display: flex; flex-wrap: wrap; gap: 3px; }
.ts-emoji {
  appearance: none; width: 30px; height: 30px; padding: 0; border-radius: 8px;
  border: 0.5px solid transparent; background: transparent; font-size: 16px; line-height: 1;
  cursor: pointer; transition: background 100ms ease, border-color 100ms ease;
}
.ts-emoji:hover { background: var(--ts-hover); }
.ts-emoji[aria-checked="true"] { border-color: var(--ts-accent-border); background: var(--ts-accent-soft); }

.ts-preview-card {
  display: flex; align-items: center; gap: 10px; padding: 10px 12px;
  border-radius: 10px; border: 0.5px dashed var(--ts-border);
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 2.5%, transparent);
  font-size: 12px; color: var(--dsw-alias-label-secondary);
}
.ts-preview-name { color: var(--dsw-alias-label-primary); font-weight: 600; font-size: 13px; }

.ts-identifier-wrap { display: flex; align-items: center; gap: 8px; }
.ts-identifier-wrap .ts-input { text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
.ts-task-id {
  display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 12px;
  border-radius: var(--ts-radius-sm); border: 0.5px solid var(--ts-border);
  background: var(--ts-soft); color: var(--dsw-alias-label-secondary);
  font-size: 12px; white-space: nowrap; font-variant-numeric: tabular-nums;
}

/* --------------------------------------------------------------- workflow */

.ts-method { display: inline-flex; padding: 3px; gap: 2px; border-radius: 10px; background: var(--ts-soft); border: 0.5px solid var(--ts-border); }
.ts-method button {
  appearance: none; border: 0; background: transparent; color: var(--dsw-alias-label-secondary);
  height: 28px; padding: 0 12px; border-radius: 7px; font-family: inherit; font-size: 12.5px; cursor: pointer;
}
.ts-method button:disabled { opacity: 0.4; cursor: not-allowed; }
.ts-method button[data-active="true"] { background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); }

.ts-preset-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.ts-preset {
  display: flex; flex-direction: column; gap: 9px; padding: 13px 14px; text-align: left;
  border-radius: 12px; border: 0.5px solid var(--ts-border); background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary); font-family: inherit; cursor: pointer;
  transition: border-color 120ms ease, background 120ms ease;
}
.ts-preset:hover { border-color: var(--ts-border-strong); background: var(--ts-soft); }
.ts-preset[aria-checked="true"] {
  border-color: var(--ts-accent-border);
  background: var(--ts-accent-soft);
}
.ts-preset-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.ts-preset-check {
  flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; border-radius: 50%; border: 1px solid var(--ts-border-strong); color: transparent;
}
.ts-preset[aria-checked="true"] .ts-preset-check { border-color: transparent; color: var(--dsw-alias-bg-base); background: var(--ts-accent); }
.ts-preset-name { display: block; font-size: 13.5px; font-weight: 600; }
.ts-preset-sub { display: block; color: var(--dsw-alias-label-secondary); font-size: 11.5px; margin-top: 1px; }
.ts-status-chain { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }
.ts-status-pill {
  display: inline-flex; align-items: center; gap: 5px; height: 20px; padding: 0 7px;
  border-radius: 5px; font-size: 11px; color: var(--dsw-alias-label-secondary);
  background: var(--ts-soft); border: 0.5px solid var(--ts-border);
}
.ts-preset-labels { display: flex; flex-wrap: wrap; gap: 4px; }
.ts-label-chip {
  display: inline-flex; align-items: center; gap: 4px; height: 20px; padding: 0 7px;
  border-radius: 999px; font-size: 11px; color: var(--dsw-alias-label-secondary);
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 10%, transparent);
}

.ts-editor { display: flex; flex-direction: column; gap: 8px; padding: 14px; border-radius: 12px; border: 0.5px solid var(--ts-border); background: var(--dsw-alias-bg-base); }
.ts-editor-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
.ts-editor-title { font-size: 13px; font-weight: 600; }
.ts-editor-hint { color: var(--dsw-alias-label-secondary); font-size: 11.5px; }
.ts-status-rows, .ts-label-rows { display: flex; flex-direction: column; gap: 4px; }
.ts-status-row { display: flex; align-items: center; gap: 8px; padding: 3px 4px; border-radius: 7px; }
.ts-status-row:hover { background: var(--ts-soft); }
.ts-status-name {
  flex: 1; min-width: 0; height: 28px; padding: 0 8px; border: 0.5px solid transparent;
  border-radius: 6px; background: transparent; color: var(--dsw-alias-label-primary);
  font-family: inherit; font-size: 12.5px;
}
.ts-status-name:hover { border-color: var(--ts-border); }
.ts-status-name:focus { outline: none; border-color: var(--dsw-alias-brand-primary); background: var(--dsw-alias-bg-base); }
.ts-status-actions { display: inline-flex; align-items: center; gap: 2px; opacity: 0.5; transition: opacity 120ms ease; }
.ts-status-row:hover .ts-status-actions { opacity: 1; }
.ts-star-btn {
  appearance: none; border: 0; background: transparent; color: var(--dsw-alias-label-secondary);
  width: 24px; height: 24px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer;
}
.ts-star-btn:hover { background: var(--ts-hover); }
.ts-star-btn[data-default="true"] { color: var(--dsw-alias-state-warn-primary, #e0a03c); }
.ts-label-rows { flex-direction: row; flex-wrap: wrap; }
.ts-label-tag {
  display: inline-flex; align-items: center; gap: 5px; height: 24px; padding: 0 8px 0 9px;
  border-radius: 999px; font-size: 11.5px; color: var(--dsw-alias-label-secondary);
  background: var(--ts-soft); border: 0.5px solid var(--ts-border);
}
.ts-label-tag button {
  appearance: none; border: 0; background: transparent; color: inherit; padding: 0;
  display: inline-flex; cursor: pointer; opacity: 0.65; border-radius: 50%;
}
.ts-label-tag button:hover { opacity: 1; }
.ts-add-inline { display: flex; align-items: center; gap: 6px; padding-top: 4px; }
.ts-add-inline input {
  width: 150px; height: 28px; padding: 0 9px; border-radius: 7px;
  border: 0.5px dashed var(--ts-border-strong); background: transparent;
  color: var(--dsw-alias-label-primary); font-family: inherit; font-size: 12px;
}
.ts-add-inline input:focus { outline: none; border-style: solid; border-color: var(--dsw-alias-brand-primary); }
.ts-add-inline button {
  appearance: none; height: 28px; padding: 0 10px; border-radius: 7px; border: 0;
  background: var(--ts-hover); color: var(--dsw-alias-label-primary); font-family: inherit;
  font-size: 12px; cursor: pointer;
}
.ts-add-inline button:disabled { opacity: 0.4; cursor: not-allowed; }

/* ------------------------------------------------------------ access + sum */

.ts-access-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ts-access-card {
  display: flex; align-items: flex-start; gap: 10px; padding: 13px 14px; text-align: left;
  border-radius: 12px; border: 0.5px solid var(--ts-border); background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary); font-family: inherit; font-size: 13px; cursor: pointer;
}
.ts-access-card[aria-checked="true"] {
  border-color: var(--ts-accent-border);
  background: var(--ts-accent-soft);
}
.ts-access-body { flex: 1; min-width: 0; }
.ts-access-name { display: flex; align-items: center; gap: 7px; font-weight: 600; }
.ts-access-hint { display: block; margin-top: 3px; color: var(--dsw-alias-label-secondary); font-size: 11.5px; line-height: 1.5; }
.ts-access-check {
  flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; border-radius: 50%; border: 1px solid var(--ts-border-strong); color: transparent;
}
.ts-access-card[aria-checked="true"] .ts-access-check { border-color: transparent; color: var(--dsw-alias-bg-base); background: var(--ts-accent); }

.ts-summary {
  display: flex; flex-direction: column; gap: 0; border-radius: 14px;
  border: 0.5px solid var(--ts-border); overflow: hidden;
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 2%, transparent);
}
.ts-summary-head { display: flex; align-items: center; gap: 12px; padding: 15px 16px; background: var(--dsw-alias-bg-base); }
.ts-summary-name { font-size: 15px; font-weight: 650; }
.ts-summary-sub { color: var(--dsw-alias-label-secondary); font-size: 12px; }
.ts-summary-row { display: flex; align-items: flex-start; gap: 16px; padding: 10px 16px; border-top: 0.5px solid var(--ts-border); }
.ts-summary-key { flex: 0 0 84px; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 22px; }
.ts-summary-val { flex: 1; min-width: 0; display: flex; flex-wrap: wrap; gap: 5px; align-items: center; font-size: 12.5px; }

/* ---------------------------------------------------------------- overlays */

.ts-toast {
  position: fixed; left: 50%; bottom: 34px; transform: translateX(-50%); z-index: 1400;
  display: flex; align-items: center; gap: 9px; height: 40px; padding: 0 16px;
  border-radius: 999px; font-size: 13px;
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-overlay, var(--dsw-alias-bg-layer-1));
  border: 0.5px solid var(--ts-border-strong);
  box-shadow: 0 14px 36px color-mix(in srgb, #000 32%, transparent);
  animation: ts-toast-in 200ms cubic-bezier(0.2, 0.9, 0.3, 1) 1;
}
@keyframes ts-toast-in { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }
.ts-toast-icon { color: var(--dsw-alias-state-success-primary, #3fa56e); display: inline-flex; }

.ts-confirm {
  position: relative; width: min(440px, 92vw); padding: 22px;
  border-radius: 16px; background: var(--dsw-alias-bg-layer-1);
  border: 0.5px solid var(--ts-border-strong);
  box-shadow: 0 30px 70px color-mix(in srgb, #000 40%, transparent);
  animation: ts-pop-in 160ms cubic-bezier(0.2, 0.9, 0.3, 1) 1;
}
.ts-confirm-title { margin: 0; font-size: 16px; font-weight: 650; }
.ts-confirm-desc { margin: 8px 0 0; color: var(--dsw-alias-label-secondary); font-size: 13px; line-height: 1.6; }
.ts-confirm-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }

/* -------------------------------------------------------------- responsive */

@media (max-width: 900px) {
  .ts-page { padding: 24px 20px 48px; }
  .ts-dialog { flex-direction: column; width: 96vw; height: 92vh; }
  .ts-rail { flex: 0 0 auto; flex-direction: row; align-items: center; gap: 10px; padding: 14px 16px; overflow-x: auto; border-right: 0; border-bottom: 0.5px solid var(--ts-border); }
  .ts-rail-head, .ts-rail-foot { display: none; }
  .ts-steps { flex-direction: row; }
  .ts-step { width: auto; padding: 6px 8px; }
  .ts-step-caption { display: none; }
  .ts-content-head { padding: 18px 20px 10px; }
  .ts-content-body { padding: 4px 20px 18px; }
  .ts-footer { padding: 12px 20px; }
  .ts-cat-grid, .ts-checkcards, .ts-preset-grid, .ts-access-grid, .ts-split, .ts-sprint-modes { grid-template-columns: 1fr; }
}
`

/** Inject the stylesheet once (idempotent across reloads and HMR remounts). */
function installStyles() {
  if (typeof document === 'undefined') return
  const selector = 'style[data-plugin-css=' + JSON.stringify(CSS_TAG_ID) + ']'
  if (document.querySelector(selector) !== null) return
  const tag = document.createElement('style')
  tag.dataset.plugin = 'dsh-plugin-task-spaces'
  tag.dataset.pluginCss = CSS_TAG_ID
  tag.textContent = TASK_SPACES_CSS
  document.head.appendChild(tag)
}

		// ---- src/10-ui.js ----
/**
 * Small UI kit shared by the spaces page and the create-space wizard.
 *
 * These are deliberately local components rather than DSH primitives: the
 * wizard needs a wider range of shapes (selectable cards, switch rows, chips,
 * swatches) than the shipped primitive set, and local components keep the
 * plugin package dependency-free.
 */

/** Resolve a palette id to its colour, falling back to the neutral swatch. */
function spaceColor(colorId) {
  const swatch = COLOR_SWATCHES.find((entry) => entry.id === colorId)
  return swatch === undefined ? COLOR_SWATCHES[0].hex : swatch.hex
}

/** Square space-glyph badge. */
function SpaceBadge({ icon, size = 'md' }) {
  return h(
    'span',
    {
      className: 'ts-icon-badge',
      'data-size': size,
      style: { background: spaceColor(icon.color) },
      'aria-hidden': 'true',
    },
    icon.emoji,
  )
}

/** One button with the kit's visual kinds. */
function Btn({ kind = 'ghost', icon, children, ...rest }) {
  return h('button', { type: 'button', className: 'ts-btn', 'data-kind': kind, ...rest }, icon === undefined ? null : h(Icon, { name: icon, size: 14 }), children)
}

/** Labelled switch row used for modules and preferences. */
function Switch({ checked, onChange, disabled = false, label }) {
  return h(
    'button',
    {
      type: 'button',
      role: 'switch',
      'aria-checked': checked ? 'true' : 'false',
      'aria-label': label,
      disabled,
      className: 'ts-switch',
      onClick: () => onChange(!checked),
    },
    h('span', { className: 'ts-switch-thumb' }),
  )
}

/** Segmented control (全部 / 公开 / 私有). */
function Segmented({ items, value, onChange, label }) {
  return h(
    'div',
    { className: 'ts-seg', role: 'tablist', 'aria-label': label },
    items.map((item) =>
      h(
        'button',
        {
          key: item.value,
          type: 'button',
          role: 'tab',
          'aria-selected': value === item.value,
          'data-active': value === item.value ? 'true' : 'false',
          className: 'ts-seg-item',
          onClick: () => onChange(item.value),
        },
        item.label,
      ),
    ),
  )
}

/** Dropdown menu anchored to a trigger; closes on outside pointer or Escape. */
function Menu({ items }) {
  const ref = React.useRef(null)
  React.useEffect(() => {
    const close = (event) => {
      if (ref.current !== null && !ref.current.contains(event.target)) items.onClose()
    }
    const onKey = (event) => {
      if (event.key === 'Escape') items.onClose()
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [items])
  return h(
    'div',
    { className: 'ts-menu', ref, role: 'menu' },
    items.entries.map((entry) =>
      h(
        'button',
        {
          key: entry.id,
          type: 'button',
          role: 'menuitem',
          className: 'ts-menu-item',
          'data-danger': entry.danger === true ? 'true' : 'false',
          onClick: () => {
            items.onClose()
            entry.onSelect()
          },
        },
        entry.icon === undefined ? null : h(Icon, { name: entry.icon, size: 14 }),
        entry.label,
      ),
    ),
  )
}

/** Small pill used to render a workflow status. */
function StatusPill({ status }) {
  return h(
    'span',
    { className: 'ts-status-pill' },
    h('span', { className: 'ts-dot', style: { background: STATUS_COLORS[status.color] ?? STATUS_COLORS.backlog } }),
    status.name,
  )
}

/** Empty-state block for the spaces list. */
function EmptyState({ onCreate }) {
  return h(
    'div',
    { className: 'ts-empty' },
    h('span', { className: 'ts-empty-badge', 'aria-hidden': 'true' }, h(Icon, { name: 'grid', size: 26, strokeWidth: 1.2 })),
    h('div', { className: 'ts-empty-title' }, '创建你的第一个任务空间'),
    h(
      'p',
      { className: 'ts-empty-desc' },
      '空间按团队、专项或长期计划组织工作。每个空间拥有自己的任务类型、工作流、标签和访问范围，创建过程分五步完成。',
    ),
    h(Btn, { kind: 'primary', icon: 'plus', onClick: onCreate }, '创建空间'),
  )
}

/** Transient success/notice toast. */
function Toast({ toast }) {
  if (toast === null) return null
  return h(
    'div',
    { className: 'ts-toast', role: 'status' },
    h('span', { className: 'ts-toast-icon' }, h(Icon, { name: 'check-circle', size: 16 })),
    toast.text,
  )
}

/** Confirmation overlay for destructive actions. */
function ConfirmOverlay({ title, desc, confirmLabel, onCancel, onConfirm }) {
  React.useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])
  return h(
    'div',
    { className: 'ts-overlay' },
    h('div', { className: 'ts-mask', onClick: onCancel }),
    h(
      'div',
      { className: 'ts-confirm', role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
      h('h2', { className: 'ts-confirm-title' }, title),
      h('p', { className: 'ts-confirm-desc' }, desc),
      h(
        'div',
        { className: 'ts-confirm-actions' },
        h(Btn, { kind: 'ghost', onClick: onCancel }, '取消'),
        h(Btn, { kind: 'danger', onClick: onConfirm }, confirmLabel),
      ),
    ),
  )
}

		// ---- src/20-page.js ----
/**
 * The "任务空间" main-column page: header, filter bar, space cards, and the
 * create-space wizard entry points.
 *
 * Spaces persist to localStorage; every successful creation flashes the new
 * card and shows a toast confirming the creation.
 */

/** One space card with its overflow menu. */
function SpaceCard({ space, flash, menuOpen, onMenuOpen, onMenuClose, onDelete, onDuplicate }) {
  const category = WORK_CATEGORIES.find((entry) => entry.id === space.workCategory)
  const accessLabel = space.access === 'private' ? '私有空间' : '组织内公开'
  const menuEntries = [
    { id: 'duplicate', label: '复制设置新建', icon: 'copy', onSelect: onDuplicate },
    { id: 'delete', label: '删除空间', icon: 'trash', danger: true, onSelect: onDelete },
  ]
  return h(
    'article',
    { className: 'ts-card', 'data-flash': flash ? 'true' : 'false' },
    h(
      'div',
      { className: 'ts-card-head' },
      h(SpaceBadge, { icon: space.icon }),
      h(
        'div',
        { className: 'ts-card-main' },
        h(
          'div',
          { className: 'ts-card-title' },
          space.name,
          h('span', { className: 'ts-id-badge', title: '任务 ID 前缀' }, space.identifier),
        ),
        h(
          'div',
          { className: 'ts-card-sub' },
          `${category === undefined ? '自定义空间' : category.name} · ${accessLabel} · 创建于 ${relativeTime(space.createdAt)}`,
        ),
      ),
      h(
        'div',
        { className: 'ts-card-menu' },
        h(
          'button',
          {
            type: 'button',
            className: 'ts-icon-btn',
            'aria-label': '空间操作',
            'aria-haspopup': 'menu',
            'aria-expanded': menuOpen ? 'true' : 'false',
            onClick: onMenuOpen,
          },
          h(Icon, { name: 'more', size: 16 }),
        ),
        menuOpen ? h(Menu, { items: { entries: menuEntries, onClose: onMenuClose } }) : null,
      ),
    ),
    h(
      'div',
      { className: 'ts-card-section' },
      h('span', { className: 'ts-section-label' }, '工作流'),
      h(
        'div',
        { className: 'ts-chip-row' },
        space.statuses.map((status, index) => h(StatusPill, { key: `${status.name}-${index}`, status })),
      ),
    ),
    space.labels.length > 0
      ? h(
          'div',
          { className: 'ts-card-section' },
          h('span', { className: 'ts-section-label' }, '标签'),
          h(
            'div',
            { className: 'ts-chip-row' },
            space.labels.map((label) => h('span', { key: label, className: 'ts-label-chip' }, label)),
          ),
        )
      : null,
    h(
      'div',
      { className: 'ts-card-section' },
      h('span', { className: 'ts-section-label' }, '任务类型与功能模块'),
      h(
        'div',
        { className: 'ts-chip-row' },
        space.taskTypes.map((id) => {
          const type = TASK_TYPE_POOL.find((entry) => entry.id === id)
          return h('span', { key: id, className: 'ts-chip' }, type === undefined ? id : type.name)
        }),
        enabledModules(space).map((module) =>
          h('span', { key: module.id, className: 'ts-chip' }, h(Icon, { name: module.icon, size: 11 }), module.name),
        ),
      ),
    ),
    h(
      'div',
      { className: 'ts-card-foot' },
      h(
        'span',
        { className: 'ts-card-foot-left' },
        h(Icon, { name: 'check-circle', size: 13 }),
        `0 个任务 · ${enabledModules(space).length} 个模块`,
      ),
      h('span', null, space.multiAssignee ? '多人处理人' : '单人处理人'),
    ),
  )
}

/** Module definitions that are actually enabled for a space. */
function enabledModules(space) {
  return MODULE_DEFS.filter((module) => space.modules[module.id] === true)
}

/** The spaces workspace page. */
function TaskSpacesPage() {
  const [spaces, setSpaces] = React.useState(() => loadSpaces())
  const [filter, setFilter] = React.useState('all')
  const [wizard, setWizard] = React.useState(null)
  const [flashId, setFlashId] = React.useState(null)
  const [menuId, setMenuId] = React.useState(null)
  const [confirmSpace, setConfirmSpace] = React.useState(null)
  const [toast, setToast] = React.useState(null)
  const toastTimer = React.useRef(undefined)

  /** Show a toast and clear it after a moment. */
  const showToast = React.useCallback((text) => {
    setToast({ text })
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3200)
  }, [])

  React.useEffect(
    () => () => {
      window.clearTimeout(toastTimer.current)
    },
    [],
  )

  /** Open the wizard for a brand-new space, or pre-filled from an existing one. */
  const startCreate = React.useCallback(() => {
    setMenuId(null)
    setWizard({ key: Date.now(), draft: createDraft() })
  }, [])

  const startDuplicate = React.useCallback(
    (space) => {
      const draft = createDraft()
      draft.method = spaces.length > 0 ? 'copy' : 'template'
      draft.copyFrom = space.id
      draft.workCategory = space.workCategory
      draft.modules = { ...space.modules }
      draft.taskTypes = [...space.taskTypes]
      draft.sprintMode = space.sprintMode
      draft.statuses = space.statuses.map((status) => ({ ...status }))
      draft.labels = [...space.labels]
      draft.icon = { ...space.icon }
      draft.access = space.access
      draft.multiAssignee = space.multiAssignee
      setMenuId(null)
      setWizard({ key: Date.now(), draft })
    },
    [spaces],
  )

  /** Commit a wizard draft as a new space. */
  const submitSpace = React.useCallback(
    (draft) => {
      const createdAt = Date.now()
      const space = {
        id: newSpaceId(),
        name: draft.name.trim(),
        identifier: draft.identifier.trim().toUpperCase(),
        icon: { emoji: draft.icon.emoji, color: draft.icon.color },
        workCategory: draft.workCategory,
        access: draft.access,
        taskTypes: [...draft.taskTypes],
        modules: { tasks: true, views: draft.modules.views === true, sprints: draft.modules.sprints === true, projects: draft.modules.projects === true, triage: draft.modules.triage === true },
        sprintMode: draft.sprintMode,
        statuses: draft.statuses.filter((status) => status.name.trim().length > 0).map((status) => ({ name: status.name.trim(), color: status.color, default: status.default === true })),
        labels: draft.labels.filter((label) => label.length > 0),
        customerRequests: draft.customerRequests === true,
        multiAssignee: draft.multiAssignee === true,
        createdAt,
      }
      const next = [space, ...spaces]
      setSpaces(next)
      saveSpaces(next)
      setWizard(null)
      setFlashId(space.id)
      showToast(`空间「${space.name}」已创建。`)
    },
    [spaces, showToast],
  )

  /** Delete one space after confirmation. */
  const deleteSpace = React.useCallback(() => {
    if (confirmSpace === null) return
    const next = spaces.filter((space) => space.id !== confirmSpace.id)
    setSpaces(next)
    saveSpaces(next)
    setConfirmSpace(null)
    showToast(`已删除空间「${confirmSpace.name}」。`)
  }, [confirmSpace, spaces, showToast])

  React.useEffect(() => {
    if (flashId === null) return
    const timer = window.setTimeout(() => setFlashId(null), 1700)
    return () => window.clearTimeout(timer)
  }, [flashId])

  const counts = {
    all: spaces.length,
    public: spaces.filter((space) => space.access !== 'private').length,
    private: spaces.filter((space) => space.access === 'private').length,
  }
  const visible = spaces.filter((space) => (filter === 'all' ? true : filter === 'private' ? space.access === 'private' : space.access !== 'private'))

  return h(
    'div',
    { 'data-dsh-task-spaces': '', className: 'ts-page' },
    h(
      'div',
      { className: 'ts-page-inner' },
      h(
        'header',
        { className: 'ts-head' },
        h(
          'div',
          null,
          h('h1', { className: 'ts-title' }, '任务空间'),
          h(
            'p',
            { className: 'ts-sub' },
            '按团队、专项或长期计划组织工作。每个空间拥有自己的任务类型、工作流、标签和访问范围，创建过程分五步完成。',
          ),
        ),
        h(Btn, { kind: 'primary', icon: 'plus', onClick: startCreate }, '创建空间'),
      ),
      h(
        'div',
        { className: 'ts-toolbar' },
        h(Segmented, {
          label: '空间筛选',
          value: filter,
          onChange: setFilter,
          items: [
            { value: 'all', label: `全部 ${counts.all}` },
            { value: 'public', label: `公开 ${counts.public}` },
            { value: 'private', label: `私有 ${counts.private}` },
          ],
        }),
        h('span', { className: 'ts-count' }, visible.length === 0 ? '还没有匹配的空间' : `共 ${visible.length} 个空间`),
      ),
      spaces.length === 0
        ? h(EmptyState, { onCreate: startCreate })
        : visible.length === 0
          ? h('div', { className: 'ts-inline-note' }, h(Icon, { name: 'info', size: 14 }), '当前筛选下没有空间，切换筛选条件看看。')
          : h(
              'div',
              { className: 'ts-grid' },
              visible.map((space) =>
                h(SpaceCard, {
                  key: space.id,
                  space,
                  flash: flashId === space.id,
                  menuOpen: menuId === space.id,
                  onMenuOpen: () => setMenuId(menuId === space.id ? null : space.id),
                  onMenuClose: () => setMenuId(null),
                  onDelete: () => {
                    setMenuId(null)
                    setConfirmSpace(space)
                  },
                  onDuplicate: () => startDuplicate(space),
                }),
              ),
            ),
    ),
    wizard === null
      ? null
      : h(SpaceWizard, {
          key: wizard.key,
          spaces,
          initialDraft: wizard.draft,
          onCancel: () => setWizard(null),
          onSubmit: submitSpace,
        }),
    confirmSpace === null
      ? null
      : createPortal(
          h(
            'div',
            { 'data-dsh-task-spaces': '' },
            h(ConfirmOverlay, {
              title: `删除空间「${confirmSpace.name}」？`,
              desc: '此操作无法撤销。空间及其数据会被永久删除。',
              confirmLabel: '删除空间',
              onCancel: () => setConfirmSpace(null),
              onConfirm: deleteSpace,
            }),
          ),
          document.body,
        ),
    toast === null ? null : createPortal(h('div', { 'data-dsh-task-spaces': '' }, h(Toast, { toast })), document.body),
  )
}

		// ---- src/30-wizard.js ----
/**
 * Five-step create-space wizard.
 *
 * Steps: work category -> task types & modules -> name/identifier/icon ->
 * workflow preset (or copy) with editable statuses/labels -> access & confirm.
 * Copy and structure follow the create-space dialog spec; the demo
 * persists the resulting space into the spaces page above.
 */

/** Short captions under each rail entry. */
const STEP_CAPTIONS = ['空间主要做什么', '任务类型、功能模块', '名称、标识符、图标', '状态与标签', '可见范围与创建']

/** Validate one step; returns an error message or null. */
function validateStep(step, draft, spaces) {
  if (step === 2) {
    const name = draft.name.trim()
    if (name.length === 0) return '请先填写空间名称。'
    if (name.length > 32) return '名称不能超过 32 个字符。'
    if (!IDENTIFIER_PATTERN.test(draft.identifier.trim().toUpperCase())) return '标识符必须为 2-7 个字母或数字。'
    if (identifierTaken(spaces, draft.identifier)) return `标识符「${draft.identifier.trim().toUpperCase()}」已被占用。`
    return null
  }
  if (step === 3) {
    if (draft.statuses.filter((status) => status.name.trim().length > 0).length === 0) return '至少需要保留一个工作流状态。'
    return null
  }
  return null
}

/** Step rail: numbered steps with completed/current/upcoming states. */
function StepRail({ draft, onJump }) {
  return h(
    'aside',
    { className: 'ts-rail' },
    h(
      'div',
      { className: 'ts-rail-head' },
      h('div', { className: 'ts-rail-eyebrow' }, '任务空间'),
      h('h2', { className: 'ts-rail-title' }, '创建空间'),
      h('div', { className: 'ts-rail-progress' }, `第 ${draft.step + 1} 步 / 共 ${WIZARD_STEPS.length} 步`),
    ),
    h(
      'ol',
      { className: 'ts-steps' },
      WIZARD_STEPS.map((step, index) => {
        const status = index < draft.step ? 'done' : index === draft.step ? 'current' : 'upcoming'
        return h(
          'li',
          { key: step.id },
          h(
            'button',
            {
              type: 'button',
              className: 'ts-step',
              'data-status': status,
              'aria-current': status === 'current' ? 'step' : undefined,
              disabled: status === 'upcoming',
              onClick: () => {
                if (status !== 'upcoming') onJump(index)
              },
            },
            h('span', { className: 'ts-step-num' }, status === 'done' ? h(Icon, { name: 'check', size: 12, strokeWidth: 1.8 }) : String(index + 1)),
            h(
              'span',
              { className: 'ts-step-text' },
              h('span', { className: 'ts-step-label' }, step.rail),
              h('span', { className: 'ts-step-caption' }, STEP_CAPTIONS[index]),
            ),
          ),
        )
      }),
    ),
    h(
      'div',
      { className: 'ts-rail-foot' },
      h(Icon, { name: 'info', size: 14 }),
      h('span', null, '别担心，这些设置创建后都可以在空间设置里随时修改。'),
    ),
  )
}

/** Step 1: work category grid. */
function StepCategory({ draft, update }) {
  return h(
    'div',
    { className: 'ts-stack' },
    h(
      'div',
      { className: 'ts-cat-grid' },
      WORK_CATEGORIES.map((category) =>
        h(
          'button',
          {
            key: category.id,
            type: 'button',
            role: 'radio',
            className: 'ts-cat',
            'aria-checked': draft.workCategory === category.id,
            onClick: () => {
              const patch = {
                workCategory: category.id,
                taskTypes: taskTypeDefaults(category.id).checked,
                icon: { ...draft.icon, emoji: category.emoji },
              }
              if (draft.identifierTouched !== true) patch.identifier = suggestIdentifier(draft.name, category.id)
              update(patch)
            },
          },
          h('span', { className: 'ts-cat-emoji', 'aria-hidden': 'true' }, category.emoji),
          h(
            'span',
            { className: 'ts-cat-text' },
            h('span', { className: 'ts-cat-name' }, category.name),
            h('span', { className: 'ts-cat-desc' }, category.desc),
          ),
          h('span', { className: 'ts-cat-check' }, h(Icon, { name: 'check', size: 11, strokeWidth: 2 })),
        ),
      ),
    ),
    h(
      'div',
      { className: 'ts-inline-note' },
      h(Icon, { name: 'sparkle', size: 14 }),
      h('span', null, `已根据「${workCategory(draft.workCategory).name}」预选合适的任务类型；首次在此空间创建 Agent 时，默认使用「${draft.workCategory === 'software_development' ? '代码开发' : '日常办公'}」类型。`),
    ),
  )
}

/** Look up a work category definition. */
function workCategory(id) {
  return WORK_CATEGORIES.find((category) => category.id === id) ?? WORK_CATEGORIES[0]
}

/** Step 2: task types + feature modules (+ sprint mode). */
function StepModules({ draft, update }) {
  const defaults = taskTypeDefaults(draft.workCategory)
  const toggleType = (id) => {
    const has = draft.taskTypes.includes(id)
    update({ taskTypes: has ? draft.taskTypes.filter((entry) => entry !== id) : [...draft.taskTypes, id] })
  }
  const setModule = (id, value) => update({ modules: { ...draft.modules, [id]: value } })
  return h(
    'div',
    { className: 'ts-stack' },
    h(
      'section',
      { className: 'ts-block' },
      h(
        'div',
        { className: 'ts-block-head' },
        h('span', { className: 'ts-block-title' }, '任务类型'),
        h('span', { className: 'ts-block-hint' }, '创建空间后，你仍可在空间设置中调整任务类型和功能模块。'),
      ),
      h(
        'div',
        { className: 'ts-checkcards' },
        h(
          'div',
          { className: 'ts-checkcard', 'data-locked': 'true', 'aria-checked': 'true' },
          h('span', { className: 'ts-box' }, h(Icon, { name: 'check', size: 11, strokeWidth: 2 })),
          h(
            'span',
            { className: 'ts-checkcard-text' },
            h('span', { className: 'ts-checkcard-name' }, '任务'),
            h('span', { className: 'ts-checkcard-desc' }, '默认任务类型，空间创建后始终可用。'),
          ),
        ),
        defaults.options.map((id) => {
          const type = TASK_TYPE_POOL.find((entry) => entry.id === id)
          const checked = draft.taskTypes.includes(id)
          return h(
            'button',
            {
              key: id,
              type: 'button',
              role: 'checkbox',
              className: 'ts-checkcard',
              'aria-checked': checked,
              onClick: () => toggleType(id),
            },
            h('span', { className: 'ts-box' }, h(Icon, { name: 'check', size: 11, strokeWidth: 2 })),
            h(
              'span',
              { className: 'ts-checkcard-text' },
              h('span', { className: 'ts-checkcard-name' }, type.name),
              h('span', { className: 'ts-checkcard-desc' }, type.desc),
            ),
          )
        }),
      ),
      h(
        'div',
        { className: 'ts-inline-note' },
        h(Icon, { name: 'info', size: 14 }),
        h('span', null, '更多任务类型：空间创建完成后可以在空间设置里增加自定义任务类型。'),
      ),
    ),
    h(
      'section',
      { className: 'ts-block' },
      h(
        'div',
        { className: 'ts-block-head' },
        h('span', { className: 'ts-block-title' }, '功能模块'),
        h('span', { className: 'ts-block-hint' }, '选择要在此空间中启用的功能。'),
      ),
      h(
        'div',
        { className: 'ts-module-list' },
        MODULE_DEFS.map((module) =>
          h(
            'div',
            { key: module.id, className: 'ts-module' },
            h('span', { className: 'ts-module-icon' }, h(Icon, { name: module.icon, size: 15 })),
            h(
              'div',
              { className: 'ts-module-body' },
              h(
                'div',
                { className: 'ts-module-name' },
                module.name,
                module.locked === true ? h('span', { className: 'ts-chip' }, '必选') : null,
              ),
              h('div', { className: 'ts-module-desc' }, module.desc),
            ),
            module.locked === true
              ? h('span', { className: 'ts-chip', 'data-tone': 'accent', title: '必选模块，创建后始终启用' }, '始终启用')
              : h(Switch, {
                  label: `启用${module.name}`,
                  checked: draft.modules[module.id] === true,
                  onChange: (value) => setModule(module.id, value),
                }),
          ),
        ),
        draft.modules.sprints === true
          ? h(
              'div',
              { className: 'ts-sprint-modes' },
              SPRINT_MODES.map((mode) =>
                h(
                  'button',
                  {
                    key: mode.id,
                    type: 'button',
                    role: 'radio',
                    className: 'ts-radio-card',
                    'aria-checked': draft.sprintMode === mode.id,
                    onClick: () => update({ sprintMode: mode.id }),
                  },
                  h('input', { type: 'radio', className: 'ts-radio', readOnly: true, checked: draft.sprintMode === mode.id, tabIndex: -1 }),
                  h(
                    'span',
                    null,
                    h('span', { className: 'ts-radio-card-name' }, mode.name),
                    h('span', { className: 'ts-radio-card-desc' }, mode.desc),
                  ),
                ),
              ),
            )
          : null,
      ),
    ),
  )
}

/** Step 3: icon, name, identifier with live sidebar preview. */
function StepDetails({ draft, update, spaces }) {
  const name = draft.name
  const identifier = draft.identifier
  const upper = identifier.trim().toUpperCase()
  const nameError = name.trim().length === 0 ? null : name.trim().length > 32 ? '名称不能超过 32 个字符。' : null
  const identifierError =
    upper.length === 0
      ? null
      : !IDENTIFIER_PATTERN.test(upper)
        ? '标识符必须为 2-7 个字母或数字。'
        : identifierTaken(spaces, upper)
          ? `标识符「${upper}」已被占用。`
          : null
  const suggestion = suggestIdentifier(name, draft.workCategory)
  const canSuggest = name.trim().length > 0 && suggestion !== upper
  return h(
    'div',
    { className: 'ts-stack' },
    h(
      'div',
      { className: 'ts-icon-editor' },
      h('span', { className: 'ts-icon-preview', style: { background: spaceColor(draft.icon.color) }, 'aria-hidden': 'true' }, draft.icon.emoji),
      h(
        'div',
        { className: 'ts-icon-picker' },
        h('span', { className: 'ts-field-hint' }, '图标颜色'),
        h(
          'div',
          { className: 'ts-swatches' },
          COLOR_SWATCHES.map((swatch) =>
            h('button', {
              key: swatch.id,
              type: 'button',
              role: 'radio',
              className: 'ts-swatch',
              style: { background: swatch.hex, color: swatch.hex },
              'aria-label': swatch.name,
              'aria-checked': draft.icon.color === swatch.id,
              onClick: () => update({ icon: { ...draft.icon, color: swatch.id } }),
            }),
          ),
        ),
        h('span', { className: 'ts-field-hint' }, '空间图标'),
        h(
          'div',
          { className: 'ts-emoji-grid' },
          EMOJI_CHOICES.map((emoji) =>
            h(
              'button',
              {
                key: emoji,
                type: 'button',
                role: 'radio',
                className: 'ts-emoji',
                'aria-label': `图标 ${emoji}`,
                'aria-checked': draft.icon.emoji === emoji,
                onClick: () => update({ icon: { ...draft.icon, emoji } }),
              },
              emoji,
            ),
          ),
        ),
      ),
    ),
    h(
      'div',
      { className: 'ts-field' },
      h(
        'div',
        { className: 'ts-field-label' },
        h('span', null, '空间名称'),
        h('span', { className: 'ts-counter' }, `${name.length}/32`),
      ),
      h('input', {
        className: 'ts-input',
        'data-invalid': nameError !== null ? 'true' : 'false',
        placeholder: '例如：Engineering、Marketing',
        maxLength: 40,
        value: name,
        autoFocus: true,
        onChange: (event) => {
          const value = event.target.value
          const patch = { name: value }
          if (draft.identifierTouched !== true) patch.identifier = suggestIdentifier(value, draft.workCategory)
          update(patch)
        },
      }),
      nameError !== null ? h('span', { className: 'ts-field-error' }, nameError) : h('span', { className: 'ts-field-hint' }, '空间名称应该让团队一眼知道它承载什么工作。'),
    ),
    h(
      'div',
      { className: 'ts-field' },
      h(
        'div',
        { className: 'ts-field-label' },
        h('span', null, '标识符'),
        canSuggest
          ? h(
              'button',
              {
                type: 'button',
                className: 'ts-btn',
                'data-kind': 'ghost',
                style: { height: 22, padding: '0 8px', fontSize: 11.5 },
                onClick: () => update({ identifier: suggestion, identifierTouched: true }),
              },
              `使用建议：${suggestion}`,
            )
          : h('span', { className: 'ts-counter' }, '2-7 位'),
      ),
      h(
        'div',
        { className: 'ts-identifier-wrap' },
        h('input', {
          className: 'ts-input',
          'data-invalid': identifierError !== null ? 'true' : 'false',
          placeholder: 'ENG',
          maxLength: 7,
          value: identifier,
          onChange: (event) => {
            const value = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7)
            update({ identifier: value, identifierTouched: true })
          },
        }),
        h('span', { className: 'ts-task-id' }, h(Icon, { name: 'hash', size: 12 }), `任务 ID 示例：${upper.length >= 2 ? upper : 'ENG'}-123`),
      ),
      identifierError !== null
        ? h('span', { className: 'ts-field-error' }, identifierError)
        : h('span', { className: 'ts-field-hint' }, '用于任务 ID（例如 ENG-123）。2-7 个字母或数字，组织内唯一。'),
    ),
    h(
      'div',
      { className: 'ts-preview-card' },
      h(SpaceBadge, { icon: draft.icon, size: 'sm' }),
      h('span', { className: 'ts-preview-name' }, name.trim().length > 0 ? name.trim() : '空间名称'),
      h('span', { className: 'ts-id-badge' }, upper.length >= 2 ? upper : 'ENG'),
      h('span', null, draft.access === 'private' ? '私有' : '组织内公开'),
      h('span', { style: { marginLeft: 'auto', opacity: 0.7 } }, '侧边栏预览'),
    ),
  )
}

/** Preset tile with its status chain and labels. */
function PresetCard({ preset, active, onSelect }) {
  return h(
    'button',
    { type: 'button', role: 'radio', className: 'ts-preset', 'aria-checked': active, onClick: onSelect },
    h(
      'span',
      { className: 'ts-preset-head' },
      h(
        'span',
        null,
        h('span', { className: 'ts-preset-name' }, preset.name),
        h('span', { className: 'ts-preset-sub' }, preset.subtitle),
      ),
      h('span', { className: 'ts-preset-check' }, h(Icon, { name: 'check', size: 11, strokeWidth: 2 })),
    ),
    h(
      'span',
      { className: 'ts-status-chain' },
      preset.statuses.map((status) => h(StatusPill, { key: status.name, status })),
    ),
    h(
      'span',
      { className: 'ts-preset-labels' },
      preset.labels.map((label) => h('span', { key: label, className: 'ts-label-chip' }, label)),
    ),
  )
}

/** Editable workflow statuses: rename, star default, remove, add. */
function StatusEditor({ draft, update, hint }) {
  const [draftName, setDraftName] = React.useState('')
  const statuses = draft.statuses
  const patchStatus = (index, value) => {
    update({ statuses: statuses.map((status, position) => (position === index ? { ...status, name: value } : status)) })
  }
  const removeStatus = (index) => {
    if (statuses.length <= 1) return
    update({ statuses: statuses.filter((_, position) => position !== index) })
  }
  const addStatus = () => {
    const name = draftName.trim()
    if (name.length === 0) return
    update({ statuses: [...statuses, { name, color: 'backlog' }] })
    setDraftName('')
  }
  return h(
    'div',
    { className: 'ts-editor' },
    h(
      'div',
      { className: 'ts-editor-head' },
      h('span', { className: 'ts-editor-title' }, '状态'),
      h('span', { className: 'ts-editor-hint' }, hint),
    ),
    h(
      'div',
      { className: 'ts-status-rows' },
      statuses.map((status, index) =>
        h(
          'div',
          { key: index, className: 'ts-status-row' },
          h('span', { className: 'ts-dot', style: { background: STATUS_COLORS[status.color] ?? STATUS_COLORS.backlog } }),
          h('input', {
            className: 'ts-status-name',
            value: status.name,
            'aria-label': `状态 ${index + 1} 名称`,
            onChange: (event) => patchStatus(index, event.target.value),
          }),
          h(
            'span',
            { className: 'ts-status-actions' },
            h(
              'button',
              {
                type: 'button',
                className: 'ts-star-btn',
                'data-default': status.default === true ? 'true' : 'false',
                title: status.default === true ? '默认状态（新任务落在这里）' : '设为新任务的默认状态',
                'aria-label': '设为默认状态',
                onClick: () =>
                  update({
                    statuses: statuses.map((entry, position) => ({ ...entry, default: position === index ? status.default !== true : false })),
                  }),
              },
              h(Icon, { name: 'star', size: 13 }),
            ),
            statuses.length > 1
              ? h(
                  'button',
                  { type: 'button', className: 'ts-star-btn', 'aria-label': '移除状态', onClick: () => removeStatus(index) },
                  h(Icon, { name: 'close', size: 12 }),
                )
              : null,
          ),
        ),
      ),
    ),
    h(
      'div',
      { className: 'ts-add-inline' },
      h('input', {
        value: draftName,
        placeholder: '添加状态…',
        'aria-label': '添加状态',
        onChange: (event) => setDraftName(event.target.value),
        onKeyDown: (event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            addStatus()
          }
        },
      }),
      h('button', { type: 'button', disabled: draftName.trim().length === 0, onClick: addStatus }, '添加'),
    ),
  )
}

/** Editable label chips: remove and add. */
function LabelEditor({ draft, update }) {
  const [draftLabel, setDraftLabel] = React.useState('')
  const addLabel = () => {
    const name = draftLabel.trim()
    if (name.length === 0 || draft.labels.includes(name)) return
    update({ labels: [...draft.labels, name] })
    setDraftLabel('')
  }
  return h(
    'div',
    { className: 'ts-editor' },
    h(
      'div',
      { className: 'ts-editor-head' },
      h('span', { className: 'ts-editor-title' }, '标签'),
      h('span', { className: 'ts-editor-hint' }, '用于整理此空间任务的标签'),
    ),
    h(
      'div',
      { className: 'ts-label-rows' },
      draft.labels.map((label) =>
        h(
          'span',
          { key: label, className: 'ts-label-tag' },
          label,
          h(
            'button',
            {
              type: 'button',
              'aria-label': `移除标签 ${label}`,
              onClick: () => update({ labels: draft.labels.filter((entry) => entry !== label) }),
            },
            h(Icon, { name: 'close', size: 10, strokeWidth: 1.8 }),
          ),
        ),
      ),
      draft.labels.length === 0 ? h('span', { className: 'ts-field-hint' }, '还没有标签 —— 添加一些标签来标记和分组此空间的任务。') : null,
    ),
    h(
      'div',
      { className: 'ts-add-inline' },
      h('input', {
        value: draftLabel,
        placeholder: '添加标签…',
        'aria-label': '添加标签',
        maxLength: 24,
        onChange: (event) => setDraftLabel(event.target.value),
        onKeyDown: (event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            addLabel()
          }
        },
      }),
      h('button', { type: 'button', disabled: draftLabel.trim().length === 0, onClick: addLabel }, '添加'),
    ),
  )
}

/** Step 4: workflow creation method, presets, statuses and labels. */
function StepWorkflow({ draft, update, spaces }) {
  const applyPreset = (preset) => {
    update({
      preset: preset.id,
      statuses: preset.statuses.map((status) => ({ name: status.name, color: status.color })),
      labels: [...preset.labels],
    })
  }
  const applyCopy = (space) => {
    update({
      method: 'copy',
      copyFrom: space.id,
      statuses: space.statuses.map((status) => ({ ...status })),
      labels: [...space.labels],
    })
  }
  const copySource = spaces.find((space) => space.id === draft.copyFrom)
  return h(
    'div',
    { className: 'ts-stack' },
    h(
      'div',
      { className: 'ts-block-head' },
      h(
        'div',
        { className: 'ts-method' },
        h(
          'button',
          {
            type: 'button',
            'data-active': draft.method === 'template' ? 'true' : 'false',
            onClick: () => update({ method: 'template' }),
          },
          '通过模版创建',
        ),
        h(
          'button',
          {
            type: 'button',
            'data-active': draft.method === 'copy' ? 'true' : 'false',
            disabled: spaces.length === 0,
            title: spaces.length === 0 ? '还没有可复制的空间' : '复制已有空间的工作流状态与标签',
            onClick: () => {
              const source = spaces.find((space) => space.id === draft.copyFrom) ?? spaces[0]
              if (source === undefined) return
              applyCopy(source)
            },
          },
          '从已有空间复制',
        ),
      ),
      h('span', { className: 'ts-block-hint' }, draft.method === 'template' ? '先选择预设，再微调状态和标签。' : '复制源空间的工作流状态与标签。不会复制成员。'),
    ),
    draft.method === 'template'
      ? h(
          'section',
          { className: 'ts-block' },
          h(
            'div',
            { className: 'ts-preset-grid' },
            WORKFLOW_PRESETS.map((preset) =>
              h(PresetCard, { key: preset.id, preset, active: draft.preset === preset.id, onSelect: () => applyPreset(preset) }),
            ),
          ),
        )
      : h(
          'section',
          { className: 'ts-block' },
          h(
            'div',
            { className: 'ts-cat-grid' },
            spaces.map((space) =>
              h(
                'button',
                {
                  key: space.id,
                  type: 'button',
                  role: 'radio',
                  className: 'ts-cat',
                  'aria-checked': draft.copyFrom === space.id,
                  onClick: () => applyCopy(space),
                },
                h(SpaceBadge, { icon: space.icon, size: 'sm' }),
                h(
                  'span',
                  { className: 'ts-cat-text' },
                  h('span', { className: 'ts-cat-name' }, space.name),
                  h('span', { className: 'ts-cat-desc' }, `${space.identifier} · ${space.statuses.length} 个状态 · ${space.labels.length} 个标签`),
                ),
                h('span', { className: 'ts-cat-check' }, h(Icon, { name: 'check', size: 11, strokeWidth: 2 })),
              ),
            ),
          ),
          copySource === undefined
            ? h('div', { className: 'ts-inline-note' }, h(Icon, { name: 'info', size: 14 }), '选择一个空间，复制它的工作流状态与标签；任务类型与功能模块沿用前面步骤的选择。')
            : h('div', { className: 'ts-inline-note' }, h(Icon, { name: 'check-circle', size: 14 }), `已选择「${copySource.name}」，下方状态与标签可继续微调。`),
        ),
    h(StatusEditor, { draft, update, hint: '可在分组内拖动排序。星标表示新任务的默认状态（仅限 Backlog 或未开始）。' }),
    h(LabelEditor, { draft, update }),
  )
}

/** Step 5: access, optional flags and the confirm summary. */
function StepAccess({ draft, update, spaces }) {
  const category = workCategory(draft.workCategory)
  const typeNames = draft.taskTypes.map((id) => (TASK_TYPE_POOL.find((entry) => entry.id === id) ?? { name: id }).name)
  const moduleNames = MODULE_DEFS.filter((module) => draft.modules[module.id] === true).map((module) => module.name)
  const copySource = spaces.find((space) => space.id === draft.copyFrom)
  const creation =
    draft.method === 'copy'
      ? `从「${copySource === undefined ? '已有空间' : copySource.name}」复制`
      : `通过模版创建（${WORKFLOW_PRESETS.find((preset) => preset.id === draft.preset)?.name ?? '入门'}）`
  return h(
    'div',
    { className: 'ts-stack' },
    h(
      'section',
      { className: 'ts-block' },
      h('div', { className: 'ts-block-head' }, h('span', { className: 'ts-block-title' }, '空间访问权限')),
      h(
        'div',
        { className: 'ts-access-grid' },
        h(
          'button',
          { type: 'button', role: 'radio', className: 'ts-access-card', 'aria-checked': draft.access === 'public', onClick: () => update({ access: 'public' }) },
          h(Icon, { name: 'globe', size: 16 }),
          h(
            'span',
            { className: 'ts-access-body' },
            h('span', { className: 'ts-access-name' }, '组织内公开'),
            h('span', { className: 'ts-access-hint' }, '组织中的任何人都可以找到并加入此空间。适合研发、产品、市场等常规协作场景。'),
          ),
          h('span', { className: 'ts-access-check' }, h(Icon, { name: 'check', size: 11, strokeWidth: 2 })),
        ),
        h(
          'button',
          { type: 'button', role: 'radio', className: 'ts-access-card', 'aria-checked': draft.access === 'private', onClick: () => update({ access: 'private' }) },
          h(Icon, { name: 'lock', size: 16 }),
          h(
            'span',
            { className: 'ts-access-body' },
            h('span', { className: 'ts-access-name' }, '私有'),
            h('span', { className: 'ts-access-hint' }, '仅空间成员和组织所有者可见。适合权限敏感或范围较小的工作，例如客户交付与未公开专项。'),
          ),
          h('span', { className: 'ts-access-check' }, h(Icon, { name: 'check', size: 11, strokeWidth: 2 })),
        ),
      ),
    ),
    h(
      'section',
      { className: 'ts-block' },
      h('div', { className: 'ts-block-head' }, h('span', { className: 'ts-block-title' }, '可选模块与设置')),
      h(
        'div',
        { className: 'ts-module-list' },
        h(
          'div',
          { className: 'ts-module' },
          h('span', { className: 'ts-module-icon' }, h(Icon, { name: 'search', size: 15 })),
          h(
            'div',
            { className: 'ts-module-body' },
            h('div', { className: 'ts-module-name' }, '客户请求'),
            h('div', { className: 'ts-module-desc' }, '按空间开关和管理客户请求，创建后仍可在空间设置里调整。'),
          ),
          h(Switch, { label: '启用客户请求', checked: draft.customerRequests === true, onChange: (value) => update({ customerRequests: value }) }),
        ),
        h(
          'div',
          { className: 'ts-module' },
          h('span', { className: 'ts-module-icon' }, h(Icon, { name: 'users', size: 15 })),
          h(
            'div',
            { className: 'ts-module-body' },
            h('div', { className: 'ts-module-name' }, '多人处理人'),
            h('div', { className: 'ts-module-desc' }, '默认仍是单人；开启后，这个空间里的任务可以有多名人员处理人。'),
          ),
          h(Switch, { label: '启用多人处理人', checked: draft.multiAssignee === true, onChange: (value) => update({ multiAssignee: value }) }),
        ),
      ),
    ),
    h(
      'div',
      { className: 'ts-summary' },
      h(
        'div',
        { className: 'ts-summary-head' },
        h(SpaceBadge, { icon: draft.icon, size: 'lg' }),
        h(
          'div',
          null,
          h('div', { className: 'ts-summary-name' }, draft.name.trim().length > 0 ? draft.name.trim() : '未命名空间'),
          h('div', { className: 'ts-summary-sub' }, `${category.name} · ${draft.identifier.trim().length > 0 ? draft.identifier.trim().toUpperCase() : 'ENG'} · ${creation}`),
        ),
      ),
      h(
        'div',
        { className: 'ts-summary-row' },
        h('span', { className: 'ts-summary-key' }, '任务类型'),
        h('div', { className: 'ts-summary-val' }, ['任务', ...typeNames].map((name) => h('span', { key: name, className: 'ts-chip' }, name))),
      ),
      h(
        'div',
        { className: 'ts-summary-row' },
        h('span', { className: 'ts-summary-key' }, '功能模块'),
        h('div', { className: 'ts-summary-val' }, moduleNames.map((name) => h('span', { key: name, className: 'ts-chip', 'data-tone': 'accent' }, name))),
      ),
      h(
        'div',
        { className: 'ts-summary-row' },
        h('span', { className: 'ts-summary-key' }, '工作流'),
        h('div', { className: 'ts-summary-val' }, draft.statuses.map((status, index) => h(StatusPill, { key: `${status.name}-${index}`, status }))),
      ),
      h(
        'div',
        { className: 'ts-summary-row' },
        h('span', { className: 'ts-summary-key' }, '标签'),
        h('div', { className: 'ts-summary-val' }, draft.labels.length === 0 ? h('span', { className: 'ts-field-hint' }, '暂无') : draft.labels.map((label) => h('span', { key: label, className: 'ts-label-chip' }, label))),
      ),
      h(
        'div',
        { className: 'ts-summary-row' },
        h('span', { className: 'ts-summary-key' }, '访问权限'),
        h('div', { className: 'ts-summary-val' }, draft.access === 'private' ? '私有 · 仅空间成员可见' : '组织内公开 · 成员可自行加入'),
      ),
      h(
        'div',
        { className: 'ts-summary-row' },
        h('span', { className: 'ts-summary-key' }, '处理人'),
        h('div', { className: 'ts-summary-val' }, draft.multiAssignee ? '多人处理人' : '单人处理人'),
      ),
    ),
  )
}

/** The wizard shell: rail, step content, and the footer actions. */
function SpaceWizard({ spaces, initialDraft, onCancel, onSubmit }) {
  const [draft, setDraft] = React.useState(initialDraft)
  const [attempted, setAttempted] = React.useState(-1)

  React.useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])

  const update = (patch) => setDraft((current) => ({ ...current, ...patch }))
  const jumpTo = (step) => setDraft((current) => ({ ...current, step }))

  const error = validateStep(draft.step, draft, spaces)
  const last = draft.step === WIZARD_STEPS.length - 1
  const bodyByStep = [
    h(StepCategory, { draft, update }),
    h(StepModules, { draft, update }),
    h(StepDetails, { draft, update, spaces }),
    h(StepWorkflow, { draft, update, spaces }),
    h(StepAccess, { draft, update, spaces }),
  ]

  const stepRight = () => {
    if (error !== null) {
      setAttempted(draft.step)
      return
    }
    if (last) {
      onSubmit(draft)
      return
    }
    setDraft((current) => ({ ...current, step: current.step + 1 }))
  }

  const step = WIZARD_STEPS[draft.step]

  return createPortal(
    h(
      'div',
      { 'data-dsh-task-spaces': '', className: 'ts-overlay' },
      h('div', { className: 'ts-mask', onClick: onCancel }),
      h(
        'div',
        { className: 'ts-dialog', role: 'dialog', 'aria-modal': 'true', 'aria-label': step.title },
        h(StepRail, { draft, onJump: jumpTo }),
        h(
          'div',
          { className: 'ts-content' },
          h(
            'div',
            { className: 'ts-content-head' },
            h('h3', { className: 'ts-content-title' }, step.title),
            h('p', { className: 'ts-content-desc' }, step.desc),
          ),
          h(
            'div',
            { className: 'ts-content-body' },
            bodyByStep[draft.step],
            error !== null && attempted === draft.step ? h('div', { className: 'ts-inline-note', style: { marginTop: 16 }, role: 'alert' }, h(Icon, { name: 'info', size: 14 }), error) : null,
          ),
          h(
            'div',
            { className: 'ts-footer' },
            h(Btn, { kind: 'ghost', onClick: onCancel }, '取消'),
            h('span', { className: 'ts-footer-spacer' }),
            draft.step > 0 ? h(Btn, { kind: 'outline', icon: 'chevron-left', onClick: () => setDraft((current) => ({ ...current, step: current.step - 1 })) }, '上一步') : null,
            h(Btn, { kind: 'primary', onClick: stepRight }, last ? '创建空间' : '继续'),
          ),
        ),
      ),
    ),
    document.body,
  )
}

		// ---- src/40-apply.js ----
/**
 * Client plugin entry.
 *
 * Registers two slots:
 *  - `sidebar.panellist` — the "任务空间" glyph in the sidebar's global panel
 *    list. The sidebar owns the row button; clicking it selects the matching
 *    `main` key.
 *  - `main` — the keyed central page for that panel.
 */

/** Cordis services this plugin waits for (slot registry). */
const inject = ['slots']

/** Sidebar glyph: four cells, sized by the shell. */
function TaskSpacesSidebarIcon(props) {
  const size = typeof props.size === 'number' ? props.size : 18
  return h(Icon, { name: 'grid', size, strokeWidth: 1.35 })
}

/**
 * Register the sidebar entry and the main page.
 * @param ctx - client root context.
 */
function apply(ctx) {
  installStyles()
  ctx.slots.inject('sidebar.panellist', () =>
    ctx.slots.register(
      { name: 'sidebar.panellist', id: 'task-spaces', order: 20, label: () => '任务空间' },
      TaskSpacesSidebarIcon,
    ),
  )
  ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'task-spaces' }, TaskSpacesPage))
}

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
