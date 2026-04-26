import { axiosJWT } from '../config/axiosJWT';

const scoreService = {
    addScore: async (data) => {
        const res = await axiosJWT.post('/api/scores', data);
        return res.data;
    },

    getScoresByClass: async (classId) => {
        const res = await axiosJWT.get(`/api/scores/class/${classId}`);
        return res.data;
    },

    getScoresByStudent: async (studentId, classId) => {
        const res = await axiosJWT.get(`/api/scores/student/${studentId}`, {
            params: { classId }
        });
        return res.data;
    },

    updateScore: async (id, data) => {
        const res = await axiosJWT.put(`/api/scores/${id}`, data);
        return res.data;
    },

    deleteScore: async (id) => {
        const res = await axiosJWT.delete(`/api/scores/${id}`);
        return res.data;
    }
};

export default scoreService;
