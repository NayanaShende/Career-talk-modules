var express = require("express");
var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res) {
  res.status(200);
  res.json({
    message: "User route works fine",
  });
});

module.exports = router;
