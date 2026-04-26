const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: { type: String },
    role: { type: String, enum: ['user', 'staff', 'admin'], default: 'user' },

    // Contact fields

    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    name: { type: String, trim: true },
    fullName: { type: String, trim: true },
    address: { type: String, trim: true },
    avatar: { type: String, default: '' },

    // Account state for admin actions
    state: { type: String, enum: ['active', 'banned', 'suspended'], default: 'active' },
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema);