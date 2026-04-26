const express = require('express');
const router = express.Router();
const romanticAiController = require('../controllers/romanticAiController');

// GET /api/ai/greeting
router.get('/greeting', romanticAiController.getGreeting);

module.exports = router;
