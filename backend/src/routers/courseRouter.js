const express = require('express');
const courseController = require('../controllers/courseController');
const authMiddleWare = require('../middlewares/authMiddleWare');

const router = express.Router();

router.use(authMiddleWare.verifyAccessToken);

router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourse);

// ADMIN ONLY
router.use(authMiddleWare.verifyAdmin);
router.post('/', courseController.createCourse);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

module.exports = router;
