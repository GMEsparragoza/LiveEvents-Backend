import User from '../models/Users.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_REFRESH_SECRET, JWT_CREDENTIAL_SECRET, NODE_ENV } from '../config/variables.js';
import { sendResetPasswordEmail } from './EmailController.js';

const RegisterUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'The email is already registered' });
        }
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: 'The username is already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'Registration was successful' });
    } catch (error) {
        res.status(500).json({ message: error.message, error: 'Error trying to register user' });
    }
}

const LoginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Incorrect password' });
        }
        const tokenPayload = {
            email: existingUser.email,
            id: existingUser._id,
            username: existingUser.username,
            role: existingUser.role
        }

        const accessToken = jwt.sign(tokenPayload, JWT_CREDENTIAL_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign(tokenPayload, JWT_REFRESH_SECRET, { expiresIn: '7d' });

        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: NODE_ENV === 'production',
            sameSite: NODE_ENV === 'production' ? 'None' : 'Lax',
            maxAge: 15 * 60 * 1000
        });
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: NODE_ENV === 'production',
            sameSite: NODE_ENV === 'production' ? 'None' : 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ message: error.message, error: 'Error trying to login user' });
    }
}

const AuthSession = async (req, res) => {
    const user = req.user;
    try {
        const existingUser = await User.findById(user.id);
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        const UserData = {
            id: existingUser._id,
            username: existingUser.username,
            email: existingUser.email,
            role: existingUser.role,
            createdAt: existingUser.createdAt,
            updatedAt: existingUser.updatedAt,
            imageURL: existingUser.imageURL,
            name: existingUser.name,
            lastname: existingUser.lastname
        }
        res.status(200).json({ user: UserData });
    } catch (error) {
        res.status(500).json({ message: error.message, error: 'Error trying to get user session' });
    }
}

const resetUserPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const code = Math.floor(100000 + Math.random() * 900000);
        existingUser.oobCode = code;
        await existingUser.save();

        await sendResetPasswordEmail(email, existingUser._id, code)

        res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
        res.status(500).json({ message: error.message, error: 'Error trying to reset password' });
    }
}

const ResetPassword = async (req, res) => {
    const { userID, oobCode } = req.params;
    const { password } = req.body;
    try {
        const existingUser = await User.findById(userID);
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (existingUser.oobCode !== oobCode) {
            return res.status(400).json({ message: 'The Link is not valid' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        existingUser.password = hashedPassword;
        existingUser.oobCode = '';
        await existingUser.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: error.message, error: 'Error trying to reset password' });
    }
}

const logOutSession = async (req, res) => {
    try {
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: NODE_ENV === 'production',
            sameSite: NODE_ENV === 'production' ? 'None' : 'Lax'
        });
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: NODE_ENV === 'production',
            sameSite: NODE_ENV === 'production' ? 'None' : 'Lax'
        });
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ message: error.message, error: 'Error trying to logout user' });
    }
}

export const AuthController = {
    RegisterUser,
    LoginUser,
    AuthSession,
    resetUserPassword,
    ResetPassword,
    logOutSession
}