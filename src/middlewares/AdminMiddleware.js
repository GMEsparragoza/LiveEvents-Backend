import User from '../models/Users.js'

export const verifyAdmin = async (req, res, next) => {
    const { id } = req.user;
    try {
        const existingUser = await User.findById(id)
        if(!existingUser){
            return res.status(401).json({ message: 'Error verifying admin session' });
        }

        if(existingUser.role !== 'admin'){
            return res.status(401).json({ message: 'Restricted access! Administrator users only'})
        }

        next()
    } catch (error) {
        res.status(401).json({ message: 'Error verifying admin session' });
    }
}