const express = require('express');
const scoreController = require('../controllers/scoreController');
const authMiddleWare = require('../middlewares/authMiddleWare');

const router = express.Router();

router.use(authMiddleWare.verifyAccessToken);
router.use(authMiddleWare.verifyAdmin);

router.post('/', scoreController.addScore);
router.get('/class/:classId', scoreController.getScoresByClass);
router.get('/student/:studentId', scoreController.getScoresByStudent);
router.put('/:id', scoreController.updateScore);
router.delete('/:id', scoreController.deleteScore);

module.exports = router;
