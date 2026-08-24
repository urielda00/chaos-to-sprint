import { ApiResponseError, createApiClient } from '../.tmp-api-check/api-client.js'

globalThis.window = {
  setTimeout: () => 0,
  clearTimeout: () => {},
}

const primary = 'https://primary.example'
const fallback = 'https://fallback.example'

let calls = []
const networkFallbackClient = createApiClient({
  primaryBaseUrl: primary,
  fallbackBaseUrl: fallback,
  fetchImpl: async (url, init) => {
    calls.push({ url, init })
    if (url.startsWith(primary)) throw new TypeError('network failure')
    return new Response('{"status":"ok"}', { status: 200 })
  },
})

const response = await networkFallbackClient('/api/analyze', {
  method: 'POST',
  body: '{"transcript":"test"}',
})
if ((await response.json()).status !== 'ok' || calls.length !== 2 || !calls[1].url.startsWith(fallback)) {
  throw new Error('Network failures must retry exactly once against the fallback API.')
}

calls = []
const primaryOnlyClient = createApiClient({
  primaryBaseUrl: primary,
  fetchImpl: async (url, init) => {
    calls.push({ url, init })
    throw new TypeError('network failure')
  },
})

try {
  await primaryOnlyClient('/api/health', { method: 'GET' })
  throw new Error('Expected the primary-only health request to reject.')
} catch (error) {
  if (!(error instanceof TypeError) || calls.length !== 1 || !calls[0].url.startsWith(primary)) {
    throw new Error('Health requests must only attempt the primary API once.')
  }
}

calls = []
const clientErrorClient = createApiClient({
  primaryBaseUrl: primary,
  fallbackBaseUrl: fallback,
  fetchImpl: async (url, init) => {
    calls.push({ url, init })
    return new Response('{"detail":"validation failed"}', { status: 422 })
  },
})

try {
  await clientErrorClient('/api/analyze', { method: 'POST', body: '{"transcript":"test"}' })
  throw new Error('Expected the 422 response to reject.')
} catch (error) {
  if (!(error instanceof ApiResponseError) || calls.length !== 1 || !calls[0].url.startsWith(primary)) {
    throw new Error('Client/application errors must not use the fallback API.')
  }
}

console.log('API fallback checks passed')
