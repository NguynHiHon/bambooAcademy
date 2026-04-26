const express = require('express');
const studentController = require('../controllers/studentController');
const authMiddleWare = require('../middlewares/authMiddleWare');

const router = express.Router();

router.use(authMiddleWare.verifyAccessToken);

router.get('/', studentController.getAllStudents);
router.get('/:id', studentController.getStudent);

// ADMIN ONLY
router.use(authMiddleWare.verifyAdmin);
router.post('/', studentController.createStudent);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

module.exports = router;
