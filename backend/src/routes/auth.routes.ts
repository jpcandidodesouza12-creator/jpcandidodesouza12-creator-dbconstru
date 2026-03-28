// backend/src/routes/auth.routes.ts
import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'
import { authenticate } from '../middleware/auth'
import { authRateLimit } from '../middleware/rateLimit'

const router = Router()

router.post('/register', authRateLimit, AuthController.register)
router.post('/login',    authRateLimit, AuthController.login)
router.post('/refresh',  AuthController.refresh)
router.post('/logout',   AuthController.logout)
router.get('/me',        authenticate, AuthController.me)

export default router
