import express from 'express'
import { EventController } from '../controllers/EventController.js'

const router = express.Router()

router.get('/', EventController.ObtainPublicsEvents)

export default router