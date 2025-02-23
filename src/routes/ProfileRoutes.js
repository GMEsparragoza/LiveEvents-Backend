import express from 'express'
import upload from '../config/multer.js'
import { VerifyToken } from '../middlewares/AuthMiddleware.js'
import { verifyAdmin } from '../middlewares/AdminMiddleware.js'
import { UserController } from '../controllers/UserController.js'

const router = express.Router()

router.get('/logs', VerifyToken, UserController.ObtainActivityLogsUser)
router.get('/events', VerifyToken, verifyAdmin, UserController.ObtainCreatedUserEvents)

router.put('/data', VerifyToken, upload.single('image'), UserController.updateUserData)
router.put('/password', VerifyToken, UserController.updateUserPassword)

export default router