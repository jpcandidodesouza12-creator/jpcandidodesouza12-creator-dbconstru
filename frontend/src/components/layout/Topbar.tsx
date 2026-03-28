// frontend/src/components/layout/Topbar.tsx
'use client'
import { useProjectStore } from '@/store/project.store'
import { Button } from '@/components/ui'
import { useAuthStore } from '@/store/auth.store'
import toast from 'react-hot-toast'

export function Topbar() {
  const { current, isSaving, lastSavedAt, autoSave } = useProjectStore()
  const user = useAuthStore(s => s.user)

  function handleExportJSON() {
    if (!current) return
    const blob = new Blob([JSON.stringify({ version: 4, exportedAt: new Date().toISOString(), project: current }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `dumb-construtor-${current.name.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
    toast.success('Projeto exportado!')
  }

  function handlePrint() { window.print() }

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 px-5 py-3 bg-bg1/90 backdrop-blur border-b border-line flex-wrap">
      {/* Left: project name + save status */}
      <div className="flex items-center gap-3 min-w-0">
        {current ? (
          <>
            <span className="font-condensed text-base font-bold uppercase truncate">{current.name}</span>
            <span className="font-mono text-[9px] text-tx3 whitespace-nowrap">
              {isSaving ? '⏳ Salvando...' : lastSavedAt ? `✓ Salvo ${lastSavedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : ''}
            </span>
          </>
        ) : (
          <span className="font-condensed text-sm text-tx3 uppercase">Nenhum projeto aberto</span>
        )}
      </div>

      {/* Right: actions + CUB badge */}
      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
        {current && (
          <>
            <Button variant="secondary" size="sm" onClick={handleExportJSON}>💾 Exportar JSON</Button>
            <Button variant="secondary" size="sm" onClick={handlePrint}>📄 Relatório PDF</Button>
          </>
        )}
        <div className="bg-bg2 border border-line2 rounded-lg px-3 py-2 text-right">
          <div className="font-mono text-[9px] text-tx3 uppercase tracking-wider">CUB-MS R8N</div>
          <div className="font-mono text-sm font-semibold text-mo">R$ 1.787/m²</div>
          <div className="font-mono text-[8px] text-tx3">Jun/2025 · Sinduscon-MS</div>
        </div>
      </div>
    </header>
  )
}
