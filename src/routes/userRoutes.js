const express = require('express');
const authController = require('../controllers/authController');
const { validateSignup, validateLogin } = require('../validators/authValidator');

const router = express.Router();

router.post('/signup', validateSignup, authController.signup);
router.post('/login', validateLogin, authController.login);
router.get('/logout', authController.logout);

const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth'); // Check if middleware/auth exposes protect

// ... existing routes ...

// Protected Routes
router.use(protect);

router.post('/wishlist', userController.toggleWishlist);
router.get('/wishlist', userController.getWishlist);

module.exports = router;
