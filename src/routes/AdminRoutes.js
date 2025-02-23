import express from 'express'
import { VerifyToken } from '../middlewares/AuthMiddleware.js'
import { verifyAdmin } from '../middlewares/AdminMiddleware.js'
import { EventController } from '../controllers/EventController.js'
import upload from '../config/multer.js'
import { UserController } from '../controllers/UserController.js'
import { AdminController } from '../controllers/AdminController.js'

const router = express.Router()

router.get('/events', VerifyToken, verifyAdmin, EventController.ObtainAdminEvents)
router.get('/users', VerifyToken, verifyAdmin, UserController.getUsersByFilter)
router.get('/messages', VerifyToken, verifyAdmin, AdminController.getAdminMessages)
router.get('/overview', VerifyToken, verifyAdmin, AdminController.getOverviewStats)

router.post('/event', VerifyToken, verifyAdmin, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]), EventController.createNewEvent)
router.post('/message', VerifyToken, verifyAdmin, AdminController.addNewAdminMessage)

router.put('/user/:id', VerifyToken, verifyAdmin, UserController.updateUserWadmin)
router.put('/event/:id', VerifyToken, verifyAdmin, EventController.updateEvent)

router.delete('/user/:id', VerifyToken, verifyAdmin, UserController.deleteUserWadmin)
router.delete('/event/:id', VerifyToken, verifyAdmin, EventController.deleteEvent)

export default router