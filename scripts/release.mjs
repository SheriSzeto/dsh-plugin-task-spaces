#!/usr/bin/env node
/**
 * Release helper for dsh-plugin-task-spaces.
 *
 * Goal: a package that a stranger can install. That means one thing must never
 * be stale or mismatched — the built client bundle. DSH resolves a plugin's
 * browser half from `lib/client.js`, and the module id inside it is the package
 * name; renaming or republishing without a rebuild produces a bundle that
 * silently fails to load. This script rebuilds, then proves the artifact is
 * coherent before packing it.
 *
 * Usage:
 *   node scripts/release.mjs             build + validate + pack into dist/
 *   node scripts/release.mjs --check     validate the current tree only
 *   node scripts/release.mjs --no-pack   build + validate, skip packing
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const args = new Set(process.argv.slice(2))
const checkOnly = args.has('--check')
const skipPack = checkOnly || args.has('--no-pack')

const checks = []
/** Record one validation result. */
function check(name, ok, detail) {
  checks.push({ name, ok, detail })
}

/* ------------------------------------------------------------------ build */

if (!checkOnly) {
  console.log('▸ build lib/client.js')
  execFileSync(process.execPath, [join(root, 'scripts', 'build.mjs')], { cwd: root, stdio: 'inherit' })
}

/* --------------------------------------------------------------- manifest */

check('package.json has a name', typeof pkg.name === 'string' && pkg.name.length > 0, pkg.name)
check('package.json is not private', pkg.private !== true, pkg.private ? 'private: true blocks publishing' : 'ok')
check('package.json declares dsh.bundle.patch', typeof pkg.dsh?.bundle?.patch === 'string', pkg.dsh?.bundle?.patch)
check(
  'package.json declares dsh.client.platform web',
  pkg.dsh?.client?.platform === 'web',
  pkg.dsh?.client?.platform,
)
check('package is installable from a tarball (files whitelist)', Array.isArray(pkg.files) && pkg.files.includes('lib'), pkg.files?.join(', '))

/* ------------------------------------------------------------------ files */

const requiredFiles = ['lib/index.js', 'lib/client.js', 'cordis.patch.yml', 'README.md', 'LICENSE']
for (const file of requiredFiles) {
  check(`file exists: ${file}`, existsSync(join(root, file)), file)
}

/* ------------------------------------------------------- client bundle id */

let clientBundle = ''
try {
  clientBundle = readFileSync(join(root, 'lib', 'client.js'), 'utf8')
} catch {
  /* reported by the file check above */
}
const clientId = clientBundle.match(/window\.__ModuleLoader__\.load\(\{\s*id:\s*"([^"]+)"/)?.[1]
check(
  'client bundle id matches package name',
  clientId === pkg.name,
  clientId === pkg.name ? clientId : `bundle id "${clientId ?? '?'}" vs package name "${pkg.name}" — run the build after renaming`,
)
check(
  'client bundle registers a factory',
  /window\.__ModuleLoader__\.load\(/.test(clientBundle) && /factory:\s*\(require\)/.test(clientBundle),
  'ModuleLoader classic-script shape',
)
check(
  'client bundle exports apply/inject',
  /exports\.apply\s*=\s*apply/.test(clientBundle) && /exports\.inject\s*=\s*inject/.test(clientBundle),
  'exports.apply / exports.inject',
)

const hostBundle = readFileSync(join(root, 'lib', 'index.js'), 'utf8')
check(
  'host half registers its HTTP routes',
  /webServer\.register\(/.test(hostBundle) && /API_PREFIX/.test(hostBundle),
  'lib/index.js must register /api/task-spaces routes',
)
check(
  'host half guards loopback requests',
  /isLoopbackPeer/.test(hostBundle) && /isSameOrigin/.test(hostBundle),
  'loopback / same-origin fence',
)
check(
  'client bundle talks to the host API',
  /HOST_API_PREFIX = '\/api\/task-spaces'/.test(clientBundle) && /hostSaveState/.test(clientBundle),
  'client must call the host state route',
)

/* ------------------------------------------------------------- patch file */

let patch = ''
try {
  patch = readFileSync(join(root, 'cordis.patch.yml'), 'utf8')
} catch {
  /* reported by the file check above */
}
check('bundle patch inserts this package', patch.includes(`'${pkg.name}'`) || patch.includes(`"${pkg.name}"`) || patch.includes(pkg.name), 'cordis.patch.yml')

/* ------------------------------------------------------------ report pass */

const failed = checks.filter((entry) => !entry.ok)
for (const entry of checks) {
  console.log(`${entry.ok ? '  ✓' : '  ✗'} ${entry.name}${entry.ok ? '' : ` — ${entry.detail}`}`)
}
if (failed.length > 0) {
  console.error(`\n✗ ${failed.length} check(s) failed; not packing.`)
  process.exit(1)
}
console.log(`\n✓ ${checks.length} checks passed for ${pkg.name}@${pkg.version}`)

/* --------------------------------------------------------------- packing */

if (skipPack) {
  console.log('  (pack skipped)')
  process.exit(0)
}

console.log('\n▸ pack into dist/')
const packed = JSON.parse(
  execFileSync('npm', ['pack', '--json', '--pack-destination', 'dist'], { cwd: root, encoding: 'utf8' }),
)
const tarball = join(root, 'dist', packed[0].filename)
const listing = execFileSync('tar', ['-tzf', tarball], { encoding: 'utf8' })
const mustShip = ['package/lib/client.js', 'package/lib/index.js', 'package/cordis.patch.yml', 'package/package.json']
for (const entry of mustShip) {
  check(`tarball contains ${entry.replace('package/', '')}`, listing.split('\n').includes(entry), entry)
}
const leak = listing.split('\n').filter((line) => line.includes('node_modules/') || line.includes('package/dist/'))
check('tarball has no node_modules or dist/', leak.length === 0, leak.join(', '))
if (checks.some((entry) => !entry.ok)) {
  console.error('\n✗ packed tarball is incomplete; inspect dist/.')
  process.exit(1)
}

console.log(`\n✓ dist/${tarball.split('/').pop()}`)
console.log(`
next steps:
  1) 本机干净安装试用：
     dsh plugin --profile web add ${tarball}
  2) 推仓库（先在 GitHub 建空仓库 dsh-plugin-task-spaces）：
     git push -u origin main --tags
  3) 发布到 npm：
     npm login && npm publish
  4) 上架 DSH 插件列表：见 docs/marketplace-entry.md
`)
