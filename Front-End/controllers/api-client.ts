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

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: buildHeaders(false),
    })
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
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
      throw new Error(`API error: ${response.status} ${response.statusText}`)
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
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }
    return parseJson<T>(response)
  },

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: buildHeaders(false),
    })
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }
    return parseJson<T>(response)
  },
}
