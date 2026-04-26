const tuitionService = require('../services/tuitionService');

const tuitionController = {
    calculateTuition: async (req, res) => {
        try {
            const { studentId, classId, month, year } = req.query;
            const result = await tuitionService.calculateTuition(studentId, classId, parseInt(month), parseInt(year));
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    recordPayment: async (req, res) => {
        try {
            const payment = await tuitionService.recordPayment(req.body);
            res.status(201).json(payment);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getPayments: async (req, res) => {
        try {
            const payments = await tuitionService.getPayments(req.query);
            res.status(200).json(payments);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = tuitionController;
