const Student = require('../models/Student');

const studentService = {
    createStudent: async (data) => {
        const student = new Student(data);
        return await student.save();
    },

    getAllStudents: async (query = {}) => {
        return await Student.find(query).sort({ fullName: 1 });
    },

    getStudentById: async (id) => {
        return await Student.findById(id);
    },

    updateStudent: async (id, data) => {
        return await Student.findByIdAndUpdate(id, data, { new: true });
    },

    deleteStudent: async (id) => {
        return await Student.findByIdAndDelete(id);
    }
};

module.exports = studentService;
