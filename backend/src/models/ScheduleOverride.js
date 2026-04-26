const mongoose = require('mongoose');

const scheduleOverrideSchema = new mongoose.Schema({
    // Slot gốc bị ảnh hưởng
    originalSlot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TimetableSlot',
        required: true
    },
    // Ngày thứ 2 đầu tuần (dùng để xác định tuần nào)
    weekStart: {
        type: Date,
        required: true
    },
    // Hành động: hủy hoặc dời lịch
    action: {
        type: String,
        enum: ['cancelled', 'rescheduled'],
        required: true
    },
    // Nếu dời lịch - thông tin buổi mới
    newWeekStart: {
        type: Date // Tuần đích (nếu bù sang tuần khác). Null = cùng tuần
    },
    newDayOfWeek: {
        type: Number // 0-6
    },
    newPeriod: {
        type: String,
        enum: ['Morning', 'Afternoon', 'LateAfternoon', 'Evening']
    },
    newTime: {
        type: String // VD: "14h30 - 16h30"
    },
    // Ghi chú
    note: {
        type: String,
        trim: true
    }
}, { timestamps: true });

// Mỗi slot chỉ có 1 override trong 1 tuần
scheduleOverrideSchema.index({ originalSlot: 1, weekStart: 1 }, { unique: true });

module.exports = mongoose.model('ScheduleOverride', scheduleOverrideSchema);
