const express = require('express');
const { loginUser, registerUser, getUser } = require('../../src/controllers/auth.controller');
const { authenticateToken } = require("../../src/middleware/auth.middleware");

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/me', authenticateToken, getUser);

module.exports = router;