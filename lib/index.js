/**
 * Task-spaces plugin, node half.
 *
 * The feature is pure UI: spaces live in the browser's localStorage, so the
 * host half has nothing to do. It exists so the package appears in the loader
 * roster; the browser half ships via exports["./client"] and is discovered
 * through the package.json `dsh.client` declaration.
 */

/** Host plugin body — no host-side behavior for this surface plugin. */
export function apply() {}

/** No required host services. */
export const inject = []
