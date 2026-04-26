const express = require('express');
const tuitionController = require('../controllers/tuitionController');
const authMiddleWare = require('../middlewares/authMiddleWare');

const router = express.Router();

router.use(authMiddleWare.verifyAccessToken);

router.get('/calculate', tuitionController.calculateTuition);
router.post('/payment', tuitionController.recordPayment);
router.get('/payments', tuitionController.getPayments);

module.exports = router;
