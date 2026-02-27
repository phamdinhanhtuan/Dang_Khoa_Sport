const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            product: {
                type: Object, // Snapshot
                required: true
            },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            color: String,
            size: String
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'shipped', 'completed', 'cancelled'],
        default: 'pending'
    },
    shippingAddress: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        addressLine: { type: String, required: true },
        city: { type: String, required: true },
        province: { type: String, required: true },
        note: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
