const express = require('express');
const scheduleOverrideController = require('../controllers/scheduleOverrideController');
const authMiddleWare = require('../middlewares/authMiddleWare');

const router = express.Router();

router.use(authMiddleWare.verifyAccessToken);

// Lấy lịch tổng hợp theo tuần
router.get('/week', scheduleOverrideController.getWeekSchedule);

// Hủy buổi dạy
router.post('/cancel', scheduleOverrideController.cancelSlot);

// Dời lịch dạy bù
router.post('/reschedule', scheduleOverrideController.rescheduleSlot);

// Xóa override (khôi phục mặc định)
router.delete('/:id', scheduleOverrideController.removeOverride);

module.exports = router;
