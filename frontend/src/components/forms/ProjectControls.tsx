// frontend/src/components/forms/ProjectControls.tsx
'use client'
import { useProjectStore } from '@/store/project.store'

const COST_M2 = { low: 2350, med: 3100, high: 4400 }

export function ProjectControls() {
  const { current, setConfig } = useProjectStore()
  if (!current) return null

  const cfg = current.config

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-bg1 border border-line rounded-xl mb-4">
      {/* Area */}
      <div>
        <label className="font-mono text-[9px] text-tx3 uppercase tracking-widest block mb-1">Área Construída</label>
        <div className="font-mono text-base font-bold mb-1">{cfg.area} m²</div>
        <input
          type="range" min="100" max="200" step="5" value={cfg.area}
          onChange={e => setConfig({ area: +e.target.value })}
          className="w-full"
        />
        <div className="flex justify-between font-mono text-[9px] text-tx3 mt-1"><span>100</span><span>200 m²</span></div>
      </div>

      {/* Standard */}
      <div>
        <label className="font-mono text-[9px] text-tx3 uppercase tracking-widest block mb-2">Padrão de Acabamento</label>
        <div className="flex gap-1.5">
          {(['low', 'med', 'high'] as const).map(s => (
            <button
              key={s}
              onClick={() => setConfig({ std: s })}
              className={`flex-1 py-1.5 rounded text-[10px] font-bold border transition-all ${
                cfg.std === s
                  ? 'bg-amber border-amber text-bg'
                  : 'bg-transparent border-line2 text-tx2 hover:border-amber hover:text-amber'
              }`}
            >
              {s === 'low' ? 'Simples' : s === 'med' ? 'Médio' : 'Alto'}
              <br />
              <span className="font-mono text-[8px] opacity-70">R${(COST_M2[s]/1000).toFixed(1)}k</span>
            </button>
          ))}
        </div>
      </div>

      {/* MO type */}
      <div>
        <label className="font-mono text-[9px] text-tx3 uppercase tracking-widest block mb-2">Mão de Obra</label>
        <div className="flex gap-1.5">
          {(['empreiteira', 'proprio'] as const).map(m => (
            <button
              key={m}
              onClick={() => setConfig({ mo: m })}
              className={`flex-1 py-1.5 rounded text-[10px] font-bold border transition-all ${
                cfg.mo === m
                  ? 'bg-amber border-amber text-bg'
                  : 'bg-transparent border-line2 text-tx2 hover:border-amber hover:text-amber'
              }`}
            >
              {m === 'empreiteira' ? 'Empreiteira' : 'Própria (–18%)'}
            </button>
          ))}
        </div>
      </div>

      {/* Contingency */}
      <div>
        <label className="font-mono text-[9px] text-tx3 uppercase tracking-widest block mb-1">Contingência</label>
        <div className="font-mono text-base font-bold mb-1">{cfg.cont}%</div>
        <input
          type="range" min="5" max="20" step="1" value={cfg.cont}
          onChange={e => setConfig({ cont: +e.target.value })}
          className="w-full"
        />
        <div className="flex justify-between font-mono text-[9px] text-tx3 mt-1"><span>5%</span><span>20%</span></div>
      </div>
    </div>
  )
}
