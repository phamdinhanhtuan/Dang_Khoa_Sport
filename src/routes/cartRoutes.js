const express = require('express');
const cartController = require('../controllers/cartController');
const { isLoggedIn } = require('../middleware/auth');

const router = express.Router();

// router.use(isLoggedIn);

router.post('/add', cartController.addToCart); // Explicit add route if needed, usually / is fine but /add is clearer
router.post('/update', cartController.updateCartItem);
router.post('/remove', cartController.removeFromCart);

router.get('/', cartController.getCart);
// router.post('/', cartController.addToCart); // Keep compat if needed


module.exports = router;
