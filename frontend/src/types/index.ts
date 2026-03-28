// frontend/src/types/index.ts

export type Role = 'USER' | 'ADMIN'
export type Standard = 'LOW' | 'MED' | 'HIGH'
export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
export type MoType = 'empreiteira' | 'proprio'

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface User {
  id: string
  name: string
  email: string
  role: Role
  active: boolean
  createdAt: string
  lastLoginAt: string | null
  _count?: { projects: number }
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

// ─── Project ─────────────────────────────────────────────────────────────────
export interface Project {
  id: string
  userId: string
  name: string
  description?: string
  city: string
  state: string
  area: number
  standard: Standard
  status: ProjectStatus
  createdAt: string
  updatedAt: string
  config: ProjectConfig
  phases: PhaseOverride[]
  risks: Risk[]
  suppliers: Record<string, Supplier[]>
  diary: DiaryEntry[]
  payments: PaymentConfig
}

export interface ProjectConfig {
  area: number
  std: 'low' | 'med' | 'high'
  mo: MoType
  cont: number
  curMonth: number
  activeScenario: number | null
  bdi: BDIConfig
  scenarios: Scenario[]
}

export interface BDIConfig {
  ac: number; cf: number; s: number; mi: number
  l: number; iss: number; pis: number
}

export interface Scenario {
  name: string
  area: number
  std: 'low' | 'med' | 'high'
  mo: MoType
  cont: number
}

export interface PhaseOverride {
  total: number | null
  moPct: number | null
  exec: number
}

export interface Risk {
  name: string
  cat: string
  prob: number
  impact: number
  mit: string
}

export interface Supplier {
  name: string
  phone: string
  price: string
  link: string
}

export interface DiaryEntry {
  id: string
  date: string
  phaseIdx: number
  type: 'progresso' | 'problema' | 'mudanca' | 'pagamento' | 'vistoria'
  desc: string
}

export interface PaymentConfig {
  entrada: number
  parcelas: number
  startM: number
}

// ─── Admin ───────────────────────────────────────────────────────────────────
export interface AdminStats {
  users: { total: number; active: number; admin: number; recentLogins: number }
  projects: { total: number; byStatus: Record<string, number> }
}

// ─── API responses ───────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  ok: boolean
  data: T
  error?: { message: string; code?: string }
}
