const chatbotService = require('../services/chatbotService');
const User = require('../models/User'); // If needed for decoding extra user info, but Service should handle logic

const chatbotController = {
    ask: async (req, res) => {
        try {
            const { message } = req.body;

            // If user is logged in, pass user object to service
            let user = req.user;

            // If not logged in but session has user
            if (!user && req.session && req.session.user) {
                user = req.session.user;
            }

            const reply = await chatbotService.processMessage(message, user);

            res.status(200).json({
                status: 'success',
                message: reply
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: 'error', message: 'Lỗi hệ thống' });
        }
    }
};

// --- HELPERS ---
function matches(text, keywords) {
    return keywords.some(kw => text.includes(kw));
}

function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

module.exports = chatbotController;
