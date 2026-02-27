const userService = require('../services/userService');
const catchAsync = require('../utils/catchAsync');

exports.toggleWishlist = catchAsync(async (req, res, next) => {
    const { productId } = req.body;
    const result = await userService.toggleWishlist(req.user.id, productId);

    res.status(200).json({
        status: 'success',
        action: result.action,
        wishlist: result.wishlist
    });
});

exports.getWishlist = catchAsync(async (req, res, next) => {
    const wishlist = await userService.getWishlist(req.user.id);

    res.status(200).json({
        status: 'success',
        wishlist
    });
});
