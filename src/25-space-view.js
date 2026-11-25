/**
 * Space workspace: a space's task list / status board plus the create-or-edit
 * task dialog. Tasks belong to exactly one space; status and type choices come
 * from that space's own workflow and task types.
 */

/** Resolve a task's status definition against its space (name-keyed). */
function resolveStatus(space, name) {
  const found = space.statuses.find((status) => status.name === name)
  return found ?? space.statuses[0] ?? { name: name, color: 'backlog' }
}

/** Display label for a task type id. */
function taskTypeName(id) {
  if (id === 'task') return '任务'
  const found = TASK_TYPE_POOL.find((type) => type.id === id)
  return found === undefined ? id : found.name
}

/** One avatar for a person or agent name. */
function Avatar({ name }) {
  return h(
    'span',
    { className: 'ts-avatar', style: { background: assigneeColor(name) }, title: name, 'aria-label': name },
    assigneeInitials(name),
  )
}

/** A compact avatar stack (max 2 + overflow counter). */
function AvatarStack({ names }) {
  if (names.length === 0) return h('span', { className: 'ts-assignee-missing' }, '未指定执行者')
  const shown = names.slice(0, 2)
  const extra = names.length - shown.length
  return h(
    'span',
    { className: 'ts-avatars', title: names.join('、') },
    shown.map((name) => h(Avatar, { key: name, name })),
    extra > 0 ? h('span', { className: 'ts-avatar-more' }, h(Avatar, { name: `+${extra}` })) : null,
  )
}

/** One task row in the list view. */
function TaskRow({ space, task, onOpen }) {
  const status = resolveStatus(space, task.status)
  const priority = priorityOf(task.priority)
  return h(
    'button',
    { type: 'button', className: 'ts-task-row', onClick: onOpen },
    h('span', { className: 'ts-dot', style: { background: STATUS_COLORS[status.color] ?? STATUS_COLORS.backlog } }),
    h(
      'span',
      { className: 'ts-task-main' },
      h('span', { className: 'ts-task-title' }, task.title),
      h(
        'span',
        { className: 'ts-task-sub' },
        h('span', { className: 'ts-chip' }, taskTypeName(task.type)),
        task.labels.map((label) => h('span', { key: label, className: 'ts-label-chip' }, label)),
      ),
    ),
    h(
      'span',
      { className: 'ts-task-side' },
      h(AvatarStack, { names: task.assignees }),
      task.attachments.length > 0
        ? h('span', { className: 'ts-attach-count', title: task.attachments.map((file) => file.name).join('、') }, h(Icon, { name: 'paperclip', size: 12 }), String(task.attachments.length))
        : null,
      task.comments.length > 0
        ? h('span', { className: 'ts-comment-count', title: `${task.comments.length} 条进展` }, h(Icon, { name: 'comment', size: 12 }), String(task.comments.length))
        : null,
      priority.color === null ? null : h(
        'span',
        { className: 'ts-priority', 'data-priority': priority.id },
        h('span', { className: 'ts-priority-dot', style: { background: priority.color } }),
        priority.name,
      ),
      h(StatusPill, { status }),
      h('span', { className: 'ts-task-time' }, relativeTime(task.createdAt)),
    ),
  )
}

/** One task card in the board view; drag it to another column to change status. */
function TaskCard({ space, task, onOpen, dragging, onDragStart, onDragEnd }) {
  const priority = priorityOf(task.priority)
  return h(
    'button',
    {
      type: 'button',
      className: 'ts-board-card',
      draggable: 'true',
      'data-dragging': dragging ? 'true' : 'false',
      title: '拖动到其他状态列可修改状态；点击编辑',
      onClick: onOpen,
      onDragStart,
      onDragEnd,
    },
    h('span', { className: 'ts-board-card-title' }, task.title),
    h(
      'span',
      { className: 'ts-board-card-meta' },
      h('span', { className: 'ts-chip' }, taskTypeName(task.type)),
      priority.color === null ? null : h(
        'span',
        { className: 'ts-priority', 'data-priority': priority.id },
        h('span', { className: 'ts-priority-dot', style: { background: priority.color } }),
        priority.name,
      ),
      task.labels.map((label) => h('span', { key: label, className: 'ts-label-chip' }, label)),
    ),
    task.assignees.length > 0 || task.attachments.length > 0 || task.comments.length > 0
      ? h(
          'span',
          { className: 'ts-board-card-foot' },
          h(AvatarStack, { names: task.assignees }),
          h(
            'span',
            { className: 'ts-board-card-foot-right' },
            task.comments.length > 0
              ? h('span', { className: 'ts-comment-count', title: `${task.comments.length} 条进展` }, h(Icon, { name: 'comment', size: 11 }), String(task.comments.length))
              : null,
            task.attachments.length > 0
              ? h('span', { className: 'ts-attach-count', title: task.attachments.map((file) => file.name).join('、') }, h(Icon, { name: 'paperclip', size: 11 }), String(task.attachments.length))
              : null,
          ),
        )
      : null,
  )
}

