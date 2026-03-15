const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// POST /auth/login — Email + password login
router.post('/login', authController.login);

module.exports = router;
