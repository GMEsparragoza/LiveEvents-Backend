import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    amount: { type: Number, required: true },
    payment_method: { 
        type: String, 
        enum: ['Stripe', 'Coinbase', 'PayPal'], // Métodos de pago permitidos
        required: true 
    },
    payment_status: { 
        type: String, 
        enum: ['pending', 'completed', 'failed'], 
        default: 'pending'  // Estado del pago
    },
    payment_date: { type: Date, default: Date.now },  // Fecha del pago
    transaction_id: { type: String },
})

export default mongoose.model('Payment', paymentSchema)