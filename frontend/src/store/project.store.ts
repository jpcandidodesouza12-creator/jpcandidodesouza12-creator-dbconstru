// frontend/src/store/project.store.ts
import { create } from 'zustand'
import { Project, ProjectConfig, PhaseOverride, Risk, Supplier, DiaryEntry, PaymentConfig } from '@/types'
import { projectApi } from '@/lib/api'
import toast from 'react-hot-toast'

// Default config
export const DEFAULT_CONFIG: ProjectConfig = {
  area: 150, std: 'med', mo: 'empreiteira', cont: 10,
  curMonth: 1, activeScenario: null,
  bdi: { ac: 4, cf: 1.5, s: 0.8, mi: 1, l: 7.2, iss: 3, pis: 3.65 },
  scenarios: [
    { name: 'Pessimista', area: 200, std: 'high', mo: 'empreiteira', cont: 20 },
    { name: 'Base',       area: 150, std: 'med',  mo: 'empreiteira', cont: 10 },
    { name: 'Otimista',   area: 120, std: 'low',  mo: 'proprio',     cont: 5  },
  ],
}

interface ProjectState {
  projects:       Project[]
  current:        Project | null
  isLoading:      boolean
  isSaving:       boolean
  lastSavedAt:    Date | null
  expandedRow:    number | null
}

interface ProjectActions {
  fetchProjects:   () => Promise<void>
  fetchProject:    (id: string) => Promise<void>
  createProject:   (name: string) => Promise<Project>
  updateProject:   (id: string, data: Partial<Project>) => Promise<void>
  deleteProject:   (id: string) => Promise<void>
  autoSave:        () => Promise<void>
  // Local state mutations (auto-save after each)
  setConfig:       (config: Partial<ProjectConfig>) => void
  setPhaseOverride:(idx: number, override: Partial<PhaseOverride>) => void
  resetPhase:      (idx: number) => void
  setProgress:     (idx: number, exec: number) => void
  updateRisk:      (idx: number, risk: Partial<Risk>) => void
  setSupplier:     (insumoId: string, rowIdx: number, data: Partial<Supplier>) => void
  addSupplierRow:  (insumoId: string) => void
  removeSupplierRow:(insumoId: string, rowIdx: number) => void
  addDiaryEntry:   (entry: Omit<DiaryEntry, 'id'>) => void
  deleteDiaryEntry:(id: string) => void
  setPayments:     (payments: Partial<PaymentConfig>) => void
  setExpandedRow:  (idx: number | null) => void
}

let saveTimer: ReturnType<typeof setTimeout>

