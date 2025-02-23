import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },  // Usuario que envió el mensaje
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Events', required: true }, // Evento al que pertenece el mensaje
    content: { type: String, required: true },  // Contenido del mensaje
    sent_at: { type: Date, default: Date.now },  // Fecha y hora en que se envió el mensaje
});

export default mongoose.model('Message', messageSchema);