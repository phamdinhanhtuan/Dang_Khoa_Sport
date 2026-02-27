const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/auth'); // Re-use auth middleware

// --- PUBLIC ROUTES ---
router.get('/', productController.getHomePage);
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductDetail);

// --- PROTECTED ROUTES ---
router.use(protect);

// Cart
router.get('/cart', cartController.getCart);
router.post('/cart/add', cartController.addToCart);
router.post('/cart/remove', cartController.removeFromCart);

// Checkout & Orders
router.get('/checkout', orderController.getCheckout);
router.post('/checkout', orderController.postCheckout);
router.get('/orders', orderController.getMyOrders);
router.get('/orders/:id', orderController.getOrderDetail);

module.exports = router;
