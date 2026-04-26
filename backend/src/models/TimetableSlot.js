const mongoose = require('mongoose');

const timetableSlotSchema = new mongoose.Schema({
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    dayOfWeek: {
        type: Number, // 0: CN, 1: T2, ..., 6: T7
        required: true
    },
    period: {
        type: String,
        enum: ['Morning', 'Afternoon', 'LateAfternoon', 'Evening'],
        required: true
    },
    defaultTime: {
        type: String, // VD: "14:30 - 16:30"
        required: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('TimetableSlot', timetableSlotSchema);
