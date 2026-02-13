var express = require("express");
var router = express.Router();

// IMPORT SUB-ROUTERS
const authRouter = require("./auth.routes");
const usersRouter = require("./user.routes");
const profileRouter = require("./user.profile.route");
const expertRouter = require("./expert.profile.route");

// REGISTER ROUTES
router.use("/auth", authRouter); // <--- important
router.use("/user", usersRouter);
router.use("/profile", profileRouter);
router.use("/expert", expertRouter);

module.exports = router;
