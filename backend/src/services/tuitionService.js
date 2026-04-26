const Attendance = require('../models/Attendance');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const TuitionPayment = require('../models/TuitionPayment');
const Lesson = require('../models/Lesson');

const tuitionService = {
    calculateTuition: async (studentId, classId, month, year) => {
        // 1. Tìm thông tin ghi danh để lấy giá buổi học
        const enrollment = await Enrollment.findOne({ student: studentId, class: classId }).populate('class');
        if (!enrollment) throw new Error('Enrollment not found');

        const course = await Course.findById(enrollment.class.course);
        const feePerLesson = enrollment.customFeePerLesson || course.feePerLesson;

        // 2. Tìm các buổi học trong tháng/năm đã điểm danh 'present'
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59);

        const lessons = await Lesson.find({
            class: classId,
            date: { $gte: startOfMonth, $lte: endOfMonth },
            status: 'completed'
        });

        const lessonIds = lessons.map(l => l._id);
        const attendanceCount = await Attendance.countDocuments({
            lesson: { $in: lessonIds },
            student: studentId,
            status: 'present'
        });

        const totalFee = attendanceCount * feePerLesson;

        // 3. Tìm các khoản đã đóng
        const payments = await TuitionPayment.find({
            student: studentId,
            month: month,
            year: year
        });
        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

        return {
            studentId,
            attendanceCount,
            feePerLesson,
            totalFee,
            totalPaid,
            balance: totalFee - totalPaid,
            lessonsPresent: attendanceCount
        };
    },

    recordPayment: async (data) => {
        const payment = new TuitionPayment(data);
        return await payment.save();
    },

    getPayments: async (query = {}) => {
        return await TuitionPayment.find(query).populate('student').sort({ date: -1 });
    }
};

module.exports = tuitionService;
