import { create } from 'zustand'

const AUTH_STORAGE_KEY = 'digipay_auth'

const loadAuth = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) {
      return { isAuthenticated: false, user: null, token: null }
    }

    const parsed = JSON.parse(raw)
    return {
      isAuthenticated: Boolean(parsed?.user && parsed?.token),
      user: parsed?.user ?? null,
      token: parsed?.token ?? null,
    }
  } catch {
    return { isAuthenticated: false, user: null, token: null }
  }
}

const persistAuth = (user, token) => {
  try {
    if (!user || !token) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      return
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token }))
  } catch {
    // Ignore storage failures; in-memory state still works.
  }
}

const initialState = loadAuth()

export const useAuthStore = create((set) => ({
  ...initialState,
  login: ({ user, token }) => {
    persistAuth(user, token)
    set({ isAuthenticated: true, user, token })
  },
  logout: () => {
    persistAuth(null, null)
    set({ isAuthenticated: false, user: null, token: null })
  },
  setUser: (user) =>
    set((state) => {
      persistAuth(user, state.token)
      return { ...state, user }
    }),
}))
