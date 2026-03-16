// ===================================================
// UNIT TESTS FOR CHAT SERVICE
// File location: tests/services/chat.service.test.js
// Run: npx jest
// ===================================================

const { createMessage, getConversation } = require("../../src/services/chat.service");

// ✅ Fixed path - tests/services/ needs ../../ to reach src/models
jest.mock("../../src/models", () => ({
  Chat: {
    create: jest.fn(),
    findAll: jest.fn(),
  },
  Sequelize: {
    Op: {
      or: Symbol("or"),
    },
  },
}));

const { Chat } = require("../../src/models");

// ===================================================
// CHAT SERVICE TESTS
// ===================================================
describe("Chat Service", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------
  // createMessage
  // ---------------------------------------------------
  describe("createMessage", () => {

    it("should create a message and return snake_case fields", async () => {
      Chat.create.mockResolvedValue({
        id: 1,
        senderId: 1,
        receiverId: 2,
        message: "Hello!",
        is_seen: false,
        createdAt: new Date("2026-01-01T10:00:00Z"),
      });

      const result = await createMessage({
        sender_id: 1,
        receiver_id: 2,
        message: "Hello!",
      });

      expect(result).toHaveProperty("sender_id", 1);
      expect(result).toHaveProperty("receiver_id", 2);
      expect(result).toHaveProperty("message", "Hello!");
      expect(result).toHaveProperty("id", 1);
      expect(result).toHaveProperty("created_at");
    });

    it("should call Chat.create with correct senderId and receiverId", async () => {
      Chat.create.mockResolvedValue({
        id: 2,
        senderId: 3,
        receiverId: 4,
        message: "Test",
        createdAt: new Date(),
      });

      await createMessage({ sender_id: 3, receiver_id: 4, message: "Test" });

      expect(Chat.create).toHaveBeenCalledWith(
        expect.objectContaining({ senderId: 3, receiverId: 4, message: "Test" })
      );
    });

    it("should support camelCase input (senderId/receiverId)", async () => {
      Chat.create.mockResolvedValue({
        id: 3,
        senderId: 5,
        receiverId: 6,
        message: "Hi",
        createdAt: new Date(),
      });

      await createMessage({ senderId: 5, receiverId: 6, message: "Hi" });

      expect(Chat.create).toHaveBeenCalledWith(
        expect.objectContaining({ senderId: 5, receiverId: 6 })
      );
    });

    it("should throw if Chat.create fails", async () => {
      Chat.create.mockRejectedValue(new Error("DB Error"));

      await expect(
        createMessage({ sender_id: 1, receiver_id: 2, message: "Hi" })
      ).rejects.toThrow("DB Error");
    });

  });

  // ---------------------------------------------------
  // getConversation
  // ---------------------------------------------------
  describe("getConversation", () => {

    it("should return messages in snake_case format", async () => {
      Chat.findAll.mockResolvedValue([
        {
          id: 1,
          senderId: 1,
          receiverId: 2,
          message: "Hello",
          is_seen: false,
          createdAt: new Date("2026-01-01T10:00:00Z"),
        },
        {
          id: 2,
          senderId: 2,
          receiverId: 1,
          message: "Hi back",
          is_seen: true,
          createdAt: new Date("2026-01-01T10:01:00Z"),
        },
      ]);

      const result = await getConversation(1, 2);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty("sender_id", 1);
      expect(result[0]).toHaveProperty("receiver_id", 2);
      expect(result[0]).toHaveProperty("message", "Hello");
      expect(result[1]).toHaveProperty("sender_id", 2);
      expect(result[1]).toHaveProperty("message", "Hi back");
    });

    it("should return empty array when no messages exist", async () => {
      Chat.findAll.mockResolvedValue([]);

      const result = await getConversation(1, 2);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should order messages by createdAt ASC", async () => {
      Chat.findAll.mockResolvedValue([]);

      await getConversation(1, 2);

      expect(Chat.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          order: [["createdAt", "ASC"]],
        })
      );
    });

    it("should throw if Chat.findAll fails", async () => {
      Chat.findAll.mockRejectedValue(new Error("DB Error"));

      await expect(getConversation(1, 2)).rejects.toThrow("DB Error");
    });

  });

});