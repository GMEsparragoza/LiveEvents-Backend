import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    tittle: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    imageURL: { type: String },
    price: { type: Number, required: true, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true })

export default mongoose.model('Events', eventSchema)