const express = require('express');
const router = express.Router();
const setupController = require('../controllers/setup.controller');

// GET /setup/check — Is the workspace already set up?
router.get('/check', setupController.checkSetup);

// POST /setup — Create workspace + admin account
router.post('/', setupController.createWorkspace);

module.exports = router;
