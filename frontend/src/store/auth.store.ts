// frontend/src/store/auth.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'
import { User, AuthState } from '@/types'
import { authApi } from '@/lib/api'

interface AuthActions {
  login:    (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout:   () => Promise<void>
  fetchMe:  () => Promise<void>
  setUser:  (user: User) => void
}

const COOKIE_OPTS = { secure: true, sameSite: 'strict' as const }

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: true }),

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await authApi.login({ email, password })
          const { user, accessToken, refreshToken } = data.data

          Cookies.set('access_token',  accessToken,  { ...COOKIE_OPTS, expires: 1/96 }) // 15min
          Cookies.set('refresh_token', refreshToken, { ...COOKIE_OPTS, expires: 7 })

          set({ user, accessToken, isAuthenticated: true })
        } finally {
          set({ isLoading: false })
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await authApi.register({ name, email, password })
          const { user, accessToken, refreshToken } = data.data

          Cookies.set('access_token',  accessToken,  { ...COOKIE_OPTS, expires: 1/96 })
          Cookies.set('refresh_token', refreshToken, { ...COOKIE_OPTS, expires: 7 })

          set({ user, accessToken, isAuthenticated: true })
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        const refreshToken = Cookies.get('refresh_token')
        if (refreshToken) await authApi.logout(refreshToken).catch(() => {})
        Cookies.remove('access_token')
        Cookies.remove('refresh_token')
        set({ user: null, accessToken: null, isAuthenticated: false })
      },

      fetchMe: async () => {
        const token = Cookies.get('access_token')
        if (!token) return
        try {
          const { data } = await authApi.me()
          set({ user: data.data.user, isAuthenticated: true })
        } catch {
          get().logout()
        }
      },
    }),
    {
      name: 'dc-auth',
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
)
