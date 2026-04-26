const express = require('express');
const enrollmentController = require('../controllers/enrollmentController');
const authMiddleWare = require('../middlewares/authMiddleWare');

const router = express.Router();

router.use(authMiddleWare.verifyAccessToken);

router.post('/', enrollmentController.enrollStudent);
router.get('/', enrollmentController.getAllEnrollments);

router.get('/class/:classId', enrollmentController.getEnrollmentsByClass);
router.get('/student/:studentId', enrollmentController.getEnrollmentsByStudent);
router.put('/:id', enrollmentController.updateEnrollment);
router.delete('/:id', enrollmentController.deleteEnrollment);

module.exports = router;
