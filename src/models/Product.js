const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide product name'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Please provide product price']
    },
    image: {
        type: String,
        default: 'default-product.jpg'
    },
    images: {
        type: [String],
        default: []
    },
    stock: {
        type: Number,
        default: 0
    },
    description: String,
    brand: String,
    gender: {
        type: String,
        enum: ['male', 'female', 'kid', 'unisex'],
        default: 'unisex'
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category'
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10) / 10 // 4.666666 -> 4.6
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    viewCount: {
        type: Number,
        default: 0
    },
    soldCount: {
        type: Number,
        default: 0
    },
    discountPrice: {
        type: Number,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false,
        select: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual populate
productSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'product',
    localField: '_id'
});

module.exports = mongoose.model('Product', productSchema);
