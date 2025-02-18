import mongoose from 'mongoose'
import { DATABASE_URL } from './variables.js'

export const connectDB = async () => {
    try {
        await mongoose.connect(DATABASE_URL);
        console.log("✅ MongoDB conectado correctamente.");
    } catch (error) {
        console.error("❌ Error al conectar a MongoDB:", error.message);
        process.exit(1); // Forzar cierre si falla la conexión
    }
};