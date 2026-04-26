const lessonService = require('../services/lessonService');

const lessonController = {
    generateLessons: async (req, res) => {
        try {
            const lessons = await lessonService.generateLessons(req.params.classId, req.body.days);
            res.status(200).json(lessons);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getLessons: async (req, res) => {
        try {
            const lessons = await lessonService.getLessons(req.query);
            res.status(200).json(lessons);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    updateLesson: async (req, res) => {
        try {
            const lesson = await lessonService.updateLesson(req.params.id, req.body);
            res.status(200).json(lesson);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    updateAttendance: async (req, res) => {
        try {
            const { lessonId, studentId, status, note } = req.body;
            const result = await lessonService.updateAttendance(lessonId, studentId, status, note);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getAttendance: async (req, res) => {
        try {
            const attendance = await lessonService.getAttendance(req.params.lessonId);
            res.status(200).json(attendance);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    createLessonFromPlan: async (req, res) => {
        try {
            const result = await lessonService.createLessonFromPlan(req.body);
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = lessonController;
