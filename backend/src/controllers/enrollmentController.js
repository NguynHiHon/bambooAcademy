const enrollmentService = require('../services/enrollmentService');

const enrollmentController = {
    enrollStudent: async (req, res) => {
        try {
            const enrollment = await enrollmentService.enrollStudent(req.body);
            res.status(201).json(enrollment);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    },

    getAllEnrollments: async (req, res) => {
        try {
            const enrollments = await enrollmentService.getAllEnrollments();
            res.status(200).json(enrollments);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },


    getEnrollmentsByClass: async (req, res) => {
        try {
            const enrollments = await enrollmentService.getEnrollmentsByClass(req.params.classId);
            res.status(200).json(enrollments);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getEnrollmentsByStudent: async (req, res) => {
        try {
            const enrollments = await enrollmentService.getEnrollmentsByStudent(req.params.studentId);
            res.status(200).json(enrollments);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    updateEnrollment: async (req, res) => {
        try {
            const enrollment = await enrollmentService.updateEnrollment(req.params.id, req.body);
            if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
            res.status(200).json(enrollment);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deleteEnrollment: async (req, res) => {
        try {
            await enrollmentService.deleteEnrollment(req.params.id);
            res.status(200).json({ message: 'Enrollment deleted' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = enrollmentController;
