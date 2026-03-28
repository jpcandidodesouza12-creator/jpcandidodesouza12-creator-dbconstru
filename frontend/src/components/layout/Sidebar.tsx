// frontend/src/components/layout/Sidebar.tsx
'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { DogLogo } from '@/components/ui/DogLogo'

const NAV = [
  { href: '/dashboard',      icon: '🏠', label: 'Dashboard'        },
  { href: '/etapas',         icon: '📋', label: 'Etapas'           },
  { href: '/bdi',            icon: '📐', label: 'Calculadora BDI'  },
  { href: '/abc',            icon: '📊', label: 'Curva ABC'        },
  { href: '/cashflow',       icon: '💰', label: 'Fluxo de Caixa'   },
  { href: '/composicoes',    icon: '🔩', label: 'Composições CPU'  },
  { href: '/cronograma',     icon: '📅', label: 'Cronograma'       },
  { href: '/cenarios',       icon: '⚖️',  label: 'Cenários'        },
  { href: '/avanco',         icon: '📏', label: 'Avanço Físico'    },
  { href: '/pagamentos',     icon: '💳', label: 'Pagamentos'       },
  { href: '/riscos',         icon: '⚠️',  label: 'Riscos'          },
  { href: '/fornecedores',   icon: '🏪', label: 'Fornecedores'     },
  { href: '/diario',         icon: '📝', label: 'Diário de Obra'   },
]

const ADMIN_NAV = [
  { href: '/admin', icon: '🛡️', label: 'Painel Admin' },
]

export function Sidebar() {
  const pathname  = usePathname()
  const router    = useRouter()
  const user      = useAuthStore(s => s.user)
  const logout    = useAuthStore(s => s.logout)
  const isAdmin   = user?.role === 'ADMIN'
  const initials  = user?.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'

  async function handleLogout() {
    await logout()
    router.push('/auth/login')
  }

  return (
    <aside
      className="
        fixed top-0 left-0 h-screen z-50 flex flex-col
        bg-bg1 border-r border-line overflow-hidden
        w-16 hover:w-60 transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]
        group
      "
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-3.5 py-4 border-b border-line flex-shrink-0 min-h-[68px] overflow-hidden">
        <DogLogo size={36} />
        <div className="whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="font-condensed text-sm font-bold uppercase">
            Dumb <span className="text-amber">Construtor</span>
          </div>
          <div className="font-mono text-[9px] text-tx3 mt-0.5">Campo Grande · MS</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 scrollbar-none">
        {/* Section label */}
        <div className="font-mono text-[9px] text-tx3 uppercase tracking-widest px-4.5 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Orçamento
        </div>

        {NAV.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`
                flex items-center gap-3 w-full px-4.5 py-2.5 text-left
                transition-all duration-150 relative overflow-hidden whitespace-nowrap
                ${active
                  ? 'bg-amber/10 text-amber before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-amber'
                  : 'text-tx2 hover:bg-white/4 hover:text-tx'}
              `}
            >
              <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
              <span className="text-xs font-medium overflow-hidden text-ellipsis opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {item.label}
              </span>
            </button>
          )
        })}

        {/* Admin section */}
        {isAdmin && (
          <>
            <div className="font-mono text-[9px] text-tx3 uppercase tracking-widest px-4.5 pt-4 pb-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Administração
            </div>
            {ADMIN_NAV.map(item => {
              const active = pathname === item.href
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`
                    flex items-center gap-3 w-full px-4.5 py-2.5 text-left
                    transition-all duration-150 relative overflow-hidden whitespace-nowrap
                    ${active ? 'bg-amber/10 text-amber' : 'text-tx2 hover:bg-white/4 hover:text-tx'}
                  `}
                >
                  <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                  <span className="text-xs font-medium overflow-hidden text-ellipsis opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {item.label}
                  </span>
                </button>
              )
            })}
          </>
        )}
      </nav>

      {/* Footer — user info + logout */}
      <div className="border-t border-line flex-shrink-0 overflow-hidden">
        <div className="flex items-center gap-2.5 px-3.5 py-3 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-amber flex items-center justify-center font-condensed text-sm font-bold text-bg flex-shrink-0">
            {initials}
          </div>
          <div className="overflow-hidden whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="text-xs font-semibold text-tx overflow-hidden text-ellipsis">{user?.name}</div>
            <div className="font-mono text-[9px] text-tx3">{isAdmin ? 'Admin Master' : 'Usuário'}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4.5 py-2.5 text-tx3 hover:text-danger hover:bg-danger/5 transition-all overflow-hidden whitespace-nowrap"
        >
          <span className="text-sm w-5 text-center flex-shrink-0">🚪</span>
          <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">Sair da conta</span>
        </button>
      </div>
    </aside>
  )
}
