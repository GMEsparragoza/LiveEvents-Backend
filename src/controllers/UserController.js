import User from '../models/Users.js'

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

const updateUser = async (req, res) => {
    const { id } = req.params;
    const adminID = req.user.id
    const { data } = req.body
    try {
        if (id === adminID) {
            return res.status(400).json({ message: 'You cannot update your own user' })
        }
        const existingUser = await User.findById(id)
        if(!existingUser) {
            res.status(404).json({ message: 'User not found' })
        }

        if(data.username){
            existingUser.username = data.username
        }
        if(data.email){
            existingUser.email = data.email
        }
        existingUser.role = data.role
        await existingUser.save();

        res.status(200).json({ message: 'User data updated successfully', user: existingUser })
    } catch (error) {
        console.error("Error updating Users:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

const deleteUser = async (req, res) => {
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

        res.status(200).json({ message: 'User Deleted Succesfully', deleteUser: eliminatedUser })
    } catch (error) {
        res.status(500).json({ message: 'Error trying to Delete User', error: error.message })
    }
}

export const UserController = {
    getUsersByFilter,
    updateUser,
    deleteUser
}