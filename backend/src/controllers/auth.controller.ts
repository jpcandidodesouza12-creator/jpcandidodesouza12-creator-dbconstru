// backend/src/controllers/auth.controller.ts
import { Request, Response } from 'express'
import { z } from 'zod'
import { AuthService } from '../services/auth.service'
import { AppError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'
import prisma from '../config/database'

const registerSchema = z.object({
  name:     z.string().min(2, 'Nome muito curto').max(100),
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
})

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

export const AuthController = {
  async register(req: Request, res: Response) {
    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) throw new AppError(parsed.error.errors[0].message, 400, 'VALIDATION')

    const result = await AuthService.register(parsed.data)
    res.status(201).json({ ok: true, data: result })
  },

  async login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) throw new AppError('Dados inválidos', 400, 'VALIDATION')

    const result = await AuthService.login(
      parsed.data,
      req.headers['user-agent'],
      req.ip,
    )
    res.json({ ok: true, data: result })
  },

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body
    if (!refreshToken) throw new AppError('Refresh token não fornecido', 400)
    const result = await AuthService.refresh(refreshToken)
    res.json({ ok: true, data: result })
  },

  async logout(req: Request, res: Response) {
    const { refreshToken } = req.body
    if (refreshToken) await AuthService.logout(refreshToken)
    res.json({ ok: true, data: { message: 'Logout realizado com sucesso' } })
  },

  async me(req: AuthRequest, res: Response) {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      select: {
        id: true, name: true, email: true, role: true,
        active: true, createdAt: true, lastLoginAt: true,
        _count: { select: { projects: true } },
      },
    })
    if (!user) throw new AppError('Usuário não encontrado', 404)
    res.json({ ok: true, data: { user } })
  },
}
