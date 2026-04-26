const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
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
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 10
    },
    type: {
        type: String,
        enum: ['daily', 'test', 'midterm', 'final'],
        default: 'daily'
    },
    date: {
        type: Date,
        default: Date.now
    },
    comment: {
        type: String,
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Score', scoreSchema);
