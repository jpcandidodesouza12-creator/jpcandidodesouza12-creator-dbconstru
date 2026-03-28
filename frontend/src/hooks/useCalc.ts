// frontend/src/hooks/useCalc.ts
import { useMemo } from 'react'
import { useProjectStore } from '@/store/project.store'

export const PHASES_DEF = [
  { name: 'Projetos e Licenças',      sub: 'Arq., estrutural, hidro, elétrico, ART/RRT', pct: 3.5,  moPct: 85, dur: 2, gs: 0,  color: '#f0a500' },
  { name: 'Terraplanagem/Infra',      sub: 'Limpeza, nivelamento, locação e marcação',    pct: 2.0,  moPct: 60, dur: 1, gs: 0,  color: '#f5c842' },
  { name: 'Fundações',                sub: 'Radier, sapatas ou estacas conforme SPT',     pct: 9.0,  moPct: 38, dur: 2, gs: 2,  color: '#e8890a' },
  { name: 'Estrutura',                sub: 'Pilares, vigas, lajes — concreto armado',     pct: 12.0, moPct: 35, dur: 3, gs: 4,  color: '#fb923c' },
  { name: 'Alvenaria',                sub: 'Paredes ext/int, vergas e contravergas',       pct: 7.5,  moPct: 45, dur: 2, gs: 6,  color: '#a78bfa' },
  { name: 'Cobertura',                sub: 'Madeiramento, telhas, calhas, rufos',          pct: 7.0,  moPct: 38, dur: 2, gs: 6,  color: '#60a5fa' },
  { name: 'Inst. Elétricas',          sub: 'Eletrodutos, fiação, quadro, tomadas',         pct: 7.5,  moPct: 42, dur: 2, gs: 8,  color: '#34d399' },
  { name: 'Inst. Hidrossanitárias',   sub: 'Água fria/quente, esgoto, caixa, fossa',      pct: 6.5,  moPct: 40, dur: 2, gs: 8,  color: '#2dd4bf' },
  { name: 'Revestimentos Internos',   sub: 'Chapisco, reboco, massa, gesso, azulejo',      pct: 9.0,  moPct: 52, dur: 3, gs: 10, color: '#f472b6' },
  { name: 'Esquadrias e Vidros',      sub: 'Portas, janelas alumínio/ferro, vidros',       pct: 5.5,  moPct: 15, dur: 1, gs: 12, color: '#c084fc' },
  { name: 'Pintura',                  sub: 'Interna (látex PVA) e externa (acrílica)',     pct: 4.5,  moPct: 50, dur: 2, gs: 13, color: '#fbbf24' },
  { name: 'Pisos',                    sub: 'Cerâmica, porcelanato, vinílico, contrapiso',  pct: 6.5,  moPct: 42, dur: 2, gs: 14, color: '#fb7185' },
  { name: 'Louças e Metais',          sub: 'Bacias, lavatórios, torneiras, chuveiros',     pct: 4.0,  moPct: 18, dur: 1, gs: 14, color: '#38bdf8' },
  { name: 'Fachada e Área Externa',   sub: 'Revestimento, calçada, garagem, muro',         pct: 4.0,  moPct: 48, dur: 1, gs: 15, color: '#a3e635' },
  { name: 'Limpeza e Entrega',        sub: 'Limpeza final, ajustes, vistoria',             pct: 2.0,  moPct: 80, dur: 1, gs: 16, color: '#94a3b8' },
]

export const COST_M2  = { low: 2350, med: 3100, high: 4400 }
export const MO_FACTOR = { empreiteira: 1.0, proprio: 0.82 }
export const TOTAL_MONTHS = Math.max(...PHASES_DEF.map(p => p.gs + p.dur))

export function fmtBRL(n: number) { return 'R$ ' + Math.round(n).toLocaleString('pt-BR') }
export function fmtK(n: number) {
  if (n >= 1e6) return 'R$ ' + (n / 1e6).toFixed(2).replace('.', ',') + 'M'
  if (n >= 1e3) return 'R$ ' + (n / 1e3).toFixed(1).replace('.', ',') + 'K'
  return fmtBRL(n)
}

export function useCalc() {
  const current = useProjectStore(s => s.current)

  return useMemo(() => {
    if (!current) return null

    const cfg     = current.config
    const area    = cfg.area
    const base    = area * COST_M2[cfg.std] * MO_FACTOR[cfg.mo]
    const phases  = current.phases || []
    const bdi     = cfg.bdi

    // Phase data resolved (overrides + defaults)
    const phaseData = PHASES_DEF.map((p, i) => {
      const ov      = phases[i] || { total: null, moPct: null, exec: 0 }
      const total   = ov.total  !== null ? ov.total  : base * (p.pct / 100)
      const moPct   = ov.moPct !== null ? ov.moPct : p.moPct
      const moVal   = total * moPct / 100
      const matVal  = total * (1 - moPct / 100)
      const exec    = ov.exec || 0
      return { ...p, total, moPct, moVal, matVal, exec, modified: ov.total !== null || ov.moPct !== null }
    })

    const totalBase = phaseData.reduce((a, p) => a + p.total, 0)
    const totalMo   = phaseData.reduce((a, p) => a + p.moVal, 0)
    const totalMat  = phaseData.reduce((a, p) => a + p.matVal, 0)
    const cont      = totalBase * (cfg.cont / 100)
    const grand     = totalBase + cont

    // BDI
    const T   = (bdi.iss + bdi.pis) / 100
    const L   = bdi.l / 100
    const num = 1 + (bdi.ac + bdi.cf + bdi.s + bdi.mi) / 100
    const den = 1 - T - L
    const bdiPct = den > 0 ? ((num / den) - 1) * 100 : 0
    const grandBDI = totalBase * (1 + bdiPct / 100)

    // Cashflow per month
    const moByMonth  = Array(TOTAL_MONTHS).fill(0)
    const matByMonth = Array(TOTAL_MONTHS).fill(0)
    phaseData.forEach(p => {
      for (let m = p.gs; m < p.gs + p.dur; m++) {
        moByMonth[m]  += p.moVal / p.dur
        matByMonth[m] += p.matVal / p.dur
      }
    })
    const totalByMonth = moByMonth.map((v, i) => v + matByMonth[i])
    const cumByMonth   = totalByMonth.reduce((acc: number[], v, i) => [...acc, (acc[i - 1] || 0) + v], [])

    // Progress
    const totalExec = phaseData.reduce((a, p) => a + p.total * (p.exec / 100), 0)
    const curM      = (cfg.curMonth || 1) - 1
    const planPct   = (p: typeof phaseData[0]) =>
      curM <= p.gs ? 0 : curM >= p.gs + p.dur ? 100 : Math.round((curM - p.gs) / p.dur * 100)
    const totalPlan = phaseData.reduce((a, p) => a + p.total * (planPct(p) / 100), 0)

    // Risks
    const risks = current.risks || []
    const critRisks = risks.filter(r => r.prob * r.impact >= 17).length
    const highRisks = risks.filter(r => r.prob * r.impact >= 10 && r.prob * r.impact < 17).length

    return {
      cfg, area, base, phaseData,
      totalBase, totalMo, totalMat, cont, grand,
      bdiPct, grandBDI,
      moByMonth, matByMonth, totalByMonth, cumByMonth,
      totalExec, totalPlan, curM,
      critRisks, highRisks,
      planPct,
    }
  }, [current])
}
