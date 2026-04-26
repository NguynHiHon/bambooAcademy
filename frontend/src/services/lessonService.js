import { axiosJWT } from '../config/axiosJWT';

const lessonService = {
    generateLessons: async (classId, days = 30) => {
        const res = await axiosJWT.post(`/api/lessons/generate/${classId}`, { days });
        return res.data;
    },

    getLessons: async (params = {}) => {
        const res = await axiosJWT.get('/api/lessons', { params });
        return res.data;
    },

    updateLesson: async (id, data) => {
        const res = await axiosJWT.put(`/api/lessons/${id}`, data);
        return res.data;
    },

    updateAttendance: async (data) => {
        const res = await axiosJWT.post('/api/lessons/attendance', data);
        return res.data;
    },

    getAttendance: async (lessonId) => {
        const res = await axiosJWT.get(`/api/lessons/${lessonId}/attendance`);
        return res.data;
    },

    createLessonFromPlan: async (data) => {
        const res = await axiosJWT.post('/api/lessons/from-plan', data);
        return res.data;
    },

    getMonthlyReport: async (params = {}) => {
        const res = await axiosJWT.get('/api/lessons/monthly-report', { params });
        return res.data;
    }
};

export default lessonService;
