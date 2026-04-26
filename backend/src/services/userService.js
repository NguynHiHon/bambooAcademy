
const bcrypt = require('bcrypt');
const User = require('../models/Users');
const Session = require('../models/Session');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-() ]{7,20}$/;

const checkPasswordStrength = (password) => {
    if (typeof password !== 'string') return false;
    if (password.length < 8) return false;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    return hasUpperCase && hasLowerCase && hasNumbers;
}

const ALLOWED_ROLES = ['user', 'staff', 'admin'];

const userService = {
    getInfor: async (userId) => {
        try {
            const user = await User.findById(userId).select('-password');
            if (!user) {
                const err = new Error('USER_NOT_FOUND');
                err.status = 404;
                throw err;
            }
            return user;
        } catch (error) {
            throw error;
        }
    },

    getAllUsers: async (filter = {}) => {
        try {
            const query = {};
            if (filter.roles) {
                // roles may be an array or comma-separated string
                const roles = Array.isArray(filter.roles) ? filter.roles : String(filter.roles).split(',').map(s => s.trim());
                query.role = { $in: roles };
            }
            if (filter.state) query.state = filter.state;
            const users = await User.find(query).select('-password');
            return users;
        } catch (error) {
            throw error;
        }
    },

    create: async (data) => {
        try {
            const { username, password, passwordConfirm, email, phone, role = 'user', name } = data;

            if (!username || !password || !passwordConfirm || !email) {
                const err = new Error('INVALID_INPUT');
                err.status = 400;
                throw err;
            }

            if (password !== passwordConfirm) {
                const err = new Error('PASSWORD_MISMATCH');
                err.status = 400;
                throw err;
            }

            if (!EMAIL_REGEX.test(email)) {
                const err = new Error('INVALID_EMAIL');
                err.status = 400;
                throw err;
            }

            if (phone && !PHONE_REGEX.test(phone)) {
                const err = new Error('INVALID_PHONE');
                err.status = 400;
                throw err;
            }

            if (!checkPasswordStrength(password)) {
                const err = new Error('WEAK_PASSWORD');
                err.status = 400;
                throw err;
            }

            if (!ALLOWED_ROLES.includes(role)) {
                const err = new Error('INVALID_ROLE');
                err.status = 400;
                throw err;
            }

            const normalizedUsername = String(username).trim().toLowerCase();
            const normalizedEmail = String(email).trim().toLowerCase();

            const existingUser = await User.findOne({ $or: [{ username: normalizedUsername }, { email: normalizedEmail }] });
            if (existingUser) {
                const err = new Error('USER_EXISTS');
                err.status = 409;
                throw err;
            }

            const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
            const hashed = await bcrypt.hash(password, rounds);

            const created = await User.create({ username: normalizedUsername, password: hashed, email: normalizedEmail, phone, role, name });
            const { password: _p, ...userWithoutPassword } = created._doc;
            return userWithoutPassword;
        } catch (error) {
            throw error;
        }
    },

    getUser: async (id) => {
        try {
            const user = await User.findById(id).select('-password');
            if (!user) {
                const err = new Error('USER_NOT_FOUND');
                err.status = 404;
                throw err;
            }
            return user;
        } catch (error) {
            throw error;
        }
    },

    updateUser: async (id, data) => {
        try {
            const { username, password, passwordConfirm, email, phone, role, name } = data;
            const user = await User.findById(id);
            if (!user) {
                const err = new Error('USER_NOT_FOUND');
                err.status = 404;
                throw err;
            }

            if (username && username !== user.username) {
                const existing = await User.findOne({ username: String(username).trim().toLowerCase() });
                if (existing && existing._id.toString() !== id) {
                    const err = new Error('USERNAME_EXISTS');
                    err.status = 409;
                    throw err;
                }
                user.username = String(username).trim().toLowerCase();
            }

            if (email && email !== user.email) {
                if (!EMAIL_REGEX.test(email)) {
                    const err = new Error('INVALID_EMAIL');
                    err.status = 400;
                    throw err;
                }
                const existing = await User.findOne({ email: String(email).trim().toLowerCase() });
                if (existing && existing._id.toString() !== id) {
                    const err = new Error('EMAIL_EXISTS');
                    err.status = 409;
                    throw err;
                }
                user.email = String(email).trim().toLowerCase();
            }

            if (phone !== undefined) {
                if (phone && !PHONE_REGEX.test(phone)) {
                    const err = new Error('INVALID_PHONE');
                    err.status = 400;
                    throw err;
                }
                user.phone = phone;
            }

            if (password) {
                if (!passwordConfirm || password !== passwordConfirm) {
                    const err = new Error('PASSWORD_MISMATCH');
                    err.status = 400;
                    throw err;
                }
                if (!checkPasswordStrength(password)) {
                    const err = new Error('WEAK_PASSWORD');
                    err.status = 400;
                    throw err;
                }
                const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
                user.password = await bcrypt.hash(password, rounds);
            }

            if (role !== undefined) {
                if (!ALLOWED_ROLES.includes(role)) {
                    const err = new Error('INVALID_ROLE');
                    err.status = 400;
                    throw err;
                }
                user.role = role;
            }

            // allow updating account state (active, banned, suspended)
            if (data.state !== undefined) {
                const allowedStates = ['active', 'banned', 'suspended'];
                if (!allowedStates.includes(data.state)) {
                    const err = new Error('INVALID_STATE');
                    err.status = 400;
                    throw err;
                }
                user.state = data.state;
            }

            if (name !== undefined) user.name = name;

            await user.save();
            const { password: _p, ...userWithoutPassword } = user._doc;
            return userWithoutPassword;
        } catch (error) {
            throw error;
        }
    },

    deleteUser: async (id) => {
        try {
            const user = await User.findById(id);
            if (!user) {
                const err = new Error('USER_NOT_FOUND');
                err.status = 404;
                throw err;
            }
            // remove sessions
            await Session.deleteMany({ userId: user._id });
            await User.findByIdAndDelete(id);
            return { message: 'User deleted' };
        } catch (error) {
            throw error;
        }
    },

    // Update own profile (for authenticated users)
    updateMe: async (userId, data) => {
        try {
            const { fullName, phone, address, currentPassword, newPassword, newPasswordConfirm } = data;
            const user = await User.findById(userId);
            if (!user) {
                const err = new Error('USER_NOT_FOUND');
                err.status = 404;
                throw err;
            }

            // Update allowed fields
            if (fullName !== undefined) user.fullName = fullName;
            if (address !== undefined) user.address = address;


            if (phone !== undefined) {
                if (phone && !PHONE_REGEX.test(phone)) {
                    const err = new Error('INVALID_PHONE');
                    err.status = 400;
                    throw err;
                }
                user.phone = phone;
            }

            // Change password if provided
            if (newPassword) {
                if (!currentPassword) {
                    const err = new Error('CURRENT_PASSWORD_REQUIRED');
                    err.status = 400;
                    throw err;
                }
                const isMatch = await bcrypt.compare(currentPassword, user.password);
                if (!isMatch) {
                    const err = new Error('INCORRECT_PASSWORD');
                    err.status = 400;
                    throw err;
                }
                if (!newPasswordConfirm || newPassword !== newPasswordConfirm) {
                    const err = new Error('PASSWORD_MISMATCH');
                    err.status = 400;
                    throw err;
                }
                if (!checkPasswordStrength(newPassword)) {
                    const err = new Error('WEAK_PASSWORD');
                    err.status = 400;
                    throw err;
                }
                const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
                user.password = await bcrypt.hash(newPassword, rounds);
            }

            await user.save();
            const { password: _p, ...userWithoutPassword } = user._doc;
            return userWithoutPassword;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = userService;