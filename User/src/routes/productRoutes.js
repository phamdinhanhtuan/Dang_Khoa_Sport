const express = require('express');
const productController = require('../controllers/productController');
const productAdminController = require('../controllers/productAdminController');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

console.log('ProductController:', productController);
console.log('ProductAdminController:', productAdminController);
console.log('Protect:', protect);
console.log('Admin:', admin);

const router = express.Router();

// Public
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);

// Admin Only
// Note: These are API routes usually used by frontend frameworks or mobile apps.
// The web-based admin panel we built uses /admin/products routes defined in adminRoutes.js.
// However, we keep these for compatibility or API usage.
router.post('/', protect, admin, productAdminController.createProduct);
router.put('/:id', protect, admin, productAdminController.updateProduct);
router.delete('/:id', protect, admin, productAdminController.deleteProduct);

module.exports = router;
