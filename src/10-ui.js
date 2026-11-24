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
