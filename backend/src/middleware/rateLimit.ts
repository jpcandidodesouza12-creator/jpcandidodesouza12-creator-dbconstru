// backend/src/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit'

export const globalRateLimit = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: { message: 'Muitas requisições. Tente novamente em breve.', code: 'RATE_LIMITED' } },
})

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: { message: 'Muitas tentativas de login. Aguarde 15 minutos.', code: 'AUTH_RATE_LIMITED' } },
})
