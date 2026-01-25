const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.toggleWishlist = catchAsync(async (req, res, next) => {
    const { productId } = req.body;
    let user = await User.findById(req.user.id);

    if (!user) return next(new AppError('User not found', 404));

    const productIndex = user.wishlist.indexOf(productId);

    let action;
    if (productIndex === -1) {
        user.wishlist.push(productId);
        action = 'added';
    } else {
        user.wishlist.splice(productIndex, 1);
        action = 'removed';
    }

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        action,
        wishlist: user.wishlist
    });
});

exports.getWishlist = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).populate('wishlist');

    res.status(200).json({
        status: 'success',
        wishlist: user.wishlist
    });
});
