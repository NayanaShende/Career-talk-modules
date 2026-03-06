const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

router.post('/send', chatController.sendMessage);
router.get('/messages/:userId/:expertId', chatController.getConversation);
router.get('/conversations/:userId', chatController.getConversations); // ✅ NEW

module.exports = router;