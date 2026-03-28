// frontend/src/components/charts/index.tsx
'use client'
import { useEffect, useRef } from 'react'
import {
  Chart, ChartData, ChartOptions,
  ArcElement, DoughnutController,
  BarElement, BarController,
  LineElement, LineController, PointElement,
  CategoryScale, LinearScale,
  Tooltip, Legend, Filler,
} from 'chart.js'

Chart.register(
  ArcElement, DoughnutController,
  BarElement, BarController,
  LineElement, LineController, PointElement,
  CategoryScale, LinearScale,
  Tooltip, Legend, Filler,
)

const TICK = { color: '#8892a4', font: { size: 9 } }
const GRID = { color: 'rgba(37,41,50,.5)' }

// ─── Doughnut ────────────────────────────────────────────────────────────────
interface DoughnutProps {
  labels: string[]; data: number[]; colors: string[]
  centerLabel?: string; size?: number
}
export function DoughnutChart({ labels, data, colors, centerLabel, size = 200 }: DoughnutProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const chart = useRef<Chart | null>(null)

  useEffect(() => {
    if (!ref.current) return
    chart.current?.destroy()
    chart.current = new Chart(ref.current, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: '#111318' }] },
      options: {
        cutout: '70%', animation: { duration: 300 },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: c => ` ${c.label}: ${(c.parsed as number).toFixed(1)}%` } },
        },
      } as ChartOptions<'doughnut'>,
    })
    return () => chart.current?.destroy()
  }, [JSON.stringify(data)])

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <canvas ref={ref} width={size} height={size} />
      {centerLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="font-mono text-sm font-bold text-amber leading-none">{centerLabel}</div>
          <div className="font-mono text-[9px] text-tx3 mt-0.5">Total</div>
        </div>
      )}
    </div>
  )
}

// ─── Bar / Line combo ────────────────────────────────────────────────────────
interface Dataset {
  label: string; data: (number | null)[]
  backgroundColor?: string | string[]; borderColor?: string
  type?: 'bar' | 'line'; stack?: string
  tension?: number; borderWidth?: number; pointRadius?: number | number[]
  fill?: boolean; yAxisID?: string
}
interface BarProps {
  labels: string[]; datasets: Dataset[]
  height?: number; stacked?: boolean; y2?: boolean
}
export function BarChart({ labels, datasets, height = 220, stacked, y2 }: BarProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const chart = useRef<Chart | null>(null)

  useEffect(() => {
    if (!ref.current) return
    chart.current?.destroy()

    const scales: any = {
      x: { ticks: TICK, grid: GRID, stacked: stacked },
      y: { position: 'left', ticks: { ...TICK, callback: (v: any) => v >= 1e3 ? (v/1e3).toFixed(0)+'K' : v }, grid: GRID, stacked: stacked },
    }
    if (y2) {
      scales.y2 = { position: 'right', ticks: { ...TICK, callback: (v: any) => v >= 1e6 ? (v/1e6).toFixed(1)+'M' : v >= 1e3 ? (v/1e3).toFixed(0)+'K' : v }, grid: { display: false } }
    }

    chart.current = new Chart(ref.current, {
      type: 'bar',
      data: { labels, datasets } as ChartData<'bar'>,
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: 300 },
        plugins: { legend: { display: datasets.length > 1, labels: { color: '#8892a4', font: { size: 10 }, boxWidth: 12 } } },
        scales,
      } as ChartOptions<'bar'>,
    })
    return () => chart.current?.destroy()
  }, [JSON.stringify({ labels, datasets })])

  return <div style={{ height }}><canvas ref={ref} /></div>
}

// ─── Line chart ──────────────────────────────────────────────────────────────
interface LineProps { labels: string[]; datasets: Dataset[]; height?: number }
export function LineChart({ labels, datasets, height = 220 }: LineProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const chart = useRef<Chart | null>(null)

  useEffect(() => {
    if (!ref.current) return
    chart.current?.destroy()
    chart.current = new Chart(ref.current, {
      type: 'line',
      data: { labels, datasets } as ChartData<'line'>,
      options: {
        responsive: true, maintainAspectRatio: false, animation: { duration: 300 },
        plugins: { legend: { display: true, labels: { color: '#8892a4', font: { size: 10 }, boxWidth: 12 } } },
        scales: { x: { ticks: TICK, grid: GRID }, y: { ticks: TICK, grid: GRID } },
      } as ChartOptions<'line'>,
    })
    return () => chart.current?.destroy()
  }, [JSON.stringify({ labels, datasets })])

  return <div style={{ height }}><canvas ref={ref} /></div>
}
