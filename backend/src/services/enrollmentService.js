const Enrollment = require('../models/Enrollment');

const enrollmentService = {
    enrollStudent: async (data) => {
        // Kiểm tra xem đã ghi danh chưa
        const existing = await Enrollment.findOne({ student: data.student, class: data.class });
        if (existing) {
            const err = new Error('STUDENT_ALREADY_ENROLLED');
            err.status = 400;
            throw err;
        }
        const enrollment = new Enrollment(data);
        return await enrollment.save();
    },

    getAllEnrollments: async () => {
        return await Enrollment.find()
            .populate('student')
            .populate({
                path: 'class',
                populate: { path: 'course' }
            })
            .sort({ createdAt: -1 });
    },


    getEnrollmentsByClass: async (classId) => {
        return await Enrollment.find({ class: classId }).populate('student').sort({ createdAt: -1 });
    },

    getEnrollmentsByStudent: async (studentId) => {
        return await Enrollment.find({ student: studentId }).populate('class').sort({ createdAt: -1 });
    },

    updateEnrollment: async (id, data) => {
        return await Enrollment.findByIdAndUpdate(id, data, { new: true }).populate('student class');
    },

    deleteEnrollment: async (id) => {
        return await Enrollment.findByIdAndDelete(id);
    }
};

module.exports = enrollmentService;
