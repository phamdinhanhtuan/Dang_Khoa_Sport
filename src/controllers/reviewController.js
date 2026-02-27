const reviewService = require('../services/reviewService');
const catchAsync = require('../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.productId) filter = { product: req.params.productId };

    const reviews = await reviewService.getAllReviews(filter);

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

    const newReview = await reviewService.createReview(req.body, req.user);

    res.status(201).json({
        status: 'success',
        data: {
            review: newReview
        }
    });
});
