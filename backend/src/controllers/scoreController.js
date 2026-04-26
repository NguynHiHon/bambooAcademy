const scoreService = require('../services/scoreService');

const scoreController = {
    addScore: async (req, res) => {
        try {
            const score = await scoreService.addScore(req.body);
            res.status(201).json(score);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getScoresByClass: async (req, res) => {
        try {
            const scores = await scoreService.getScoresByClass(req.params.classId);
            res.status(200).json(scores);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getScoresByStudent: async (req, res) => {
        try {
            const scores = await scoreService.getScoresByStudent(req.params.studentId, req.query.classId);
            res.status(200).json(scores);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    updateScore: async (req, res) => {
        try {
            const score = await scoreService.updateScore(req.params.id, req.body);
            res.status(200).json(score);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deleteScore: async (req, res) => {
        try {
            await scoreService.deleteScore(req.params.id);
            res.status(200).json({ message: 'Score deleted' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = scoreController;
