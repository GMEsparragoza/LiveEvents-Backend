import Event from '../models/Events.js'
import { uploadToCloudinary } from '../services/CloudinaryService.js'
import mongoose from 'mongoose'
import logActivity from '../services/ActivityLogService.js'

const ObtainAdminEvents = async (req, res) => {
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

const ObtainPublicsEvents = async (req, res) => {
    const { page = 1, search, date } = req.query;
    const limit = 10; // Número de resultados por página
    const skip = (page - 1) * limit;

    // Se construye el objeto de consulta dinámicamente
    let query = {};

    // Si se envía un término de búsqueda, se filtra por título o descripción (ignora mayúsculas/minúsculas)
    if (search) {
        query.$or = [
            { description: { $regex: search, $options: 'i' } },
            { title: { $regex: search, $options: 'i' } }
        ];
    }

    // Se define un rango: desde el inicio del día hasta antes del inicio del siguiente.
    if (date) {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        query.date = { $gte: startDate, $lt: endDate };
    }

    try {
        // Se obtienen el total de eventos que cumplen el filtro (para calcular el total de páginas)
        const total = await Event.countDocuments(query);

        // Se obtienen los eventos, ordenándolos de los más recientes a los más antiguos
        const events = await Event.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            events,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: error.message, error: 'Error obtaining Events' });
    }
};

const createNewEvent = async (req, res) => {
    const eventData = JSON.parse(req.body.eventData)
    const { id } = req.user;
    const imageFile = req.files.image ? req.files.image[0] : null;
    const bannerFile = req.files.banner ? req.files.banner[0] : null;
    try {
        let imageURL = null
        let bannerURL = null
        if(imageFile){
            imageURL = await uploadToCloudinary(imageFile?.buffer)
        }
        if(bannerFile) {
            bannerURL = await uploadToCloudinary(bannerFile?.buffer)
        }

        const newEvent = new Event({
            tittle: eventData.tittle,
            description: eventData.description,
            date: eventData.date,
            location: eventData.location,
            imageURL,
            bannerURL,
            price: eventData?.price || 0,
            createdBy: new mongoose.Types.ObjectId(id)
        })
        await newEvent.save();

        await logActivity(
            id, // ID del usuario
            "EVENT_CREATED",
            `The event '${newEvent.tittle}' was created`,
            req // Pasamos la petición para extraer IP y User-Agent
        );

        res.status(201).json({ message: 'Event Created Successfully', event: newEvent })
    } catch (error) {
        console.error('Error saving Event:', error);
        res.status(500).json({ message: "Error creating Event", error: error.message || error });
    }
}

const updateEvent = async (req, res) => {
    const { id } = req.params;
    const { data } = req.body
    const adminID = req.user.id
    try {
        const existingEvent = await Event.findById(id)
        if (!existingEvent) {
            res.status(404).json({ message: 'Event Not Found' })
        }

        data?.tittle && (existingEvent.tittle = data.tittle);
        data?.description && (existingEvent.description = data.description)
        data?.date && (existingEvent.date = data.date);
        data?.location && (existingEvent.location = data.location);
        data?.price && (existingEvent.price = data.price);

        await existingEvent.save();

        await logActivity(
            adminID, // ID del usuario
            "EVENT_UPDATED",
            `The event '${existingEvent.tittle}' was updated`,
            req // Pasamos la petición para extraer IP y User-Agent
        );

        res.status(200).json({ message: 'Event Updated successfully', event: existingEvent })
    } catch (error) {
        console.error('Error: ', error.message)
        res.status(500).json({ message: 'Error trying to update Event', error: error.message })
    }
}

const deleteEvent = async (req, res) => {
    const { id } = req.params;
    const adminID = req.user.id
    try {
        const eliminatedEvent = await Event.findByIdAndDelete(id)
        if (!eliminatedEvent) {
            res.status(404).json({ message: 'Event Not Found' })
        }

        await logActivity(
            adminID, // ID del usuario
            "EVENT_DELETED",
            `The event '${eliminatedEvent.tittle}' was deleted`,
            req // Pasamos la petición para extraer IP y User-Agent
        );

        res.status(200).json({ message: 'Event eliminated successfully', deleteEvent: eliminatedEvent })
    } catch (error) {
        res.status(500).json({ message: 'Error trying to Delete Event', error: error.message })
    }
}

export const EventController = {
    ObtainAdminEvents,
    ObtainPublicsEvents,
    createNewEvent,
    updateEvent,
    deleteEvent
}