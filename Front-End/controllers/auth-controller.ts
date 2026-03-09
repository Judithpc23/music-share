import { apiClient } from "@/controllers/api-client"
import type { ProfilePrivacity } from "@/utils/types"

type SignUpInput = {
  email: string
  password: string
  username: string
  firstName: string
  lastName: string
  bio: string
  privacity: ProfilePrivacity
  mood: string
  img?: string
  favoriteGenres: string[]
  favoriteSong?: string
}

type AuthCatalogs = {
  genres: Array<{ id: string; name: string }>
  songs: Array<{ id: string; title: string }>
}

type AuthSessionResponse = {
  data: {
    session: {
      access_token: string
      user: { id: string; email?: string | null }
    } | null
  }
  error: string | null
}

type AuthUserResponse = {
  data: {
    user: { id: string; email?: string | null } | null
  }
  error: string | null
}

const isExpectedSessionTokenError = (error: string | null) => {
  if (!error) return false
  const normalizedError = error.toLowerCase()
  return (
    normalizedError.includes("invalid jwt") ||
    normalizedError.includes("token is expired") ||
    normalizedError.includes("invalid claims")
  )
}

export async function getCurrentSession(): Promise<{
  data: AuthSessionResponse["data"]
  error: string | null
}> {
  try {
    const response = await apiClient.get<AuthSessionResponse>("/auth/session")
    if (!response.data?.session && isExpectedSessionTokenError(response.error)) {
      apiClient.setAccessToken(null)
      return { data: { session: null }, error: null }
    }
    return response
  } catch (error) {
    return { data: { session: null }, error: String(error) }
  }
}

export async function getCurrentUser(): Promise<{
  data: AuthUserResponse["data"]
  error: string | null
}> {
  try {
    const response = await apiClient.get<AuthUserResponse>("/auth/user")
    return response
  } catch (error) {
    return { data: { user: null }, error: String(error) }
  }
}

export async function signOutUser() {
  try {
    await apiClient.post<{ error: string | null }>("/auth/sign-out", {})
  } catch {
    // Clearing local token is enough for client-side sign-out flow.
  }
  apiClient.setAccessToken(null)
  return { error: null }
}

export async function signInWithEmailPassword(email: string, password: string) {
  try {
    const response = await apiClient.post<{
      data: {
        session: { access_token: string } | null
      } | null
      error: string | null
    }>("/auth/sign-in", {
      email: email.trim().toLowerCase(),
      password,
    })

    const accessToken = response.data?.session?.access_token ?? null
    apiClient.setAccessToken(accessToken)

    return {
      data: response.data,
      error: response.error ? { message: response.error } : null,
    }
  } catch (error) {
    return { data: null, error: { message: String(error) } }
  }
}

export async function loadAuthCatalogs(): Promise<{ data: AuthCatalogs; error: string | null }> {
  try {
    const response = await apiClient.get<
      AuthCatalogs | { data: AuthCatalogs; error: string | null }
    >("/auth/catalogs?ts=" + Date.now())

    const wrapped = response as { data?: AuthCatalogs; error?: string | null }
    const payload = wrapped?.data ?? (response as AuthCatalogs)

    return {
      data: {
        genres: Array.isArray(payload?.genres) ? payload.genres : [],
        songs: Array.isArray(payload?.songs) ? payload.songs : [],
      },
      error: wrapped?.error ?? null,
    }
  } catch (error) {
    return { data: { genres: [], songs: [] }, error: String(error) }
  }
}

export async function registerWithEmailPassword(input: SignUpInput): Promise<{
  error: string | null
  requiresEmailVerification: boolean
}> {
  try {
    const response = await apiClient.post<{
      error: string | null
      requiresEmailVerification: boolean
    }>("/auth/sign-up", input)
    return response
  } catch (error) {
    return { error: String(error), requiresEmailVerification: false }
  }
}
