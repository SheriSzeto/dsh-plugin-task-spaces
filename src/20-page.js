/**
 * The "任务空间" main-column page: header, filter bar, space cards, and the
 * create-space wizard entry points.
 *
 * Spaces persist to localStorage; every successful creation flashes the new
 * card and shows a toast confirming the creation.
 */

/** One space card with its overflow menu. */
function SpaceCard({ space, taskCount, flash, menuOpen, onMenuOpen, onMenuClose, onDelete, onDuplicate, onOpen }) {
  const category = WORK_CATEGORIES.find((entry) => entry.id === space.workCategory)
  const accessLabel = space.access === 'private' ? '私有空间' : '组织内公开'
  const menuEntries = [
    { id: 'duplicate', label: '复制设置新建', icon: 'copy', onSelect: onDuplicate },
    { id: 'delete', label: '删除空间', icon: 'trash', danger: true, onSelect: onDelete },
  ]
  return h(
    'article',
    {
      className: 'ts-card',
      'data-flash': flash ? 'true' : 'false',
      onClick: onOpen,
      onKeyDown: (event) => {
        if (event.key === 'Enter' || event.key === ' ') onOpen()
      },
      role: 'link',
      tabIndex: 0,
      'aria-label': `打开空间 ${space.name}`,
      style: { cursor: 'pointer' },
    },
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
            onClick: (event) => {
              event.stopPropagation()
              onMenuOpen()
            },
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
        `${taskCount} 个任务 · ${enabledModules(space).length} 个模块`,
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
  const [tasks, setTasks] = React.useState(() => loadTasks())
  const [openSpaceId, setOpenSpaceId] = React.useState(null)
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

  /** Persist the task list (state + localStorage). */
  const commitTasks = React.useCallback((next) => {
    setTasks(next)
    saveTasks(next)
  }, [])

  /** Create a task inside one space. */
  const createTask = React.useCallback(
    (spaceId, fields) => {
      const now = Date.now()
      const task = {
        id: newTaskId(),
        spaceId,
        title: fields.title,
        description: fields.description,
        type: fields.type,
        status: fields.status,
        priority: fields.priority,
        labels: [...fields.labels],
        createdAt: now,
        updatedAt: now,
      }
      commitTasks([task, ...tasks])
      showToast(`任务「${task.title}」已创建。`)
    },
    [tasks, commitTasks, showToast],
  )

  /** Apply an edit to one task. */
  const updateTask = React.useCallback(
    (taskId, fields) => {
      commitTasks(tasks.map((task) => (task.id === taskId ? { ...task, ...fields, labels: [...fields.labels], updatedAt: Date.now() } : task)))
      showToast('任务已更新。')
    },
    [tasks, commitTasks, showToast],
  )

  /** Delete one task. */
  const deleteTask = React.useCallback(
    (taskId) => {
      commitTasks(tasks.filter((task) => task.id !== taskId))
      showToast('任务已删除。')
    },
    [tasks, commitTasks, showToast],
  )

  /** Task count per space, for the list cards. */
  const taskCounts = React.useMemo(() => {
    const counts = new Map()
    for (const task of tasks) counts.set(task.spaceId, (counts.get(task.spaceId) ?? 0) + 1)
    return counts
  }, [tasks])

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
    commitTasks(tasks.filter((task) => task.spaceId !== confirmSpace.id))
    setConfirmSpace(null)
    showToast(`已删除空间「${confirmSpace.name}」及其任务。`)
  }, [confirmSpace, spaces, showToast, tasks, commitTasks])

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

  const openSpace = spaces.find((space) => space.id === openSpaceId)
  if (openSpace !== undefined) {
    return h(SpaceView, {
      space: openSpace,
      tasks,
      onBack: () => setOpenSpaceId(null),
      onCreate: (fields) => createTask(openSpace.id, fields),
      onUpdate: updateTask,
      onDeleteTask: deleteTask,
    })
  }

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
                  taskCount: taskCounts.get(space.id) ?? 0,
                  flash: flashId === space.id,
                  menuOpen: menuId === space.id,
                  onMenuOpen: () => setMenuId(menuId === space.id ? null : space.id),
                  onMenuClose: () => setMenuId(null),
                  onDelete: () => {
                    setMenuId(null)
                    setConfirmSpace(space)
                  },
                  onDuplicate: () => startDuplicate(space),
                  onOpen: () => setOpenSpaceId(space.id),
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
              desc: '此操作无法撤销。空间及其任务会被永久删除。',
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
