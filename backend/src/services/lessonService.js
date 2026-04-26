const Lesson = require('../models/Lesson');
const TimetableSlot = require('../models/TimetableSlot');
const Attendance = require('../models/Attendance');
const Enrollment = require('../models/Enrollment');
const dayjs = require('dayjs');

const lessonService = {
    // Generate lessons for a class
    generateLessons: async (classId, days = 30) => {
        const slots = await TimetableSlot.find({ class: classId, endDate: null });
        const lessons = [];
        
        // Quét từ ngày hôm nay trở đi 30 ngày
        const today = dayjs().startOf('day');
        const endDate = dayjs().add(days, 'day').endOf('day');

        for (const slot of slots) {
            // Với mỗi slot, ta quét từ ngày bắt đầu của slot đó (hoặc tối thiểu là 14 ngày trước) đến 30 ngày sau
            const slotStart = dayjs(slot.startDate || today).startOf('day');
            // Để đảm bảo không bỏ sót buổi trong tuần hiện tại, ta lùi lại ít nhất 7 ngày nếu slot mới tạo
            const sevenDaysAgo = today.subtract(7, 'day');
            const scanStart = slotStart.isBefore(sevenDaysAgo) ? slotStart : sevenDaysAgo;
            
            let currentDate = scanStart;
            while (currentDate.isBefore(endDate)) {
                if (currentDate.day() === slot.dayOfWeek) {
                    // Check if lesson already exists
                    const existing = await Lesson.findOne({
                        class: classId,
                        date: currentDate.toDate(),
                        timetableSlot: slot._id
                    });

                    if (!existing) {
                        const newLesson = new Lesson({
                            class: classId,
                            timetableSlot: slot._id,
                            date: currentDate.toDate(),
                            period: slot.period,
                            actualTime: slot.defaultTime,
                            status: 'scheduled',
                            type: 'regular'
                        });
                        const saved = await newLesson.save();
                        lessons.push(saved);
                        
                        // Auto-create attendance
                        const students = await Enrollment.find({ class: classId, status: 'active' });
                        const attendancePromises = students.map(e => 
                            Attendance.create({
                                lesson: saved._id,
                                student: e.student,
                                status: 'not_checked'
                            })
                        );
                        await Promise.all(attendancePromises);
                    }
                }
                currentDate = currentDate.add(1, 'day');
            }
        }
        return lessons;
    },

    getLessons: async (query = {}) => {
        const { classId, month, year } = query;
        if (!classId || !month || !year) return [];

        const startOfMonth = dayjs(`${year}-${month}-01`).startOf('month');
        const endOfMonth = startOfMonth.endOf('month');

        // 1. Lấy tất cả Lesson thực tế đã có trong DB
        const actualLessons = await Lesson.find({
            class: classId,
            date: { $gte: startOfMonth.toDate(), $lte: endOfMonth.toDate() }
        }).populate('class').sort({ date: 1 });

        // 2. Lấy khung Thời khóa biểu
        const slots = await TimetableSlot.find({ 
            class: classId, 
            endDate: null 
        });

        // 3. Tạo danh sách "Khung" cho những ngày chưa có Lesson
        const combinedLessons = [...actualLessons];
        const actualDates = new Set(actualLessons.map(l => dayjs(l.date).format('YYYY-MM-DD')));

        for (let d = 0; d < startOfMonth.daysInMonth(); d++) {
            const currentDate = startOfMonth.add(d, 'day');
            const dateStr = currentDate.format('YYYY-MM-DD');

            // Nếu ngày này chưa có dữ liệu thực tế, hãy xem có "Khung" không
            if (!actualDates.has(dateStr)) {
                const dayOfWeek = currentDate.day();
                const matchingSlots = slots.filter(s => s.dayOfWeek === dayOfWeek);
                
                matchingSlots.forEach(slot => {
                    // Chỉ hiện nếu ngày này >= ngày bắt đầu của slot
                    if (currentDate.isAfter(dayjs(slot.startDate).subtract(1, 'day'))) {
                        combinedLessons.push({
                            _id: `plan-${dateStr}-${slot._id}`, // ID tạm
                            class: slot.class,
                            timetableSlot: slot._id,
                            date: currentDate.toDate(),
                            period: slot.period,
                            actualTime: slot.defaultTime,
                            status: 'scheduled', // Trạng thái kế hoạch
                            isPlan: true // Đánh dấu đây là dữ liệu từ khung
                        });
                    }
                });
            }
        }

        // Sắp xếp lại theo ngày
        return combinedLessons.sort((a, b) => new Date(a.date) - new Date(b.date));
    },

    updateLesson: async (id, data) => {
        return await Lesson.findByIdAndUpdate(id, data, { new: true }).populate('class');
    },

    // Điểm danh
    updateAttendance: async (lessonId, studentId, status, note) => {
        return await Attendance.findOneAndUpdate(
            { lesson: lessonId, student: studentId },
            { status, note },
            { new: true, upsert: true }
        );
    },

    getAttendance: async (lessonId) => {
        return await Attendance.find({ lesson: lessonId }).populate('student');
    },

    createLessonFromPlan: async (data) => {
        const { classId, timetableSlot, date, period, actualTime } = data;
        
        const newLesson = new Lesson({
            class: classId,
            timetableSlot,
            date,
            period,
            actualTime,
            status: 'scheduled',
            type: 'regular'
        });
        const saved = await newLesson.save();
        
        const Enrollment = require('../models/Enrollment');
        const Attendance = require('../models/Attendance');
        const students = await Enrollment.find({ class: classId, status: 'active' });
        
        const attendancePromises = students.map(e => 
            Attendance.create({
                lesson: saved._id,
                student: e.student,
                status: 'not_checked'
            })
        );
        await Promise.all(attendancePromises);
        
        return saved;
    }
};

module.exports = lessonService;