/**
 * Create-or-edit dialog for one task.
 * @param props.space - owning space (status/type/label options).
 * @param props.task - task being edited, or undefined for creation.
 * @param props.initialStatus - pre-selected status when creating from a board column.
 * @param props.onClose - dismiss without writing.
 * @param props.onSubmit - receives the edited field set.
 * @param props.onDelete - delete the edited task (edit mode only).
 */
function TaskEditor({ space, task, initialStatus, suggestions, onClose, onSubmit, onDelete, onAddComment, onDeleteComment, onUploadFile, onDeleteAttachment }) {
  const isEdit = task !== undefined
  const [title, setTitle] = React.useState(isEdit ? task.title : '')
  const [description, setDescription] = React.useState(isEdit ? task.description : '')
  const [type, setType] = React.useState(isEdit && task.type !== undefined ? task.type : (space.taskTypes[0] ?? 'task'))
  const [status, setStatus] = React.useState(
    isEdit ? task.status : (initialStatus ?? (space.statuses.find((entry) => entry.default === true) ?? space.statuses[0]).name),
  )
  const [priority, setPriority] = React.useState(isEdit ? task.priority : 'none')
  const [labels, setLabels] = React.useState(isEdit ? [...task.labels] : [])
  const [titleTouched, setTitleTouched] = React.useState(false)
  const [assignees, setAssignees] = React.useState(isEdit ? [...task.assignees] : [])
  const [assigneeDraft, setAssigneeDraft] = React.useState('')
  const [attachments, setAttachments] = React.useState(isEdit ? [...task.attachments] : [])
  const [attachError, setAttachError] = React.useState('')
  const [uploading, setUploading] = React.useState(false)
  const fileInputRef = React.useRef(null)
  const hostUpload = typeof onUploadFile === 'function'
  const attachmentMaxBytes = hostUpload ? HOST_ATTACHMENT_MAX_BYTES : ATTACHMENT_MAX_BYTES
  const attachmentMaxCount = hostUpload ? HOST_ATTACHMENT_MAX_COUNT : ATTACHMENT_MAX_COUNT
  const uploadedRef = React.useRef([])
  const savedRef = React.useRef(false)

  // A file uploaded during this edit but never saved must not linger on disk.
  React.useEffect(
    () => () => {
      if (savedRef.current || typeof onDeleteAttachment !== 'function') return
      for (const id of uploadedRef.current) onDeleteAttachment({ id })
    },
    [onDeleteAttachment],
  )
  const [commentAuthor, setCommentAuthor] = React.useState(() => loadCommentAuthor() || '我')
  const [commentBody, setCommentBody] = React.useState('')
  const commentCount = isEdit ? task.comments.length : 0

  /** Post one comment immediately (comments are not part of the field draft). */
  const submitComment = () => {
    const body = commentBody.trim()
    if (body.length === 0 || !isEdit) return
    const author = commentAuthor.trim().length === 0 ? '我' : commentAuthor.trim()
    onAddComment({ id: newTaskId(), author, body, createdAt: Date.now() })
    saveCommentAuthor(author)
    setCommentBody('')
  }

  /** Add one assignee (single-assignee spaces replace the current one). */
  const addAssignee = (raw) => {
    const name = raw.trim()
    if (name.length === 0) return
    // Personal workspace: one executor slot per task, so a new name replaces the old one.
    setAssignees((current) => (current.includes(name) ? current : [name]))
    setAssigneeDraft('')
  }

  /** Add picked files: upload to the host when available, else inline as data URLs. */
  const pickFiles = async (fileList) => {
    setAttachError('')
    const files = Array.from(fileList ?? [])
    if (files.length === 0) return
    const next = [...attachments]
    if (hostUpload) setUploading(true)
    try {
      for (const file of files) {
        if (next.length >= attachmentMaxCount) {
          setAttachError(`最多添加 ${attachmentMaxCount} 个附件。`)
          break
        }
        if (file.size > attachmentMaxBytes) {
          setAttachError(`「${file.name}」超过 ${fileSizeText(attachmentMaxBytes)}。`)
          continue
        }
        try {
          if (hostUpload) {
            // The host stores the bytes on disk and returns only metadata.
            const meta = await onUploadFile(file)
            uploadedRef.current.push(meta.id)
            next.push(meta)
          } else {
            const dataUrl = await readFileAsDataUrl(file)
            next.push({ id: newTaskId(), name: file.name, size: file.size, type: file.type, dataUrl })
          }
        } catch (error) {
          setAttachError(error instanceof Error ? error.message : `添加「${file.name}」失败。`)
        }
      }
    } finally {
      if (hostUpload) setUploading(false)
    }
    setAttachments(next)
    if (fileInputRef.current !== null) fileInputRef.current.value = ''
  }

  /** Remove one attachment, deleting its host-stored bytes when applicable. */
  const removeAttachment = (id) => {
    const target = attachments.find((file) => file.id === id)
    if (target !== undefined && typeof onDeleteAttachment === 'function') onDeleteAttachment(target)
    setAttachments((current) => current.filter((file) => file.id !== id))
  }

  /** Download/open URL for one attachment (host route or inline data URL). */
  const attachmentHref = (file) => file.dataUrl ?? hostFileUrl(file.id)

  const typeChoices = ['task', ...space.taskTypes.filter((id) => id !== 'task')]
  const submitEnabled = title.trim().length > 0

  React.useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = () => {
    if (!submitEnabled) return
    savedRef.current = true
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      type,
      status,
      priority,
      labels,
      assignees,
      attachments,
    })
  }

  return createPortal(
    h(
      'div',
      { 'data-dsh-task-spaces': '', className: 'ts-overlay' },
      h('div', { className: 'ts-mask', onClick: onClose }),
      h(
        'div',
        { className: 'ts-task-dialog', role: 'dialog', 'aria-modal': 'true', 'aria-label': isEdit ? '编辑任务' : '新建任务' },
        h(
          'div',
          { className: 'ts-task-dialog-head' },
          h(
            'div',
            null,
            h('h2', { className: 'ts-task-dialog-title' }, isEdit ? '编辑任务' : '新建任务'),
            h('div', { className: 'ts-task-dialog-sub' }, `${space.name} · ${space.identifier} · 任务会使用该空间自己的工作流与标签`),
          ),
          h('button', { type: 'button', className: 'ts-icon-btn', 'aria-label': '关闭', onClick: onClose }, h(Icon, { name: 'close', size: 15 })),
        ),
        h(
          'div',
          { className: 'ts-task-form' },
          h(
            'label',
            { className: 'ts-field' },
            h('span', { className: 'ts-field-label' }, '标题'),
            h('input', {
              className: 'ts-input',
              placeholder: '用一句话说明要做什么',
              maxLength: 120,
              value: title,
              autoFocus: true,
              'data-invalid': titleTouched && !submitEnabled ? 'true' : 'false',
              onChange: (event) => setTitle(event.target.value),
              onBlur: () => setTitleTouched(true),
              onKeyDown: (event) => {
                if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) submit()
              },
            }),
            titleTouched && !submitEnabled ? h('span', { className: 'ts-field-error' }, '标题不能为空。') : null,
          ),
          h(
            'label',
            { className: 'ts-field' },
            h(
              'span',
              { className: 'ts-field-label' },
              h('span', null, '描述'),
              h('span', { className: 'ts-field-hint' }, '可选'),
            ),
            h('textarea', {
              className: 'ts-textarea',
              placeholder: '补充背景、目标、范围和验收标准…',
              value: description,
              onChange: (event) => setDescription(event.target.value),
            }),
          ),
          h(
            'div',
            { className: 'ts-field' },
            h(
              'span',
              { className: 'ts-field-label' },
              h('span', null, '执行者'),
              h('span', { className: 'ts-field-hint' }, '我 / Agent'),
            ),
            h(
              'div',
              { className: 'ts-assignee-box' },
              assignees.map((name) =>
                h(
                  'span',
                  { key: name, className: 'ts-assignee-chip' },
                  h(Avatar, { name }),
                  name,
                  h(
                    'button',
                    {
                      type: 'button',
                      'aria-label': `移除执行者 ${name}`,
                      onClick: () => setAssignees((current) => current.filter((entry) => entry !== name)),
                    },
                    h(Icon, { name: 'close', size: 10, strokeWidth: 1.8 }),
                  ),
                ),
              ),
              h('input', {
                list: 'ts-assignee-options',
                placeholder: assignees.length === 0 ? '输入执行者名称（我 / Agent），回车添加' : '继续添加…',
                value: assigneeDraft,
                'aria-label': '添加执行者',
                onChange: (event) => setAssigneeDraft(event.target.value),
                onKeyDown: (event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addAssignee(assigneeDraft)
                  }
                },
              }),
              h(
                'datalist',
                { id: 'ts-assignee-options' },
                (suggestions ?? assignees).map((name) => h('option', { key: name, value: name })),
              ),
            ),
            h('span', { className: 'ts-field-hint' }, '单个执行者：添加新执行者会替换原来的；输入过的名字会被记住。'),
          ),
          h(
            'div',
            { className: 'ts-form-row' },
            h(
              'label',
              { className: 'ts-field' },
              h('span', { className: 'ts-field-label' }, '任务类型'),
              h(
                'select',
                { className: 'ts-select', value: type, onChange: (event) => setType(event.target.value) },
                typeChoices.map((id) => h('option', { key: id, value: id }, taskTypeName(id))),
              ),
            ),
            h(
              'label',
              { className: 'ts-field' },
              h('span', { className: 'ts-field-label' }, '状态'),
              h(
                'select',
                { className: 'ts-select', value: status, onChange: (event) => setStatus(event.target.value) },
                space.statuses.map((entry) => h('option', { key: entry.name, value: entry.name }, entry.name)),
              ),
            ),
          ),
          h(
            'div',
            { className: 'ts-form-row' },
            h(
              'label',
              { className: 'ts-field' },
              h('span', { className: 'ts-field-label' }, '优先级'),
              h(
                'select',
                { className: 'ts-select', value: priority, onChange: (event) => setPriority(event.target.value) },
                TASK_PRIORITIES.map((entry) => h('option', { key: entry.id, value: entry.id }, entry.name)),
              ),
            ),
            h(
              'div',
              { className: 'ts-field' },
              h('span', { className: 'ts-field-label' }, '标签'),
              space.labels.length === 0
                ? h('span', { className: 'ts-field-hint' }, '此空间还没有标签。')
                : h(
                    'div',
                    { className: 'ts-chip-row' },
                    space.labels.map((label) =>
                      h(
                        'button',
                        {
                          key: label,
                          type: 'button',
                          className: 'ts-label-chip ts-label-toggle',
                          'aria-pressed': labels.includes(label) ? 'true' : 'false',
                          onClick: () =>
                            setLabels((current) => (current.includes(label) ? current.filter((entry) => entry !== label) : [...current, label])),
                        },
                        label,
                      ),
                    ),
                  ),
            ),
          ),
          h(
            'div',
            { className: 'ts-field' },
            h(
              'span',
              { className: 'ts-field-label' },
              h('span', null, '附件'),
              h('span', { className: 'ts-field-hint' }, `最多 ${attachmentMaxCount} 个，单个不超过 ${fileSizeText(attachmentMaxBytes)}`),
            ),
            h(
              'div',
              { className: 'ts-attach-row' },
              h('input', {
                ref: fileInputRef,
                type: 'file',
                multiple: true,
                className: 'ts-file-input',
                onChange: (event) => pickFiles(event.target.files),
              }),
              h(
                Btn,
                { kind: 'outline', icon: 'paperclip', disabled: uploading, onClick: () => fileInputRef.current?.click() },
                uploading ? '上传中…' : '添加附件',
              ),
              attachments.length > 0 ? h('span', { className: 'ts-field-hint' }, `已添加 ${attachments.length} 个`) : null,
            ),
            attachments.length === 0
              ? h('span', { className: 'ts-field-hint' }, '附件保存在浏览器本地（原型数据），刷新后仍在。')
              : h(
                  'div',
                  { className: 'ts-attach-list' },
                  attachments.map((file) =>
                    h(
                      'div',
                      { key: file.id, className: 'ts-attach-item' },
                      h(
                        'span',
                        { className: 'ts-attach-thumb' },
                        isImageAttachment(file.type)
                          ? h('img', { src: file.dataUrl ?? hostFileUrl(file.id), alt: file.name })
                          : h(Icon, { name: 'paperclip', size: 15 }),
                      ),
                      h(
                        'span',
                        { className: 'ts-attach-text' },
                        h('span', { className: 'ts-attach-name', title: file.name }, file.name),
                        h('span', { className: 'ts-attach-size' }, fileSizeText(file.size)),
                      ),
                      h(
                        'a',
                        {
                          className: 'ts-attach-open',
                          href: attachmentHref(file),
                          download: file.dataUrl !== undefined ? file.name : undefined,
                          target: file.dataUrl === undefined ? '_blank' : undefined,
                          rel: 'noreferrer',
                          onClick: (event) => event.stopPropagation(),
                        },
                        '打开',
                      ),
                      h(
                        'button',
                        {
                          type: 'button',
                          className: 'ts-icon-btn',
                          'aria-label': `移除附件 ${file.name}`,
                          onClick: () => removeAttachment(file.id),
                        },
                        h(Icon, { name: 'close', size: 13 }),
                      ),
                    ),
                  ),
                ),
            attachError.length > 0 ? h('span', { className: 'ts-attach-error' }, attachError) : null,
          ),
          isEdit
            ? h(
                'div',
                { className: 'ts-field' },
                h(
                  'span',
                  { className: 'ts-field-label' },
                  h('span', null, '进展记录'),
                  h('span', { className: 'ts-field-hint' }, commentCount === 0 ? '还没有记录' : `${commentCount} 条`),
                ),
                commentCount === 0
                  ? h('span', { className: 'ts-comment-empty' }, '记录第一条进展：做了什么、卡在哪、结论是什么。')
                  : h(
                      'div',
                      { className: 'ts-comment-list' },
                      task.comments
                        .slice()
                        .sort((left, right) => left.createdAt - right.createdAt)
                        .map((comment) =>
                          h(
                            'div',
                            { key: comment.id, className: 'ts-comment' },
                            h(Avatar, { name: comment.author }),
                            h(
                              'div',
                              { className: 'ts-comment-body' },
                              h(
                                'div',
                                { className: 'ts-comment-head' },
                                h('span', { className: 'ts-comment-author' }, comment.author),
                                h('span', { className: 'ts-comment-time' }, relativeTime(comment.createdAt)),
                              ),
                              h('div', { className: 'ts-comment-text' }, comment.body),
                            ),
                            h(
                              'button',
                              {
                                type: 'button',
                                className: 'ts-comment-del',
                                'aria-label': '删除评论',
                                title: '删除评论',
                                onClick: () => onDeleteComment(comment.id),
                              },
                              h(Icon, { name: 'close', size: 11 }),
                            ),
                          ),
                        ),
                    ),
                h(
                  'div',
                  { className: 'ts-comment-composer' },
                  h(
                    'div',
                    { className: 'ts-comment-composer-row' },
                    h(Avatar, { name: commentAuthor.trim().length === 0 ? '我' : commentAuthor.trim() }),
                    h('input', {
                      className: 'ts-comment-author-input',
                      value: commentAuthor,
                      placeholder: '我 / Agent 名称',
                      'aria-label': '记录人',
                      onChange: (event) => setCommentAuthor(event.target.value),
                    }),
                    h('span', { className: 'ts-field-hint' }, '会记住，下次自动填'),
                  ),
                  h('textarea', {
                    className: 'ts-comment-input',
                    placeholder: '记录进展…（⌘/Ctrl + Enter 保存）',
                    value: commentBody,
                    'aria-label': '进展内容',
                    onChange: (event) => setCommentBody(event.target.value),
                    onKeyDown: (event) => {
                      if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                        event.preventDefault()
                        submitComment()
                      }
                    },
                  }),
                  h(
                    'div',
                    { className: 'ts-comment-actions' },
                    h(Btn, { kind: 'primary', disabled: commentBody.trim().length === 0, onClick: submitComment }, '记录进展'),
                  ),
                ),
              )
            : null,
        ),
        h(
          'div',
          { className: 'ts-task-dialog-foot' },
          isEdit && typeof onDelete === 'function'
            ? h(Btn, { kind: 'danger', icon: 'trash', onClick: onDelete }, '删除任务')
            : null,
          h('span', { className: 'ts-footer-spacer' }),
          h(Btn, { kind: 'ghost', onClick: onClose }, '取消'),
          h(Btn, { kind: 'primary', disabled: !submitEnabled, onClick: submit }, isEdit ? '保存' : '创建任务'),
        ),
      ),
    ),
    document.body,
  )
}

