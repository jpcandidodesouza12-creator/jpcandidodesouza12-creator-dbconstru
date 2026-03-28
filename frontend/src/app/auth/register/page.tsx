// frontend/src/app/auth/register/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth.store'
import { DogLogo } from '@/components/ui/DogLogo'

export default function RegisterPage() {
  const router = useRouter()
  const register = useAuthStore(s => s.register)
  const isLoading = useAuthStore(s => s.isLoading)

  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [error,    setError]    = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('As senhas não coincidem'); return }
    if (password.length < 6)  { setError('Senha deve ter ao menos 6 caracteres'); return }
    try {
      await register(name, email, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Erro ao criar conta')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-bg1 border border-line2 rounded-2xl p-9 shadow-2xl animate-fade-in">

          <div className="flex items-center gap-3 mb-8">
            <DogLogo size={44} />
            <div>
              <div className="font-condensed text-2xl font-bold uppercase tracking-wide">
                Dumb <span className="text-amber">Construtor</span>
              </div>
              <div className="font-mono text-[10px] text-tx3 mt-0.5">Crie sua conta grátis</div>
            </div>
          </div>

          <h1 className="font-condensed text-xl font-bold uppercase mb-1">Criar Conta</h1>
          <p className="text-sm text-tx2 mb-6">Comece a planejar sua obra hoje</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-danger mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Nome completo', type: 'text',     value: name,     set: setName,     ph: 'Seu nome' },
              { label: 'E-mail',        type: 'email',    value: email,    set: setEmail,    ph: 'voce@email.com' },
              { label: 'Senha',         type: 'password', value: password, set: setPassword, ph: 'Mínimo 6 caracteres' },
              { label: 'Confirmar senha',type:'password', value: confirm,  set: setConfirm,  ph: 'Repita a senha' },
            ].map(f => (
              <div key={f.label}>
                <label className="block font-mono text-[10px] text-tx3 uppercase tracking-widest mb-1.5">
                  {f.label}
                </label>
                <input
                  type={f.type} required value={f.value} onChange={e => f.set(e.target.value)}
                  placeholder={f.ph}
                  className="w-full bg-bg2 border border-line2 rounded-lg px-4 py-3 text-sm outline-none focus:border-amber transition-colors"
                />
              </div>
            ))}

            <button
              type="submit" disabled={isLoading}
              className="w-full bg-amber text-bg font-condensed font-bold text-base uppercase tracking-wider py-3 rounded-lg hover:bg-amber2 transition-colors disabled:opacity-60 mt-2"
            >
              {isLoading ? 'Criando conta...' : 'Criar conta grátis'}
            </button>
          </form>

          <p className="text-center text-sm text-tx3 mt-5">
            Já tem conta?{' '}
            <Link href="/auth/login" className="text-amber font-semibold hover:underline">
              ← Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
