// frontend/src/app/(app)/dashboard/page.tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProjectStore } from '@/store/project.store'
import { useAuthStore } from '@/store/auth.store'
import { useCalc, fmtK, fmtBRL, PHASES_DEF, TOTAL_MONTHS } from '@/hooks/useCalc'
import { ProjectControls } from '@/components/forms/ProjectControls'
import { KpiCard, Card, CardHeader, CardTitle, CardBody, Button, EmptyState, Spinner } from '@/components/ui'
import { DoughnutChart, BarChart } from '@/components/charts'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const router              = useRouter()
  const user                = useAuthStore(s => s.user)
  const { current, isLoading, fetchProjects, createProject, projects } = useProjectStore()
  const calc                = useCalc()

  useEffect(() => { fetchProjects() }, [fetchProjects])

  async function handleCreate() {
    try {
      const p = await createProject('Nova Obra — Campo Grande MS')
      toast.success('Projeto criado!')
      router.push(`/dashboard`)
    } catch { toast.error('Erro ao criar projeto') }
  }

  if (isLoading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>

  if (!current) {
    return (
      <EmptyState
        icon="🏗️"
        title="Nenhum projeto aberto"
        desc="Crie um projeto para começar a planejar sua obra."
        action={<Button onClick={handleCreate}>+ Novo Projeto</Button>}
      />
    )
  }

  if (!calc) return null

  const { totalBase, totalMo, totalMat, cont, grand, bdiPct, grandBDI, totalExec, totalPlan, phaseData, critRisks, cfg, cumByMonth, moByMonth, matByMonth } = calc
  const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  const execPct = totalBase > 0 ? totalExec / totalBase * 100 : 0

  const sorted = [...phaseData].sort((a, b) => b.total - a.total)
  let acc = 0
  const abc = sorted.map(p => { const pp = p.total / totalBase * 100; acc += pp; return { ...p, pp, acc, cls: acc <= 50 ? 'A' : acc <= 80 ? 'B' : 'C' } })

  const activeNow = phaseData.filter(p => cfg.curMonth - 1 >= p.gs && cfg.curMonth - 1 < p.gs + p.dur)

  return (
    <div className="space-y-4">
      <ProjectControls />

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard label="Total Geral"   value={fmtK(grand)}         sub={`base + ${cfg.cont}% cont.`}       accent="#f0a500" progress={100} />
        <KpiCard label="Mão de Obra"   value={fmtK(totalMo)}       sub={`${(totalMo/totalBase*100).toFixed(0)}% do base`} accent="#3ecfb2" progress={totalMo/totalBase*100} />
        <KpiCard label="Material"      value={fmtK(totalMat)}      sub={`${(totalMat/totalBase*100).toFixed(0)}% do base`} accent="#6c8fff" progress={totalMat/totalBase*100} />
        <KpiCard label="Custo / m²"    value={fmtBRL(grand/cfg.area)+'/m²'} sub={`${cfg.area}m²`}          accent="#ffc84a" />
        <KpiCard label="Avanço Físico" value={execPct.toFixed(1)+'%'} sub={`M${cfg.curMonth} de ${TOTAL_MONTHS}`} accent="#4cde8a" progress={execPct} />
        <KpiCard label="BDI"           value={bdiPct.toFixed(1)+'%'} sub={`c/ BDI: ${fmtK(grandBDI)}`}    accent={critRisks > 0 ? '#ff6b6b' : '#94a3b8'} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Phases + cashflow */}
        <div className="xl:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Etapas — Custo &amp; Avanço</CardTitle>
              <span className="font-mono text-[9px] text-tx3">M{cfg.curMonth} · {activeNow.length} ativa{activeNow.length !== 1 ? 's' : ''}</span>
            </CardHeader>
            <CardBody className="py-2 px-3 space-y-0.5">
              {phaseData.map((p, i) => {
                const plan = calc.planPct(p)
                const isActive = cfg.curMonth - 1 >= p.gs && cfg.curMonth - 1 < p.gs + p.dur
                return (
                  <div key={i} className={`flex items-center gap-3 py-2 px-2 rounded-lg ${isActive ? 'bg-amber/5' : ''}`}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                    <div className="flex-1 min-w-0 truncate text-xs font-medium">{p.name}</div>
                    <div className="w-20 flex-shrink-0">
                      <div className="h-1.5 bg-line2 rounded-full overflow-hidden mb-0.5">
                        <div className="h-full bg-tx3 rounded-full" style={{ width: `${plan}%` }} />
                      </div>
                      <div className="h-1.5 bg-line2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${p.exec}%`, background: p.color }} />
                      </div>
                    </div>
                    <div className="font-mono text-[10px] text-tx3 w-16 text-right">{fmtK(p.total)}</div>
                  </div>
                )
              })}
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>Fluxo de Caixa Mensal</CardTitle><span className="font-mono text-[9px] text-tx3">MO + Material</span></CardHeader>
            <CardBody>
              <BarChart
                labels={Array.from({ length: TOTAL_MONTHS }, (_, i) => `M${i+1} ${MESES[i%12]}`)}
                datasets={[
                  { label: 'MO',       data: moByMonth,  backgroundColor: 'rgba(62,207,178,.7)',  stack: 's' },
                  { label: 'Material', data: matByMonth, backgroundColor: 'rgba(108,143,255,.7)', stack: 's' },
                  { label: 'Acum.',    data: cumByMonth, type: 'line', borderColor: '#f0a500', backgroundColor: 'rgba(240,165,0,.06)', yAxisID: 'y2', tension: 0.4, borderWidth: 2, pointRadius: 1, fill: true },
                ]}
                height={200}
                stacked
                y2
              />
            </CardBody>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Distribuição</CardTitle></CardHeader>
            <CardBody className="flex flex-col items-center gap-3">
              <DoughnutChart
                labels={PHASES_DEF.map(p => p.name)}
                data={phaseData.map(p => +(p.total / totalBase * 100).toFixed(2))}
                colors={PHASES_DEF.map(p => p.color)}
                centerLabel={fmtK(grand)}
                size={180}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>Top 5 — Curva ABC</CardTitle></CardHeader>
            <CardBody className="py-2 space-y-1">
              {abc.slice(0, 5).map((p, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5">
                  <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded ${p.cls === 'A' ? 'bg-amber/20 text-amber' : p.cls === 'B' ? 'bg-mo/20 text-mo' : 'bg-mat/20 text-mat'}`}>{p.cls}</span>
                  <span className="flex-1 text-xs truncate">{p.name}</span>
                  <div className="w-16 h-1.5 bg-line2 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${p.pp / abc[0].pp * 100}%`, background: p.color }} />
                  </div>
                  <span className="font-mono text-[10px] text-tx3 w-10 text-right">{p.pp.toFixed(1)}%</span>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>Alertas</CardTitle></CardHeader>
            <CardBody className="space-y-2">
              {critRisks > 0 && (
                <div className="flex items-center gap-2 bg-danger/8 border border-danger/20 rounded-lg px-3 py-2 text-xs">
                  <span>⚠️</span>
                  <span><strong className="text-danger">{critRisks} risco crítico</strong> — ver aba Riscos</span>
                </div>
              )}
              {activeNow.length > 0 && (
                <div className="flex items-center gap-2 bg-mo/8 border border-mo/20 rounded-lg px-3 py-2 text-xs">
                  <span>🔵</span>
                  <span><strong className="text-mo">{activeNow.length} etapa{activeNow.length > 1 ? 's' : ''} ativa{activeNow.length > 1 ? 's' : ''}</strong> (M{cfg.curMonth})</span>
                </div>
              )}
              <div className="flex items-center gap-2 bg-amber/6 border border-amber/15 rounded-lg px-3 py-2 text-xs">
                <span>💡</span>
                <span>BDI <strong className="text-amber">{bdiPct.toFixed(1)}%</strong> · com BDI: <strong className="text-amber">{fmtK(grandBDI)}</strong></span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
