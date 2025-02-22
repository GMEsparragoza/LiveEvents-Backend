import express from 'express'
import cors from 'cors'
import { PORT, FRONTEND_URL } from './config/variables.js'
import { connectDB } from './config/database.js'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import AuthRoutes from './routes/AuthRoutes.js'
import AdminRoutes from './routes/AdminRoutes.js'
import EventRoutes from './routes/EventRoutes.js'

const app = express()

connectDB()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'autorization'],
    credentials: true
}))

const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 Minuto
    max: 25, // Máximo de 100 peticiones por IP
    handler: (req, res) => {
        res.status(429).json({ message: "Too many requests, please try again later" });
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/auth', apiLimiter, AuthRoutes)

app.use('/api/admin', AdminRoutes)

app.use('/api/event', EventRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})