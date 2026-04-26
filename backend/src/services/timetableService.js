const TimetableSlot = require('../models/TimetableSlot');

const timetableService = {
    addSlot: async (data) => {
        // Kiểm tra xem đã có lịch nào trùng Thứ và Buổi đang HIỆU LỰC không
        const existing = await TimetableSlot.findOne({
            dayOfWeek: data.dayOfWeek,
            period: data.period,
            endDate: null // Chỉ kiểm tra các lịch chưa kết thúc
        }).populate('class');

        if (existing) {
            throw new Error(`Trùng lịch rồi Trúc ơi! Buổi này Trúc đã có lịch dạy lớp [${existing.class.name}] mất rồi.`);
        }

        const slot = new TimetableSlot(data);
        return await slot.save();
    },

    getSlotsByClass: async (classId) => {
        return await TimetableSlot.find({ 
            class: classId,
            endDate: null // Chỉ lấy những lịch đang còn hiệu lực
        }).sort({ dayOfWeek: 1 });
    },

    deleteSlot: async (id) => {
        // Thay vì xóa hẳn, ta đánh dấu ngày kết thúc là hôm qua
        // Để các tuần quá khứ vẫn thấy lịch, nhưng tuần hiện tại/tương lai thì không.
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(23, 59, 59, 999);
        
        return await TimetableSlot.findByIdAndUpdate(id, { endDate: yesterday });
    }
};

module.exports = timetableService;
