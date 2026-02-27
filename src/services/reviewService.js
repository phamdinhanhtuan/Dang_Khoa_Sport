const Review = require('../models/Review');
const Order = require('../models/Order');
const AppError = require('../utils/appError');

class ReviewService {
    async getAllReviews(filter = {}) {
        return await Review.find(filter);
    }

    async createReview(data, user) {
        // Optional: Check if user purchased the product
        /*
        const hasPurchased = await Order.findOne({ 
            user: user.id, 
            'items.product._id': data.product,
            status: 'completed' 
        });
        if (!hasPurchased && user.role !== 'admin') {
            throw new AppError('You must purchase this product to review it.', 403);
        }
        */

        return await Review.create(data);
    }
}

module.exports = new ReviewService();
