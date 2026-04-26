const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    timetableSlot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TimetableSlot' // null nếu là buổi bù hoặc thay đổi hoàn toàn
    },
    date: {
        type: Date,
        required: true
    },
    period: {
        type: String,
        enum: ['Morning', 'Afternoon', 'LateAfternoon', 'Evening'],
        required: true
    },
    actualTime: {
        type: String, // Có thể edit linh hoạt, VD: "15:00 - 17:00"
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    type: {
        type: String,
        enum: ['regular', 'makeup'],
        default: 'regular'
    },
    notes: {
        type: String,
        trim: true
    },
    makeupFor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson' // Link tới buổi bị hủy nếu đây là buổi bù
    }
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);
