const Class = require('../models/Class');

const classService = {
    createClass: async (data) => {
        const newClass = new Class(data);
        return await newClass.save();
    },

    getAllClasses: async (query = {}) => {
        return await Class.find(query).populate('course').sort({ createdAt: -1 });
    },

    getClassesByCourse: async (courseId) => {
        return await Class.find({ course: courseId }).populate('course');
    },

    getClassById: async (id) => {
        return await Class.findById(id).populate('course');
    },

    updateClass: async (id, data) => {
        return await Class.findByIdAndUpdate(id, data, { new: true }).populate('course');
    },

    deleteClass: async (id) => {
        // Chuyển sang lưu trữ thay vì xóa hẳn để bảo vệ dữ liệu lịch sử
        return await Class.findByIdAndUpdate(id, { status: 'archived' });
    }
};

module.exports = classService;
