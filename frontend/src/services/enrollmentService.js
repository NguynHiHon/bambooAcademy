import { axiosJWT } from '../config/axiosJWT';

const enrollmentService = {
    enrollStudent: async (data) => {
        const res = await axiosJWT.post('/api/enrollments', data);
        return res.data;
    },

    getAllEnrollments: async () => {
        const res = await axiosJWT.get('/api/enrollments');
        return res.data;
    },


    getEnrollmentsByClass: async (classId) => {
        const res = await axiosJWT.get(`/api/enrollments/class/${classId}`);
        return res.data;
    },

    getEnrollmentsByStudent: async (studentId) => {
        const res = await axiosJWT.get(`/api/enrollments/student/${studentId}`);
        return res.data;
    },

    updateEnrollment: async (id, data) => {
        const res = await axiosJWT.put(`/api/enrollments/${id}`, data);
        return res.data;
    },

    deleteEnrollment: async (id) => {
        const res = await axiosJWT.delete(`/api/enrollments/${id}`);
        return res.data;
    }
};

export default enrollmentService;
