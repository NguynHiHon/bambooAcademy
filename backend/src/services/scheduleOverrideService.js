const ScheduleOverride = require('../models/ScheduleOverride');
const TimetableSlot = require('../models/TimetableSlot');

const populateOverride = {
    path: 'originalSlot',
    populate: { path: 'class', populate: { path: 'course' } }
};

const scheduleOverrideService = {
    // Hủy buổi dạy (không bù)
    cancelSlot: async (data) => {
        const { originalSlot, weekStart, note } = data;
        const targetWeek = new Date(weekStart);

        // 1. Lưu vào bảng Override để Dashboard hiển thị "Bị hủy"
        const override = await ScheduleOverride.findOneAndUpdate(
            { originalSlot, weekStart: targetWeek },
            { action: 'cancelled', note, newWeekStart: null, newDayOfWeek: null, newPeriod: null, newTime: null },
            { upsert: true, new: true }
        ).populate(populateOverride);

        // 2. Tìm và cập nhật trạng thái buổi học (Lesson) trong danh sách điểm danh (nếu đã được tạo)
        const TimetableSlot = require('../models/TimetableSlot');
        const Lesson = require('../models/Lesson');
        const slot = await TimetableSlot.findById(originalSlot);
        
        if (slot) {
            // Tính ngày cụ thể của slot trong tuần đó
            const dayOffset = (slot.dayOfWeek + 6) % 7;
            const lessonDate = new Date(targetWeek);
            lessonDate.setDate(lessonDate.getDate() + dayOffset);
            lessonDate.setHours(0, 0, 0, 0);

            await Lesson.findOneAndUpdate(
                { class: slot.class, date: lessonDate, timetableSlot: originalSlot },
                { status: 'cancelled', notes: note }
            );
        }

        return override;
    },

    // Dời lịch dạy bù (có thể sang tuần khác)
    rescheduleSlot: async (data) => {
        const { originalSlot, weekStart, newWeekStart, newDayOfWeek, newPeriod, newTime, note } = data;
        const targetWeek = newWeekStart ? new Date(newWeekStart) : new Date(weekStart);
        const sourceWeek = new Date(weekStart);

        // 1. Lưu Override
        const override = await ScheduleOverride.findOneAndUpdate(
            { originalSlot, weekStart: sourceWeek },
            { action: 'rescheduled', newWeekStart: targetWeek, newDayOfWeek, newPeriod, newTime, note },
            { upsert: true, new: true }
        ).populate(populateOverride);

        // 2. Cập nhật Lesson (Đồng bộ Điểm danh)
        const TimetableSlot = require('../models/TimetableSlot');
        const Lesson = require('../models/Lesson');
        const slot = await TimetableSlot.findById(originalSlot);

        if (slot) {
            // Hủy buổi gốc
            const dayOffsetSource = (slot.dayOfWeek + 6) % 7;
            const sourceDate = new Date(sourceWeek);
            sourceDate.setDate(sourceDate.getDate() + dayOffsetSource);
            sourceDate.setHours(0, 0, 0, 0);

            await Lesson.findOneAndUpdate(
                { class: slot.class, date: sourceDate, timetableSlot: originalSlot },
                { status: 'cancelled', notes: `Dời sang ngày khác: ${note}` }
            );

            // Tạo/Cập nhật buổi bù
            const dayOffsetTarget = (newDayOfWeek + 6) % 7;
            const targetDate = new Date(targetWeek);
            targetDate.setDate(targetDate.getDate() + dayOffsetTarget);
            targetDate.setHours(0, 0, 0, 0);

            await Lesson.findOneAndUpdate(
                { class: slot.class, date: targetDate, type: 'makeup', makeupFor: originalSlot }, // Dùng makeupFor để nhận diện
                { 
                    period: newPeriod, 
                    actualTime: newTime, 
                    status: 'scheduled', 
                    type: 'makeup',
                    notes: `Dạy bù cho buổi ngày ${sourceDate.toLocaleDateString('vi-VN')}: ${note}` 
                },
                { upsert: true, new: true }
            );
        }

        return override;
    },

    // Xóa override (khôi phục lịch mặc định)
    removeOverride: async (id) => {
        return await ScheduleOverride.findByIdAndDelete(id);
    },

    // Lấy dữ liệu tổng hợp: lịch mặc định + override cho 1 tuần
    getWeekSchedule: async (weekStart) => {
        const targetWeek = new Date(weekStart);

        const allSlots = await TimetableSlot.find()
            .populate({ 
                path: 'class', 
                match: { status: 'active' }, // Chỉ lấy lớp đang hoạt động
                populate: { path: 'course' } 
            });

        // Lọc bỏ những slot mà class bị archived HOẶC không nằm trong khoảng thời gian hiệu lực của tuần này
        const activeSlots = allSlots.filter(s => {
            if (s.class === null) return false;
            
            // Tính ngày cuối cùng của tuần này (Chủ nhật)
            const weekEnd = new Date(targetWeek);
            weekEnd.setDate(weekEnd.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);

            const slotStart = s.startDate ? new Date(s.startDate) : new Date(0);
            const slotEnd = s.endDate ? new Date(s.endDate) : null;

            // Slot hợp lệ nếu:
            // 1. Ngày bắt đầu của slot TRƯỚC HOẶC TRONG tuần này
            // 2. Slot chưa kết thúc HOẶC ngày kết thúc SAU HOẶC TRONG tuần này
            const isStarted = slotStart <= weekEnd;
            const isNotEnded = !slotEnd || slotEnd >= targetWeek;

            return isStarted && isNotEnded;
        });

        // 1. Override gốc: các slot BỊ hủy/dời TRONG tuần này
        const overridesFrom = await ScheduleOverride.find({ weekStart: targetWeek })
            .populate(populateOverride);

        // 2. Override đến: các slot từ tuần KHÁC được bù VÀO tuần này
        const overridesTo = await ScheduleOverride.find({
            action: 'rescheduled',
            newWeekStart: targetWeek
        }).populate(populateOverride);

        // Map override theo originalSlot ID
        const overrideMap = {};
        overridesFrom.forEach(o => {
            overrideMap[o.originalSlot._id.toString()] = o;
        });

        // Xây dựng lịch tuần
        const schedule = [];

        // Xử lý từng slot mặc định
        activeSlots.forEach(slot => {
            // TÍNH NGÀY CỤ THỂ của buổi dạy trong tuần đang xem
            // Mapping: 1(T2)->0, 2(T3)->1, ..., 6(T7)->5, 0(CN)->6
            const dayOffset = (slot.dayOfWeek + 6) % 7;
            const specificDate = new Date(targetWeek);
            specificDate.setDate(specificDate.getDate() + dayOffset);
            
            // Chuẩn hóa thời gian để so sánh ngày
            const checkDateStart = new Date(specificDate);
            checkDateStart.setHours(0, 0, 0, 0);
            const checkDateEnd = new Date(specificDate);
            checkDateEnd.setHours(23, 59, 59, 999);

            const slotStart = slot.startDate ? new Date(slot.startDate) : new Date(0);
            const slotEnd = slot.endDate ? new Date(slot.endDate) : null;
            
            // LOGIC TRÍ NHỚ:
            // 1. Buổi dạy chỉ hiện nếu Ngày cụ thể đó >= Ngày bắt đầu tạo lịch
            // 2. Buổi dạy chỉ hiện nếu Ngày cụ thể đó <= Ngày kết thúc lịch (nếu có)
            if (checkDateEnd < slotStart) return;
            if (slotEnd && checkDateStart > slotEnd) return;

            const slotId = slot._id.toString();
            const override = overrideMap[slotId];

            if (!override) {
                // Không có override → hiện lịch mặc định
                schedule.push({
                    type: 'default',
                    slotId: slot._id,
                    className: slot.class?.name || 'N/A',
                    courseName: slot.class?.course?.name || '',
                    classId: slot.class?._id,
                    dayOfWeek: slot.dayOfWeek,
                    period: slot.period,
                    time: slot.defaultTime
                });
            } else if (override.action === 'cancelled') {
                // Bị hủy → vẫn hiện nhưng đánh dấu
                schedule.push({
                    type: 'cancelled',
                    slotId: slot._id,
                    overrideId: override._id,
                    className: slot.class?.name || 'N/A',
                    courseName: slot.class?.course?.name || '',
                    classId: slot.class?._id,
                    dayOfWeek: slot.dayOfWeek,
                    period: slot.period,
                    time: slot.defaultTime,
                    note: override.note
                });
            } else if (override.action === 'rescheduled') {
                // Ô gốc → đánh dấu "đã dời"
                const targetWeekStr = override.newWeekStart?.toISOString();
                const thisWeekStr = targetWeek.toISOString();
                const isSameWeek = targetWeekStr === thisWeekStr;

                schedule.push({
                    type: 'rescheduled_from',
                    slotId: slot._id,
                    overrideId: override._id,
                    className: slot.class?.name || 'N/A',
                    courseName: slot.class?.course?.name || '',
                    classId: slot.class?._id,
                    dayOfWeek: slot.dayOfWeek,
                    period: slot.period,
                    time: slot.defaultTime,
                    note: override.note,
                    movedToWeek: !isSameWeek ? override.newWeekStart : null
                });

                // Nếu bù CÙNG tuần → thêm ô đích luôn
                if (isSameWeek) {
                    schedule.push({
                        type: 'rescheduled_to',
                        slotId: slot._id,
                        overrideId: override._id,
                        className: slot.class?.name || 'N/A',
                        courseName: slot.class?.course?.name || '',
                        classId: slot.class?._id,
                        dayOfWeek: override.newDayOfWeek,
                        period: override.newPeriod,
                        time: override.newTime,
                        note: override.note
                    });
                }
            }
        });

        // 3. Thêm các buổi bù TỪ tuần khác dời VÀO tuần này
        overridesTo.forEach(o => {
            // Bỏ qua nếu bù cùng tuần (đã xử lý ở trên)
            const fromWeek = o.weekStart?.toISOString();
            const toWeek = targetWeek.toISOString();
            if (fromWeek === toWeek) return;

            schedule.push({
                type: 'rescheduled_to',
                slotId: o.originalSlot._id,
                overrideId: o._id,
                className: o.originalSlot.class?.name || 'N/A',
                courseName: o.originalSlot.class?.course?.name || '',
                classId: o.originalSlot.class?._id,
                dayOfWeek: o.newDayOfWeek,
                period: o.newPeriod,
                time: o.newTime,
                note: o.note,
                fromWeek: o.weekStart // Tuần gốc
            });
        });

        return schedule;
    }
};

module.exports = scheduleOverrideService;
