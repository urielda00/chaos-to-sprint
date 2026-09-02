import assert from 'node:assert/strict'
import { ApiResponseError, createApiClient } from '../.tmp-api-check/api-client.js'

const primary = 'https://primary.example'
const fallback = 'https://fallback.example'
let abortTimeoutMs = null
let timeoutDelays = []

globalThis.window = {
  setTimeout: (callback, delay) => {
    timeoutDelays.push(delay)
    if (delay === abortTimeoutMs) callback()
    return 0
  },
  clearTimeout: () => {},
}

function okResponse() {
  return new Response('{"status":"ok"}', { status: 200 })
}

function errorResponse(status) {
  return new Response(`{"detail":"status ${status}"}`, { status })
}

function makeClient(fetchImpl) {
  return createApiClient({ primaryBaseUrl: primary, fallbackBaseUrl: fallback, fetchImpl })
}

async function expectGetFallback(name, primaryFailure) {
  const calls = []
  const client = makeClient(async (url, init) => {
    calls.push({ url, init })
    if (url.startsWith(primary)) return primaryFailure(init)
    return okResponse()
  })

  const response = await client('/api/items')
  assert.equal((await response.json()).status, 'ok', name)
  assert.equal(calls.length, 2, name)
  assert.ok(calls[0].url.startsWith(primary), name)
  assert.ok(calls[1].url.startsWith(fallback), name)
}

await expectGetFallback('GET falls back on network failure', async () => {
  throw new TypeError('network failure')
})

abortTimeoutMs = 20_000
await expectGetFallback('GET falls back on timeout', async (init) => {
  if (init.signal.aborted) throw new DOMException('timed out', 'AbortError')
  return okResponse()
})
abortTimeoutMs = null

for (const status of [502, 503, 504]) {
  await expectGetFallback(`GET falls back on ${status}`, async () => errorResponse(status))
}

for (const status of [400, 401, 403, 404, 422, 500]) {
  const calls = []
  const client = makeClient(async (url, init) => {
    calls.push({ url, init })
    return errorResponse(status)
  })

  await assert.rejects(
    client('/api/items'),
    (error) => error instanceof ApiResponseError && error.response.status === status,
    `GET ${status} should reject without fallback`,
  )
  assert.equal(calls.length, 1, `GET must not fall back on ${status}`)
  assert.ok(calls[0].url.startsWith(primary), `GET ${status} must only call primary`)
}

{
  const calls = []
  const client = makeClient(async (url, init) => {
    calls.push({ url, init })
    if (url === `${primary}/api/health`) return errorResponse(503)
    return okResponse()
  })

  await client('/api/analyze', { method: 'POST', body: '{"transcript":"test"}' })
  const posts = calls.filter(({ init }) => init.method === 'POST')
  assert.equal(posts.length, 1, 'Failed health probe must produce exactly one analyze POST')
  assert.ok(posts[0].url.startsWith(fallback), 'Failed health probe must select fallback')
  assert.equal(calls.filter(({ url }) => url.includes('/api/analyze')).length, 1, 'Analyze must not reach both backends')
}

{
  const calls = []
  const client = makeClient(async (url, init) => {
    calls.push({ url, init })
    return okResponse()
  })

  await client('/api/analyze', { method: 'POST', body: '{"transcript":"test"}' })
  const posts = calls.filter(({ init }) => init.method === 'POST')
  assert.equal(posts.length, 1, 'Successful health probe must produce exactly one analyze POST')
  assert.ok(posts[0].url.startsWith(primary), 'Successful health probe must select primary')
  assert.equal(calls.filter(({ url }) => url.includes('/api/analyze')).length, 1, 'Analyze must not reach both backends')
  assert.deepEqual(timeoutDelays.slice(-2), [4_000, 120_000], 'Analyze must use short probe and long POST timeouts')
}

{
  const calls = []
  const client = makeClient(async (url, init) => {
    calls.push({ url, init })
    if (url.includes('/api/analyze')) throw new TypeError('connection dropped after POST started')
    return okResponse()
  })

  await assert.rejects(
    client('/api/analyze', { method: 'POST', body: '{"transcript":"test"}' }),
    TypeError,
    'Analyze network failure should be returned to the caller',
  )
  assert.equal(calls.filter(({ url }) => url.includes('/api/analyze')).length, 1, 'Analyze network failure must not resend')
  assert.equal(calls.filter(({ url }) => url.startsWith(fallback)).length, 0, 'Primary POST failure must not use fallback')
}

{
  const calls = []
  abortTimeoutMs = 120_000
  const client = makeClient(async (url, init) => {
    calls.push({ url, init })
    if (url.includes('/api/analyze') && init.signal.aborted) {
      throw new DOMException('timed out', 'AbortError')
    }
    return okResponse()
  })

  await assert.rejects(
    client('/api/analyze', { method: 'POST', body: '{"transcript":"test"}' }),
    (error) => error instanceof DOMException && error.name === 'AbortError',
    'Analyze timeout should be returned to the caller',
  )
  abortTimeoutMs = null
  assert.equal(calls.filter(({ url }) => url.includes('/api/analyze')).length, 1, 'Analyze timeout must not resend')
  assert.equal(calls.filter(({ url }) => url.startsWith(fallback)).length, 0, 'Timed-out primary POST must not use fallback')
}

{
  const calls = []
  const client = makeClient(async (url, init) => {
    calls.push({ url, init })
    throw new TypeError('network failure')
  })

  await assert.rejects(
    client('/api/items', { method: 'DELETE' }),
    TypeError,
    'Write failure should be returned to the caller',
  )
  assert.equal(calls.length, 1, 'Write requests must never be retried automatically')
}

console.log('API fallback checks passed')
