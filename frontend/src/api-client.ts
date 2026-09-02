export type ApiClientOptions = {
  primaryBaseUrl: string
  fallbackBaseUrl?: string
  fetchImpl?: typeof fetch
}

const availabilityStatusCodes = new Set([502, 503, 504])
const healthProbeTimeoutMs = 4_000
const requestTimeoutMs = 20_000
const analyzeRequestTimeoutMs = 120_000

export class ApiResponseError extends Error {
  constructor(
    message: string,
    public readonly response: Response,
  ) {
    super(message)
    this.name = 'ApiResponseError'
  }
}

function requestUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

function isAvailabilityFailure(error: unknown) {
  if (error instanceof ApiResponseError) {
    return availabilityStatusCodes.has(error.response.status)
  }

  // Browsers expose connectivity failures as TypeError and timed-out requests as AbortError.
  return error instanceof TypeError || (error instanceof DOMException && error.name === 'AbortError')
}

async function fetchFrom(
  fetchImpl: typeof fetch,
  baseUrl: string,
  path: string,
  init: RequestInit = {},
  timeoutMs = requestTimeoutMs,
) {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetchImpl(requestUrl(baseUrl, path), {
      ...init,
      signal: controller.signal,
    })

    if (!response.ok) {
      const data = await response.clone().json().catch(() => null)
      throw new ApiResponseError(data?.detail || `Request failed (${response.status})`, response)
    }

    return response
  } finally {
    window.clearTimeout(timeoutId)
  }
}

export function createApiClient({ primaryBaseUrl, fallbackBaseUrl = '', fetchImpl = fetch }: ApiClientOptions) {
  return async function apiFetch(path: string, init: RequestInit = {}, timeoutMs?: number) {
    const method = (init.method || 'GET').toUpperCase()
    const hasFallback =
      Boolean(fallbackBaseUrl) &&
      fallbackBaseUrl.replace(/\/$/, '') !== primaryBaseUrl.replace(/\/$/, '')

    if (method === 'POST' && path.replace(/\?.*$/, '') === '/api/analyze') {
      let selectedBaseUrl = primaryBaseUrl

      try {
        await fetchFrom(fetchImpl, primaryBaseUrl, '/api/health', { method: 'GET' }, healthProbeTimeoutMs)
      } catch (error) {
        if (!hasFallback || !isAvailabilityFailure(error)) throw error
        selectedBaseUrl = fallbackBaseUrl
      }

      return fetchFrom(fetchImpl, selectedBaseUrl, path, init, timeoutMs ?? analyzeRequestTimeoutMs)
    }

    const canRetrySafely = method === 'GET' || method === 'HEAD'

    try {
      return await fetchFrom(fetchImpl, primaryBaseUrl, path, init, timeoutMs)
    } catch (error) {
      const canUseFallback =
        canRetrySafely &&
        hasFallback &&
        isAvailabilityFailure(error)

      if (!canUseFallback) throw error

      return fetchFrom(fetchImpl, fallbackBaseUrl, path, init, timeoutMs)
    }
  }
}
