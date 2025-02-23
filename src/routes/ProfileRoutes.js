import express from 'express'
import upload from '../config/multer.js'
import { VerifyToken } from '../middlewares/AuthMiddleware.js'
import { UserController } from '../controllers/UserController.js'

const router = express.Router()

router.get('/logs', VerifyToken, UserController.ObtainActivityLogsUser)

router.put('/data', VerifyToken, upload.single('image'), UserController.updateUserData)
router.put('/password', VerifyToken, UserController.updateUserPassword)

export default router