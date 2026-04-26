
const authService = require('../services/authService');

const ReToken_TTL = 30 * 24 * 60 * 60 * 1000;

const authController = {
    signUp: async (req, res) => {
        let { username, password, email, phone, name } = req.body;
        try {

            const user = await authService.signUp({ username, password, email, phone, name });
            return res.status(201).json({ message: 'User registered successfully', user });

        } catch (error) {

            const status = error.status || 500;
            let message = error.message || 'INTERNAL_SERVER_ERROR';

            return res.status(status).json({
                message,
            });
        }
    },
    signIn: async (req, res) => {
        let { username, password } = req.body;
        try {
            const { user, refreshToken } = await authService.signIn(username, password);
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: false, // Localhost thường chạy HTTP
                sameSite: 'lax',
                maxAge: ReToken_TTL
            });
            return res.status(200).json({ message: 'User signed in successfully' + user.username, user });
        } catch (error) {
            const status = error.status || 500;
            let message = error.message || 'INTERNAL_SERVER_ERROR';
            return res.status(status).json({
                message,
            });
        }
    },

    signOutSession: async (req, res) => {
        const refreshToken = req.cookies?.refreshToken;
        try {
            if (!refreshToken) {
                return res.status(400).json({ message: 'NOT_LOGGED_IN' });
            }
            await authService.signOut(refreshToken);
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
            });
            return res.status(204).send();
        }
        catch (error) {
            const status = error.status || 500;
            let message = error.message || 'INTERNAL_SERVER_ERROR';
            return res.status(status).json({
                message,
            });
        }
    },

    refreshToken: async (req, res) => {
        const refreshToken = req.cookies?.refreshToken;
        console.log('--- Refresh Token Request ---');
        console.log('Cookie present:', !!refreshToken);
        
        try {
            if (!refreshToken) {
                console.warn('401: Refresh Token missing from cookies');
                return res.status(401).json({ message: 'REFRESH_TOKEN_REQUIRED' });
            }

            const { accessToken, user } = await authService.refreshAccessToken(refreshToken);

            return res.status(200).json({
                message: 'Token refreshed successfully',
                accessToken,
                user
            });
        } catch (error) {
            const status = error.status || 500;
            let message = error.message || 'INTERNAL_SERVER_ERROR';
            return res.status(status).json({ message });
        }
    },
};


module.exports = authController;