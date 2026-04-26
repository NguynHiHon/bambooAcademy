const express = require('express');
const authRouter = require('./authRouter');
const userRouter = require('./userRouter');
const courseRouter = require('./courseRouter');
const studentRouter = require('./studentRouter');
const classRouter = require('./classRouter');
const enrollmentRouter = require('./enrollmentRouter');
const scoreRouter = require('./scoreRouter');
const lessonRouter = require('./lessonRouter');
const timetableRouter = require('./timetableRouter');
const tuitionRouter = require('./tuitionRouter');
const scheduleOverrideRouter = require('./scheduleOverrideRouter');
const router = express.Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/courses', courseRouter);
router.use('/students', studentRouter);
router.use('/classes', classRouter);
router.use('/enrollments', enrollmentRouter);
router.use('/scores', scoreRouter);
router.use('/lessons', lessonRouter);
router.use('/timetable', timetableRouter);
router.use('/tuition', tuitionRouter);
router.use('/schedule-override', scheduleOverrideRouter);

module.exports = router;





