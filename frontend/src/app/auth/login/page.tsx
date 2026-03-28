// frontend/src/app/auth/login/page.tsx
'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth.store'
import { DogLogo } from '@/components/ui/DogLogo'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const login = useAuthStore(s => s.login)
  const isLoading = useAuthStore(s => s.isLoading)

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      const from = searchParams.get('from') || '/dashboard'
      router.push(from)
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'E-mail ou senha incorretos')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-bg1 border border-line2 rounded-2xl p-9 shadow-2xl animate-fade-in">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <DogLogo size={44} />
            <div>
              <div className="font-condensed text-2xl font-bold uppercase tracking-wide">
                Dumb <span className="text-amber">Construtor</span>
              </div>
              <div className="font-mono text-[10px] text-tx3 mt-0.5">Sistema de orçamento de obras</div>
            </div>
          </div>

          <h1 className="font-condensed text-xl font-bold uppercase mb-1">Entrar</h1>
          <p className="text-sm text-tx2 mb-6">Acesse sua conta para continuar</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-danger mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-mono text-[10px] text-tx3 uppercase tracking-widest mb-1.5">
                E-mail
              </label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="voce@email.com"
                className="w-full bg-bg2 border border-line2 rounded-lg px-4 py-3 text-sm outline-none focus:border-amber transition-colors"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] text-tx3 uppercase tracking-widest mb-1.5">
                Senha
              </label>
              <input
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-bg2 border border-line2 rounded-lg px-4 py-3 text-sm outline-none focus:border-amber transition-colors"
              />
            </div>

            <button
              type="submit" disabled={isLoading}
              className="w-full bg-amber text-bg font-condensed font-bold text-base uppercase tracking-wider py-3 rounded-lg hover:bg-amber2 transition-colors disabled:opacity-60 mt-2"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5 text-[10px] text-tx3">
            <div className="flex-1 h-px bg-line2" />ou<div className="flex-1 h-px bg-line2" />
          </div>

          <p className="text-center text-sm text-tx3">
            Não tem conta?{' '}
            <Link href="/auth/register" className="text-amber font-semibold hover:underline">
              Criar conta grátis →
            </Link>
          </p>

          <p className="text-center text-[10px] text-tx3 mt-4">
            🔑 Demo admin: admin@dumbconstrutor.com / Admin@2026!
          </p>
        </div>
      </div>
    </div>
  )
}
