const express = require('express');
const classController = require('../controllers/classController');
const authMiddleWare = require('../middlewares/authMiddleWare');

const router = express.Router();

router.use(authMiddleWare.verifyAccessToken);

router.post('/', classController.createClass);
router.get('/', classController.getAllClasses);
router.get('/course/:courseId', classController.getClassesByCourse);
router.get('/:id', classController.getClass);
router.put('/:id', classController.updateClass);
router.delete('/:id', classController.deleteClass);

module.exports = router;
