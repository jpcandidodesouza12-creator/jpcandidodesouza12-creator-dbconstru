// backend/src/services/admin.service.ts
import prisma from '../config/database'
import { AppError } from '../middleware/errorHandler'
import bcrypt from 'bcryptjs'

export const AdminService = {
  async listUsers() {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, role: true,
        active: true, createdAt: true, lastLoginAt: true,
        _count: { select: { projects: true } },
      },
    })
  },

  async updateUser(id: string, data: { name?: string; role?: any; active?: boolean }) {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw new AppError('Usuário não encontrado', 404)
    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, active: true },
    })
  },

  async createUser(data: { name: string; email: string; password: string; role?: any }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } })
    if (existing) throw new AppError('E-mail já cadastrado', 409)
    const hash = await bcrypt.hash(data.password, 12)
    return prisma.user.create({
      data: { name: data.name, email: data.email.toLowerCase(), password: hash, role: data.role || 'USER' },
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    })
  },

  async deleteUser(id: string, requesterId: string) {
    if (id === requesterId) throw new AppError('Você não pode excluir sua própria conta', 400)
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw new AppError('Usuário não encontrado', 404)
    return prisma.user.delete({ where: { id } })
  },

  async getStats() {
    const [totalUsers, activeUsers, adminUsers, totalProjects, recentLogins] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { active: true } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.project.count(),
      prisma.user.count({
        where: { lastLoginAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
    ])

    const projectsByStatus = await prisma.project.groupBy({
      by: ['status'],
      _count: { _all: true },
    })

    return {
      users: { total: totalUsers, active: activeUsers, admin: adminUsers, recentLogins },
      projects: {
        total: totalProjects,
        byStatus: Object.fromEntries(projectsByStatus.map(p => [p.status, p._count._all])),
      },
    }
  },
}
