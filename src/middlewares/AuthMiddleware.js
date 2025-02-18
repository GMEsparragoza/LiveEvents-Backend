import jwt from 'jsonwebtoken';
import { JWT_REFRESH_SECRET, JWT_CREDENTIAL_SECRET, NODE_ENV } from '../config/variables.js';

export const VerifyToken = async (req, res, next) => {
    try {
        const accessToken = req.cookies['access_token'];
        if (!accessToken) {
            const refreshToken = req.cookies['refresh_token'];
            if (!refreshToken) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            jwt.verify(refreshToken, JWT_REFRESH_SECRET, (error, RefreshUser) => {
                if (error) {
                    return res.status(401).json({ message: 'User not authenticated' });
                }
                const tokenPayload = {
                    email: RefreshUser.email,
                    id: RefreshUser.id,
                    username: RefreshUser.username,
                    role: RefreshUser.role
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
                req.user = RefreshUser;
                next();
            });
        } else {
            jwt.verify(accessToken, JWT_CREDENTIAL_SECRET, (error, decoded) => {
                if (error) {
                    const refreshToken = req.cookies['refresh_token'];
                    if (!refreshToken) {
                        return res.status(401).json({ message: 'User not authenticated' });
                    }
                    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (error, RefreshUser) => {
                        if (error) {
                            return res.status(401).json({ message: 'User not authenticated' });
                        }
                        const tokenPayload = {
                            email: RefreshUser.email,
                            id: RefreshUser.id,
                            username: RefreshUser.username,
                            role: RefreshUser.role
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
                        req.user = RefreshUser;
                        next();
                    });
                }
                req.user = decoded;
                next();
            });
        }
    } catch (error) {
        res.status(401).json({ message: 'Error verifying user session' });
    }
}