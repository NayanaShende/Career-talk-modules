const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

router.post('/send', chatController.sendMessage);
router.get('/messages/:userId/:expertId', chatController.getMessages);      // ✅ fixed
router.get('/conversations/:userId', chatController.getConversations);
module.exports = router;