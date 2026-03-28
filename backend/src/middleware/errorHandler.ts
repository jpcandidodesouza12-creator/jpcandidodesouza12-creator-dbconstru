// backend/src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Known operational errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      ok: false,
      error: { message: err.message, code: err.code },
    })
  }

  // Prisma unique constraint
  if ((err as any).code === 'P2002') {
    return res.status(409).json({
      ok: false,
      error: { message: 'Registro já existe', code: 'DUPLICATE' },
    })
  }

  // Prisma not found
  if ((err as any).code === 'P2025') {
    return res.status(404).json({
      ok: false,
      error: { message: 'Registro não encontrado', code: 'NOT_FOUND' },
    })
  }

  // Unexpected
  console.error('[ERROR]', err)
  return res.status(500).json({
    ok: false,
    error: {
      message: process.env.NODE_ENV === 'production'
        ? 'Erro interno do servidor'
        : err.message,
      code: 'INTERNAL_ERROR',
    },
  })
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ ok: false, error: { message: 'Rota não encontrada', code: 'NOT_FOUND' } })
}
