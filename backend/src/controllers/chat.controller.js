const chatService = require("../services/chat.service");
 
exports.sendMessage = async (req, res) => {
  try {
    const { sender_id, receiver_id, message } = req.body;
    console.log("📨 sendMessage called:", { sender_id, receiver_id });
    const chat = await chatService.createMessage({ sender_id, receiver_id, message });
    return res.json({ success: true, data: chat });
  } catch (error) {
    console.error("sendMessage error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
 
exports.getMessages = async (req, res) => {
  try {
    const { userId, expertId } = req.params;
    const chats = await chatService.getConversation(userId, expertId);
    return res.status(200).json({ success: true, data: chats });
  } catch (error) {
    console.error("getConversation error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
 
// ✅ USER conversations (otherUserId = Expert)
exports.getConversations = async (req, res) => {
  try {
    const { userId } = req.params;
    const conversations = await chatService.getConversations(userId);
    return res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    console.error("getConversations error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
 
// ✅ EXPERT conversations (otherUserId = User)
exports.getExpertConversations = async (req, res) => {
  try {
    const { expertId } = req.params;
    const conversations = await chatService.getExpertConversations(expertId);
    return res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    console.error("getExpertConversations error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
 
// ✅ Mark messages as seen
exports.markSeen = async (req, res) => {
  try {
    const { viewerId, senderId } = req.body;
    if (!viewerId || !senderId) {
      return res.status(400).json({ error: "viewerId and senderId required" });
    }
    const result = await chatService.markSeen(viewerId, senderId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("markSeen error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};
 
// ✅ DELETE SINGLE MESSAGE
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId, userId, deleteForEveryone } = req.body;
    if (!messageId || !userId) {
      return res.status(400).json({ error: "messageId and userId required" });
    }
    const result = await chatService.deleteMessage(
      messageId,
      userId,
      deleteForEveryone === true || deleteForEveryone === "true"
    );
    return res.status(200).json(result);
  } catch (error) {
    console.error("deleteMessage error:", error.message);
    return res.status(400).json({ error: error.message });
  }
};
 
// ✅ DELETE ENTIRE CONVERSATION
exports.deleteConversation = async (req, res) => {
  try {
    const { userId, otherUserId, deleteForEveryone } = req.body;
    if (!userId || !otherUserId) {
      return res.status(400).json({ error: "userId and otherUserId required" });
    }
    const result = await chatService.deleteConversation(
      userId,
      otherUserId,
      deleteForEveryone === true || deleteForEveryone === "true"
    );
    return res.status(200).json(result);
  } catch (error) {
    console.error("deleteConversation error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};