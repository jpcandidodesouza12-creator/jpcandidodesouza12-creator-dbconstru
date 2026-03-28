// frontend/src/app/(app)/admin/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { adminApi } from '@/lib/api'
import { User, AdminStats } from '@/types'
import { Card, CardHeader, CardTitle, CardBody, KpiCard, Button, Badge, Spinner, Table, Th, Td } from '@/components/ui'
import { BarChart } from '@/components/charts'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const router  = useRouter()
  const user    = useAuthStore(s => s.user)
  const [users,  setUsers]  = useState<User[]>([])
  const [stats,  setStats]  = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== 'ADMIN') { router.push('/dashboard'); return }
    Promise.all([adminApi.listUsers(), adminApi.stats()])
      .then(([u, s]) => { setUsers(u.data.data.users); setStats(s.data.data.stats) })
      .catch(() => toast.error('Erro ao carregar dados admin'))
      .finally(() => setLoading(false))
  }, [user])

  async function toggleActive(uid: string, active: boolean) {
    try {
      await adminApi.updateUser(uid, { active: !active })
      setUsers(prev => prev.map(u => u.id === uid ? { ...u, active: !active } : u))
      toast.success(active ? 'Usuário desativado' : 'Usuário ativado')
    } catch { toast.error('Erro ao atualizar usuário') }
  }

  async function handleDelete(uid: string) {
    if (!confirm('Excluir este usuário permanentemente?')) return
    try {
      await adminApi.deleteUser(uid)
      setUsers(prev => prev.filter(u => u.id !== uid))
      toast.success('Usuário excluído')
    } catch (e: any) { toast.error(e?.response?.data?.error?.message || 'Erro ao excluir') }
  }

  async function handleCreate() {
    const name  = prompt('Nome completo:') || ''
    const email = prompt('E-mail:') || ''
    const pass  = prompt('Senha inicial (mín. 6 chars):') || ''
    if (!name || !email || pass.length < 6) { toast.error('Dados inválidos'); return }
    const role  = confirm('Conceder permissão de ADMIN? (Cancel = usuário comum)') ? 'ADMIN' : 'USER'
    try {
      const { data } = await adminApi.createUser({ name, email, password: pass, role })
      setUsers(prev => [data.data.user, ...prev])
      toast.success('Usuário criado!')
    } catch (e: any) { toast.error(e?.response?.data?.error?.message || 'Erro ao criar') }
  }

  function exportSchema() {
    const sql = `-- Dumb Construtor · Neon PostgreSQL Schema
-- Execute no SQL Editor do Neon Console

-- Users
create table if not exists users (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  email text unique not null,
  password text not null,
  role text default 'USER' check (role in ('USER','ADMIN')),
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_login_at timestamptz
);

-- Sessions (refresh tokens)
create table if not exists sessions (
  id text primary key default gen_random_uuid()::text,
  user_id text references users(id) on delete cascade,
  token text unique not null,
  expires_at timestamptz not null,
  created_at timestamptz default now(),
  user_agent text,
  ip text
);

-- Projects
create table if not exists projects (
  id text primary key default gen_random_uuid()::text,
  user_id text references users(id) on delete cascade,
  name text not null default 'Meu Projeto',
  description text,
  city text default 'Campo Grande',
  state text default 'MS',
  area float default 150,
  standard text default 'MED' check (standard in ('LOW','MED','HIGH')),
  status text default 'PLANNING',
  config jsonb default '{}',
  phases jsonb default '[]',
  risks jsonb default '[]',
  suppliers jsonb default '{}',
  diary jsonb default '[]',
  payments jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_projects_user_id on projects(user_id);
create index if not exists idx_sessions_user_id on sessions(user_id);
`
    const blob = new Blob([sql], { type: 'text/sql' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'neon-schema.sql'
    a.click()
    URL.revokeObjectURL(a.href)
    toast.success('Schema SQL exportado!')
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>

  const COLORS = ['#f0a500','#3ecfb2','#6c8fff','#f472b6','#34d399','#fb923c']
  const colorFor = (email: string) => COLORS[email.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-condensed text-xl font-bold uppercase">🛡️ Painel Admin</h1>
          <p className="font-mono text-[10px] text-tx3 mt-0.5">Logado como: {user?.name}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={exportSchema}>📋 Exportar SQL Schema</Button>
          <Button size="sm" onClick={handleCreate}>+ Criar Usuário</Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <KpiCard label="Total Usuários"    value={String(stats.users.total)}        accent="#f0a500" />
          <KpiCard label="Contas Ativas"     value={String(stats.users.active)}       accent="#4cde8a" />
          <KpiCard label="Admins"            value={String(stats.users.admin)}        accent="#ffc84a" />
          <KpiCard label="Logins (7 dias)"   value={String(stats.users.recentLogins)} accent="#3ecfb2" />
          <KpiCard label="Total Projetos"    value={String(stats.projects.total)}     accent="#6c8fff" />
          <KpiCard label="Backend"           value="Online ✓"                         accent="#4cde8a" />
        </div>
      )}

      {/* Users table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários Cadastrados</CardTitle>
          <span className="font-mono text-[9px] text-tx3">{users.length} conta{users.length !== 1 ? 's' : ''}</span>
        </CardHeader>
        <Table>
          <thead><tr><Th>Usuário</Th><Th center>Perfil</Th><Th center>Status</Th><Th>Criado em</Th><Th>Último login</Th><Th center>Projetos</Th><Th center>Ações</Th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="hover:bg-white/[.01]">
                <Td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-condensed text-xs font-bold text-bg flex-shrink-0" style={{ background: colorFor(u.email) }}>
                      {u.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{u.name} {u.id === user?.id && <span className="text-tx3 font-normal">(você)</span>}</div>
                      <div className="font-mono text-[9px] text-tx3">{u.email}</div>
                    </div>
                  </div>
                </Td>
                <Td center><Badge color={u.role === 'ADMIN' ? 'amber' : 'gray'}>{u.role}</Badge></Td>
                <Td center><Badge color={u.active ? 'green' : 'red'}>{u.active ? 'Ativo' : 'Inativo'}</Badge></Td>
                <Td><span className="font-mono text-[10px] text-tx3">{new Date(u.createdAt).toLocaleDateString('pt-BR')}</span></Td>
                <Td><span className="font-mono text-[10px] text-tx3">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—'}</span></Td>
                <Td center><span className="font-mono text-xs text-tx3">{u._count?.projects ?? 0}</span></Td>
                <Td center>
                  {u.id !== user?.id ? (
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      <Button variant={u.active ? 'danger' : 'secondary'} size="sm" onClick={() => toggleActive(u.id, u.active)}>
                        {u.active ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(u.id)}>Excluir</Button>
                    </div>
                  ) : <span className="text-tx3 text-xs">—</span>}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {/* Usage chart */}
      {stats && (
        <Card>
          <CardHeader><CardTitle>Relatório de Uso</CardTitle></CardHeader>
          <CardBody>
            <BarChart
              labels={['Admins', 'Usuários Ativos', 'Usuários Inativos']}
              datasets={[{
                label: 'Usuários',
                data: [stats.users.admin, stats.users.active - stats.users.admin, stats.users.total - stats.users.active],
                backgroundColor: ['rgba(240,165,0,.7)', 'rgba(62,207,178,.7)', 'rgba(255,107,107,.7)'],
              }]}
              height={180}
            />
          </CardBody>
        </Card>
      )}

      {/* Migration guide */}
      <div className="bg-amber/5 border border-amber/15 rounded-lg p-4 text-sm text-tx2 leading-relaxed">
        <strong className="text-amber">☁️ Stack de Produção:</strong><br />
        <span className="font-mono text-[10px]">GitHub → Northflank (backend) · Vercel (frontend) · Neon (PostgreSQL)</span><br /><br />
        <strong>Para ativar o backend real:</strong><br />
        1. Criar projeto no <a href="https://console.neon.tech" target="_blank" className="text-amber hover:underline">Neon</a> → copiar <code className="font-mono text-xs bg-bg2 px-1 rounded">DATABASE_URL</code><br />
        2. Push do repo para GitHub → Northflank detecta Dockerfile<br />
        3. Adicionar env vars no Northflank (ver <code className="font-mono text-xs bg-bg2 px-1 rounded">backend/.env.example</code>)<br />
        4. Copiar URL do Northflank para <code className="font-mono text-xs bg-bg2 px-1 rounded">NEXT_PUBLIC_API_URL</code> na Vercel<br />
        5. Deploy automático a cada push na branch <code className="font-mono text-xs bg-bg2 px-1 rounded">main</code>
      </div>
    </div>
  )
}
