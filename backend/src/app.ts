// backend/src/app.ts
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { globalRateLimit } from './middleware/rateLimit'
import { errorHandler } from './middleware/errorHandler'
import { notFound } from './middleware/notFound'
import authRoutes from './routes/auth.routes'
import projectRoutes from './routes/project.routes'
import adminRoutes from './routes/admin.routes'

const app = express()

// ─── Security ────────────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}))
app.use(globalRateLimit)

// ─── Parsing ─────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

// ─── Logging ─────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
}

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'dumb-construtor-api', ts: new Date() })
})

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',    authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/admin',   adminRoutes)

// ─── Error handlers ──────────────────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

export default app
