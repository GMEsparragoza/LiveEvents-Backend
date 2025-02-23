import express from 'express'
import { EventController } from '../controllers/EventController.js'

const router = express.Router()

router.get('/', EventController.ObtainPublicsEvents)
router.get('/reduced', EventController.ObtainPublicsReducedEvents)
router.get('/:id', EventController.ObtainEventDetails)

export default router