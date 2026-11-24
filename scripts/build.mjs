#!/usr/bin/env node
/**
 * Build `lib/client.js` — the browser half of the plugin.
 *
 * DSH serves each plugin's client half as a classic script whose only content
 * is a `window.__ModuleLoader__.load({ id, factory })` call. The factory is a
 * lazy CJS module body: nothing runs until the plugin is materialized, and the
 * `require` it receives resolves the platform module table (React, primitives,
 * cordis, ...).
 *
 * There is no bundler on this machine, so the "bundle" is produced by
 * concatenating the plain-script sources in `src/` (sorted by filename) inside
 * one shared closure. That keeps the sources small and reviewable while still
 * shipping one classic script per the loader contract.
 *
 * Usage: node scripts/build.mjs [--watch]
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, watch } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const srcDir = join(root, 'src')
const outFile = join(root, 'lib', 'client.js')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

/** Concatenate the sources into one ModuleLoader factory body. */
function build() {
  const files = readdirSync(srcDir)
    .filter((name) => name.endsWith('.js'))
    .sort()
  if (files.length === 0) throw new Error('build: no sources in src/')

  const body = files
    .map((name) => `\t\t// ---- src/${name} ----\n${readFileSync(join(srcDir, name), 'utf8').trimEnd()}\n`)
    .join('\n')

  const banner = `/* Built by scripts/build.mjs — edit src/*.js instead. */
window.__ModuleLoader__.load({
\tid: ${JSON.stringify(pkg.name)},
\tfactory: (require) => {
\t\tvar module = { exports: {} };
\t\tvar exports = module.exports;
\t\tObject.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
\t\tconst React = require("react");
\t\tconst primitives = require("@deepseek-ai/dsh-client-ui-primitives");
\t\tconst { createPortal } = require("react-dom");

${body}
\t\texports.apply = apply;
\t\texports.inject = inject;
\t\treturn module.exports;
\t}
});
`

  mkdirSync(join(root, 'lib'), { recursive: true })
  writeFileSync(outFile, banner)
  const kb = (Buffer.byteLength(banner) / 1024).toFixed(1)
  console.log(`build: ${files.length} sources -> lib/client.js (${kb} KB)`)
}

build()

if (process.argv.includes('--watch')) {
  let timer
  watch(srcDir, { persistent: true }, () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      try {
        build()
      } catch (error) {
        console.error('build failed:', error)
      }
    }, 120)
  })
  console.log('build: watching src/ (re-run the host to pick up client changes)')
}
