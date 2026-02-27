const cartService = require('../services/cartService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get Cart
exports.getCart = catchAsync(async (req, res, next) => {
    const cart = await cartService.getCart(req.user._id);

    res.render('shop/cart', {
        pageTitle: 'Giỏ hàng',
        cart,
        recommendations: cart.recommendations || []
    });
});

// Apply Coupon
exports.applyCoupon = catchAsync(async (req, res, next) => {
    const { code } = req.body;
    await cartService.applyCoupon(req.user._id, code);
    res.redirect('/cart');
});

// Add to Cart
exports.addToCart = catchAsync(async (req, res, next) => {
    try {
        await cartService.addToCart(req.user._id, req.body);
        res.redirect('/cart');
    } catch (err) {
        // Handle specific business errors (like out of stock) by redirecting with msg
        if (err.statusCode === 400 && err.message.includes('hết hàng')) {
            return res.redirect(`/products/${req.body.productId}?error=Sản phẩm đã hết hàng`);
        }
        throw err;
    }
});

// Remove from Cart
exports.removeFromCart = catchAsync(async (req, res, next) => {
    const { itemId } = req.body;
    await cartService.removeFromCart(req.user._id, itemId);
    res.redirect('/cart');
});

// Update Item Qty (if endpoint exists/used)
exports.updateCartItem = catchAsync(async (req, res, next) => {
    const { itemId, quantity } = req.body;
    await cartService.updateItemQuantity(req.user._id, itemId, quantity);
    res.redirect('/cart');
});

// Clear Cart
exports.clearCart = catchAsync(async (req, res, next) => {
    await cartService.clearCart(req.user._id);
    res.redirect('/cart');
});

