import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    tittle: { type: String },
    message: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    type: { type: String, Enum: ['message', 'notification'], required: true },
    notification: { type: String, Enum: ['info', 'warning', 'error'] },
    date: { type: Date, default: Date.now }
}, { timestamps: true })

export default mongoose.model('Notifications', notificationSchema)