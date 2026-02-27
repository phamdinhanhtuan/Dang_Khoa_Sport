const express = require('express');
const productController = require('../controllers/productController');
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Public
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);

// Admin Only
router.post('/', protect, restrictTo('admin'), productController.createProduct);
router.put('/:id', protect, restrictTo('admin'), productController.updateProduct);
router.delete('/:id', protect, restrictTo('admin'), productController.deleteProduct);

module.exports = router;
