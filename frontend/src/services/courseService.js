import { axiosJWT } from '../config/axiosJWT';

const courseService = {
    getAllCourses: async () => {
        const res = await axiosJWT.get('/api/courses');
        return res.data;
    },

    getCourseById: async (id) => {
        const res = await axiosJWT.get(`/api/courses/${id}`);
        return res.data;
    },

    createCourse: async (data) => {
        const res = await axiosJWT.post('/api/courses', data);
        return res.data;
    },

    updateCourse: async (id, data) => {
        const res = await axiosJWT.put(`/api/courses/${id}`, data);
        return res.data;
    },

    deleteCourse: async (id) => {
        const res = await axiosJWT.delete(`/api/courses/${id}`);
        return res.data;
    }
};

export default courseService;
