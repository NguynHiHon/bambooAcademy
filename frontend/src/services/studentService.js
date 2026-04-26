import { axiosJWT } from '../config/axiosJWT';

const studentService = {
    getAllStudents: async () => {
        const res = await axiosJWT.get('/api/students');
        return res.data;
    },

    getStudentById: async (id) => {
        const res = await axiosJWT.get(`/api/students/${id}`);
        return res.data;
    },

    createStudent: async (data) => {
        const res = await axiosJWT.post('/api/students', data);
        return res.data;
    },

    updateStudent: async (id, data) => {
        const res = await axiosJWT.put(`/api/students/${id}`, data);
        return res.data;
    },

    deleteStudent: async (id) => {
        const res = await axiosJWT.delete(`/api/students/${id}`);
        return res.data;
    }
};

export default studentService;
