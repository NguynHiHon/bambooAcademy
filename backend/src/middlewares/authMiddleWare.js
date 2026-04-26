
const jwt = require('jsonwebtoken');
const User = require('../models/Users');

const authMiddleWare = {

    verifyAccessToken: async (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');// Lấy token từ header Authorization


            let token = authHeader && authHeader.split(' ')[1];
            if (!token) {
                console.warn('401: Token missing for', req.originalUrl);
                return res.status(401).json({ message: 'không tìm thấy access token' });
            }

            jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
                if (err) {
                    return res.status(403).json({ message: 'Access token không hợp lệ hoặc đã hết hạn' });
                }
                const user = await User.findById(decoded.id).select('-password');// Lấy thông tin người dùng từ cơ sở dữ liệu trừ mật khẩu
                if (!user) {
                    return res.status(404).json({ message: 'Người dùng không tồn tại' });
                }
                req.user = user; // Gắn thông tin người dùng vào đối tượng req
                next(); // Tiếp tục đến middleware hoặc route handler tiếp theo
            });
        }
        catch (error) {
            return res.status(500).json({ message: 'lỗi hệ thống ' });
        }
    },

    verifyAdmin: (req, res, next) => {
        authMiddleWare.verifyAccessToken(req, res, () => {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Yêu cầu quyền admin' });
            }
            next();
        });
    }
};

module.exports = authMiddleWare;