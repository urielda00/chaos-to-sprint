import { createApiClient } from './api-client'

export { ApiResponseError } from './api-client'

export const apiFetch = createApiClient({
  primaryBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  fallbackBaseUrl: import.meta.env.VITE_FALLBACK_API_BASE_URL || '',
})

export const primaryApiFetch = createApiClient({
  primaryBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
})
