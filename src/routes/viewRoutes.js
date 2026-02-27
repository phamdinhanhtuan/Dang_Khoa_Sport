const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// --- SHARED ROUTES ---
router.get('/lang/:locale', (req, res) => {
    const { locale } = req.params;
    res.cookie('lang', locale, { maxAge: 900000, httpOnly: true });
    res.redirect(req.get('Referer') || '/');
});

// --- AUTH ---
router.get('/login', authController.getLoginForm);
router.post('/login', authController.login);
router.get('/signup', authController.getSignupForm); // Corrected from /register
router.post('/signup', authController.signup);
router.get('/logout', authController.logout);

// --- PUBLIC SHOP UI ---
router.get('/', productController.getHomePage);
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductDetail);

// --- PROTECTED SHOP UI ---
// Cart (View & Actions)
router.get('/cart', protect, cartController.getCart);
router.post('/cart/add', protect, cartController.addToCart);
router.post('/cart/remove', protect, cartController.removeFromCart);
router.post('/cart/apply-coupon', protect, cartController.applyCoupon); // Added Coupon Route

// Checkout
router.get('/checkout', protect, orderController.getCheckout);
router.post('/checkout', protect, orderController.postCheckout);

// Orders
router.get('/orders', protect, orderController.getMyOrders);
router.get('/orders/:id', protect, orderController.getOrderDetail);

module.exports = router;
