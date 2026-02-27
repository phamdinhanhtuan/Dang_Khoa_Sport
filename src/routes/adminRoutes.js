const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const userAdminController = require('../controllers/userAdminController');
const orderAdminController = require('../controllers/orderAdminController');
const productAdminController = require('../controllers/productAdminController');
const categoryAdminController = require('../controllers/categoryAdminController');
const upload = require('../middleware/uploadMiddleware');
const { protect, restrictTo } = require('../middleware/auth');

// Public: Admin Login Page
router.get('/login', adminController.getLogin);

// Protected: All routes below this reside behind authentication & admin check
router.use(protect);
router.use(restrictTo('admin'));

// Dashboard
router.get('/', adminController.getDashboard);

// Users Management
router.get('/users', userAdminController.getUsers);
router.post('/users/:id/delete', userAdminController.deleteUser); // Ideally DELETE, but HTML forms use POST
router.get('/users/:id/delete', userAdminController.deleteUser); // Fallback for link-based delete

// Orders Management
router.get('/orders', orderAdminController.getOrders);
router.get('/orders/:id', orderAdminController.getOrder);
router.post('/orders/:id', orderAdminController.updateOrderStatus);

// Categories Management
router.get('/categories', categoryAdminController.getAllCategories);
router.get('/categories/new', categoryAdminController.getNewCategoryForm);
router.post('/categories', categoryAdminController.createCategory);
router.get('/categories/:id/edit', categoryAdminController.getEditCategoryForm);
router.post('/categories/:id', categoryAdminController.updateCategory);
router.get('/categories/:id/delete', categoryAdminController.deleteCategory);

// Products Management
router.get('/products', productAdminController.getAllProducts);
router.get('/products/new', productAdminController.getNewProductForm);
router.post('/products', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'galleryImages', maxCount: 10 }]), productAdminController.createProduct);
router.get('/products/:id/edit', productAdminController.getEditProductForm);
router.post('/products/:id', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'galleryImages', maxCount: 10 }]), productAdminController.updateProduct);
router.get('/products/:id/delete', productAdminController.deleteProduct);
// Seed Categories
router.get('/categories/seed', categoryAdminController.seedCategories);

module.exports = router;