/**
 * The space workspace panel: header, filters, list/board switch, tasks and the
 * editor. Board cards can be dragged between status columns to change status.
 * @param props.space - the space being opened.
 * @param props.tasks - every task (filtered here to this space).
 * @param props.onBack - return to the spaces list.
 * @param props.onCreate - create a task from the editor's field set.
 * @param props.onUpdate - apply a partial edit (status moves, priority, ...) to one task.
 * @param props.onDeleteTask - delete one task.
 */
function SpaceView({ space, tasks, hostMode, onUploadFile, onDeleteAttachment, onBack, onCreate, onUpdate, onDeleteTask }) {
  const [view, setView] = React.useState('list')
  const [editor, setEditor] = React.useState(null)
  const [query, setQuery] = React.useState('')
  const [typeFilter, setTypeFilter] = React.useState('all')
  const [priorityFilter, setPriorityFilter] = React.useState('all')
  const [labelFilter, setLabelFilter] = React.useState('all')
  const [assigneeFilter, setAssigneeFilter] = React.useState('all')
  const [draggingId, setDraggingId] = React.useState(null)
  const [dropStatus, setDropStatus] = React.useState(null)

  const spaceTasks = tasks
    .filter((task) => task.spaceId === space.id)
    .sort((left, right) => right.createdAt - left.createdAt)
  const typeChoices = ['task', ...space.taskTypes.filter((id) => id !== 'task')]
  const assigneeOptions = Array.from(new Set(spaceTasks.flatMap((task) => task.assignees))).sort((left, right) => left.localeCompare(right, 'zh-Hans-CN'))

  const filtersActive =
    query.trim().length > 0 || typeFilter !== 'all' || priorityFilter !== 'all' || labelFilter !== 'all' || assigneeFilter !== 'all'
  const visibleTasks = spaceTasks.filter((task) => {
    const needle = query.trim().toLowerCase()
    if (needle.length > 0 && !`${task.title}\n${task.description}`.toLowerCase().includes(needle)) return false
    if (typeFilter !== 'all' && task.type !== typeFilter) return false
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false
    if (labelFilter !== 'all' && !task.labels.includes(labelFilter)) return false
    if (assigneeFilter === 'unassigned' && task.assignees.length > 0) return false
    if (assigneeFilter !== 'all' && assigneeFilter !== 'unassigned' && !task.assignees.includes(assigneeFilter)) return false
    return true
  })

  const clearFilters = () => {
    setQuery('')
    setTypeFilter('all')
    setPriorityFilter('all')
    setLabelFilter('all')
    setAssigneeFilter('all')
  }

  const openCreate = (status) => setEditor({ mode: 'create', status })
  const openEdit = (task) => setEditor({ mode: 'edit', taskId: task.id })

  const editingTask = editor !== null && editor.mode === 'edit' ? tasks.find((task) => task.id === editor.taskId) : undefined

  const submitEditor = (fields) => {
    if (editor.mode === 'edit') onUpdate(editor.taskId, fields)
    else onCreate(fields)
    setEditor(null)
  }

  const startDrag = (task) => (event) => {
    event.dataTransfer.setData('text/plain', task.id)
    event.dataTransfer.effectAllowed = 'move'
    setDraggingId(task.id)
  }

  const endDrag = () => {
    setDraggingId(null)
    setDropStatus(null)
  }

  const dropOn = (statusName) => (event) => {
    event.preventDefault()
    const taskId = event.dataTransfer.getData('text/plain')
    setDropStatus(null)
    setDraggingId(null)
    if (taskId.length === 0) return
    const task = tasks.find((entry) => entry.id === taskId)
    if (task === undefined || task.status === statusName) return
    onUpdate(taskId, { status: statusName })
  }

  const countFor = (statusName) => visibleTasks.filter((task) => task.status === statusName).length

  return h(
    'div',
    { 'data-dsh-task-spaces': '', className: 'ts-page' },
    h(
      'div',
      { className: 'ts-page-inner' },
      h(
        'header',
        { className: 'ts-space-head' },
        h('button', { type: 'button', className: 'ts-back', 'aria-label': '返回空间列表', onClick: onBack }, h(Icon, { name: 'chevron-left', size: 16 })),
        h(SpaceBadge, { icon: space.icon, size: 'lg' }),
        h(
          'div',
          { className: 'ts-space-identity' },
          h(
            'h1',
            { className: 'ts-space-title' },
            space.name,
            h('span', { className: 'ts-id-badge' }, space.identifier),
          ),
          h(
            'div',
            { className: 'ts-space-meta' },
            h('span', null, workCategory(space.workCategory).name),
            h('span', null, '·'),
            h('span', null, `${space.statuses.length} 个状态`),
            h('span', null, '·'),
            h('span', null, `${spaceTasks.length} 个任务`),
            h('span', null, '·'),
            h(
              'span',
              { className: 'ts-chip-row' },
              enabledModules(space).map((module) => h('span', { key: module.id, className: 'ts-chip' }, module.name)),
            ),
          ),
        ),
        h(
          'div',
          { className: 'ts-head-actions' },
          h(Btn, { kind: 'primary', icon: 'plus', onClick: () => openCreate() }, '添加任务'),
        ),
      ),
      h(
        'div',
        { className: 'ts-space-toolbar' },
        h(Segmented, {
          label: '任务视图',
          value: view,
          onChange: setView,
          items: [
            { value: 'list', label: '列表' },
            { value: 'board', label: '看板' },
          ],
        }),
        h('span', { className: 'ts-count' }, filtersActive ? `${visibleTasks.length} / ${spaceTasks.length} 个任务` : `共 ${spaceTasks.length} 个任务`),
        h('span', { className: 'ts-toolbar-spacer' }),
        h(
          'div',
          { className: 'ts-chip-row' },
          space.statuses.map((status) =>
            h(
              'span',
              { key: status.name, className: 'ts-chip' },
              h('span', { className: 'ts-dot', style: { background: STATUS_COLORS[status.color] ?? STATUS_COLORS.backlog } }),
              `${status.name} ${countFor(status.name)}`,
            ),
          ),
        ),
      ),
      h(
        'div',
        { className: 'ts-filterbar' },
        h(
          'span',
          { className: 'ts-search' },
          h(Icon, { name: 'search', size: 13 }),
          h('input', {
            placeholder: '搜索标题或描述',
            value: query,
            'aria-label': '搜索任务',
            onChange: (event) => setQuery(event.target.value),
          }),
        ),
        h(
          'select',
          { className: 'ts-select ts-filter-select', value: typeFilter, 'aria-label': '按任务类型筛选', onChange: (event) => setTypeFilter(event.target.value) },
          h('option', { value: 'all' }, '全部类型'),
          typeChoices.map((id) => h('option', { key: id, value: id }, taskTypeName(id))),
        ),
        h(
          'select',
          { className: 'ts-select ts-filter-select', value: priorityFilter, 'aria-label': '按优先级筛选', onChange: (event) => setPriorityFilter(event.target.value) },
          h('option', { value: 'all' }, '全部优先级'),
          TASK_PRIORITIES.map((entry) => h('option', { key: entry.id, value: entry.id }, entry.name)),
        ),
        space.labels.length > 0
          ? h(
              'select',
              { className: 'ts-select ts-filter-select', value: labelFilter, 'aria-label': '按标签筛选', onChange: (event) => setLabelFilter(event.target.value) },
              h('option', { value: 'all' }, '全部标签'),
              space.labels.map((label) => h('option', { key: label, value: label }, label)),
            )
          : null,
        h(
          'select',
          { className: 'ts-select ts-filter-select', value: assigneeFilter, 'aria-label': '按执行者筛选', onChange: (event) => setAssigneeFilter(event.target.value) },
          h('option', { value: 'all' }, '全部执行者'),
          h('option', { value: 'unassigned' }, '未分配'),
          assigneeOptions.map((name) => h('option', { key: name, value: name }, name)),
        ),
        filtersActive
          ? h(Btn, { kind: 'ghost', icon: 'close', className: 'ts-filter-clear', onClick: clearFilters }, '清除筛选')
          : null,
      ),
      spaceTasks.length === 0
        ? h(
            'div',
            { className: 'ts-empty-tasks' },
            h('span', { className: 'ts-empty-badge', 'aria-hidden': 'true' }, h(Icon, { name: 'checklist', size: 24 })),
            h('div', { className: 'ts-empty-title' }, '这个空间还没有任务'),
            h('p', { className: 'ts-empty-desc' }, '任务会用这个空间的工作流状态、任务类型和标签。先创建第一条任务试试。'),
            h(Btn, { kind: 'primary', icon: 'plus', onClick: () => openCreate() }, '添加任务'),
          )
        : visibleTasks.length === 0
          ? h(
              'div',
              { className: 'ts-inline-note' },
              h(Icon, { name: 'search', size: 14 }),
              h('span', null, '没有匹配当前筛选的任务。'),
              h(Btn, { kind: 'ghost', className: 'ts-filter-clear', onClick: clearFilters }, '清除筛选'),
            )
          : view === 'list'
            ? h(
                'div',
                { className: 'ts-task-list' },
                visibleTasks.map((task) => h(TaskRow, { key: task.id, space, task, onOpen: () => openEdit(task) })),
              )
            : h(
                'div',
                { className: 'ts-board' },
                space.statuses.map((status) =>
                  h(
                    'div',
                    {
                      key: status.name,
                      className: 'ts-board-col',
                      'data-drop': dropStatus === status.name ? 'true' : 'false',
                      onDragOver: (event) => {
                        if (draggingId === null) return
                        event.preventDefault()
                        event.dataTransfer.dropEffect = 'move'
                        if (dropStatus !== status.name) setDropStatus(status.name)
                      },
                      onDragLeave: () => {
                        if (dropStatus === status.name) setDropStatus(null)
                      },
                      onDrop: dropOn(status.name),
                    },
                    h(
                      'div',
                      { className: 'ts-board-head' },
                      h('span', { className: 'ts-dot', style: { background: STATUS_COLORS[status.color] ?? STATUS_COLORS.backlog } }),
                      h('span', { className: 'ts-board-name' }, status.name),
                      h('span', { className: 'ts-board-count' }, String(countFor(status.name))),
                      h(
                        'button',
                        {
                          type: 'button',
                          className: 'ts-icon-btn ts-board-add',
                          'aria-label': `在「${status.name}」下添加任务`,
                          onClick: () => openCreate(status.name),
                        },
                        h(Icon, { name: 'plus', size: 14 }),
                      ),
                    ),
                    h(
                      'div',
                      { className: 'ts-board-cards' },
                      visibleTasks
                        .filter((task) => task.status === status.name)
                        .map((task) =>
                          h(TaskCard, {
                            key: task.id,
                            space,
                            task,
                            dragging: draggingId === task.id,
                            onDragStart: startDrag(task),
                            onDragEnd: endDrag,
                            onOpen: () => openEdit(task),
                          }),
                        ),
                      countFor(status.name) === 0
                        ? h('div', { className: 'ts-board-empty' }, draggingId === null ? '暂无任务' : '拖到这里')
                        : null,
                    ),
                  ),
                ),
              ),
    ),
    editor === null || (editor.mode === 'edit' && editingTask === undefined)
      ? null
      : h(TaskEditor, {
          space,
          task: editor.mode === 'edit' ? editingTask : undefined,
          initialStatus: editor.mode === 'create' ? editor.status : undefined,
          suggestions: assigneeOptions,
          onUploadFile,
          onDeleteAttachment,
          onClose: () => setEditor(null),
          onSubmit: submitEditor,
          onDelete:
            editor.mode === 'edit'
              ? () => {
                  onDeleteTask(editor.taskId)
                  setEditor(null)
                }
              : undefined,
          onAddComment:
            editor.mode === 'edit'
              ? (comment) => onUpdate(editingTask.id, { comments: [...editingTask.comments, comment] })
              : undefined,
          onDeleteComment:
            editor.mode === 'edit'
              ? (commentId) => onUpdate(editingTask.id, { comments: editingTask.comments.filter((entry) => entry.id !== commentId) })
              : undefined,
        }),
  )
}
