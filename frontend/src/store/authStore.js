import { create } from 'zustand'

const AUTH_STORAGE_KEY = 'digipay_auth'

const loadAuth = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) {
      return { isAuthenticated: false, user: null }
    }

    const parsed = JSON.parse(raw)
    return {
      isAuthenticated: Boolean(parsed?.user),
      user: parsed?.user ?? null,
    }
  } catch {
    return { isAuthenticated: false, user: null }
  }
}

const persistAuth = (user) => {
  try {
    if (!user) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      return
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user }))
  } catch {
    // Ignore storage failures; in-memory state still works.
  }
}

const initialState = loadAuth()

export const useAuthStore = create((set) => ({
  ...initialState,
  login: (user) => {
    persistAuth(user)
    set({ isAuthenticated: true, user })
  },
  logout: () => {
    persistAuth(null)
    set({ isAuthenticated: false, user: null })
  },
}))
