const express = require('express');
const productController = require('../controllers/productController');
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// Public
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);

// Admin Only
router.post('/', protect, admin, adminController.createProduct);
router.put('/:id', protect, admin, adminController.updateProduct);
router.delete('/:id', protect, admin, adminController.deleteProduct);

module.exports = router;
