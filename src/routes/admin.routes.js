const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

// Middleware to ensure only admins can access these routes
router.use(protect);
router.use(restrictTo('admin'));

// Dashboard
router.get('/', adminController.getDashboard);

// Product Management
router.get('/products', adminController.listProducts);
router.get('/products/new', adminController.getProductForm);
router.get('/products/:id/edit', adminController.getProductForm);

// Handle multiple uploads: 'image' for main, 'galleryImages' for others
const productUpload = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 }
]);

router.post('/products', productUpload, adminController.createProduct);
router.post('/products/:id', productUpload, adminController.updateProduct); // Update
router.get('/products/:id/delete', adminController.deleteProduct); // Soft delete

// Category Management
router.get('/categories', adminController.listCategories);
router.get('/categories/new', adminController.getCategoryForm);
router.get('/categories/seed', adminController.seedCategories);
router.get('/categories/:id/edit', adminController.getCategoryForm);
router.post('/categories', adminController.createCategory);
router.post('/categories/:id', adminController.updateCategory);
router.get('/categories/:id/delete', adminController.deleteCategory);

// Order Management
router.get('/orders', adminController.listOrders);
router.get('/orders/:id', adminController.getOrderDetail);
router.post('/orders/:id/status', adminController.updateOrderStatus);

// User Management
router.get('/users', adminController.listUsers);
router.get('/users/:id/delete', adminController.deleteUser);

module.exports = router;
