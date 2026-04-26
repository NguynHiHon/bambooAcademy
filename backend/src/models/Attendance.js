const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'not_checked'],
        default: 'not_checked'
    },
    note: {
        type: String,
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
