import { axiosJWT } from '../config/axiosJWT';

const classService = {
    getAllClasses: async (params = {}) => {
        const res = await axiosJWT.get('/api/classes', { params });
        return res.data;
    },

    getClassesByCourse: async (courseId) => {
        const res = await axiosJWT.get(`/api/classes/course/${courseId}`);
        return res.data;
    },

    getClassById: async (id) => {
        const res = await axiosJWT.get(`/api/classes/${id}`);
        return res.data;
    },

    createClass: async (data) => {
        const res = await axiosJWT.post('/api/classes', data);
        return res.data;
    },

    updateClass: async (id, data) => {
        const res = await axiosJWT.put(`/api/classes/${id}`, data);
        return res.data;
    },

    deleteClass: async (id) => {
        const res = await axiosJWT.delete(`/api/classes/${id}`);
        return res.data;
    }
};

export default classService;
