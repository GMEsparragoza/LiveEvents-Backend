import mongoose from 'mongoose'

const usersSchema = new mongoose.Schema({
    name: { type: String },
    lastname: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    role: { type: String, required: true, Enum: ['admin', 'user'], default: 'user' },
    imageURL: { type: String },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true })

export default mongoose.model('Users', usersSchema)