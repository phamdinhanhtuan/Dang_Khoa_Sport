const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                default: 1,
                min: 1
            },
            color: String,
            size: String,
            price: Number
        }
    ],
    coupon: {
        code: {
            type: String,
            default: null
        },
        discount: {
            type: Number, // Percentage, e.g. 10 for 10%
            default: 0
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Cart', cartSchema);
