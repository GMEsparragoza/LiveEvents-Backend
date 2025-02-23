import mongoose from "mongoose";

const ActivityLogSchema = new mongoose.Schema({
    userID: {
        type: String,
        ref: "Users", // Hace referencia al modelo de usuario
        required: true,
    },
    action: {
        type: String,
        required: true,
        enum: [
            "LOGIN",
            "LOGOUT",
            "PASSWORD_CHANGE",
            "PROFILE_UPDATE",
            "EVENT_CREATED",
            "EVENT_UPDATED",
            "EVENT_DELETED",
            "EVENT_REGISTRATION",
            "EVENT_DEREGISTERED",
            "USER_DATA_UPDATED",
            "USER_ELIMINATED",
            "PAYMENT_METHOD_UPDATED",
        ], // Define los tipos de acciones posibles
    },
    details: {
        type: String, // Información adicional sobre la acción (ejemplo: "Email cambiado de X a Y")
        default: "",
    },
    ipAddress: {
        type: String, // Guarda la IP del usuario si es necesario
    },
    userAgent: {
        type: String, // Guarda información del navegador/dispositivo
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("ActivityLog", ActivityLogSchema);