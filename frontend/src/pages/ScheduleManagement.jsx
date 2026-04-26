import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Paper, FormControl,
    InputLabel, Select, MenuItem, Button, Stack, Card,
    IconButton, Chip, Divider, TextField, Tooltip
} from '@mui/material';

import Grid from '@mui/material/GridLegacy';

import { Add, Delete, CalendarMonth, AccessTime } from '@mui/icons-material';
import classService from '../services/classService';
import timetableService from '../services/timetableService';
import dayjs from 'dayjs';
import { toast } from 'sonner';

const DAYS_MAP = [
    { value: 1, label: 'Thứ 2' },
    { value: 2, label: 'Thứ 3' },
    { value: 3, label: 'Thứ 4' },
    { value: 4, label: 'Thứ 5' },
    { value: 5, label: 'Thứ 6' },
    { value: 6, label: 'Thứ 7' },
    { value: 0, label: 'Chủ nhật' }
];

const PERIODS = [
    { value: 'Morning', label: 'Sáng', order: 1 },
    { value: 'Afternoon', label: 'Chiều', order: 2 },
    { value: 'LateAfternoon', label: 'Chiều Tối', order: 3 },
    { value: 'Evening', label: 'Tối', order: 4 }
];

export default function ScheduleManagement() {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [newSlot, setNewSlot] = useState({ 
        dayOfWeek: 1, 
        period: 'Afternoon', 
        defaultTime: '',
        startDate: new Date().toISOString().split('T')[0] // Mặc định là hôm nay
    });

    const fetchData = async () => {
        try {
            const data = await classService.getAllClasses();
            setClasses(data);
            if (data.length > 0 && !selectedClass) setSelectedClass(data[0]._id);
        } catch (error) {
            toast.error('Lỗi khi tải danh sách lớp');
        } finally {
            setLoading(false);
        }
    };

    const fetchSlots = async (classId) => {
        try {
            const data = await timetableService.getSlotsByClass(classId);
            setSlots(data);
        } catch (error) {
            toast.error('Lỗi khi tải thời khóa biểu');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchSlots(selectedClass);
        }
    }, [selectedClass]);

    const handleAddSlot = async () => {
        if (!newSlot.defaultTime) {
            toast.warning('Vui lòng nhập giờ dạy (VD: 14h-16h)');
            return;
        }
        try {
            await timetableService.addSlot({ ...newSlot, class: selectedClass });
            toast.success('Thêm lịch thành công');
            fetchSlots(selectedClass);
            setNewSlot({ ...newSlot, defaultTime: '', startDate: new Date().toISOString().split('T')[0] });
        } catch (error) {
            const msg = error.response?.data?.message || 'Lỗi khi thêm lịch';
            toast.error(msg);
        }
    };

    const handleDeleteSlot = async (id) => {
        if (!id) return;
        if (!window.confirm('Trúc có chắc muốn xóa lịch dạy này không?')) return;
        
        try {
            await timetableService.deleteSlot(id);
            toast.success('Đã xóa lịch');
            setSlots(slots.filter(s => s._id !== id));
        } catch (error) {
            toast.error('Lỗi khi xóa: ' + (error.response?.data?.message || error.message));
        }
    };

    const getSortedDaySlots = (dayValue) => {
        return slots
            .filter(s => s.dayOfWeek === dayValue)
            .sort((a, b) => {
                const orderA = PERIODS.find(p => p.value === a.period)?.order || 99;
                const orderB = PERIODS.find(p => p.value === b.period)?.order || 99;
                return orderA - orderB;
            });
    };

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
            <Box sx={{ mb: { xs: 2, md: 4 } }}>
                <Typography variant="h4" color="primary.dark" sx={{ mb: 1, fontWeight: 700, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                    Xếp lịch dạy
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Thiết lập lịch dạy cố định hàng tuần.
                </Typography>
            </Box>

            <Grid container spacing={{ xs: 2, md: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', borderRadius: 3 }}>
                        <Box sx={{ p: { xs: 2, md: 3 } }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Thiết lập mới</Typography>
                            <Stack spacing={2.5}>
                                <FormControl fullWidth>
                                    <InputLabel>Chọn lớp học</InputLabel>
                                    <Select
                                        value={selectedClass}
                                        label="Chọn lớp học"
                                        onChange={(e) => setSelectedClass(e.target.value)}
                                    >
                                        {classes.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                                    </Select>
                                </FormControl>
                                
                                <Divider />
                                
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Thứ</InputLabel>
                                        <Select
                                            value={newSlot.dayOfWeek}
                                            label="Thứ"
                                            onChange={(e) => setNewSlot({ ...newSlot, dayOfWeek: e.target.value })}
                                        >
                                            {DAYS_MAP.map(day => <MenuItem key={day.value} value={day.value}>{day.label}</MenuItem>)}
                                        </Select>
                                    </FormControl>

                                    <FormControl fullWidth size="small">
                                        <InputLabel>Buổi</InputLabel>
                                        <Select
                                            value={newSlot.period}
                                            label="Buổi"
                                            onChange={(e) => setNewSlot({ ...newSlot, period: e.target.value })}
                                        >
                                            {PERIODS.map(p => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Stack>

                                <TextField
                                    label="Giờ học (VD: 14h-16h)"
                                    fullWidth
                                    size="small"
                                    value={newSlot.defaultTime}
                                    onChange={(e) => setNewSlot({ ...newSlot, defaultTime: e.target.value })}
                                />

                                <TextField
                                    label="Ngày bắt đầu"
                                    type="date"
                                    fullWidth
                                    size="small"
                                    value={newSlot.startDate}
                                    onChange={(e) => setNewSlot({ ...newSlot, startDate: e.target.value })}
                                    inputProps={{
                                        min: dayjs().startOf('month').format('YYYY-MM-DD'),
                                        max: dayjs().endOf('month').format('YYYY-MM-DD')
                                    }}
                                    InputLabelProps={{ shrink: true }}
                                />

                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={handleAddSlot}
                                    fullWidth
                                    sx={{ py: 1.2, fontWeight: 700, borderRadius: 2 }}
                                >
                                    Thêm lịch
                                </Button>
                            </Stack>
                        </Box>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: { xs: 2, md: 3 }, minHeight: { md: 550 }, border: '1px solid #eee', boxShadow: 'none', borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700, color: 'primary.main' }}>
                            <CalendarMonth />
                            Lịch dạy: {classes.find(c => c._id === selectedClass)?.name || '...'}
                        </Typography>

                        <Grid container spacing={2}>
                            {DAYS_MAP.map((day) => {
                                const daySlots = getSortedDaySlots(day.value);
                                return (
                                    <Grid item xs={12} sm={6} key={day.value}>
                                        <Paper variant="outlined" sx={{ 
                                            p: 1.5, 
                                            height: '100%', 
                                            bgcolor: daySlots.length > 0 ? '#F6FAF7' : '#fafafa', 
                                            borderColor: daySlots.length > 0 ? '#84A98C' : '#eee',
                                            borderRadius: 2 
                                        }}>
                                            <Typography variant="subtitle2" color={daySlots.length > 0 ? '#4D6A54' : 'text.disabled'} sx={{ mb: 1, fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                                                {day.label}
                                                {daySlots.length > 0 && <Chip label={`${daySlots.length} ca`} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#84A98C', color: '#fff' }} />}
                                            </Typography>
                                            <Stack spacing={1}>
                                                {daySlots.length === 0 ? (
                                                    <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>Trống</Typography>
                                                ) : (
                                                    daySlots.map(slot => (
                                                        <Box key={slot._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fff', p: 1, borderRadius: 1.5, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                                            <Box>
                                                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#B76E79', display: 'block', mb: 0.2 }}>
                                                                    {PERIODS.find(p => p.value === slot.period)?.label}
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, color: '#333' }}>
                                                                     {slot.defaultTime}
                                                                </Typography>
                                                            </Box>
                                                            <IconButton size="small" sx={{ color: '#E07A5F' }} onClick={() => handleDeleteSlot(slot._id)}>
                                                                <Delete fontSize="small" />
                                                            </IconButton>
                                                        </Box>
                                                    ))
                                                )}
                                            </Stack>
                                        </Paper>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}
