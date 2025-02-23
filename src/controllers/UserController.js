import User from '../models/Users.js'
import Event from '../models/Events.js'
import ActivityLog from '../models/ActivityLog.js';
import { uploadToCloudinary } from '../services/CloudinaryService.js'
import logActivity from '../services/ActivityLogService.js'
import bcrypt from 'bcryptjs'

const getUsersByFilter = async (req, res) => {
    try {
        const { filter } = req.query;
        const users = await User.find({
            username: { $regex: filter, $options: "i" } // "i" para case insensitive
        });

        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching Users:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const updateUserWadmin = async (req, res) => {
    const { id } = req.params;
    const adminID = req.user.id
    const { data } = req.body
    try {
        if (id === adminID) {
            return res.status(400).json({ message: 'You cannot update your own user' })
        }
        const existingUser = await User.findById(id)
        if (!existingUser) {
            res.status(404).json({ message: 'User not found' })
        }

        if (data.username) {
            existingUser.username = data.username
        }
        if (data.email) {
            existingUser.email = data.email
        }
        existingUser.role = data.role
        await existingUser.save();

        await logActivity(
            adminID, // ID del usuario
            "USER_DATA_UPDATED",
            `${existingUser.username} user data has been updated`,
            req // Pasamos la petición para extraer IP y User-Agent
        );

        res.status(200).json({ message: 'User data updated successfully', user: existingUser })
    } catch (error) {
        console.error("Error updating Users:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

const deleteUserWadmin = async (req, res) => {
    const { id } = req.params;
    const adminID = req.user.id
    try {
        if (id === adminID) {
            return res.status(400).json({ message: 'You cannot delete your own user' })
        }
        const eliminatedUser = await User.findByIdAndDelete(id);

        if (!eliminatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        await logActivity(
            adminID, // ID del usuario
            "USER_ELIMINATED",
            `User ${eliminatedUser.username} has been deleted`,
            req // Pasamos la petición para extraer IP y User-Agent
        );

        res.status(200).json({ message: 'User Deleted Succesfully', deleteUser: eliminatedUser })
    } catch (error) {
        res.status(500).json({ message: 'Error trying to Delete User', error: error.message })
    }
}

const updateUserData = async (req, res) => {
    const { id } = req.user
    const userImage = req.file
    const bodyData = req.body.userData;
    let userData = {}
    if (bodyData) {
        userData = JSON.parse(bodyData)
    }
    try {
        const existingUser = await User.findById(id)
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' })
        }

        if (userData?.username && userData?.username !== existingUser.username) {
            const usernameExist = await User.find({ username: userData?.username })
            if (usernameExist) {
                return res.status(400).json({ message: 'The username is in use' })
            }
            existingUser.username = userData?.username;
        }

        if (userImage) {
            const imageURL = await uploadToCloudinary(userImage?.buffer)
            existingUser.imageURL = imageURL
        }

        userData?.name && (existingUser.name = userData?.name)
        userData?.lastname && (existingUser.lastname = userData?.lastname)

        await existingUser.save();

        await logActivity(
            id, // ID del usuario
            "PROFILE_UPDATE",
            `Updated User Profile Data`,
            req // Pasamos la petición para extraer IP y User-Agent
        );

        res.status(200).json({ message: 'User data updated successfully', user: existingUser })
    } catch (error) {
        res.status(500).json({ message: 'Error trying to update user data', error: error.message })
    }
}

const updateUserPassword = async (req, res) => {
    const { id } = req.user
    const { newPassword, password } = req.body
    try {
        const existingUser = await User.findById(id)
        if(!existingUser) {
            return res.status(404).json({ message: 'User Not Found' })
        }

        const passwordValid = await bcrypt.compare(password, existingUser.password);
        if(!passwordValid) {
            return res.status(403).json({ message: 'Incorrect Password' })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12)
        existingUser.password = hashedPassword
        await existingUser.save()

        await logActivity(
            id, // ID del usuario
            "PASSWORD_CHANGE",
            `User password updated`,
            req // Pasamos la petición para extraer IP y User-Agent
        );

        res.status(200).json({ message: 'Password updated successfully' })
    } catch (error) {
        res.status(500).json({ message: 'Error trying to change user password', error: error?.message })
    }
}

const ObtainActivityLogsUser = async (req, res) => {
    const { id } = req.user
    try {
        const userLogs = await ActivityLog.find({ userID: id }).sort({ createdAt: -1 })
        res.status(200).json(userLogs)
    } catch (error) {
        res.status(500).json({ message: 'Error trying to obtain user logs' })
    }
}

const ObtainCreatedUserEvents = async (req, res) => {
    const { id } = req.user
    try {
        const events = await Event.find({ createdBy: id })

        res.status(200).json(events)
    } catch (error) {
        res.status(500).json({ message: 'Error trying to obtain user events' })
    }
}

export const UserController = {
    getUsersByFilter,
    updateUserWadmin,
    deleteUserWadmin,
    updateUserData,
    updateUserPassword,
    ObtainActivityLogsUser,
    ObtainCreatedUserEvents
}