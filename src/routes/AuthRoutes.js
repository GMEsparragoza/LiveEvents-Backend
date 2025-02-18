import express from 'express'
import { AuthController } from '../controllers/AuthController.js'
import { VerifyToken } from '../middlewares/AuthMiddleware.js'

const router = express.Router()

router.post('/register', AuthController.RegisterUser)
router.post('/login', AuthController.LoginUser)

router.get('/profile', VerifyToken, AuthController.AuthSession)

export default router