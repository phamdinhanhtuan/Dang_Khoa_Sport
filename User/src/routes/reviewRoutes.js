const express = require('express');
const reviewController = require('../controllers/reviewController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.route('/')
    .get(reviewController.getAllReviews)
    .post(protect, restrictTo('user', 'admin'), reviewController.createReview);

module.exports = router;
