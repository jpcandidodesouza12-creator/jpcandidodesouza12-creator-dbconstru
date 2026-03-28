// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken, JwtPayload } from '../config/jwt'
import { AppError } from './errorHandler'

export interface AuthRequest extends Request {
  user?: JwtPayload
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) throw new AppError('Token não fornecido', 401)

  const token = header.slice(7)
  try {
    req.user = verifyAccessToken(token)
    next()
  } catch {
    throw new AppError('Token inválido ou expirado', 401)
  }
}

export function requireAdmin(req: AuthRequest, _res: Response, next: NextFunction) {
  if (!req.user) throw new AppError('Não autenticado', 401)
  if (req.user.role !== 'ADMIN') throw new AppError('Acesso restrito a administradores', 403)
  next()
}
