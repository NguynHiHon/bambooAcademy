const scheduleOverrideService = require('../services/scheduleOverrideService');

const scheduleOverrideController = {
    getWeekSchedule: async (req, res) => {
        try {
            const { weekStart } = req.query;
            if (!weekStart) return res.status(400).json({ message: 'weekStart is required' });
            const schedule = await scheduleOverrideService.getWeekSchedule(weekStart);
            res.status(200).json(schedule);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    cancelSlot: async (req, res) => {
        try {
            const result = await scheduleOverrideService.cancelSlot(req.body);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    rescheduleSlot: async (req, res) => {
        try {
            const result = await scheduleOverrideService.rescheduleSlot(req.body);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    removeOverride: async (req, res) => {
        try {
            await scheduleOverrideService.removeOverride(req.params.id);
            res.status(200).json({ message: 'Đã khôi phục lịch mặc định' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = scheduleOverrideController;
