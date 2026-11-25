#!/usr/bin/env node
/**
 * Minimal Chrome DevTools Protocol driver for verifying the Web GUI plugin.
 *
 * Headless Chrome's `--screenshot` mode never settles on the DSH page (the app
 * keeps a live event stream open), so this script drives a real headless
 * instance over CDP instead: navigate, run steps (click / fill / wait / eval),
 * capture screenshots, and surface page console output and exceptions.
 *
 * Usage:
 *   node scripts/ui-driver.mjs --url <url> --steps <steps.json> [--out-dir /tmp/x]
 *
 * Steps (JSON array):
 *   { "type": "wait", "ms": 2000 }
 *   { "type": "shot", "path": "/tmp/a.png" }
 *   { "type": "eval", "js": "document.title" }
 *   { "type": "click", "selector": "[data-x]" }
 *   { "type": "fill", "selector": "input[name=a]", "text": "hi" }
 *   { "type": "press", "key": "Escape" }
 */
import { spawn } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function parseArgs(argv) {
  const args = { port: 9333, steps: [], outDir: '/tmp/dsh-ui', profileDir: null }
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i]
    const value = argv[i + 1]
    if (key === '--url') (args.url = value), (i += 1)
    else if (key === '--steps') (args.steps = value), (i += 1)
    else if (key === '--out-dir') (args.outDir = value), (i += 1)
    else if (key === '--port') (args.port = Number(value)), (i += 1)
    else if (key === '--profile-dir') (args.profileDir = value), (i += 1)
  }
  return args
}

