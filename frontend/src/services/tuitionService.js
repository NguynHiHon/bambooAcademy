import { axiosJWT } from '../config/axiosJWT';

const tuitionService = {
    calculateTuition: async (params) => {
        const res = await axiosJWT.get('/api/tuition/calculate', { params });
        return res.data;
    },

    recordPayment: async (data) => {
        const res = await axiosJWT.post('/api/tuition/payment', data);
        return res.data;
    },

    getPayments: async (params = {}) => {
        const res = await axiosJWT.get('/api/tuition/payments', { params });
        return res.data;
    }
};

export default tuitionService;
