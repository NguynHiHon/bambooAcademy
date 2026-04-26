const courseService = require('../services/courseService');

const courseController = {
    createCourse: async (req, res) => {
        try {
            const course = await courseService.createCourse(req.body, req.user.id);
            res.status(201).json(course);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getAllCourses: async (req, res) => {
        try {
            const courses = await courseService.getAllCourses();
            res.status(200).json(courses);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getCourse: async (req, res) => {
        try {
            const course = await courseService.getCourseById(req.params.id);
            if (!course) return res.status(404).json({ message: 'Course not found' });
            res.status(200).json(course);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    updateCourse: async (req, res) => {
        try {
            const course = await courseService.updateCourse(req.params.id, req.body);
            if (!course) return res.status(404).json({ message: 'Course not found' });
            res.status(200).json(course);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deleteCourse: async (req, res) => {
        try {
            await courseService.deleteCourse(req.params.id);
            res.status(200).json({ message: 'Course deleted' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = courseController;
