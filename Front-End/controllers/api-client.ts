const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
const ACCESS_TOKEN_STORAGE_KEY = 'music_share_access_token'

const getStoredToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
}

const buildHeaders = (includeJson = false) => {
  const headers: HeadersInit = {}
  const token = getStoredToken()

  if (includeJson) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

const parseJson = async <T>(response: Response): Promise<T> => {
  const body = (await response.json()) as T
  return body
}

const buildUrl = (endpoint: string, params?: Record<string, string | number | boolean | undefined>) => {
  const url = new URL(`${API_BASE_URL}${endpoint}`)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    }
  }
  return url.toString()
}

const toApiError = async (response: Response) => {
  let detail = ''
  try {
    const data = await response.json()
    detail = typeof data?.message === 'string' ? data.message : JSON.stringify(data)
  } catch {
    try {
      detail = await response.text()
    } catch {
      detail = ''
    }
  }

  throw new Error(
    `API error: ${response.status} ${response.statusText}${detail ? ` - ${detail}` : ''}`,
  )
}

export const apiClient = {
  setAccessToken(token: string | null) {
    if (typeof window === 'undefined') return
    if (!token) {
      localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
      return
    }
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token)
  },

  getAccessToken() {
    return getStoredToken()
  },

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    const response = await fetch(buildUrl(endpoint, params), {
      headers: buildHeaders(false),
    })
    if (!response.ok) {
      await toApiError(response)
    }
    return parseJson<T>(response)
  },

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: buildHeaders(true),
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      await toApiError(response)
    }
    return parseJson<T>(response)
  },

  async put<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: buildHeaders(true),
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      await toApiError(response)
    }
    return parseJson<T>(response)
  },

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: buildHeaders(false),
    })
    if (!response.ok) {
      await toApiError(response)
    }
    return parseJson<T>(response)
  },
}

// Example usage:
// await apiClient.get('/music/search', { q: query, limit: 20 })
