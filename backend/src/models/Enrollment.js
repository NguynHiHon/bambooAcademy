const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    customFeePerLesson: {
        type: Number, // null có nghĩa là dùng giá mặc định của Course
        default: null
    },
    enrollDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'dropped', 'completed'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
