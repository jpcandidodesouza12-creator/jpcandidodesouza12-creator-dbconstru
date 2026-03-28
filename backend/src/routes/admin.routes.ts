// backend/src/routes/admin.routes.ts
import { Router } from 'express'
import { AdminController } from '../controllers/project.controller'
import { authenticate, requireAdmin } from '../middleware/auth'

const router = Router()

router.use(authenticate, requireAdmin)

router.get('/stats',          AdminController.getStats)
router.get('/users',          AdminController.listUsers)
router.post('/users',         AdminController.createUser)
router.put('/users/:id',      AdminController.updateUser)
router.delete('/users/:id',   AdminController.deleteUser)
router.get('/projects',       AdminController.listAllProjects)

export default router
