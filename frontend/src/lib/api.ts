// frontend/src/lib/api.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

// ─── Main client ─────────────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
let isRefreshing = false
let queue: Array<{ resolve: (v: string) => void; reject: (e: any) => void }> = []

api.interceptors.response.use(
  r => r,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }
    original._retry = true

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (token) => {
            original.headers.Authorization = `Bearer ${token}`
            resolve(api(original))
          },
          reject,
        })
      })
    }

    isRefreshing = true
    try {
      const refreshToken = Cookies.get('refresh_token')
      if (!refreshToken) throw new Error('No refresh token')

      const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken })
      const { accessToken, refreshToken: newRefresh } = data.data

      Cookies.set('access_token',  accessToken,  { expires: 1/96, secure: true, sameSite: 'strict' }) // 15min
      Cookies.set('refresh_token', newRefresh,   { expires: 7,    secure: true, sameSite: 'strict' })

      queue.forEach(q => q.resolve(accessToken))
      queue = []

      original.headers.Authorization = `Bearer ${accessToken}`
      return api(original)
    } catch (err) {
      queue.forEach(q => q.reject(err))
      queue = []
      // Clear cookies and redirect to login
      Cookies.remove('access_token')
      Cookies.remove('refresh_token')
      if (typeof window !== 'undefined') window.location.href = '/auth/login'
      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  }
)

// ─── Auth endpoints ──────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/api/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),
  logout: (refreshToken: string) =>
    api.post('/api/auth/logout', { refreshToken }),
  me: () => api.get('/api/auth/me'),
}

// ─── Project endpoints ───────────────────────────────────────────────────────
export const projectApi = {
  list:       ()                    => api.get('/api/projects'),
  get:        (id: string)          => api.get(`/api/projects/${id}`),
  create:     (data: any)           => api.post('/api/projects', data),
  update:     (id: string, d: any)  => api.put(`/api/projects/${id}`, d),
  delete:     (id: string)          => api.delete(`/api/projects/${id}`),
}

// ─── Admin endpoints ─────────────────────────────────────────────────────────
export const adminApi = {
  stats:        ()                       => api.get('/api/admin/stats'),
  listUsers:    ()                       => api.get('/api/admin/users'),
  createUser:   (d: any)                => api.post('/api/admin/users', d),
  updateUser:   (id: string, d: any)    => api.put(`/api/admin/users/${id}`, d),
  deleteUser:   (id: string)            => api.delete(`/api/admin/users/${id}`),
  listProjects: ()                       => api.get('/api/admin/projects'),
}
