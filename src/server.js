import express from 'express'
import cors from 'cors'
import http from 'http'
import { PORT, FRONTEND_URL, NODE_ENV } from './config/variables.js'
import { connectDB } from './config/database.js'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import AuthRoutes from './routes/AuthRoutes.js'
import AdminRoutes from './routes/AdminRoutes.js'
import EventRoutes from './routes/EventRoutes.js'
import ProfileRoutes from './routes/ProfileRoutes.js'
import { Server as SocketIOServer } from "socket.io";
import Message from "./models/Messages.js";
import mongoose from 'mongoose'

const app = express()

connectDB()

export const server = http.createServer(app);

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'authorization'],
    credentials: true
}))

const io = new SocketIOServer(server, {
    cors: {
        origin: FRONTEND_URL, 
        methods: ["GET", "POST"],
        credentials: true
    },
    secure: NODE_ENV === 'production',
    transports: ['websocket', 'polling']
});

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

app.use('/api/profile', ProfileRoutes)

// Manejo de conexiones con Socket.io
io.on("connection", (socket) => {
    console.log(`Servidor de Socket.io conectado: ${socket.id}`)
    // Al conectarse, enviar el historial de mensajes del evento específico
    socket.on('joinEvent', (eventId) => {
        Message.find({ event: eventId })  // Filtra por el evento específico
            .sort({ sent_at: 1 })
            .populate('user', 'username role')  // Incluye el rol del usuario
            .populate('event', 'tittle')
            .then((messages) => {
                socket.emit("chatHistory", messages);
            })
            .catch((err) => console.error("Error al obtener el historial:", err));
    });

    // Escuchar el evento 'chatMessage' enviado por el cliente
    socket.on("chatMessage", async (messageData) => {
        try {
            const newMessage = new Message({
                user: new mongoose.Types.ObjectId(messageData.user),
                event: new mongoose.Types.ObjectId(messageData.event),
                content: messageData.content,
                // sent_at se asigna automáticamente por el default
            });
            await newMessage.save();

            // Opcional: si deseas enviar información adicional, puedes poblar el mensaje
            const populatedMessage = await Message.findById(newMessage._id)
                .populate('user', 'username role')
                .populate('event', 'tittle');

            // Emitir el nuevo mensaje a todos los clientes conectados
            io.emit("chatMessage", populatedMessage);
        } catch (error) {
            console.error("Error al guardar el mensaje:", error);
            // Enviar un mensaje de error solo al cliente que envió el mensaje
            socket.emit("messageError", { error: "Error saving message" });
        }
    });

    // Manejar la desconexión del cliente
    socket.on("disconnect", () => {
        console.log("Cliente desconectado:", socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})