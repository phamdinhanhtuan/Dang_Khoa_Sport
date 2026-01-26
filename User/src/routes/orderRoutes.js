const express = require('express');
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/auth'); // Updated path

const router = express.Router();

router.use(protect);

router.post('/', orderController.createOrder);
router.get('/my', orderController.getMyOrders);
// router.get('/success', orderController.getOrderSuccess); // Moved to viewRoutes
router.get('/:id', orderController.getOrderById);

// Admin Routes are in adminRoutes.js

module.exports = router;
