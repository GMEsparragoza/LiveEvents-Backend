import mongoose from 'mongoose';
import Notification from '../models/Notifications.js'
import User from '../models/Users.js'
import Event from '../models/Events.js'

const getAdminMessages = async (req, res) => {
    try {
        const messagesAndNotifications = await Notification.find()
        if (!messagesAndNotifications) {
            return res.status(404).json({ message: 'Messages or Notifications not Found' })
        }

        res.status(200).json(messagesAndNotifications)
    } catch (error) {
        console.error('Error: ', error.message)
        res.status(500).json({ message: 'Error trying to obtain messages', error: error.message })
    }
}

const addNewAdminMessage = async (req, res) => {
    const { newMessage } = req.body;
    const { id } = req.user;
    try {
        const Message = new Notification({
            message: newMessage,
            createdBy: new mongoose.Types.ObjectId(id),
            type: 'message'
        })
        await Message.save()

        res.status(200).json({ message: 'New Message added successfully', newMessage: Message })
    } catch (error) {
        console.error('Error: ', error.message)
        res.status(500).json({ message: 'Error trying to save the new message', error: error.message })
    }
}

const getOverviewStats = async (req, res) => {
    try {
        // Total de usuarios
        const totalUsers = await User.countDocuments();

        // Próximos eventos: aquellos cuya fecha es mayor o igual a la fecha actual.
        const upcomingEvents = await Event.find({ date: { $gte: new Date() } }).sort({ date: 1 });

        // Nuevos usuarios registrados recientemente (últimos 30 días)
        const recentThreshold = new Date();
        recentThreshold.setDate(recentThreshold.getDate() - 30);
        const recentUsers = await User.find({ createdAt: { $gte: recentThreshold } });

        return res.status(200).json({
            totalUsers,
            upcomingEvents,
            recentUsers,
        });
    } catch (error) {
        console.error('Error: ', error.message);
        res.status(500).json({ message: 'Error trying to obtain overview data', error: error.message });
    }
};


export const AdminController = {
    getAdminMessages,
    addNewAdminMessage,
    getOverviewStats
}