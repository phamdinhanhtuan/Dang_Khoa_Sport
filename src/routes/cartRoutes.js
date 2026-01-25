const express = require('express');
const cartController = require('../controllers/cartController');
const { isLoggedIn } = require('../middleware/auth');

const router = express.Router();

// router.use(isLoggedIn);

router.route('/')
    .get(cartController.getCart)
    .post(cartController.addToCart);

router.delete('/clear', cartController.clearCart);

router.route('/:productId')
    .put(cartController.updateCartItem)
    .delete(cartController.removeFromCart);

module.exports = router;
