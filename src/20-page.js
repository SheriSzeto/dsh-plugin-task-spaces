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
  const [spaces, setSpaces] = React.useState([])
  const [tasks, setTasks] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [hostMode, setHostMode] = React.useState(false)
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

  /** Load the snapshot from the host half, migrating browser-era data once. */
  React.useEffect(() => {
    let alive = true
    ;(async () => {
      const state = await hostLoadState()
      if (!alive) return
      if (state === null) {
        setSpaces(loadSpaces())
        setTasks(loadTasks())
        setHostMode(false)
        setLoading(false)
        return
      }
      const localSpaces = loadSpaces()
      const localTasks = loadTasks()
      const hosted = state.spaces.length > 0 || state.tasks.length > 0
      if (!hosted && localSpaces.length > 0) {
        // One-time migration of the browser-storage era onto the host.
        setSpaces(localSpaces)
        setTasks(localTasks)
        setHostMode(true)
        setLoading(false)
        await hostSaveState(localSpaces, localTasks)
        return
      }
      setSpaces(state.spaces)
      setTasks(state.tasks)
      setHostMode(true)
      setLoading(false)
    })()
    return () => {
      alive = false
    }
  }, [])

  /** Persist a snapshot: host when available, browser storage otherwise. */
  const persist = React.useCallback(
    (nextSpaces, nextTasks) => {
      if (!hostMode) {
        saveSpaces(nextSpaces)
        saveTasks(nextTasks)
        return
      }
      hostSaveState(nextSpaces, nextTasks).then((ok) => {
        if (ok) return
        setHostMode(false)
        saveSpaces(nextSpaces)
        saveTasks(nextTasks)
        showToast('Host 存储写入失败，已回退到浏览器本地存储。')
      })
    },
    [hostMode, showToast],
  )

  /** Update both collections and persist them together. */
  const commitState = React.useCallback(
    (nextSpaces, nextTasks) => {
      setSpaces(nextSpaces)
      setTasks(nextTasks)
      persist(nextSpaces, nextTasks)
    },
    [persist],
  )

  /** Remove one attachment: host mode also deletes the stored file. */
  const deleteAttachment = React.useCallback(
    (file) => {
      if (hostMode && file !== undefined && typeof file.id === 'string' && file.dataUrl === undefined) hostDeleteFile(file.id)
    },
    [hostMode],
  )

  /** Delete attachment files owned by removed tasks (host mode only). */
  const dropAttachmentFiles = React.useCallback(
    (removedTasks) => {
      if (!hostMode) return
      for (const task of removedTasks) {
        for (const file of task.attachments ?? []) {
          if (typeof file.id === 'string' && file.dataUrl === undefined) hostDeleteFile(file.id)
        }
      }
    },
    [hostMode],
  )

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
        assignees: [...(fields.assignees ?? [])],
        attachments: fields.attachments ?? [],
        comments: [],
        createdAt: now,
        updatedAt: now,
      }
      commitState(spaces, [task, ...tasks])
      showToast(`任务「${task.title}」已创建。`)
    },
    [spaces, tasks, commitState, showToast],
  )

  /** Apply a partial edit to one task (the board's drag move sends only `status`). */
  const updateTask = React.useCallback(
    (taskId, fields) => {
      const previous = tasks.find((task) => task.id === taskId)
      commitState(
        spaces,
        tasks.map((task) => {
          if (task.id !== taskId) return task
          const next = { ...task, ...fields, updatedAt: Date.now() }
          if (fields.labels !== undefined) next.labels = [...fields.labels]
          return next
        }),
      )
      const commentOnly = fields.comments !== undefined && Object.keys(fields).length === 1
      if (commentOnly) return
      const moved = fields.status !== undefined && previous !== undefined && previous.status !== fields.status
      showToast(moved ? `任务已移动到「${fields.status}」。` : '任务已更新。')
    },
    [spaces, tasks, commitState, showToast],
  )

  /** Delete one task. */
  const deleteTask = React.useCallback(
    (taskId) => {
      const removed = tasks.find((task) => task.id === taskId)
      if (removed !== undefined) dropAttachmentFiles([removed])
      commitState(spaces, tasks.filter((task) => task.id !== taskId))
      showToast('任务已删除。')
    },
    [spaces, tasks, commitState, dropAttachmentFiles, showToast],
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
      commitState([space, ...spaces], tasks)
      setWizard(null)
      setFlashId(space.id)
      showToast(`空间「${space.name}」已创建。`)
    },
    [spaces, tasks, commitState, showToast],
  )

  /** Delete one space after confirmation. */
  const deleteSpace = React.useCallback(() => {
    if (confirmSpace === null) return
    const removedTasks = tasks.filter((task) => task.spaceId === confirmSpace.id)
    dropAttachmentFiles(removedTasks)
    commitState(
      spaces.filter((space) => space.id !== confirmSpace.id),
      tasks.filter((task) => task.spaceId !== confirmSpace.id),
    )
    setConfirmSpace(null)
    showToast(`已删除空间「${confirmSpace.name}」及其任务。`)
  }, [confirmSpace, spaces, showToast, tasks, commitState, dropAttachmentFiles])

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

  if (loading) {
    return h(
      'div',
      { 'data-dsh-task-spaces': '', className: 'ts-page' },
      h(
        'div',
        { className: 'ts-page-inner' },
        h(
          'div',
          { className: 'ts-empty' },
          h('span', { className: 'ts-empty-badge', 'aria-hidden': 'true' }, h(Icon, { name: 'sparkle', size: 22 })),
          h('div', { className: 'ts-empty-title' }, '正在连接 Host 存储…'),
          h('p', { className: 'ts-empty-desc' }, '空间、任务、评论和附件保存在本机 DSH 数据目录，清浏览器站点数据或换浏览器都不会丢。'),
        ),
      ),
    )
  }

  const openSpace = spaces.find((space) => space.id === openSpaceId)
  if (openSpace !== undefined) {
    return h(
      React.Fragment,
      null,
      h(SpaceView, {
        space: openSpace,
        tasks,
        hostMode,
        onUploadFile: hostMode ? hostUploadFile : undefined,
        onDeleteAttachment: deleteAttachment,
        onBack: () => setOpenSpaceId(null),
        onCreate: (fields) => createTask(openSpace.id, fields),
        onUpdate: updateTask,
        onDeleteTask: deleteTask,
      }),
      toast === null
        ? null
        : createPortal(h('div', { 'data-dsh-task-spaces': '' }, h(Toast, { toast })), document.body),
    )
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
        h('span', { className: 'ts-chip', title: hostMode ? '数据保存在本机 DSH home 目录' : 'Host 不可用，退回浏览器本地存储' }, hostMode ? 'Host 持久化' : '本地模式'),
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
