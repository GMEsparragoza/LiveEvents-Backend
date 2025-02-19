import express from 'express'
import { AuthController } from '../controllers/AuthController.js'
import { VerifyToken } from '../middlewares/AuthMiddleware.js'

const router = express.Router()

router.post('/register', AuthController.RegisterUser)
router.post('/login', AuthController.LoginUser)
router.post('/reset-password', AuthController.resetUserPassword)
router.post('/logout', AuthController.logOutSession)

router.get('/profile', VerifyToken, AuthController.AuthSession)

router.put('/reset-password/:userID/:oobCode', AuthController.ResetPassword)

export default router