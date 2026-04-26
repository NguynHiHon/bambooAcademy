const studentService = require('../services/studentService');

const studentController = {
    createStudent: async (req, res) => {
        try {
            const student = await studentService.createStudent(req.body);
            res.status(201).json(student);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getAllStudents: async (req, res) => {
        try {
            const students = await studentService.getAllStudents();
            res.status(200).json(students);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getStudent: async (req, res) => {
        try {
            const student = await studentService.getStudentById(req.params.id);
            if (!student) return res.status(404).json({ message: 'Student not found' });
            res.status(200).json(student);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    updateStudent: async (req, res) => {
        try {
            const student = await studentService.updateStudent(req.params.id, req.body);
            if (!student) return res.status(404).json({ message: 'Student not found' });
            res.status(200).json(student);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deleteStudent: async (req, res) => {
        try {
            await studentService.deleteStudent(req.params.id);
            res.status(200).json({ message: 'Student deleted' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = studentController;
