import express from 'express'
import { VerifyToken } from '../middlewares/AuthMiddleware.js'
import { verifyAdmin } from '../middlewares/AdminMiddleware.js'
import { EventController } from '../controllers/EventController.js'
import upload from '../config/multer.js'
import { UserController } from '../controllers/UserController.js'

const router = express.Router()

router.get('/events', VerifyToken, verifyAdmin, EventController.ObtainEvents)
router.get('/users', VerifyToken, verifyAdmin, UserController.getUsersByFilter)

router.post('/event', VerifyToken, verifyAdmin, upload.single('image'), EventController.createNewEvent)

router.put('/user/:id', VerifyToken, verifyAdmin, UserController.updateUser)
router.put('/event/:id', VerifyToken, verifyAdmin, EventController.updateEvent)

router.delete('/user/:id', VerifyToken, verifyAdmin, UserController.deleteUser)
router.delete('/event/:id', VerifyToken, verifyAdmin, EventController.deleteEvent)

export default router