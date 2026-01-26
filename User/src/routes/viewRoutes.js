const express = require('express');
const viewController = require('../controllers/viewController');
const productController = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/auth'); // Updated

const router = express.Router();

router.get('/', viewController.getHome);
router.get('/shop', viewController.getShop);
router.get('/orders/success', protect, viewController.getOrderSuccess);
router.get('/product/:id', viewController.getProductDetail);
router.get('/login', viewController.getLogin);
router.get('/signup', viewController.getSignup);
router.get('/forgot-password', viewController.getForgotPassword);
router.get('/checkout', protect, viewController.getCheckout);
router.get('/wishlist', protect, viewController.getWishlist);

router.get('/lang/:locale', (req, res) => {
    const { locale } = req.params;
    res.cookie('lang', locale, { maxAge: 900000, httpOnly: true });
    res.redirect(req.get('Referer') || '/');
});

// Admin Routes (View based)
router.get('/admin', protect, restrictTo('admin'), viewController.getAdminDashboard);
router.get('/admin/products', protect, restrictTo('admin'), viewController.getAdminProducts);
router.get('/admin/products/add', protect, restrictTo('admin'), productController.getAdminProductForm);
router.get('/admin/products/edit/:id', protect, restrictTo('admin'), productController.getAdminEditProductForm);

module.exports = router;