export const useProjectStore = create<ProjectState & ProjectActions>((set, get) => ({
  projects: [], current: null, isLoading: false, isSaving: false,
  lastSavedAt: null, expandedRow: null,

  fetchProjects: async () => {
    set({ isLoading: true })
    try {
      const { data } = await projectApi.list()
      set({ projects: data.data.projects })
    } finally { set({ isLoading: false }) }
  },

  fetchProject: async (id) => {
    set({ isLoading: true })
    try {
      const { data } = await projectApi.get(id)
      set({ current: data.data.project })
    } finally { set({ isLoading: false }) }
  },

  createProject: async (name) => {
    const { data } = await projectApi.create({
      name, config: DEFAULT_CONFIG,
      phases: [], risks: [], suppliers: {}, diary: [], payments: { entrada: 20, parcelas: 12, startM: 0 },
    })
    const project = data.data.project
    set(s => ({ projects: [project, ...s.projects], current: project }))
    return project
  },

  updateProject: async (id, payload) => {
    const { data } = await projectApi.update(id, payload)
    set(s => ({
      current: s.current?.id === id ? data.data.project : s.current,
      projects: s.projects.map(p => p.id === id ? data.data.project : p),
      lastSavedAt: new Date(),
    }))
  },

  deleteProject: async (id) => {
    await projectApi.delete(id)
    set(s => ({
      projects: s.projects.filter(p => p.id !== id),
      current: s.current?.id === id ? null : s.current,
    }))
    toast.success('Projeto excluído')
  },

  autoSave: async () => {
    const { current } = get()
    if (!current) return
    set({ isSaving: true })
    try {
      await projectApi.update(current.id, {
        config: current.config, phases: current.phases,
        risks: current.risks, suppliers: current.suppliers,
        diary: current.diary, payments: current.payments,
      })
      set({ lastSavedAt: new Date() })
    } catch { toast.error('Erro ao salvar automaticamente') }
    finally { set({ isSaving: false }) }
  },

  // Debounced auto-save after any mutation
  _scheduleSave() {
    clearTimeout(saveTimer)
    saveTimer = setTimeout(() => get().autoSave(), 1500)
  },

  setConfig: (config) => {
    set(s => ({
      current: s.current ? {
        ...s.current,
        config: { ...s.current.config, ...config },
      } : null
    }))
    ;(get() as any)._scheduleSave()
  },

  setPhaseOverride: (idx, override) => {
    set(s => {
      if (!s.current) return s
      const phases = [...(s.current.phases || [])]
      while (phases.length <= idx) phases.push({ total: null, moPct: null, exec: 0 })
      phases[idx] = { ...phases[idx], ...override }
      return { current: { ...s.current, phases } }
    })
    ;(get() as any)._scheduleSave()
  },

  resetPhase: (idx) => {
    set(s => {
      if (!s.current) return s
      const phases = [...(s.current.phases || [])]
      if (phases[idx]) phases[idx] = { ...phases[idx], total: null, moPct: null }
      return { current: { ...s.current, phases } }
    })
    ;(get() as any)._scheduleSave()
  },

  setProgress: (idx, exec) => {
    set(s => {
      if (!s.current) return s
      const phases = [...(s.current.phases || [])]
      while (phases.length <= idx) phases.push({ total: null, moPct: null, exec: 0 })
      phases[idx] = { ...phases[idx], exec }
      return { current: { ...s.current, phases } }
    })
    ;(get() as any)._scheduleSave()
  },

  updateRisk: (idx, risk) => {
    set(s => {
      if (!s.current) return s
      const risks = [...s.current.risks]
      risks[idx] = { ...risks[idx], ...risk }
      return { current: { ...s.current, risks } }
    })
    ;(get() as any)._scheduleSave()
  },

  setSupplier: (insumoId, rowIdx, data) => {
    set(s => {
      if (!s.current) return s
      const suppliers = { ...s.current.suppliers }
      const rows = [...(suppliers[insumoId] || [])]
      rows[rowIdx] = { ...rows[rowIdx], ...data }
      suppliers[insumoId] = rows
      return { current: { ...s.current, suppliers } }
    })
    ;(get() as any)._scheduleSave()
  },

  addSupplierRow: (insumoId) => {
    set(s => {
      if (!s.current) return s
      const suppliers = { ...s.current.suppliers }
      suppliers[insumoId] = [...(suppliers[insumoId] || []), { name: '', phone: '', price: '', link: '' }]
      return { current: { ...s.current, suppliers } }
    })
  },

  removeSupplierRow: (insumoId, rowIdx) => {
    set(s => {
      if (!s.current) return s
      const suppliers = { ...s.current.suppliers }
      suppliers[insumoId] = suppliers[insumoId].filter((_, i) => i !== rowIdx)
      return { current: { ...s.current, suppliers } }
    })
    ;(get() as any)._scheduleSave()
  },

  addDiaryEntry: (entry) => {
    set(s => {
      if (!s.current) return s
      const newEntry = { ...entry, id: Date.now().toString(36) }
      return { current: { ...s.current, diary: [newEntry, ...s.current.diary] } }
    })
    ;(get() as any)._scheduleSave()
  },

  deleteDiaryEntry: (id) => {
    set(s => {
      if (!s.current) return s
      return { current: { ...s.current, diary: s.current.diary.filter(e => e.id !== id) } }
    })
    ;(get() as any)._scheduleSave()
  },

  setPayments: (payments) => {
    set(s => ({
      current: s.current ? { ...s.current, payments: { ...s.current.payments, ...payments } } : null
    }))
    ;(get() as any)._scheduleSave()
  },

  setExpandedRow: (idx) => set({ expandedRow: idx }),
}))
