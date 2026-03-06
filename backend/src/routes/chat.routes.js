const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

router.post('/send', chatController.sendMessage);
router.get('/:userId/:expertId', chatController.getConversation);

module.exports = router;