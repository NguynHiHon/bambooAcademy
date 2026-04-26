import { axiosJWT } from '../config/axiosJWT';

const timetableService = {
    addSlot: async (data) => {
        const res = await axiosJWT.post('/api/timetable', data);
        return res.data;
    },

    getSlotsByClass: async (classId) => {
        const res = await axiosJWT.get(`/api/timetable/class/${classId}`);
        return res.data;
    },

    deleteSlot: async (id) => {
        const res = await axiosJWT.delete(`/api/timetable/${id}`);
        return res.data;
    }
};

export default timetableService;
