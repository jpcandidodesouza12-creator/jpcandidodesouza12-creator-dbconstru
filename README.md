# 🐕 Dumb Construtor

<<<<<<< HEAD
Sistema de orçamento e gestão de obras residenciais — Campo Grande, MS.
=======
Sistema de orçamento e gestão de obras residenciais
>>>>>>> 1986fb6ea7eaf9975841e95a4375cb4ddf78fae8

## Stack

| Camada     | Tecnologia         | Hospedagem    |
|------------|--------------------|---------------|
| Frontend   | Next.js 14 (App Router) | Vercel   |
| Backend    | Node.js + Express  | Northflank    |
| Banco      | PostgreSQL (Neon)  | Neon Tech     |
| ORM        | Prisma             | —             |
| Auth       | JWT + bcrypt       | —             |
| CI/CD      | GitHub Actions     | GitHub        |

## Estrutura do Monorepo

```
dumb-construtor/
├── backend/                  # API REST — deploy Northflank
│   ├── src/
│   │   ├── config/           # env, db, constants
│   │   ├── controllers/      # lógica de negócio
│   │   ├── middleware/        # auth, erros, validação
│   │   ├── models/           # tipos TypeScript
│   │   ├── routes/           # endpoints
│   │   ├── services/         # camada de serviço (DB)
│   │   └── utils/            # helpers
│   ├── prisma/
│   │   └── schema.prisma     # schema do banco
│   ├── .env.example
│   └── package.json
│
├── frontend/                 # Next.js 14 — deploy Vercel
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   ├── components/       # React components
│   │   │   ├── ui/           # atoms (Button, Input...)
│   │   │   ├── charts/       # Chart.js wrappers
│   │   │   ├── layout/       # Sidebar, Topbar
│   │   │   └── forms/        # formulários
│   │   ├── hooks/            # custom hooks
│   │   ├── lib/              # api client, utils
│   │   ├── store/            # Zustand state
│   │   └── types/            # TypeScript types
│   ├── .env.example
│   └── package.json
│
└── .github/
    └── workflows/
        ├── backend.yml       # CI/CD Northflank
        └── frontend.yml      # CI/CD Vercel
```

## Quick Start

### 1. Clone e instale
```bash
git clone https://github.com/SEU_USER/dumb-construtor.git
cd dumb-construtor

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Configure variáveis de ambiente
```bash
# backend/.env
cp backend/.env.example backend/.env

# frontend/.env.local
cp frontend/.env.example frontend/.env.local
```

### 3. Setup do banco (Neon)
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Rode localmente
```bash
# Terminal 1 — Backend (porta 4000)
cd backend && npm run dev

# Terminal 2 — Frontend (porta 3000)
cd frontend && npm run dev
```

## Deploy

### Neon (Banco de Dados)
1. Criar projeto em [console.neon.tech](https://console.neon.tech)
2. Copiar `DATABASE_URL` da connection string
3. Adicionar no backend `.env` e no Northflank

### Northflank (Backend)
1. Criar serviço → **Build Service** → GitHub repo → pasta `/backend`
2. Dockerfile ou Buildpack (Node.js detectado automaticamente)
3. Adicionar variáveis de ambiente (ver `.env.example`)
4. Porta: **4000**

### Vercel (Frontend)
1. Importar repo do GitHub → selecionar pasta `/frontend`
2. Framework: **Next.js** (detectado automaticamente)
3. Adicionar `NEXT_PUBLIC_API_URL` apontando para URL do Northflank

### GitHub Actions
- **backend.yml**: roda em push para `main` → testa → deploy Northflank
- **frontend.yml**: roda em push para `main` → testa → deploy Vercel (automático via integração)

## Usuário Admin Padrão (seed)
```
Email: admin@dumbconstrutor.com
Senha: Admin@2026!
```
> Altere imediatamente após o primeiro login.

## Endpoints da API

| Método | Rota                       | Auth | Descrição                  |
|--------|----------------------------|------|----------------------------|
| POST   | /api/auth/register         | ❌   | Criar conta                |
| POST   | /api/auth/login            | ❌   | Login → JWT                |
| GET    | /api/auth/me               | ✅   | Dados do usuário logado    |
| GET    | /api/projects              | ✅   | Listar projetos do usuário |
| POST   | /api/projects              | ✅   | Criar projeto              |
| GET    | /api/projects/:id          | ✅   | Buscar projeto             |
| PUT    | /api/projects/:id          | ✅   | Atualizar projeto          |
| DELETE | /api/projects/:id          | ✅   | Excluir projeto            |
| GET    | /api/admin/users           | 🛡️   | Listar usuários (admin)    |
| PUT    | /api/admin/users/:id       | 🛡️   | Editar usuário (admin)     |
| DELETE | /api/admin/users/:id       | 🛡️   | Excluir usuário (admin)    |
| GET    | /api/admin/stats           | 🛡️   | Relatório de uso (admin)   |

✅ = JWT required · 🛡️ = Admin only
