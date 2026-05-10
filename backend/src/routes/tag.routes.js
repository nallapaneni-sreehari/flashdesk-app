const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth');
const TagController = require('../controllers/tag.controller');

router.get('/', authenticate, TagController.getTags);

module.exports = router;
