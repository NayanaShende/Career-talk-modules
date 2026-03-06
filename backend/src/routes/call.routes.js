const express = require("express");
const router = express.Router();
const callController = require("../controllers/call.controller");

router.get("/history/:userId", callController.getCallHistory);
router.post("/initiate", callController.initiateCall);
router.post("/accept", callController.acceptCall);
router.post("/reject", callController.rejectCall);
router.post("/end", callController.endCall);



module.exports = router;