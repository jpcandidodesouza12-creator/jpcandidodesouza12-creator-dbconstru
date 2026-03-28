// backend/src/services/project.service.ts
import prisma from '../config/database'
import { AppError } from '../middleware/errorHandler'

export const ProjectService = {
  async list(userId: string) {
    return prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true, name: true, description: true, city: true,
        state: true, area: true, standard: true, status: true,
        createdAt: true, updatedAt: true,
        config: true,
      },
    })
  },

  async findOne(id: string, userId: string, isAdmin = false) {
    const project = await prisma.project.findUnique({ where: { id } })
    if (!project) throw new AppError('Projeto não encontrado', 404)
    if (!isAdmin && project.userId !== userId) throw new AppError('Acesso negado', 403)
    return project
  },

  async create(userId: string, data: any) {
    return prisma.project.create({
      data: {
        userId,
        name: data.name || 'Novo Projeto',
        description: data.description,
        city: data.city || 'Campo Grande',
        state: data.state || 'MS',
        area: data.area || 150,
        standard: data.standard || 'MED',
        config: data.config || {},
        phases: data.phases || [],
        risks: data.risks || [],
        suppliers: data.suppliers || {},
        diary: data.diary || [],
        payments: data.payments || {},
      },
    })
  },

  async update(id: string, userId: string, data: any, isAdmin = false) {
    await ProjectService.findOne(id, userId, isAdmin)
    return prisma.project.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        area: data.area,
        standard: data.standard,
        status: data.status,
        config: data.config,
        phases: data.phases,
        risks: data.risks,
        suppliers: data.suppliers,
        diary: data.diary,
        payments: data.payments,
      },
    })
  },

  async delete(id: string, userId: string, isAdmin = false) {
    await ProjectService.findOne(id, userId, isAdmin)
    return prisma.project.delete({ where: { id } })
  },
}
