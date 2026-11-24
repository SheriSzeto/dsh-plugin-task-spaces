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
