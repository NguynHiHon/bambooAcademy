const express = require('express');
const timetableController = require('../controllers/timetableController');
const authMiddleWare = require('../middlewares/authMiddleWare');

const router = express.Router();

router.use(authMiddleWare.verifyAccessToken);
router.use(authMiddleWare.verifyAdmin);

router.post('/', timetableController.addSlot);
router.get('/class/:classId', timetableController.getSlotsByClass);
router.delete('/:id', timetableController.deleteSlot);

module.exports = router;
