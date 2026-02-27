const express = require('express');
const router = express.Router();

const chatbotController = require('../controllers/chatbotController');

// Chat Processing Endpoint
router.post('/ask', chatbotController.ask);

module.exports = router;
