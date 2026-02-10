var express = require("express");
var router = express.Router();

const authRouter = require("./auth.routes");
const usersRouter = require("./user.routes");
const profileRouter = require("./user.profile.route");
const expertRouter = require("./expert.profile.route"); // <-- ADD THIS

router.use("/auth", authRouter);
router.use("/user", usersRouter);
router.use("/profile", profileRouter);
router.use("/expert", expertRouter); // <-- ADD THIS

module.exports = router;
