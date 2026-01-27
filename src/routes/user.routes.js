const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');

/* CREATE USER */
router.post('/', userController.createUser);

/* TEST ROUTE (keep for safety) */
router.get('/test', (req, res) => {
  res.json({ message: 'User route working successfully ✅' });
});

module.exports = router;