async function waitForDevtools(port, timeoutMs = 20000) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`)
      if (response.ok) return await response.json()
    } catch {
      /* not up yet */
    }
    await sleep(250)
  }
  throw new Error('devtools endpoint did not appear')
}

function connect(url) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url)
    const pending = new Map()
    const listeners = []
    let nextId = 1
    socket.addEventListener('open', () =>
      resolve({
        send(method, params = {}) {
          const id = nextId++
          socket.send(JSON.stringify({ id, method, params }))
          return new Promise((res, rej) => pending.set(id, { res, rej }))
        },
        on(listener) {
          listeners.push(listener)
        },
        close() {
          socket.close()
        },
      }),
    )
    socket.addEventListener('error', (event) => reject(new Error(`cdp socket error: ${event.message ?? ''}`)))
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data)
      if (message.id !== undefined) {
        const entry = pending.get(message.id)
        if (entry === undefined) return
        pending.delete(message.id)
        if (message.error) entry.rej(new Error(`${message.error.message} (${JSON.stringify(message.error.data ?? '')})`))
        else entry.res(message.result)
        return
      }
      for (const listener of listeners) listener(message)
    })
  })
}

const args = parseArgs(process.argv)
if (!args.url) throw new Error('--url is required')
const stepsFile = args.steps
const steps = stepsFile ? JSON.parse(await import('node:fs').then((fs) => fs.promises.readFile(stepsFile, 'utf8'))) : []

const profileDir = args.profileDir ?? mkdtempSync(join(tmpdir(), 'chrome-dsh-'))
const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-sync',
    '--hide-scrollbars',
    '--window-size=1440,900',
    `--user-data-dir=${profileDir}`,
    `--remote-debugging-port=${args.port}`,
    'about:blank',
  ],
  { stdio: ['ignore', 'ignore', 'pipe'] },
)
chrome.stderr.on('data', () => {})

let client
try {
  await waitForDevtools(args.port)
  const created = await fetch(`http://127.0.0.1:${args.port}/json/new?about:blank`, { method: 'PUT' })
  const target = await created.json()
  client = await connect(target.webSocketDebuggerUrl)

  client.on((message) => {
    if (message.method === 'Runtime.consoleAPICalled') {
      const text = message.params.args
        .map((arg) => (arg.value !== undefined ? String(arg.value) : arg.description ?? arg.type))
        .join(' ')
      if (message.params.type === 'error' || message.params.type === 'warning') {
        console.log(`[page:${message.params.type}] ${text}`)
      }
    }
    if (message.method === 'Runtime.exceptionThrown') {
      const details = message.params.exceptionDetails
      console.log(`[page:uncaught] ${details.exception?.description ?? details.text}`)
    }
    if (message.method === 'Log.entryAdded') {
      const entry = message.params.entry
      if (entry.level === 'error' || entry.level === 'warning') console.log(`[page:log:${entry.level}] ${entry.text}`)
    }
  })

  await client.send('Runtime.enable')
  await client.send('Log.enable')
  await client.send('Page.enable')

  const loaded = new Promise((resolve) => {
    client.on((message) => {
      if (message.method === 'Page.loadEventFired') resolve()
    })
  })
  await client.send('Page.navigate', { url: args.url })
  await Promise.race([loaded, sleep(15000)])
  await sleep(2500)

  const click = (selector) => `(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return 'missing';
    el.scrollIntoView({block:'center'});
    el.dispatchEvent(new PointerEvent('pointerdown', {bubbles:true, pointerType:'mouse', button:0}));
    el.dispatchEvent(new MouseEvent('mousedown', {bubbles:true, button:0}));
    el.dispatchEvent(new PointerEvent('pointerup', {bubbles:true, pointerType:'mouse', button:0}));
    el.dispatchEvent(new MouseEvent('mouseup', {bubbles:true, button:0}));
    el.click();
    return 'ok';
  })()`

  let shotIndex = 0
  for (const step of steps) {
    if (step.type === 'wait') {
      await sleep(step.ms ?? 1000)
    } else if (step.type === 'shot') {
      const path = step.path ?? join(args.outDir, `shot-${++shotIndex}.png`)
      const { data } = await client.send('Page.captureScreenshot', { format: 'png' })
      writeFileSync(path, Buffer.from(data, 'base64'))
      console.log(`[shot] ${path}`)
    } else if (step.type === 'eval') {
      const result = await client.send('Runtime.evaluate', {
        expression: step.js,
        awaitPromise: true,
        returnByValue: true,
      })
      console.log(`[eval] ${JSON.stringify(result.result?.value ?? result.result?.description ?? result)}`)
    } else if (step.type === 'click') {
      const result = await client.send('Runtime.evaluate', {
        expression: click(step.selector),
        awaitPromise: true,
        returnByValue: true,
      })
      console.log(`[click] ${step.selector} -> ${JSON.stringify(result.result?.value)}`)
      await sleep(step.ms ?? 350)
    } else if (step.type === 'fill') {
      const expression = `(() => {
        const el = document.querySelector(${JSON.stringify(step.selector)});
        if (!el) return 'missing';
        const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
        setter.call(el, ${JSON.stringify(step.text)});
        el.dispatchEvent(new Event('input', {bubbles:true}));
        el.dispatchEvent(new Event('change', {bubbles:true}));
        return 'ok';
      })()`
      const result = await client.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
      console.log(`[fill] ${step.selector} -> ${JSON.stringify(result.result?.value)}`)
      await sleep(step.ms ?? 350)
    } else if (step.type === 'cdp') {
      const result = await client.send(step.method, step.params ?? {})
      console.log(`[cdp] ${step.method} ${JSON.stringify(result).slice(0, 120)}`)
    } else if (step.type === 'press') {
      await client.send('Input.dispatchKeyEvent', {
        type: 'keyDown',
        key: step.key,
        code: step.key === 'Escape' ? 'Escape' : step.key,
        windowsVirtualKeyCode: step.key === 'Escape' ? 27 : 0,
      })
      await client.send('Input.dispatchKeyEvent', {
        type: 'keyUp',
        key: step.key,
        code: step.key === 'Escape' ? 'Escape' : step.key,
        windowsVirtualKeyCode: step.key === 'Escape' ? 27 : 0,
      })
      await sleep(step.ms ?? 350)
    }
  }
} finally {
  try {
    await client?.send('Browser.close')
  } catch {
    /* ignore */
  }
  // Give Chrome a moment to flush localStorage/LevelDB before the hard kill;
  // without it, a run's spaces do not survive into the next driver session.
  await sleep(900)
  chrome.kill('SIGKILL')
  process.exit(0)
}
