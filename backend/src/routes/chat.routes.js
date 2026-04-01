const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");
 
router.post("/send", chatController.sendMessage);
router.get("/messages/:userId/:expertId", chatController.getMessages);
 
// ✅ IMPORTANT: expert route MUST come before :userId route
router.get("/conversations/expert/:expertId", chatController.getExpertConversations);
router.get("/conversations/:userId", chatController.getConversations);
 
// ✅ Delete routes
router.post("/delete/message", chatController.deleteMessage);
router.post("/delete/conversation", chatController.deleteConversation);
 
// ✅ Mark messages as seen
router.post("/seen", chatController.markSeen);
 
module.exports = router;