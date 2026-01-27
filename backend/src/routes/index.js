var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res) {
  res.status(200);
  res.json({
    message: "Default route works fine",
  });
});

module.exports = router;
