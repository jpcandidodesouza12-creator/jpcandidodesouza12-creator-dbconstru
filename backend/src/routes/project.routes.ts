// backend/src/routes/project.routes.ts
import { Router } from 'express'
import { ProjectController } from '../controllers/project.controller'
import { authenticate } from '../middleware/auth'

const router = Router()

router.use(authenticate)

router.get('/',     ProjectController.list)
router.post('/',    ProjectController.create)
router.get('/:id',  ProjectController.findOne)
router.put('/:id',  ProjectController.update)
router.delete('/:id', ProjectController.delete)

export default router
