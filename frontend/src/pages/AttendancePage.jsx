import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Paper, Button, Stack,
    Card, CardContent, IconButton, Chip, Divider, Avatar,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel,
    CircularProgress
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';

import { CheckCircle, Cancel, EventBusy, MoreTime, CalendarMonth, FilterAlt } from '@mui/icons-material';
import lessonService from '../services/lessonService';
import classService from '../services/classService';
import dayjs from 'dayjs';
import { toast } from 'sonner';

export default function AttendancePage() {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Bộ lọc tháng/năm
    const [month, setMonth] = useState(dayjs().month() + 1);
    const [year, setYear] = useState(dayjs().year());

    const [selectedLesson, setSelectedLesson] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [openAttendance, setOpenAttendance] = useState(false);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const data = await classService.getAllClasses({ status: 'active' });
                setClasses(data);
                if (data.length > 0) setSelectedClass(data[0]._id);
            } catch (error) {
                toast.error('Lỗi khi tải danh sách lớp');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const fetchLessons = async () => {
        if (!selectedClass) return;
        setLoading(true);
        try {
            const data = await lessonService.getLessons({ 
                classId: selectedClass,
                month,
                year
            });
            setLessons(data);
        } catch (error) {
            toast.error('Lỗi khi tải danh sách buổi học');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLessons();
    }, [selectedClass, month, year]);

    const handleOpenAttendance = async (lesson) => {
        let lessonId = lesson._id;
        
        // Nếu đây là một "Khung" (isPlan), ta phải biến nó thành thực tế trước
        if (lesson.isPlan) {
            try {
                // Gọi API để tạo Lesson thực tế từ Khung
                const realLesson = await lessonService.createLessonFromPlan({
                    classId: selectedClass,
                    timetableSlot: lesson.timetableSlot,
                    date: lesson.date,
                    period: lesson.period,
                    actualTime: lesson.actualTime
                });
                lessonId = realLesson._id;
                // Cập nhật lại danh sách để mất chữ "Kế hoạch"
                fetchLessons();
            } catch (error) {
                return toast.error('Lỗi khi tạo buổi học thực tế');
            }
        }

        setSelectedLesson({ ...lesson, _id: lessonId });
        try {
            const data = await lessonService.getAttendance(lessonId);
            setAttendance(data);
            setOpenAttendance(true);
        } catch (error) {
            toast.error('Lỗi khi tải danh sách điểm danh');
        }
    };

    const handleMarkAttendance = async (studentId, status) => {
        try {
            await lessonService.updateAttendance({
                lessonId: selectedLesson._id,
                studentId,
                status
            });
            setAttendance(attendance.map(a => 
                a.student._id === studentId ? { ...a, status } : a
            ));
        } catch (error) {
            toast.error('Lỗi khi điểm danh');
        }
    };

    const handleCompleteLesson = async (lessonId) => {
        try {
            await lessonService.updateLesson(lessonId, { status: 'completed' });
            toast.success('Đã xác nhận hoàn thành buổi học');
            fetchLessons();
        } catch (error) {
            toast.error('Lỗi khi cập nhật trạng thái');
        }
    };

    const handleCancelLesson = async (lessonId) => {
        if (window.confirm('Trúc muốn hủy buổi học này? Buổi này sẽ không được tính học phí.')) {
            try {
                await lessonService.updateLesson(lessonId, { status: 'cancelled' });
                toast.success('Đã hủy buổi học');
                fetchLessons();
            } catch (error) {
                toast.error('Lỗi khi hủy buổi');
            }
        }
    };

    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const years = [dayjs().year() - 1, dayjs().year(), dayjs().year() + 1];

    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" color="primary.dark" sx={{ mb: 1, fontWeight: 700 }}>
                    Điểm danh & Quản lý Buổi học
                </Typography>
                
                <Paper sx={{ p: 2, mt: 2, borderRadius: 2, boxShadow: 'none', border: '1px solid #eee' }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                        <FormControl sx={{ minWidth: 200 }} size="small">
                            <InputLabel>Chọn lớp học</InputLabel>
                            <Select
                                value={selectedClass}
                                label="Chọn lớp học"
                                onChange={(e) => setSelectedClass(e.target.value)}
                            >
                                {classes.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                            </Select>
                        </FormControl>

                        <Stack direction="row" spacing={1} alignItems="center">
                            <FilterAlt color="action" fontSize="small" />
                            <Select
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                size="small"
                                sx={{ width: 100 }}
                            >
                                {months.map(m => <MenuItem key={m} value={m}>Tháng {m}</MenuItem>)}
                            </Select>
                            <Select
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                size="small"
                                sx={{ width: 100 }}
                            >
                                {years.map(y => <MenuItem key={y} value={y}>Năm {y}</MenuItem>)}
                            </Select>
                        </Stack>

                        <Box sx={{ flexGrow: 1 }} />
                        
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            Dữ liệu tự động cập nhật theo thời khóa biểu
                        </Typography>
                    </Stack>
                </Paper>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
            ) : (
                <Grid container spacing={2}>
                    {lessons.length === 0 ? (
                        <Grid item xs={12}>
                            <Box sx={{ py: 10, textAlign: 'center', opacity: 0.5 }}>
                                <CalendarMonth sx={{ fontSize: 60, mb: 2 }} />
                                <Typography>Không có buổi học nào trong tháng {month}/{year}.</Typography>
                                <Typography variant="body2">Trúc hãy thử bấm nút "Đồng bộ lịch" ở trên nhé!</Typography>
                            </Box>
                        </Grid>
                    ) : (
                        lessons.map((lesson) => (
                            <Grid item xs={12} md={6} key={lesson._id}>
                                <Card variant="outlined" sx={{ 
                                    borderRadius: 3,
                                    transition: '0.3s',
                                    '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
                                    borderLeft: `6px solid ${
                                        lesson.status === 'completed' ? '#2E7D32' : 
                                        lesson.status === 'cancelled' ? '#d32f2f' : '#D4AF37'
                                    }` 
                                }}>
                                    <CardContent sx={{ p: 2.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Box>
                                                <Typography variant="h6" fontWeight={700} color="text.primary">
                                                    {dayjs(lesson.date).format('dddd, DD/MM')}
                                                    {lesson.isPlan && <Chip label="Kế hoạch" size="small" sx={{ ml: 1, height: 20, fontSize: '0.6rem', bgcolor: '#eee' }} />}
                                                </Typography>
                                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                                    <Chip label={lesson.period} size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {lesson.actualTime}
                                                    </Typography>
                                                </Stack>
                                            </Box>
                                            <Chip 
                                                label={lesson.status === 'scheduled' ? 'Sắp diễn ra' : lesson.status === 'completed' ? 'Đã dạy xong' : 'Đã hủy'} 
                                                size="small"
                                                variant="filled"
                                                color={lesson.status === 'completed' ? 'success' : lesson.status === 'cancelled' ? 'error' : 'warning'}
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </Box>

                                        <Divider sx={{ my: 2 }} />

                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            {lesson.status === 'scheduled' && (
                                                <>
                                                    <Button size="small" variant="contained" startIcon={<CheckCircle />} onClick={() => handleOpenAttendance(lesson)} sx={{ borderRadius: 2 }}>
                                                        Điểm danh
                                                    </Button>
                                                    <Button size="small" variant="outlined" color="success" onClick={() => handleCompleteLesson(lesson._id)} sx={{ borderRadius: 2 }}>
                                                        Dạy xong
                                                    </Button>
                                                    <IconButton color="error" onClick={() => handleCancelLesson(lesson._id)} size="small" title="Hủy buổi">
                                                        <EventBusy fontSize="small" />
                                                    </IconButton>
                                                </>
                                            )}
                                            {lesson.status === 'completed' && (
                                                <Button size="small" variant="text" startIcon={<CheckCircle />} onClick={() => handleOpenAttendance(lesson)}>
                                                    Xem lại điểm danh
                                                </Button>
                                            )}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            )}

            {/* Attendance Dialog */}
            <Dialog open={openAttendance} onClose={() => setOpenAttendance(false)} fullWidth maxWidth="xs">
                <DialogTitle sx={{ fontFamily: 'Playfair Display', fontWeight: 700 }}>
                    Điểm danh học sinh
                    <Typography variant="caption" display="block" color="text.secondary">
                        {dayjs(selectedLesson?.date).format('DD/MM/YYYY')} | {selectedLesson?.actualTime}
                    </Typography>
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        {attendance.length === 0 && (
                            <Typography sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
                                Lớp hiện chưa có học sinh nào.
                            </Typography>
                        )}
                        {attendance.map((a) => (
                            <Box key={a._id} sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                p: 1.5, 
                                bgcolor: a.status === 'present' ? '#f0f9f0' : a.status === 'absent' ? '#fff5f5' : '#f9f9f9', 
                                borderRadius: 3,
                                border: '1px solid #eee'
                            }}>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.light', color: 'primary.main', fontSize: '0.9rem', fontWeight: 700 }}>
                                        {a.student.fullName[0]}
                                    </Avatar>
                                    <Typography variant="body2" fontWeight={700}>{a.student.fullName}</Typography>
                                </Stack>
                                <Stack direction="row" spacing={0.5}>
                                    <Tooltip title="Có mặt">
                                        <IconButton 
                                            size="small" 
                                            color={a.status === 'present' ? 'success' : 'default'}
                                            onClick={() => handleMarkAttendance(a.student._id, 'present')}
                                        >
                                            <CheckCircle fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Vắng mặt">
                                        <IconButton 
                                            size="small" 
                                            color={a.status === 'absent' ? 'error' : 'default'}
                                            onClick={() => handleMarkAttendance(a.student._id, 'absent')}
                                        >
                                            <Cancel fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </Box>
                        ))}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenAttendance(false)} color="inherit">Đóng</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
