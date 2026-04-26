const classService = require('../services/classService');

const classController = {
    createClass: async (req, res) => {
        try {
            const newClass = await classService.createClass(req.body);
            res.status(201).json(newClass);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getAllClasses: async (req, res) => {
        try {
            const classes = await classService.getAllClasses(req.query);
            res.status(200).json(classes);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getClassesByCourse: async (req, res) => {
        try {
            const classes = await classService.getClassesByCourse(req.params.courseId);
            res.status(200).json(classes);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getClass: async (req, res) => {
        try {
            const result = await classService.getClassById(req.params.id);
            if (!result) return res.status(404).json({ message: 'Class not found' });
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    updateClass: async (req, res) => {
        try {
            const result = await classService.updateClass(req.params.id, req.body);
            if (!result) return res.status(404).json({ message: 'Class not found' });
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deleteClass: async (req, res) => {
        try {
            await classService.deleteClass(req.params.id);
            res.status(200).json({ message: 'Class deleted' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = classController;
