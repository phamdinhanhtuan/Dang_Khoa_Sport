const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const productAdminController = require('../controllers/productAdminController');
const orderAdminController = require('../controllers/orderAdminController');
const userAdminController = require('../controllers/userAdminController');

// Dashboard
router.get('/', adminController.getDashboard);

// Products
router.get('/products', productAdminController.getProducts);
router.get('/products/new', productAdminController.getNewProduct);
router.post('/products', productAdminController.createProduct);
router.get('/products/:id/edit', productAdminController.getEditProduct);
router.post('/products/:id', productAdminController.updateProduct);
router.post('/products/:id/delete', productAdminController.deleteProduct);

// Orders
router.get('/orders', orderAdminController.getOrders);
router.get('/orders/:id', orderAdminController.getOrder);
router.post('/orders/:id/status', orderAdminController.updateOrderStatus);

// Users
router.get('/users', userAdminController.getUsers);

module.exports = router;
