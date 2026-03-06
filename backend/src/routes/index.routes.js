const express = require("express");
const router = express.Router();

const userRoutes = require("./user.routes");
const authRoutes = require("./auth.routes"); // ✅ ADD
const expertRoutes = require("./expert.routes");
const callRoutes = require("./call.routes");
const chatRoutes = require("./chat.routes");

router.use("/users", userRoutes);
router.use("/auth", authRoutes); // ✅ ADD
router.use("/experts", expertRoutes);
router.use("/calls", callRoutes);
router.use("/chats", require("./chat.routes"));
module.exports = router;
