import { axiosJWT } from '../config/axiosJWT';
import {
    getUserProfileStart,
    getUserProfileSuccess,
    getUserProfileFailure,
    getUsersListStart,
    getUsersListSuccess,
    getUsersListFailure,
} from '../redux/clices/userSlice';
import { updateUserInfo } from '../redux/clices/authSlice';


const userService = {

    fetchUserProfile: async (dispatch) => {
        dispatch(getUserProfileStart());
        try {
            const res = await axiosJWT.get('/api/users/me');
            dispatch(getUserProfileSuccess(res.data.userInfo));
            dispatch(updateUserInfo(res.data.userInfo));
            return res.data.userInfo;
        } catch (error) {
            dispatch(getUserProfileFailure());
            throw error;
        }
    },

    // Update User Profile (if needed later)
    updateUserProfile: async (userData) => {
        const res = await axiosJWT.put('/api/users/me', userData);
        return res.data;
    },
    // Get All Users (Admin only)

    // fetch users with optional filters (roles comma-separated, state)
    getAllUser: async (dispatch, params = {}) => {
        // dispatch is optional (some callers use local state)
        const doDispatch = typeof dispatch === 'function';
        if (doDispatch) dispatch(getUsersListStart());
        try {
            const res = await axiosJWT.get('/api/users', { params });
            if (doDispatch) dispatch(getUsersListSuccess(res.data));
            return res.data;
        } catch (error) {
            if (doDispatch) dispatch(getUsersListFailure(error));
            throw error;
        }
    },



    // Admin CRUD
    createUser: async (data) => {
        const res = await axiosJWT.post('/api/users', data);
        return res.data.data || res.data;
    },

    getUser: async (id) => {
        const res = await axiosJWT.get(`/api/users/${id}`);
        return res.data.data;
    },

    updateUser: async (id, data) => {
        const res = await axiosJWT.put(`/api/users/${id}`, data);
        return res.data.data;
    },

    deleteUser: async (id) => {
        const res = await axiosJWT.delete(`/api/users/${id}`);
        return res.data;
    }

};

export default userService;

