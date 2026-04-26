
const express = require('express');
const userController = require('../controllers/userController');
const authMiddleWare = require('../middlewares/authMiddleWare');

const router = express.Router();

// authenticated user
router.get('/me', authMiddleWare.verifyAccessToken, userController.getMe);
router.put('/me', authMiddleWare.verifyAccessToken, userController.updateMe);

// admin CRUD
router.get('/', authMiddleWare.verifyAdmin, userController.getAllUsers);
router.post('/', authMiddleWare.verifyAdmin, userController.createUser);
router.get('/:id', authMiddleWare.verifyAdmin, userController.getUser);
router.put('/:id', authMiddleWare.verifyAdmin, userController.updateUser);
router.delete('/:id', authMiddleWare.verifyAdmin, userController.deleteUser);

module.exports = router;