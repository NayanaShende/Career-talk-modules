var express = require("express");
var router = express.Router();
let usersRouter = require("./users");

router.use("/users", usersRouter);

module.exports = router;
