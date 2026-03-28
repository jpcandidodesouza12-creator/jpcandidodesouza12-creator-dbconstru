// frontend/src/components/ui/index.tsx
import { forwardRef } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: any[]) { return twMerge(clsx(inputs)) }

// ─── Button ──────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all rounded-lg border',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-amber text-bg border-amber hover:bg-amber2':             variant === 'primary',
          'bg-transparent text-tx2 border-line2 hover:border-amber hover:text-amber': variant === 'secondary',
          'bg-transparent text-danger border-danger/30 hover:bg-danger/10': variant === 'danger',
          'bg-transparent text-tx3 border-transparent hover:text-tx hover:bg-white/5': variant === 'ghost',
        },
        { 'px-3 py-1.5 text-xs': size === 'sm', 'px-4 py-2 text-sm': size === 'md', 'px-6 py-3 text-base': size === 'lg' },
        className,
      )}
      {...props}
    >
      {loading ? <Spinner size="sm" className="mr-2" /> : null}
      {children}
    </button>
  )
)
Button.displayName = 'Button'

// ─── Input ───────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; error?: string; suffix?: string
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, suffix, className, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block font-mono text-[10px] text-tx3 uppercase tracking-widest mb-1.5">{label}</label>}
      <div className="relative">
        <input
          ref={ref}
          className={cn(
            'w-full bg-bg2 border border-line2 rounded-lg px-3 py-2 text-sm text-tx outline-none',
            'transition-colors focus:border-amber placeholder:text-tx3',
            error && 'border-danger',
            suffix && 'pr-10',
            className,
          )}
          {...props}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-tx3">{suffix}</span>}
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'

// ─── Card ────────────────────────────────────────────────────────────────────
interface CardProps { children: React.ReactNode; className?: string; accent?: string }
export function Card({ children, className, accent }: CardProps) {
  return (
    <div
      className={cn('bg-bg1 border border-line rounded-xl overflow-hidden relative', className)}
      style={accent ? { '--accent': accent } as any : undefined}
    >
      {accent && <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: accent }} />}
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between px-4 py-3 border-b border-line flex-wrap gap-2', className)}>
      {children}
    </div>
  )
}
export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-condensed text-sm font-bold uppercase tracking-wide">{children}</h3>
}
export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('p-4', className)}>{children}</div>
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
interface KpiCardProps { label: string; value: string; sub?: string; accent?: string; progress?: number }
export function KpiCard({ label, value, sub, accent = '#f0a500', progress }: KpiCardProps) {
  return (
    <Card accent={accent}>
      <div className="p-4">
        <div className="font-mono text-[9px] text-tx3 uppercase tracking-widest">{label}</div>
        <div className="font-mono text-lg font-bold mt-1.5 leading-none" style={{ color: accent }}>{value}</div>
        {sub && <div className="text-[10px] text-tx3 mt-1">{sub}</div>}
        {progress !== undefined && (
          <div className="mt-2 h-1 bg-line2 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: accent }} />
          </div>
        )}
      </div>
    </Card>
  )
}

// ─── Badge ───────────────────────────────────────────────────────────────────
interface BadgeProps { children: React.ReactNode; color?: 'amber' | 'green' | 'red' | 'blue' | 'gray' }
export function Badge({ children, color = 'gray' }: BadgeProps) {
  const colors = {
    amber: 'bg-amber/20 text-amber', green: 'bg-ok/20 text-ok',
    red: 'bg-danger/20 text-danger', blue: 'bg-mat/20 text-mat', gray: 'bg-tx3/20 text-tx2',
  }
  return <span className={cn('font-mono text-[9px] font-bold px-2 py-0.5 rounded-full', colors[color])}>{children}</span>
}

// ─── Spinner ─────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', className }: { size?: 'sm'|'md'|'lg'; className?: string }) {
  const s = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-8 h-8' }[size]
  return (
    <div className={cn('border-2 border-line2 border-t-amber rounded-full animate-spin', s, className)} />
  )
}

// ─── Section header ───────────────────────────────────────────────────────────
export function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="font-condensed text-base font-bold uppercase tracking-wide">{children}</h2>
      {sub && <p className="font-mono text-[10px] text-tx3 mt-0.5">{sub}</p>}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, desc, action }: { icon: string; title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <div className="font-condensed text-base font-bold uppercase text-tx2">{title}</div>
      {desc && <p className="text-sm text-tx3 mt-1 max-w-xs">{desc}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ─── Table ────────────────────────────────────────────────────────────────────
export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full border-collapse text-sm', className)}>{children}</table>
    </div>
  )
}
export function Th({ children, right, center }: { children: React.ReactNode; right?: boolean; center?: boolean }) {
  return (
    <th className={cn(
      'bg-bg2 border-b-2 border-line2 px-3 py-2.5 font-mono text-[9px] text-tx3 uppercase tracking-wider whitespace-nowrap',
      right ? 'text-right' : center ? 'text-center' : 'text-left',
    )}>
      {children}
    </th>
  )
}
export function Td({ children, right, center, className }: { children: React.ReactNode; right?: boolean; center?: boolean; className?: string }) {
  return (
    <td className={cn(
      'px-3 py-2.5 border-b border-line/50 align-middle',
      right ? 'text-right' : center ? 'text-center' : '',
      className,
    )}>
      {children}
    </td>
  )
}
