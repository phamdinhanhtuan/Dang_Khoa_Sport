const express = require('express');
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// Protect all admin routes
router.use(protect);
router.use(admin);

// Orders
router.get('/orders', adminController.getAllOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);

// Products (API Management)
// Note: Frontend likely calls /api/products, but Prompt asked for /api/products in Admin APIs section.
// Usually REST would be POST /api/products (protected).
// I will mount this router as /api/admin... but Product routes requested are /api/products.
// So I won't put Product routes HERE if they are mounted at /api/admin.
// I'll put Order Management here. productRoutes.js handles Products.
// BUT Prompt listed "Routes: POST /api/products - Create product (admin only) ...".
// This implies `routes/productRoutes.js` should handle it.
// I will keep `adminRoutes` focused on Order Management and Admin specific aggregations if any.
// Actually, `adminController` has `createProduct`.
// I will export router logic for products? NO.
// I'll stick to the Requested Output Files list. It listed `routes/adminRoutes.js`.
// It listed "Admin APIs" section.
// I'll put the *pure* admin routes here.

// If I mount this at /api/admin:
// GET /api/admin/orders -> Works.
// PUT /api/admin/orders/:id/status -> Works.

module.exports = router;
