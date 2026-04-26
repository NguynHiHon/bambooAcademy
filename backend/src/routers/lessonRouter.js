const express = require('express');
const lessonController = require('../controllers/lessonController');
const authMiddleWare = require('../middlewares/authMiddleWare');

const router = express.Router();

router.use(authMiddleWare.verifyAccessToken);
router.use(authMiddleWare.verifyAdmin);

router.post('/generate/:classId', lessonController.generateLessons);
router.post('/from-plan', lessonController.createLessonFromPlan);
router.get('/monthly-report', lessonController.getMonthlyAttendanceReport);
router.get('/', lessonController.getLessons);
router.put('/:id', lessonController.updateLesson);
router.post('/attendance', lessonController.updateAttendance);
router.get('/:lessonId/attendance', lessonController.getAttendance);

module.exports = router;
