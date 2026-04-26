
const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/signin', authController.signIn);
router.post('/signOut', authController.signOutSession);
router.post('/signoutsession', authController.signOutSession); // Legacy route
router.post('/refresh-token', authController.refreshToken);

module.exports = router;