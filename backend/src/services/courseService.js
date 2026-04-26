const Course = require('../models/Course');

const courseService = {
    createCourse: async (data, userId) => {
        const course = new Course({
            ...data,
            createdBy: userId
        });
        return await course.save();
    },

    getAllCourses: async (query = {}) => {
        return await Course.find(query).sort({ createdAt: -1 });
    },

    getCourseById: async (id) => {
        return await Course.findById(id);
    },

    updateCourse: async (id, data) => {
        return await Course.findByIdAndUpdate(id, data, { new: true });
    },

    deleteCourse: async (id) => {
        return await Course.findByIdAndDelete(id);
    }
};

module.exports = courseService;
