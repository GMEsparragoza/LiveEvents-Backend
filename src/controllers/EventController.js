import Event from '../models/Events.js'
import { uploadToCloudinary } from '../services/CloudinaryService.js'
import mongoose from 'mongoose'

const ObtainEvents = async (req, res) => {
    const { filter } = req.query;
    try {
        let query = {};
        const now = new Date();

        if (filter === "completeds") {
            // Eventos pasados
            query.date = { $lt: now };
        } else if (filter === "upcomings") {
            // Eventos futuros
            query.date = { $gt: now };
        }

        // Se ordenan los eventos de los más recientes a los más antiguos.
        const events = await Event.find(query).sort({ date: -1 });
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: error.message, error: 'Error obtaining Events' })
    }
}

const createNewEvent = async (req, res) => {
    const eventData = JSON.parse(req.body.eventData)
    const { id } = req.user;
    try {
        const imageURL = await uploadToCloudinary(req.file.buffer)

        const newEvent = new Event({
            tittle: eventData.tittle,
            description: eventData.description,
            date: eventData.date,
            location: eventData.location,
            imageURL,
            price: eventData?.price || 0,
            createdBy: new mongoose.Types.ObjectId(id)
        })
        await newEvent.save();

        res.status(201).json({ message: 'Event Created Successfully', event: newEvent })
    } catch (error) {
        console.error('Error saving Event:', error);
        res.status(500).json({ message: "Error creating Event", error: error.message || error });
    }
}

const updateEvent = async (req, res) => {
    const { id } = req.params;
    const { data } = req.body
    try {
        const existingEvent = await Event.findById(id)
        if(!existingEvent) {
            res.status(404).json({ message: 'Event Not Found' })
        }

        data?.tittle && (existingEvent.tittle = data.tittle);
        data?.description && (existingEvent.description = data.description)
        data?.date && (existingEvent.date = data.date);
        data?.location && (existingEvent.location = data.location);
        data?.price && (existingEvent.price = data.price);

        await existingEvent.save();

        res.status(200).json({ message: 'Event Updated successfully', event: existingEvent })
    } catch (error) {
        console.error('Error: ', error.message)
        res.status(500).json({ message: 'Error trying to update Event', error: error.message })
    }
}

const deleteEvent = async (req, res) => {
    const { id } = req.params;
    try {
        const eliminatedEvent = await Event.findByIdAndDelete(id)
        if(!eliminatedEvent) {
            res.status(404).json({ message: 'Event Not Found' })
        }

        res.status(200).json({ message: 'Event eliminated successfully', deleteEvent: eliminatedEvent })
    } catch (error) {
        res.status(500).json({ message: 'Error trying to Delete Event', error: error.message })
    }
}

export const EventController = {
    ObtainEvents,
    createNewEvent,
    updateEvent,
    deleteEvent
}