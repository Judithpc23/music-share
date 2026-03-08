import { supabase } from "@/mvc/models/supabase-client"
import { apiClient } from "@/mvc/models/api-client"
import type { ProfilePrivacy } from "@/mvc/models/types"

type SignUpInput = {
  email: string
  password: string
  username: string
  firstName: string
  lastName: string
  bio: string
  privacity: ProfilePrivacy
  mood: string
  img?: string
  favoriteGenres: string[]
  favoriteSong?: string
}

type AuthCatalogs = {
  genres: Array<{ id: string; name: string }>
  songs: Array<{ id: string; title: string }>
}

export async function getCurrentSession() {
  return supabase.auth.getSession()
}

export async function getCurrentUser() {
  return supabase.auth.getUser()
}

export async function signOutUser() {
  return supabase.auth.signOut()
}

export async function signInWithEmailPassword(email: string, password: string) {
  return apiClient.post("/auth/sign-in", {
    email: email.trim().toLowerCase(),
    password,
  })
}

export async function loadAuthCatalogs(): Promise<{ data: AuthCatalogs; error: string | null }> {
  try {
    const data = await apiClient.get<AuthCatalogs>("/auth/catalogs")
    return { data, error: null }
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
