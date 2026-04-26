const Score = require('../models/Score');

const scoreService = {
    addScore: async (data) => {
        const score = new Score(data);
        return await score.save();
    },

    getScoresByClass: async (classId) => {
        return await Score.find({ class: classId })
            .populate('student')
            .sort({ date: -1 });
    },

    getScoresByStudent: async (studentId, classId) => {
        const query = { student: studentId };
        if (classId) query.class = classId;
        return await Score.find(query).sort({ date: 1 });
    },

    updateScore: async (id, data) => {
        return await Score.findByIdAndUpdate(id, data, { new: true });
    },

    deleteScore: async (id) => {
        return await Score.findByIdAndDelete(id);
    }
};

module.exports = scoreService;
