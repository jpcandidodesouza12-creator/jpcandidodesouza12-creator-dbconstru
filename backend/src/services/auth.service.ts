// backend/src/services/auth.service.ts
import bcrypt from 'bcryptjs'
import prisma from '../config/database'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../config/jwt'
import { AppError } from '../middleware/errorHandler'

export interface RegisterDTO {
  name: string
  email: string
  password: string
}

export interface LoginDTO {
  email: string
  password: string
}

export const AuthService = {
  async register({ name, email, password }: RegisterDTO) {
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) throw new AppError('E-mail já cadastrado', 409, 'EMAIL_EXISTS')

    const hash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email: email.toLowerCase(), password: hash },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })

    const accessToken  = signAccessToken({ sub: user.id, email: user.email, role: user.role })
    const refreshToken = signRefreshToken(user.id)

    // Persist refresh token hash
    await prisma.session.create({
      data: {
        userId: user.id,
        token: await bcrypt.hash(refreshToken, 8),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    return { user, accessToken, refreshToken }
  },

  async login({ email, password }: LoginDTO, userAgent?: string, ip?: string) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (!user) throw new AppError('E-mail ou senha incorretos', 401, 'INVALID_CREDENTIALS')
    if (!user.active) throw new AppError('Conta desativada. Entre em contato com o suporte.', 403, 'INACTIVE')

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw new AppError('E-mail ou senha incorretos', 401, 'INVALID_CREDENTIALS')

    // Update lastLoginAt
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })

    const accessToken  = signAccessToken({ sub: user.id, email: user.email, role: user.role })
    const refreshToken = signRefreshToken(user.id)

    await prisma.session.create({
      data: {
        userId: user.id,
        token: await bcrypt.hash(refreshToken, 8),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent,
        ip,
      },
    })

    const { password: _, ...safeUser } = user
    return { user: safeUser, accessToken, refreshToken }
  },

  async refresh(token: string) {
    let payload: { sub: string }
    try { payload = verifyRefreshToken(token) }
    catch { throw new AppError('Refresh token inválido', 401, 'INVALID_REFRESH') }

    // Find active session matching this user
    const sessions = await prisma.session.findMany({
      where: { userId: payload.sub, expiresAt: { gt: new Date() } },
    })

    let matchedSession = null
    for (const s of sessions) {
      if (await bcrypt.compare(token, s.token)) { matchedSession = s; break }
    }
    if (!matchedSession) throw new AppError('Sessão não encontrada ou expirada', 401, 'SESSION_EXPIRED')

    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user || !user.active) throw new AppError('Usuário não encontrado ou inativo', 401)

    // Rotate: delete old, create new
    await prisma.session.delete({ where: { id: matchedSession.id } })
    const newAccess  = signAccessToken({ sub: user.id, email: user.email, role: user.role })
    const newRefresh = signRefreshToken(user.id)
    await prisma.session.create({
      data: {
        userId: user.id,
        token: await bcrypt.hash(newRefresh, 8),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    return { accessToken: newAccess, refreshToken: newRefresh }
  },

  async logout(token: string) {
    try {
      const payload = verifyRefreshToken(token)
      const sessions = await prisma.session.findMany({ where: { userId: payload.sub } })
      for (const s of sessions) {
        if (await bcrypt.compare(token, s.token)) {
          await prisma.session.delete({ where: { id: s.id } })
          break
        }
      }
    } catch { /* token invalid — logout anyway */ }
  },
}
