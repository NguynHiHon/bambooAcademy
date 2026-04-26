import { axiosJWT } from '../config/axiosJWT';

const scheduleOverrideService = {
    // Lấy lịch tổng hợp theo tuần
    getWeekSchedule: async (weekStart) => {
        const res = await axiosJWT.get('/api/schedule-override/week', {
            params: { weekStart }
        });
        return res.data;
    },

    // Hủy buổi dạy
    cancelSlot: async (data) => {
        const res = await axiosJWT.post('/api/schedule-override/cancel', data);
        return res.data;
    },

    // Dời lịch dạy bù
    rescheduleSlot: async (data) => {
        const res = await axiosJWT.post('/api/schedule-override/reschedule', data);
        return res.data;
    },

    // Khôi phục lịch mặc định
    removeOverride: async (id) => {
        const res = await axiosJWT.delete(`/api/schedule-override/${id}`);
        return res.data;
    }
};

export default scheduleOverrideService;
