const timetableService = require('../services/timetableService');

const timetableController = {
    addSlot: async (req, res) => {
        try {
            const slot = await timetableService.addSlot(req.body);
            res.status(201).json(slot);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getSlotsByClass: async (req, res) => {
        try {
            const slots = await timetableService.getSlotsByClass(req.params.classId);
            res.status(200).json(slots);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deleteSlot: async (req, res) => {
        try {
            await timetableService.deleteSlot(req.params.id);
            res.status(200).json({ message: 'Slot deleted' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = timetableController;
