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
