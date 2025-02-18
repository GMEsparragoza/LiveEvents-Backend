import mongoose from "mongoose";

const eventRegistrationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    payment_status: { 
        type: String, 
        enum: ['pending', 'paid', 'failed'], 
        default: 'pending' 
    },
    registration_date: { type: Date, default: Date.now },
    confirmed: { type: Boolean, default: false },  // Indica si la inscripción fue confirmada
});

export default mongoose.model('EventRegistration', eventRegistrationSchema)