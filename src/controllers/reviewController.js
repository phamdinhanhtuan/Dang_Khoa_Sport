const Review = require('../models/Review');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Order = require('../models/Order');

exports.getAllReviews = catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.productId) filter = { product: req.params.productId };

    const reviews = await Review.find(filter);

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    });
});

exports.createReview = catchAsync(async (req, res, next) => {
    // Allow nested routes
    if (!req.body.product) req.body.product = req.params.productId;
    if (!req.body.user) req.body.user = req.user.id;

    // Optional: Check if user purchased the product
    // const hasPurchased = await Order.findOne({ 
    //     user: req.user.id, 
    //     'items.product._id': req.body.product,
    //     status: 'completed' // or delivered
    // });
    // if (!hasPurchased && req.user.role !== 'admin') {
    //     return next(new AppError('You must purchase this product to review it.', 403));
    // }

    const newReview = await Review.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            review: newReview
        }
    });
});
