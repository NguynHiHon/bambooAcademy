const express = require('express');
const enrollmentController = require('../controllers/enrollmentController');
const authMiddleWare = require('../middlewares/authMiddleWare');

const router = express.Router();

router.post('/', authMiddleWare.verifyAdmin, enrollmentController.enrollStudent);
router.get('/', authMiddleWare.verifyAdmin, enrollmentController.getAllEnrollments);

router.get('/class/:classId', authMiddleWare.verifyAdmin, enrollmentController.getEnrollmentsByClass);
router.get('/student/:studentId', authMiddleWare.verifyAdmin, enrollmentController.getEnrollmentsByStudent);
router.put('/:id', authMiddleWare.verifyAdmin, enrollmentController.updateEnrollment);
router.delete('/:id', authMiddleWare.verifyAdmin, enrollmentController.deleteEnrollment);

module.exports = router;
