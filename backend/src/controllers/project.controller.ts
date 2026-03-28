// backend/src/controllers/project.controller.ts
import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import { ProjectService } from '../services/project.service'

export const ProjectController = {
  async list(req: AuthRequest, res: Response) {
    const projects = await ProjectService.list(req.user!.sub)
    res.json({ ok: true, data: { projects } })
  },

  async findOne(req: AuthRequest, res: Response) {
    const isAdmin = req.user!.role === 'ADMIN'
    const project = await ProjectService.findOne(req.params.id, req.user!.sub, isAdmin)
    res.json({ ok: true, data: { project } })
  },

  async create(req: AuthRequest, res: Response) {
    const project = await ProjectService.create(req.user!.sub, req.body)
    res.status(201).json({ ok: true, data: { project } })
  },

  async update(req: AuthRequest, res: Response) {
    const isAdmin = req.user!.role === 'ADMIN'
    const project = await ProjectService.update(req.params.id, req.user!.sub, req.body, isAdmin)
    res.json({ ok: true, data: { project } })
  },

  async delete(req: AuthRequest, res: Response) {
    const isAdmin = req.user!.role === 'ADMIN'
    await ProjectService.delete(req.params.id, req.user!.sub, isAdmin)
    res.json({ ok: true, data: { message: 'Projeto excluído' } })
  },
}

// ─── Admin Controller ─────────────────────────────────────────────────────────
// backend/src/controllers/admin.controller.ts
import { AdminService } from '../services/admin.service'

export const AdminController = {
  async listUsers(_req: AuthRequest, res: Response) {
    const users = await AdminService.listUsers()
    res.json({ ok: true, data: { users } })
  },

  async createUser(req: AuthRequest, res: Response) {
    const user = await AdminService.createUser(req.body)
    res.status(201).json({ ok: true, data: { user } })
  },

  async updateUser(req: AuthRequest, res: Response) {
    const user = await AdminService.updateUser(req.params.id, req.body)
    res.json({ ok: true, data: { user } })
  },

  async deleteUser(req: AuthRequest, res: Response) {
    await AdminService.deleteUser(req.params.id, req.user!.sub)
    res.json({ ok: true, data: { message: 'Usuário excluído' } })
  },

  async getStats(_req: AuthRequest, res: Response) {
    const stats = await AdminService.getStats()
    res.json({ ok: true, data: { stats } })
  },

  async listAllProjects(_req: AuthRequest, res: Response) {
    const projects = await import('../config/database').then(m =>
      m.default.project.findMany({
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true, name: true, status: true, area: true, standard: true,
          createdAt: true, updatedAt: true,
          user: { select: { id: true, name: true, email: true } },
        },
      })
    )
    res.json({ ok: true, data: { projects } })
  },
}
