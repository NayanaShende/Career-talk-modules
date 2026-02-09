var express = require("express");
var router = express.Router();

const authRouter = require("./auth.routes");
let usersRouter = require("./user.routes"); // <-- FIXED
const profileRouter = require("./profile.route");

router.use("/auth", authRouter);
router.use("/user", usersRouter); // <-- FIXED (or "/users" if you prefer)
router.use("/profile", profileRouter);

module.exports = router;
